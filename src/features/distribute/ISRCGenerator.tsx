import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Hash, Copy, Check, RefreshCw, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

interface ISRCGeneratorProps {
  value: string;
  onChange: (isrc: string) => void;
  projectId?: string;
  releaseId?: string;
}

export default function ISRCGenerator({ value, onChange, projectId, releaseId }: ISRCGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateISRC = async () => {
    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-isrc', {
        body: { releaseId: releaseId || projectId, trackCount: 1 }
      });

      if (error) throw error;
      
      onChange(data.primaryIsrc || data.isrcs?.[0]);
      toast.success('ISRC gerado com sucesso!');
    } catch (error: any) {
      toast.error(`Erro ao gerar ISRC: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyISRC = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success('ISRC copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  const validateISRC = (isrc: string): boolean => {
    // ISRC format: CC-XXX-YY-NNNNN (12 characters without hyphens)
    const cleanISRC = isrc.replace(/-/g, '');
    return /^[A-Z]{2}[A-Z0-9]{3}[0-9]{7}$/.test(cleanISRC);
  };

  const isValid = value ? validateISRC(value) : false;

  const formatISRC = (input: string): string => {
    const clean = input.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
    if (clean.length <= 2) return clean;
    if (clean.length <= 5) return `${clean.slice(0, 2)}-${clean.slice(2)}`;
    if (clean.length <= 7) return `${clean.slice(0, 2)}-${clean.slice(2, 5)}-${clean.slice(5)}`;
    return `${clean.slice(0, 2)}-${clean.slice(2, 5)}-${clean.slice(5, 7)}-${clean.slice(7)}`;
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="w-5 h-5" />
          Código ISRC
        </CardTitle>
        <CardDescription>
          International Standard Recording Code - identificador único da gravação
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>ISRC</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                value={value}
                onChange={(e) => onChange(formatISRC(e.target.value))}
                placeholder="BR-XXX-24-00001"
                className="font-mono pr-10"
              />
              {value && (
                <Badge 
                  variant={isValid ? "default" : "destructive"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs"
                >
                  {isValid ? 'Válido' : 'Inválido'}
                </Badge>
              )}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={copyISRC}
              disabled={!value}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <Button 
          variant="outline" 
          className="w-full"
          onClick={generateISRC}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Gerar ISRC Automático
        </Button>

        {/* ISRC Info */}
        <div className="p-3 rounded-lg bg-muted/30 text-sm">
          <p className="font-medium mb-2">Formato ISRC:</p>
          <div className="font-mono text-xs space-y-1 text-muted-foreground">
            <p><span className="text-primary">BR</span>-XXX-24-00001</p>
            <ul className="list-disc list-inside ml-2 space-y-0.5">
              <li><span className="text-primary">BR</span> = País (Brasil)</li>
              <li>XXX = Código do registrante</li>
              <li>24 = Ano de registro</li>
              <li>00001 = Número da gravação</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
