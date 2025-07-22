
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { platform } = await req.json()
    
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
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
