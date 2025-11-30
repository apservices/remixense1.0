import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
}

export function useComments(postId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);

      const { data: commentsData, error } = await supabase
        .from('comments')
        .select('id, content, created_at, user_id')
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user profiles
      const userIds = [...new Set(commentsData?.map(c => c.user_id) || [])];
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);

      // Map comments with user profiles
      const mappedComments: Comment[] = (commentsData || []).map(comment => {
        const profile = profiles?.find(p => p.id === comment.user_id);
        return {
          id: comment.id,
          content: comment.content,
          createdAt: comment.created_at,
          user: {
            id: comment.user_id,
            username: profile?.username || 'user',
            avatarUrl: profile?.avatar_url
          }
        };
      });

      setComments(mappedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: 'Erro ao carregar comentários',
        description: 'Não foi possível buscar os comentários',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addComment = async (content: string) => {
    try {
      const { data: session } = await supabase.auth.getUser();
      const userId = session.user?.id;

      if (!userId) {
        toast({
          title: 'Login necessário',
          description: 'Faça login para comentar',
          variant: 'destructive'
        });
        return;
      }

      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: userId,
          content
        })
        .select()
        .single();

      if (error) throw error;

      // Increment comment count on post
      await supabase.rpc('increment_comment_count', { post_id: postId });

      // Refresh comments
      await fetchComments();

      toast({
        title: 'Comentário adicionado',
        description: 'Seu comentário foi publicado'
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: 'Erro ao comentar',
        description: 'Não foi possível adicionar o comentário',
        variant: 'destructive'
      });
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const { data: session } = await supabase.auth.getUser();
      const userId = session.user?.id;

      if (!userId) return;

      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', userId);

      if (error) throw error;

      // Decrement comment count on post
      await supabase.rpc('decrement_comment_count', { post_id: postId });

      setComments(prev => prev.filter(c => c.id !== commentId));

      toast({
        title: 'Comentário removido',
        description: 'Seu comentário foi deletado'
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: 'Erro ao deletar',
        description: 'Não foi possível remover o comentário',
        variant: 'destructive'
      });
    }
  };

  return {
    comments,
    isLoading,
    addComment,
    deleteComment,
    refetch: fetchComments
  };
}
