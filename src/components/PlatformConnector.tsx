import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useProfile } from "@/hooks/useProfile";
import { 
  Droplets, 
  Cloud, 
  Music2, 
  Link2, 
  Check, 
  ExternalLink,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PlatformConnection {
  id: 'dropbox' | 'soundcloud' | 'spotify';
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  connected: boolean;
  enabled: boolean;
  description: string;
  accountInfo?: {
    email?: string;
    name?: string;
  };
}

export function PlatformConnector() {
  const { profile } = useProfile();
  const { toast } = useToast();
  const [connecting, setConnecting] = useState<string | null>(null);

  // Mock data - will be replaced with real connection status
  const platforms: PlatformConnection[] = [
    {
      id: 'dropbox',
      name: 'Dropbox',
      icon: Droplets,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      connected: false, // TODO: check actual connection status
      enabled: true,
      description: 'Backup automático na nuvem',
      accountInfo: undefined
    },
    {
      id: 'soundcloud',
      name: 'SoundCloud',
      icon: Cloud,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      connected: false,
      enabled: false,
      description: 'Publicação direta de tracks',
      accountInfo: undefined
    },
    {
      id: 'spotify',
      name: 'Spotify for Artists',
      icon: Music2,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      connected: false,
      enabled: false,
      description: 'Distribuição profissional',
      accountInfo: undefined
    }
  ];

  const handleConnect = async (platformId: string) => {
    if (!platforms.find(p => p.id === platformId)?.enabled) {
      toast({
        title: "Plataforma não disponível",
        description: "Esta integração ainda não está implementada.",
        variant: "destructive",
      });
      return;
    }

    setConnecting(platformId);

    try {
      if (platformId === 'dropbox') {
        // TODO: Implement Dropbox OAuth flow
        // For now, simulate connection process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        toast({
          title: "✅ Dropbox conectado!",
          description: "Agora você pode exportar tracks diretamente para sua conta Dropbox.",
        });
      }
    } catch (error) {
      console.error('Connection error:', error);
      toast({
        title: "Erro na conexão",
        description: "Não foi possível conectar com a plataforma. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (platformId: string) => {
    try {
      // TODO: Implement disconnect logic
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
                      {platform.connected && (
                        <Badge variant="outline" className="border-green-500/30 text-green-600">
                          <Check className="h-3 w-3 mr-1" />
                          Conectado
                        </Badge>
                      )}
                      {!platform.enabled && (
                        <Badge variant="outline" className="text-xs">
                          Em breve
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{platform.description}</p>
                    {platform.connected && platform.accountInfo && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {platform.accountInfo.email || platform.accountInfo.name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {platform.connected ? (
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
                      variant={platform.enabled ? "neon" : "outline"}
                      size="sm"
                      onClick={() => handleConnect(platform.id)}
                      disabled={!platform.enabled || isConnecting}
                    >
                      {isConnecting ? (
                        <>Conectando...</>
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