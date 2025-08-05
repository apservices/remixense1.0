import { describe, it, expect } from 'vitest';
import { mixAudioTracks } from '../../src/utils/dualAudio';
describe('mixAudioTracks', () => {
  it('should return a blob URL string', async () => {
    const url = await mixAudioTracks('/audio/a.mp3', '/audio/b.mp3', 0.5, 0.8);
    expect(typeof url).toBe('string');
    expect(url.startsWith('blob:')).toBe(true);
  });
});
