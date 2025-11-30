import { supabase } from '@/integrations/supabase/client';

export interface TrackForMix {
  id: string;
  title: string;
  artist: string;
  bpm?: number;
  key?: string;
  energy?: number;
  duration?: number;
  fileUrl?: string;
}

export interface MixTransition {
  fromTrack: TrackForMix;
  toTrack: TrackForMix;
  transitionType: 'fade' | 'cut' | 'filter' | 'echo';
  crossfadeDuration: number;
  bpmShift: number;
  keyShift?: string;
  cueIn: number;
  cueOut: number;
  compatibilityScore: number;
}

export interface AutoDJResult {
  setId: string;
  tracks: TrackForMix[];
  transitions: MixTransition[];
  totalDuration: number;
  averageBPM: number;
  energyFlow: number[];
  compatibilityScore: number;
}

/**
 * Calculates compatibility between two tracks
 */
export function calculateCompatibility(track1: TrackForMix, track2: TrackForMix): number {
  let score = 100;

  // BPM compatibility (most important)
  if (track1.bpm && track2.bpm) {
    const bpmDiff = Math.abs(track1.bpm - track2.bpm);
    if (bpmDiff <= 5) score -= 0;
    else if (bpmDiff <= 10) score -= 15;
    else if (bpmDiff <= 15) score -= 30;
    else score -= 50;
  }

  // Key compatibility
  if (track1.key && track2.key) {
    const compatible = areKeysCompatible(track1.key, track2.key);
    if (!compatible) score -= 20;
  }

  // Energy compatibility
  if (track1.energy !== undefined && track2.energy !== undefined) {
    const energyDiff = Math.abs(track1.energy - track2.energy);
    score -= energyDiff * 15;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Checks if two keys are harmonically compatible (Camelot wheel)
 */
function areKeysCompatible(key1: string, key2: string): boolean {
  // Simplified key compatibility - in production use full Camelot wheel
  const camelotWheel: Record<string, string[]> = {
    'C': ['C', 'F', 'G', 'Am', 'Dm'],
    'C#': ['C#', 'F#', 'G#', 'A#m', 'D#m'],
    'D': ['D', 'G', 'A', 'Bm', 'Em'],
    'D#': ['D#', 'G#', 'A#', 'Cm', 'Fm'],
    'E': ['E', 'A', 'B', 'C#m', 'F#m'],
    'F': ['F', 'A#', 'C', 'Dm', 'Gm'],
    'F#': ['F#', 'B', 'C#', 'D#m', 'G#m'],
    'G': ['G', 'C', 'D', 'Em', 'Am'],
    'G#': ['G#', 'C#', 'D#', 'Fm', 'A#m'],
    'A': ['A', 'D', 'E', 'F#m', 'Bm'],
    'A#': ['A#', 'D#', 'F', 'Gm', 'Cm'],
    'B': ['B', 'E', 'F#', 'G#m', 'C#m'],
  };

  const compatibleKeys = camelotWheel[key1] || [];
  return compatibleKeys.includes(key2);
}

/**
 * Determines best transition type based on track characteristics
 */
function determineTransitionType(track1: TrackForMix, track2: TrackForMix): 'fade' | 'cut' | 'filter' | 'echo' {
  if (!track1.bpm || !track2.bpm) return 'fade';

  const bpmDiff = Math.abs(track1.bpm - track2.bpm);
  
  if (bpmDiff <= 3) return 'fade';
  if (bpmDiff <= 8) return 'filter';
  if (bpmDiff <= 15) return 'echo';
  return 'cut';
}

/**
 * Suggests next compatible track
 */
export async function suggestNextTrack(
  currentTrack: TrackForMix,
  availableTracks: TrackForMix[]
): Promise<TrackForMix | null> {
  const candidates = availableTracks
    .filter(t => t.id !== currentTrack.id)
    .map(track => ({
      track,
      score: calculateCompatibility(currentTrack, track)
    }))
    .filter(c => c.score >= 60)
    .sort((a, b) => b.score - a.score);

  return candidates.length > 0 ? candidates[0].track : null;
}

/**
 * Generates automatic DJ set
 */
export async function generateAutoMix(
  trackIds: string[],
  setName: string = 'Auto DJ Set'
): Promise<AutoDJResult> {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  
  if (!userId) throw new Error('User not authenticated');

  // Fetch tracks with analysis
  const { data: tracks, error: tracksError } = await supabase
    .from('tracks')
    .select(`
      id,
      title,
      artist,
      duration,
      file_url,
      audio_analysis (
        bpm,
        key_signature,
        energy_level
      )
    `)
    .in('id', trackIds);

  if (tracksError) throw tracksError;
  if (!tracks || tracks.length === 0) throw new Error('No tracks found');

  // Map to TrackForMix format
  const mixTracks: TrackForMix[] = tracks.map(t => ({
    id: t.id,
    title: t.title,
    artist: t.artist || 'Unknown',
    duration: parseInt(t.duration || '0'),
    fileUrl: t.file_url || undefined,
    bpm: (t.audio_analysis as any)?.[0]?.bpm,
    key: (t.audio_analysis as any)?.[0]?.key_signature,
    energy: (t.audio_analysis as any)?.[0]?.energy_level
  }));

  // Sort by BPM for better mixing
  mixTracks.sort((a, b) => (a.bpm || 120) - (b.bpm || 120));

  // Calculate transitions
  const transitions: MixTransition[] = [];
  for (let i = 0; i < mixTracks.length - 1; i++) {
    const from = mixTracks[i];
    const to = mixTracks[i + 1];
    
    const compatibilityScore = calculateCompatibility(from, to);
    const transitionType = determineTransitionType(from, to);
    const bpmShift = (to.bpm || 0) - (from.bpm || 0);

    transitions.push({
      fromTrack: from,
      toTrack: to,
      transitionType,
      crossfadeDuration: transitionType === 'cut' ? 2 : 8,
      bpmShift,
      cueIn: 0,
      cueOut: from.duration || 180,
      compatibilityScore
    });
  }

  // Calculate set statistics
  const totalDuration = mixTracks.reduce((sum, t) => sum + (t.duration || 0), 0);
  const averageBPM = mixTracks.reduce((sum, t) => sum + (t.bpm || 0), 0) / mixTracks.length;
  const energyFlow = mixTracks.map(t => t.energy || 0.5);
  const avgCompatibility = transitions.reduce((sum, t) => sum + t.compatibilityScore, 0) / transitions.length;

  // Create DJ set in database
  const { data: setData, error: setError } = await supabase
    .from('dj_sets')
    .insert({
      user_id: userId,
      set_name: setName,
      total_duration: totalDuration,
      average_bpm: averageBPM,
      energy_flow: { flow: energyFlow },
      is_public: true
    })
    .select()
    .single();

  if (setError) throw setError;
  if (!setData) throw new Error('Failed to create set');

  // Insert set tracks
  const setTracks = mixTracks.map((track, index) => ({
    set_id: setData.id,
    track_id: track.id,
    position: index,
    transition_type: index < transitions.length ? transitions[index].transitionType : 'fade',
    crossfade_duration: index < transitions.length ? transitions[index].crossfadeDuration : 8,
    bpm_shift: index < transitions.length ? transitions[index].bpmShift : 0
  }));

  const { error: tracksInsertError } = await supabase
    .from('dj_set_tracks')
    .insert(setTracks);

  if (tracksInsertError) throw tracksInsertError;

  return {
    setId: setData.id,
    tracks: mixTracks,
    transitions,
    totalDuration,
    averageBPM: Math.round(averageBPM),
    energyFlow,
    compatibilityScore: Math.round(avgCompatibility)
  };
}

/**
 * Auto-crossfade between two audio files
 */
export async function autoCrossfade(
  audio1Url: string,
  audio2Url: string,
  duration: number = 8
): Promise<Blob> {
  // This is a simplified version
  // In production, use Web Audio API to create actual crossfade
  
  const audioContext = new AudioContext();
  
  // Fetch audio files
  const [response1, response2] = await Promise.all([
    fetch(audio1Url),
    fetch(audio2Url)
  ]);

  const [buffer1, buffer2] = await Promise.all([
    response1.arrayBuffer(),
    response2.arrayBuffer()
  ]);

  const [audioBuffer1, audioBuffer2] = await Promise.all([
    audioContext.decodeAudioData(buffer1),
    audioContext.decodeAudioData(buffer2)
  ]);

  // Create offline context for rendering
  const sampleRate = audioBuffer1.sampleRate;
  const fadeSamples = duration * sampleRate;
  const totalLength = audioBuffer1.length + audioBuffer2.length - fadeSamples;
  
  const offlineContext = new OfflineAudioContext(2, totalLength, sampleRate);

  // Create sources
  const source1 = offlineContext.createBufferSource();
  const source2 = offlineContext.createBufferSource();
  source1.buffer = audioBuffer1;
  source2.buffer = audioBuffer2;

  // Create gain nodes for crossfade
  const gain1 = offlineContext.createGain();
  const gain2 = offlineContext.createGain();

  // Schedule fade out for track 1
  const fadeStart = audioBuffer1.duration - duration;
  gain1.gain.setValueAtTime(1, 0);
  gain1.gain.setValueAtTime(1, fadeStart);
  gain1.gain.linearRampToValueAtTime(0, fadeStart + duration);

  // Schedule fade in for track 2
  gain2.gain.setValueAtTime(0, fadeStart);
  gain2.gain.linearRampToValueAtTime(1, fadeStart + duration);

  // Connect nodes
  source1.connect(gain1);
  source2.connect(gain2);
  gain1.connect(offlineContext.destination);
  gain2.connect(offlineContext.destination);

  // Start playback
  source1.start(0);
  source2.start(fadeStart);

  // Render
  const renderedBuffer = await offlineContext.startRendering();

  // Convert to WAV blob (simplified)
  // In production, use a proper WAV encoder
  return new Blob([renderedBuffer.getChannelData(0)], { type: 'audio/wav' });
}
