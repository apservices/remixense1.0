import React from 'react';
import { useTracks } from '@/hooks/useTracks';
import { TrackRow } from '@/components/TrackRow';
import { useAuth } from '@/hooks/useAuth';
import { AutoMixPlayer } from './AutoMixPlayer';
import { useSubscription } from '@/hooks/useSubscription';

export const TrackLibrary: React.FC = () => {
  const { tracks, setFilterMode } = useTracks();
  const { user } = useAuth();
  const { isPro, isExpert } = useSubscription();

  return (
    <div>
      <div className='controls flex gap-2 mb-4'>
        <button onClick={() => setFilterMode('single')}>Single</button>
        <button onClick={() => setFilterMode('dual')}>Dual</button>
      </div>
      {tracks.length > 0 ? (
        tracks.map(t => <TrackRow key={t.id} track={t} />)
      ) : (
        <div>Nenhuma faixa encontrada para o modo selecionado.</div>
      )}
      {(isPro || isExpert) && tracks.length > 0 && <AutoMixPlayer />}
    </div>
  );
};
