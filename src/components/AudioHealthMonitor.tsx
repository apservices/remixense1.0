import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  RefreshCw, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  Activity,
  Music,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getAudioSystemHealth, cleanupOrphanSunoTracks, cleanupStuckGenerations } from '@/utils/audioCleanup';
import { reanalyzeAllTracks, ReanalysisProgress } from '@/utils/reanalysis';
import { toast } from 'sonner';

interface AudioHealth {
  totalTracks: number;
  tracksWithMockBpm: number;
  tracksWithRealBpm: number;
  orphanTracks: number;
  stuckGenerations: number;
  needsAttention: boolean;
}

export function AudioHealthMonitor() {
  const { user } = useAuth();
  const [health, setHealth] = useState<AudioHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [progress, setProgress] = useState<ReanalysisProgress | null>(null);

  const loadHealth = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const healthData = await getAudioSystemHealth(user.id);
      setHealth(healthData);
    } catch (error) {
      console.error('Failed to load health:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHealth();
  }, [user?.id]);

  const handleReanalyze = async () => {
    if (!user?.id) return;
    setReanalyzing(true);
    setProgress(null);
    
    try {
      const result = await reanalyzeAllTracks(user.id, (p) => {
        setProgress(p);
      });
      
      if (result.success) {
        toast.success(`Re-análise concluída! ${result.processed} tracks processados.`);
      } else {
        toast.warning(`Re-análise finalizada com ${result.failed} erros.`);
      }
      
      await loadHealth();
    } catch (error) {
      toast.error('Erro na re-análise');
    } finally {
      setReanalyzing(false);
      setProgress(null);
    }
  };

  const handleCleanup = async () => {
    if (!user?.id) return;
    setCleaning(true);
    
    try {
      // Clean orphan tracks
      const orphanResult = await cleanupOrphanSunoTracks(user.id);
      
      // Clean stuck generations
      const stuckResult = await cleanupStuckGenerations(user.id);
      
      const totalCleaned = orphanResult.orphansDeleted + stuckResult.cleaned;
      
      if (totalCleaned > 0) {
        toast.success(`Limpeza concluída! ${totalCleaned} itens removidos.`);
      } else {
        toast.info('Nenhum item para limpar.');
      }
      
      await loadHealth();
    } catch (error) {
      toast.error('Erro na limpeza');
    } finally {
      setCleaning(false);
    }
  };

  if (loading) {
    return (
      <Card className="glass-card">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!health) return null;

  const healthScore = health.totalTracks > 0 
    ? Math.round((health.tracksWithRealBpm / health.totalTracks) * 100) 
    : 100;

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Saúde do Sistema de Áudio</CardTitle>
          </div>
          <Badge variant={health.needsAttention ? "destructive" : "default"}>
            {health.needsAttention ? "Requer Atenção" : "Saudável"}
          </Badge>
        </div>
        <CardDescription>
          Monitore e corrija problemas com análise de áudio
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Health Score */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Saúde Geral</span>
            <span className="font-medium">{healthScore}%</span>
          </div>
          <Progress value={healthScore} className="h-2" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-background/50">
            <Music className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Total de Tracks</p>
              <p className="font-semibold">{health.totalTracks}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 rounded-lg bg-background/50">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-xs text-muted-foreground">BPM Real</p>
              <p className="font-semibold">{health.tracksWithRealBpm}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 rounded-lg bg-background/50">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <div>
              <p className="text-xs text-muted-foreground">BPM Mock</p>
              <p className="font-semibold">{health.tracksWithMockBpm}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 rounded-lg bg-background/50">
            <Trash2 className="h-4 w-4 text-red-500" />
            <div>
              <p className="text-xs text-muted-foreground">Órfãos</p>
              <p className="font-semibold">{health.orphanTracks + health.stuckGenerations}</p>
            </div>
          </div>
        </div>

        {/* Progress indicator during reanalysis */}
        {progress && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertTitle>Analisando...</AlertTitle>
            <AlertDescription>
              {progress.current} de {progress.total}: {progress.currentTrack}
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReanalyze}
            disabled={reanalyzing || cleaning || health.tracksWithMockBpm === 0}
            className="flex-1"
          >
            {reanalyzing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Re-analisar ({health.tracksWithMockBpm})
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleCleanup}
            disabled={reanalyzing || cleaning || (health.orphanTracks === 0 && health.stuckGenerations === 0)}
            className="flex-1"
          >
            {cleaning ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Limpar ({health.orphanTracks + health.stuckGenerations})
          </Button>
        </div>

        {/* Warning about missing secrets */}
        {health.needsAttention && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Ação Necessária</AlertTitle>
            <AlertDescription>
              {health.tracksWithMockBpm > 0 && (
                <p>• {health.tracksWithMockBpm} tracks com BPM simulado precisam de re-análise</p>
              )}
              {health.orphanTracks > 0 && (
                <p>• {health.orphanTracks} tracks IA órfãos precisam de limpeza</p>
              )}
              {health.stuckGenerations > 0 && (
                <p>• {health.stuckGenerations} gerações travadas precisam de limpeza</p>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

export default AudioHealthMonitor;
