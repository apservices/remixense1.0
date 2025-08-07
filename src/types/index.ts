export interface Track {
  id: string;
  name: string;          // display name
  title: string;         // original title if different
  artist: string;
  url?: string;
  duration: string;      // mm:ss
  bpm?: number | null;
  key_signature?: string | null;
  genre?: string | null;
  energy_level?: number | null; // 1-10
  type?: 'track' | 'remix' | 'sample';
  is_liked?: boolean;
  created_at?: string;   // ISO date
  status?: 'pending' | 'processing' | 'ready' | 'error';
  errorMsg?: string;
}

export interface TrackForMix {
  id: string;
  title: string;
  artist: string;
  bpm: number | null;
  key_signature: string | null;
  energy_level: number | null;
  duration: string;
}
