// modules/metadata/track-metadata.ts

export interface TrackMetadata {
  title: string;
  artist: string;
  bpm: number;
  key: string;
  mood?: string;
  genre?: string;
  tags?: string[];
}