import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
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

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { plan, locale = 'en' } = await req.json();
    if (!plan || !['pro', 'expert'].includes(plan)) {
      throw new Error("Invalid plan specified. Must be 'pro' or 'expert'");
    }
    logStep("Plan validated", { plan, locale });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id }
      });
      customerId = customer.id;
      logStep("New customer created", { customerId });
    }

    // Define prices by plan and locale
    const priceConfigs = {
      pro: {
        'pt': { amount: 1990, currency: 'brl' }, // R$ 19,90
        'en': { amount: 490, currency: 'usd' },  // $4.90
        'es': { amount: 450, currency: 'eur' },  // €4.50
      },
      expert: {
        'pt': { amount: 4990, currency: 'brl' }, // R$ 49,90
        'en': { amount: 990, currency: 'usd' },  // $9.90
        'es': { amount: 900, currency: 'eur' },  // €9.00
      }
    };

    const localeKey = locale.startsWith('pt') ? 'pt' : locale.startsWith('es') ? 'es' : 'en';
    const priceConfig = priceConfigs[plan as keyof typeof priceConfigs][localeKey as keyof typeof priceConfigs.pro];
    logStep("Price configuration", { plan, locale: localeKey, priceConfig });

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: priceConfig.currency,
            product_data: {
              name: `RemiXense ${plan.toUpperCase()}`,
              description: plan === 'pro' 
                ? 'Unlimited uploads, export capabilities, community access'
                : 'Premium plan with enhanced storage, full community, marketplace'
            },
            unit_amount: priceConfig.amount,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/pricing`,
      metadata: {
        user_id: user.id,
        plan: plan
      }
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});