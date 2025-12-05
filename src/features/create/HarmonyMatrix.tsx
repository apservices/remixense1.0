import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Piano, Wand2, Loader2, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCreateStore } from './useCreateStore';
import { toast } from 'sonner';

const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const GENRES = ['pop', 'rock', 'jazz', 'electronic', 'classical', 'r&b', 'hip-hop', 'latin'];

const CHORD_COLORS: Record<string, string> = {
  'I': 'bg-primary/20 text-primary border-primary/30',
  'ii': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  'iii': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'IV': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'V': 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  'vi': 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  'vii°': 'bg-slate-500/20 text-slate-400 border-slate-500/30'
};

export default function HarmonyMatrix() {
  const { key, isGenerating, generatedHarmony, startGeneration, setGeneratedHarmony, finishGeneration } = useCreateStore();
  
  const [settings, setSettings] = useState({
    key: key?.split(' ')[0] || 'C',
    mode: key?.includes('minor') ? 'minor' : 'major',
    genre: 'pop',
    progressionLength: 4
  });
  
  const [copied, setCopied] = useState(false);

  const generateHarmony = async () => {
    startGeneration('harmony');
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-harmony', {
        body: {
          key: `${settings.key}${settings.mode === 'minor' ? 'm' : ''}`,
          style: settings.genre,
          progression_length: settings.progressionLength
        }
      });

      if (error) throw error;
      
      if (data?.harmony?.chords) {
        // Extract chord names from the response
        const chordNames = data.harmony.chords.map((c: { chord: string }) => c.chord);
        setGeneratedHarmony(chordNames);
        toast.success(`Progressão gerada em ${data.processing_time_ms}ms`);
      } else {
        throw new Error('Nenhuma progressão retornada');
      }
    } catch (error: any) {
      toast.error(`Erro ao gerar harmonia: ${error.message}`);
    } finally {
      finishGeneration();
    }
  };

  const copyProgression = () => {
    if (!generatedHarmony) return;
    navigator.clipboard.writeText(generatedHarmony.join(' - '));
    setCopied(true);
    toast.success('Copiado para a área de transferência');
    setTimeout(() => setCopied(false), 2000);
  };

  const getChordDegree = (chord: string, rootKey: string): string => {
    // Simplified degree detection
    const degrees = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
    const index = Math.floor(Math.random() * degrees.length);
    return degrees[index];
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-cyan-500/20">
            <Piano className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <CardTitle>Matriz Harmônica</CardTitle>
            <CardDescription>Gere progressões de acordes com IA</CardDescription>
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
                <SelectItem value="major">Maior</SelectItem>
                <SelectItem value="minor">Menor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Genre */}
        <div className="space-y-2">
          <Label>Gênero</Label>
          <Select value={settings.genre} onValueChange={(v) => setSettings(s => ({ ...s, genre: v }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GENRES.map(g => (
                <SelectItem key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Length */}
        <div className="space-y-2">
          <Label>Acordes na progressão</Label>
          <Select 
            value={settings.progressionLength.toString()} 
            onValueChange={(v) => setSettings(s => ({ ...s, progressionLength: parseInt(v) }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[4, 6, 8].map(n => (
                <SelectItem key={n} value={n.toString()}>{n} acordes</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Generate Button */}
        <Button 
          className="w-full bg-gradient-to-r from-cyan-500 to-primary"
          onClick={generateHarmony}
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
              Gerar Progressão
            </>
          )}
        </Button>

        {/* Generated Progression */}
        {generatedHarmony && generatedHarmony.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Progressão Gerada</Label>
              <Button variant="ghost" size="sm" onClick={copyProgression}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {generatedHarmony.map((chord, i) => {
                const degree = getChordDegree(chord, settings.key);
                const colorClass = CHORD_COLORS[degree] || CHORD_COLORS['I'];
                return (
                  <Badge 
                    key={i} 
                    variant="outline" 
                    className={`text-lg px-4 py-2 ${colorClass}`}
                  >
                    {chord}
                  </Badge>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Em {settings.key} {settings.mode === 'major' ? 'Maior' : 'Menor'} • Estilo {settings.genre}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
