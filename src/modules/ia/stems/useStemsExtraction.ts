import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { extractStems, getStemStatus, type StemType, type StemResult } from './extractor';
import { toast } from 'sonner';

interface UseStemsExtractionOptions {
  trackId: string;
  userId: string;
}

export function useStemsExtraction({ trackId, userId }: UseStemsExtractionOptions) {
  const [jobId, setJobId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: stems, isLoading: isLoadingStems } = useQuery({
    queryKey: ['stems', trackId],
    queryFn: async () => {
      if (!jobId) return [];
      return getStemStatus(jobId);
    },
    enabled: !!jobId,
    refetchInterval: jobId ? 3000 : false // Poll while processing
  });

  const extractMutation = useMutation({
    mutationFn: async (stemTypes?: StemType[]) => {
      return extractStems({ trackId, userId, stemTypes });
    },
    onSuccess: (data) => {
      setJobId(data.jobId);
      toast.success('Extração de stems iniciada');
    },
    onError: (error: Error) => {
      toast.error(`Erro na extração: ${error.message}`);
    }
  });

  const startExtraction = useCallback((stemTypes?: StemType[]) => {
    extractMutation.mutate(stemTypes);
  }, [extractMutation]);

  const isProcessing = extractMutation.isPending || 
    (stems?.some(s => s.status === 'processing') ?? false);

  const isComplete = stems?.every(s => s.status === 'completed') ?? false;

  return {
    stems: stems || [],
    isLoadingStems,
    isProcessing,
    isComplete,
    startExtraction,
    jobId
  };
}
