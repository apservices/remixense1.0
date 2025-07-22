import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useExports } from "@/hooks/useExports";
import { 
  Upload, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ArrowRight,
  Cloud,
  Music2,
  Droplets
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExportDialogProps {
  trackId: string;
  trackTitle: string;
  trackArtist: string;
  children: React.ReactNode;
}

export function ExportDialog({ trackId, trackTitle, trackArtist, children }: ExportDialogProps) {
  const { createExport, getExportsByTrack, updateExportStatus } = useExports();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'dropbox' | 'soundcloud' | 'spotify'>('dropbox');
  const [isExporting, setIsExporting] = useState(false);
  const [exportForm, setExportForm] = useState({
    title: trackTitle,
    artist: trackArtist,
    description: '',
    visibility: 'private' as 'public' | 'private'
  });

  const trackExports = getExportsByTrack(trackId);
  
  const platforms = [
    {
      id: 'dropbox' as const,
      name: 'Dropbox',
      icon: Droplets,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      enabled: true,
      description: 'Salvar na sua nuvem pessoal'
    },
    {
      id: 'soundcloud' as const,
      name: 'SoundCloud',
      icon: Cloud,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      enabled: false,
      description: 'Publicar no SoundCloud (em breve)'
    },
    {
      id: 'spotify' as const,
      name: 'Spotify',
      icon: Music2,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      enabled: false,
      description: 'Distribuir no Spotify (em breve)'
    }
  ];

  const selectedPlatformData = platforms.find(p => p.id === selectedPlatform);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'uploading':
        return <Upload className="h-4 w-4 text-blue-500 animate-pulse" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'success': return 'Enviado';
      case 'error': return 'Erro';
      case 'uploading': return 'Enviando';
      default: return 'Pendente';
    }
  };

  const handleExport = async () => {
    if (!selectedPlatformData?.enabled) {
      toast({
        title: "Plataforma não disponível",
        description: "Esta plataforma ainda não está implementada.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    
    try {
      // Create export record
      const { data: exportRecord, error } = await createExport({
        track_id: trackId,
        platform: selectedPlatform,
        metadata: {
          title: exportForm.title,
          artist: exportForm.artist,
          description: exportForm.description,
          visibility: exportForm.visibility
        }
      });

      if (error || !exportRecord) {
        throw new Error('Failed to create export record');
      }

      // Update status to uploading
      await updateExportStatus(exportRecord.id, 'uploading');

      // TODO: Implement actual platform upload logic here
      // For now, simulate upload process
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (selectedPlatform === 'dropbox') {
        // Simulate successful Dropbox upload
        await updateExportStatus(exportRecord.id, 'success', {
          external_url: `https://dropbox.com/s/example/${trackTitle.replace(/\s+/g, '_')}.mp3`,
          metadata: {
            ...exportRecord.metadata,
            dropbox_path: `/RemiXense/${trackTitle}.mp3`
          }
        });

        toast({
          title: "✅ Exportado com sucesso!",
          description: `Track enviado para o Dropbox em /RemiXense/${trackTitle}.mp3`,
        });
      }

      setOpen(false);
      
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Erro na exportação",
        description: "Ocorreu um erro durante o envio. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] glass border-glass-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            📤 Exportar Track
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Envie sua música para plataformas externas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Track Info */}
          <Card className="glass border-glass-border p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Music2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{trackTitle}</h3>
                <p className="text-sm text-muted-foreground">{trackArtist}</p>
              </div>
            </div>
          </Card>

          {/* Platform Selection */}
          <div>
            <Label className="text-foreground mb-3 block">Escolha a plataforma</Label>
            <div className="grid grid-cols-1 gap-2">
              {platforms.map((platform) => {
                const Icon = platform.icon;
                return (
                  <Card
                    key={platform.id}
                    className={`glass border-glass-border p-3 cursor-pointer transition-all ${
                      selectedPlatform === platform.id
                        ? 'border-primary/50 bg-primary/5'
                        : platform.enabled
                        ? 'hover:border-primary/30'
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                    onClick={() => platform.enabled && setSelectedPlatform(platform.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${platform.bgColor}`}>
                        <Icon className={`h-5 w-5 ${platform.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-foreground">{platform.name}</h3>
                          {!platform.enabled && (
                            <Badge variant="outline" className="text-xs">
                              Em breve
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{platform.description}</p>
                      </div>
                      {selectedPlatform === platform.id && platform.enabled && (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Export Form */}
          {selectedPlatformData?.enabled && (
            <div className="space-y-4">
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title" className="text-foreground">Título</Label>
                  <Input
                    id="title"
                    value={exportForm.title}
                    onChange={(e) => setExportForm(prev => ({ ...prev, title: e.target.value }))}
                    className="bg-muted"
                  />
                </div>
                <div>
                  <Label htmlFor="artist" className="text-foreground">Artista</Label>
                  <Input
                    id="artist"
                    value={exportForm.artist}
                    onChange={(e) => setExportForm(prev => ({ ...prev, artist: e.target.value }))}
                    className="bg-muted"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-foreground">Descrição (opcional)</Label>
                <Textarea
                  id="description"
                  placeholder="Adicione uma descrição..."
                  value={exportForm.description}
                  onChange={(e) => setExportForm(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-muted"
                  rows={3}
                />
              </div>

              <div>
                <Label className="text-foreground">Visibilidade</Label>
                <Select value={exportForm.visibility} onValueChange={(value: 'public' | 'private') => setExportForm(prev => ({ ...prev, visibility: value }))}>
                  <SelectTrigger className="bg-muted">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Privado</SelectItem>
                    <SelectItem value="public">Público</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Export History */}
          {trackExports.length > 0 && (
            <div>
              <Separator />
              <Label className="text-foreground mb-3 block">Histórico de exportações</Label>
              <div className="space-y-2">
                {trackExports.slice(0, 3).map((exportRecord) => {
                  const platform = platforms.find(p => p.id === exportRecord.platform);
                  return (
                    <div key={exportRecord.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        {platform && <platform.icon className={`h-4 w-4 ${platform.color}`} />}
                        <span className="text-sm text-foreground">{platform?.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(exportRecord.status)}
                        <span className="text-xs text-muted-foreground">
                          {getStatusLabel(exportRecord.status)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="neon"
              className="flex-1"
              onClick={handleExport}
              disabled={!selectedPlatformData?.enabled || isExporting}
            >
              {isExporting ? (
                <>
                  <Upload className="h-4 w-4 mr-2 animate-pulse" />
                  Enviando...
                </>
              ) : (
                <>
                  Exportar
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}