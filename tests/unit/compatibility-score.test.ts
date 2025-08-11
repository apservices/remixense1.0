import { describe, it, expect } from 'vitest';
import { getMixCompatibility } from '../../src/lib/audio/compat';

describe('getMixCompatibility', () => {
  it('scores higher for close BPM and matching Camelot', () => {
    const a = { id: 'a', title: 'A', artist: 'X', bpm: 128, key_signature: '8A', energy_level: 6, duration: '03:00' } as any;
    const b = { id: 'b', title: 'B', artist: 'Y', bpm: 130, key_signature: '8A', energy_level: 6, duration: '02:30' } as any;
    const { score } = getMixCompatibility(a, b);
    expect(score).toBeGreaterThan(85);
  });

  it('scores lower for far BPM and distant keys', () => {
    const a = { id: 'a', title: 'A', artist: 'X', bpm: 90, key_signature: '1A', energy_level: 3, duration: '03:00' } as any;
    const b = { id: 'b', title: 'B', artist: 'Y', bpm: 140, key_signature: '8B', energy_level: 9, duration: '02:30' } as any;
    const { score } = getMixCompatibility(a, b);
    expect(score).toBeLessThan(60);
  });
});
