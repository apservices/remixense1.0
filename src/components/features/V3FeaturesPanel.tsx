import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
  Globe, 
  Palette, 
  Mic, 
  Waves, 
  Share2, 
  Bell,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDynamicTheme } from '@/hooks/useDynamicTheme';
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';
import { useState } from 'react';

export function V3FeaturesPanel() {
  const { language, setLanguage } = useLanguage();
  const { isActive: themeActive, toggleActive: toggleTheme } = useDynamicTheme();
  const { resetOnboarding } = useOnboardingStatus();
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const features = [
    {
      id: 'language',
      icon: Globe,
      title: 'Idioma',
      description: 'Escolha o idioma da interface',
      control: (
        <select 
          value={language}
          onChange={(e) => setLanguage(e.target.value as 'pt-BR' | 'en-US' | 'es-ES')}
          className="bg-muted rounded-lg px-3 py-1.5 text-sm border border-border"
        >
          <option value="pt-BR">Português</option>
          <option value="en-US">English</option>
          <option value="es-ES">Español</option>
        </select>
      ),
    },
    {
      id: 'theme',
      icon: Palette,
      title: 'Tema Dinâmico',
      description: 'Cores mudam com o BPM da música',
      control: (
        <Switch 
          checked={themeActive} 
          onCheckedChange={toggleTheme}
        />
      ),
    },
    {
      id: 'voice',
      icon: Mic,
      title: 'Comandos de Voz',
      description: 'Controle por voz (experimental)',
      control: (
        <Switch 
          checked={voiceEnabled} 
          onCheckedChange={setVoiceEnabled}
        />
      ),
    },
    {
      id: 'notifications',
      icon: Bell,
      title: 'Notificações',
      description: 'Receba alertas de atividades',
      control: (
        <Switch 
          checked={notificationsEnabled} 
          onCheckedChange={setNotificationsEnabled}
        />
      ),
    },
  ];

  return (
    <Card className="glass glass-border p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg gradient-primary">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold">Recursos V3</h3>
          <p className="text-sm text-muted-foreground">
            Funcionalidades experimentais e personalizações
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div 
              key={feature.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label className="font-medium">{feature.title}</Label>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </div>
              {feature.control}
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t border-border space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">Outros</h4>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={resetOnboarding}
          className="w-full justify-start"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Rever tutorial de boas-vindas
        </Button>
      </div>
    </Card>
  );
}
