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

    console.log('Generating with Suno AI:', { enhancedPrompt, duration, autoSave, hasApiKey: !!sunoApiKey });

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

    let audioUrl: string | null = null;
    let isSimulated = false;

    // If Suno API key is configured, make real API call
    if (sunoApiKey) {
      try {
        console.log('Calling Suno API via GoAPI...');
        
        // Using GoAPI.ai Suno wrapper
        const sunoResponse = await fetch('https://api.goapi.ai/api/suno/v1/music', {
          method: 'POST',
          headers: {
            'X-API-Key': sunoApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            custom_mode: true,
            input: {
              gpt_description_prompt: enhancedPrompt,
              make_instrumental: instrumental || false,
              mv: 'sonic-v3-5'
            }
          }),
        });

        console.log('Suno API response status:', sunoResponse.status);
        
        if (sunoResponse.ok) {
          const sunoData = await sunoResponse.json();
          console.log('Suno API response:', JSON.stringify(sunoData).slice(0, 500));
          
          // GoAPI returns a task_id, need to poll for result
          if (sunoData.data?.task_id) {
            const taskId = sunoData.data.task_id;
            console.log('Task ID:', taskId);
            
            // Poll for result (max 60 attempts, 5 seconds each = 5 minutes)
            for (let i = 0; i < 60; i++) {
              await new Promise(resolve => setTimeout(resolve, 5000));
              
              const statusResponse = await fetch(`https://api.goapi.ai/api/suno/v1/music/${taskId}`, {
                headers: { 'X-API-Key': sunoApiKey }
              });
              
              if (statusResponse.ok) {
                const statusData = await statusResponse.json();
                console.log(`Poll ${i + 1}:`, statusData.data?.status);
                
                if (statusData.data?.status === 'completed' && statusData.data?.output?.audio_url) {
                  audioUrl = statusData.data.output.audio_url;
                  console.log('Audio URL found:', audioUrl);
                  break;
                } else if (statusData.data?.status === 'failed') {
                  throw new Error('Suno generation failed: ' + (statusData.data?.error || 'Unknown error'));
                }
              }
            }
            
            if (!audioUrl) {
              throw new Error('Timeout waiting for Suno generation');
            }
          } else if (sunoData.audio_url) {
            audioUrl = sunoData.audio_url;
          } else {
            console.error('Unexpected Suno response format:', sunoData);
            throw new Error('Formato de resposta Suno inesperado');
          }
        } else {
          const errorText = await sunoResponse.text();
          console.error('Suno API error response:', errorText);
          throw new Error(`Suno API request failed: ${sunoResponse.status}`);
        }
      } catch (apiError) {
        console.error('Suno API error:', apiError);
        // Fall through to simulation if API fails
        isSimulated = true;
        audioUrl = null;
      }
    } else {
      // Simulation mode when API not configured
      console.log('Running in simulation mode (SUNO_API_KEY not configured)');
      isSimulated = true;
    }

    // For simulation, create a placeholder
    if (isSimulated) {
      // Use a real sample audio URL for demo purposes
      audioUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Update generation with result
    await supabase
      .from('ai_generations')
      .update({
        status: audioUrl ? 'completed' : 'failed',
        output_url: audioUrl,
        completed_at: new Date().toISOString(),
        credits_used: Math.ceil((duration || 30) / 30),
        error_message: !audioUrl && !isSimulated ? 'Failed to generate audio' : null
      })
      .eq('id', generation.id);

    // Auto-save to library if enabled and we have audio
    let savedToLibrary = false;
    let trackId: string | null = null;

    if (autoSave && audioUrl) {
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
        message: isSimulated ? 'Geração simulada - Configure SUNO_API_KEY (GoAPI.ai) para geração real' : undefined,
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