
import { Track } from '@/types';

// Audio compatibility utilities
export function convertTrackForMixing(track: Track) {
  return {
    id: track.id,
    title: track.title,
    artist: track.artist,
    bpm: track.bpm,
    key: track.key_signature,
    duration: track.duration,
    url: track.file_url || track.file_path,
    file_path: track.file_path
  };
}

export function normalizeTrackData(track: any): Track {
  return {
    ...track,
    type: (track.type || 'track') as 'track' | 'remix' | 'sample',
    name: track.title,
    url: track.file_url || track.file_path
  };
}
