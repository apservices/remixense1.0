import { useState, useRef, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Loader2, Play, Pause, SkipForward, Save, AlertCircle, Circle, Square, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateAutoMix, type AutoDJResult } from '@/services/audio/auto-dj';
import { useTracks } from '@/hooks/useTracks';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function AutoDJPanel() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { tracks } = useTracks();
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSet, setGeneratedSet] = useState<AutoDJResult | null>(null);
  const [setName, setSetName] = useState('');
  const [crossfader, setCrossfader] = useState([50]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const audioARef = useRef<HTMLAudioElement>(null);
  const audioBRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Recording functions
  const startRecording = useCallback(async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      
      const dest = audioContextRef.current.createMediaStreamDestination();
      
      // Connect audio elements to destination
      if (audioARef.current) {
        const sourceA = audioContextRef.current.createMediaElementSource(audioARef.current);
        sourceA.connect(dest);
        sourceA.connect(audioContextRef.current.destination);
      }
      
      mediaRecorderRef.current = new MediaRecorder(dest.stream, { mimeType: 'audio/webm' });
      recordedChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(blob);
        toast({ title: '🎙️ Gravação finalizada!', description: 'Você pode baixar ou salvar no Vault' });
      };
      
      mediaRecorderRef.current.start(1000);
      setIsRecording(true);
      setRecordingTime(0);
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      toast({ title: '🔴 Gravando...', description: 'O set está sendo gravado' });
    } catch (error) {
      console.error('Recording error:', error);
      toast({ title: 'Erro na gravação', description: 'Não foi possível iniciar', variant: 'destructive' });
    }
  }, [toast]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  }, [isRecording]);

  const downloadRecording = useCallback(() => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${setName || 'dj-set'}-${Date.now()}.webm`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [recordedBlob, setName]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Load audio when tracks change
  useEffect(() => {
    if (!generatedSet || !generatedSet.tracks.length) return;
    
    const loadTrack = async (index: number, audioRef: React.RefObject<HTMLAudioElement>) => {
      const track = generatedSet.tracks[index];
      if (!track || !audioRef.current) return;

      try {
        if (track.fileUrl) {
          console.log('Loading track:', track.title, track.fileUrl);
          setIsLoadingAudio(true);
          audioRef.current.src = track.fileUrl;
          await audioRef.current.load();
          setIsLoadingAudio(false);
          console.log('Track loaded successfully');
        } else {
          console.error('No fileUrl for track:', track.title);
        }
      } catch (error) {
        console.error('Error loading track:', error);
        setIsLoadingAudio(false);
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

  const togglePlayback = async () => {
    if (!audioARef.current) {
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
        if (!audioARef.current.src || audioARef.current.src === window.location.href) {
          toast({
            title: 'Nenhuma faixa carregada',
            description: 'Aguarde o carregamento da faixa',
            variant: 'destructive'
          });
          return;
        }

        console.log('Starting playback, src:', audioARef.current.src);
        await audioARef.current.play();
        setIsPlaying(true);
        console.log('Playback started');
        
        if (crossfader[0] > 50 && audioBRef.current?.src) {
          await audioBRef.current.play();
        }
      }
    } catch (error) {
      console.error('Playback error:', error);
      toast({
        title: 'Erro na reprodução',
        description: error instanceof Error ? error.message : 'Não foi possível reproduzir',
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
        description: `${missingAnalysis.length} faixa(s) sem BPM/Key. Clique em "Re-analisar" no Vault primeiro.`,
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
        description: `${result.tracks.length} faixas • ${Math.round(result.totalDuration / 60)}min • ${result.compatibilityScore}% compatível`
      });
    } catch (error) {
      console.error('❌ Erro ao gerar mix:', error);
      toast({
        title: 'Erro ao gerar set',
        description: error instanceof Error ? error.message : 'Não foi possível criar o mix',
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
      return newSelection;
    });
  };

  // Tracks with analysis
  const analyzedTracks = tracks.filter(t => t.bpm && t.key_signature);
  const unanalyzedCount = tracks.filter(t => !t.bpm || !t.key_signature).length;

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
            
            {/* Warning about unanalyzed tracks */}
            {unanalyzedCount > 0 && (
              <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 text-sm flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-warning font-medium">{unanalyzedCount} faixas</span>
                  <span className="text-muted-foreground"> sem análise de BPM/Key. </span>
                  <span className="text-warning">Vá ao Vault e clique em "Re-analisar".</span>
                </div>
              </div>
            )}
            
            <Input
              placeholder="Nome do set..."
              value={setName}
              onChange={(e) => setSetName(e.target.value)}
              className="glass glass-border"
            />

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Selecione as faixas ({selectedTracks.length} de {analyzedTracks.length} analisadas)
              </label>
              
              {tracks.length === 0 ? (
                <div className="bg-muted/20 rounded-lg p-6 text-center">
                  <p className="text-muted-foreground">
                    📁 Nenhuma faixa encontrada. Faça upload no Vault primeiro.
                  </p>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-2 glass glass-border rounded-lg p-4">
                  {tracks.map((track) => {
                    const hasAnalysis = track.bpm && track.key_signature;
                    return (
                      <div
                        key={track.id}
                        onClick={() => hasAnalysis && toggleTrackSelection(track.id)}
                        className={`
                          p-3 rounded-lg transition-all border-2
                          ${!hasAnalysis 
                            ? 'opacity-50 cursor-not-allowed bg-muted/10 border-transparent'
                            : selectedTracks.includes(track.id)
                              ? 'bg-primary/20 border-primary shadow-lg scale-[1.02] cursor-pointer'
                              : 'glass glass-border hover:bg-muted/20 hover:border-primary/30 cursor-pointer'
                          }
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium flex items-center gap-2">
                              {selectedTracks.includes(track.id) && (
                                <span className="text-primary">✓</span>
                              )}
                              {!hasAnalysis && (
                                <span className="text-warning">⚠️</span>
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
                    );
                  })}
                </div>
              )}
            </div>

            <Button
              onClick={handleGenerateMix}
              size="lg"
              className="w-full"
              disabled={selectedTracks.length < 2}
            >
              {tracks.length === 0
                ? '📁 Faça upload de faixas primeiro'
                : analyzedTracks.length < 2
                  ? '⚠️ Analise pelo menos 2 faixas'
                  : selectedTracks.length < 2 
                    ? `🔒 Selecione 2+ faixas (${selectedTracks.length}/2)`
                    : `🚀 Gerar Mix com ${selectedTracks.length} faixas`
              }
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Generated set view
  const currentTrack = generatedSet.tracks[currentTrackIndex];
  const nextTrack = generatedSet.tracks[currentTrackIndex + 1];

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
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setGeneratedSet(null);
                setSelectedTracks([]);
              }}
            >
              Novo Set
            </Button>
          </div>

          {/* Virtual CDJ */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass glass-border rounded-lg p-4">
              <div className="text-center mb-4">
                <div className="text-sm text-muted-foreground">DECK A</div>
                <div className="font-bold truncate">{currentTrack?.title || '-'}</div>
                <div className="text-xs text-muted-foreground">
                  {currentTrack?.bpm || '-'} BPM • {currentTrack?.key || '-'}
                </div>
              </div>
              <div className="h-16 rounded bg-muted/20 flex items-center justify-center text-xs text-muted-foreground">
                {isLoadingAudio ? 'Carregando...' : (isPlaying && crossfader[0] < 50 ? '▶️ Playing' : '⏸️')}
              </div>
            </div>

            <div className="glass glass-border rounded-lg p-4">
              <div className="text-center mb-4">
                <div className="text-sm text-muted-foreground">DECK B</div>
                <div className="font-bold truncate">{nextTrack?.title || 'Próxima faixa'}</div>
                <div className="text-xs text-muted-foreground">
                  {nextTrack?.bpm || '-'} BPM • {nextTrack?.key || '-'}
                </div>
              </div>
              <div className="h-16 rounded bg-muted/20 flex items-center justify-center text-xs text-muted-foreground">
                {isPlaying && crossfader[0] > 50 ? '▶️ Playing' : '⏸️'}
              </div>
            </div>
          </div>

          {/* Crossfader */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className={crossfader[0] <= 50 ? 'text-primary font-bold' : 'text-muted-foreground'}>A</span>
              <span>Crossfader</span>
              <span className={crossfader[0] >= 50 ? 'text-primary font-bold' : 'text-muted-foreground'}>B</span>
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
            {/* Recording controls */}
            {!isRecording ? (
              <Button 
                variant="outline" 
                size="icon"
                onClick={startRecording}
                className="text-red-500 hover:text-red-400"
                title="Gravar Set"
              >
                <Circle className="h-4 w-4 fill-current" />
              </Button>
            ) : (
              <Button 
                variant="destructive" 
                size="icon"
                onClick={stopRecording}
                title="Parar Gravação"
              >
                <Square className="h-4 w-4" />
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => {
                if (currentTrackIndex > 0) {
                  setCurrentTrackIndex(prev => prev - 1);
                  setIsPlaying(false);
                  audioARef.current?.pause();
                  audioBRef.current?.pause();
                }
              }}
              disabled={currentTrackIndex === 0}
            >
              <SkipForward className="h-4 w-4 rotate-180" />
            </Button>
            <Button
              size="icon"
              className="h-12 w-12"
              onClick={togglePlayback}
              disabled={isLoadingAudio}
            >
              {isLoadingAudio ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 ml-0.5" />
              )}
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={skipToNext}
              disabled={currentTrackIndex >= generatedSet.tracks.length - 1}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
            
            {recordedBlob && (
              <Button 
                variant="outline" 
                size="icon"
                onClick={downloadRecording}
                className="text-green-500 hover:text-green-400"
                title="Baixar Gravação"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {/* Recording indicator */}
          {isRecording && (
            <div className="flex items-center justify-center gap-2 text-red-500">
              <Circle className="h-3 w-3 fill-current animate-pulse" />
              <span className="text-sm font-medium">REC {formatTime(recordingTime)}</span>
            </div>
          )}

          {/* Hidden audio elements */}
          <audio 
            ref={audioARef} 
            preload="auto"
            crossOrigin="anonymous"
            onEnded={skipToNext}
            onError={(e) => console.error('Audio A error:', e)}
          />
          <audio 
            ref={audioBRef} 
            preload="auto"
            crossOrigin="anonymous"
            onError={(e) => console.error('Audio B error:', e)}
          />
        </div>
      </Card>

      {/* Tracklist */}
      <Card className="glass glass-border p-6">
        <h4 className="text-heading-lg mb-4">Sequência do Set</h4>
        <div className="space-y-2">
          {generatedSet.tracks.map((track, index) => (
            <div 
              key={track.id} 
              className={`glass glass-border rounded-lg p-3 ${index === currentTrackIndex ? 'ring-2 ring-primary' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`text-sm w-6 ${index === currentTrackIndex ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                    {index === currentTrackIndex ? '▶' : index + 1}
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
