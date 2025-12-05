import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Music, Wand2, Download, Play, Pause, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCreateStore } from './useCreateStore';
import { toast } from 'sonner';

const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const MODES = ['major', 'minor', 'dorian', 'phrygian', 'lydian', 'mixolydian'];
const MOODS = ['happy', 'sad', 'energetic', 'chill', 'dark', 'uplifting', 'mysterious'];

export default function MelodyGenerator() {
  const { bpm, key, isGenerating, generatedMelody, startGeneration, setGeneratedMelody, finishGeneration, updateProgress } = useCreateStore();
  
  const [settings, setSettings] = useState({
    key: key?.split(' ')[0] || 'C',
    mode: key?.includes('minor') ? 'minor' : 'major',
    bpm: bpm || 120,
    mood: 'energetic',
    complexity: 50,
    length: 8 // bars
  });
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(new Audio());

  const generateMelody = async () => {
    startGeneration('melody');
    
    try {
      updateProgress(10);
      
      const { data, error } = await supabase.functions.invoke('generate-melody', {
        body: {
          key: settings.key,
          mode: settings.mode,
          bpm: settings.bpm,
          mood: settings.mood,
          complexity: settings.complexity,
          bars: settings.length
        }
      });

      if (error) throw error;
      
      updateProgress(90);
      setGeneratedMelody(data.url);
      toast.success('Melodia gerada com sucesso!');
    } catch (error: any) {
      toast.error(`Erro ao gerar melodia: ${error.message}`);
    } finally {
      finishGeneration();
    }
  };

  const togglePlayback = () => {
    if (!generatedMelody) return;
    
    if (isPlaying) {
      audio.pause();
    } else {
      audio.src = generatedMelody;
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const downloadMelody = () => {
    if (!generatedMelody) return;
    
    const a = document.createElement('a');
    a.href = generatedMelody;
    a.download = `melody_${settings.key}${settings.mode}_${settings.bpm}bpm.wav`;
    a.click();
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/20">
            <Music className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle>Gerador de Melodia</CardTitle>
            <CardDescription>Crie melodias únicas com IA</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key & Mode */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tonalidade</Label>
            <Select value={settings.key} onValueChange={(v) => setSettings(s => ({ ...s, key: v }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {KEYS.map(k => (
                  <SelectItem key={k} value={k}>{k}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Modo</Label>
            <Select value={settings.mode} onValueChange={(v) => setSettings(s => ({ ...s, mode: v }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODES.map(m => (
                  <SelectItem key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* BPM */}
        <div className="space-y-2">
          <Label>BPM: {settings.bpm}</Label>
          <Slider
            value={[settings.bpm]}
            onValueChange={([v]) => setSettings(s => ({ ...s, bpm: v }))}
            min={60}
            max={200}
            step={1}
          />
        </div>

        {/* Mood */}
        <div className="space-y-2">
          <Label>Mood</Label>
          <Select value={settings.mood} onValueChange={(v) => setSettings(s => ({ ...s, mood: v }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MOODS.map(m => (
                <SelectItem key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Complexity */}
        <div className="space-y-2">
          <Label>Complexidade: {settings.complexity}%</Label>
          <Slider
            value={[settings.complexity]}
            onValueChange={([v]) => setSettings(s => ({ ...s, complexity: v }))}
            min={10}
            max={100}
            step={10}
          />
        </div>

        {/* Length */}
        <div className="space-y-2">
          <Label>Duração: {settings.length} compassos</Label>
          <Slider
            value={[settings.length]}
            onValueChange={([v]) => setSettings(s => ({ ...s, length: v }))}
            min={4}
            max={32}
            step={4}
          />
        </div>

        {/* Generate Button */}
        <Button 
          className="w-full bg-gradient-to-r from-primary to-cyan-500"
          onClick={generateMelody}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Gerando...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Gerar Melodia
            </>
          )}
        </Button>

        {/* Preview & Download */}
        {generatedMelody && (
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={togglePlayback}>
              {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isPlaying ? 'Pausar' : 'Ouvir'}
            </Button>
            <Button variant="outline" onClick={downloadMelody}>
              <Download className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
