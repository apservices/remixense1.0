import React from 'react';
import { useTracks } from '../hooks/useTracks';
import { TrackRow } from './TrackRow';

export const TrackLibrary: React.FC = () => {
  const { tracks, setFilterMode } = useTracks();

  return (
    <div>
      <div className='controls'>
        <button onClick={() => setFilterMode('single')}>Single</button>
        <button onClick={() => setFilterMode('dual')}>Dual</button>
      </div>
      {tracks.length > 0 ? (
        tracks.map(t => <TrackRow key={t.id} track={t} />)
      ) : (
        <div>Nenhuma faixa encontrada para o modo selecionado.</div>
      )}
    </div>
  );
};
