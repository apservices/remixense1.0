import path from "path";
import { fileURLToPath } from "url";
import { analyzeBpmFromWav } from "./bpm-detect-real";
import { extractKeyFromWav } from "./key-detect-real";

export async function analyzeTrack(filePath: string) {
  if (!filePath) {
    throw new Error("File path is required");
  }

  const bpm = await analyzeBpmFromWav(filePath);
  const key = await extractKeyFromWav(filePath);
  return { bpm, key };
}

async function runCli() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("Usage: node analyze-cli.ts <file.wav>");
    process.exit(1);
  }

  const { bpm, key } = await analyzeTrack(filePath);
  console.log("BPM:", bpm);
  console.log("Key:", key);
}

const isDirectExecution = (() => {
  if (!process.argv[1]) return false;
  const thisFilePath = fileURLToPath(import.meta.url);
  return path.resolve(process.argv[1]) === path.resolve(thisFilePath);
})();

if (isDirectExecution) {
  runCli();
}
