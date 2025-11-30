import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export function useFollows(userId?: string) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchFollowStatus();
    }
  }, [userId]);

  const fetchFollowStatus = async () => {
    if (!userId) return;

    try {
      setIsLoading(true);

      const { data: session } = await supabase.auth.getUser();
      const currentUserId = session.user?.id;

      // Check if current user follows this user
      if (currentUserId && currentUserId !== userId) {
        const { data: followData } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', currentUserId)
          .eq('following_id', userId)
          .single();

        setIsFollowing(!!followData);
      }

      // Get follower count
      const { count: followers } = await supabase
        .from('follows')
        .select('id', { count: 'exact', head: true })
        .eq('following_id', userId);

      setFollowerCount(followers || 0);

      // Get following count
      const { count: following } = await supabase
        .from('follows')
        .select('id', { count: 'exact', head: true })
        .eq('follower_id', userId);

      setFollowingCount(following || 0);
    } catch (error) {
      console.error('Error fetching follow status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFollow = async () => {
    if (!userId) return;

    try {
      const { data: session } = await supabase.auth.getUser();
      const currentUserId = session.user?.id;

      if (!currentUserId) {
        toast({
          title: 'Login necessário',
          description: 'Faça login para seguir usuários',
          variant: 'destructive'
        });
        return;
      }

      if (currentUserId === userId) {
        toast({
          title: 'Não é possível',
          description: 'Você não pode seguir a si mesmo',
          variant: 'destructive'
        });
        return;
      }

      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUserId)
          .eq('following_id', userId);

        if (error) throw error;

        setIsFollowing(false);
        setFollowerCount(prev => prev - 1);

        toast({
          title: 'Deixou de seguir',
          description: 'Você não segue mais este usuário'
        });
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: currentUserId,
            following_id: userId
          });

        if (error) throw error;

        setIsFollowing(true);
        setFollowerCount(prev => prev + 1);

        toast({
          title: 'Seguindo',
          description: 'Você agora segue este usuário'
        });
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o follow',
        variant: 'destructive'
      });
    }
  };

  return {
    isFollowing,
    followerCount,
    followingCount,
    isLoading,
    toggleFollow,
    refetch: fetchFollowStatus
  };
}
