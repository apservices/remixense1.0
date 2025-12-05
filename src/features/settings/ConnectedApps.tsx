import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link2, Unlink, Loader2, ExternalLink, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ConnectedApp {
  id: string;
  platform_name: string;
  connected_at: string;
  expires_at: string | null;
}

interface Platform {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  supported: boolean;
}

const PLATFORMS: Platform[] = [
  { 
    id: 'spotify', 
    name: 'Spotify', 
    icon: '🎵',
    color: 'bg-emerald-500',
    description: 'Sincronize playlists e analytics',
    supported: true
  },
  { 
    id: 'soundcloud', 
    name: 'SoundCloud', 
    icon: '☁️',
    color: 'bg-orange-500',
    description: 'Publique e analise tracks',
    supported: true
  },
  { 
    id: 'dropbox', 
    name: 'Dropbox', 
    icon: '📦',
    color: 'bg-blue-500',
    description: 'Backup e sincronização de arquivos',
    supported: true
  },
  { 
    id: 'tiktok', 
    name: 'TikTok', 
    icon: '📱',
    color: 'bg-slate-900',
    description: 'Compartilhe clipes e tracks',
    supported: false
  },
  { 
    id: 'instagram', 
    name: 'Instagram', 
    icon: '📸',
    color: 'bg-gradient-to-br from-purple-500 to-pink-500',
    description: 'Poste stories e reels',
    supported: false
  },
  { 
    id: 'youtube', 
    name: 'YouTube', 
    icon: '▶️',
    color: 'bg-red-500',
    description: 'Upload de vídeos e música',
    supported: false
  }
];

export default function ConnectedApps() {
  const { user } = useAuth();
  const [connections, setConnections] = useState<ConnectedApp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadConnections();
    }
  }, [user?.id]);

  const loadConnections = async () => {
    const { data, error } = await supabase
      .from('platform_connections')
      .select('*')
      .eq('user_id', user!.id);

    if (data) {
      setConnections(data);
    }
    setIsLoading(false);
  };

  const connectPlatform = async (platform: Platform) => {
    if (!platform.supported) {
      toast.info(`${platform.name} estará disponível em breve!`);
      return;
    }

    setConnecting(platform.id);
    
    try {
      const { data, error } = await supabase.functions.invoke('platform-oauth-init', {
        body: { platform: platform.id }
      });

      if (error) throw error;
      
      // Check for url (new) or auth_url (legacy)
      const redirectUrl = data?.url || data?.auth_url;
      
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else if (data?.error) {
        throw new Error(data.error);
      }
    } catch (error: any) {
      const message = error.message || 'Erro desconhecido';
      if (message.includes('not configured')) {
        toast.error(`${platform.name} ainda não está configurado no servidor`);
      } else {
        toast.error(`Erro ao conectar: ${message}`);
      }
    } finally {
      setConnecting(null);
    }
  };

  const disconnectPlatform = async (connectionId: string, platformName: string) => {
    try {
      const { error } = await supabase
        .from('platform_connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;
      
      setConnections(prev => prev.filter(c => c.id !== connectionId));
      toast.success(`${platformName} desconectado`);
    } catch (error: any) {
      toast.error(`Erro ao desconectar: ${error.message}`);
    }
  };

  const isConnected = (platformId: string) => {
    return connections.some(c => c.platform_name === platformId);
  };

  const getConnection = (platformId: string) => {
    return connections.find(c => c.platform_name === platformId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Separate supported and coming soon platforms
  const supportedPlatforms = PLATFORMS.filter(p => p.supported);
  const comingSoonPlatforms = PLATFORMS.filter(p => !p.supported);

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="w-5 h-5" />
          Apps Conectados
        </CardTitle>
        <CardDescription>Conecte suas plataformas de música e redes sociais</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Supported Platforms */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Disponíveis</h3>
              {supportedPlatforms.map((platform) => {
                const connected = isConnected(platform.id);
                const connection = getConnection(platform.id);
                
                return (
                  <div 
                    key={platform.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${platform.color} flex items-center justify-center text-xl`}>
                        {platform.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{platform.name}</p>
                          {connected && (
                            <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                              Conectado
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{platform.description}</p>
                        {connected && connection && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Desde {formatDate(connection.connected_at)}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {connected ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => disconnectPlatform(connection!.id, platform.name)}
                      >
                        <Unlink className="w-4 h-4 mr-1" />
                        Desconectar
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => connectPlatform(platform)}
                        disabled={connecting === platform.id}
                      >
                        {connecting === platform.id ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <ExternalLink className="w-4 h-4 mr-1" />
                        )}
                        Conectar
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Coming Soon Platforms */}
            {comingSoonPlatforms.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Em breve
                </h3>
                {comingSoonPlatforms.map((platform) => (
                  <div 
                    key={platform.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/20 opacity-60"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${platform.color} flex items-center justify-center text-xl grayscale`}>
                        {platform.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{platform.name}</p>
                          <Badge variant="outline" className="text-xs">
                            Em breve
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{platform.description}</p>
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                    >
                      Indisponível
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
