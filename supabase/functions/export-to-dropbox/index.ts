
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

    const { export_id, track_id, metadata } = await req.json()

    // Get the export record
    const { data: exportRecord, error: exportError } = await supabase
      .from('exports')
      .select('*')
      .eq('id', export_id)
      .single()

    if (exportError) throw exportError

    // Get the track file URL
    const { data: track, error: trackError } = await supabase
      .from('tracks')
      .select('file_url, title, artist')
      .eq('id', track_id)
      .single()

    if (trackError) throw trackError

    // Get user's Dropbox connection
    const { data: connection, error: connectionError } = await supabase
      .from('platform_connections')
      .select('*')
      .eq('user_id', exportRecord.user_id)
      .eq('platform', 'dropbox')
      .single()

    if (connectionError) throw connectionError

    // Download the track file
    const { data: fileData, error: fileError } = await supabase.storage
      .from('tracks')
      .download(track.file_url)

    if (fileError) throw fileError

    // Upload to Dropbox
    const dropboxResponse = await fetch('https://content.dropboxapi.com/2/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${connection.access_token}`,
        'Content-Type': 'application/octet-stream',
        'Dropbox-API-Arg': JSON.stringify({
          path: `/RemiXense/${metadata.title || track.title}.mp3`,
          mode: 'add',
          autorename: true
        })
      },
      body: fileData
    })

    if (!dropboxResponse.ok) {
      throw new Error(`Dropbox upload failed: ${dropboxResponse.statusText}`)
    }

    const dropboxResult = await dropboxResponse.json()

    // Create a shared link
    const linkResponse = await fetch('https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${connection.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        path: dropboxResult.path_display
      })
    })

    let sharedUrl = null
    if (linkResponse.ok) {
      const linkResult = await linkResponse.json()
      sharedUrl = linkResult.url
    }

    // Update export status
    await supabase
      .from('exports')
      .update({
        status: 'success',
        external_id: dropboxResult.id,
        external_url: sharedUrl,
        metadata: {
          ...exportRecord.metadata,
          dropbox_path: dropboxResult.path_display,
          dropbox_size: dropboxResult.size
        }
      })
      .eq('id', export_id)

    return new Response(
      JSON.stringify({ success: true, url: sharedUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Dropbox export error:', error)
    
    // Update export status to error
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    if (export_id) {
      await supabase
        .from('exports')
        .update({
          status: 'error',
          error_message: error.message
        })
        .eq('id', export_id)
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
