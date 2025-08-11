import { TrackForMix } from '@/types';

export interface CompatibilityReason {
  key: string;
  label: string;
  value: number | string;
}

export interface CompatibilityResult {
  score: number; // 0-100
  reasons: CompatibilityReason[];
}

const camelotNeighbors: Record<string, string[]> = {
  '1A': ['12A','2A','1B'], '1B': ['12B','2B','1A'],
  '2A': ['1A','3A','2B'],  '2B': ['1B','3B','2A'],
  '3A': ['2A','4A','3B'],  '3B': ['2B','4B','3A'],
  '4A': ['3A','5A','4B'],  '4B': ['3B','5B','4A'],
  '5A': ['4A','6A','5B'],  '5B': ['4B','6B','5A'],
  '6A': ['5A','7A','6B'],  '6B': ['5B','7B','6A'],
  '7A': ['6A','8A','7B'],  '7B': ['6B','8B','7A'],
  '8A': ['7A','9A','8B'],  '8B': ['7B','9B','8A'],
  '9A': ['8A','10A','9B'], '9B': ['8B','10B','9A'],
  '10A':['9A','11A','10B'],'10B':['9B','11B','10A'],
  '11A':['10A','12A','11B'],'11B':['10B','12B','11A'],
  '12A':['11A','1A','12B'],'12B':['11B','1B','12A']
};

export function getMixCompatibility(a: TrackForMix, b: TrackForMix): CompatibilityResult {
  // BPM delta
  const bpmA = a.bpm ?? 0; const bpmB = b.bpm ?? 0;
  const bpmDelta = Math.abs(bpmA - bpmB);
  const bpmScore = Math.max(0, 100 - bpmDelta * 3); // 0..100

  // Camelot distance heuristic
  const camelA = normalizeCamelot(a.key_signature);
  const camelB = normalizeCamelot(b.key_signature);
  let keyScore = 40;
  if (camelA && camelB) {
    if (camelA === camelB) keyScore = 100;
    else if (camelotNeighbors[camelA]?.includes(camelB)) keyScore = 85;
    else keyScore = 40;
  }

  // Energy delta
  const eA = a.energy_level ?? 5; const eB = b.energy_level ?? 5;
  const energyDelta = Math.abs(eA - eB);
  const energyScore = Math.max(0, 100 - energyDelta * 10);

  // Structure alignment (placeholder 70)
  const structureScore = 70;

  // Weighted sum
  const score = Math.round(
    bpmScore * 0.35 + keyScore * 0.35 + energyScore * 0.2 + structureScore * 0.1
  );

  const reasons: CompatibilityReason[] = [
    { key: 'bpmDelta', label: 'Δ BPM', value: bpmDelta },
    { key: 'camelot', label: 'Camelot', value: `${camelA ?? '-'} vs ${camelB ?? '-'}` },
    { key: 'energyDelta', label: 'Δ Energia', value: energyDelta },
  ];

  return { score, reasons };
}

function normalizeCamelot(k: string | null): string | null {
  if (!k) return null;
  const up = k.trim().toUpperCase();
  const m = up.match(/^(\d{1,2})([AB])$/);
  return m ? `${parseInt(m[1],10)}${m[2]}` : null;
}
