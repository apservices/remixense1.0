import { supabase } from '@/integrations/supabase/client';

export interface ReanalysisResult {
  success: boolean;
  processed: number;
  failed: number;
  skipped: number;
  errors: string[];
}

export interface ReanalysisProgress {
  current: number;
  total: number;
  currentTrack: string;
}

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
 * Re-analyzes all tracks for a user that need BPM/Key detection
 */
export async function reanalyzeAllTracks(
  userId: string,
  onProgress?: (progress: ReanalysisProgress) => void
): Promise<ReanalysisResult> {
  const result: ReanalysisResult = {
    success: true,
    processed: 0,
    failed: 0,
    skipped: 0,
    errors: []
  };

  try {
    // Fetch all tracks for the user that need analysis
    const { data: tracks, error: fetchError } = await supabase
      .from('tracks')
      .select('id, title, bpm, key_signature, file_path')
      .eq('user_id', userId)
      .not('file_path', 'is', null);

    if (fetchError) {
      throw fetchError;
    }

    if (!tracks || tracks.length === 0) {
      return { ...result, success: true, skipped: 0 };
    }

    // Filter tracks that need re-analysis (no BPM or key, or mock values)
    const tracksToAnalyze = tracks.filter(t => 
      !t.bpm || 
      !t.key_signature || 
      t.bpm === 200 || // Known mock value
      t.bpm === 0
    );

    console.log(`📊 Re-analyzing ${tracksToAnalyze.length} of ${tracks.length} tracks`);

    // If no tracks need analysis, return success
    if (tracksToAnalyze.length === 0) {
      return { ...result, skipped: tracks.length, success: true };
    }

    const totalToAnalyze = tracksToAnalyze.length;

    // Process tracks in batches to avoid overwhelming the server
    const batchSize = 3;
    let processedCount = 0;
    
    for (let i = 0; i < tracksToAnalyze.length; i += batchSize) {
      const batch = tracksToAnalyze.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (track) => {
        try {
          // Report progress
          if (onProgress) {
            onProgress({
              current: processedCount + 1,
              total: totalToAnalyze,
              currentTrack: track.title || 'Unknown'
            });
          }
          
          console.log(`🔄 Re-analyzing: ${track.title}`);
          
          const { data, error } = await supabase.functions.invoke('analyze-audio', {
            body: { trackId: track.id }
          });

          if (error) {
            throw error;
          }

          result.processed++;
          processedCount++;
          return true;
        } catch (err) {
          console.error(`❌ Failed to analyze ${track.title}:`, err);
          result.failed++;
          processedCount++;
          result.errors.push(`${track.title}: ${err instanceof Error ? err.message : 'Unknown error'}`);
          return false;
        }
      });

      await Promise.all(batchPromises);
      
      // Small delay between batches
      if (i + batchSize < tracksToAnalyze.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    result.success = result.failed === 0;
    return result;

  } catch (error) {
    console.error('Re-analysis error:', error);
    return {
      success: false,
      processed: 0,
      failed: 1,
      skipped: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
}

/**
 * Re-analyzes a single track
 */
export async function reanalyzeSingleTrack(trackId: string): Promise<boolean> {
  try {
    const { error } = await supabase.functions.invoke('analyze-audio', {
      body: { trackId }
    });

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Single track re-analysis error:', error);
    return false;
  }
}
