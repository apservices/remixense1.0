
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { checkRateLimit, getClientIP, createRateLimitResponse } from '../_shared/rate-limit.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Security-Policy': "default-src 'self'",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
}

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
      maxRequests: 10, // 10 requests per hour per IP
      windowMinutes: 60
    });

    if (!rateLimitOk) {
      return createRateLimitResponse();
    }

    const { platform } = await req.json()
    
    // Input validation
    if (!platform || typeof platform !== 'string') {
      throw new Error('Invalid platform parameter')
    }
    
    if (!['dropbox', 'soundcloud', 'spotify'].includes(platform)) {
      throw new Error('Unsupported platform')
    }
    
    const redirectUri = `${req.headers.get('origin')}/auth/callback/${platform}`
    
    let authUrl = ''
    
    switch (platform) {
      case 'dropbox':
        const dropboxClientId = Deno.env.get('DROPBOX_CLIENT_ID')
        authUrl = `https://www.dropbox.com/oauth2/authorize?` +
          `client_id=${dropboxClientId}&` +
          `redirect_uri=${encodeURIComponent(redirectUri)}&` +
          `response_type=code&` +
          `scope=files.content.write files.content.read sharing.write`
        break
        
      case 'soundcloud':
        const soundcloudClientId = Deno.env.get('SOUNDCLOUD_CLIENT_ID')
        authUrl = `https://soundcloud.com/connect?` +
          `client_id=${soundcloudClientId}&` +
          `redirect_uri=${encodeURIComponent(redirectUri)}&` +
          `response_type=code&` +
          `scope=upload`
        break
        
      case 'spotify':
        const spotifyClientId = Deno.env.get('SPOTIFY_CLIENT_ID')
        authUrl = `https://accounts.spotify.com/authorize?` +
          `client_id=${spotifyClientId}&` +
          `redirect_uri=${encodeURIComponent(redirectUri)}&` +
          `response_type=code&` +
          `scope=ugc-image-upload`
        break
        
      default:
        throw new Error('Unsupported platform')
    }

    return new Response(
      JSON.stringify({ auth_url: authUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
