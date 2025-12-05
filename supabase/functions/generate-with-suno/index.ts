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
  autoSave?: boolean;
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
    
    const { prompt, genre, mood, key, bpm, duration, instrumental, userId, autoSave }: SunoRequest = await req.json();

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

    console.log('Generating with Suno AI:', { enhancedPrompt, duration, autoSave });

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
          instrumental,
          autoSave
        }
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Falha ao registrar geração');
    }

    let audioUrl: string;
    let isSimulated = false;

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
          audioUrl = sunoData.audio_url;
        } else {
          throw new Error('Suno API request failed');
        }
      } catch (apiError) {
        console.error('Suno API error:', apiError);
        // Fall through to simulation
        isSimulated = true;
        audioUrl = `https://example.com/simulated-audio-${generation.id}.mp3`;
      }
    } else {
      // Simulation mode when API not configured
      console.log('Running in simulation mode (SUNO_API_KEY not configured)');
      isSimulated = true;
      audioUrl = `https://example.com/simulated-audio-${generation.id}.mp3`;
    }

    // Simulate processing time
    if (isSimulated) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Update generation with result
    await supabase
      .from('ai_generations')
      .update({
        status: 'completed',
        output_url: audioUrl,
        completed_at: new Date().toISOString(),
        credits_used: Math.ceil((duration || 30) / 30)
      })
      .eq('id', generation.id);

    // Auto-save to library if enabled
    let savedToLibrary = false;
    let trackId: string | null = null;

    if (autoSave) {
      try {
        const trackTitle = prompt.slice(0, 50) + (prompt.length > 50 ? '...' : '') + ' (Suno AI)';
        
        const { data: track, error: trackError } = await supabase
          .from('tracks')
          .insert({
            user_id: userId,
            type: 'ai_generation',
            title: trackTitle,
            artist: 'Suno AI',
            file_url: audioUrl,
            bpm: bpm || null,
            key_signature: key || null,
            genre: genre || null,
            duration: String(duration || 30),
          })
          .select()
          .single();

        if (!trackError && track) {
          savedToLibrary = true;
          trackId = track.id;

          // Link generation to track
          await supabase
            .from('ai_generations')
            .update({ input_track_id: track.id })
            .eq('id', generation.id);

          console.log('Track auto-saved to library:', track.id);
        } else {
          console.error('Failed to auto-save track:', trackError);
        }
      } catch (saveError) {
        console.error('Auto-save error:', saveError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        generationId: generation.id,
        audioUrl,
        simulated: isSimulated,
        savedToLibrary,
        trackId,
        message: isSimulated ? 'Geração simulada - Configure SUNO_API_KEY para geração real' : undefined,
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
