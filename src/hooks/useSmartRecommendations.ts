import { useMemo } from 'react';

interface Track {
  id: string;
  title: string;
  artist: string;
  bpm?: number;
  key_signature?: string;
  energy_level?: number;
}

// Camelot wheel for harmonic mixing
const CAMELOT_WHEEL: Record<string, string[]> = {
  'C': ['C', 'G', 'F', 'Am'],
  'G': ['G', 'D', 'C', 'Em'],
  'D': ['D', 'A', 'G', 'Bm'],
  'A': ['A', 'E', 'D', 'F#m'],
  'E': ['E', 'B', 'A', 'C#m'],
  'B': ['B', 'F#', 'E', 'G#m'],
  'F#': ['F#', 'C#', 'B', 'D#m'],
  'C#': ['C#', 'G#', 'F#', 'A#m'],
  'F': ['F', 'C', 'Bb', 'Dm'],
  'Bb': ['Bb', 'F', 'Eb', 'Gm'],
  'Eb': ['Eb', 'Bb', 'Ab', 'Cm'],
  'Ab': ['Ab', 'Eb', 'Db', 'Fm'],
  'Db': ['Db', 'Ab', 'Gb', 'Bbm'],
  'Gb': ['Gb', 'Db', 'Cb', 'Ebm'],
  'Am': ['Am', 'Em', 'Dm', 'C'],
  'Em': ['Em', 'Bm', 'Am', 'G'],
  'Bm': ['Bm', 'F#m', 'Em', 'D'],
  'F#m': ['F#m', 'C#m', 'Bm', 'A'],
  'C#m': ['C#m', 'G#m', 'F#m', 'E'],
  'G#m': ['G#m', 'D#m', 'C#m', 'B'],
  'D#m': ['D#m', 'A#m', 'G#m', 'F#'],
  'A#m': ['A#m', 'Fm', 'D#m', 'C#'],
  'Dm': ['Dm', 'Am', 'Gm', 'F'],
  'Gm': ['Gm', 'Dm', 'Cm', 'Bb'],
  'Cm': ['Cm', 'Gm', 'Fm', 'Eb'],
  'Fm': ['Fm', 'Cm', 'Bbm', 'Ab'],
  'Bbm': ['Bbm', 'Fm', 'Ebm', 'Db'],
  'Ebm': ['Ebm', 'Bbm', 'Abm', 'Gb'],
};

export function useSmartRecommendations(currentTrack: Track | null, allTracks: Track[]) {
  const compatibleTracks = useMemo(() => {
    if (!currentTrack?.bpm || !currentTrack?.key_signature) return [];

    const compatibleKeys = CAMELOT_WHEEL[currentTrack.key_signature] || [];
    const targetBpm = currentTrack.bpm;

    return allTracks
      .filter(track => {
        // Exclude current track
        if (track.id === currentTrack.id) return false;
        
        // Must have analysis
        if (!track.bpm || !track.key_signature) return false;

        // BPM within ±6 range or half/double time
        const bpmDiff = Math.abs(track.bpm - targetBpm);
        const halfTimeDiff = Math.abs(track.bpm - targetBpm / 2);
        const doubleTimeDiff = Math.abs(track.bpm - targetBpm * 2);
        const bpmCompatible = bpmDiff <= 6 || halfTimeDiff <= 3 || doubleTimeDiff <= 3;

        // Key compatibility
        const keyCompatible = compatibleKeys.includes(track.key_signature);

        return bpmCompatible && keyCompatible;
      })
      .map(track => {
        // Calculate compatibility score
        const bpmScore = 100 - Math.abs(track.bpm! - targetBpm) * 5;
        const keyScore = compatibleKeys.indexOf(track.key_signature!) === 0 ? 100 : 80;
        const energyScore = currentTrack.energy_level && track.energy_level 
          ? 100 - Math.abs(currentTrack.energy_level - track.energy_level) * 2
          : 50;

        const totalScore = (bpmScore + keyScore + energyScore) / 3;

        return {
          ...track,
          compatibilityScore: Math.round(totalScore)
        };
      })
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
      .slice(0, 10);
  }, [currentTrack, allTracks]);

  const recommendations = useMemo(() => {
    if (!currentTrack) return [];

    const hasHighEnergy = (currentTrack.energy_level || 50) > 70;
    const hasLowEnergy = (currentTrack.energy_level || 50) < 40;

    return [
      {
        id: 'compatible-mix',
        type: 'mix',
        title: 'Mix Perfeito',
        description: compatibleTracks.length > 0 
          ? `${compatibleTracks.length} faixas compatíveis`
          : 'Adicione mais músicas para sugestões',
        available: compatibleTracks.length > 0,
        priority: 1
      },
      {
        id: 'generate-melody',
        type: 'create',
        title: 'Criar Melodia',
        description: currentTrack.key_signature 
          ? `Gerar em ${currentTrack.key_signature} • ${currentTrack.bpm} BPM`
          : 'Analise a faixa primeiro',
        available: !!currentTrack.key_signature && !!currentTrack.bpm,
        priority: 2
      },
      {
        id: 'separate-stems',
        type: 'stems',
        title: 'Separar Stems',
        description: hasHighEnergy 
          ? 'Faixa energética - ideal para remix!'
          : 'Isolar vocais, bateria, baixo...',
        available: true,
        priority: hasHighEnergy ? 1 : 3
      },
      {
        id: 'chill-remix',
        type: 'remix',
        title: 'Remix Chill',
        description: 'Transformar em versão mais calma',
        available: hasHighEnergy,
        priority: 4
      },
      {
        id: 'energy-boost',
        type: 'remix',
        title: 'Boost de Energia',
        description: 'Aumentar a energia da faixa',
        available: hasLowEnergy,
        priority: 4
      }
    ].filter(r => r.available).sort((a, b) => a.priority - b.priority);
  }, [currentTrack, compatibleTracks]);

  return {
    compatibleTracks,
    recommendations
  };
}
