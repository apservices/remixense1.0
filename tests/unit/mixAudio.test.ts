(globalThis as any).AudioContext = class {
  createMediaStreamDestination = () => ({ stream: new Blob() });
  createGain = () => ({ gain: { value: 1 }, connect: () => ({ connect: () => {} }) });
  createBufferSource = () => ({ buffer: null, connect: () => ({ connect: () => {} }), start: () => {} });
  decodeAudioData = (a: any) => Promise.resolve({});
};
(globalThis as any).fetch = () => Promise.resolve({ arrayBuffer: () => Promise.resolve(new ArrayBuffer(1)) });
(globalThis as any).URL = { createObjectURL: () => 'blob:test-url' };
import { describe, it, expect } from 'vitest';
import { mixAudioTracks } from '../../src/utils/dualAudio';
describe('mixAudioTracks', () => {
  it('should return a blob URL string', async () => {
    const url = await mixAudioTracks('/audio/a.mp3', '/audio/b.mp3', 0.5, 0.8);
    expect(typeof url).toBe('string');
    expect(url.startsWith('blob:')).toBe(true);
  });
});
