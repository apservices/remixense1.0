
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface PlatformConnection {
  id: string;
  user_id: string;
  platform: 'dropbox' | 'soundcloud' | 'spotify';
  access_token: string;
  refresh_token?: string;
  expires_at?: string;
  account_info: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export function usePlatformAuth() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [connections, setConnections] = useState<PlatformConnection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchConnections();
    } else {
      setConnections([]);
      setLoading(false);
    }
  }, [user]);

  const fetchConnections = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('platform_connections')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setConnections(data || []);
    } catch (error) {
      console.error('Error fetching connections:', error);
      setConnections([]);
    } finally {
      setLoading(false);
    }
  };

  const connectPlatform = async (platform: 'dropbox' | 'soundcloud' | 'spotify') => {
    if (!user) return;

    try {
      // Call the OAuth initialization edge function
      const { data, error } = await supabase.functions.invoke('platform-oauth-init', {
        body: { platform },
      });

      if (error) throw error;

      // Redirect to OAuth URL
      window.location.href = data.auth_url;
    } catch (error) {
      console.error('OAuth init error:', error);
      toast({
        title: "Erro na conexão",
        description: "Não foi possível iniciar a conexão. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const disconnectPlatform = async (platform: 'dropbox' | 'soundcloud' | 'spotify') => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('platform_connections')
        .delete()
        .eq('user_id', user.id)
        .eq('platform', platform);

      if (error) throw error;

      setConnections(prev => prev.filter(conn => conn.platform !== platform));
      
      toast({
        title: "Plataforma desconectada",
        description: "A conexão foi removida com sucesso.",
      });
    } catch (error) {
      console.error('Disconnect error:', error);
      toast({
        title: "Erro ao desconectar",
        description: "Não foi possível remover a conexão.",
        variant: "destructive",
      });
    }
  };

  const isConnected = (platform: 'dropbox' | 'soundcloud' | 'spotify') => {
    return connections.some(conn => conn.platform === platform);
  };

  const getConnection = (platform: 'dropbox' | 'soundcloud' | 'spotify') => {
    return connections.find(conn => conn.platform === platform);
  };

  return {
    connections,
    loading,
    connectPlatform,
    disconnectPlatform,
    isConnected,
    getConnection,
    refetch: fetchConnections,
  };
}
