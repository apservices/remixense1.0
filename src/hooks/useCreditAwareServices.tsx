import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreditService {
  name: string;
  creditCost: number;
  cacheKey: string;
}

interface ProcessingResult {
  id: string;
  trackId: string;
  serviceType: string;
  result: any;
  cached: boolean;
  creditsUsed: number;
  createdAt: string;
}

const SERVICES: Record<string, CreditService> = {
  autoMaster: { name: 'Auto-Mastering', creditCost: 3, cacheKey: 'master' },
  stemSwap: { name: 'Stem-Swap', creditCost: 5, cacheKey: 'stems' },
  moodAnalysis: { name: 'Mood Analysis', creditCost: 2, cacheKey: 'mood' },
  melodyGenerator: { name: 'Melody Generator', creditCost: 4, cacheKey: 'melody' }
};

export function useCreditAwareServices() {
  const [processing, setProcessing] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, ProcessingResult>>({});
  const { toast } = useToast();

  const checkCache = useCallback(async (trackId: string, serviceType: string): Promise<ProcessingResult | null> => {
    const { data } = await supabase
      .from('processing_cache')
      .select('*')
      .eq('track_id', trackId)
      .eq('service_type', serviceType)
      .maybeSingle();
    
    return data || null;
  }, []);

  const validateTrackUpload = useCallback(async (trackId: string): Promise<boolean> => {
    const { data: track } = await supabase
      .from('tracks')
      .select('upload_status, file_path')
      .eq('id', trackId)
      .single();

    if (!track || track.upload_status !== 'completed' || !track.file_path) {
      toast({
        title: "Upload incompleto",
        description: "A faixa deve estar completamente carregada antes de processar.",
        variant: "destructive"
      });
      return false;
    }
    return true;
  }, [toast]);

  const runService = useCallback(async (
    trackId: string, 
    serviceType: keyof typeof SERVICES,
    forceRefresh = false
  ): Promise<ProcessingResult | null> => {
    try {
      setProcessing(serviceType);
      
      // Validate track upload first
      const isValid = await validateTrackUpload(trackId);
      if (!isValid) return null;

      // Check cache first unless forced refresh
      if (!forceRefresh) {
        const cached = await checkCache(trackId, serviceType);
        if (cached) {
          toast({
            title: "Resultado do cache",
            description: `${SERVICES[serviceType].name} carregado do cache (0 crÃ©ditos)`,
          });
          return { ...cached, cached: true };
        }
      }

      const service = SERVICES[serviceType];
      
      // Check user credits
      const { data: profile } = await supabase
        .from('profiles')
        .select('credits_remaining')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .maybeSingle();

      const creditsAvailable = profile?.credits_remaining || 0;
      if (creditsAvailable < service.creditCost) {
        toast({
          title: "CrÃ©ditos insuficientes",
          description: `${service.name} requer ${service.creditCost} crÃ©ditos. VocÃª tem ${creditsAvailable}.`,
          variant: "destructive"
        });
        return null;
      }

      // Process service
      const { data: result, error } = await supabase.functions.invoke(`process-${serviceType}`, {
        body: { trackId, forceRefresh }
      });

      if (error) throw error;

      // Cache successful result
      await supabase.from('processing_cache').upsert({
        track_id: trackId,
        service_type: serviceType,
        result: result.data,
        credits_used: service.creditCost,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      });

      // Deduct credits
      await supabase
        .from('profiles')
        .update({ 
          credits_remaining: creditsAvailable - service.creditCost 
        })
        .eq('id', (await supabase.auth.getUser()).data.user?.id);

      const processedResult: ProcessingResult = {
        id: result.id,
        trackId,
        serviceType,
        result: result.data,
        cached: false,
        creditsUsed: service.creditCost,
        createdAt: new Date().toISOString()
      };

      setResults(prev => ({ ...prev, [serviceType]: processedResult }));

      toast({
        title: "Processamento concluÃ­do",
        description: `${service.name} processado (${service.creditCost} crÃ©ditos)`,
      });

      return processedResult;

    } catch (error) {
      console.error(`Service ${serviceType} error:`, error);
      toast({
        title: "Erro no processamento",
        description: error instanceof Error ? error.message : "Falha no serviÃ§o",
        variant: "destructive"
      });
      return null;
    } finally {
      setProcessing(null);
    }
  }, [validateTrackUpload, checkCache, toast]);

  const runAutoMaster = useCallback((trackId: string, forceRefresh = false) => 
    runService(trackId, 'autoMaster', forceRefresh), [runService]);

  const runStemSwap = useCallback((trackId: string, forceRefresh = false) => 
    runService(trackId, 'stemSwap', forceRefresh), [runService]);

  const runMoodAnalysis = useCallback((trackId: string, forceRefresh = false) => 
    runService(trackId, 'moodAnalysis', forceRefresh), [runService]);

  const runMelodyGenerator = useCallback((trackId: string, forceRefresh = false) => 
    runService(trackId, 'melodyGenerator', forceRefresh), [runService]);

  const getCachedResult = useCallback((serviceType: string) => 
    results[serviceType], [results]);

  const clearCache = useCallback(async (trackId: string, serviceType?: string) => {
    let query = supabase.from('processing_cache').delete().eq('track_id', trackId);
    
    if (serviceType) {
      query = query.eq('service_type', serviceType);
    }
    
    await query;
    
    if (serviceType) {
      setResults(prev => {
        const updated = { ...prev };
        delete updated[serviceType];
        return updated;
      });
    } else {
      setResults({});
    }
  }, []);

  return {
    processing,
    results,
    runAutoMaster,
    runStemSwap,
    runMoodAnalysis,
    runMelodyGenerator,
    getCachedResult,
    clearCache,
    services: SERVICES
  };
}
