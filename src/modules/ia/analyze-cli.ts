import { analyzeBpmFromWav } from "./bpm-detect-real";
import { extractKeyFromWav } from "./key-detect-real";

const file = process.argv[2];
if (!file) {
  console.error("Usage: tsx analyze-cli.ts <path-to-wav>");
  process.exit(1);
}

async function run() {
  const bpm = await analyzeBpmFromWav(file);
  const key = extractKeyFromWav(file);
  console.log("🎧 BPM:", bpm, "| Key:", key);
}
run();
