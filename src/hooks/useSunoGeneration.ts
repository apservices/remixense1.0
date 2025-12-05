import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { isFeatureEnabled } from '@/lib/experimentalFeatures';

interface SunoGenerationParams {
  prompt: string;
  genre?: string;
  mood?: string;
  key?: string;
  bpm?: number;
  duration?: number;
  instrumental?: boolean;
}

interface GenerationResult {
  success: boolean;
  generationId?: string;
  audioUrl?: string;
  simulated?: boolean;
  error?: string;
}

export function useSunoGeneration() {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentGeneration, setCurrentGeneration] = useState<GenerationResult | null>(null);

  const generate = useCallback(async (params: SunoGenerationParams): Promise<GenerationResult> => {
    if (!isFeatureEnabled('SUNO_AI_GENERATION')) {
      toast.error('Geração Suno AI não está ativada');
      return { success: false, error: 'Feature not enabled' };
    }

    if (!user) {
      toast.error('Você precisa estar logado');
      return { success: false, error: 'Not authenticated' };
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const { data, error } = await supabase.functions.invoke('generate-with-suno', {
        body: {
          ...params,
          userId: user.id
        }
      });

      clearInterval(progressInterval);

      if (error) {
        throw error;
      }

      setProgress(100);
      
      const result: GenerationResult = {
        success: true,
        generationId: data.generationId,
        audioUrl: data.audioUrl,
        simulated: data.simulated
      };

      setCurrentGeneration(result);

      if (data.simulated) {
        toast.info('Geração simulada - Configure a API Suno para geração real');
      } else {
        toast.success('Música gerada com sucesso!');
      }

      return result;

    } catch (error) {
      console.error('Suno generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Falha na geração: ${errorMessage}`);
      return { success: false, error: errorMessage };
    } finally {
      setIsGenerating(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, [user]);

  // Save generation to main tracks library
  const saveToLibrary = useCallback(async (title: string): Promise<boolean> => {
    if (!user || !currentGeneration?.generationId || !currentGeneration?.audioUrl) {
      toast.error('Nenhuma geração para salvar');
      return false;
    }

    try {
      // Get generation details
      const { data: generation } = await supabase
        .from('ai_generations')
        .select('*')
        .eq('id', currentGeneration.generationId)
        .single();

      const params = generation?.parameters as Record<string, unknown> || {};

      // Create track in main library
      const { error } = await supabase
        .from('tracks')
        .insert([{
          user_id: user.id,
          type: 'ai_generation',
          title: title || `Suno AI - ${new Date().toLocaleDateString('pt-BR')}`,
          artist: 'Suno AI',
          file_url: currentGeneration.audioUrl,
          bpm: params.bpm as number | undefined,
          key_signature: params.key as string | undefined,
          genre: params.genre as string | undefined,
          duration: String(params.duration || 30),
        }]);

      if (error) throw error;

      toast.success('Música salva na biblioteca!');
      return true;
    } catch (error) {
      console.error('Error saving to library:', error);
      toast.error('Erro ao salvar na biblioteca');
      return false;
    }
  }, [user, currentGeneration]);

  const getGenerationHistory = useCallback(async () => {
    if (!user) return [];

    const { data, error } = await supabase
      .from('ai_generations')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', 'suno_generation')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Failed to fetch generation history:', error);
      return [];
    }

    return data;
  }, [user]);

  return {
    generate,
    isGenerating,
    progress,
    currentGeneration,
    getGenerationHistory,
    saveToLibrary,
  };
}
