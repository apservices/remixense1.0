import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { trackId } = await req.json();
    if (!trackId) {
      return new Response(JSON.stringify({ error: "trackId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: "Missing Supabase env" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

    // Load track record
    const { data: track, error: trackErr } = await supabase
      .from("tracks")
      .select("id, user_id, file_path, title, duration")
      .eq("id", trackId)
      .single();

    if (trackErr || !track) {
      console.error("Track load error", trackErr);
      return new Response(JSON.stringify({ error: "Track not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark processing (idempotent)
    await supabase.from("tracks").update({ upload_status: "processing" }).eq("id", track.id);

    // Download file from storage
    const path = track.file_path as string | null;
    if (!path) {
      await supabase.from("tracks").update({ upload_status: "error" }).eq("id", track.id);
      return new Response(JSON.stringify({ error: "Missing file_path on track" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const downloadRes = await supabase.storage.from("tracks").download(path);
    if ((downloadRes as any).error) {
      console.error("Storage download error", (downloadRes as any).error);
      await supabase.from("tracks").update({ upload_status: "error" }).eq("id", track.id);
      return new Response(JSON.stringify({ error: "Failed to download audio" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fileBlob: Blob = downloadRes as unknown as Blob;
    const arrayBuffer = await fileBlob.arrayBuffer();

    // Simple mock analysis (server-side placeholder). Replace with real DSP/WASM later.
    // We derive deterministic pseudo-randoms from size to make results stable per file.
    const size = arrayBuffer.byteLength;
    const seed = (size % 100000) / 100000;
    const rand = (x: number) => (Math.sin(x * 99991 + seed * 1e5) + 1) / 2;

    const durationSec = Math.max(30, Math.floor(60 + (rand(1) * 240))); // 30–300s
    const bpm = Math.round(80 + rand(2) * 100); // 80–180
    const energy = Math.min(10, Math.max(1, Math.round(1 + rand(3) * 9)));
    const valence = Math.round(rand(4) * 100) / 100; // 0–1
    const spectralCentroidAvg = Math.round(800 + rand(5) * 4200); // Hz
    const chroma = Array.from({ length: 12 }, (_, i) => Math.round(rand(6 + i) * 100) / 100);
    const transients = Array.from({ length: 10 }, (_, i) => Math.round(rand(20 + i) * durationSec));
    const structure = [
      { section: "intro", start: 0, end: Math.round(durationSec * 0.1) },
      { section: "verse", start: Math.round(durationSec * 0.1), end: Math.round(durationSec * 0.4) },
      { section: "drop", start: Math.round(durationSec * 0.4), end: Math.round(durationSec * 0.6) },
      { section: "break", start: Math.round(durationSec * 0.6), end: Math.round(durationSec * 0.8) },
      { section: "outro", start: Math.round(durationSec * 0.8), end: durationSec },
    ];
    const timeSignature = rand(7) > 0.1 ? "4/4" : "3/4";
    const rhythmDensity = Math.round(1 + rand(8) * 9); // 1–10

    // Beatgrid and waveform placeholders
    const beats = Math.max(1, Math.floor((durationSec / 60) * bpm));
    const beatgrid = Array.from({ length: beats }, (_, i) => Math.round((i * 60) / bpm * 1000)); // ms
    const waveform = Array.from({ length: 200 }, (_, i) => Math.round(rand(100 + i) * 100) / 100);

    // Choose a key/mode
    const KEYS = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
    const keyIndex = Math.floor(rand(9) * 12) % 12;
    const mode = rand(10) > 0.5 ? "minor" : "major";
    const key = `${KEYS[keyIndex]} ${mode}`;

    // Update tracks table with core fields
    const mm = Math.floor(durationSec / 60);
    const ss = (durationSec % 60).toString().padStart(2, "0");
    const durationStr = `${mm}:${ss}`;

    await supabase
      .from("tracks")
      .update({
        bpm,
        key_signature: key,
        energy_level: energy,
        duration: durationStr,
        upload_status: "completed",
      })
      .eq("id", track.id);

    // Upsert track_features row
    const features = {
      durationSec,
      bpm,
      key,
      mode,
      timeSignature,
      rhythmDensity,
      energy,
      valence,
      spectralCentroidAvg,
      chroma,
      transients,
      structure,
      beatgrid,
      waveform,
      source: "server-mock-v1",
    };

    await supabase.from("track_features").upsert({
      track_id: String(track.id),
      user_id: track.user_id,
      bpm,
      key_signature: key,
      energy_level: energy,
      camelot: null,
      mode,
      analysis: features,
    }, { onConflict: "track_id" });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("analyze-audio error", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
