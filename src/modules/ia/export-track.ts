import fs from "fs";

export function exportTrackAnalysis(filePath: string, bpm: number, key: string) {
  const result = { file: filePath, bpm, key };
  const output = `exports/${Date.now()}_analysis.json`;
  fs.writeFileSync(output, JSON.stringify(result, null, 2));
  return output;
}
