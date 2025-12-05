import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Music, Wand2, Play, Download, Loader2 } from 'lucide-react';
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
  const { generate, isGenerating, progress, currentGeneration } = useSunoGeneration();
  
  const [prompt, setPrompt] = useState('');
  const [genre, setGenre] = useState('');
  const [mood, setMood] = useState('');
  const [key, setKey] = useState('');
  const [bpm, setBpm] = useState<number | undefined>();
  const [duration, setDuration] = useState(30);
  const [instrumental, setInstrumental] = useState(false);

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

          {/* Instrumental Toggle */}
          <div className="flex items-center justify-between py-2">
            <div>
              <Label className="text-xs">Apenas instrumental</Label>
              <p className="text-[10px] text-muted-foreground">Sem vocais/letras</p>
            </div>
            <Switch checked={instrumental} onCheckedChange={setInstrumental} />
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
                  <p className="text-xs text-muted-foreground">
                    {currentGeneration.simulated ? 'Modo simulação' : 'Pronta para usar'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <AnimatedButton size="sm" variant="ghost">
                    <Play className="h-4 w-4" />
                  </AnimatedButton>
                  <AnimatedButton size="sm" variant="ghost">
                    <Download className="h-4 w-4" />
                  </AnimatedButton>
                </div>
              </div>
            </AnimatedCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
