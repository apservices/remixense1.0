import { supabase } from '@/integrations/supabase/client';

/**
 * Re-triggers analysis for a specific track by invoking the analyze-audio edge function
 */
export async function reanalyzeTrack(trackId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('analyze-audio', {
      body: { trackId }
    });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error re-analyzing track:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Re-analyzes all tracks for the current user
 */
export async function reanalyzeAllTracks(userId: string): Promise<{ 
  success: boolean; 
  processed: number; 
  failed: number;
  errors: string[];
}> {
  try {
    // Fetch all tracks for the user
    const { data: tracks, error: fetchError } = await supabase
      .from('tracks')
      .select('id')
      .eq('user_id', userId);

    if (fetchError) throw fetchError;
    if (!tracks || tracks.length === 0) {
      return { success: true, processed: 0, failed: 0, errors: [] };
    }

    // Re-analyze each track
    const results = await Promise.allSettled(
      tracks.map(track => reanalyzeTrack(track.id))
    );

    const processed = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - processed;
    const errors = results
      .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
      .map(r => r.reason?.message || 'Unknown error');

    return { success: failed === 0, processed, failed, errors };
  } catch (error) {
    console.error('Error re-analyzing all tracks:', error);
    return { 
      success: false, 
      processed: 0, 
      failed: 0, 
      errors: [error instanceof Error ? error.message : 'Unknown error'] 
    };
  }
}
