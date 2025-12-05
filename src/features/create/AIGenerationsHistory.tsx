import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { History, Music, Piano, Layers, Headphones, Sparkles, Waves, ExternalLink, RefreshCw, AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AIGeneration {
  id: string;
  type: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  output_url: string | null;
  parameters: unknown;
  credits_used: number | null;
  processing_time_ms: number | null;
  error_message: string | null;
}

const TYPE_CONFIG: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  melody: { icon: Music, label: 'Melodia', color: 'text-primary' },
  harmony: { icon: Piano, label: 'Harmonia', color: 'text-cyan-400' },
  stems: { icon: Layers, label: 'Stems', color: 'text-emerald-400' },
  mastering: { icon: Headphones, label: 'Mastering', color: 'text-rose-400' },
  mood: { icon: Sparkles, label: 'Mood', color: 'text-violet-400' },
  waveform: { icon: Waves, label: 'Waveform', color: 'text-amber-400' }
};

const STATUS_CONFIG: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  pending: { icon: Clock, label: 'Aguardando', color: 'bg-muted text-muted-foreground' },
  processing: { icon: RefreshCw, label: 'Processando', color: 'bg-amber-500/20 text-amber-400' },
  completed: { icon: CheckCircle2, label: 'Concluído', color: 'bg-emerald-500/20 text-emerald-400' },
  failed: { icon: XCircle, label: 'Falhou', color: 'bg-destructive/20 text-destructive' }
};

export default function AIGenerationsHistory() {
  const { user } = useAuth();
  const [generations, setGenerations] = useState<AIGeneration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadGenerations();
      
      // Subscribe to realtime updates
      const channel = supabase
        .channel('ai_generations_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'ai_generations',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          if (payload.eventType === 'INSERT') {
            setGenerations(prev => [payload.new as AIGeneration, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setGenerations(prev => prev.map(g => 
              g.id === (payload.new as AIGeneration).id ? payload.new as AIGeneration : g
            ));
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id]);

  const loadGenerations = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('ai_generations')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (fetchError) throw fetchError;
      setGenerations(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading AI generations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeConfig = (type: string) => {
    return TYPE_CONFIG[type] || { icon: Music, label: type, color: 'text-muted-foreground' };
  };

  const getStatusConfig = (status: string) => {
    return STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  };

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="w-5 h-5" />
            Histórico de IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="w-5 h-5" />
            Histórico de IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <AlertCircle className="w-10 h-10 text-destructive/70" />
            <p className="text-sm text-muted-foreground">Erro ao carregar histórico</p>
            <Button variant="outline" size="sm" onClick={loadGenerations}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="w-5 h-5" />
            Histórico de IA
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={loadGenerations}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {generations.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <History className="w-10 h-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Nenhuma geração ainda</p>
            <p className="text-xs text-muted-foreground/70">
              Use as ferramentas de IA para criar suas primeiras gerações
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-3">
            <div className="space-y-2">
              {generations.map((gen) => {
                const typeConfig = getTypeConfig(gen.type);
                const statusConfig = getStatusConfig(gen.status);
                const TypeIcon = typeConfig.icon;
                const StatusIcon = statusConfig.icon;
                
                return (
                  <div 
                    key={gen.id} 
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className={`p-2 rounded-lg bg-background/50 ${typeConfig.color}`}>
                      <TypeIcon className="w-4 h-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{typeConfig.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(gen.created_at), { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                        {gen.processing_time_ms && (
                          <span className="ml-2">• {gen.processing_time_ms}ms</span>
                        )}
                      </p>
                    </div>
                    
                    <Badge variant="outline" className={`${statusConfig.color} border-0 gap-1`}>
                      <StatusIcon className={`w-3 h-3 ${gen.status === 'processing' ? 'animate-spin' : ''}`} />
                      {statusConfig.label}
                    </Badge>
                    
                    {gen.output_url && gen.status === 'completed' && (
                      <Button variant="ghost" size="icon" asChild>
                        <a href={gen.output_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
