import React, { useState, useEffect } from 'react';
import { useStudio } from '../hooks/useStudio';
import { useTracks } from '../hooks/useTracks';
import { mixAudioTracks } from '../utils/dualAudio';
import { useAuth } from '../hooks/useAuth';

export const Studio: React.FC = () => {
  const { tracks } = useTracks();
  const { dualSelection, setDualSelection, dualTracks } = useStudio(tracks);
  const { isPremium } = useAuth();
  const [vol1, setVol1] = useState(1), [vol2, setVol2] = useState(1);
  const [mixedUrl, setMixedUrl] = useState<string>();

  useEffect(() => {
    const saved = localStorage.getItem('dualSelection');
    if (saved) setDualSelection(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('dualSelection', JSON.stringify(dualSelection));
    if (dualTracks.length === 2) {
      mixAudioTracks(dualTracks[0].url, dualTracks[1].url, vol1, vol2)
        .then(setMixedUrl);
    }
  }, [dualSelection, callback:vol1, vol2, dualTracks]);

  if (!isPremium) {
    return <div>Dual Audio é para usuários premium. <button>Upgrade agora</button></div>;
  }

  return (
    <div>
      <h2>Studio – Dual Audio Mix</h2>
      <div className='grid sm:grid-cols-2 gap-4 mb-4'>
        {tracks.map(t => (
          <div key={t.id} className={dualSelection.includes(t.id)? 'bg-blue-100' : ''}>
            <button onClick={() => setDualSelection([t.id, dualSelection[1]])}>1: {t.title}</button>
            <button onClick={() => setDualSelection([dualSelection[0], t.id])}>2: {t.title}</button>
          </div>
        ))}
      </div>
      {dualTracks.length === 2 && (
        <div>
          <label>Volume 1: <input type='range' min={0} max={1} step={0.01} value={vol1} onChange={e => setVol1(parseFloat(e.target.value))} /></label>
          <label>Volume 2: <input type='range' min={0} max={1} step={0.01} value={vol2} onChange={e => setVol2(parseFloat(e.target.value))} /></label>
        </div>
      )}
      {mixedUrl && <audio src={mixedUrl} controls autoPlay />}
    </div>
  );
};
