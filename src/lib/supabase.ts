import { createClient } from '@supabase/supabase-js';

const url  = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url)  throw new Error('Missing env: VITE_SUPABASE_URL');
if (!anon) throw new Error('Missing env: VITE_SUPABASE_ANON_KEY');

export const supabase = createClient(url, anon, {
  auth: { persistSession: true, autoRefreshToken: true },
});

// == add: fetchTrackFeatures (used by MixPointSuggest.tsx)
export async function fetchTrackFeatures(trackId: string) {
  try {
    // importa o client de forma dinâmica para evitar problemas de ordem de imports
    const { supabase } = await import("@/integrations/supabase/client");

    // 1) fonte primária: track_features
    const { data, error } = await supabase
      .from("track_features")
      .select("tempo, musical_key, camelot, energy, danceability, loudness, analysis_json")
      .eq("track_id", trackId)
      .maybeSingle();

    // PGRST116 = no rows
    if (error && (error as any).code !== "PGRST116") throw error;

    if (data) {
      return {
        tempo: data.tempo != null ? Number(data.tempo) : null,
        musical_key: data.musical_key ?? null,
        camelot: data.camelot ?? null,
        energy: data.energy != null ? Number(data.energy) : null,
        danceability: data.danceability != null ? Number(data.danceability) : null,
        loudness: data.loudness != null ? Number(data.loudness) : null,
        analysis: (data as any).analysis_json ?? null,
      };
    }

    // 2) fallback: v_user_library (usa bpm como proxy de tempo)
    const { data: v, error: vErr } = await supabase
      .from("v_user_library")
      .select("bpm, musical_key, energy, danceability, loudness")
      .eq("id", trackId)
      .maybeSingle();

    if (vErr && (vErr as any).code !== "PGRST116") throw vErr;

    if (v) {
      return {
        tempo: v.bpm != null ? Number(v.bpm) : null,
        musical_key: v.musical_key ?? null,
        camelot: null,
        energy: v.energy != null ? Number(v.energy) : null,
        danceability: v.danceability != null ? Number(v.danceability) : null,
        loudness: v.loudness != null ? Number(v.loudness) : null,
        analysis: null,
      };
    }

    return null;
  } catch (e) {
    console.error("fetchTrackFeatures failed", e);
    return null;
  }
}
