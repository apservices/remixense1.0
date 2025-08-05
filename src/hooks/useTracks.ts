import { useState, useEffect } from 'react';
import { Track } from '../types';

export function useTracks() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [filterMode, setFilterMode] = useState<'single' | 'dual'>('single');

  useEffect(() => {
    // carregar tracks se necessário
  }, []);

  const filtered = tracks.filter(track =>
    filterMode === 'dual' ? track.isDual === true : track.isDual !== true
  );

  return { tracks: filtered, setFilterMode };
}
