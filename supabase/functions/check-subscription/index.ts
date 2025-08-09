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

    // Override for expert test users (no Stripe needed)
    const expertTestEmails = new Set([
      'expert1@remixense.com',
      'expert2@remixense.com',
      'expert3@remixense.com',
      'expert4@remixense.com',
      'expert5@remixense.com',
    ].map(e => e.toLowerCase()));

    if (expertTestEmails.has(user.email.toLowerCase())) {
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

    // Stripe key (optional in dev). If missing, return FREE plan gracefully (Sprint 1 mock).
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || Deno.env.get("STRIPE_SECRET") || Deno.env.get("STRIPE_API_KEY");
    if (!stripeKey) {
      logStep("Stripe key missing - returning FREE plan");
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
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Find customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, setting free plan");
      await supabaseClient.from("subscriptions").upsert({
        user_id: user.id,
        email: user.email,
        plan_type: "free",
        status: "active",
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

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
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found customer", { customerId });

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
      
      if (amount >= 4000) { // Expert tier (higher amounts)
        planType = "expert";
      } else if (amount >= 400) { // Pro tier
        planType = "pro";
      }
      
      logStep("Active subscription found", { 
        subscriptionId: subscription.id, 
        planType, 
        endDate: subscriptionEnd 
      });
    } else {
      logStep("No active subscription found");
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
      limits: limits || {
        max_tracks: 3,
        max_storage_mb: 100,
        can_export: false,
        can_use_community: false,
        can_use_marketplace: false
      }
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