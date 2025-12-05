import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { checkRateLimit, getClientIP, createRateLimitResponse } from '../_shared/rate-limit.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Security-Policy': "default-src 'self'",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
}

// Supported platforms with OAuth configuration
const SUPPORTED_PLATFORMS = ['dropbox', 'soundcloud', 'spotify'] as const;
type SupportedPlatform = typeof SUPPORTED_PLATFORMS[number];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Rate limiting check
    const clientIP = getClientIP(req);
    const rateLimitOk = await checkRateLimit({
      identifier: clientIP,
      endpoint: 'oauth-init',
      maxRequests: 10,
      windowMinutes: 60
    });

    if (!rateLimitOk) {
      return createRateLimitResponse();
    }

    const { platform } = await req.json()
    
    // Input validation
    if (!platform || typeof platform !== 'string') {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid platform parameter',
          supported: SUPPORTED_PLATFORMS 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    if (!SUPPORTED_PLATFORMS.includes(platform as SupportedPlatform)) {
      return new Response(
        JSON.stringify({ 
          error: `Platform '${platform}' is not supported yet`,
          supported: SUPPORTED_PLATFORMS,
          message: 'Esta plataforma ainda não está disponível para integração.'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    const redirectUri = `${req.headers.get('origin')}/auth/callback/${platform}`
    
    let authUrl = ''
    
    switch (platform) {
      case 'dropbox':
        const dropboxClientId = Deno.env.get('DROPBOX_CLIENT_ID')
        if (!dropboxClientId) {
          return new Response(
            JSON.stringify({ error: 'Dropbox integration not configured' }),
            { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        authUrl = `https://www.dropbox.com/oauth2/authorize?` +
          `client_id=${dropboxClientId}&` +
          `redirect_uri=${encodeURIComponent(redirectUri)}&` +
          `response_type=code&` +
          `scope=files.content.write files.content.read sharing.write`
        break
        
      case 'soundcloud':
        const soundcloudClientId = Deno.env.get('SOUNDCLOUD_CLIENT_ID')
        if (!soundcloudClientId) {
          return new Response(
            JSON.stringify({ error: 'SoundCloud integration not configured' }),
            { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        authUrl = `https://soundcloud.com/connect?` +
          `client_id=${soundcloudClientId}&` +
          `redirect_uri=${encodeURIComponent(redirectUri)}&` +
          `response_type=code&` +
          `scope=upload`
        break
        
      case 'spotify':
        const spotifyClientId = Deno.env.get('SPOTIFY_CLIENT_ID')
        if (!spotifyClientId) {
          return new Response(
            JSON.stringify({ error: 'Spotify integration not configured' }),
            { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        authUrl = `https://accounts.spotify.com/authorize?` +
          `client_id=${spotifyClientId}&` +
          `redirect_uri=${encodeURIComponent(redirectUri)}&` +
          `response_type=code&` +
          `scope=ugc-image-upload`
        break
        
      default:
        return new Response(
          JSON.stringify({ error: 'Unsupported platform' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    // Return both 'url' and 'auth_url' for compatibility
    return new Response(
      JSON.stringify({ 
        url: authUrl,
        auth_url: authUrl // Keep for backward compatibility
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('[PLATFORM-OAUTH-INIT] Error:', errorMessage)
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
