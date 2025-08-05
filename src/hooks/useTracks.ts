import { useState, useEffect } from "react";
import bpmDetective from "bpm-detective";

export function useTracks() {
  const [tracks, setTracks] = useState<Track[]>(() => {
    try {
      const stored = localStorage.getItem("remixense_tracks");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("remixense_tracks", JSON.stringify(tracks));
  }, [tracks]);

  const addTrack = (file: File) => {
    const id = file.name + "-" + Date.now();
    setTracks((prev) => [
      ...prev,
      { id, title: file.name, artist: "Unknown", status: "pending" },
    ]);
    analyzeTrackAsync(file, id);
  };

  const analyzeTrackAsync = async (file: File, id: string) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "processing" } : t))
    );
    try {
      const arrayBuffer = await file.arrayBuffer();
      window.audioCtx =
        window.audioCtx ||
        new (window.AudioContext || window.webkitAudioContext)();
      window.audioCtx.decodeAudioData(arrayBuffer, (audioBuffer) => {
        const channelData = audioBuffer.getChannelData(0);
        const bpm = Math.round(bpmDetective(channelData));
        const seconds = Math.round(audioBuffer.duration);
        const duration = `${Math.floor(seconds / 60)}:${(seconds % 60)
          .toString()
          .padStart(2, "0")}`;
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
    addTrack,
  };
}
