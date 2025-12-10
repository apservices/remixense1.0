import { supabase } from '@/integrations/supabase/client';

export interface CleanupResult {
  success: boolean;
  orphansDeleted: number;
  orphanIds: string[];
  errors: string[];
}

/**
 * Finds and deletes orphan Suno tracks (AI-generated tracks without file_path)
 */
export async function cleanupOrphanSunoTracks(userId: string): Promise<CleanupResult> {
  const result: CleanupResult = {
    success: true,
    orphansDeleted: 0,
    orphanIds: [],
    errors: []
  };

  try {
    // Find AI-generated tracks without file_path or file_url
    const { data: orphans, error: fetchError } = await supabase
      .from('tracks')
      .select('id, title, type')
      .eq('user_id', userId)
      .eq('type', 'ai_generation')
      .or('file_path.is.null,file_url.is.null');

    if (fetchError) {
      throw fetchError;
    }

    if (!orphans || orphans.length === 0) {
      console.log('✅ No orphan tracks found');
      return result;
    }

    console.log(`🗑️ Found ${orphans.length} orphan tracks to clean up`);

    // Delete orphan tracks
    for (const orphan of orphans) {
      try {
        const { error: deleteError } = await supabase
          .from('tracks')
          .delete()
          .eq('id', orphan.id);

        if (deleteError) {
          result.errors.push(`Failed to delete ${orphan.title}: ${deleteError.message}`);
        } else {
          result.orphansDeleted++;
          result.orphanIds.push(orphan.id);
          console.log(`✅ Deleted orphan: ${orphan.title}`);
        }
      } catch (err) {
        result.errors.push(`Error deleting ${orphan.title}: ${err instanceof Error ? err.message : 'Unknown'}`);
      }
    }

    result.success = result.errors.length === 0;
    return result;

  } catch (error) {
    console.error('Cleanup error:', error);
    return {
      success: false,
      orphansDeleted: 0,
      orphanIds: [],
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
}

/**
 * Cleans up failed AI generations that are stuck in 'processing' status
 */
export async function cleanupStuckGenerations(userId: string): Promise<{ cleaned: number; errors: string[] }> {
  const result = { cleaned: 0, errors: [] as string[] };

  try {
    // Find generations stuck in 'processing' for more than 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

    const { data: stuck, error: fetchError } = await supabase
      .from('ai_generations')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'processing')
      .lt('created_at', tenMinutesAgo);

    if (fetchError) {
      throw fetchError;
    }

    if (!stuck || stuck.length === 0) {
      return result;
    }

    console.log(`🔄 Found ${stuck.length} stuck generations`);

    // Mark as failed
    const { error: updateError } = await supabase
      .from('ai_generations')
      .update({ 
        status: 'failed', 
        error_message: 'Timeout - generation took too long' 
      })
      .in('id', stuck.map(s => s.id));

    if (updateError) {
      result.errors.push(updateError.message);
    } else {
      result.cleaned = stuck.length;
    }

    return result;

  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    return result;
  }
}

/**
 * Gets audio system health status
 */
export async function getAudioSystemHealth(userId: string): Promise<{
  totalTracks: number;
  tracksWithMockBpm: number;
  tracksWithRealBpm: number;
  orphanTracks: number;
  stuckGenerations: number;
  needsAttention: boolean;
}> {
  try {
    // Get total tracks count
    const { count: totalTracks } = await supabase
      .from('tracks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get tracks with mock BPM (200 or null)
    const { count: mockBpmCount } = await supabase
      .from('tracks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .or('bpm.is.null,bpm.eq.200,bpm.eq.0');

    // Get orphan AI tracks
    const { count: orphanCount } = await supabase
      .from('tracks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('type', 'ai_generation')
      .or('file_path.is.null,file_url.is.null');

    // Get stuck generations
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count: stuckCount } = await supabase
      .from('ai_generations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'processing')
      .lt('created_at', tenMinutesAgo);

    const tracksWithMockBpm = mockBpmCount || 0;
    const tracksWithRealBpm = (totalTracks || 0) - tracksWithMockBpm;
    const orphanTracks = orphanCount || 0;
    const stuckGenerations = stuckCount || 0;

    return {
      totalTracks: totalTracks || 0,
      tracksWithMockBpm,
      tracksWithRealBpm,
      orphanTracks,
      stuckGenerations,
      needsAttention: tracksWithMockBpm > 0 || orphanTracks > 0 || stuckGenerations > 0
    };

  } catch (error) {
    console.error('Health check error:', error);
    return {
      totalTracks: 0,
      tracksWithMockBpm: 0,
      tracksWithRealBpm: 0,
      orphanTracks: 0,
      stuckGenerations: 0,
      needsAttention: false
    };
  }
}
