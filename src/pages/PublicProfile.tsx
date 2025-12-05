import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useFollows } from '@/hooks/useFollows';
import { useAuth } from '@/hooks/useAuth';
import { Music, Users, Play, Loader2, MapPin, Link as LinkIcon, CheckCircle } from 'lucide-react';

interface PublicProfile {
  id: string;
  username: string;
  dj_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  social_links: Record<string, string>;
  verified: boolean;
  followers_count: number;
  total_plays: number;
}

interface UserTrack {
  id: string;
  title: string;
  artist: string;
  cover_url: string | null;
  play_count: number;
  created_at: string;
}

export default function PublicProfile() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { isFollowing, followerCount, followingCount, toggleFollow, isLoading: followLoading } = useFollows(id);
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [tracks, setTracks] = useState<UserTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProfile();
      fetchTracks();
    }
  }, [id]);

  const fetchProfile = async () => {
    if (!id) return;
    
    try {
      // Fetch from profiles table (public_profiles view in production)
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, dj_name, avatar_url, bio, location, website, social_links')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Get follower count
      const { count: followers } = await supabase
        .from('follows')
        .select('id', { count: 'exact', head: true })
        .eq('following_id', id);

      // Get total plays
      const { data: tracksData } = await supabase
        .from('tracks')
        .select('id')
        .eq('user_id', id);

      let totalPlays = 0;
      if (tracksData?.length) {
        const { count } = await supabase
          .from('plays')
          .select('id', { count: 'exact', head: true })
          .in('content_id', tracksData.map(t => t.id));
        totalPlays = count || 0;
      }

      setProfile({
        ...data,
        verified: false,
        followers_count: followers || 0,
        total_plays: totalPlays,
        social_links: (data.social_links as Record<string, string>) || {}
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTracks = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('tracks')
        .select('id, title, artist, play_count, created_at')
        .eq('user_id', id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      const mapped = (data || []).map(t => ({ ...t, cover_url: null }));
      setTracks(mapped as UserTrack[]);
    } catch (error) {
      console.error('Error fetching tracks:', error);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!profile) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="glass glass-border p-8 text-center">
            <p className="text-muted-foreground">Perfil não encontrado</p>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const isOwnProfile = user?.id === id;

  return (
    <AppLayout>
      <div className="min-h-screen pb-20">
        {/* Profile Header */}
        <div className="relative">
          {/* Cover gradient */}
          <div className="h-32 bg-gradient-to-r from-primary/30 to-primary/10" />
          
          {/* Profile info */}
          <div className="px-4 -mt-16">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <Avatar className="h-32 w-32 ring-4 ring-background">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-4xl">
                  {(profile.dj_name || profile.username)?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-heading-xl">
                    {profile.dj_name || profile.username}
                  </h1>
                  {profile.verified && (
                    <CheckCircle className="h-5 w-5 text-primary fill-primary/20" />
                  )}
                </div>
                
                <p className="text-muted-foreground">@{profile.username}</p>
                
                {profile.bio && (
                  <p className="text-sm max-w-lg">{profile.bio}</p>
                )}
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {profile.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {profile.location}
                    </span>
                  )}
                  {profile.website && (
                    <a 
                      href={profile.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      <LinkIcon className="h-4 w-4" />
                      Website
                    </a>
                  )}
                </div>
              </div>
              
              {/* Follow button */}
              {!isOwnProfile && (
                <Button
                  onClick={toggleFollow}
                  variant={isFollowing ? 'outline' : 'default'}
                  className={!isFollowing ? 'neon-glow' : ''}
                  disabled={followLoading}
                >
                  {isFollowing ? 'Seguindo' : 'Seguir'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="px-4 py-6">
          <div className="grid grid-cols-3 gap-4">
            <Card className="glass glass-border p-4 text-center">
              <div className="text-2xl font-bold text-primary">{tracks.length}</div>
              <div className="text-xs text-muted-foreground">Tracks</div>
            </Card>
            <Card className="glass glass-border p-4 text-center">
              <div className="text-2xl font-bold text-primary">{followerCount}</div>
              <div className="text-xs text-muted-foreground">Seguidores</div>
            </Card>
            <Card className="glass glass-border p-4 text-center">
              <div className="text-2xl font-bold text-primary">{profile.total_plays}</div>
              <div className="text-xs text-muted-foreground">Plays</div>
            </Card>
          </div>
        </div>

        {/* Content tabs */}
        <div className="px-4">
          <Tabs defaultValue="tracks" className="w-full">
            <TabsList className="w-full glass">
              <TabsTrigger value="tracks" className="flex-1">
                <Music className="h-4 w-4 mr-2" />
                Tracks
              </TabsTrigger>
              <TabsTrigger value="about" className="flex-1">
                <Users className="h-4 w-4 mr-2" />
                Sobre
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="tracks" className="mt-4 space-y-3">
              {tracks.length === 0 ? (
                <Card className="glass glass-border p-8 text-center">
                  <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhuma track pública</p>
                </Card>
              ) : (
                tracks.map((track) => (
                  <Card key={track.id} className="glass glass-border p-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                        {track.cover_url ? (
                          <img src={track.cover_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Music className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{track.title}</p>
                        <p className="text-sm text-muted-foreground">{track.artist}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Play className="h-4 w-4" />
                        {track.play_count || 0}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>
            
            <TabsContent value="about" className="mt-4">
              <Card className="glass glass-border p-6 space-y-4">
                {profile.bio && (
                  <div>
                    <h3 className="font-medium mb-2">Bio</h3>
                    <p className="text-sm text-muted-foreground">{profile.bio}</p>
                  </div>
                )}
                
                {Object.keys(profile.social_links).length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Redes Sociais</h3>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(profile.social_links).map(([platform, url]) => (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Badge variant="outline" className="capitalize">
                            {platform}
                          </Badge>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <h3 className="font-medium mb-2">Estatísticas</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Seguindo:</span>{' '}
                      <span className="font-medium">{followingCount}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Seguidores:</span>{' '}
                      <span className="font-medium">{followerCount}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}
