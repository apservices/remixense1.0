import { useCallback, useMemo } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';

type PlanType = 'free' | 'pro' | 'expert';
type Feature = 'stems' | 'suno' | 'marketplace_seller' | 'export_hd' | 'unlimited_tracks' | 'collaboration' | 'priority_support';

interface PlanLimits {
  stems_per_month: number;
  suno_per_month: number;
  marketplace_seller: boolean;
  export_hd: boolean;
  storage_mb: number;
  max_tracks: number;
  collaboration: boolean;
  priority_support: boolean;
}

const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    stems_per_month: 1,
    suno_per_month: 3,
    marketplace_seller: false,
    export_hd: false,
    storage_mb: 100,
    max_tracks: 10,
    collaboration: false,
    priority_support: false,
  },
  pro: {
    stems_per_month: 10,
    suno_per_month: 30,
    marketplace_seller: true,
    export_hd: true,
    storage_mb: 2048,
    max_tracks: 100,
    collaboration: true,
    priority_support: true,
  },
  expert: {
    stems_per_month: -1, // unlimited
    suno_per_month: -1, // unlimited
    marketplace_seller: true,
    export_hd: true,
    storage_mb: 10240,
    max_tracks: -1, // unlimited
    collaboration: true,
    priority_support: true,
  },
};

interface UsePlanGateReturn {
  canAccess: boolean;
  currentPlan: PlanType;
  limits: PlanLimits;
  showUpgradePrompt: (feature: Feature) => void;
  checkFeatureAccess: (feature: Feature) => boolean;
  checkUsageLimit: (feature: 'stems' | 'suno', currentUsage: number) => boolean;
  getFeatureLimit: (feature: keyof PlanLimits) => number | boolean;
  isUnlimited: (feature: 'stems' | 'suno' | 'tracks') => boolean;
}

export function usePlanGate(): UsePlanGateReturn {
  const { subscription, loading } = useSubscription();
  const { toast } = useToast();

  const currentPlan = useMemo((): PlanType => {
    if (loading || !subscription) return 'free';
    const plan = subscription.plan_type?.toLowerCase() as PlanType;
    return ['free', 'pro', 'expert'].includes(plan) ? plan : 'free';
  }, [subscription, loading]);

  const limits = useMemo(() => PLAN_LIMITS[currentPlan], [currentPlan]);

  const showUpgradePrompt = useCallback((feature: Feature) => {
    const featureNames: Record<Feature, string> = {
      stems: 'Separação de Stems',
      suno: 'Geração Suno AI',
      marketplace_seller: 'Vender no Marketplace',
      export_hd: 'Exportação HD',
      unlimited_tracks: 'Tracks ilimitados',
      collaboration: 'Colaboração',
      priority_support: 'Suporte prioritário',
    };

    toast({
      title: '⬆️ Faça upgrade do seu plano',
      description: `${featureNames[feature]} requer plano Pro ou Expert. Faça upgrade para desbloquear!`,
      variant: 'default',
    });
  }, [toast]);

  const checkFeatureAccess = useCallback((feature: Feature): boolean => {
    switch (feature) {
      case 'stems':
        return limits.stems_per_month !== 0;
      case 'suno':
        return limits.suno_per_month !== 0;
      case 'marketplace_seller':
        return limits.marketplace_seller;
      case 'export_hd':
        return limits.export_hd;
      case 'unlimited_tracks':
        return limits.max_tracks === -1;
      case 'collaboration':
        return limits.collaboration;
      case 'priority_support':
        return limits.priority_support;
      default:
        return false;
    }
  }, [limits]);

  const checkUsageLimit = useCallback((feature: 'stems' | 'suno', currentUsage: number): boolean => {
    const limitKey = `${feature}_per_month` as keyof PlanLimits;
    const limit = limits[limitKey] as number;
    
    // -1 means unlimited
    if (limit === -1) return true;
    
    return currentUsage < limit;
  }, [limits]);

  const getFeatureLimit = useCallback((feature: keyof PlanLimits): number | boolean => {
    return limits[feature];
  }, [limits]);

  const isUnlimited = useCallback((feature: 'stems' | 'suno' | 'tracks'): boolean => {
    switch (feature) {
      case 'stems':
        return limits.stems_per_month === -1;
      case 'suno':
        return limits.suno_per_month === -1;
      case 'tracks':
        return limits.max_tracks === -1;
      default:
        return false;
    }
  }, [limits]);

  return {
    canAccess: true, // Base access, use checkFeatureAccess for specific features
    currentPlan,
    limits,
    showUpgradePrompt,
    checkFeatureAccess,
    checkUsageLimit,
    getFeatureLimit,
    isUnlimited,
  };
}

export { PLAN_LIMITS };
export type { PlanType, Feature, PlanLimits };
