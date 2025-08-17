import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export interface RateLimitConfig {
  maxRequests: number;
  windowMinutes: number;
  identifier: string;
  endpoint: string;
}

export async function checkRateLimit(config: RateLimitConfig): Promise<boolean> {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_identifier: config.identifier,
      p_endpoint: config.endpoint,
      p_max_requests: config.maxRequests,
      p_window_minutes: config.windowMinutes
    });

    if (error) {
      console.error('Rate limit check error:', error);
      // In case of error, allow the request but log it
      return true;
    }

    return data === true;
  } catch (error) {
    console.error('Rate limit function error:', error);
    // In case of error, allow the request but log it
    return true;
  }
}

export function getClientIP(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
         req.headers.get('x-real-ip') || 
         req.headers.get('cf-connecting-ip') || 
         'unknown';
}

export function createRateLimitResponse(): Response {
  return new Response(
    JSON.stringify({ 
      error: 'Rate limit exceeded. Please try again later.' 
    }),
    { 
      status: 429,
      headers: { 
        'Content-Type': 'application/json',
        'Retry-After': '60'
      }
    }
  );
}