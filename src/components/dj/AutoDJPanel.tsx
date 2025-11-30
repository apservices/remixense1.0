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
      if (!track || !audioRef.current) return;

      try {
        if (track.fileUrl) {
          audioRef.current.src = track.fileUrl;
          audioRef.current.load();
        }
      } catch (error) {
        console.error('Error loading track:', error);
      }
    };

    loadTrack(currentTrackIndex, audioARef);
    if (currentTrackIndex + 1 < generatedSet.tracks.length) {
      loadTrack(currentTrackIndex + 1, audioBRef);
    }
  }, [generatedSet, currentTrackIndex]);

  // Handle crossfader mixing
  useEffect(() => {
    if (!audioARef.current || !audioBRef.current) return;

    const fadeValue = crossfader[0] / 100;
    audioARef.current.volume = 1 - fadeValue;
    audioBRef.current.volume = fadeValue;
  }, [crossfader]);

  const togglePlayback = () => {
    if (!audioARef.current) return;

    if (isPlaying) {
      audioARef.current.pause();
      audioBRef.current?.pause();
    } else {
      audioARef.current.play();
      if (crossfader[0] > 50 && audioBRef.current) {
        audioBRef.current.play();
      }
    }
    setIsPlaying(!isPlaying);
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

    setIsGenerating(true);
    try {
      const result = await generateAutoMix(
        selectedTracks,
        setName || 'Auto DJ Set'
      );
      
      setGeneratedSet(result);
      
      toast({
        title: '🎧 Set criado com sucesso!',
        description: `${result.tracks.length} faixas mixadas • ${Math.round(result.totalDuration / 60)}min • ${result.compatibilityScore}% compatibilidade`
      });
    } catch (error) {
      console.error('Erro ao gerar mix:', error);
      toast({
        title: 'Erro ao gerar set',
        description: 'Não foi possível criar o mix automático',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleTrackSelection = (trackId: string) => {
    setSelectedTracks(prev =>
      prev.includes(trackId)
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    );
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
                      p-3 rounded-lg cursor-pointer transition-smooth
                      ${selectedTracks.includes(track.id)
                        ? 'bg-primary/20 border-primary'
                        : 'glass glass-border hover:bg-muted/20'
                      }
                    `}
                  >
                    <div className="font-medium">{track.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {track.artist} • {track.bpm || '?'} BPM • {track.key_signature || '?'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={handleGenerateMix}
              size="lg"
              className="w-full neon-glow"
              disabled={selectedTracks.length < 2}
            >
              🚀 Gerar Mix Automático
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
          <audio ref={audioARef} />
          <audio ref={audioBRef} />
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
