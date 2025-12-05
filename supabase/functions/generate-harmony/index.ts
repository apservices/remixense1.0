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

    const { key, progression_length = 4, style = 'pop', mood } = await req.json();

    if (!key) {
      return new Response(JSON.stringify({ error: 'Key is required' }), {
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
        type: 'harmony',
        parameters: { key, progression_length, style, mood },
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

    // Generate chord progression
    const progression = generateChordProgression(key, progression_length, style, mood);
    
    const harmonyData = {
      chords: progression,
      key,
      style,
      mood,
      progression_length,
      generated_at: new Date().toISOString(),
    };

    const processingTime = Date.now() - startTime;

    await supabase
      .from('ai_generations')
      .update({
        status: 'completed',
        output_url: JSON.stringify(harmonyData),
        processing_time_ms: processingTime,
        completed_at: new Date().toISOString(),
        credits_used: 1,
      })
      .eq('id', generation.id);

    console.log(`Harmony generated for user ${user.id} in ${processingTime}ms`);

    return new Response(JSON.stringify({
      success: true,
      generation_id: generation.id,
      harmony: harmonyData,
      processing_time_ms: processingTime,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Generate harmony error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateChordProgression(
  key: string,
  length: number,
  style: string,
  mood?: string
): Array<{ chord: string; numeral: string; duration_bars: number; extensions?: string[] }> {
  const isMinor = key.includes('m');
  const rootNote = key.replace('m', '');

  // Common progressions by style
  const progressions: Record<string, string[][]> = {
    pop: [
      ['I', 'V', 'vi', 'IV'],
      ['I', 'IV', 'V', 'I'],
      ['vi', 'IV', 'I', 'V'],
      ['I', 'vi', 'IV', 'V'],
    ],
    jazz: [
      ['IIM7', 'V7', 'IM7', 'VI7'],
      ['IM7', 'VI7', 'IIM7', 'V7'],
      ['IM7', 'IVM7', 'IIM7', 'V7'],
    ],
    edm: [
      ['i', 'VI', 'III', 'VII'],
      ['i', 'iv', 'VI', 'V'],
      ['VI', 'VII', 'i', 'i'],
    ],
    rock: [
      ['I', 'IV', 'V', 'I'],
      ['I', 'bVII', 'IV', 'I'],
      ['I', 'V', 'IV', 'IV'],
    ],
    rnb: [
      ['IM7', 'IVM7', 'vim7', 'V7'],
      ['vim7', 'IVM7', 'IM7', 'V7'],
    ],
  };

  const styleProgressions = progressions[style] || progressions.pop;
  const selectedProgression = styleProgressions[Math.floor(Math.random() * styleProgressions.length)];

  // Note mappings for major and minor keys
  const majorScale = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const noteOrder = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const rootIndex = noteOrder.indexOf(rootNote);

  // Scale degree to semitones (major scale)
  const majorIntervals = [0, 2, 4, 5, 7, 9, 11];
  const minorIntervals = [0, 2, 3, 5, 7, 8, 10];
  const intervals = isMinor ? minorIntervals : majorIntervals;

  const numeralToIndex: Record<string, number> = {
    'I': 0, 'i': 0, 'IM7': 0,
    'II': 1, 'ii': 1, 'IIM7': 1,
    'III': 2, 'iii': 2,
    'IV': 3, 'iv': 3, 'IVM7': 3,
    'V': 4, 'v': 4, 'V7': 4,
    'VI': 5, 'vi': 5, 'VI7': 5, 'vim7': 5,
    'VII': 6, 'vii': 6, 'bVII': 6,
  };

  const chords = selectedProgression.slice(0, length).map((numeral, idx) => {
    const degreeIndex = numeralToIndex[numeral.replace('M7', '').replace('7', '').replace('m7', '')] || 0;
    const semitones = intervals[degreeIndex];
    const chordRoot = noteOrder[(rootIndex + semitones) % 12];
    
    // Determine chord quality
    let chordType = '';
    const extensions: string[] = [];
    
    if (numeral.includes('M7')) {
      chordType = 'maj7';
      extensions.push('7');
    } else if (numeral.includes('m7')) {
      chordType = 'm7';
      extensions.push('7');
    } else if (numeral.includes('7')) {
      chordType = '7';
      extensions.push('7');
    } else if (numeral === numeral.toLowerCase()) {
      chordType = 'm';
    }

    return {
      chord: `${chordRoot}${chordType}`,
      numeral,
      duration_bars: 1,
      extensions: extensions.length > 0 ? extensions : undefined,
    };
  });

  return chords;
}
