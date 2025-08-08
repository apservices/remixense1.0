import { useState, useEffect, useCallback } from "react";
import bpmDetective from "bpm-detective";
import Meyda from "meyda";
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
      const audioCtx = (window as any).audioCtx || new ((window as any).AudioContext || (window as any).webkitAudioContext)();
      (window as any).audioCtx = audioCtx;

      const audioBuffer: AudioBuffer = await new Promise((resolve, reject) => {
        audioCtx.decodeAudioData(arrayBuffer, resolve, reject);
      });

      const channelData = audioBuffer.getChannelData(0);
      const bpm = Math.round(bpmDetective(channelData));
      const seconds = Math.round(audioBuffer.duration);
      const duration = `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;

      // Meyda analysis (Key, Energy, basic Genre)
      const sampleRate = audioBuffer.sampleRate;
      const frameSize = 2048;
      const hopSize = 1024;
      const totalFrames = Math.max(0, Math.floor((channelData.length - frameSize) / hopSize));
      const maxFrames = 200;
      const step = Math.max(1, Math.floor(totalFrames / Math.max(1, maxFrames)));

      let count = 0;
      let rmsSum = 0;
      let centroidSum = 0;
      const chromaAcc = new Array(12).fill(0);

      for (let i = 0; i + frameSize < channelData.length; i += hopSize * step) {
        const frame = channelData.slice(i, i + frameSize);
        const feats: any = (Meyda as any).extract(["rms", "spectralCentroid", "chroma"], frame, {
          bufferSize: frameSize,
          sampleRate,
        });
        if (!feats) continue;
        if (typeof feats.rms === 'number') rmsSum += feats.rms;
        if (typeof feats.spectralCentroid === 'number') centroidSum += feats.spectralCentroid;
        if (Array.isArray(feats.chroma)) {
          for (let j = 0; j < 12; j++) chromaAcc[j] += feats.chroma[j] || 0;
        }
        count++;
      }

      const avgRms = count ? rmsSum / count : 0;
      const avgCentroid = count ? centroidSum / count : 0;
      const avgChroma = chromaAcc.map((v) => (count ? v / count : 0));

      const idx = avgChroma.indexOf(Math.max(...avgChroma));
      const pitchNames = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"] as const;
      const pitch = idx >= 0 ? pitchNames[idx] : null;
      const key_signature = pitch ? `${pitch}${avgCentroid < 2000 ? 'm' : ''}` : null;

      const energy_level = Math.min(10, Math.max(1, Math.round(avgRms * 20)));

      const genre = (() => {
        if (bpm && bpm >= 160) return "Drum & Bass";
        if (bpm && bpm >= 128) return "House";
        if (bpm && bpm <= 100) return "Hip-Hop";
        if (avgCentroid > 3500) return "EDM";
        return "Electronic";
      })();

      setTracks((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, bpm, duration, key_signature, energy_level, genre, status: "ready" }
            : t
        )
      );
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
