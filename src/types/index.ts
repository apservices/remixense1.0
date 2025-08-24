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
  upload_status?: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  errorMsg?: string;
  user_id: string;
  file_url?: string;
  file_path?: string;
  play_count?: number;
  updated_at?: string;
  original_filename?: string;
  file_size?: number;
  waveform_data?: any;
  is_featured?: boolean;
  deleted_at?: string;
  tags?: string[];
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
