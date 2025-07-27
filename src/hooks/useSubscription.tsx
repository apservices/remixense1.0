import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionLimits {
  max_tracks: number;
  max_storage_mb: number;
  can_export: boolean;
  can_use_community: boolean;
  can_use_marketplace: boolean;
  marketplace_commission_rate: number;
}

interface SubscriptionData {
  plan_type: 'free' | 'pro' | 'expert';
  status: 'active' | 'inactive' | 'canceled' | 'past_due';
  current_period_end?: string;
  limits: SubscriptionLimits;
}

export function useSubscription() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkSubscription();
    } else {
      setSubscription(null);
      setLoading(false);
    }
  }, [user]);

  const checkSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Error checking subscription:', error);
        toast({
          title: "Erro ao verificar assinatura",
          description: error.message,
          variant: "destructive",
        });
        // Set free plan as fallback
        setSubscription({
          plan_type: 'free',
          status: 'active',
          limits: {
            max_tracks: 3,
            max_storage_mb: 100,
            can_export: false,
            can_use_community: false,
            can_use_marketplace: false,
            marketplace_commission_rate: 50
          }
        });
      } else {
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      // Set free plan as fallback
      setSubscription({
        plan_type: 'free',
        status: 'active',
        limits: {
          max_tracks: 3,
          max_storage_mb: 100,
          can_export: false,
          can_use_community: false,
          can_use_marketplace: false,
          marketplace_commission_rate: 50
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const createCheckoutSession = async (plan: 'pro' | 'expert', locale = 'en') => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para assinar um plano.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan, locale }
      });

      if (error) {
        throw error;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Erro ao processar pagamento",
        description: error.message || "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    }
  };

  const openCustomerPortal = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) {
        throw error;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Erro ao abrir portal",
        description: error.message || "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    }
  };

  const canUploadTrack = () => {
    if (!subscription) return false;
    
    // This would need to be implemented with actual track count
    // For now, just check the plan limits
    return subscription.limits.max_tracks === -1 || subscription.limits.max_tracks > 0;
  };

  const getTrackLimit = () => {
    return subscription?.limits.max_tracks || 3;
  };

  const canExport = () => {
    return subscription?.limits.can_export || false;
  };

  const canUseCommunity = () => {
    return subscription?.limits.can_use_community || false;
  };

  const canUseMarketplace = () => {
    return subscription?.limits.can_use_marketplace || false;
  };

  const getCommissionRate = () => {
    return subscription?.limits.marketplace_commission_rate || 50;
  };

  return {
    subscription,
    loading,
    checkSubscription,
    createCheckoutSession,
    openCustomerPortal,
    canUploadTrack,
    getTrackLimit,
    canExport,
    canUseCommunity,
    canUseMarketplace,
    getCommissionRate,
    isPro: subscription?.plan_type === 'pro',
    isExpert: subscription?.plan_type === 'expert',
    isFree: subscription?.plan_type === 'free',
  };
}