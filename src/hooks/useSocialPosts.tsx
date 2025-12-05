import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface SocialPost {
  id: string;
  user: {
    id: string;
    username: string;
    djName?: string;
    avatarUrl?: string;
  };
  postType: 'set' | 'remix' | 'track' | 'text';
  caption?: string;
  mediaUrls?: string[];
  likeCount: number;
  commentCount: number;
  playCount?: number;
  createdAt: string;
  isLiked: boolean;
  contentId?: string;
}

export function useSocialPosts(feedType: 'foryou' | 'following' | 'trending' = 'foryou') {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, [feedType]);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      
      const { data: session } = await supabase.auth.getUser();
      const userId = session.user?.id;

      // Query social_posts with user profiles
      let query = supabase
        .from('social_posts')
        .select(`
          id,
          post_type,
          caption,
          media_urls,
          like_count,
          comment_count,
          play_count,
          created_at,
          content_id,
          user_id
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      // Apply filters based on feed type
      if (feedType === 'following' && userId) {
        // Get posts from followed users
        const { data: follows } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', userId);
        
        const followingIds = follows?.map(f => f.following_id) || [];
        if (followingIds.length > 0) {
          query = query.in('user_id', followingIds);
        }
      } else if (feedType === 'trending') {
        // Sort by engagement
        query = query.order('like_count', { ascending: false });
      }

      const { data: postsData, error } = await query;

      if (error) throw error;

      // Fetch user profiles for posts - usando VIEW pública segura
      const userIds = [...new Set(postsData?.map(p => p.user_id) || [])];
      const { data: profiles } = await supabase
        .from('public_profiles')
        .select('id, username, dj_name, avatar_url')
        .in('id', userIds);

      // Check which posts are liked by current user
      let likedPostIds: string[] = [];
      if (userId && postsData) {
        const { data: likes } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', userId)
          .in('post_id', postsData.map(p => p.id));
        
        likedPostIds = likes?.map(l => l.post_id) || [];
      }

      // Map posts with user profiles
      const mappedPosts: SocialPost[] = (postsData || []).map(post => {
        const profile = profiles?.find(p => p.id === post.user_id);
        return {
          id: post.id,
          user: {
            id: post.user_id,
            username: profile?.username || 'user',
            djName: profile?.dj_name,
            avatarUrl: profile?.avatar_url
          },
          postType: post.post_type as any,
          caption: post.caption || undefined,
          mediaUrls: post.media_urls || undefined,
          likeCount: post.like_count || 0,
          commentCount: post.comment_count || 0,
          playCount: post.play_count || 0,
          createdAt: post.created_at,
          isLiked: likedPostIds.includes(post.id),
          contentId: post.content_id || undefined
        };
      });

      setPosts(mappedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: 'Erro ao carregar feed',
        description: 'Não foi possível buscar os posts',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLike = async (postId: string) => {
    try {
      const { data: session } = await supabase.auth.getUser();
      const userId = session.user?.id;

      if (!userId) {
        toast({
          title: 'Login necessário',
          description: 'Faça login para curtir posts',
          variant: 'destructive'
        });
        return;
      }

      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.isLiked) {
        // Unlike
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId);

        // Update local state
        setPosts(prev => prev.map(p =>
          p.id === postId
            ? { ...p, isLiked: false, likeCount: p.likeCount - 1 }
            : p
        ));
      } else {
        // Like
        await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: userId });

        // Update local state
        setPosts(prev => prev.map(p =>
          p.id === postId
            ? { ...p, isLiked: true, likeCount: p.likeCount + 1 }
            : p
        ));
      }

      // Update post like_count in database
      await supabase
        .from('social_posts')
        .update({ 
          like_count: post.isLiked ? post.likeCount - 1 : post.likeCount + 1 
        })
        .eq('id', postId);

    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível curtir o post',
        variant: 'destructive'
      });
    }
  };

  return {
    posts,
    isLoading,
    toggleLike,
    refetch: fetchPosts
  };
}
