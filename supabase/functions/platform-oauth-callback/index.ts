
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { platform, code, user_id } = await req.json()
    
    const redirectUri = `${req.headers.get('origin')}/auth/callback/${platform}`
    
    let tokenResponse
    let accountInfo = {}
    
    switch (platform) {
      case 'dropbox':
        tokenResponse = await fetch('https://api.dropboxapi.com/oauth2/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code,
            grant_type: 'authorization_code',
            client_id: Deno.env.get('DROPBOX_CLIENT_ID') ?? '',
            client_secret: Deno.env.get('DROPBOX_CLIENT_SECRET') ?? '',
            redirect_uri: redirectUri
          })
        })
        
        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json()
          // Get account info
          const accountResponse = await fetch('https://api.dropboxapi.com/2/users/get_current_account', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${tokenData.access_token}`,
              'Content-Type': 'application/json'
            }
          })
          if (accountResponse.ok) {
            accountInfo = await accountResponse.json()
          }
          
          // Store connection
          await supabase.from('platform_connections').upsert({
            user_id,
            platform: 'dropbox',
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            account_info: accountInfo
          })
        }
        break
        
      case 'soundcloud':
        tokenResponse = await fetch('https://api.soundcloud.com/oauth2/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code,
            grant_type: 'authorization_code',
            client_id: Deno.env.get('SOUNDCLOUD_CLIENT_ID') ?? '',
            client_secret: Deno.env.get('SOUNDCLOUD_CLIENT_SECRET') ?? '',
            redirect_uri: redirectUri
          })
        })
        
        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json()
          // Get user info
          const userResponse = await fetch(`https://api.soundcloud.com/me?oauth_token=${tokenData.access_token}`)
          if (userResponse.ok) {
            accountInfo = await userResponse.json()
          }
          
          await supabase.from('platform_connections').upsert({
            user_id,
            platform: 'soundcloud',
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            account_info: accountInfo
          })
        }
        break
        
      case 'spotify':
        tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${btoa(`${Deno.env.get('SPOTIFY_CLIENT_ID')}:${Deno.env.get('SPOTIFY_CLIENT_SECRET')}`)}`
          },
          body: new URLSearchParams({
            code,
            grant_type: 'authorization_code',
            redirect_uri: redirectUri
          })
        })
        
        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json()
          // Get user profile
          const profileResponse = await fetch('https://api.spotify.com/v1/me', {
            headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
          })
          if (profileResponse.ok) {
            accountInfo = await profileResponse.json()
          }
          
          await supabase.from('platform_connections').upsert({
            user_id,
            platform: 'spotify',
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
            account_info: accountInfo
          })
        }
        break
    }

    return new Response(
      JSON.stringify({ success: true }),
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
