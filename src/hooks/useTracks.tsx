import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Track {
  id: string;
  user_id: string;
  title: string;
  artist: string;
  duration: string;
  file_path: string | null;
  file_url: string | null;
  type: 'track' | 'remix' | 'sample';
  bpm: number | null;
  genre: string | null;
  key_signature: string | null;
  energy_level: number | null;
  tags: string[] | null;
  is_liked: boolean;
  is_featured: boolean;
  play_count: number;
  created_at: string;
  updated_at: string;
}

export function useTracks() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTracks();
    } else {
      setTracks([]);
      setLoading(false);
    }
  }, [user]);

  const fetchTracks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tracks:', error);
        toast({
          title: "Erro ao carregar tracks",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setTracks((data || []) as Track[]);
      }
    } catch (error) {
      console.error('Error fetching tracks:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTrack = async (trackData: Omit<Track, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'is_liked' | 'is_featured' | 'play_count'>) => {
    if (!user) return { error: 'No user found' };

    try {
      const { data, error } = await supabase
        .from('tracks')
        .insert([{
          ...trackData,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) {
        toast({
          title: "Erro ao adicionar track",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      } else {
        setTracks(prev => [data as Track, ...prev]);
        toast({
          title: "Track adicionado! 🎵",
          description: "Nova música foi adicionada ao seu vault.",
        });
        return { data };
      }
    } catch (error) {
      console.error('Error adding track:', error);
      return { error };
    }
  };

  const updateTrack = async (id: string, updates: Partial<Omit<Track, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!user) return { error: 'No user found' };

    try {
      const { data, error } = await supabase
        .from('tracks')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        toast({
          title: "Erro ao atualizar track",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      } else {
        setTracks(prev => prev.map(track => track.id === id ? data as Track : track));
        return { data };
      }
    } catch (error) {
      console.error('Error updating track:', error);
      return { error };
    }
  };

  const deleteTrack = async (id: string) => {
    if (!user) return { error: 'No user found' };

    try {
      const { error } = await supabase
        .from('tracks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        toast({
          title: "Erro ao deletar track",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      } else {
        setTracks(prev => prev.filter(track => track.id !== id));
        toast({
          title: "Track removido",
          description: "A música foi removida do seu vault.",
        });
        return { success: true };
      }
    } catch (error) {
      console.error('Error deleting track:', error);
      return { error };
    }
  };

  const toggleLike = async (id: string) => {
    const track = tracks.find(t => t.id === id);
    if (!track) return;

    await updateTrack(id, { is_liked: !track.is_liked });
  };

  return {
    tracks,
    loading,
    addTrack,
    updateTrack,
    deleteTrack,
    toggleLike,
    refetch: fetchTracks,
  };
}