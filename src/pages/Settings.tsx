import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, CreditCard, Link2, Shield, Sparkles, Activity } from "lucide-react";
import { ProfileForm, SubscriptionCard, ConnectedApps, SecurityPreferences } from '@/features/settings';
import { V3FeaturesPanel } from '@/components/features/V3FeaturesPanel';
import { AudioHealthMonitor } from '@/components/AudioHealthMonitor';
import { useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';

export default function Settings() {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'profile';

  return (
    <AppLayout>
      <div className="container max-w-4xl py-6 px-4 space-y-6">
        <div>
          <h1 className="text-2xl font-bold gradient-text">
            Configurações
          </h1>
          <p className="text-muted-foreground">
            Gerencie sua conta e preferências
          </p>
        </div>

        <Tabs defaultValue={defaultTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-flex glass glass-border">
            <TabsTrigger value="profile" className="gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="subscription" className="gap-2">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Assinatura</span>
            </TabsTrigger>
            <TabsTrigger value="apps" className="gap-2">
              <Link2 className="w-4 h-4" />
              <span className="hidden sm:inline">Apps</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Segurança</span>
            </TabsTrigger>
            <TabsTrigger value="audio" className="gap-2">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Áudio</span>
            </TabsTrigger>
            <TabsTrigger value="features" className="gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">V3</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileForm />
          </TabsContent>

          <TabsContent value="subscription">
            <SubscriptionCard />
          </TabsContent>

          <TabsContent value="apps">
            <ConnectedApps />
          </TabsContent>

          <TabsContent value="security">
            <SecurityPreferences />
          </TabsContent>

          <TabsContent value="audio">
            <AudioHealthMonitor />
          </TabsContent>

          <TabsContent value="features">
            <V3FeaturesPanel />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
