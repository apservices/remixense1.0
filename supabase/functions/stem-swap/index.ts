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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { 
      source_track_id,
      target_track_id,
      swap_config // e.g., { vocals: 'source', drums: 'target', bass: 'source', other: 'target' }
    } = await req.json();

    if (!source_track_id || !target_track_id || !swap_config) {
      return new Response(JSON.stringify({ 
        error: 'source_track_id, target_track_id, and swap_config are required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const startTime = Date.now();

    // Verify both tracks exist and belong to user
    const { data: tracks, error: tracksError } = await supabase
      .from('tracks')
      .select('*')
      .in('id', [source_track_id, target_track_id])
      .eq('user_id', user.id);

    if (tracksError || !tracks || tracks.length !== 2) {
      return new Response(JSON.stringify({ error: 'One or both tracks not found or access denied' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const sourceTrack = tracks.find(t => t.id === source_track_id);
    const targetTrack = tracks.find(t => t.id === target_track_id);

    // Create generation record
    const { data: generation, error: insertError } = await supabase
      .from('ai_generations')
      .insert({
        user_id: user.id,
        type: 'stems',
        input_track_id: source_track_id,
        parameters: { 
          source_track_id,
          target_track_id,
          swap_config,
        },
        status: 'processing',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to create generation record' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // In production, this would:
    // 1. Extract stems from both tracks using Demucs/Spleeter
    // 2. Mix selected stems according to swap_config
    // 3. Export the combined audio

    const stemSwapResult = {
      source_track: {
        id: source_track_id,
        name: sourceTrack?.name,
        stems: ['vocals', 'drums', 'bass', 'other'],
      },
      target_track: {
        id: target_track_id,
        name: targetTrack?.name,
        stems: ['vocals', 'drums', 'bass', 'other'],
      },
      swap_config,
      result_composition: Object.entries(swap_config).map(([stem, source]) => ({
        stem,
        from: source === 'source' ? sourceTrack?.name : targetTrack?.name,
      })),
      // In production: output_url would point to the mixed file
      output_url: null,
      generated_at: new Date().toISOString(),
    };

    const processingTime = Date.now() - startTime;

    await supabase
      .from('ai_generations')
      .update({
        status: 'completed',
        output_url: JSON.stringify(stemSwapResult),
        processing_time_ms: processingTime,
        completed_at: new Date().toISOString(),
        credits_used: 5, // Stem swap is expensive
      })
      .eq('id', generation.id);

    console.log(`Stem swap completed for user ${user.id} in ${processingTime}ms`);

    return new Response(JSON.stringify({
      success: true,
      generation_id: generation.id,
      stem_swap: stemSwapResult,
      processing_time_ms: processingTime,
      note: 'Full stem extraction requires external API integration (Demucs/Spleeter)',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Stem swap error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
