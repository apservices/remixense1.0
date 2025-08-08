import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInsights } from "@/hooks/useInsights";
import { useTracks } from "@/hooks/useTracks";
import { useDJSessions } from "@/hooks/useDJSessions";
import { useProfile } from "@/hooks/useProfile";
import { useSubscription } from "@/hooks/useSubscription";
import { 
  Music, TrendingUp, Clock, Zap, Users, Crown, Star, BarChart3, 
  Headphones, Mic, Upload, PlayCircle, Calendar, Target, Award,
  Activity, Disc3, Volume2, Timer, Sparkles
} from "lucide-react";

export function ComprehensiveDashboard() {
  const { insights, loading: insightsLoading } = useInsights();
  const { tracks, loading: tracksLoading } = useTracks();
  const { sessions, stats: sessionStats, loading: sessionsLoading } = useDJSessions();
  const { profile, loading: profileLoading } = useProfile();
  const { subscription, isPro, isExpert, isFree } = useSubscription();

  const loading = insightsLoading || tracksLoading || sessionsLoading || profileLoading;

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="glass border-glass-border p-8 animate-pulse">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full animate-glow" />
          </div>
        </Card>
      </div>
    );
  }

  // Calcular estatísticas gerais
  const totalDuration = tracks.reduce((acc, track) => {
    const [min, sec] = track.duration.split(':').map(Number);
    return acc + min + sec / 60;
  }, 0);

  const recentTracks = tracks.slice(0, 5);
  const topGenres = insights?.topGenres || [];
  const avgBPM = insights?.averageBPM || 0;

  return (
    <div className="space-y-6">
      {/* Header Card - Status Geral */}
      <Card className="glass border-glass-border overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 via-neon-blue/10 to-neon-violet/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 glass rounded-full flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary animate-glow" />
              </div>
              <div>
                <h1 className="text-heading-lg font-bold text-foreground">
                  Dashboard Completo
                </h1>
                <p className="text-muted-foreground">
                  Visão completa da sua atividade musical
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                {isExpert && <Crown className="h-4 w-4 text-yellow-500" />}
                {isPro && <Star className="h-4 w-4 text-blue-500" />}
                <Badge 
                  variant="outline" 
                  className={`${
                    isExpert ? 'border-yellow-500/30 text-yellow-500' : 
                    isPro ? 'border-blue-500/30 text-blue-500' : 
                    'border-muted text-muted-foreground'
                  }`}
                >
                  {subscription?.plan_type?.toUpperCase() || 'FREE'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                RemiXer: {profile?.dj_name || 'Anônimo'}
              </p>
            </div>
          </div>

          {/* KPIs Principais */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-neon-blue font-heading">
                {tracks.length}
              </div>
              <div className="text-xs text-muted-foreground">Total Tracks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-neon-violet font-heading">
                {Math.round(totalDuration)}m
              </div>
              <div className="text-xs text-muted-foreground">Duração Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-neon-teal font-heading">
                {sessionStats.totalSessions}
              </div>
              <div className="text-xs text-muted-foreground">Sessões RemiXer</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-neon-green font-heading">
                {avgBPM}
              </div>
              <div className="text-xs text-muted-foreground">BPM Médio</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Abas de Dados Detalhados */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 glass border-glass-border">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="tracks" className="flex items-center gap-2">
            <Music className="h-4 w-4" />
            Biblioteca
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <Headphones className="h-4 w-4" />
            Sessões
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Atividade Recente */}
            <Card className="glass border-glass-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-neon-blue" />
                Atividade Recente
              </h3>
              <div className="space-y-3">
                {recentTracks.slice(0, 3).map((track) => (
                  <div key={track.id} className="flex items-center gap-3 p-3 glass rounded-lg">
                    <div className="w-10 h-10 glass rounded-lg flex items-center justify-center">
                      <Music className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {track.title}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {track.artist}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {track.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            {/* Top Gêneros */}
            <Card className="glass border-glass-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Disc3 className="h-5 w-5 text-neon-violet" />
                Gêneros Favoritos
              </h3>
              <div className="space-y-3">
                {topGenres.slice(0, 4).map((genre, index) => (
                  <div key={genre.genre} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        index === 0 ? 'bg-neon-blue' :
                        index === 1 ? 'bg-neon-violet' :
                        index === 2 ? 'bg-neon-teal' : 'bg-neon-green'
                      }`} />
                      <span className="text-sm font-medium capitalize">
                        {genre.genre}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {genre.count} tracks
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Estatísticas de Performance */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="glass border-glass-border p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Upload className="h-8 w-8 text-neon-blue" />
              </div>
              <div className="text-xl font-bold text-neon-blue font-heading">
                {insights?.trackAnalytics.recentUploads || 0}
              </div>
              <div className="text-xs text-muted-foreground">
                Uploads esta semana
              </div>
            </Card>

            <Card className="glass border-glass-border p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Timer className="h-8 w-8 text-neon-violet" />
              </div>
              <div className="text-xl font-bold text-neon-violet font-heading">
                {Math.round(sessionStats.avgSessionDuration)}m
              </div>
              <div className="text-xs text-muted-foreground">
                Duração média sessão
              </div>
            </Card>

            <Card className="glass border-glass-border p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Volume2 className="h-8 w-8 text-neon-teal" />
              </div>
              <div className="text-xl font-bold text-neon-teal font-heading">
                {sessionStats.totalTracks}
              </div>
              <div className="text-xs text-muted-foreground">
                Tracks mixados
              </div>
            </Card>

            <Card className="glass border-glass-border p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-8 w-8 text-neon-green" />
              </div>
              <div className="text-xl font-bold text-neon-green font-heading">
                {Math.round((insights?.totalListeningTime || 0) / 60)}h
              </div>
              <div className="text-xs text-muted-foreground">
                Tempo total análise
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Biblioteca de Tracks */}
        <TabsContent value="tracks" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">
              Biblioteca Musical ({tracks.length} tracks)
            </h3>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Novo Upload
            </Button>
          </div>

          <div className="grid gap-3">
            {tracks.map((track) => (
              <Card key={track.id} className="glass border-glass-border p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 glass rounded-lg flex items-center justify-center">
                    <Music className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground truncate">
                      {track.title}
                    </h4>
                    <p className="text-sm text-muted-foreground truncate">
                      {track.artist}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {track.duration}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {track.type}
                      </Badge>
                      {track.genre && (
                        <Badge variant="outline" className="text-xs capitalize">
                          {track.genre}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <PlayCircle className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Sessões DJ */}
        <TabsContent value="sessions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="glass border-glass-border p-4 text-center">
              <div className="text-xl font-bold text-neon-blue font-heading">
                {sessionStats.totalSessions}
              </div>
              <div className="text-sm text-muted-foreground">Total Sessões</div>
            </Card>
            <Card className="glass border-glass-border p-4 text-center">
              <div className="text-xl font-bold text-neon-violet font-heading">
                {Math.round(sessionStats.totalDuration)}m
              </div>
              <div className="text-sm text-muted-foreground">Tempo Total</div>
            </Card>
            <Card className="glass border-glass-border p-4 text-center">
              <div className="text-xl font-bold text-neon-teal font-heading">
                {sessionStats.totalTracks}
              </div>
              <div className="text-sm text-muted-foreground">Tracks Mixados</div>
            </Card>
          </div>

          <div className="space-y-3">
            {sessions.slice(0, 10).map((session) => (
              <Card key={session.id} className="glass border-glass-border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 glass rounded-lg flex items-center justify-center">
                      <Headphones className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">
                        {session.session_name}
                      </h4>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{Math.round(session.duration || 0)}m</span>
                        <span>•</span>
                        <span>{session.tracks_mixed || 0} tracks</span>
                        <span>•</span>
                        <span>{new Date(session.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <PlayCircle className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Avançado */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass border-glass-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-neon-blue" />
                Tendências de Upload
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Esta semana</span>
                  <span className="font-medium text-neon-blue">
                    +{insights?.trackAnalytics.recentUploads || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tendência</span>
                  <Badge variant="outline" className={`${
                    insights?.uploadTrend === 'up' ? 'text-neon-green border-neon-green/30' :
                    insights?.uploadTrend === 'down' ? 'text-red-400 border-red-400/30' :
                    'text-muted-foreground'
                  }`}>
                    {insights?.uploadTrend === 'up' ? '↗ Crescendo' :
                     insights?.uploadTrend === 'down' ? '↘ Decrescendo' : '→ Estável'}
                  </Badge>
                </div>
              </div>
            </Card>

            <Card className="glass border-glass-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-neon-violet" />
                Track Mais Tocado
              </h3>
              {insights?.trackAnalytics.mostPlayed ? (
                <div className="space-y-2">
                  <div className="font-medium text-foreground">
                    {insights.trackAnalytics.mostPlayed.title}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    por {insights.trackAnalytics.mostPlayed.artist}
                  </div>
                  <div className="text-xs text-neon-green">
                    {insights.trackAnalytics.mostPlayed.playCount} reproduções
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Dados insuficientes
                </p>
              )}
            </Card>
          </div>

          <Card className="glass border-glass-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-neon-teal" />
              Resumo Semanal
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-neon-blue font-heading">
                  {insights?.mostActiveDay || 'N/A'}
                </div>
                <div className="text-xs text-muted-foreground">Dia mais ativo</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-neon-violet font-heading">
                  {insights?.trackAnalytics.favoriteGenre || 'N/A'}
                </div>
                <div className="text-xs text-muted-foreground">Gênero favorito</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-neon-teal font-heading">
                  {insights?.mixSessions || 0}
                </div>
                <div className="text-xs text-muted-foreground">Sessões mix</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-neon-green font-heading">
                  {Math.round((insights?.totalListeningTime || 0) / 60)}h
                </div>
                <div className="text-xs text-muted-foreground">Tempo análise</div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}