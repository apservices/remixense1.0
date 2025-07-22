
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { usePlatformAuth } from "@/hooks/usePlatformAuth";
import { 
  Droplets, 
  Cloud, 
  Music2, 
  Link2, 
  Check, 
  Settings,
  Loader2
} from "lucide-react";

interface PlatformConfig {
  id: 'dropbox' | 'soundcloud' | 'spotify';
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  enabled: boolean;
  description: string;
}

export function PlatformConnector() {
  const { connections, loading, connectPlatform, disconnectPlatform, isConnected, getConnection } = usePlatformAuth();
  const [connecting, setConnecting] = useState<string | null>(null);

  const platforms: PlatformConfig[] = [
    {
      id: 'dropbox',
      name: 'Dropbox',
      icon: Droplets,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      enabled: true,
      description: 'Backup automático na nuvem'
    },
    {
      id: 'soundcloud',
      name: 'SoundCloud',
      icon: Cloud,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      enabled: true,
      description: 'Publicação direta de tracks'
    },
    {
      id: 'spotify',
      name: 'Spotify for Artists',
      icon: Music2,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      enabled: true,
      description: 'Distribuição profissional'
    }
  ];

  const handleConnect = async (platformId: 'dropbox' | 'soundcloud' | 'spotify') => {
    setConnecting(platformId);
    try {
      await connectPlatform(platformId);
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (platformId: 'dropbox' | 'soundcloud' | 'spotify') => {
    await disconnectPlatform(platformId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Link2 className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Conexões de Plataforma</h3>
      </div>
      
      <p className="text-sm text-muted-foreground mb-6">
        Conecte suas contas para exportar tracks diretamente do RemiXense
      </p>

      <div className="space-y-3">
        {platforms.map((platform) => {
          const Icon = platform.icon;
          const isConnecting = connecting === platform.id;
          const connected = isConnected(platform.id);
          const connection = getConnection(platform.id);
          
          return (
            <Card key={platform.id} className="glass border-glass-border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${platform.bgColor}`}>
                    <Icon className={`h-5 w-5 ${platform.color}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-foreground">{platform.name}</h4>
                      {connected && (
                        <Badge variant="outline" className="border-green-500/30 text-green-600">
                          <Check className="h-3 w-3 mr-1" />
                          Conectado
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{platform.description}</p>
                    {connected && connection?.account_info && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {connection.account_info.email || connection.account_info.display_name || connection.account_info.name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {connected ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDisconnect(platform.id)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnect(platform.id)}
                      >
                        Desconectar
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="neon"
                      size="sm"
                      onClick={() => handleConnect(platform.id)}
                      disabled={isConnecting}
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Conectando...
                        </>
                      ) : (
                        <>
                          <Link2 className="h-4 w-4 mr-2" />
                          Conectar
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Separator />

      <div className="p-4 bg-muted/30 rounded-lg">
        <h4 className="font-medium text-foreground mb-2">🔒 Segurança</h4>
        <p className="text-xs text-muted-foreground">
          Suas credenciais são armazenadas de forma segura e criptografada. 
          Você pode desconectar qualquer plataforma a qualquer momento.
        </p>
      </div>
    </div>
  );
}
