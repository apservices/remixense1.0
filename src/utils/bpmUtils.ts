import fs from 'fs';
import path from 'path';
import wavDecoder from 'wav-decoder';
import { analyzeFullBuffer } from 'realtime-bpm-analyzer';

export async function analyzeBpmFromWav(filePath: string): Promise<number> {
  const buffer = fs.readFileSync(path.resolve(filePath));
  const decoded = await wavDecoder.decode(buffer);
  const results = await analyzeFullBuffer(decoded);
  return results[0].bpm;
}
