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
      width = 800,
      height = 200,
      color = '#7B2FF7',
      background_color = 'transparent',
      style = 'bars', // 'bars', 'line', 'mirror'
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

    // Get existing waveform data if available
    const { data: analysis } = await supabase
      .from('audio_analysis')
      .select('waveform_data')
      .eq('track_id', track_id)
      .single();

    // Create generation record
    const { data: generation, error: insertError } = await supabase
      .from('ai_generations')
      .insert({
        user_id: user.id,
        type: 'waveform',
        input_track_id: track_id,
        parameters: { width, height, color, background_color, style },
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

    // Generate waveform data (or use existing)
    let waveformData = analysis?.waveform_data;
    if (!waveformData || !Array.isArray(waveformData)) {
      // Generate synthetic waveform data for visualization
      waveformData = generateSyntheticWaveform(width);
    }

    // Generate SVG waveform
    const svgWaveform = generateWaveformSVG(waveformData, {
      width,
      height,
      color,
      background_color,
      style,
    });

    const waveformResult = {
      track_id,
      svg: svgWaveform,
      data: waveformData.slice(0, 100), // Return first 100 points as sample
      settings: { width, height, color, background_color, style },
      generated_at: new Date().toISOString(),
    };

    const processingTime = Date.now() - startTime;

    await supabase
      .from('ai_generations')
      .update({
        status: 'completed',
        output_url: svgWaveform, // Store SVG directly
        processing_time_ms: processingTime,
        completed_at: new Date().toISOString(),
        credits_used: 1,
      })
      .eq('id', generation.id);

    console.log(`Waveform generated for track ${track_id} in ${processingTime}ms`);

    return new Response(JSON.stringify({
      success: true,
      generation_id: generation.id,
      waveform: waveformResult,
      processing_time_ms: processingTime,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Waveform generator error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateSyntheticWaveform(points: number): number[] {
  const waveform: number[] = [];
  
  // Generate realistic-looking waveform with multiple frequency components
  for (let i = 0; i < points; i++) {
    const t = i / points;
    
    // Combine multiple sine waves for realistic look
    const base = Math.sin(t * Math.PI * 4) * 0.3;
    const detail = Math.sin(t * Math.PI * 20) * 0.2;
    const noise = (Math.random() - 0.5) * 0.3;
    
    // Add envelope (louder in middle)
    const envelope = Math.sin(t * Math.PI) * 0.8 + 0.2;
    
    // Combine and normalize to 0-1
    const value = Math.abs(base + detail + noise) * envelope;
    waveform.push(Math.min(1, Math.max(0, value)));
  }
  
  return waveform;
}

function generateWaveformSVG(
  data: number[],
  options: {
    width: number;
    height: number;
    color: string;
    background_color: string;
    style: string;
  }
): string {
  const { width, height, color, background_color, style } = options;
  const barWidth = width / data.length;
  const centerY = height / 2;

  let content = '';

  if (style === 'bars') {
    // Bar style waveform
    data.forEach((value, i) => {
      const barHeight = value * height * 0.8;
      const x = i * barWidth;
      const y = centerY - barHeight / 2;
      content += `<rect x="${x}" y="${y}" width="${Math.max(1, barWidth - 1)}" height="${barHeight}" fill="${color}" rx="1"/>`;
    });
  } else if (style === 'line') {
    // Line style waveform
    const points = data.map((value, i) => {
      const x = i * barWidth;
      const y = centerY - (value * height * 0.4);
      return `${x},${y}`;
    }).join(' ');
    content = `<polyline points="${points}" fill="none" stroke="${color}" stroke-width="2"/>`;
  } else if (style === 'mirror') {
    // Mirrored bar style
    data.forEach((value, i) => {
      const barHeight = value * height * 0.4;
      const x = i * barWidth;
      // Top bar
      content += `<rect x="${x}" y="${centerY - barHeight}" width="${Math.max(1, barWidth - 1)}" height="${barHeight}" fill="${color}" rx="1"/>`;
      // Bottom bar (mirrored)
      content += `<rect x="${x}" y="${centerY}" width="${Math.max(1, barWidth - 1)}" height="${barHeight}" fill="${color}" opacity="0.6" rx="1"/>`;
    });
  }

  const bgFill = background_color === 'transparent' ? 'none' : background_color;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    <rect width="${width}" height="${height}" fill="${bgFill}"/>
    ${content}
  </svg>`;
}
