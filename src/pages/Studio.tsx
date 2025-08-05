import React from 'react';
import DualPlayer from '@/components/DualPlayer';
import { SmartMixSuggestions } from '@/components/SmartMixSuggestions';
import { TrackLibrary } from '@/components/TrackLibrary';
import {
  Headphones,
  PlayCircle,
  Music,
  LayoutList,
  Users
} from 'lucide-react';

export default function Studio() {
  return (
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-4'>Studio</h1>
      <SmartMixSuggestions />
      <TrackLibrary />
      <DualPlayer />
    </div>
  );
}
