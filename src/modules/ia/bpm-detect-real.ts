import fs from 'fs';
import path from 'path';
import { parseBuffer } from 'music-metadata';
import detect from 'music-beat-detector'; // import default
import wav from 'wav-decoder';

const detectBPM = async (filePath: string): Promise<number | null> => {
  const buffer = fs.readFileSync(filePath);

  // Detect BPM com music-beat-detector (usando buffer WAV decodificado)
  try {
    const audioData = await wav.decode(buffer);
    const bpm = await detect(audioData);
    return bpm;
  } catch (err) {
    console.error('Erro ao detectar BPM:', err);
    return null;
  }
};

// Exemplo de uso
(async () => {
  const audioPath = path.join(__dirname, 'audios', 'demo.wav'); // altere conforme seu caminho
  const bpm = await detectBPM(audioPath);
  console.log(`BPM detectado: ${bpm}`);
})();
