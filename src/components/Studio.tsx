import React from 'react';
import { useStudio } from '../hooks/useStudio';
import { useTracks } from '../hooks/useTracks';
import { mixAudioUrls } from '../utils/dualAudio';
import { useAuth } from '../hooks/useAuth';

export const Studio: React.FC = () => {
  const { tracks } = useTracks();
  const { dualSelection, setDualSelection, dualTracks } = useStudio(tracks);
  const { isPremium } = useAuth();

  const handleSelect = (position: 0 | 1, id: string) => {
    const arr = [...dualSelection] as any;
    arr[position] = id;
    setDualSelection(arr);
  };

  return (
    <div>
      <h2>Studio - Mixagem Dual Audio</h2>
      {isPremium ? (
        <>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {tracks.map(t => (
              <div key={t.id}>
                <button onClick={() => handleSelect(0, t.id)}>
                  Selecionar Música 1: {t.title}
                </button>
                <button onClick={() => handleSelect(1, t.id)}>
                  Selecionar Música 2: {t.title}
                </button>
              </div>
            ))}
          </div>

          {dualTracks.length === 2 && (
            <div className='mt-4'>
              <h3>Preview Dual Audio</h3>
              {mixAudioUrls(dualTracks[0].url, dualTracks[1].url).map((src, idx) => (
                <audio key={idx} src={src} controls autoPlay />
              ))}
            </div>
          )}
        </>
      ) : (
        <div>Dual Audio é exclusivo para usuários premium.</div>
      )}
    </div>
  );
};
