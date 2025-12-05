import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Sparkles, Loader2, Play, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCreateStore } from './useCreateStore';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";

const MOODS = [
  { id: 'happy', emoji: '😊', name: 'Feliz', color: 'from-amber-500 to-orange-500' },
  { id: 'sad', emoji: '😢', name: 'Triste', color: 'from-blue-500 to-indigo-500' },
  { id: 'energetic', emoji: '⚡', name: 'Energético', color: 'from-red-500 to-pink-500' },
  { id: 'chill', emoji: '😌', name: 'Relaxado', color: 'from-teal-500 to-cyan-500' },
  { id: 'dark', emoji: '🌑', name: 'Sombrio', color: 'from-slate-600 to-slate-800' },
  { id: 'epic', emoji: '🎬', name: 'Épico', color: 'from-purple-500 to-violet-600' },
  { id: 'romantic', emoji: '💕', name: 'Romântico', color: 'from-rose-400 to-pink-500' },
  { id: 'mysterious', emoji: '🔮', name: 'Misterioso', color: 'from-violet-600 to-purple-800' }
];

export default function MoodModeSelector() {
  const { trackId, isGenerating, moodVariations, startGeneration, setMoodVariations, finishGeneration } = useCreateStore();
  
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(50);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const generateVariation = async () => {
    if (!trackId) {
      toast.error('Selecione uma track primeiro');
      return;
    }
    if (!selectedMood) {
      toast.error('Selecione um mood');
      return;
    }

    startGeneration('mood');
    
    try {
      const { data, error } = await supabase.functions.invoke('mood-variation', {
        body: {
          trackId,
          targetMood: selectedMood,
          intensity
        }
      });

      if (error) throw error;
      
      const newVariation = { mood: selectedMood, url: data.url };
      setMoodVariations([...(moodVariations || []), newVariation]);
      toast.success(`Variação "${selectedMood}" criada!`);
    } catch (error: any) {
      toast.error(`Erro na variação: ${error.message}`);
    } finally {
      finishGeneration();
    }
  };

  const togglePlay = (variationId: string) => {
    if (playingId === variationId) {
      setPlayingId(null);
    } else {
      setPlayingId(variationId);
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-violet-500/20">
            <Sparkles className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <CardTitle>Mood Variation</CardTitle>
            <CardDescription>Transforme o humor da sua track</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mood Grid */}
        <div className="space-y-2">
          <Label>Selecione o Mood</Label>
          <div className="grid grid-cols-4 gap-2">
            {MOODS.map((mood) => (
              <button
                key={mood.id}
                onClick={() => setSelectedMood(mood.id)}
                className={cn(
                  "flex flex-col items-center p-3 rounded-lg border-2 transition-all",
                  selectedMood === mood.id
                    ? `border-primary bg-gradient-to-br ${mood.color} text-white`
                    : "border-muted-foreground/30 hover:border-primary/50"
                )}
              >
                <span className="text-2xl mb-1">{mood.emoji}</span>
                <span className="text-xs font-medium">{mood.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Intensity */}
        <div className="space-y-2">
          <Label>Intensidade: {intensity}%</Label>
          <Slider
            value={[intensity]}
            onValueChange={([v]) => setIntensity(v)}
            min={10}
            max={100}
            step={10}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Sutil</span>
            <span>Extremo</span>
          </div>
        </div>

        {/* Generate Button */}
        <Button 
          className="w-full bg-gradient-to-r from-violet-500 to-primary"
          onClick={generateVariation}
          disabled={isGenerating || !selectedMood}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Gerar Variação
            </>
          )}
        </Button>

        {/* Generated Variations */}
        {moodVariations && moodVariations.length > 0 && (
          <div className="space-y-2">
            <Label>Variações Geradas</Label>
            <div className="space-y-2">
              {moodVariations.map((variation, i) => {
                const moodInfo = MOODS.find(m => m.id === variation.mood);
                return (
                  <div 
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-2">
                      <span>{moodInfo?.emoji}</span>
                      <span className="text-sm font-medium">{moodInfo?.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => togglePlay(`${variation.mood}-${i}`)}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
