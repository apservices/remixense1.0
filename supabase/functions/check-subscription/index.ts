import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // STEP 1: Check if user already has an active subscription in database
    const { data: existingSubscription } = await supabaseClient
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (existingSubscription && existingSubscription.plan_type !== 'free') {
      logStep("Found existing active subscription in database", { 
        planType: existingSubscription.plan_type,
        status: existingSubscription.status 
      });

      // Get limits for this plan
      const { data: limits } = await supabaseClient
        .from('subscription_limits')
        .select('*')
        .eq('plan_type', existingSubscription.plan_type)
        .single();

      return new Response(JSON.stringify({
        plan_type: existingSubscription.plan_type,
        status: existingSubscription.status,
        current_period_end: existingSubscription.current_period_end,
        limits: limits || getDefaultLimits(existingSubscription.plan_type)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // STEP 2: Check expert test users list (includes admins and test accounts)
    const expertTestEmails = new Set([
      'expert1@remixense.com',
      'expert2@remixense.com',
      'expert3@remixense.com',
      'expert4@remixense.com',
      'expert5@remixense.com',
      'thiagodecamargo@hotmail.com', // Admin user
    ].map(e => e.toLowerCase()));

    if (expertTestEmails.has(user.email.toLowerCase())) {
      logStep("User is in expert list", { email: user.email });
      
      await supabaseClient.from('subscriptions').upsert({
        user_id: user.id,
        email: user.email,
        plan_type: 'expert',
        status: 'active',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

      const { data: limits } = await supabaseClient
        .from('subscription_limits')
        .select('*')
        .eq('plan_type', 'expert')
        .single();

      return new Response(JSON.stringify({
        plan_type: 'expert',
        status: 'active',
        limits: limits || {
          max_tracks: 9999,
          max_storage_mb: 102400,
          can_export: true,
          can_use_community: true,
          can_use_marketplace: true
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // STEP 3: Check if user is admin
    const { data: adminCheck } = await supabaseClient
      .from('admin_users')
      .select('id')
      .eq('email', user.email.toLowerCase())
      .single();

    if (adminCheck) {
      logStep("User is admin, granting expert access", { email: user.email });
      
      await supabaseClient.from('subscriptions').upsert({
        user_id: user.id,
        email: user.email,
        plan_type: 'expert',
        status: 'active',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

      return new Response(JSON.stringify({
        plan_type: 'expert',
        status: 'active',
        limits: {
          max_tracks: 9999,
          max_storage_mb: 102400,
          can_export: true,
          can_use_community: true,
          can_use_marketplace: true
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // STEP 4: Check Stripe for subscription
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || Deno.env.get("STRIPE_SECRET") || Deno.env.get("STRIPE_API_KEY");
    if (!stripeKey) {
      logStep("Stripe key missing - returning FREE plan");
      return returnFreePlan(supabaseClient, user);
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Find customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No Stripe customer found, setting free plan");
      return returnFreePlan(supabaseClient, user);
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    let planType = "free";
    let status = "active";
    let subscriptionEnd = null;
    let stripeSubscriptionId = null;

    if (subscriptions.data.length > 0) {
      const subscription = subscriptions.data[0];
      stripeSubscriptionId = subscription.id;
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      
      // Determine plan from price amount
      const price = subscription.items.data[0].price;
      const amount = price.unit_amount || 0;
      
      if (amount >= 4000) {
        planType = "expert";
      } else if (amount >= 400) {
        planType = "pro";
      }
      
      logStep("Active Stripe subscription found", { 
        subscriptionId: subscription.id, 
        planType, 
        endDate: subscriptionEnd 
      });
    } else {
      logStep("No active Stripe subscription found");
    }

    // Update subscription in database
    await supabaseClient.from("subscriptions").upsert({
      user_id: user.id,
      email: user.email,
      stripe_customer_id: customerId,
      stripe_subscription_id: stripeSubscriptionId,
      plan_type: planType,
      status: status,
      current_period_end: subscriptionEnd,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    // Get subscription limits
    const { data: limits } = await supabaseClient
      .from("subscription_limits")
      .select("*")
      .eq("plan_type", planType)
      .single();

    logStep("Subscription updated", { planType, status, limits });

    return new Response(JSON.stringify({
      plan_type: planType,
      status: status,
      current_period_end: subscriptionEnd,
      limits: limits || getDefaultLimits(planType)
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

function getDefaultLimits(planType: string) {
  switch (planType) {
    case 'expert':
      return {
        max_tracks: 9999,
        max_storage_mb: 102400,
        can_export: true,
        can_use_community: true,
        can_use_marketplace: true
      };
    case 'pro':
      return {
        max_tracks: 100,
        max_storage_mb: 10240,
        can_export: true,
        can_use_community: true,
        can_use_marketplace: true
      };
    case 'premium':
      return {
        max_tracks: 50,
        max_storage_mb: 5120,
        can_export: true,
        can_use_community: true,
        can_use_marketplace: false
      };
    default:
      return {
        max_tracks: 3,
        max_storage_mb: 100,
        can_export: false,
        can_use_community: false,
        can_use_marketplace: false
      };
  }
}

async function returnFreePlan(supabaseClient: any, user: any) {
  try {
    await supabaseClient.from("subscriptions").upsert({
      user_id: user.id,
      email: user.email,
      plan_type: "free",
      status: "active",
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
  } catch (_) { /* noop */ }

  return new Response(JSON.stringify({ 
    plan_type: "free", 
    status: "active",
    limits: {
      max_tracks: 3,
      max_storage_mb: 100,
      can_export: false,
      can_use_community: false,
      can_use_marketplace: false
    }
  }), {
    headers: { 
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Content-Type": "application/json" 
    },
    status: 200,
  });
}
