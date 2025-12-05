import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  coverUrl?: string;
  duration: number;
  bpm?: number | null;
  key_signature?: string | null;
  energy_level?: number | null;
  genre?: string | null;
  source: 'upload' | 'suno' | 'stems' | 'marketplace';
  created_at: string;
}

interface UseAudioLibraryReturn {
  tracks: AudioTrack[];
  aiGenerations: AudioTrack[];
  allTracks: AudioTrack[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addTrackFromGeneration: (generationId: string, title: string, audioUrl: string) => Promise<AudioTrack | null>;
  getTrackById: (id: string) => AudioTrack | undefined;
}

export function useAudioLibrary(): UseAudioLibraryReturn {
  const { user } = useAuth();
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [aiGenerations, setAiGenerations] = useState<AudioTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTracks = useCallback(async () => {
    if (!user?.id) {
      setTracks([]);
      setAiGenerations([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch user tracks
      const { data: tracksData, error: tracksError } = await supabase
        .from('tracks')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (tracksError) throw tracksError;

      // Fetch AI generations
      const { data: generationsData, error: generationsError } = await supabase
        .from('ai_generations')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .not('output_url', 'is', null)
        .order('created_at', { ascending: false });

      if (generationsError) throw generationsError;

      // Transform tracks - use file_url directly as audioUrl
      const transformedTracks: AudioTrack[] = (tracksData || []).map(track => ({
        id: track.id,
        title: track.title || 'Sem título',
        artist: track.artist || 'Artista desconhecido',
        audioUrl: track.file_url || track.file_path || '',
        coverUrl: undefined,
        duration: typeof track.duration === 'string' ? parseInt(track.duration) || 0 : track.duration || 0,
        bpm: track.bpm,
        key_signature: track.key_signature,
        energy_level: track.energy_level,
        genre: track.genre,
        source: 'upload' as const,
        created_at: track.created_at,
      }));

      // Transform AI generations
      const transformedGenerations: AudioTrack[] = (generationsData || []).map(gen => {
        const params = gen.parameters as Record<string, unknown> || {};
        return {
          id: gen.id,
          title: (params.prompt as string)?.slice(0, 50) || `Geração IA ${gen.type}`,
          artist: 'Suno AI',
          audioUrl: gen.output_url || '',
          duration: (params.duration as number) || 30,
          bpm: params.bpm as number | undefined,
          key_signature: params.key as string | undefined,
          genre: params.genre as string | undefined,
          source: 'suno' as const,
          created_at: gen.created_at || new Date().toISOString(),
        };
      });

      setTracks(transformedTracks);
      setAiGenerations(transformedGenerations);
    } catch (err) {
      console.error('Error fetching audio library:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar biblioteca');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Add track from AI generation to main library
  const addTrackFromGeneration = useCallback(async (
    generationId: string,
    title: string,
    audioUrl: string
  ): Promise<AudioTrack | null> => {
    if (!user?.id) return null;

    try {
      // Get generation details
      const { data: generation } = await supabase
        .from('ai_generations')
        .select('*')
        .eq('id', generationId)
        .single();

      const params = generation?.parameters as Record<string, unknown> || {};

      // Create track in main library
      const { data: newTrack, error } = await supabase
        .from('tracks')
        .insert([{
          user_id: user.id,
          type: 'ai_generation',
          title: title,
          artist: 'Suno AI',
          file_url: audioUrl,
          bpm: params.bpm as number | undefined,
          key_signature: params.key as string | undefined,
          genre: params.genre as string | undefined,
          duration: String(params.duration || 30),
        }])
        .select()
        .single();

      if (error) throw error;

      // Refresh library
      await fetchTracks();

      return {
        id: newTrack.id,
        title: newTrack.title || title,
        artist: 'Suno AI',
        audioUrl: audioUrl,
        duration: parseInt(newTrack.duration) || 30,
        bpm: newTrack.bpm,
        key_signature: newTrack.key_signature,
        genre: newTrack.genre,
        source: 'upload',
        created_at: newTrack.created_at,
      };
    } catch (err) {
      console.error('Error adding track from generation:', err);
      return null;
    }
  }, [user?.id, fetchTracks]);

  const getTrackById = useCallback((id: string): AudioTrack | undefined => {
    return [...tracks, ...aiGenerations].find(t => t.id === id);
  }, [tracks, aiGenerations]);

  // Initial fetch
  useEffect(() => {
    fetchTracks();
  }, [fetchTracks]);

  // Subscribe to realtime changes
  useEffect(() => {
    if (!user?.id) return;

    const tracksChannel = supabase
      .channel('tracks-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tracks', filter: `user_id=eq.${user.id}` },
        () => fetchTracks()
      )
      .subscribe();

    const generationsChannel = supabase
      .channel('generations-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ai_generations', filter: `user_id=eq.${user.id}` },
        () => fetchTracks()
      )
      .subscribe();

    return () => {
      tracksChannel.unsubscribe();
      generationsChannel.unsubscribe();
    };
  }, [user?.id, fetchTracks]);

  return {
    tracks,
    aiGenerations,
    allTracks: [...tracks, ...aiGenerations],
    isLoading,
    error,
    refresh: fetchTracks,
    addTrackFromGeneration,
    getTrackById,
  };
}
