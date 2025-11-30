import { MainLayout } from '@/components/MainLayout';
import { SocialFeedCard } from '@/components/social/SocialFeedCard';
import { Button } from '@/components/ui/button';
import { TrendingUp, Clock, Users, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useSocialPosts } from '@/hooks/useSocialPosts';
import { Card } from '@/components/ui/card';

export default function SocialFeed() {
  const [feedType, setFeedType] = useState<'foryou' | 'following' | 'trending'>('foryou');
  const { posts, isLoading, toggleLike } = useSocialPosts(feedType);

  return (
    <MainLayout>
      <div className="container max-w-2xl mx-auto py-6 px-4">
        {/* Feed Type Tabs */}
        <div className="flex gap-2 mb-6 glass glass-border backdrop-blur-glass p-2 rounded-lg">
          <Button
            variant={feedType === 'foryou' ? 'default' : 'ghost'}
            size="sm"
            className={cn('flex-1', feedType === 'foryou' && 'neon-glow')}
            onClick={() => setFeedType('foryou')}
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Para Você
          </Button>
          <Button
            variant={feedType === 'following' ? 'default' : 'ghost'}
            size="sm"
            className={cn('flex-1', feedType === 'following' && 'neon-glow')}
            onClick={() => setFeedType('following')}
          >
            <Users className="mr-2 h-4 w-4" />
            Seguindo
          </Button>
          <Button
            variant={feedType === 'trending' ? 'default' : 'ghost'}
            size="sm"
            className={cn('flex-1', feedType === 'trending' && 'neon-glow')}
            onClick={() => setFeedType('trending')}
          >
            <Clock className="mr-2 h-4 w-4" />
            Em Alta
          </Button>
        </div>

        {/* Feed */}
        <div className="space-y-6">
          {isLoading ? (
            <Card className="glass glass-border p-12">
              <div className="flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Carregando feed...</p>
              </div>
            </Card>
          ) : posts.length === 0 ? (
            <Card className="glass glass-border p-12">
              <div className="text-center space-y-4">
                <p className="text-heading-lg">📭 Nenhum post encontrado</p>
                <p className="text-muted-foreground">
                  Seja o primeiro a postar algo incrível!
                </p>
              </div>
            </Card>
          ) : (
            posts.map((post) => (
              <SocialFeedCard 
                key={post.id} 
                {...post}
                onLike={() => toggleLike(post.id)}
              />
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
}
