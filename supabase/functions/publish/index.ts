import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PublishRequest {
  releaseId: string;
  platforms: string[];
  releaseDate?: string;
  preSaveEnabled?: boolean;
}

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

    const { releaseId, platforms, releaseDate, preSaveEnabled }: PublishRequest = await req.json();

    if (!releaseId) {
      throw new Error('releaseId is required');
    }

    if (!platforms || platforms.length === 0) {
      throw new Error('At least one platform is required');
    }

    // Get release details
    const { data: release, error: releaseError } = await supabaseClient
      .from('releases')
      .select(`
        *,
        project:projects(title, user_id, file_url)
      `)
      .eq('id', releaseId)
      .single();

    if (releaseError || !release) {
      throw new Error('Release not found');
    }

    // Verify user owns this release
    if (release.project?.user_id !== user.id) {
      throw new Error('Not authorized to publish this release');
    }

    // Validate release has required data
    if (!release.isrc) {
      throw new Error('ISRC is required before publishing');
    }

    if (!release.cover_art_url) {
      throw new Error('Cover art is required before publishing');
    }

    // Simulate publishing to each platform
    const publishResults: Record<string, { status: string; message: string }> = {};

    for (const platform of platforms) {
      // In production, this would call actual platform APIs
      publishResults[platform] = {
        status: 'queued',
        message: `Submission queued for ${platform}`
      };
    }

    // Update release status and platforms
    const { error: updateError } = await supabaseClient
      .from('releases')
      .update({
        status: 'submitted',
        // Store platforms as JSONB in a new way
      })
      .eq('id', releaseId);

    if (updateError) {
      console.error('Error updating release:', updateError);
    }

    console.log(`Published release ${releaseId} to platforms: ${platforms.join(', ')}`);

    return new Response(
      JSON.stringify({
        success: true,
        releaseId,
        status: 'submitted',
        platforms: publishResults,
        estimatedLiveDate: releaseDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Publish error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
