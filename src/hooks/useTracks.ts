// ... Importe ou defina Track interface
export interface Track { id: string; title: string; url: string; /* outras props */ }

// Mock ou fetch das faixas
import { useState, useEffect } from 'react';
export function useTracks() {
  const [tracks, setTracks] = useState<Track[]>([]);
  useEffect(() => {
    // substitua com fetch real se precisar
    setTracks([
      { id: '1', title: 'Track A', url: '/audio/trackA.mp3' },
      { id: '2', title: 'Track B', url: '/audio/trackB.mp3' },
    ]);
  }, []);
  return { tracks };
}
