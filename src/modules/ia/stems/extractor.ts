import { supabase } from "@/integrations/supabase/client";

export type StemType = 'vocals' | 'drums' | 'bass' | 'other' | 'piano' | 'guitar';

export interface StemResult {
  id: string;
  type: StemType;
  url: string;
  duration: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface ExtractStemsOptions {
  trackId: string;
  userId: string;
  stemTypes?: StemType[];
}

export async function extractStems(options: ExtractStemsOptions): Promise<{ jobId: string }> {
  const { trackId, userId, stemTypes = ['vocals', 'drums', 'bass', 'other'] } = options;
  
  // Call Edge Function for stem extraction
  const { data, error } = await supabase.functions.invoke('extract-stems', {
    body: {
      trackId,
      userId,
      stemTypes
    }
  });

  if (error) {
    throw new Error(`Stem extraction failed: ${error.message}`);
  }

  return { jobId: data.jobId };
}

export async function getStemStatus(jobId: string): Promise<StemResult[]> {
  const { data, error } = await supabase
    .from('track_stems')
    .select('*')
    .eq('id', jobId);

  if (error) {
    throw new Error(`Failed to get stem status: ${error.message}`);
  }

  return data?.map(stem => ({
    id: stem.id,
    type: stem.stem_type as StemType,
    url: stem.file_url,
    duration: stem.duration || 0,
    status: 'completed' as const
  })) || [];
}
