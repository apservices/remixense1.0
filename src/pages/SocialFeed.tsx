import { AppShell } from '@/components/AppShell';
import { SocialFeedCard } from '@/components/social/SocialFeedCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';

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

export default function SocialFeed() {
  return (
    <AppShell>
      <div className="container max-w-2xl mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-heading-xl">📱 Feed</h1>
          <Button size="sm" className="neon-glow">
            <Plus className="h-4 w-4 mr-2" />
            Novo Post
          </Button>
        </div>

        <Tabs defaultValue="for-you" className="w-full">
          <TabsList className="grid w-full grid-cols-3 glass glass-border">
            <TabsTrigger value="for-you">Para Você</TabsTrigger>
            <TabsTrigger value="following">Seguindo</TabsTrigger>
            <TabsTrigger value="trending">Em Alta</TabsTrigger>
          </TabsList>

          <TabsContent value="for-you" className="space-y-4 mt-6">
            {mockPosts.map(post => (
              <SocialFeedCard key={post.id} {...post} />
            ))}
          </TabsContent>

          <TabsContent value="following" className="space-y-4 mt-6">
            <div className="text-center py-12 text-muted-foreground">
              Siga DJs para ver seus posts aqui
            </div>
          </TabsContent>

          <TabsContent value="trending" className="space-y-4 mt-6">
            <div className="text-center py-12 text-muted-foreground">
              Em breve: posts mais populares
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
