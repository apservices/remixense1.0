
import { Track } from '@/types';

type CamelotInfo = { value: string; boost: number };
type CompatibilityReason = { key: 'bpmDelta' | 'camelot' | 'energyDelta'; value: number | string | null };

const CAMEL0T_KEYS = Array.from({ length: 12 }, (_, i) => i + 1);

const parseCamelot = (key?: string | null) => {
  if (!key) return null;
  const match = key.trim().match(/^(\d{1,2})([AB])$/i);
  if (!match) return null;
  const num = Number(match[1]);
  if (!CAMEL0T_KEYS.includes(num)) return null;
  return { num, mode: match[2].toUpperCase() as 'A' | 'B' };
};

const formatCamelotReason = (keyA?: string | null, keyB?: string | null): CamelotInfo => {
  const parsedA = parseCamelot(keyA);
  const parsedB = parseCamelot(keyB);
  const labelA = keyA ?? '—';
  const labelB = keyB ?? '—';

  if (!parsedA || !parsedB) {
    return { value: `${labelA} vs ${labelB}`, boost: 0 };
  }

  if (parsedA.num === parsedB.num && parsedA.mode === parsedB.mode) {
    return { value: `${labelA} vs ${labelB}`, boost: 25 };
  }

  const isNeighbor =
    parsedA.mode === parsedB.mode &&
    (parsedA.num === ((parsedB.num % 12) + 1) || parsedB.num === ((parsedA.num % 12) + 1));

  if (isNeighbor) {
    return { value: `${labelA} vs ${labelB}`, boost: 15 };
  }

  if (parsedA.num === parsedB.num && parsedA.mode !== parsedB.mode) {
    return { value: `${labelA} vs ${labelB}`, boost: 12 };
  }

  return { value: `${labelA} vs ${labelB}`, boost: -5 };
};

const clampScore = (score: number) => Math.min(100, Math.max(0, score));

// Audio compatibility utilities
export function convertTrackForMixing(track: Track) {
  return {
    id: track.id,
    title: track.title,
    artist: track.artist,
    bpm: track.bpm,
    key: track.key_signature,
    duration: track.duration,
    url: track.file_url || track.file_path,
    file_path: track.file_path
  };
}

export function normalizeTrackData(track: any): Track {
  return {
    ...track,
    type: (track.type || 'track') as 'track' | 'remix' | 'sample',
    name: track.title,
    url: track.file_url || track.file_path
  };
}

export function getMixCompatibility(track1: any, track2: any) {
  let score = 50;
  const reasons: CompatibilityReason[] = [];

  const hasBpm = typeof track1?.bpm === 'number' && typeof track2?.bpm === 'number';
  const bpmDelta = hasBpm ? Math.abs(track1.bpm - track2.bpm) : null;
  if (bpmDelta !== null) {
    if (bpmDelta === 0) score += 35;
    else if (bpmDelta <= 2) score += 25;
    else if (bpmDelta <= 5) score += 15;
    else if (bpmDelta <= 10) score += 5;
    else score -= Math.min(40, (bpmDelta - 10) * 3);
  }
  reasons.push({ key: 'bpmDelta', value: bpmDelta });

  const camelot = formatCamelotReason(track1?.key_signature, track2?.key_signature);
  score += camelot.boost;
  reasons.push({ key: 'camelot', value: camelot.value });

  const hasEnergy = typeof track1?.energy_level === 'number' && typeof track2?.energy_level === 'number';
  const energyDelta = hasEnergy ? Math.abs(track1.energy_level - track2.energy_level) : null;
  if (energyDelta !== null) {
    if (energyDelta === 0) score += 15;
    else if (energyDelta <= 1) score += 10;
    else if (energyDelta <= 2) score += 5;
    else score -= Math.min(10, energyDelta * 2);
  }
  reasons.push({ key: 'energyDelta', value: energyDelta });

  return {
    score: clampScore(score),
    reasons
  };
}
