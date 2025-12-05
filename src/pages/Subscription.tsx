import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSubscription } from '@/hooks/useSubscription';
import { usePlanGate, PLAN_LIMITS } from '@/hooks/usePlanGate';
import { useToast } from '@/hooks/use-toast';
import { 
  Crown, 
  Zap, 
  Check, 
  X, 
  CreditCard,
  ArrowUpRight,
  Calendar,
  TrendingUp,
  Sparkles,
  Music,
  Layers,
  Store,
  Download,
  Users,
  Headphones,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const PLAN_DETAILS = {
  free: {
    name: 'Free',
    price: 'R$ 0',
    period: '/mês',
    icon: Music,
    color: 'from-slate-500 to-slate-600',
    features: [
      { name: 'Stems por mês', value: '1', icon: Layers },
      { name: 'Gerações Suno', value: '3', icon: Sparkles },
      { name: 'Armazenamento', value: '100 MB', icon: Download },
      { name: 'Tracks máx.', value: '10', icon: Music },
    ],
    excluded: ['Exportação HD', 'Marketplace Vendedor', 'Colaboração', 'Suporte Prioritário'],
  },
  pro: {
    name: 'Pro',
    price: 'R$ 29,90',
    period: '/mês',
    icon: Zap,
    color: 'from-violet-500 to-purple-600',
    features: [
      { name: 'Stems por mês', value: '10', icon: Layers },
      { name: 'Gerações Suno', value: '30', icon: Sparkles },
      { name: 'Armazenamento', value: '2 GB', icon: Download },
      { name: 'Tracks máx.', value: '100', icon: Music },
    ],
    included: ['Exportação HD', 'Colaboração', 'Suporte Prioritário'],
    excluded: ['Marketplace Vendedor'],
  },
  expert: {
    name: 'Expert',
    price: 'R$ 79,90',
    period: '/mês',
    icon: Crown,
    color: 'from-amber-500 to-orange-600',
    features: [
      { name: 'Stems por mês', value: 'Ilimitado', icon: Layers },
      { name: 'Gerações Suno', value: 'Ilimitado', icon: Sparkles },
      { name: 'Armazenamento', value: '10 GB', icon: Download },
      { name: 'Tracks máx.', value: 'Ilimitado', icon: Music },
    ],
    included: ['Exportação HD', 'Marketplace Vendedor', 'Colaboração', 'Suporte Prioritário'],
    excluded: [],
  },
};

export default function Subscription() {
  const { subscription, loading, createCheckoutSession, openCustomerPortal } = useSubscription();
  const { currentPlan, limits, isUnlimited } = usePlanGate();
  const { toast } = useToast();
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [openingPortal, setOpeningPortal] = useState(false);

  const planDetails = PLAN_DETAILS[currentPlan as keyof typeof PLAN_DETAILS] || PLAN_DETAILS.free;
  const PlanIcon = planDetails.icon;

  const handleUpgrade = async (plan: 'pro' | 'expert') => {
    setUpgrading(plan);
    try {
      await createCheckoutSession(plan);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível iniciar o checkout. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setUpgrading(null);
    }
  };

  const handleManageSubscription = async () => {
    setOpeningPortal(true);
    try {
      await openCustomerPortal();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível abrir o portal. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setOpeningPortal(false);
    }
  };

  // Mock usage data (in production, fetch from database)
  const usage = {
    stems: 0,
    suno: 1,
    storage: 25, // MB
    tracks: 3,
  };

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0; // unlimited
    return Math.min((current / limit) * 100, 100);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="container max-w-4xl mx-auto py-8 px-4">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container max-w-4xl mx-auto py-6 px-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Meu Plano</h1>
            <p className="text-muted-foreground">Gerencie sua assinatura e uso</p>
          </div>
          {currentPlan !== 'free' && (
            <Button 
              variant="outline" 
              onClick={handleManageSubscription}
              disabled={openingPortal}
            >
              {openingPortal ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <ExternalLink className="h-4 w-4 mr-2" />
              )}
              Portal Stripe
            </Button>
          )}
        </div>

        {/* Current Plan Card */}
        <Card className="overflow-hidden">
          <div className={`bg-gradient-to-r ${planDetails.color} p-6 text-white`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <PlanIcon className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Plano {planDetails.name}</h2>
                  <p className="text-white/80">
                    {planDetails.price}{planDetails.period}
                  </p>
                </div>
              </div>
              <Badge className="bg-white/20 text-white border-white/30">
                {subscription?.status === 'active' ? 'Ativo' : 'Ativo'}
              </Badge>
            </div>
            
            {subscription?.current_period_end && (
              <div className="mt-4 pt-4 border-t border-white/20 flex items-center gap-2 text-sm text-white/80">
                <Calendar className="h-4 w-4" />
                Próxima cobrança: {format(new Date(subscription.current_period_end), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </div>
            )}
          </div>

          {/* Usage Stats */}
          <div className="p-6 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Uso do mês
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Stems Usage */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-muted-foreground" />
                    Stems
                  </span>
                  <span className="font-medium">
                    {usage.stems} / {isUnlimited('stems') ? '∞' : limits.stems_per_month}
                  </span>
                </div>
                <Progress 
                  value={getUsagePercentage(usage.stems, limits.stems_per_month)} 
                  className="h-2"
                />
              </div>

              {/* Suno Usage */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-muted-foreground" />
                    Gerações Suno
                  </span>
                  <span className="font-medium">
                    {usage.suno} / {isUnlimited('suno') ? '∞' : limits.suno_per_month}
                  </span>
                </div>
                <Progress 
                  value={getUsagePercentage(usage.suno, limits.suno_per_month)} 
                  className="h-2"
                />
              </div>

              {/* Storage Usage */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Download className="h-4 w-4 text-muted-foreground" />
                    Armazenamento
                  </span>
                  <span className="font-medium">
                    {usage.storage} MB / {limits.storage_mb} MB
                  </span>
                </div>
                <Progress 
                  value={getUsagePercentage(usage.storage, limits.storage_mb)} 
                  className="h-2"
                />
              </div>

              {/* Tracks Usage */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Music className="h-4 w-4 text-muted-foreground" />
                    Tracks
                  </span>
                  <span className="font-medium">
                    {usage.tracks} / {isUnlimited('tracks') ? '∞' : limits.max_tracks}
                  </span>
                </div>
                <Progress 
                  value={getUsagePercentage(usage.tracks, limits.max_tracks)} 
                  className="h-2"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Features Included/Excluded */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Recursos do seu plano</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: 'Exportação HD', key: 'export_hd', icon: Download },
              { name: 'Marketplace', key: 'marketplace_seller', icon: Store },
              { name: 'Colaboração', key: 'collaboration', icon: Users },
              { name: 'Suporte VIP', key: 'priority_support', icon: Headphones },
            ].map((feature) => {
              const hasAccess = limits[feature.key as keyof typeof limits];
              const Icon = feature.icon;
              return (
                <div 
                  key={feature.key}
                  className={`p-3 rounded-lg border ${hasAccess ? 'bg-primary/5 border-primary/20' : 'bg-muted/50 border-border'}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`h-4 w-4 ${hasAccess ? 'text-primary' : 'text-muted-foreground'}`} />
                    {hasAccess ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <p className={`text-sm ${hasAccess ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {feature.name}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Upgrade Options */}
        {currentPlan !== 'expert' && (
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-primary" />
              Fazer upgrade
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentPlan === 'free' && (
                <Card 
                  className="p-4 border-violet-500/30 bg-violet-500/5 cursor-pointer hover:bg-violet-500/10 transition-colors"
                  onClick={() => handleUpgrade('pro')}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
                        <Zap className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Pro</h4>
                        <p className="text-sm text-muted-foreground">R$ 29,90/mês</p>
                      </div>
                    </div>
                    <Badge variant="secondary">Recomendado</Badge>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 10 stems/mês</li>
                    <li>• 30 gerações Suno</li>
                    <li>• 2 GB de armazenamento</li>
                  </ul>
                  <Button 
                    className="w-full mt-4" 
                    disabled={upgrading === 'pro'}
                  >
                    {upgrading === 'pro' ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Assinar Pro
                  </Button>
                </Card>
              )}
              
              <Card 
                className="p-4 border-amber-500/30 bg-amber-500/5 cursor-pointer hover:bg-amber-500/10 transition-colors"
                onClick={() => handleUpgrade('expert')}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
                      <Crown className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Expert</h4>
                      <p className="text-sm text-muted-foreground">R$ 79,90/mês</p>
                    </div>
                  </div>
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">Premium</Badge>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Stems ilimitados</li>
                  <li>• Suno ilimitado</li>
                  <li>• 10 GB de armazenamento</li>
                  <li>• Vender no Marketplace</li>
                </ul>
                <Button 
                  className="w-full mt-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700" 
                  disabled={upgrading === 'expert'}
                >
                  {upgrading === 'expert' ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Assinar Expert
                </Button>
              </Card>
            </div>
          </Card>
        )}

        {/* Billing History Link */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Precisa de ajuda? Entre em contato com{' '}
            <a href="mailto:suporte@remixense.com" className="text-primary hover:underline">
              suporte@remixense.com
            </a>
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
