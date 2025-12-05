import { useInfiniteQuery } from '@tanstack/react-query';
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
  audioUrl?: string;
  likeCount: number;
  commentCount: number;
  playCount?: number;
  createdAt: string;
  isLiked: boolean;
  contentId?: string;
}

interface PostsPage {
  posts: SocialPost[];
  nextCursor: string | null;
}

const PAGE_SIZE = 10;

async function fetchPostsPage(
  feedType: 'foryou' | 'following' | 'trending',
  cursor: string | null
): Promise<PostsPage> {
  const { data: session } = await supabase.auth.getUser();
  const userId = session.user?.id;

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
    .limit(PAGE_SIZE);

  // Pagination cursor
  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  // Feed type filters
  if (feedType === 'following' && userId) {
    const { data: follows } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);
    
    const followingIds = follows?.map(f => f.following_id) || [];
    if (followingIds.length > 0) {
      query = query.in('user_id', followingIds);
    }
  } else if (feedType === 'trending') {
    query = query.order('like_count', { ascending: false });
  }

  const { data: postsData, error } = await query;
  if (error) throw error;

  // Fetch user profiles
  const userIds = [...new Set(postsData?.map(p => p.user_id) || [])];
  const { data: profiles } = await supabase
    .from('public_profiles')
    .select('id, username, dj_name, avatar_url')
    .in('id', userIds);

  // Check liked posts
  let likedPostIds: string[] = [];
  if (userId && postsData?.length) {
    const { data: likes } = await supabase
      .from('post_likes')
      .select('post_id')
      .eq('user_id', userId)
      .in('post_id', postsData.map(p => p.id));
    likedPostIds = likes?.map(l => l.post_id) || [];
  }

  const posts: SocialPost[] = (postsData || []).map(post => {
    const profile = profiles?.find(p => p.id === post.user_id);
    return {
      id: post.id,
      user: {
        id: post.user_id,
        username: profile?.username || 'user',
        djName: profile?.dj_name,
        avatarUrl: profile?.avatar_url
      },
      postType: (post as any).post_type as SocialPost['postType'],
      caption: (post as any).caption || undefined,
      mediaUrls: (post as any).media_urls || undefined,
      audioUrl: undefined,
      likeCount: post.like_count || 0,
      commentCount: post.comment_count || 0,
      playCount: post.play_count || 0,
      createdAt: post.created_at,
      isLiked: likedPostIds.includes(post.id),
      contentId: post.content_id || undefined
    };
  });

  const nextCursor = posts.length === PAGE_SIZE ? posts[posts.length - 1].createdAt : null;

  return { posts, nextCursor };
}

export function useInfinitePosts(feedType: 'foryou' | 'following' | 'trending' = 'foryou') {
  const { toast } = useToast();

  const query = useInfiniteQuery({
    queryKey: ['social-posts', feedType],
    queryFn: ({ pageParam }) => fetchPostsPage(feedType, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

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

      // Find the post in pages
      const allPosts = query.data?.pages.flatMap(p => p.posts) || [];
      const post = allPosts.find(p => p.id === postId);
      if (!post) return;

      if (post.isLiked) {
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId);
      } else {
        await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: userId });
      }

      // Update post like count
      await supabase
        .from('social_posts')
        .update({ like_count: post.isLiked ? post.likeCount - 1 : post.likeCount + 1 })
        .eq('id', postId);

      // Refetch to update UI
      query.refetch();
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível curtir o post',
        variant: 'destructive'
      });
    }
  };

  const allPosts = query.data?.pages.flatMap(p => p.posts) || [];

  return {
    posts: allPosts,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    toggleLike,
    refetch: query.refetch
  };
}
