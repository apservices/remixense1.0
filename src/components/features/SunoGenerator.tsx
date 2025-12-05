import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Music, Wand2, Play, Download, Loader2, Save, Library, CheckCircle2, Clock } from 'lucide-react';
import { useSunoGeneration } from '@/hooks/useSunoGeneration';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

const genres = [
  'Pop', 'Rock', 'Electronic', 'Hip Hop', 'R&B', 'Jazz', 'Classical', 
  'Funk', 'Reggae', 'Latin', 'Country', 'Metal', 'Ambient', 'Lo-fi'
];

const moods = [
  'Energético', 'Relaxante', 'Melancólico', 'Épico', 'Alegre', 
  'Misterioso', 'Romântico', 'Agressivo', 'Nostálgico', 'Inspirador'
];

const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function SunoGenerator() {
  const { 
    generate, 
    isGenerating, 
    progress, 
    currentGeneration, 
    saveToLibrary,
    isSavedToLibrary,
    autoSaveEnabled,
    setAutoSaveEnabled
  } = useSunoGeneration();
  
  const [prompt, setPrompt] = useState('');
  const [genre, setGenre] = useState('');
  const [mood, setMood] = useState('');
  const [key, setKey] = useState('');
  const [bpm, setBpm] = useState<number | undefined>();
  const [duration, setDuration] = useState(30);
  const [instrumental, setInstrumental] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Pre-fill save title based on prompt
  useEffect(() => {
    if (currentGeneration?.success && prompt) {
      const defaultTitle = prompt.slice(0, 50) + (prompt.length > 50 ? '...' : '');
      setSaveTitle(defaultTitle);
    }
  }, [currentGeneration, prompt]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    await generate({
      prompt,
      genre: genre || undefined,
      mood: mood || undefined,
      key: key || undefined,
      bpm,
      duration,
      instrumental
    });
  };

  const handleSaveToLibrary = async () => {
    if (!saveTitle.trim()) {
      toast.error('Digite um título para a música');
      return;
    }
    
    setIsSaving(true);
    const success = await saveToLibrary(saveTitle);
    setIsSaving(false);
    
    if (success) {
      setSaveDialogOpen(false);
      setSaveTitle('');
    }
  };

  return (
    <div className="space-y-4">
      <AnimatedCard variant="glass" hoverEffect="glow" className="p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-cyan-500/20">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Suno AI Generator</h3>
            <p className="text-xs text-muted-foreground">Crie músicas com IA generativa</p>
          </div>
          <Badge variant="secondary" className="ml-auto text-[10px]">V3</Badge>
        </div>

        <div className="space-y-4">
          {/* Prompt */}
          <div className="space-y-1.5">
            <Label className="text-xs">Descrição da música</Label>
            <Textarea
              placeholder="Descreva a música que você quer criar... Ex: Uma melodia animada de verão com violão e batidas tropicais"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[80px] text-sm resize-none"
            />
          </div>

          {/* Genre & Mood */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Gênero</Label>
              <Select value={genre} onValueChange={setGenre}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Selecionar" />
                </SelectTrigger>
                <SelectContent>
                  {genres.map(g => (
                    <SelectItem key={g} value={g} className="text-xs">{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Mood</Label>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Selecionar" />
                </SelectTrigger>
                <SelectContent>
                  {moods.map(m => (
                    <SelectItem key={m} value={m} className="text-xs">{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Key & BPM */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Tonalidade</Label>
              <Select value={key} onValueChange={setKey}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Auto" />
                </SelectTrigger>
                <SelectContent>
                  {keys.map(k => (
                    <SelectItem key={k} value={k} className="text-xs">{k}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">BPM</Label>
              <Input
                type="number"
                placeholder="120"
                min={60}
                max={200}
                value={bpm || ''}
                onChange={(e) => setBpm(e.target.value ? Number(e.target.value) : undefined)}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Duração (s)</Label>
              <Input
                type="number"
                min={15}
                max={480}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="h-8 text-xs"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <div>
                <Label className="text-xs">Apenas instrumental</Label>
                <p className="text-[10px] text-muted-foreground">Sem vocais/letras</p>
              </div>
              <Switch checked={instrumental} onCheckedChange={setInstrumental} />
            </div>
            
            {/* Auto-save toggle */}
            <div className="flex items-center justify-between py-2">
              <div>
                <Label className="text-xs flex items-center gap-1.5">
                  <Library className="h-3 w-3" />
                  Salvar automaticamente
                </Label>
                <p className="text-[10px] text-muted-foreground">Salva direto na biblioteca após gerar</p>
              </div>
              <Switch checked={autoSaveEnabled} onCheckedChange={setAutoSaveEnabled} />
            </div>
          </div>

          {/* Progress */}
          <AnimatePresence>
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Gerando música...</span>
                  <span className="font-mono">{progress}%</span>
                </div>
                <Progress value={progress} className="h-1.5" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Generate Button */}
          <AnimatedButton
            variant="neon"
            size="lg"
            className="w-full"
            onClick={handleGenerate}
            isLoading={isGenerating}
            leftIcon={<Wand2 className="h-4 w-4" />}
            disabled={!prompt.trim()}
          >
            {isGenerating ? 'Gerando...' : 'Gerar com Suno AI'}
          </AnimatedButton>
        </div>
      </AnimatedCard>

      {/* Result */}
      <AnimatePresence>
        {currentGeneration?.success && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <AnimatedCard variant="neon" hoverEffect="glow" className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/20">
                  <Music className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Música Gerada</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">
                      {currentGeneration.simulated ? 'Modo simulação' : 'Pronta para usar'}
                    </p>
                    {/* Save status badge */}
                    {isSavedToLibrary ? (
                      <Badge variant="default" className="text-[9px] gap-1 bg-green-500/20 text-green-500 border-green-500/30">
                        <CheckCircle2 className="h-2.5 w-2.5" />
                        Na Biblioteca
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[9px] gap-1">
                        <Clock className="h-2.5 w-2.5" />
                        Não salva
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <AnimatedButton size="sm" variant="ghost">
                    <Play className="h-4 w-4" />
                  </AnimatedButton>
                  <AnimatedButton size="sm" variant="ghost">
                    <Download className="h-4 w-4" />
                  </AnimatedButton>
                  
                  {/* Save to Library Dialog - only show if not already saved */}
                  {!isSavedToLibrary && (
                    <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                      <DialogTrigger asChild>
                        <AnimatedButton size="sm" variant="default" className="gap-1.5">
                          <Library className="h-4 w-4" />
                          <span className="hidden sm:inline">Salvar</span>
                        </AnimatedButton>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Save className="h-5 w-5 text-primary" />
                            Salvar na Biblioteca
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <p className="text-sm text-muted-foreground">
                            Salve esta geração na sua biblioteca principal para usar em qualquer lugar do app.
                          </p>
                          <div className="space-y-2">
                            <Label>Título da música</Label>
                            <Input
                              placeholder="Ex: Summer Vibes AI"
                              value={saveTitle}
                              onChange={(e) => setSaveTitle(e.target.value)}
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                              Cancelar
                            </Button>
                            <Button onClick={handleSaveToLibrary} disabled={isSaving || !saveTitle.trim()}>
                              {isSaving ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Salvando...
                                </>
                              ) : (
                                <>
                                  <Save className="h-4 w-4 mr-2" />
                                  Salvar
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            </AnimatedCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
