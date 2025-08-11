import { supabase } from '@/integrations/supabase/client';

export async function invokeServerAnalysis(trackId: string) {
  const { error } = await supabase.functions.invoke('analyze-audio', { body: { trackId } });
  if (error) throw error;
}

export async function fetchTrackFeatures(trackId: string) {
  const { data, error } = await supabase
    .from('track_features')
    .select('*')
    .eq('track_id', trackId)
    .maybeSingle();
  if (error) throw error;
  return data;
}
