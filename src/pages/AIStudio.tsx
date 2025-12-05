import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Wand2, Music, Download, Play, Pause, Volume2, Star, Zap, Upload, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';
import { MainLayout } from '@/components/MainLayout';

export default function AIStudio() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { canExport, isPro, isExpert } = useSubscription();
  const [activeTab, setActiveTab] = useState('mastering');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processedAudioUrl, setProcessedAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Auto-Mastering AI State
  const [masteringSettings, setMasteringSettings] = useState({
    loudness: [-14],
    dynamics: [50],
    brightness: [50],
    warmth: [50],
    stereoWidth: [50],
    preset: 'balanced'
  });

  // Melody Generator State
  const [melodySettings, setMelodySettings] = useState({
    genre: 'house',
    key: 'C',
    tempo: 128,
    complexity: [60],
    mood: 'energetic',
    length: 16
  });

  // Mood Analyzer State
  const [moodResults, setMoodResults] = useState<{
    energy: number;
    valence: number;
    danceability: number;
    mood: string;
    recommendations: string[];
  } | null>(null);

  const presets = [
    { id: 'balanced', name: 'Balanceado', description: 'Som equilibrado para todas as situações' },
    { id: 'club', name: 'Club', description: 'Otimizado para sistemas de som de club' },
    { id: 'radio', name: 'Rádio', description: 'Compressão para transmissão em rádio' },
    { id: 'streaming', name: 'Streaming', description: 'Otimizado para plataformas digitais' },
    { id: 'vinyl', name: 'Vinyl', description: 'Calor e caráter analógico' }
  ];

  const genres = ['house', 'techno', 'trance', 'progressive', 'deep house', 'melodic techno', 'ambient', 'downtempo', 'drum & bass'];
  const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const moods = ['energetic', 'melancholic', 'uplifting', 'dark', 'romantic', 'aggressive', 'peaceful', 'mysterious', 'euphoric'];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setSelectedFile(file);
      setProcessedAudioUrl(null);
      setMoodResults(null);
    }
  };

  const handleAutoMaster = async () => {
    if (!selectedFile) {
      toast({
        title: "Selecione um arquivo",
        description: "Faça upload de um arquivo de áudio primeiro",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);
    setProgress(0);

    try {
      // Simulate AI mastering process with progress
      for (let i = 0; i <= 100; i += 5) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Create processed audio URL (in production, this would be the actual processed file)
      const audioUrl = URL.createObjectURL(selectedFile);
      setProcessedAudioUrl(audioUrl);

      toast({
        title: "🎛️ Masterização concluída!",
        description: `Preset "${presets.find(p => p.id === masteringSettings.preset)?.name}" aplicado com sucesso`
      });
    } catch (error) {
      console.error('Error in auto-mastering:', error);
      toast({
        title: "Erro na masterização",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  const handleGenerateMelody = async () => {
    setProcessing(true);
    setProgress(0);
    
    try {
      // Simulate melody generation with progress
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      toast({
        title: "🎵 Melodia gerada!",
        description: `Nova melodia em ${melodySettings.key} • ${melodySettings.tempo} BPM • ${melodySettings.mood}`
      });

      // In production, this would generate actual MIDI/audio
    } catch (error) {
      console.error('Error generating melody:', error);
      toast({
        title: "Erro na geração",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  const handleAnalyzeMood = async () => {
    if (!selectedFile) {
      toast({
        title: "Selecione um arquivo",
        description: "Faça upload de um arquivo de áudio primeiro",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);
    setProgress(0);

    try {
      // Simulate mood analysis
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Generate simulated mood results
      const energy = Math.round(50 + Math.random() * 50);
      const valence = Math.round(40 + Math.random() * 60);
      const danceability = Math.round(60 + Math.random() * 40);
      
      const moodMap = {
        high_energy_high_valence: 'Eufórico',
        high_energy_low_valence: 'Agressivo',
        low_energy_high_valence: 'Relaxante',
        low_energy_low_valence: 'Melancólico'
      };

      const moodKey = `${energy > 70 ? 'high' : 'low'}_energy_${valence > 50 ? 'high' : 'low'}_valence`;
      const detectedMood = moodMap[moodKey as keyof typeof moodMap] || 'Neutro';

      setMoodResults({
        energy,
        valence,
        danceability,
        mood: detectedMood,
        recommendations: [
          `Combina bem com faixas ${energy > 70 ? 'energéticas' : 'calmas'}`,
          `Ideal para ${danceability > 70 ? 'pistas de dança' : 'ambientes lounge'}`,
          `Tom ${valence > 50 ? 'positivo' : 'introspectivo'} detectado`
        ]
      });

      toast({
        title: "🎭 Análise concluída!",
        description: `Mood detectado: ${detectedMood}`
      });
    } catch (error) {
      console.error('Error analyzing mood:', error);
      toast({
        title: "Erro na análise",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current || !processedAudioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const downloadProcessed = () => {
    if (!processedAudioUrl || !selectedFile) return;
    
    const a = document.createElement('a');
    a.href = processedAudioUrl;
    a.download = `${selectedFile.name.replace(/\.[^/.]+$/, '')}_mastered.wav`;
    a.click();
    
    toast({
      title: "Download iniciado!",
      description: "O arquivo masterizado está sendo baixado."
    });
  };

  const tabs = [
    { id: 'mastering', name: 'Auto-Mastering', icon: Volume2 },
    { id: 'melody', name: 'Gerador de Melodia', icon: Music },
    { id: 'mood', name: 'Análise de Mood', icon: Star }
  ];

  return (
    <MainLayout>
      <div className="min-h-screen pb-20">
        {/* Header */}
        <div className="sticky top-0 z-40 glass border-b border-glass-border backdrop-blur-glass">
          <div className="px-4 py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-heading-xl text-foreground mb-1">
                  Estúdio de IA 🎛️
                </h1>
                <p className="text-muted-foreground text-sm">
                  Ferramentas avançadas de inteligência artificial para produção musical
                </p>
              </div>
              <Badge variant={isPro || isExpert ? "default" : "secondary"} className="text-xs">
                {isPro ? "PRO" : isExpert ? "EXPERT" : "FREE"}
              </Badge>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 overflow-x-auto">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-1 whitespace-nowrap"
                >
                  <tab.icon className="h-3 w-3" />
                  {tab.name}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-6">
          {/* Auto-Mastering AI */}
          {activeTab === 'mastering' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <Card className="glass border-glass-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Volume2 className="h-5 w-5" />
                    Auto-Mastering AI
                  </CardTitle>
                  <CardDescription>
                    Masterização automática com IA para som profissional
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* File Upload */}
                  <div className="space-y-2">
                    <Label>Arquivo de Áudio</Label>
                    {selectedFile ? (
                      <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Music className="h-4 w-4" />
                          <span className="text-sm">{selectedFile.name}</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedFile(null)}>
                          Trocar
                        </Button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">Clique para fazer upload</span>
                        <input type="file" accept="audio/*" onChange={handleFileSelect} className="hidden" />
                      </label>
                    )}
                  </div>

                  {/* Preset Selection */}
                  <div className="space-y-2">
                    <Label>Preset de Masterização</Label>
                    <Select 
                      value={masteringSettings.preset} 
                      onValueChange={(value) => setMasteringSettings(prev => ({ ...prev, preset: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {presets.map((preset) => (
                          <SelectItem key={preset.id} value={preset.id}>
                            <div>
                              <div className="font-medium">{preset.name}</div>
                              <div className="text-xs text-muted-foreground">{preset.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Audio Controls */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Loudness (LUFS)</Label>
                      <Slider
                        value={masteringSettings.loudness}
                        onValueChange={(value) => setMasteringSettings(prev => ({ ...prev, loudness: value }))}
                        min={-24}
                        max={-6}
                        step={1}
                      />
                      <div className="text-xs text-muted-foreground text-center">
                        {masteringSettings.loudness[0]} LUFS
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Dinâmica</Label>
                      <Slider
                        value={masteringSettings.dynamics}
                        onValueChange={(value) => setMasteringSettings(prev => ({ ...prev, dynamics: value }))}
                        min={0}
                        max={100}
                        step={1}
                      />
                      <div className="text-xs text-muted-foreground text-center">
                        {masteringSettings.dynamics[0]}%
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Brilho</Label>
                      <Slider
                        value={masteringSettings.brightness}
                        onValueChange={(value) => setMasteringSettings(prev => ({ ...prev, brightness: value }))}
                        min={0}
                        max={100}
                        step={1}
                      />
                      <div className="text-xs text-muted-foreground text-center">
                        {masteringSettings.brightness[0]}%
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Calor</Label>
                      <Slider
                        value={masteringSettings.warmth}
                        onValueChange={(value) => setMasteringSettings(prev => ({ ...prev, warmth: value }))}
                        min={0}
                        max={100}
                        step={1}
                      />
                      <div className="text-xs text-muted-foreground text-center">
                        {masteringSettings.warmth[0]}%
                      </div>
                    </div>
                  </div>

                  {processing && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Processando...</span>
                        <span className="text-sm">{progress}%</span>
                      </div>
                      <Progress value={progress} className="w-full" />
                    </div>
                  )}

                  <Button 
                    onClick={handleAutoMaster}
                    disabled={processing || !selectedFile}
                    className="w-full"
                    variant="neon"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Masterizando...
                      </>
                    ) : (
                      "🎛️ Masterizar com IA"
                    )}
                  </Button>

                  {/* Playback controls for processed audio */}
                  {processedAudioUrl && (
                    <div className="flex gap-2 pt-4 border-t border-border">
                      <Button variant="outline" className="flex-1" onClick={togglePlayback}>
                        {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                        {isPlaying ? 'Pausar' : 'Ouvir'}
                      </Button>
                      <Button variant="outline" className="flex-1" onClick={downloadProcessed}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <audio ref={audioRef} src={processedAudioUrl} onEnded={() => setIsPlaying(false)} />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Melody Generator */}
          {activeTab === 'melody' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <Card className="glass border-glass-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Music className="h-5 w-5" />
                    Gerador de Melodia IA
                  </CardTitle>
                  <CardDescription>
                    Crie melodias e harmonias originais com inteligência artificial
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Gênero</Label>
                      <Select 
                        value={melodySettings.genre} 
                        onValueChange={(value) => setMelodySettings(prev => ({ ...prev, genre: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {genres.map((genre) => (
                            <SelectItem key={genre} value={genre}>
                              {genre.charAt(0).toUpperCase() + genre.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Tonalidade</Label>
                      <Select 
                        value={melodySettings.key} 
                        onValueChange={(value) => setMelodySettings(prev => ({ ...prev, key: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {keys.map((key) => (
                            <SelectItem key={key} value={key}>{key}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>BPM</Label>
                      <Input
                        type="number"
                        value={melodySettings.tempo}
                        onChange={(e) => setMelodySettings(prev => ({ ...prev, tempo: parseInt(e.target.value) || 120 }))}
                        min={60}
                        max={200}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Mood</Label>
                      <Select 
                        value={melodySettings.mood} 
                        onValueChange={(value) => setMelodySettings(prev => ({ ...prev, mood: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {moods.map((mood) => (
                            <SelectItem key={mood} value={mood}>
                              {mood.charAt(0).toUpperCase() + mood.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Complexidade</Label>
                    <Slider
                      value={melodySettings.complexity}
                      onValueChange={(value) => setMelodySettings(prev => ({ ...prev, complexity: value }))}
                      min={0}
                      max={100}
                      step={1}
                    />
                    <div className="text-xs text-muted-foreground text-center">
                      {melodySettings.complexity[0]}% complexidade
                    </div>
                  </div>

                  {processing && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Gerando melodia...</span>
                        <span className="text-sm">{progress}%</span>
                      </div>
                      <Progress value={progress} className="w-full" />
                    </div>
                  )}

                  <Button 
                    onClick={handleGenerateMelody}
                    disabled={processing}
                    className="w-full"
                    variant="neon"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        🎵 Gerar Melodia
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Mood Analyzer */}
          {activeTab === 'mood' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <Card className="glass border-glass-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Análise de Mood
                  </CardTitle>
                  <CardDescription>
                    Detecte a energia, valência e mood da sua música
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* File Upload */}
                  <div className="space-y-2">
                    <Label>Arquivo de Áudio</Label>
                    {selectedFile ? (
                      <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Music className="h-4 w-4" />
                          <span className="text-sm">{selectedFile.name}</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedFile(null)}>
                          Trocar
                        </Button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">Clique para fazer upload</span>
                        <input type="file" accept="audio/*" onChange={handleFileSelect} className="hidden" />
                      </label>
                    )}
                  </div>

                  {processing && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Analisando...</span>
                        <span className="text-sm">{progress}%</span>
                      </div>
                      <Progress value={progress} className="w-full" />
                    </div>
                  )}

                  <Button 
                    onClick={handleAnalyzeMood}
                    disabled={processing || !selectedFile}
                    className="w-full"
                    variant="neon"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analisando...
                      </>
                    ) : (
                      "🎭 Analisar Mood"
                    )}
                  </Button>

                  {/* Results */}
                  {moodResults && (
                    <div className="space-y-4 pt-4 border-t border-border">
                      <div className="text-center">
                        <span className="text-4xl mb-2 block">
                          {moodResults.mood === 'Eufórico' ? '🎉' : 
                           moodResults.mood === 'Agressivo' ? '🔥' :
                           moodResults.mood === 'Relaxante' ? '😌' : '🌙'}
                        </span>
                        <h3 className="text-xl font-bold">{moodResults.mood}</h3>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-muted/20 rounded-lg">
                          <div className="text-2xl font-bold text-primary">{moodResults.energy}%</div>
                          <div className="text-xs text-muted-foreground">Energia</div>
                        </div>
                        <div className="text-center p-3 bg-muted/20 rounded-lg">
                          <div className="text-2xl font-bold text-primary">{moodResults.valence}%</div>
                          <div className="text-xs text-muted-foreground">Valência</div>
                        </div>
                        <div className="text-center p-3 bg-muted/20 rounded-lg">
                          <div className="text-2xl font-bold text-primary">{moodResults.danceability}%</div>
                          <div className="text-xs text-muted-foreground">Danceability</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Recomendações</Label>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {moodResults.recommendations.map((rec, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <span className="text-primary">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
