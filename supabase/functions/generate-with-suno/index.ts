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

    console.log('=== SUNO GENERATION START ===');
    console.log('Enhanced prompt:', enhancedPrompt);
    console.log('Duration:', duration);
    console.log('AutoSave:', autoSave);
    console.log('Has API Key:', !!sunoApiKey);
    console.log('API Key length:', sunoApiKey?.length || 0);

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
    if (sunoApiKey && sunoApiKey.length > 10) {
      try {
        console.log('=== CALLING GOAPI.AI ===');
        
        // GoAPI.ai Music API - correct endpoint and structure
        const requestBody = {
          model: 'music-u',
          task_type: 'generate_music',
          input: {
            gpt_description_prompt: enhancedPrompt,
            negative_tags: '',
            lyrics_type: instrumental ? 'instrumental' : 'generate'
          }
        };
        
        console.log('Request URL: https://api.goapi.ai/api/v1/task');
        console.log('Request body:', JSON.stringify(requestBody));
        
        const sunoResponse = await fetch('https://api.goapi.ai/api/v1/task', {
          method: 'POST',
          headers: {
            'x-api-key': sunoApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        console.log('GoAPI response status:', sunoResponse.status);
        const responseText = await sunoResponse.text();
        console.log('GoAPI response body:', responseText.slice(0, 1000));
        
        if (sunoResponse.ok) {
          const sunoData = JSON.parse(responseText);
          console.log('Parsed response:', JSON.stringify(sunoData).slice(0, 500));
          
          // GoAPI returns a task_id, need to poll for result
          const taskId = sunoData.data?.task_id || sunoData.task_id;
          
          if (taskId) {
            console.log('Task ID received:', taskId);
            
            // Poll for result (max 90 attempts, 4 seconds each = 6 minutes)
            for (let i = 0; i < 90; i++) {
              await new Promise(resolve => setTimeout(resolve, 4000));
              
              console.log(`Poll attempt ${i + 1}/90 for task ${taskId}`);
              
              const statusResponse = await fetch(`https://api.goapi.ai/api/v1/task/${taskId}`, {
                headers: { 'x-api-key': sunoApiKey }
              });
              
              const statusText = await statusResponse.text();
              console.log(`Poll ${i + 1} status:`, statusResponse.status);
              console.log(`Poll ${i + 1} body:`, statusText.slice(0, 500));
              
              if (statusResponse.ok) {
                const statusData = JSON.parse(statusText);
                const taskStatus = statusData.data?.status || statusData.status;
                console.log(`Task status: ${taskStatus}`);
                
                if (taskStatus === 'success' || taskStatus === 'completed') {
                  // Try multiple possible paths for audio URL
                  audioUrl = statusData.data?.task_result?.task_output?.audio_url 
                    || statusData.data?.task_result?.audio_url
                    || statusData.data?.output?.audio_url
                    || statusData.data?.audio_url
                    || statusData.audio_url;
                  
                  console.log('=== GENERATION SUCCESS ===');
                  console.log('Audio URL found:', audioUrl);
                  break;
                } else if (taskStatus === 'failed' || taskStatus === 'error') {
                  const errorMsg = statusData.data?.error || statusData.error || 'Unknown error';
                  console.error('=== GENERATION FAILED ===');
                  console.error('Error:', errorMsg);
                  throw new Error('Suno generation failed: ' + errorMsg);
                }
                // Continue polling for 'pending', 'processing', etc.
              } else {
                console.error(`Poll error: ${statusResponse.status}`);
              }
            }
            
            if (!audioUrl) {
              console.error('=== TIMEOUT ===');
              throw new Error('Timeout waiting for Suno generation (6 minutes)');
            }
          } else if (sunoData.audio_url) {
            audioUrl = sunoData.audio_url;
            console.log('Direct audio URL:', audioUrl);
          } else {
            console.error('=== UNEXPECTED RESPONSE ===');
            console.error('Full response:', responseText);
            throw new Error('Formato de resposta inesperado - sem task_id');
          }
        } else {
          console.error('=== API ERROR ===');
          console.error('Status:', sunoResponse.status);
          console.error('Response:', responseText);
          throw new Error(`GoAPI request failed: ${sunoResponse.status} - ${responseText.slice(0, 200)}`);
        }
      } catch (apiError) {
        console.error('=== CATCH API ERROR ===');
        console.error('Error:', apiError);
        // Fall through to simulation if API fails
        isSimulated = true;
        audioUrl = null;
      }
    } else {
      // Simulation mode when API not configured
      console.log('=== SIMULATION MODE ===');
      console.log('Reason: SUNO_API_KEY not configured or too short');
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

    console.log('=== RETURNING RESPONSE ===');
    console.log('Success:', !!audioUrl);
    console.log('Simulated:', isSimulated);
    console.log('Audio URL:', audioUrl?.slice(0, 100));

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
    console.error('=== FATAL ERROR ===');
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
