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

    // Get user from auth header
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { key, bpm, mood, duration_bars = 8, scale = 'major' } = await req.json();

    // Validate inputs
    if (!key || !bpm) {
      return new Response(JSON.stringify({ error: 'Key and BPM are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const startTime = Date.now();

    // Create generation record
    const { data: generation, error: insertError } = await supabase
      .from('ai_generations')
      .insert({
        user_id: user.id,
        type: 'melody',
        parameters: { key, bpm, mood, duration_bars, scale },
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

    // Generate melody using music theory (simplified algorithm)
    // In production, this would call an AI model or external API
    const melodyNotes = generateMelodyNotes(key, scale, bpm, duration_bars, mood);
    
    // Convert to MIDI-like format for frontend visualization
    const melodyData = {
      notes: melodyNotes,
      key,
      scale,
      bpm,
      duration_bars,
      mood,
      generated_at: new Date().toISOString(),
    };

    const processingTime = Date.now() - startTime;

    // Update generation record with result
    await supabase
      .from('ai_generations')
      .update({
        status: 'completed',
        output_url: JSON.stringify(melodyData),
        processing_time_ms: processingTime,
        completed_at: new Date().toISOString(),
        credits_used: 1,
      })
      .eq('id', generation.id);

    console.log(`Melody generated for user ${user.id} in ${processingTime}ms`);

    return new Response(JSON.stringify({
      success: true,
      generation_id: generation.id,
      melody: melodyData,
      processing_time_ms: processingTime,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Generate melody error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Music theory-based melody generation
function generateMelodyNotes(
  key: string,
  scale: string,
  bpm: number,
  bars: number,
  mood?: string
): Array<{ note: string; duration: number; velocity: number; start_beat: number }> {
  // Scale intervals
  const scales: Record<string, number[]> = {
    major: [0, 2, 4, 5, 7, 9, 11],
    minor: [0, 2, 3, 5, 7, 8, 10],
    dorian: [0, 2, 3, 5, 7, 9, 10],
    mixolydian: [0, 2, 4, 5, 7, 9, 10],
    pentatonic: [0, 2, 4, 7, 9],
  };

  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const keyIndex = noteNames.indexOf(key.replace('m', ''));
  const scaleType = key.includes('m') ? 'minor' : (scale || 'major');
  const scaleIntervals = scales[scaleType] || scales.major;

  // Generate scale notes
  const scaleNotes = scaleIntervals.map(interval => {
    const noteIndex = (keyIndex + interval) % 12;
    return noteNames[noteIndex];
  });

  const notes: Array<{ note: string; duration: number; velocity: number; start_beat: number }> = [];
  const totalBeats = bars * 4;
  
  // Mood affects note density and velocity
  const density = mood === 'energetic' ? 0.8 : mood === 'calm' ? 0.4 : 0.6;
  const baseVelocity = mood === 'energetic' ? 100 : mood === 'calm' ? 60 : 80;

  let currentBeat = 0;
  while (currentBeat < totalBeats) {
    // Probabilistic note generation
    if (Math.random() < density) {
      const noteIndex = Math.floor(Math.random() * scaleNotes.length);
      const octave = Math.floor(Math.random() * 2) + 4; // Octave 4 or 5
      const duration = [0.25, 0.5, 1, 2][Math.floor(Math.random() * 4)];
      const velocity = baseVelocity + Math.floor(Math.random() * 20) - 10;

      notes.push({
        note: `${scaleNotes[noteIndex]}${octave}`,
        duration,
        velocity: Math.max(40, Math.min(127, velocity)),
        start_beat: currentBeat,
      });

      currentBeat += duration;
    } else {
      currentBeat += 0.5; // Rest
    }
  }

  return notes;
}
