import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-seed-token",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const seedToken = req.headers.get('x-seed-token');
  const expected = Deno.env.get('SEED_TEST_USERS_TOKEN');
  if (!expected) {
    return new Response(JSON.stringify({ error: 'Missing SEED_TEST_USERS_TOKEN secret' }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
  if (seedToken !== expected) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 401,
    });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false } }
  );

  try {
    const users = [
      { email: 'testefree@remixense.com', password: 'Remixense123!', plan: 'free' },
      { email: 'testepremium@remixense.com', password: 'Remixense123!', plan: 'premium' },
      { email: 'testepro@remixense.com', password: 'Remixense123!', plan: 'pro' },
    ] as const;

    const results: Array<Record<string, unknown>> = [];

    for (const u of users) {
      const { data, error } = await supabase.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { seeded: true }
      });

      if (error) {
        const msg = String(error.message || error).toLowerCase();
        if (msg.includes('already') || msg.includes('exists')) {
          // Fetch user to get id
          const { data: existing, error: fetchErr } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
          const found = existing?.users?.find(us => us.email?.toLowerCase() === u.email.toLowerCase());
          if (fetchErr) {
            results.push({ email: u.email, status: 'exists', warn: fetchErr.message });
          } else {
            if (found?.id) {
              const mappedPlan = u.plan === 'premium' ? 'pro' : (u.plan === 'pro' ? 'expert' : 'free');
              await supabase.from('profiles').upsert({ id: found.id, username: u.email.split('@')[0], subscription_plan: mappedPlan });
              // Seed test subscription (simulated) - ignore errors
              const now = new Date();
              const end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
              try {
                await supabase.from('subscriptions').upsert({
                  user_id: found.id,
                  status: 'active',
                  current_period_start: now.toISOString(),
                  current_period_end: end.toISOString(),
                  stripe_customer_id: `sim_${found.id}`,
                  stripe_subscription_id: `sim_sub_${found.id}`,
                  plan_id: mappedPlan
                });
              } catch {
                // Ignore subscription errors
              }
            }
            results.push({ email: u.email, status: 'exists' });
          }
        } else {
          results.push({ email: u.email, status: 'error', error: error.message });
        }
      } else {
        const userId = data?.user?.id ?? null;
        if (userId) {
          const mappedPlan = u.plan === 'premium' ? 'pro' : (u.plan === 'pro' ? 'expert' : 'free');
          await supabase.from('profiles').upsert({ id: userId, username: u.email.split('@')[0], subscription_plan: mappedPlan });
          // Seed test subscription (simulated) - ignore errors
          const now = new Date();
          const end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          try {
            await supabase.from('subscriptions').upsert({
              user_id: userId,
              status: 'active',
              current_period_start: now.toISOString(),
              current_period_end: end.toISOString(),
              stripe_customer_id: `sim_${userId}`,
              stripe_subscription_id: `sim_sub_${userId}`,
              plan_id: mappedPlan
            });
          } catch {
            // Ignore subscription errors
          }
        }
        results.push({ email: u.email, status: 'created', id: userId });
      }
    }

    return new Response(JSON.stringify({ ok: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
