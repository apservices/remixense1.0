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
      track_id,
      target_loudness = -14, // LUFS
      style = 'balanced',
      enable_limiter = true,
      enable_eq = true,
      enable_compression = true,
      stereo_width = 100,
    } = await req.json();

    if (!track_id) {
      return new Response(JSON.stringify({ error: 'track_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const startTime = Date.now();

    // Verify track exists and belongs to user
    const { data: track, error: trackError } = await supabase
      .from('tracks')
      .select('*')
      .eq('id', track_id)
      .eq('user_id', user.id)
      .single();

    if (trackError || !track) {
      return new Response(JSON.stringify({ error: 'Track not found or access denied' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create generation record
    const { data: generation, error: insertError } = await supabase
      .from('ai_generations')
      .insert({
        user_id: user.id,
        type: 'mastering',
        input_track_id: track_id,
        parameters: { 
          target_loudness, 
          style, 
          enable_limiter, 
          enable_eq, 
          enable_compression,
          stereo_width 
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

    // Generate mastering settings based on style
    const masteringSettings = generateMasteringSettings(style, target_loudness, {
      enable_limiter,
      enable_eq,
      enable_compression,
      stereo_width,
    });

    // In production, this would process the actual audio
    // For now, we return the settings that would be applied
    const masteringData = {
      track_id,
      original_track: track.file_url,
      settings: masteringSettings,
      estimated_loudness: target_loudness,
      style,
      // In production: mastered_url would point to the processed file
      mastered_url: track.file_url, // Placeholder
      generated_at: new Date().toISOString(),
    };

    const processingTime = Date.now() - startTime;

    await supabase
      .from('ai_generations')
      .update({
        status: 'completed',
        output_url: JSON.stringify(masteringData),
        processing_time_ms: processingTime,
        completed_at: new Date().toISOString(),
        credits_used: 3, // Mastering costs more credits
      })
      .eq('id', generation.id);

    console.log(`Mastering completed for track ${track_id} in ${processingTime}ms`);

    return new Response(JSON.stringify({
      success: true,
      generation_id: generation.id,
      mastering: masteringData,
      processing_time_ms: processingTime,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Master track error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateMasteringSettings(
  style: string,
  targetLoudness: number,
  options: {
    enable_limiter: boolean;
    enable_eq: boolean;
    enable_compression: boolean;
    stereo_width: number;
  }
) {
  const stylePresets: Record<string, any> = {
    balanced: {
      eq: {
        low_shelf: { freq: 80, gain: 1 },
        high_shelf: { freq: 12000, gain: 1.5 },
        mid_boost: { freq: 3000, gain: 0.5, q: 1.5 },
      },
      compression: {
        threshold: -12,
        ratio: 3,
        attack: 10,
        release: 100,
        makeup_gain: 2,
      },
      limiter: {
        ceiling: -0.3,
        release: 50,
      },
    },
    warm: {
      eq: {
        low_shelf: { freq: 100, gain: 2 },
        high_shelf: { freq: 10000, gain: -0.5 },
        mid_cut: { freq: 2500, gain: -1, q: 2 },
      },
      compression: {
        threshold: -10,
        ratio: 2.5,
        attack: 20,
        release: 150,
        makeup_gain: 1.5,
      },
      limiter: {
        ceiling: -0.5,
        release: 80,
      },
    },
    bright: {
      eq: {
        low_shelf: { freq: 60, gain: 0.5 },
        high_shelf: { freq: 8000, gain: 3 },
        presence: { freq: 5000, gain: 2, q: 1 },
      },
      compression: {
        threshold: -14,
        ratio: 4,
        attack: 5,
        release: 80,
        makeup_gain: 3,
      },
      limiter: {
        ceiling: -0.2,
        release: 30,
      },
    },
    punchy: {
      eq: {
        low_shelf: { freq: 50, gain: 2.5 },
        high_shelf: { freq: 14000, gain: 2 },
        low_mid_cut: { freq: 250, gain: -2, q: 2 },
      },
      compression: {
        threshold: -8,
        ratio: 5,
        attack: 3,
        release: 50,
        makeup_gain: 4,
      },
      limiter: {
        ceiling: -0.1,
        release: 20,
      },
    },
  };

  const preset = stylePresets[style] || stylePresets.balanced;

  return {
    target_loudness: targetLoudness,
    eq: options.enable_eq ? preset.eq : null,
    compression: options.enable_compression ? preset.compression : null,
    limiter: options.enable_limiter ? preset.limiter : null,
    stereo_width: options.stereo_width,
    dithering: true,
    sample_rate: 44100,
    bit_depth: 24,
  };
}
