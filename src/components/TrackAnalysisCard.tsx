import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Music, 
  Gauge, 
  Key, 
  Zap, 
  Heart, 
  Play,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Track {
  id: string;
  title: string;
  artist: string;
  bpm?: number;
  key_signature?: string;
  energy_level?: number;
  genre?: string;
  duration?: string;
  file_path?: string;
}

interface TrackAnalysisCardProps {
  track: Track;
  onAnalysisComplete?: () => void;
}

export function TrackAnalysisCard({ track, onAnalysisComplete }: TrackAnalysisCardProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const hasAnalysis = track.bpm && track.key_signature;
  
  const handleReanalyze = async () => {
    if (!track.file_path) {
      toast({
        title: "Erro",
        description: "Arquivo de áudio não encontrado",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { error } = await supabase.functions.invoke('analyze-audio', {
        body: { trackId: track.id, filePath: track.file_path }
      });

      if (error) throw error;

      toast({
        title: "Análise iniciada!",
        description: "Os resultados estarão disponíveis em instantes"
      });

      onAnalysisComplete?.();
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Erro na análise",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getEnergyColor = (energy: number) => {
    if (energy >= 80) return 'text-rose-500';
    if (energy >= 60) return 'text-orange-500';
    if (energy >= 40) return 'text-yellow-500';
    return 'text-emerald-500';
  };

  const getEnergyLabel = (energy: number) => {
    if (energy >= 80) return 'Alta';
    if (energy >= 60) return 'Média-Alta';
    if (energy >= 40) return 'Média';
    return 'Baixa';
  };

  return (
    <Card className="premium-card overflow-hidden">
      <div className="p-4 md:p-6">
        {/* Track Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center shrink-0">
            <Music className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg truncate">{track.title}</h3>
            <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
            {track.duration && (
              <p className="text-xs text-muted-foreground mt-1">{track.duration}</p>
            )}
          </div>
          {hasAnalysis && (
            <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30">
              Analisado
            </Badge>
          )}
        </div>

        {/* Analysis Results */}
        {hasAnalysis ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* BPM */}
              <div className="p-3 rounded-xl bg-muted/30">
                <div className="flex items-center gap-2 mb-1">
                  <Gauge className="h-4 w-4 text-cyan-500" />
                  <span className="text-xs text-muted-foreground">BPM</span>
                </div>
                <p className="text-2xl font-bold">{track.bpm}</p>
              </div>

              {/* Key */}
              <div className="p-3 rounded-xl bg-muted/30">
                <div className="flex items-center gap-2 mb-1">
                  <Key className="h-4 w-4 text-violet-500" />
                  <span className="text-xs text-muted-foreground">Tom</span>
                </div>
                <p className="text-2xl font-bold">{track.key_signature}</p>
              </div>

              {/* Energy */}
              <div className="p-3 rounded-xl bg-muted/30">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className={`h-4 w-4 ${getEnergyColor(track.energy_level || 50)}`} />
                  <span className="text-xs text-muted-foreground">Energia</span>
                </div>
                <p className="text-2xl font-bold">{track.energy_level || 50}%</p>
                <p className="text-xs text-muted-foreground">{getEnergyLabel(track.energy_level || 50)}</p>
              </div>

              {/* Genre */}
              <div className="p-3 rounded-xl bg-muted/30">
                <div className="flex items-center gap-2 mb-1">
                  <Heart className="h-4 w-4 text-pink-500" />
                  <span className="text-xs text-muted-foreground">Gênero</span>
                </div>
                <p className="text-lg font-bold truncate">{track.genre || 'Detectando...'}</p>
              </div>
            </div>

            {/* Energy Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Nível de Energia</span>
                <span className={`font-medium ${getEnergyColor(track.energy_level || 50)}`}>
                  {track.energy_level || 50}%
                </span>
              </div>
              <Progress 
                value={track.energy_level || 50} 
                className="h-2"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={handleReanalyze} disabled={isAnalyzing}>
                {isAnalyzing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Reanalisar
              </Button>
            </div>
          </div>
        ) : (
          /* No Analysis Yet */
          <div className="text-center py-6">
            <div className="inline-flex p-3 rounded-full bg-muted/30 mb-3">
              <Gauge className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Esta música ainda não foi analisada
            </p>
            <Button onClick={handleReanalyze} disabled={isAnalyzing}>
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Analisar Agora
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
