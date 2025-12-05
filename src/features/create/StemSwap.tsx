import { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Layers, ArrowRightLeft, Loader2, Upload, Play, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCreateStore } from './useCreateStore';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';

type StemType = 'vocals' | 'drums' | 'bass' | 'other';

interface TrackStems {
  id: string;
  name: string;
  stems: Partial<Record<StemType, string>>;
}

export default function StemSwap() {
  const { isGenerating, startGeneration, finishGeneration } = useCreateStore();
  
  const [trackA, setTrackA] = useState<TrackStems | null>(null);
  const [trackB, setTrackB] = useState<TrackStems | null>(null);
  const [swapConfig, setSwapConfig] = useState<Record<StemType, 'A' | 'B'>>({
    vocals: 'A',
    drums: 'A',
    bass: 'A',
    other: 'A'
  });
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const onDropA = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // In production, this would upload and extract stems
      setTrackA({
        id: 'track-a',
        name: file.name,
        stems: {}
      });
      toast.success(`Track A: ${file.name}`);
    }
  }, []);

  const onDropB = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setTrackB({
        id: 'track-b',
        name: file.name,
        stems: {}
      });
      toast.success(`Track B: ${file.name}`);
    }
  }, []);

  const dropzoneA = useDropzone({
    onDrop: onDropA,
    accept: { 'audio/*': ['.mp3', '.wav', '.aac'] },
    maxFiles: 1
  });

  const dropzoneB = useDropzone({
    onDrop: onDropB,
    accept: { 'audio/*': ['.mp3', '.wav', '.aac'] },
    maxFiles: 1
  });

  const performSwap = async () => {
    if (!trackA || !trackB) {
      toast.error('Selecione duas tracks para fazer o swap');
      return;
    }

    startGeneration('stems');
    
    try {
      const { data, error } = await supabase.functions.invoke('stem-swap', {
        body: {
          trackAId: trackA.id,
          trackBId: trackB.id,
          swapConfig
        }
      });

      if (error) throw error;
      
      setResultUrl(data.url);
      toast.success('Stem Swap concluído!');
    } catch (error: any) {
      toast.error(`Erro no swap: ${error.message}`);
    } finally {
      finishGeneration();
    }
  };

  const stemLabels: Record<StemType, string> = {
    vocals: 'Vocais',
    drums: 'Bateria',
    bass: 'Baixo',
    other: 'Outros'
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/20">
            <Layers className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <CardTitle>Stem Swap</CardTitle>
            <CardDescription>Combine stems de diferentes tracks</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Track Selection */}
        <div className="grid grid-cols-2 gap-4">
          {/* Track A */}
          <div className="space-y-2">
            <Label>Track A</Label>
            <div
              {...dropzoneA.getRootProps()}
              className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                dropzoneA.isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/30 hover:border-primary/50'
              }`}
            >
              <input {...dropzoneA.getInputProps()} />
              {trackA ? (
                <p className="text-sm text-primary truncate">{trackA.name}</p>
              ) : (
                <>
                  <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Arraste ou clique</p>
                </>
              )}
            </div>
          </div>

          {/* Track B */}
          <div className="space-y-2">
            <Label>Track B</Label>
            <div
              {...dropzoneB.getRootProps()}
              className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                dropzoneB.isDragActive ? 'border-cyan-500 bg-cyan-500/10' : 'border-muted-foreground/30 hover:border-cyan-500/50'
              }`}
            >
              <input {...dropzoneB.getInputProps()} />
              {trackB ? (
                <p className="text-sm text-cyan-400 truncate">{trackB.name}</p>
              ) : (
                <>
                  <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Arraste ou clique</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Swap Configuration */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4" />
            Configuração do Swap
          </Label>
          
          {(Object.keys(stemLabels) as StemType[]).map((stem) => (
            <div key={stem} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <span className="text-sm font-medium">{stemLabels[stem]}</span>
              <Select 
                value={swapConfig[stem]} 
                onValueChange={(v: 'A' | 'B') => setSwapConfig(prev => ({ ...prev, [stem]: v }))}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Track A</SelectItem>
                  <SelectItem value="B">Track B</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        {/* Swap Button */}
        <Button 
          className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500"
          onClick={performSwap}
          disabled={isGenerating || !trackA || !trackB}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <ArrowRightLeft className="w-4 h-4 mr-2" />
              Executar Swap
            </>
          )}
        </Button>

        {/* Result */}
        {resultUrl && (
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              <Play className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
