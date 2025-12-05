import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ISRC format: CC-XXX-YY-NNNNN
// CC = Country code (BR for Brazil)
// XXX = Registrant code
// YY = Year
// NNNNN = Designation code

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

    const { releaseId, trackCount = 1 } = await req.json();

    if (!releaseId) {
      throw new Error('releaseId is required');
    }

    // Generate ISRC codes
    const year = new Date().getFullYear().toString().slice(-2);
    const registrantCode = 'RMX'; // RemiXense registrant code
    const countryCode = 'BR';

    // Get count of existing ISRCs to generate unique designation codes
    const { count } = await supabaseClient
      .from('releases')
      .select('isrc', { count: 'exact', head: true })
      .not('isrc', 'is', null);

    const baseNumber = (count || 0) + 1;
    const isrcs: string[] = [];

    for (let i = 0; i < trackCount; i++) {
      const designationCode = String(baseNumber + i).padStart(5, '0');
      const isrc = `${countryCode}-${registrantCode}-${year}-${designationCode}`;
      isrcs.push(isrc);
    }

    // Update release with first ISRC
    const { error: updateError } = await supabaseClient
      .from('releases')
      .update({ isrc: isrcs[0] })
      .eq('id', releaseId);

    if (updateError) {
      console.error('Error updating release:', updateError);
    }

    console.log(`Generated ${isrcs.length} ISRC codes for release ${releaseId}`);

    return new Response(
      JSON.stringify({
        success: true,
        isrcs,
        primaryIsrc: isrcs[0]
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('ISRC generation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
