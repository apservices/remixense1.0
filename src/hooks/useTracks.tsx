import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Track } from "@/types";

type FilterMode = "single" | "dual";

interface UseTracksReturn {
  tracks: Track[];
  loading: boolean;
  refetch: () => Promise<void>;
  setFilterMode: (mode: FilterMode) => void;
  toggleLike: (id: string) => Promise<void>;
  addTrack: (file: File) => Promise<void>;
  filterMode: FilterMode;
}

export function useTracks(): UseTracksReturn {
  const { user } = useAuth();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterMode, setFilterMode] = useState<FilterMode>("single");

  const loadTracks = useCallback(async () => {
    if (!user) {
      setTracks([]);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("tracks")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setTracks((data as any) || []);
    } catch (e) {
      console.error("Failed to load tracks", e);
      setTracks([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadTracks();
  }, [loadTracks]);

  const refetch = useCallback(async () => {
    await loadTracks();
  }, [loadTracks]);

  const toggleLike = useCallback(async (id: string) => {
    try {
      const current = tracks.find((t) => t.id === id);
      const next = !current?.is_liked;
      setTracks((prev) => prev.map((t) => (t.id === id ? { ...t, is_liked: next } : t)));
      const { error } = await supabase
        .from("tracks")
        .update({ is_liked: next })
        .eq("id", id);
      if (error) throw error;
    } catch (e) {
      console.error("toggleLike failed", e);
    }
  }, [tracks]);

  const addTrack = async (file: File) => {
    if (!navigator.onLine) {
      throw new Error("Análise requer conexão ativa");
    }
    if (!user) {
      throw new Error("É necessário estar logado para enviar faixas");
    }

    // Upload to Supabase Storage (no caching)
    const path = `${user.id}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("tracks")
      .upload(path, file, { cacheControl: "0", upsert: false, contentType: file.type || undefined });
    if (uploadError) {
      console.error("Storage upload failed", uploadError);
      throw new Error("Falha no upload do arquivo");
    }

    // Insert initial track row with processing status
    const insertPayload = {
      user_id: user.id,
      title: file.name,
      artist: "Unknown",
      type: "track",
      duration: "00:00",
      file_path: path,
      original_filename: file.name,
      upload_status: "processing",
    } as const;

    const { data: inserted, error: insertError } = await supabase
      .from("tracks")
      .insert([insertPayload])
      .select()
      .single();

    if (insertError || !inserted) {
      console.error("Insert track failed", insertError);
      throw new Error("Não foi possível criar o registro da faixa");
    }

    setTracks((prev) => [{ ...(inserted as any), status: "processing" }, ...prev]);

    // Subscribe to realtime updates for this track to reflect status changes
    const channel = supabase
      .channel(`track_${inserted.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "tracks", filter: `id=eq.${inserted.id}` },
        (payload: any) => {
          const updated = payload.new;
          setTracks((prev) => prev.map((t) => (t.id === updated.id ? { ...(t as any), ...(updated as any) } : t)));
          // Auto-unsubscribe when completed or error
          if (updated.upload_status === "completed" || updated.upload_status === "error") {
            supabase.removeChannel(channel);
          }
        }
      )
      .subscribe();

    // Kick off server-side analysis
    try {
      const { error: fnError } = await supabase.functions.invoke("analyze-audio", {
        body: { trackId: inserted.id },
      });
      if (fnError) throw fnError;
    } catch (e) {
      console.error("Failed to invoke analyze-audio", e);
      // Mark as error; server may also set this later
      setTracks((prev) => prev.map((t) => (t.id === inserted.id ? { ...t, upload_status: "error" } : t)));
      throw new Error("Falha ao iniciar análise no servidor");
    }
  };

  return {
    tracks,
    loading,
    refetch,
    setFilterMode,
    toggleLike,
    addTrack,
    filterMode,
  };
}

