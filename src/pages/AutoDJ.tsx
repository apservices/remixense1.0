import { MainLayout } from '@/components/MainLayout';
import { AutoDJPanel } from '@/components/dj/AutoDJPanel';
import { SmartRecommendations } from '@/components/SmartRecommendations';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Disc3, Sparkles, Zap, Music } from 'lucide-react';

export default function AutoDJ() {
  return (
    <MainLayout>
      <div className="min-h-screen pb-20">
        {/* Header */}
        <div className="sticky top-0 z-40 glass border-b border-glass-border backdrop-blur-glass">
          <div className="px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-heading-xl text-foreground mb-1 flex items-center gap-2">
                  <Disc3 className="h-8 w-8 text-primary" />
                  Auto-DJ
                </h1>
                <p className="text-muted-foreground text-sm">
                  Mixagem automática inteligente com análise de BPM, Key e energia
                </p>
              </div>
              <Badge variant="default" className="bg-primary/20 text-primary border-primary/30">
                <Zap className="h-3 w-3 mr-1" />
                IA Ativa
              </Badge>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-6 space-y-6">
          {/* Features info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="glass glass-border p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Music className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">BPM Sync</div>
                  <div className="text-xs text-muted-foreground">Sincroniza automaticamente</div>
                </div>
              </div>
            </Card>
            
            <Card className="glass glass-border p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Key Match</div>
                  <div className="text-xs text-muted-foreground">Harmonia automática</div>
                </div>
              </div>
            </Card>
            
            <Card className="glass glass-border p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Smart Transitions</div>
                  <div className="text-xs text-muted-foreground">Crossfade inteligente</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Main DJ Panel */}
          <AutoDJPanel />

          {/* AI Recommendations */}
          <SmartRecommendations maxRecommendations={5} />

          {/* Tips */}
          <Card className="glass glass-border p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div className="text-sm text-muted-foreground">
                <strong className="text-foreground">Dicas para melhores mixes:</strong>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Selecione faixas com BPM similar (±10 BPM) para transições suaves</li>
                  <li>Use o Vault para re-analisar faixas que não têm BPM/Key detectado</li>
                  <li>Faixas com energia similar criam um flow mais consistente</li>
                  <li>O Auto-DJ ordena automaticamente para melhor compatibilidade harmônica</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
