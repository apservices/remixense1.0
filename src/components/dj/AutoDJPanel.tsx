import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Loader2, Play, Pause, SkipForward, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateAutoMix, type AutoDJResult } from '@/services/audio/auto-dj';
import { useTracks } from '@/hooks/useTracks';
import { supabase } from '@/integrations/supabase/client';

export function AutoDJPanel() {
  const { toast } = useToast();
  const { tracks } = useTracks();
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSet, setGeneratedSet] = useState<AutoDJResult | null>(null);
  const [setName, setSetName] = useState('');
  const [crossfader, setCrossfader] = useState([50]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioARef = useRef<HTMLAudioElement>(null);
  const audioBRef = useRef<HTMLAudioElement>(null);

  // Load audio when tracks change
  useEffect(() => {
    if (!generatedSet) return;
    
    const loadTrack = async (index: number, audioRef: React.RefObject<HTMLAudioElement>) => {
      const track = generatedSet.tracks[index];
      if (!track || !audioRef.current) {
        console.log('Cannot load track - missing track or audio element:', { track: !!track, ref: !!audioRef.current });
        return;
      }

      try {
        console.log('Loading track:', track.title, track.fileUrl);
        
        if (track.fileUrl) {
          audioRef.current.src = track.fileUrl;
          await audioRef.current.load();
          console.log('Track loaded successfully');
        } else {
          console.error('No fileUrl for track:', track.title);
          toast({
            title: 'Erro ao carregar áudio',
            description: `Faixa ${track.title} não tem URL válida`,
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error('Error loading track:', error);
        toast({
          title: 'Erro ao carregar áudio',
          description: 'Não foi possível carregar a faixa',
          variant: 'destructive'
        });
      }
    };

    loadTrack(currentTrackIndex, audioARef);
    if (currentTrackIndex + 1 < generatedSet.tracks.length) {
      loadTrack(currentTrackIndex + 1, audioBRef);
    }
  }, [generatedSet, currentTrackIndex, toast]);

  // Handle crossfader mixing
  useEffect(() => {
    if (!audioARef.current || !audioBRef.current) return;

    const fadeValue = crossfader[0] / 100;
    audioARef.current.volume = 1 - fadeValue;
    audioBRef.current.volume = fadeValue;
  }, [crossfader]);

  const togglePlayback = async () => {
    if (!audioARef.current) {
      console.error('Audio element not available');
      toast({
        title: 'Erro',
        description: 'Player de áudio não está pronto',
        variant: 'destructive'
      });
      return;
    }

    try {
      if (isPlaying) {
        audioARef.current.pause();
        audioBRef.current?.pause();
        setIsPlaying(false);
        console.log('Playback paused');
      } else {
        console.log('Starting playback, src:', audioARef.current.src);
        
        if (!audioARef.current.src) {
          toast({
            title: 'Nenhuma faixa carregada',
            description: 'Aguarde o carregamento da faixa',
            variant: 'destructive'
          });
          return;
        }

        await audioARef.current.play();
        setIsPlaying(true);
        console.log('Playback started');
        
        if (crossfader[0] > 50 && audioBRef.current && audioBRef.current.src) {
          await audioBRef.current.play();
          console.log('Deck B started');
        }
      }
    } catch (error) {
      console.error('Playback error:', error);
      toast({
        title: 'Erro na reprodução',
        description: error instanceof Error ? error.message : 'Não foi possível reproduzir a faixa',
        variant: 'destructive'
      });
      setIsPlaying(false);
    }
  };

  const skipToNext = () => {
    if (!generatedSet || currentTrackIndex >= generatedSet.tracks.length - 1) return;
    
    setCurrentTrackIndex(prev => prev + 1);
    setIsPlaying(false);
    audioARef.current?.pause();
    audioBRef.current?.pause();
  };

  const skipToPrevious = () => {
    if (currentTrackIndex <= 0) return;
    
    setCurrentTrackIndex(prev => prev - 1);
    setIsPlaying(false);
    audioARef.current?.pause();
    audioBRef.current?.pause();
  };

  const handleGenerateMix = async () => {
    if (selectedTracks.length < 2) {
      toast({
        title: 'Selecione pelo menos 2 faixas',
        description: 'O Auto-DJ precisa de no mínimo 2 músicas',
        variant: 'destructive'
      });
      return;
    }

    // Verificar se as tracks têm BPM e Key analisados
    const selectedTracksData = tracks.filter(t => selectedTracks.includes(t.id));
    const missingAnalysis = selectedTracksData.filter(t => !t.bpm || !t.key_signature);
    
    if (missingAnalysis.length > 0) {
      toast({
        title: '⚠️ Análise necessária',
        description: `${missingAnalysis.length} faixa(s) sem BPM/Key detectado. Clique em "Re-analisar" no Vault primeiro.`,
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    try {
      console.log('🎧 Gerando Auto-DJ com tracks:', selectedTracks);
      
      const result = await generateAutoMix(
        selectedTracks,
        setName || 'Auto DJ Set'
      );
      
      console.log('✅ Auto-DJ resultado:', result);
      
      setGeneratedSet(result);
      setCurrentTrackIndex(0);
      
      toast({
        title: '🎧 Set criado com sucesso!',
        description: `${result.tracks.length} faixas mixadas • ${Math.round(result.totalDuration / 60)}min • ${result.compatibilityScore}% compatibilidade`
      });
    } catch (error) {
      console.error('❌ Erro ao gerar mix:', error);
      toast({
        title: 'Erro ao gerar set',
        description: error instanceof Error ? error.message : 'Não foi possível criar o mix automático',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleTrackSelection = (trackId: string) => {
    setSelectedTracks(prev => {
      const newSelection = prev.includes(trackId)
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId];
      console.log('Selected tracks:', newSelection);
      return newSelection;
    });
  };

  if (isGenerating) {
    return (
      <Card className="glass glass-border p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <div className="text-center">
            <h3 className="text-heading-lg mb-2">🤖 IA mixando suas faixas</h3>
            <p className="text-muted-foreground">
              Analisando BPM, keys e criando transições...
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (!generatedSet) {
    return (
      <div className="space-y-6">
        <Card className="glass glass-border p-6">
          <div className="space-y-4">
            <h3 className="text-heading-lg">🎛️ Auto DJ - Mix Rápido</h3>
            
            <Input
              placeholder="Nome do set..."
              value={setName}
              onChange={(e) => setSetName(e.target.value)}
              className="glass glass-border"
            />

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Selecione as faixas ({selectedTracks.length} selecionadas)
              </label>
              <div className="max-h-64 overflow-y-auto space-y-2 glass glass-border rounded-lg p-4">
                {tracks.map((track) => (
                  <div
                    key={track.id}
                    onClick={() => toggleTrackSelection(track.id)}
                    className={`
                      p-3 rounded-lg cursor-pointer transition-all border-2
                      ${selectedTracks.includes(track.id)
                        ? 'bg-primary/20 border-primary shadow-lg scale-[1.02]'
                        : 'glass glass-border hover:bg-muted/20 hover:border-primary/30'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium flex items-center gap-2">
                          {selectedTracks.includes(track.id) && (
                            <span className="text-primary">✓</span>
                          )}
                          {track.title}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {track.artist} • {track.bpm || '?'} BPM • {track.key_signature || '?'}
                        </div>
                      </div>
                      {selectedTracks.includes(track.id) && (
                        <div className="text-xs bg-primary/30 px-2 py-1 rounded">
                          #{selectedTracks.indexOf(track.id) + 1}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {tracks.length === 0 && (
              <div className="bg-info/10 border border-info/30 rounded-lg p-3 text-sm text-info mb-4">
                ℹ️ Faça upload de faixas no Vault primeiro
              </div>
            )}

            <Button
              onClick={handleGenerateMix}
              size="lg"
              className="w-full"
              disabled={selectedTracks.length < 2 || tracks.length === 0}
            >
              {tracks.length === 0
                ? '🔒 Nenhuma faixa disponível'
                : selectedTracks.length < 2 
                  ? '🔒 Selecione 2+ faixas para começar'
                  : `🚀 Gerar Mix com ${selectedTracks.length} faixas`
              }
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Generated set view
  return (
    <div className="space-y-6">
      {/* Player controls */}
      <Card className="glass glass-border p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-heading-lg">{setName || 'Auto DJ Set'}</h3>
              <p className="text-sm text-muted-foreground">
                {generatedSet.tracks.length} faixas • {Math.round(generatedSet.totalDuration / 60)}min • 
                {generatedSet.averageBPM} BPM médio • {generatedSet.compatibilityScore}% compatível
              </p>
            </div>
            <Button variant="outline" size="sm">
              <Save className="h-4 w-4 mr-2" />
              Salvar Set
            </Button>
          </div>

          {/* Virtual CDJ */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass glass-border rounded-lg p-4">
              <div className="text-center mb-4">
                <div className="text-sm text-muted-foreground">DECK A</div>
                <div className="font-bold">
                  {generatedSet.tracks[0]?.title}
                </div>
                <div className="text-xs text-muted-foreground">
                  {generatedSet.tracks[0]?.bpm} BPM • {generatedSet.tracks[0]?.key}
                </div>
              </div>
              <div className="h-16 rounded bg-muted/20 mb-2" />
            </div>

            <div className="glass glass-border rounded-lg p-4">
              <div className="text-center mb-4">
                <div className="text-sm text-muted-foreground">DECK B</div>
                <div className="font-bold">
                  {generatedSet.tracks[1]?.title || 'Próxima faixa'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {generatedSet.tracks[1]?.bpm} BPM • {generatedSet.tracks[1]?.key}
                </div>
              </div>
              <div className="h-16 rounded bg-muted/20 mb-2" />
            </div>
          </div>

          {/* Crossfader */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className={crossfader[0] > 50 ? 'text-muted-foreground' : 'text-primary'}>
                A
              </span>
              <span>Crossfader</span>
              <span className={crossfader[0] < 50 ? 'text-muted-foreground' : 'text-primary'}>
                B
              </span>
            </div>
            <Slider
              value={crossfader}
              onValueChange={setCrossfader}
              max={100}
              step={1}
              className="cursor-grab active:cursor-grabbing"
            />
          </div>

          {/* Transport controls */}
          <div className="flex items-center justify-center gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={skipToPrevious}
              disabled={currentTrackIndex === 0}
            >
              <SkipForward className="h-4 w-4 rotate-180" />
            </Button>
            <Button
              size="icon"
              className="h-12 w-12"
              onClick={togglePlayback}
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 ml-0.5" />
              )}
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={skipToNext}
              disabled={!generatedSet || currentTrackIndex >= generatedSet.tracks.length - 1}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          {/* Hidden audio elements */}
          <audio 
            ref={audioARef} 
            preload="auto"
            onError={(e) => {
              console.error('Audio A error:', e);
              toast({
                title: 'Erro no Deck A',
                description: 'Não foi possível carregar o áudio',
                variant: 'destructive'
              });
            }}
          />
          <audio 
            ref={audioBRef} 
            preload="auto"
            onError={(e) => {
              console.error('Audio B error:', e);
            }}
          />
        </div>
      </Card>

      {/* Tracklist */}
      <Card className="glass glass-border p-6">
        <h4 className="text-heading-lg mb-4">Sequência do Set</h4>
        <div className="space-y-2">
          {generatedSet.tracks.map((track, index) => (
            <div key={track.id} className="glass glass-border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-6">
                    {index + 1}
                  </span>
                  <div>
                    <div className="font-medium">{track.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {track.artist} • {track.bpm} BPM • {track.key}
                    </div>
                  </div>
                </div>
                {index < generatedSet.transitions.length && (
                  <div className="text-xs glass glass-border px-2 py-1 rounded">
                    {generatedSet.transitions[index].transitionType.toUpperCase()} →
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
