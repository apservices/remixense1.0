export interface EnergyResult {
  level: number; // 1-10
  rms: number;
  peak: number;
  dynamic_range: number;
  spectral_centroid: number;
}

export async function analyzeEnergy(audioBuffer: AudioBuffer): Promise<EnergyResult> {
  const channelData = audioBuffer.getChannelData(0);
  const blockSize = 2048;
  const numBlocks = Math.floor(channelData.length / blockSize);
  
  let totalRMS = 0;
  let maxPeak = 0;
  let minRMS = Infinity;
  let maxRMS = 0;
  
  // Calculate RMS per block
  for (let i = 0; i < numBlocks; i++) {
    let sumSquares = 0;
    let blockPeak = 0;
    
    for (let j = 0; j < blockSize; j++) {
      const sample = channelData[i * blockSize + j];
      sumSquares += sample * sample;
      blockPeak = Math.max(blockPeak, Math.abs(sample));
    }
    
    const blockRMS = Math.sqrt(sumSquares / blockSize);
    totalRMS += blockRMS;
    maxPeak = Math.max(maxPeak, blockPeak);
    minRMS = Math.min(minRMS, blockRMS);
    maxRMS = Math.max(maxRMS, blockRMS);
  }
  
  const avgRMS = totalRMS / numBlocks;
  const dynamicRange = 20 * Math.log10(maxRMS / Math.max(minRMS, 0.0001));
  
  // Calculate spectral centroid (simplified)
  const fftSize = 2048;
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = fftSize;
  
  const frequencyData = new Uint8Array(analyser.frequencyBinCount);
  let weightedSum = 0;
  let totalMagnitude = 0;
  
  // Simple spectral centroid estimation
  for (let i = 0; i < frequencyData.length; i++) {
    const frequency = (i * audioContext.sampleRate) / fftSize;
    weightedSum += frequency * (frequencyData[i] / 255);
    totalMagnitude += frequencyData[i] / 255;
  }
  
  const spectralCentroid = totalMagnitude > 0 ? weightedSum / totalMagnitude : 0;
  
  // Convert RMS to energy level (1-10)
  const rmsDb = 20 * Math.log10(avgRMS + 0.0001);
  const normalizedEnergy = Math.max(0, Math.min(1, (rmsDb + 60) / 60)); // -60dB to 0dB range
  const energyLevel = Math.round(normalizedEnergy * 9) + 1; // 1-10 scale
  
  audioContext.close();
  
  return {
    level: energyLevel,
    rms: avgRMS,
    peak: maxPeak,
    dynamic_range: dynamicRange,
    spectral_centroid: spectralCentroid
  };
}
