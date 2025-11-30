import { MainLayout } from '@/components/MainLayout';
import { SocialFeedCard } from '@/components/social/SocialFeedCard';
import { Button } from '@/components/ui/button';
import { TrendingUp, Clock, Users } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function SocialFeed() {
  const [feedType, setFeedType] = useState<'foryou' | 'following' | 'trending'>('foryou');

  // Mock posts - replace with actual data from Supabase
  const mockPosts = [
    {
      id: '1',
      user: {
        id: 'user1',
        username: 'djbeatmaster',
        djName: 'DJ Beat Master',
        avatarUrl: undefined
      },
      postType: 'set' as const,
      caption: '🔥 Novo set tech house! Gravado ontem no Club Vibe',
      likeCount: 234,
      commentCount: 45,
      playCount: 1520,
      createdAt: new Date().toISOString(),
      isLiked: false
    },
    {
      id: '2',
      user: {
        id: 'user2',
        username: 'remixqueen',
        djName: 'Remix Queen',
        avatarUrl: undefined
      },
      postType: 'remix' as const,
      caption: 'Remix de Daft Punk - One More Time 🎶',
      likeCount: 567,
      commentCount: 89,
      playCount: 3240,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      isLiked: true
    }
  ];

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
          {mockPosts.map((post) => (
            <SocialFeedCard key={post.id} {...post} />
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
