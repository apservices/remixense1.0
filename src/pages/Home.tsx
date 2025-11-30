import { MainLayout } from '@/components/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Scissors, Play, Users, ShoppingBag, TrendingUp, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '@/contexts/PlayerContext';
import { QuickLinks } from '@/components/QuickLinks';

export default function Home() {
  const navigate = useNavigate();
  const { playTrack } = usePlayer();

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

  const features = [
    {
      icon: Scissors,
      title: 'Stems Studio',
      description: 'Separe áudio em stems com IA',
      color: 'from-green-500 to-emerald-600',
      path: '/studio/stems'
    },
    {
      icon: Zap,
      title: 'Estúdio de IA',
      description: 'Mastering, melodias e análise',
      color: 'from-blue-500 to-cyan-600',
      path: '/ai-studio'
    },
    {
      icon: Play,
      title: 'Auto DJ',
      description: 'Geração automática de sets',
      color: 'from-amber-500 to-orange-600',
      path: '/dj/auto'
    },
    {
      icon: Users,
      title: 'Social Feed',
      description: 'Compartilhe e descubra remixes',
      color: 'from-purple-500 to-violet-600',
      path: '/feed'
    },
    {
      icon: ShoppingBag,
      title: 'Marketplace',
      description: 'Compre e venda loops e stems',
      color: 'from-pink-500 to-rose-600',
      path: '/marketplace'
    },
    {
      icon: TrendingUp,
      title: 'Calendário',
      description: 'Organize seus lançamentos',
      color: 'from-indigo-500 to-purple-600',
      path: '/calendar'
    },
  ];

  return (
    <MainLayout>
      <div className="container max-w-6xl mx-auto py-8 px-4 space-y-8">
        {/* Hero */}
        <div className="text-center space-y-4 py-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass glass-border backdrop-blur-glass">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Plataforma IA para Música</span>
          </div>
          <h1 className="text-heading-xl font-bold bg-gradient-to-br from-primary via-secondary to-accent bg-clip-text text-transparent">
            Bem-vindo ao RemiXense
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Criação musical com Inteligência Artificial. Separe stems, gere sets, compartilhe e monetize suas criações.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" className="neon-glow" onClick={() => navigate('/studio/stems')}>
              Começar Agora
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/pricing')}>
              Ver Planos
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="p-6 glass glass-border backdrop-blur-glass hover:scale-[1.02] transition-all cursor-pointer group"
                onClick={() => navigate(feature.path)}
              >
                <div className="space-y-4">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} neon-glow`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Stats */}
        <Card className="p-8 glass glass-border backdrop-blur-glass">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">10K+</div>
              <div className="text-sm text-muted-foreground mt-1">Usuários Ativos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary">50K+</div>
              <div className="text-sm text-muted-foreground mt-1">Tracks Processadas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">2M+</div>
              <div className="text-sm text-muted-foreground mt-1">Stems Gerados</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">100K+</div>
              <div className="text-sm text-muted-foreground mt-1">Sets Criados</div>
            </div>
          </div>
        </Card>

        {/* Quick Links to Tools */}
        <QuickLinks />

        {/* Demo Tracks */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Tracks em Destaque</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {demoTracks.map((track) => (
              <Card key={track.id} className="p-4 glass glass-border backdrop-blur-glass">
                <div className="space-y-4">
                  <div className="aspect-square rounded-lg bg-muted/20 overflow-hidden">
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold truncate">{track.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                  </div>
                  <Button
                    className="w-full neon-glow"
                    onClick={() => playTrack(track, demoTracks)}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Play
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Card className="p-8 glass glass-border backdrop-blur-glass bg-gradient-to-br from-primary/10 to-secondary/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Pronto para criar?</h3>
              <p className="text-muted-foreground">
                Comece a usar o RemiXense gratuitamente hoje mesmo.
              </p>
            </div>
            <Button size="lg" className="neon-glow" onClick={() => navigate('/studio/stems')}>
              <Scissors className="mr-2 h-5 w-5" />
              Abrir Stems Studio
            </Button>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
