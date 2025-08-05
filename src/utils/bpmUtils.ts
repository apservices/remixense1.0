import fs from "fs";
import path from "path";
import wavDecoder from "wav-decoder";
import beatDetector from "web-audio-beat-detector";

export async function analyzeBpmFromWav(filePath: string): Promise<number> {
  const buffer = fs.readFileSync(path.resolve(filePath));
  const decoded = await wavDecoder.decode(buffer);
  const bpm = await beatDetector(decoded);
  return bpm;
}
