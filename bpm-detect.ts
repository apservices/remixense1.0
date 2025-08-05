import fs from 'fs/promises';
import path from 'path';
import { parseBuffer } from 'music-metadata';
import * as wavDecoder from 'wav-decoder';
import detect from 'music-beat-detector';

async function detectBpmFromWav() {
  // Caminho do arquivo WAV
  const filePath = path.resolve(__dirname, './public/audio.wav');

  // Lê o arquivo WAV em buffer
  const buffer = await fs.readFile(filePath);

  // Decodifica o WAV para extrair os dados PCM
  const audioData = await wavDecoder.decode(buffer);

  // Detecta o BPM a partir dos dados PCM
  const bpm = await detect(audioData);
  console.log(`BPM detectado: ${bpm}`);
}

detectBpmFromWav().catch(console.error);
