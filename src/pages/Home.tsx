import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  FolderKanban, 
  Share2, 
  Users, 
  Settings,
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

export default function Home() {
  const navigate = useNavigate();
  const { playTrack } = usePlayer();
  const { user } = useAuth();

  // Fetch recent projects
  const { data: recentProjects } = useQuery({
    queryKey: ['recent-projects', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(4);
      return data || [];
    },
    enabled: !!user?.id
  });

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

  // Demo tracks
  const demoTracks = [
    {
      id: '1',
      title: 'Summer Vibes',
      artist: 'DJ Master',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      duration: 180,
      coverUrl: '/lovable-uploads/31c47f1e-55db-419e-a22a-67d1476797f1.png'
    },
    {
      id: '2',
      title: 'Night Drive',
      artist: 'Electronic Dreams',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      duration: 220,
      coverUrl: '/lovable-uploads/6e868d8d-3df9-4415-8784-9786445d0336.png'
    },
    {
      id: '3',
      title: 'Urban Beats',
      artist: 'The Producers',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      duration: 195,
      coverUrl: '/lovable-uploads/d4b3d199-a716-41e6-9713-8953ed46d0d2.png'
    }
  ];

  return (
    <AppLayout>
      <div className="container max-w-6xl mx-auto py-6 px-4 space-y-8">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl gradient-primary p-8 md:p-12">
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent" />
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm mb-4">
              <Zap className="h-4 w-4" />
              <span className="text-sm font-medium">Plataforma IA para Música</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Bem-vindo ao RemiXense
            </h1>
            <p className="text-white/80 text-lg mb-6">
              Criação musical com Inteligência Artificial. Separe stems, gere sets, 
              compartilhe e monetize suas criações.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => navigate('/ai-studio')}
                className="bg-white text-primary hover:bg-white/90"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Começar a Criar
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/pricing')}
                className="border-white/30 text-white hover:bg-white/10"
              >
                Ver Planos
              </Button>
            </div>
          </div>
        </section>

        {/* Recent Projects */}
        {recentProjects && recentProjects.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Continue seus Projetos</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/tracks')}>
                Ver todos
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentProjects.map((project) => (
                <Card 
                  key={project.id} 
                  className="premium-card p-4 cursor-pointer hover:scale-[1.02] transition-transform"
                  onClick={() => navigate(`/tracks`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <Music className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{project.title}</h3>
                      <p className="text-xs text-muted-foreground capitalize">{project.status}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Main Modules Grid */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold">Módulos Principais</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <Card
                  key={module.id}
                  className="premium-card p-6 cursor-pointer group hover:scale-[1.02] transition-all duration-300"
                  onClick={() => navigate(module.path)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${module.gradient} neon-glow shrink-0`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                          {module.title}
                        </h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {module.subtitle}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {module.description}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Platform Highlights */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold">Destaques da Plataforma</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <Card
                  key={item.label}
                  className="glass glass-border p-4 cursor-pointer hover:bg-muted/30 transition-colors text-center group"
                  onClick={() => navigate(item.path)}
                >
                  <div className="inline-flex p-3 rounded-xl bg-primary/10 mb-3 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm font-medium">{item.label}</p>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Stats */}
        <Card className="premium-card p-6 md:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold gradient-text">10K+</div>
              <div className="text-sm text-muted-foreground mt-1">Usuários Ativos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold gradient-text">50K+</div>
              <div className="text-sm text-muted-foreground mt-1">Tracks Processadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold gradient-text">2M+</div>
              <div className="text-sm text-muted-foreground mt-1">Stems Gerados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold gradient-text">100K+</div>
              <div className="text-sm text-muted-foreground mt-1">Sets Criados</div>
            </div>
          </div>
        </Card>

        {/* Demo Tracks */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold">Tracks em Destaque</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {demoTracks.map((track) => (
              <Card key={track.id} className="premium-card overflow-hidden group">
                <div className="aspect-square relative">
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
                    <Button
                      size="lg"
                      className="neon-glow"
                      onClick={(e) => {
                        e.stopPropagation();
                        playTrack(track, demoTracks);
                      }}
                    >
                      <Play className="mr-2 h-5 w-5" />
                      Play
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold truncate">{track.title}</h3>
                  <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <Card className="premium-card p-6 md:p-8 bg-gradient-to-br from-primary/10 to-accent/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold mb-2">Pronto para criar?</h3>
              <p className="text-muted-foreground">
                Comece a usar o RemiXense gratuitamente hoje mesmo.
              </p>
            </div>
            <Button size="lg" className="neon-glow" onClick={() => navigate('/ai-studio')}>
              <Sparkles className="mr-2 h-5 w-5" />
              Abrir Estúdio IA
            </Button>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
