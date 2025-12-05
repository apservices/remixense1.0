import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  FolderKanban, 
  Share2, 
  Users, 
  Music,
  Wand2,
  Layers,
  Radio,
  Calendar,
  TrendingUp,
  Play,
  ChevronRight,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '@/contexts/PlayerContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAudioLibrary } from '@/hooks/useAudioLibrary';
import { FirstTrackCTA } from '@/components/FirstTrackCTA';
import { TrackAnalysisCard } from '@/components/TrackAnalysisCard';
import { SmartRecommendationsPanel } from '@/components/SmartRecommendationsPanel';
import { JourneyProgress } from '@/components/JourneyProgress';
import { useSmartRecommendations } from '@/hooks/useSmartRecommendations';

export default function Home() {
  const navigate = useNavigate();
  const { playTrack } = usePlayer();
  const { user } = useAuth();
  const { aiGenerations, tracks, refresh: refetchTracks } = useAudioLibrary();
  const [selectedTrack, setSelectedTrack] = useState<any>(null);

  // Get the most recent track with analysis
  const latestTrack = tracks.find(t => t.bpm && t.key_signature) || tracks[0] || null;
  
  // Smart recommendations based on latest track
  const { compatibleTracks } = useSmartRecommendations(latestTrack, tracks);

  // User journey state
  const hasTrack = tracks.length > 0;
  const hasAnalysis = tracks.some(t => t.bpm && t.key_signature);
  const hasExploredRecommendations = localStorage.getItem('remixense_explored_recs') === 'true';
  const hasCreated = aiGenerations.length > 0;

  // Mark recommendations as explored when panel is visible
  useEffect(() => {
    if (hasAnalysis && latestTrack) {
      localStorage.setItem('remixense_explored_recs', 'true');
    }
  }, [hasAnalysis, latestTrack]);

  const handleUploadComplete = (trackId: string) => {
    refetchTracks();
  };

  const handleJourneyStepClick = (stepId: string) => {
    switch (stepId) {
      case 'upload':
        // Scroll to CTA or do nothing if already visible
        break;
      case 'analyze':
        if (tracks[0]) setSelectedTrack(tracks[0]);
        break;
      case 'explore':
        // Already visible in recommendations
        break;
      case 'create':
        navigate('/ai-studio');
        break;
    }
  };

  // Main modules
  const modules = [
    {
      id: 'create',
      title: 'Create',
      subtitle: 'IA Musical',
      description: 'Crie melodias, harmonias e masterize com IA',
      icon: Sparkles,
      path: '/ai-studio',
      gradient: 'from-violet-500 to-purple-600',
    },
    {
      id: 'manage',
      title: 'Manage',
      subtitle: 'Gestão Musical',
      description: 'Organize tracks, metadados e analytics',
      icon: FolderKanban,
      path: '/tracks',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'distribute',
      title: 'Distribute',
      subtitle: 'Distribuição',
      description: 'Publique em todas as plataformas',
      icon: Share2,
      path: '/calendar',
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      id: 'community',
      title: 'Community',
      subtitle: 'Comunidade',
      description: 'Conecte-se com outros artistas',
      icon: Users,
      path: '/feed',
      gradient: 'from-pink-500 to-rose-500',
    },
  ];

  // Platform highlights
  const highlights = [
    { label: 'Gerador de Melodias', icon: Wand2, path: '/ai-studio' },
    { label: 'Mastering IA', icon: Sparkles, path: '/ai-studio' },
    { label: 'Stems Swap', icon: Layers, path: '/studio/stems' },
    { label: 'Auto DJ', icon: Radio, path: '/dj/auto' },
    { label: 'Calendário', icon: Calendar, path: '/calendar' },
    { label: 'Analytics', icon: TrendingUp, path: '/analytics' },
  ];

  return (
    <AppLayout>
      <div className="container max-w-6xl mx-auto py-4 md:py-6 px-3 md:px-4 space-y-6 md:space-y-8">
        
        {/* User Journey Section - Based on State */}
        {!hasTrack ? (
          /* New User - Show First Track CTA */
          <section className="space-y-4">
            <FirstTrackCTA onUploadComplete={handleUploadComplete} />
            <JourneyProgress 
              hasTrack={hasTrack}
              hasAnalysis={hasAnalysis}
              hasExploredRecommendations={hasExploredRecommendations}
              hasCreated={hasCreated}
              onStepClick={handleJourneyStepClick}
            />
          </section>
        ) : (
          /* Returning User - Show Analysis + Recommendations */
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Sua Música
              </h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/tracks')} className="text-xs">
                Ver todas ({tracks.length})
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Latest Track Analysis */}
              {latestTrack && (
                <TrackAnalysisCard 
                  track={{
                    id: latestTrack.id,
                    title: latestTrack.title,
                    artist: latestTrack.artist,
                    bpm: latestTrack.bpm ?? undefined,
                    key_signature: latestTrack.key_signature ?? undefined,
                    energy_level: latestTrack.energy_level ?? undefined,
                    genre: latestTrack.genre ?? undefined,
                    duration: String(latestTrack.duration),
                    file_path: latestTrack.audioUrl
                  }} 
                  onAnalysisComplete={refetchTracks}
                />
              )}
              
              {/* Journey Progress */}
              <JourneyProgress 
                hasTrack={hasTrack}
                hasAnalysis={hasAnalysis}
                hasExploredRecommendations={hasExploredRecommendations}
                hasCreated={hasCreated}
                onStepClick={handleJourneyStepClick}
              />
            </div>

            {/* Smart Recommendations */}
            {hasAnalysis && latestTrack && (
              <SmartRecommendationsPanel 
                track={{
                  id: latestTrack.id,
                  title: latestTrack.title,
                  artist: latestTrack.artist,
                  bpm: latestTrack.bpm ?? undefined,
                  key_signature: latestTrack.key_signature ?? undefined,
                  energy_level: latestTrack.energy_level ?? undefined
                }}
                compatibleTracks={compatibleTracks.map(t => ({
                  id: t.id,
                  title: t.title,
                  artist: t.artist,
                  bpm: t.bpm ?? undefined,
                  key_signature: t.key_signature ?? undefined,
                  energy_level: t.energy_level ?? undefined
                }))}
              />
            )}
          </section>
        )}

        {/* Recent AI Generations */}
        {aiGenerations.length > 0 && (
          <section className="space-y-3 md:space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Criações com IA
              </h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/ai-studio')} className="text-xs">
                Criar mais
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
              {aiGenerations.slice(0, 4).map((gen) => (
                <Card 
                  key={gen.id} 
                  className="premium-card p-3 cursor-pointer hover:scale-[1.02] transition-transform"
                  onClick={() => playTrack(gen, aiGenerations)}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{gen.title}</p>
                      <p className="text-xs text-muted-foreground">{gen.artist}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-2xl md:rounded-3xl gradient-primary p-5 md:p-8 lg:p-12">
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent" />
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1 md:py-1.5 rounded-full bg-white/20 backdrop-blur-sm mb-3 md:mb-4">
              <Zap className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="text-xs md:text-sm font-medium">Plataforma IA para Música</span>
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">
              {hasTrack ? 'Continue criando!' : 'Bem-vindo ao RemiXense'}
            </h1>
            <p className="text-white/80 text-sm md:text-base lg:text-lg mb-4 md:mb-6">
              {hasTrack 
                ? 'Suas músicas estão analisadas. Explore recomendações, gere melodias ou crie remixes.'
                : 'Criação musical com IA. Separe stems, gere sets e monetize suas criações.'
              }
            </p>
            <div className="flex flex-wrap gap-2 md:gap-3">
              <Button 
                size="default" 
                variant="secondary"
                onClick={() => navigate(hasTrack ? '/ai-studio' : '/tracks')}
                className="bg-white text-primary hover:bg-white/90 text-sm md:text-base touch-manipulation"
              >
                <Sparkles className="mr-1.5 md:mr-2 h-4 w-4 md:h-5 md:w-5" />
                {hasTrack ? 'Criar com IA' : 'Adicionar Música'}
              </Button>
              <Button 
                size="default" 
                variant="outline"
                onClick={() => navigate('/pricing')}
                className="border-white/30 text-white hover:bg-white/10 text-sm md:text-base touch-manipulation"
              >
                Ver Planos
              </Button>
            </div>
          </div>
        </section>

        {/* Main Modules Grid */}
        <section className="space-y-3 md:space-y-4">
          <h2 className="text-lg md:text-xl font-bold">Módulos Principais</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <Card
                  key={module.id}
                  className="premium-card p-4 md:p-6 cursor-pointer group active:scale-[0.98] hover:scale-[1.02] transition-all duration-300 touch-manipulation"
                  onClick={() => navigate(module.path)}
                >
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className={`p-2.5 md:p-3 rounded-xl md:rounded-2xl bg-gradient-to-br ${module.gradient} neon-glow shrink-0`}>
                      <Icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 md:gap-2 mb-0.5 md:mb-1 flex-wrap">
                        <h3 className="text-base md:text-lg font-bold group-hover:text-primary transition-colors">
                          {module.title}
                        </h3>
                        <span className="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {module.subtitle}
                        </span>
                      </div>
                      <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                        {module.description}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Platform Highlights */}
        <section className="space-y-3 md:space-y-4">
          <h2 className="text-lg md:text-xl font-bold">Destaques</h2>
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <Card
                  key={item.label}
                  className="glass glass-border p-2.5 md:p-4 cursor-pointer hover:bg-muted/30 active:scale-[0.98] transition-all text-center group touch-manipulation"
                  onClick={() => navigate(item.path)}
                >
                  <div className="inline-flex p-2 md:p-3 rounded-lg md:rounded-xl bg-primary/10 mb-1.5 md:mb-3 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  </div>
                  <p className="text-[10px] md:text-sm font-medium leading-tight">{item.label}</p>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Stats */}
        <Card className="premium-card p-4 md:p-6 lg:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="text-center">
              <div className="text-xl md:text-2xl lg:text-3xl font-bold gradient-text">{tracks.length || '0'}</div>
              <div className="text-[10px] md:text-xs lg:text-sm text-muted-foreground mt-0.5 md:mt-1">Suas Músicas</div>
            </div>
            <div className="text-center">
              <div className="text-xl md:text-2xl lg:text-3xl font-bold gradient-text">{aiGenerations.length || '0'}</div>
              <div className="text-[10px] md:text-xs lg:text-sm text-muted-foreground mt-0.5 md:mt-1">Criações IA</div>
            </div>
            <div className="text-center">
              <div className="text-xl md:text-2xl lg:text-3xl font-bold gradient-text">{compatibleTracks.length || '0'}</div>
              <div className="text-[10px] md:text-xs lg:text-sm text-muted-foreground mt-0.5 md:mt-1">Compatíveis</div>
            </div>
            <div className="text-center">
              <div className="text-xl md:text-2xl lg:text-3xl font-bold gradient-text">{tracks.filter(t => t.bpm).length || '0'}</div>
              <div className="text-[10px] md:text-xs lg:text-sm text-muted-foreground mt-0.5 md:mt-1">Analisadas</div>
            </div>
          </div>
        </Card>

        {/* CTA */}
        <Card className="premium-card p-4 md:p-6 lg:p-8 bg-gradient-to-br from-primary/10 to-accent/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-xl md:text-2xl font-bold mb-1 md:mb-2">
                {hasTrack ? 'Pronto para o próximo nível?' : 'Pronto para criar?'}
              </h3>
              <p className="text-sm md:text-base text-muted-foreground">
                {hasTrack 
                  ? 'Explore as ferramentas de IA e crie algo incrível.'
                  : 'Comece a usar o RemiXense gratuitamente.'
                }
              </p>
            </div>
            <Button 
              size="default" 
              className="neon-glow text-sm md:text-base touch-manipulation" 
              onClick={() => navigate(hasTrack ? '/ai-studio' : '/tracks')}
            >
              <Sparkles className="mr-1.5 md:mr-2 h-4 w-4 md:h-5 md:w-5" />
              {hasTrack ? 'Abrir Estúdio IA' : 'Adicionar Música'}
            </Button>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
