import fs from 'fs';
import path from 'path';
import decode from 'audio-decode';
import bpmDetect from 'bpm-detect';

export async function analyzeBpmFromWav(filePath: string): Promise<number> {
  const buffer = fs.readFileSync(path.resolve(filePath));
  const audioBuffer = await decode(buffer);
  const bpm = bpmDetect(audioBuffer);
  return bpm;
}
