import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { releaseId } = await req.json();

    // Get all user's releases if no specific releaseId
    let query = supabaseClient
      .from('releases')
      .select(`
        id,
        status,
        isrc,
        release_date,
        project:projects(title, user_id)
      `);

    if (releaseId) {
      query = query.eq('id', releaseId);
    }

    const { data: releases, error: releasesError } = await query;

    if (releasesError) {
      throw releasesError;
    }

    // Filter by user's releases
    const userReleases = releases?.filter(r => r.project?.user_id === user.id) || [];

    // Simulate syncing distribution status from platforms
    const syncResults = userReleases.map(release => {
      // In production, this would check actual platform APIs
      const now = new Date();
      const releaseDate = new Date(release.release_date);
      
      let status = release.status;
      if (releaseDate <= now && status === 'submitted') {
        status = 'live';
      }

      return {
        id: release.id,
        title: release.project?.title,
        currentStatus: status,
        isrc: release.isrc,
        platforms: {
          spotify: status === 'live' ? 'live' : 'pending',
          apple_music: status === 'live' ? 'live' : 'pending',
          youtube_music: status === 'live' ? 'live' : 'pending',
          deezer: status === 'live' ? 'live' : 'processing',
          tidal: status === 'live' ? 'live' : 'queued'
        },
        lastSynced: now.toISOString()
      };
    });

    // Update statuses in database
    for (const result of syncResults) {
      if (result.currentStatus !== 'draft') {
        await supabaseClient
          .from('releases')
          .update({ status: result.currentStatus })
          .eq('id', result.id);
      }
    }

    console.log(`Synced distribution status for ${syncResults.length} releases`);

    return new Response(
      JSON.stringify({
        success: true,
        releases: syncResults,
        syncedAt: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Sync distribution error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
