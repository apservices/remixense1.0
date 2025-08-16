import { describe, it, expect } from 'vitest';
import { getMixCompatibility } from '@/lib/audio/compat';
import type { TrackForMix } from '@/types';

describe('Mix Compatibility Engine', () => {
  const createTrack = (overrides: Partial<TrackForMix> = {}): TrackForMix => ({
    id: 'test-' + Math.random(),
    title: 'Test Track',
    artist: 'Test Artist',
    bpm: 128,
    key_signature: '1A',
    energy_level: 5,
    duration: '3:30',
    ...overrides
  });

  describe('BPM Compatibility', () => {
    it('should give perfect score for identical BPM', () => {
      const trackA = createTrack({ bpm: 128 });
      const trackB = createTrack({ bpm: 128 });
      
      const result = getMixCompatibility(trackA, trackB);
      
      expect(result.score).toBeGreaterThanOrEqual(95);
      expect(result.reasons.find(r => r.key === 'bpmDelta')?.value).toBe(0);
    });

    it('should penalize large BPM differences', () => {
      const trackA = createTrack({ bpm: 120 });
      const trackB = createTrack({ bpm: 140 });
      
      const result = getMixCompatibility(trackA, trackB);
      
      expect(result.score).toBeLessThan(80);
      expect(result.reasons.find(r => r.key === 'bpmDelta')?.value).toBe(20);
    });

    it('should handle missing BPM gracefully', () => {
      const trackA = createTrack({ bpm: null });
      const trackB = createTrack({ bpm: 128 });
      
      const result = getMixCompatibility(trackA, trackB);
      
      expect(result.score).toBeGreaterThan(0);
      expect(result.reasons).toBeDefined();
    });
  });

  describe('Camelot Key Compatibility', () => {
    it('should give perfect score for identical keys', () => {
      const trackA = createTrack({ key_signature: '1A' });
      const trackB = createTrack({ key_signature: '1A' });
      
      const result = getMixCompatibility(trackA, trackB);
      
      expect(result.score).toBeGreaterThanOrEqual(85);
    });

    it('should give high score for neighboring keys', () => {
      const trackA = createTrack({ key_signature: '1A' });
      const trackB = createTrack({ key_signature: '2A' });
      
      const result = getMixCompatibility(trackA, trackB);
      
      expect(result.score).toBeGreaterThanOrEqual(70);
    });

    it('should give high score for relative minor/major', () => {
      const trackA = createTrack({ key_signature: '1A' });
      const trackB = createTrack({ key_signature: '1B' });
      
      const result = getMixCompatibility(trackA, trackB);
      
      expect(result.score).toBeGreaterThanOrEqual(70);
    });

    it('should handle invalid key signatures', () => {
      const trackA = createTrack({ key_signature: 'Invalid' });
      const trackB = createTrack({ key_signature: '1A' });
      
      const result = getMixCompatibility(trackA, trackB);
      
      expect(result.score).toBeGreaterThan(0);
      expect(result.reasons.find(r => r.key === 'camelot')?.value).toMatch(/vs 1A/);
    });
  });

  describe('Energy Level Compatibility', () => {
    it('should prefer similar energy levels', () => {
      const trackA = createTrack({ energy_level: 7 });
      const trackB = createTrack({ energy_level: 7 });
      
      const result = getMixCompatibility(trackA, trackB);
      
      expect(result.reasons.find(r => r.key === 'energyDelta')?.value).toBe(0);
    });

    it('should penalize large energy differences', () => {
      const trackA = createTrack({ energy_level: 2 });
      const trackB = createTrack({ energy_level: 9 });
      
      const result = getMixCompatibility(trackA, trackB);
      
      expect(result.reasons.find(r => r.key === 'energyDelta')?.value).toBe(7);
    });

    it('should handle missing energy levels', () => {
      const trackA = createTrack({ energy_level: null });
      const trackB = createTrack({ energy_level: 5 });
      
      const result = getMixCompatibility(trackA, trackB);
      
      expect(result.score).toBeGreaterThan(0);
    });
  });

  describe('Overall Compatibility Score', () => {
    it('should return score between 0 and 100', () => {
      const trackA = createTrack();
      const trackB = createTrack();
      
      const result = getMixCompatibility(trackA, trackB);
      
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should include compatibility reasons', () => {
      const trackA = createTrack();
      const trackB = createTrack();
      
      const result = getMixCompatibility(trackA, trackB);
      
      expect(result.reasons).toHaveLength(3);
      expect(result.reasons.map(r => r.key)).toEqual(['bpmDelta', 'camelot', 'energyDelta']);
    });

    it('should prioritize perfect matches highly', () => {
      const trackA = createTrack({ 
        bpm: 128, 
        key_signature: '1A', 
        energy_level: 7 
      });
      const trackB = createTrack({ 
        bpm: 128, 
        key_signature: '1A', 
        energy_level: 7 
      });
      
      const result = getMixCompatibility(trackA, trackB);
      
      expect(result.score).toBeGreaterThanOrEqual(90);
    });

    it('should handle edge case combinations', () => {
      const trackA = createTrack({ 
        bpm: null, 
        key_signature: null, 
        energy_level: null 
      });
      const trackB = createTrack({ 
        bpm: 140, 
        key_signature: '12B', 
        energy_level: 10 
      });
      
      const result = getMixCompatibility(trackA, trackB);
      
      expect(result.score).toBeGreaterThan(0);
      expect(result.reasons).toBeDefined();
    });
  });
});