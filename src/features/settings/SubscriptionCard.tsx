import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Crown, Zap, ExternalLink, Loader2, Check, Shield } from "lucide-react";
import { openCustomerPortal, getPlanFeatures, type PlanType } from "@/lib/stripe/checkout";
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import PlanBadge from '@/components/premium/PlanBadge';

export default function SubscriptionCard() {
  const { subscription, loading } = useSubscription();
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const navigate = useNavigate();

  // Use plan_type directly from subscription, fallback to 'free'
  const planTypeRaw = subscription?.plan_type || 'free';
  // Map to valid PlanType (expert maps to premium features)
  const currentPlan: PlanType = planTypeRaw === 'expert' ? 'premium' : (planTypeRaw as PlanType);
  const isExpert = planTypeRaw === 'expert';
  const features = getPlanFeatures(currentPlan);

  const handleManageSubscription = async () => {
    if (currentPlan === 'free' && !isExpert) {
      navigate('/pricing');
      return;
    }

    setIsOpeningPortal(true);
    try {
      const url = await openCustomerPortal();
      window.location.href = url;
    } catch (error: any) {
      toast.error(`Erro ao abrir portal: ${error.message}`);
    } finally {
      setIsOpeningPortal(false);
    }
  };

  const usage = { tracks: 7, storage: 234, analysisToday: 3 };

  const getUsagePercent = (current: number, max: number) => {
    if (max === -1) return 0;
    return Math.min((current / max) * 100, 100);
  };

  // Override features for expert plan
  const displayFeatures = isExpert ? {
    maxTracks: -1, // Unlimited
    maxStorage: 102400, // 100GB
    stemsEnabled: true,
    exportHD: true,
    marketplace: true
  } : features;

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {isExpert ? (
                <Shield className="w-5 h-5 text-purple-500" />
              ) : (
                <Crown className="w-5 h-5 text-amber-500" />
              )}
              Assinatura
            </CardTitle>
            <CardDescription>Gerencie seu plano</CardDescription>
          </div>
          {isExpert ? (
            <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-semibold">
              Expert
            </div>
          ) : (
            <PlanBadge plan={currentPlan} size="lg" />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isExpert && (
          <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20">
            <p className="text-sm text-purple-300 font-medium">
              🎉 Você tem acesso completo a todas as funcionalidades!
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-sm text-muted-foreground">Tracks</p>
            <p className="text-lg font-semibold">{displayFeatures.maxTracks === -1 ? 'Ilimitado' : displayFeatures.maxTracks}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-sm text-muted-foreground">Storage</p>
            <p className="text-lg font-semibold">{displayFeatures.maxStorage >= 1000 ? `${displayFeatures.maxStorage / 1000} GB` : `${displayFeatures.maxStorage} MB`}</p>
          </div>
        </div>

        {!isExpert && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tracks</span>
                <span className="text-muted-foreground">{usage.tracks} / {displayFeatures.maxTracks === -1 ? '∞' : displayFeatures.maxTracks}</span>
              </div>
              <Progress value={getUsagePercent(usage.tracks, displayFeatures.maxTracks)} />
            </div>
          </div>
        )}

        <ul className="space-y-1">
          {[
            { label: 'Stems AI', enabled: displayFeatures.stemsEnabled },
            { label: 'Export HD', enabled: displayFeatures.exportHD },
            { label: 'Marketplace', enabled: displayFeatures.marketplace }
          ].map(({ label, enabled }) => (
            <li key={label} className="flex items-center gap-2 text-sm">
              <Check className={`w-4 h-4 ${enabled ? 'text-emerald-500' : 'text-muted-foreground'}`} />
              <span className={enabled ? '' : 'text-muted-foreground line-through'}>{label}</span>
            </li>
          ))}
        </ul>

        {!isExpert && (
          <Button className="w-full" variant={currentPlan === 'free' ? 'default' : 'outline'} onClick={handleManageSubscription} disabled={isOpeningPortal}>
            {isOpeningPortal ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : currentPlan === 'free' ? <Zap className="w-4 h-4 mr-2" /> : <ExternalLink className="w-4 h-4 mr-2" />}
            {currentPlan === 'free' ? 'Fazer Upgrade' : 'Gerenciar'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
