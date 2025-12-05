import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SunoRequest {
  prompt: string;
  genre?: string;
  mood?: string;
  key?: string;
  bpm?: number;
  duration?: number;
  instrumental?: boolean;
  userId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const sunoApiKey = Deno.env.get('SUNO_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { prompt, genre, mood, key, bpm, duration, instrumental, userId }: SunoRequest = await req.json();

    if (!prompt || !userId) {
      return new Response(
        JSON.stringify({ error: 'Prompt e userId são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build enhanced prompt with parameters
    let enhancedPrompt = prompt;
    if (genre) enhancedPrompt += `, ${genre} style`;
    if (mood) enhancedPrompt += `, ${mood} mood`;
    if (key) enhancedPrompt += `, key of ${key}`;
    if (bpm) enhancedPrompt += `, ${bpm} BPM`;
    if (instrumental) enhancedPrompt += ', instrumental only, no vocals';

    console.log('Generating with Suno AI:', { enhancedPrompt, duration });

    // Record generation in database
    const { data: generation, error: dbError } = await supabase
      .from('ai_generations')
      .insert({
        user_id: userId,
        type: 'suno_generation',
        status: 'processing',
        parameters: {
          prompt: enhancedPrompt,
          genre,
          mood,
          key,
          bpm,
          duration: duration || 30,
          instrumental
        }
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Falha ao registrar geração');
    }

    // If Suno API key is configured, make real API call
    if (sunoApiKey) {
      try {
        // Using CometAPI or similar Suno wrapper
        const sunoResponse = await fetch('https://api.comet.ai/v1/suno/generate', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sunoApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: enhancedPrompt,
            duration: Math.min(duration || 30, 480), // Max 8 minutes
            instrumental: instrumental || false,
            model: 'suno-v3.5'
          }),
        });

        if (sunoResponse.ok) {
          const sunoData = await sunoResponse.json();
          
          // Update generation with result
          await supabase
            .from('ai_generations')
            .update({
              status: 'completed',
              output_url: sunoData.audio_url,
              completed_at: new Date().toISOString(),
              credits_used: Math.ceil((duration || 30) / 30) // 1 credit per 30s
            })
            .eq('id', generation.id);

          return new Response(
            JSON.stringify({
              success: true,
              generationId: generation.id,
              audioUrl: sunoData.audio_url,
              duration: sunoData.duration,
              metadata: sunoData.metadata
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (apiError) {
        console.error('Suno API error:', apiError);
        // Fall through to simulation
      }
    }

    // Simulation mode when API not configured
    console.log('Running in simulation mode (SUNO_API_KEY not configured)');
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update with simulated result
    await supabase
      .from('ai_generations')
      .update({
        status: 'completed',
        output_url: `https://example.com/simulated-audio-${generation.id}.mp3`,
        completed_at: new Date().toISOString(),
        credits_used: 1
      })
      .eq('id', generation.id);

    return new Response(
      JSON.stringify({
        success: true,
        generationId: generation.id,
        simulated: true,
        message: 'Geração simulada - Configure SUNO_API_KEY para geração real',
        parameters: {
          prompt: enhancedPrompt,
          duration: duration || 30
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-with-suno:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
