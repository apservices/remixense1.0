import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Loader2, Volume2, VolumeX, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { separateStems, type StemSeparationResult } from '@/services/audio/stems-service';

interface StemsEditorProps {
  trackId: string;
  trackTitle: string;
  audioFile?: File;
}

export function StemsEditor({ trackId, trackTitle, audioFile }: StemsEditorProps) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [stems, setStems] = useState<StemSeparationResult | null>(null);
  const [volumes, setVolumes] = useState({
    vocals: 100,
    drums: 100,
    bass: 100,
    harmony: 100,
    fx: 100,
    other: 100
  });
  const [muted, setMuted] = useState({
    vocals: false,
    drums: false,
    bass: false,
    harmony: false,
    fx: false,
    other: false
  });

  const stemColors = {
    vocals: 'bg-neon-violet',
    drums: 'bg-neon-teal',
    bass: 'bg-neon-blue',
    harmony: 'bg-neon-green',
    fx: 'text-warning',
    other: 'bg-neon-pink'
  };

  const handleSeparate = async () => {
    if (!audioFile) {
      toast({
        title: 'Erro',
        description: 'Nenhum arquivo de áudio fornecido',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    try {
      const result = await separateStems(audioFile, trackId);
      setStems(result);
      
      toast({
        title: '✨ Stems separados com sucesso!',
        description: `Processado em ${(result.processingTime / 1000).toFixed(1)}s`
      });
    } catch (error) {
      console.error('Erro ao separar stems:', error);
      toast({
        title: 'Erro na separação',
        description: 'Não foi possível separar os stems',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVolumeChange = (stem: keyof typeof volumes, value: number[]) => {
    setVolumes(prev => ({ ...prev, [stem]: value[0] }));
  };

  const toggleMute = (stem: keyof typeof muted) => {
    setMuted(prev => ({ ...prev, [stem]: !prev[stem] }));
  };

  const downloadStem = (stemUrl: string, stemType: string) => {
    const link = document.createElement('a');
    link.href = stemUrl;
    link.download = `${trackTitle}_${stemType}.wav`;
    link.click();
  };

  if (isProcessing) {
    return (
      <Card className="glass glass-border p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <div className="text-center">
            <h3 className="text-heading-lg mb-2">🎵 IA separando sua música</h3>
            <p className="text-muted-foreground">
              Aguarde enquanto separamos os stems...
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (!stems) {
    return (
      <Card className="glass glass-border p-8">
        <div className="text-center space-y-4">
          <h3 className="text-heading-lg">Separação de Stems por IA</h3>
          <p className="text-muted-foreground">
            Separe automaticamente voz, bateria, baixo, harmonia e efeitos
          </p>
          <Button
            onClick={handleSeparate}
            size="lg"
            className="neon-glow"
          >
            🎛️ Separar Stems
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="glass glass-border p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-heading-lg">Mixer de Stems</h3>
          <Button variant="outline" size="sm">
            💾 Salvar Mix
          </Button>
        </div>

        {/* Waveform placeholder */}
        <div className="relative h-32 rounded-lg bg-muted/20 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Waveform visualização</p>
          </div>
        </div>

        {/* Stems controls */}
        <div className="space-y-4">
          {stems.stems.map((stem) => (
            <div
              key={stem.type}
              className="glass glass-border rounded-lg p-4 space-y-3 transition-smooth hover:neon-glow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${stemColors[stem.type]}`} />
                  <span className="font-medium capitalize">{stem.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleMute(stem.type)}
                  >
                    {muted[stem.type] ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadStem(stem.fileUrl, stem.type)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground w-8">
                  {muted[stem.type] ? 0 : volumes[stem.type]}%
                </span>
                <Slider
                  value={[muted[stem.type] ? 0 : volumes[stem.type]]}
                  onValueChange={(value) => handleVolumeChange(stem.type, value)}
                  max={100}
                  step={1}
                  className="flex-1"
                  disabled={muted[stem.type]}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Master controls */}
        <div className="flex gap-2 pt-4 border-t border-border">
          <Button variant="outline" className="flex-1">
            ⏮️ Solo All
          </Button>
          <Button variant="outline" className="flex-1">
            🔇 Mute All
          </Button>
          <Button variant="outline" className="flex-1">
            🔄 Reset
          </Button>
        </div>
      </div>
    </Card>
  );
}
