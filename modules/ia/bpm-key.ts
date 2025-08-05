// src/modules/ia/bpm-key.ts
import MusicTempo from 'music-tempo';

export async function analyzeBpmAndKey(audioBuffer: AudioBuffer): Promise<{ bpm: number; key: string }> {
  const channelData = audioBuffer.getChannelData(0); // pega o canal esquerdo

  // Extração de BPM real
  const audioData = Array.from(channelData).map(n => [n]);
  const tempoAnalyzer = new MusicTempo(audioData);

  const bpm = tempoAnalyzer.tempo;
  const key = 'C#m'; // Simulação: substitua por análise real de chave se necessário

  return { bpm, key };
}
