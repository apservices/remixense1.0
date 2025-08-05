import React from 'react';
import { Track } from '@/types';

export const TrackRow: React.FC<{ track: Track }> = ({ track }) => (
  <div className='border p-2 rounded mb-1'>
    ?? {track.name}
  </div>
);
