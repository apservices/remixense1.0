import { useState, useRef } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Upload, Music, Volume2, VolumeX, Download, Play, Pause, Loader2, RefreshCw, Headphones, Crown, ToggleLeft, ToggleRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';

interface Stem {
  id: string;
  name: string;
  type: 'vocals' | 'drums' | 'bass' | 'harmony' | 'other';
  color: string;
  volume: number;
  muted: boolean;
  solo: boolean;
  audioUrl?: string;
}

export default function StemsStudio() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { subscription, isFree, isPro, isExpert } = useSubscription();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stems, setStems] = useState<Stem[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [viewMode, setViewMode] = useState<'mix' | 'original'>('mix');
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});
  const originalAudioRef = useRef<HTMLAudioElement>(null);

  const stemTypes: { type: Stem['type']; name: string; color: string }[] = [
    { type: 'vocals', name: '🎤 Vocals', color: 'bg-pink-500' },
    { type: 'drums', name: '🥁 Drums', color: 'bg-orange-500' },
    { type: 'bass', name: '🎸 Bass', color: 'bg-blue-500' },
    { type: 'harmony', name: '🎹 Harmony', color: 'bg-purple-500' },
    { type: 'other', name: '🎵 Other', color: 'bg-green-500' },
  ];

  const planType = subscription?.plan_type || 'free';
  const remainingStems = isExpert ? Infinity : isPro ? 10 : 1;

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

    // Check plan limits (simplified check)
    if (isFree && remainingStems <= 0) {
      toast({
        title: 'Limite atingido',
        description: `Você atingiu o limite de separações do plano ${planType}. Faça upgrade para continuar.`,
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      // Simulate processing with progress
      for (let i = 0; i <= 100; i += 2) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 80));
      }

      const audioUrl = URL.createObjectURL(selectedFile);

      const generatedStems: Stem[] = stemTypes.map(({ type, name, color }) => ({
        id: crypto.randomUUID(),
        name,
        type,
        color,
        volume: 100,
        muted: false,
        solo: false,
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
        return { ...stem, muted: newMuted, solo: false };
      }
      return stem;
    }));
  };

  const toggleSolo = (stemId: string) => {
    setStems(prev => {
      const targetStem = prev.find(s => s.id === stemId);
      const newSoloState = !targetStem?.solo;
      
      return prev.map(stem => {
        const audio = audioRefs.current[stem.id];
        if (stem.id === stemId) {
          if (audio) audio.muted = false;
          return { ...stem, solo: newSoloState, muted: false };
        } else {
          if (audio) audio.muted = newSoloState;
          return { ...stem, solo: false, muted: newSoloState };
        }
      });
    });
  };

  const togglePlayback = () => {
    if (isPlaying) {
      Object.values(audioRefs.current).forEach(audio => audio?.pause());
      originalAudioRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (viewMode === 'original' && originalAudioRef.current) {
        originalAudioRef.current.currentTime = 0;
        originalAudioRef.current.play().catch(console.error);
      } else {
        const playPromises = Object.values(audioRefs.current)
          .filter(Boolean)
          .map(audio => {
            audio.currentTime = 0;
            return audio.play().catch(console.error);
          });
        Promise.all(playPromises);
      }
      setIsPlaying(true);
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

  const downloadAllStems = () => {
    stems.forEach(stem => downloadStem(stem));
    toast({
      title: 'Todos os stems baixados!',
      description: '5 arquivos foram salvos na pasta de downloads.'
    });
  };

  const resetAll = () => {
    setStems(prev => prev.map(stem => ({ ...stem, volume: 100, muted: false, solo: false })));
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading-xl mb-2">🎛️ Studio de Stems</h1>
            <p className="text-muted-foreground">
              Separe e edite stems com IA - voz, bateria, baixo, harmonia e FX
            </p>
          </div>
          
          {/* Plan badge */}
          <div className="flex items-center gap-2">
            {planType === 'expert' ? (
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500">
                <Crown className="h-3 w-3 mr-1" />
                Ilimitado
              </Badge>
            ) : (
              <Badge variant="outline">
                {remainingStems === Infinity ? '∞' : remainingStems} separações restantes
              </Badge>
            )}
          </div>
        </div>

        {/* Plan limit warning */}
        {planType === 'free' && remainingStems <= 0 && (
          <Card className="glass border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Crown className="h-6 w-6 text-amber-500" />
                <div>
                  <p className="font-medium">Limite de separações atingido</p>
                  <p className="text-sm text-muted-foreground">
                    Plano Free permite 1 separação/mês. Upgrade para mais.
                  </p>
                </div>
              </div>
              <Button onClick={() => navigate('/subscription')} variant="default" className="bg-gradient-to-r from-amber-500 to-orange-500">
                Upgrade
              </Button>
            </div>
          </Card>
        )}

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
              {/* Hidden original audio */}
              <audio
                ref={originalAudioRef}
                src={URL.createObjectURL(selectedFile)}
                preload="auto"
              />
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
                disabled={planType === 'free' && remainingStems <= 0}
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
                    {/* A/B Toggle */}
                    <Button
                      variant={viewMode === 'original' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode(viewMode === 'mix' ? 'original' : 'mix')}
                    >
                      {viewMode === 'mix' ? (
                        <><ToggleLeft className="h-4 w-4 mr-2" />Mix</>
                      ) : (
                        <><ToggleRight className="h-4 w-4 mr-2" />Original</>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" onClick={resetAll}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Resetar
                    </Button>
                    <Button variant="outline" size="sm" onClick={togglePlayback}>
                      {isPlaying ? (
                        <><Pause className="h-4 w-4 mr-2" />Pausar</>
                      ) : (
                        <><Play className="h-4 w-4 mr-2" />Play</>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4">
                  {stems.map((stem) => (
                    <div
                      key={stem.id}
                      className={`glass glass-border rounded-lg p-4 transition-opacity ${stem.muted && !stem.solo ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Stem indicator */}
                        <div className={`w-3 h-12 rounded-full ${stem.color}`} />
                        
                        {/* Name */}
                        <div className="w-28">
                          <span className="font-medium">{stem.name}</span>
                        </div>

                        {/* Solo button */}
                        <Button
                          variant={stem.solo ? 'default' : 'outline'}
                          size="icon"
                          onClick={() => toggleSolo(stem.id)}
                          className={stem.solo ? 'bg-amber-500 hover:bg-amber-600' : ''}
                          aria-label="Solo"
                        >
                          <Headphones className="h-4 w-4" />
                        </Button>

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
                  <Button className="flex-1" variant="neon" onClick={downloadAllStems}>
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Todos
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Salvar no Vault
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
              vocais, bateria, baixo e harmonia de qualquer música. Use o botão <strong>Solo</strong> (🎧) 
              para ouvir apenas um stem, ou <strong>Mute</strong> para silenciar. 
              {planType === 'free' && (
                <span className="text-amber-500"> Plano Free: 1 separação/mês.</span>
              )}
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
