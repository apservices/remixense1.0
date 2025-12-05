import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wand2, 
  Layers, 
  Music2, 
  Radio, 
  ChevronRight,
  Sparkles,
  Disc,
  GitMerge
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Track {
  id: string;
  title: string;
  artist: string;
  bpm?: number;
  key_signature?: string;
  energy_level?: number;
}

interface SmartRecommendationsPanelProps {
  track: Track;
  compatibleTracks?: Track[];
}

export function SmartRecommendationsPanel({ track, compatibleTracks = [] }: SmartRecommendationsPanelProps) {
  const navigate = useNavigate();
  
  const hasAnalysis = track.bpm && track.key_signature;
  
  // Generate contextual recommendations based on track analysis
  const recommendations = [
    {
      id: 'generate-melody',
      title: 'Gerar Melodia',
      description: hasAnalysis 
        ? `Criar melodia em ${track.key_signature} • ${track.bpm} BPM`
        : 'Gerar melodia com IA',
      icon: Wand2,
      action: () => navigate('/ai-studio', { state: { tab: 'melody', bpm: track.bpm, key: track.key_signature } }),
      gradient: 'from-violet-500 to-purple-600',
      badge: 'IA'
    },
    {
      id: 'separate-stems',
      title: 'Separar Stems',
      description: track.energy_level && track.energy_level > 60 
        ? 'Faixa energética - ideal para remix!'
        : 'Isolar vocais, bateria, baixo...',
      icon: Layers,
      action: () => navigate('/studio/stems', { state: { trackId: track.id } }),
      gradient: 'from-cyan-500 to-blue-600',
      badge: 'PRO'
    },
    {
      id: 'auto-dj',
      title: 'Auto DJ',
      description: compatibleTracks.length > 0 
        ? `${compatibleTracks.length} faixas compatíveis encontradas`
        : 'Mixar automaticamente com outras faixas',
      icon: Radio,
      action: () => navigate('/dj/auto', { state: { seedTrackId: track.id } }),
      gradient: 'from-emerald-500 to-teal-600',
      badge: null
    },
    {
      id: 'create-remix',
      title: 'Criar Remix',
      description: hasAnalysis
        ? `Combinar com faixas em ${track.key_signature}`
        : 'Transformar em algo novo',
      icon: GitMerge,
      action: () => navigate('/tracks', { state: { action: 'remix', trackId: track.id } }),
      gradient: 'from-pink-500 to-rose-600',
      badge: null
    }
  ];

  return (
    <Card className="premium-card">
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-lg">Recomendações para você</h3>
          </div>
          <Badge variant="secondary" className="text-xs">
            Baseado na análise
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Com base em <span className="font-medium text-foreground">{track.title}</span>, sugerimos:
        </p>

        <div className="space-y-3">
          {recommendations.map((rec) => {
            const Icon = rec.icon;
            return (
              <div
                key={rec.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors group"
                onClick={rec.action}
              >
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${rec.gradient} shrink-0`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">{rec.title}</h4>
                    {rec.badge && (
                      <Badge variant="secondary" className="text-[10px]">{rec.badge}</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{rec.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
              </div>
            );
          })}
        </div>

        {/* Compatible Tracks Preview */}
        {compatibleTracks.length > 0 && (
          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Music2 className="h-4 w-4 text-cyan-500" />
                Faixas Compatíveis
              </h4>
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate('/dj/auto')}>
                Ver todas
              </Button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {compatibleTracks.slice(0, 4).map((t) => (
                <div 
                  key={t.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 shrink-0"
                >
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center">
                    <Disc className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate max-w-[100px]">{t.title}</p>
                    <p className="text-[10px] text-muted-foreground">{t.bpm} BPM • {t.key_signature}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
