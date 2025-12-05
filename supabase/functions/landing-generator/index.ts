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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { releaseId, title, artistName, description, coverUrl, links } = await req.json();

    if (!releaseId) {
      throw new Error('releaseId is required');
    }

    // Generate unique slug
    const slug = `${title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'release'}-${Date.now().toString(36)}`;

    // Check if landing page already exists for this release
    const { data: existing } = await supabaseClient
      .from('landing_pages')
      .select('id')
      .eq('release_id', releaseId)
      .single();

    let landingPage;

    if (existing) {
      // Update existing
      const { data, error } = await supabaseClient
        .from('landing_pages')
        .update({
          title,
          artist_name: artistName,
          description,
          cover_url: coverUrl,
          links: links || {},
          slug,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      landingPage = data;
    } else {
      // Create new
      const { data, error } = await supabaseClient
        .from('landing_pages')
        .insert({
          release_id: releaseId,
          title,
          artist_name: artistName,
          description,
          cover_url: coverUrl,
          links: links || {},
          slug
        })
        .select()
        .single();

      if (error) throw error;
      landingPage = data;
    }

    // Generate HTML template
    const html = generateLandingHTML({
      title,
      artistName,
      description,
      coverUrl,
      links: links || {}
    });

    console.log(`Landing page generated for release ${releaseId}, slug: ${slug}`);

    return new Response(
      JSON.stringify({
        success: true,
        landingPage,
        html,
        url: `/release/${slug}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Landing generator error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateLandingHTML(data: {
  title: string;
  artistName: string;
  description?: string;
  coverUrl?: string;
  links: Record<string, string>;
}) {
  const platformLinks = Object.entries(data.links)
    .map(([platform, url]) => `
      <a href="${url}" target="_blank" rel="noopener" class="platform-link ${platform.toLowerCase()}">
        <span class="platform-icon">${getPlatformIcon(platform)}</span>
        <span>${platform}</span>
      </a>
    `)
    .join('');

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title} - ${data.artistName}</title>
  <meta name="description" content="${data.description || `Ouça ${data.title} de ${data.artistName}`}">
  <meta property="og:title" content="${data.title} - ${data.artistName}">
  <meta property="og:description" content="${data.description || ''}">
  <meta property="og:image" content="${data.coverUrl || ''}">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      color: white;
    }
    .container {
      max-width: 400px;
      width: 100%;
      text-align: center;
    }
    .cover {
      width: 280px;
      height: 280px;
      margin: 0 auto 24px;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(123, 47, 247, 0.3);
    }
    .cover img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .title {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 8px;
      background: linear-gradient(135deg, #7B2FF7, #1FD1F9);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .artist {
      font-size: 18px;
      color: rgba(255,255,255,0.7);
      margin-bottom: 16px;
    }
    .description {
      font-size: 14px;
      color: rgba(255,255,255,0.5);
      margin-bottom: 32px;
      line-height: 1.5;
    }
    .links {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .platform-link {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 14px 24px;
      border-radius: 50px;
      background: rgba(255,255,255,0.1);
      color: white;
      text-decoration: none;
      font-weight: 500;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.1);
    }
    .platform-link:hover {
      background: rgba(255,255,255,0.2);
      transform: translateY(-2px);
    }
    .platform-link.spotify:hover { background: #1DB954; }
    .platform-link.apple:hover { background: #FA243C; }
    .platform-link.youtube:hover { background: #FF0000; }
    .platform-link.soundcloud:hover { background: #FF5500; }
    .platform-link.deezer:hover { background: #FEAA2D; }
    .footer {
      margin-top: 48px;
      font-size: 12px;
      color: rgba(255,255,255,0.3);
    }
    .footer a { color: #7B2FF7; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    ${data.coverUrl ? `<div class="cover"><img src="${data.coverUrl}" alt="${data.title}"></div>` : ''}
    <h1 class="title">${data.title}</h1>
    <p class="artist">${data.artistName}</p>
    ${data.description ? `<p class="description">${data.description}</p>` : ''}
    <div class="links">
      ${platformLinks}
    </div>
    <div class="footer">
      Powered by <a href="https://remixense.com">RemiXense</a>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function getPlatformIcon(platform: string): string {
  const icons: Record<string, string> = {
    spotify: '🎵',
    apple: '🍎',
    youtube: '▶️',
    soundcloud: '☁️',
    deezer: '🎧',
    tidal: '🌊',
    amazon: '📦'
  };
  return icons[platform.toLowerCase()] || '🔗';
}
