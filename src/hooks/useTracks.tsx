import { useState, useEffect, useCallback } from "react";
import bpmDetective from "bpm-detective";
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
  const [tracks, setTracks] = useState<Track[]>(() => {
    try {
      const stored = localStorage.getItem("remixense_tracks");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [] as Track[];
    }
  });
  const [loading, setLoading] = useState(false);
  const [filterMode, setFilterMode] = useState<FilterMode>("single");

  useEffect(() => {
    localStorage.setItem("remixense_tracks", JSON.stringify(tracks));
  }, [tracks]);

  const refetch = useCallback(async () => {
    return Promise.resolve();
  }, []);

  const toggleLike = useCallback(async (id: string) => {
    setTracks((prev) => prev.map(t => t.id === id ? { ...t, is_liked: !t.is_liked } : t));
    return Promise.resolve();
  }, []);

  const addTrack = async (file: File) => {
    const id = file.name + "-" + Date.now();
    const base: Track = {
      id,
      name: file.name,
      title: file.name,
      artist: "Unknown",
      duration: "00:00",
      bpm: null,
      key_signature: null,
      genre: null,
      energy_level: null,
      type: "track",
      is_liked: false,
      created_at: new Date().toISOString(),
      status: "pending",
    };

    setTracks((prev) => [...prev, base]);
    analyzeTrackAsync(file, id);
    return Promise.resolve();
  };

  const analyzeTrackAsync = async (file: File, id: string) => {
    setTracks((prev) => prev.map((t) => (t.id === id ? { ...t, status: "processing" } : t)));
    try {
      const arrayBuffer = await file.arrayBuffer();
      window.audioCtx = window.audioCtx || new (window.AudioContext || (window as any).webkitAudioContext)();
      window.audioCtx.decodeAudioData(arrayBuffer, (audioBuffer) => {
        const channelData = audioBuffer.getChannelData(0);
        const bpm = Math.round(bpmDetective(channelData));
        const seconds = Math.round(audioBuffer.duration);
        const duration = `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;
        setTracks((prev) =>
          prev.map((t) =>
            t.id === id ? { ...t, bpm, duration, status: "ready" } : t
          )
        );
      });
    } catch (e) {
      setTracks((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, status: "error", errorMsg: String(e) } : t
        )
      );
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
