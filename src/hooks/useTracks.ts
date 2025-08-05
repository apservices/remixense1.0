// Interface Track com id/title/url
export interface Track { id: string; title: string; url: string; }

import { useState, useEffect } from 'react';
export function useTracks() {
  const [tracks, setTracks] = useState<Track[]>([]);
  useEffect(() => {
    setTracks([
      { id: '1', title: 'Track A', url: '/audio/trackA.mp3' },
      { id: '2', title: 'Track B', url: '/audio/trackB.mp3' },
    ]);
  }, []);
  return { tracks };
}
