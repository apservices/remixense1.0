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
      target_mood, // 'energetic', 'calm', 'dark', 'bright', 'melancholic', 'euphoric'
      intensity = 50, // 0-100
    } = await req.json();

    if (!track_id || !target_mood) {
      return new Response(JSON.stringify({ error: 'track_id and target_mood are required' }), {
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

    // Get track analysis if available
    const { data: analysis } = await supabase
      .from('audio_analysis')
      .select('*')
      .eq('track_id', track_id)
      .single();

    // Create generation record
    const { data: generation, error: insertError } = await supabase
      .from('ai_generations')
      .insert({
        user_id: user.id,
        type: 'mood',
        input_track_id: track_id,
        parameters: { target_mood, intensity },
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

    // Generate mood transformation parameters
    const moodTransform = generateMoodTransform(
      target_mood, 
      intensity, 
      {
        bpm: analysis?.bpm || track.bpm,
        key: analysis?.key_signature || track.key,
        energy: analysis?.energy_level,
      }
    );

    const moodVariationResult = {
      track_id,
      original_track: track.file_url,
      original_analysis: {
        bpm: analysis?.bpm || track.bpm,
        key: analysis?.key_signature || track.key,
        energy: analysis?.energy_level,
        valence: analysis?.valence,
      },
      target_mood,
      intensity,
      transformation: moodTransform,
      // In production: would contain URL to processed audio
      output_url: null,
      generated_at: new Date().toISOString(),
    };

    const processingTime = Date.now() - startTime;

    await supabase
      .from('ai_generations')
      .update({
        status: 'completed',
        output_url: JSON.stringify(moodVariationResult),
        processing_time_ms: processingTime,
        completed_at: new Date().toISOString(),
        credits_used: 2,
      })
      .eq('id', generation.id);

    console.log(`Mood variation completed for track ${track_id} in ${processingTime}ms`);

    return new Response(JSON.stringify({
      success: true,
      generation_id: generation.id,
      mood_variation: moodVariationResult,
      processing_time_ms: processingTime,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Mood variation error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateMoodTransform(
  targetMood: string,
  intensity: number,
  currentAnalysis: { bpm?: number; key?: string; energy?: number }
) {
  const intensityFactor = intensity / 100;

  const moodProfiles: Record<string, any> = {
    energetic: {
      bpm_shift: Math.round(20 * intensityFactor),
      pitch_shift: 1 + (0.05 * intensityFactor),
      eq: {
        low_boost: 3 * intensityFactor,
        high_boost: 4 * intensityFactor,
        mid_cut: -2 * intensityFactor,
      },
      compression: {
        increase_ratio: 2 * intensityFactor,
        faster_attack: true,
      },
      reverb: { reduce: true, factor: 0.5 },
      saturation: 20 * intensityFactor,
    },
    calm: {
      bpm_shift: Math.round(-15 * intensityFactor),
      pitch_shift: 1 - (0.03 * intensityFactor),
      eq: {
        low_boost: -2 * intensityFactor,
        high_cut: -3 * intensityFactor,
        mid_boost: 1 * intensityFactor,
      },
      compression: {
        decrease_ratio: -1.5 * intensityFactor,
        slower_attack: true,
      },
      reverb: { increase: true, factor: 1.5 },
      saturation: -10 * intensityFactor,
    },
    dark: {
      bpm_shift: Math.round(-5 * intensityFactor),
      pitch_shift: 1 - (0.04 * intensityFactor),
      eq: {
        low_boost: 4 * intensityFactor,
        high_cut: -5 * intensityFactor,
        mid_cut: -2 * intensityFactor,
      },
      compression: {
        increase_ratio: 1 * intensityFactor,
      },
      reverb: { increase: true, factor: 1.3, darker: true },
      saturation: 15 * intensityFactor,
    },
    bright: {
      bpm_shift: Math.round(5 * intensityFactor),
      pitch_shift: 1 + (0.03 * intensityFactor),
      eq: {
        low_cut: -2 * intensityFactor,
        high_boost: 5 * intensityFactor,
        presence_boost: 3 * intensityFactor,
      },
      compression: {
        increase_ratio: 0.5 * intensityFactor,
      },
      reverb: { reduce: true, factor: 0.7, brighter: true },
      saturation: 5 * intensityFactor,
    },
    melancholic: {
      bpm_shift: Math.round(-10 * intensityFactor),
      pitch_shift: 1 - (0.02 * intensityFactor),
      eq: {
        low_boost: 1 * intensityFactor,
        high_cut: -2 * intensityFactor,
        mid_dip: { freq: 2000, gain: -3 * intensityFactor },
      },
      compression: {
        decrease_ratio: -1 * intensityFactor,
      },
      reverb: { increase: true, factor: 2, longer_decay: true },
      saturation: 0,
      key_shift: 'minor', // Suggest shifting to minor if in major
    },
    euphoric: {
      bpm_shift: Math.round(15 * intensityFactor),
      pitch_shift: 1 + (0.04 * intensityFactor),
      eq: {
        sub_boost: 4 * intensityFactor,
        high_boost: 3 * intensityFactor,
        presence_boost: 2 * intensityFactor,
      },
      compression: {
        increase_ratio: 2.5 * intensityFactor,
        parallel: true,
      },
      reverb: { increase: true, factor: 1.2, shimmer: true },
      saturation: 25 * intensityFactor,
      stereo_width: 120,
    },
  };

  const profile = moodProfiles[targetMood] || moodProfiles.calm;

  return {
    target_mood: targetMood,
    intensity_percent: intensity,
    transformations: profile,
    suggested_new_bpm: currentAnalysis.bpm 
      ? currentAnalysis.bpm + (profile.bpm_shift || 0) 
      : null,
    description: getMoodDescription(targetMood),
  };
}

function getMoodDescription(mood: string): string {
  const descriptions: Record<string, string> = {
    energetic: 'Aumenta BPM, compressão e frequências altas para criar mais energia e impacto',
    calm: 'Reduz BPM, adiciona reverb e suaviza frequências para atmosfera relaxante',
    dark: 'Enfatiza graves, reduz agudos e adiciona saturação para tom mais sombrio',
    bright: 'Realça frequências altas e presença para som mais aberto e vibrante',
    melancholic: 'Adiciona reverb longo, reduz BPM e sugere tons menores para tristeza',
    euphoric: 'Maximiza energia, adiciona shimmer reverb e aumenta largura estéreo',
  };
  return descriptions[mood] || 'Transformação de mood aplicada';
}
