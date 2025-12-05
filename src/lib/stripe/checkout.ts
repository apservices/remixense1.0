import { supabase } from "@/integrations/supabase/client";

export type PlanType = 'free' | 'premium' | 'pro';

export interface CheckoutOptions {
  planType: PlanType;
  successUrl?: string;
  cancelUrl?: string;
}

export async function createCheckoutSession(options: CheckoutOptions): Promise<string> {
  const { planType, successUrl = window.location.origin + '/settings?tab=subscription', cancelUrl = window.location.origin + '/pricing' } = options;

  const { data, error } = await supabase.functions.invoke('create-checkout', {
    body: {
      planType,
      successUrl,
      cancelUrl
    }
  });

  if (error) {
    throw new Error(`Checkout failed: ${error.message}`);
  }

  return data.url;
}

export async function openCustomerPortal(): Promise<string> {
  const { data, error } = await supabase.functions.invoke('customer-portal', {
    body: {
      returnUrl: window.location.origin + '/settings?tab=subscription'
    }
  });

  if (error) {
    throw new Error(`Portal access failed: ${error.message}`);
  }

  return data.url;
}

export function getPlanFeatures(plan: PlanType) {
  const features = {
    free: {
      maxTracks: 10,
      maxStorage: 500, // MB
      analysisPerDay: 5,
      stemsEnabled: false,
      exportHD: false,
      marketplace: false,
      collaboration: false,
      prioritySupport: false
    },
    premium: {
      maxTracks: 100,
      maxStorage: 5000, // MB
      analysisPerDay: 50,
      stemsEnabled: true,
      exportHD: true,
      marketplace: false,
      collaboration: true,
      prioritySupport: true
    },
    pro: {
      maxTracks: -1, // unlimited
      maxStorage: 50000, // MB
      analysisPerDay: -1, // unlimited
      stemsEnabled: true,
      exportHD: true,
      marketplace: true,
      collaboration: true,
      prioritySupport: true
    }
  };

  return features[plan];
}
