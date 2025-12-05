import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Headphones, Wand2, Loader2, Play, Pause, Download, Volume2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCreateStore } from './useCreateStore';
import { toast } from 'sonner';

const PRESETS = [
  { id: 'streaming', name: 'Streaming', description: '-14 LUFS, ideal para Spotify/Apple Music' },
  { id: 'club', name: 'Club', description: '-8 LUFS, máximo impacto' },
  { id: 'broadcast', name: 'Broadcast', description: '-23 LUFS, padrão TV/Rádio' },
  { id: 'vinyl', name: 'Vinil', description: 'Warm, dinâmica preservada' },
  { id: 'custom', name: 'Personalizado', description: 'Configure seus parâmetros' }
];

export default function MasteringIA() {
  const { trackId, isGenerating, masteringPreview, startGeneration, setMasteringPreview, finishGeneration } = useCreateStore();
  
  const [preset, setPreset] = useState('streaming');
  const [settings, setSettings] = useState({
    targetLUFS: -14,
    ceiling: -1,
    stereoWidth: 100,
    lowEnd: 0,
    highEnd: 0,
    limiterEnabled: true,
    multiband: true
  });
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [compareOriginal, setCompareOriginal] = useState(false);

  const applyPreset = (presetId: string) => {
    setPreset(presetId);
    
    const presets: Record<string, typeof settings> = {
      streaming: { targetLUFS: -14, ceiling: -1, stereoWidth: 100, lowEnd: 0, highEnd: 0, limiterEnabled: true, multiband: true },
      club: { targetLUFS: -8, ceiling: -0.3, stereoWidth: 110, lowEnd: 2, highEnd: 1, limiterEnabled: true, multiband: true },
      broadcast: { targetLUFS: -23, ceiling: -2, stereoWidth: 95, lowEnd: 0, highEnd: 0, limiterEnabled: true, multiband: false },
      vinyl: { targetLUFS: -16, ceiling: -2, stereoWidth: 90, lowEnd: 1, highEnd: -1, limiterEnabled: false, multiband: false }
    };

    if (presets[presetId]) {
      setSettings(presets[presetId]);
    }
  };

  const masterTrack = async () => {
    if (!trackId) {
      toast.error('Selecione uma track primeiro');
      return;
    }

    startGeneration('mastering');
    
    try {
      const { data, error } = await supabase.functions.invoke('master-track', {
        body: {
          trackId,
          preset,
          settings
        }
      });

      if (error) throw error;
      
      setMasteringPreview(data.url);
      toast.success('Mastering aplicado com sucesso!');
    } catch (error: any) {
      toast.error(`Erro no mastering: ${error.message}`);
    } finally {
      finishGeneration();
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-rose-500/20">
            <Headphones className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <CardTitle>Mastering IA</CardTitle>
            <CardDescription>Auto-mastering profissional com IA</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preset Selection */}
        <div className="space-y-2">
          <Label>Preset</Label>
          <Select value={preset} onValueChange={applyPreset}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRESETS.map(p => (
                <SelectItem key={p.id} value={p.id}>
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Custom Settings (shown when custom preset) */}
        {preset === 'custom' && (
          <div className="space-y-4 p-4 rounded-lg bg-muted/30">
            {/* Target LUFS */}
            <div className="space-y-2">
              <Label>Target LUFS: {settings.targetLUFS} dB</Label>
              <Slider
                value={[settings.targetLUFS]}
                onValueChange={([v]) => setSettings(s => ({ ...s, targetLUFS: v }))}
                min={-24}
                max={-6}
                step={0.5}
              />
            </div>

            {/* Ceiling */}
            <div className="space-y-2">
              <Label>Ceiling: {settings.ceiling} dB</Label>
              <Slider
                value={[settings.ceiling]}
                onValueChange={([v]) => setSettings(s => ({ ...s, ceiling: v }))}
                min={-3}
                max={0}
                step={0.1}
              />
            </div>

            {/* Stereo Width */}
            <div className="space-y-2">
              <Label>Stereo Width: {settings.stereoWidth}%</Label>
              <Slider
                value={[settings.stereoWidth]}
                onValueChange={([v]) => setSettings(s => ({ ...s, stereoWidth: v }))}
                min={50}
                max={150}
                step={5}
              />
            </div>

            {/* EQ */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Low End: {settings.lowEnd > 0 ? '+' : ''}{settings.lowEnd} dB</Label>
                <Slider
                  value={[settings.lowEnd]}
                  onValueChange={([v]) => setSettings(s => ({ ...s, lowEnd: v }))}
                  min={-6}
                  max={6}
                  step={0.5}
                />
              </div>
              <div className="space-y-2">
                <Label>High End: {settings.highEnd > 0 ? '+' : ''}{settings.highEnd} dB</Label>
                <Slider
                  value={[settings.highEnd]}
                  onValueChange={([v]) => setSettings(s => ({ ...s, highEnd: v }))}
                  min={-6}
                  max={6}
                  step={0.5}
                />
              </div>
            </div>

            {/* Toggles */}
            <div className="flex items-center justify-between">
              <Label>Limiter</Label>
              <Switch
                checked={settings.limiterEnabled}
                onCheckedChange={(v) => setSettings(s => ({ ...s, limiterEnabled: v }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Multiband Compression</Label>
              <Switch
                checked={settings.multiband}
                onCheckedChange={(v) => setSettings(s => ({ ...s, multiband: v }))}
              />
            </div>
          </div>
        )}

        {/* Master Button */}
        <Button 
          className="w-full bg-gradient-to-r from-rose-500 to-primary"
          onClick={masterTrack}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Aplicar Mastering
            </>
          )}
        </Button>

        {/* Preview */}
        {masteringPreview && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Preview</Label>
              <div className="flex items-center gap-2">
                <Label className="text-xs">A/B Compare</Label>
                <Switch
                  checked={compareOriginal}
                  onCheckedChange={setCompareOriginal}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {compareOriginal ? 'Original' : 'Masterizado'}
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Volume2 className="w-4 h-4" />
              <span>-14.2 LUFS • True Peak: -1.1 dB</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
