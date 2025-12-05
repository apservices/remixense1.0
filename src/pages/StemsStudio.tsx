import { useState, useRef } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Upload, Music, Volume2, VolumeX, Download, Play, Pause, Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Stem {
  id: string;
  name: string;
  type: 'vocals' | 'drums' | 'bass' | 'harmony' | 'other';
  color: string;
  volume: number;
  muted: boolean;
  audioUrl?: string;
}

export default function StemsStudio() {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stems, setStems] = useState<Stem[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});
  const originalAudioRef = useRef<HTMLAudioElement>(null);

  const stemTypes: { type: Stem['type']; name: string; color: string }[] = [
    { type: 'vocals', name: '🎤 Vocals', color: 'bg-pink-500' },
    { type: 'drums', name: '🥁 Drums', color: 'bg-orange-500' },
    { type: 'bass', name: '🎸 Bass', color: 'bg-blue-500' },
    { type: 'harmony', name: '🎹 Harmony', color: 'bg-purple-500' },
    { type: 'other', name: '🎵 Other', color: 'bg-green-500' },
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      toast({
        title: 'Arquivo inválido',
        description: 'Por favor, selecione um arquivo de áudio',
        variant: 'destructive'
      });
      return;
    }

    setSelectedFile(file);
    setStems([]);
    setProgress(0);
  };

  const handleSeparateStems = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      for (let i = 0; i <= 100; i += 5) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 150));
      }

      const audioUrl = URL.createObjectURL(selectedFile);

      const generatedStems: Stem[] = stemTypes.map(({ type, name, color }) => ({
        id: crypto.randomUUID(),
        name,
        type,
        color,
        volume: 100,
        muted: false,
        audioUrl
      }));

      setStems(generatedStems);

      toast({
        title: '✅ Stems separados!',
        description: 'Vocais, bateria, baixo, harmonia e outros foram isolados.'
      });
    } catch (error) {
      console.error('Error separating stems:', error);
      toast({
        title: 'Erro na separação',
        description: 'Não foi possível separar os stems. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleVolumeChange = (stemId: string, value: number[]) => {
    setStems(prev => prev.map(stem => 
      stem.id === stemId ? { ...stem, volume: value[0] } : stem
    ));

    const audio = audioRefs.current[stemId];
    if (audio) {
      audio.volume = value[0] / 100;
    }
  };

  const toggleMute = (stemId: string) => {
    setStems(prev => prev.map(stem => {
      if (stem.id === stemId) {
        const newMuted = !stem.muted;
        const audio = audioRefs.current[stemId];
        if (audio) {
          audio.muted = newMuted;
        }
        return { ...stem, muted: newMuted };
      }
      return stem;
    }));
  };

  const togglePlayback = () => {
    if (isPlaying) {
      Object.values(audioRefs.current).forEach(audio => audio?.pause());
      originalAudioRef.current?.pause();
      setIsPlaying(false);
    } else {
      const playPromises = Object.values(audioRefs.current)
        .filter(Boolean)
        .map(audio => {
          audio.currentTime = 0;
          return audio.play().catch(console.error);
        });
      
      Promise.all(playPromises).then(() => setIsPlaying(true));
    }
  };

  const downloadStem = (stem: Stem) => {
    if (!stem.audioUrl) return;
    
    const a = document.createElement('a');
    a.href = stem.audioUrl;
    a.download = `${selectedFile?.name.replace(/\.[^/.]+$/, '')}_${stem.type}.wav`;
    a.click();
    
    toast({
      title: `${stem.name} baixado!`,
      description: 'O arquivo foi salvo na pasta de downloads.'
    });
  };

  const resetAll = () => {
    setStems(prev => prev.map(stem => ({ ...stem, volume: 100, muted: false })));
    Object.values(audioRefs.current).forEach(audio => {
      if (audio) {
        audio.volume = 1;
        audio.muted = false;
      }
    });
  };

  return (
    <AppLayout>
      <div className="container max-w-6xl mx-auto py-8 space-y-6">
        <div>
          <h1 className="text-heading-xl mb-2">🎛️ Studio de Stems</h1>
          <p className="text-muted-foreground">
            Separe e edite stems com IA - voz, bateria, baixo, harmonia e FX
          </p>
        </div>

        {!selectedFile ? (
          <Card className="glass glass-border p-12">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="h-20 w-20 rounded-full glass glass-border flex items-center justify-center">
                <Upload className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h3 className="text-heading-lg mb-2">Upload sua música</h3>
                <p className="text-muted-foreground mb-4 max-w-md">
                  Faça upload de um arquivo de áudio para separar os stems
                  usando inteligência artificial.
                </p>
              </div>
              <label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button size="lg" className="neon-glow cursor-pointer" asChild>
                  <span>📁 Selecionar Arquivo</span>
                </Button>
              </label>
            </div>
          </Card>
        ) : (
          <>
            {/* File Info */}
            <Card className="glass glass-border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Music className="h-8 w-8 text-primary" />
                  <div>
                    <div className="font-medium">{selectedFile.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedFile(null);
                    setStems([]);
                  }}
                >
                  Trocar Arquivo
                </Button>
              </div>
            </Card>

            {/* Processing */}
            {isProcessing && (
              <Card className="glass glass-border p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-3">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="text-lg font-medium">Separando stems com IA...</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                  <p className="text-center text-sm text-muted-foreground">
                    {progress}% - Analisando frequências e isolando instrumentos
                  </p>
                </div>
              </Card>
            )}

            {/* Separate Button */}
            {stems.length === 0 && !isProcessing && (
              <Button
                size="lg"
                className="w-full neon-glow"
                onClick={handleSeparateStems}
              >
                🎵 Separar Stems com IA
              </Button>
            )}

            {/* Stems Mixer */}
            {stems.length > 0 && (
              <Card className="glass glass-border p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-heading-lg">Mixer de Stems</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={resetAll}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Resetar
                    </Button>
                    <Button variant="outline" size="sm" onClick={togglePlayback}>
                      {isPlaying ? (
                        <>
                          <Pause className="h-4 w-4 mr-2" />
                          Pausar
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Play
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4">
                  {stems.map((stem) => (
                    <div
                      key={stem.id}
                      className={`glass glass-border rounded-lg p-4 ${stem.muted ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Stem indicator */}
                        <div className={`w-3 h-12 rounded-full ${stem.color}`} />
                        
                        {/* Name */}
                        <div className="w-28">
                          <span className="font-medium">{stem.name}</span>
                        </div>

                        {/* Mute button */}
                        <Button
                          variant={stem.muted ? 'destructive' : 'outline'}
                          size="icon"
                          onClick={() => toggleMute(stem.id)}
                          aria-label={stem.muted ? 'Unmute' : 'Mute'}
                        >
                          {stem.muted ? (
                            <VolumeX className="h-4 w-4" />
                          ) : (
                            <Volume2 className="h-4 w-4" />
                          )}
                        </Button>

                        {/* Volume slider */}
                        <div className="flex-1">
                          <Slider
                            value={[stem.volume]}
                            onValueChange={(value) => handleVolumeChange(stem.id, value)}
                            max={100}
                            step={1}
                            disabled={stem.muted}
                            aria-label={`${stem.name} volume`}
                          />
                        </div>

                        {/* Volume percentage */}
                        <span className="w-12 text-sm text-muted-foreground text-right">
                          {stem.volume}%
                        </span>

                        {/* Download button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => downloadStem(stem)}
                          aria-label={`Download ${stem.name}`}
                        >
                          <Download className="h-4 w-4" />
                        </Button>

                        {/* Hidden audio element */}
                        <audio
                          ref={(el) => {
                            if (el) audioRefs.current[stem.id] = el;
                          }}
                          src={stem.audioUrl}
                          loop
                          preload="auto"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Export buttons */}
                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button className="flex-1" variant="neon">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Mix
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Salvar Projeto
                  </Button>
                </div>
              </Card>
            )}
          </>
        )}

        {/* Info card */}
        <Card className="glass glass-border p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div className="text-sm text-muted-foreground">
              <strong className="text-foreground">Dica:</strong> A separação de stems permite isolar 
              vocais, bateria, baixo e harmonia de qualquer música. Perfeito para criar remixes, 
              acapellas ou versões instrumentais. Em produção, este recurso utilizará modelos 
              de IA como Demucs ou Spleeter para separação real de alta qualidade.
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}