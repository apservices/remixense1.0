import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image, Upload, X, Check, AlertCircle } from "lucide-react";
import { useDropzone } from 'react-dropzone';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';

interface CoverUploaderProps {
  coverUrl: string | null;
  onChange: (url: string | null, file: File | null) => void;
  minSize?: number; // minimum dimension in pixels
}

interface ValidationResult {
  valid: boolean;
  width: number;
  height: number;
  message?: string;
}

export default function CoverUploader({ coverUrl, onChange, minSize = 3000 }: CoverUploaderProps) {
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateImage = (file: File): Promise<ValidationResult> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        const valid = img.width >= minSize && img.height >= minSize && img.width === img.height;
        resolve({
          valid,
          width: img.width,
          height: img.height,
          message: !valid 
            ? img.width !== img.height 
              ? 'A imagem deve ser quadrada'
              : `Mínimo ${minSize}x${minSize}px (atual: ${img.width}x${img.height})`
            : undefined
        });
      };
      img.onerror = () => {
        resolve({ valid: false, width: 0, height: 0, message: 'Erro ao carregar imagem' });
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Check file type
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast.error('Use apenas JPG ou PNG');
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Máximo 10MB');
      return;
    }

    setIsValidating(true);
    const result = await validateImage(file);
    setValidation(result);
    setIsValidating(false);

    if (result.valid) {
      const url = URL.createObjectURL(file);
      onChange(url, file);
      toast.success('Capa válida!');
    } else {
      toast.error(result.message || 'Imagem inválida');
    }
  }, [onChange, minSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png'] },
    maxFiles: 1
  });

  const removeCover = () => {
    onChange(null, null);
    setValidation(null);
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="w-5 h-5" />
          Capa do Lançamento
        </CardTitle>
        <CardDescription>
          Mínimo {minSize}x{minSize}px, formato quadrado, JPG ou PNG
        </CardDescription>
      </CardHeader>
      <CardContent>
        {coverUrl ? (
          <div className="relative">
            <img 
              src={coverUrl} 
              alt="Cover preview" 
              className="w-full aspect-square object-cover rounded-lg"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={removeCover}
            >
              <X className="w-4 h-4" />
            </Button>
            
            {/* Validation Badge */}
            {validation && (
              <div className={cn(
                "absolute bottom-2 left-2 right-2 p-2 rounded-lg flex items-center gap-2",
                validation.valid 
                  ? "bg-emerald-500/90 text-white" 
                  : "bg-destructive/90 text-white"
              )}>
                {validation.valid ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span className="text-sm">
                  {validation.width}x{validation.height}px
                  {validation.message && ` - ${validation.message}`}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors aspect-square flex flex-col items-center justify-center",
              isDragActive 
                ? "border-primary bg-primary/10" 
                : "border-muted-foreground/30 hover:border-primary/50"
            )}
          >
            <input {...getInputProps()} />
            <Upload className={cn(
              "w-12 h-12 mb-4",
              isDragActive ? "text-primary" : "text-muted-foreground"
            )} />
            <p className="text-lg font-medium">
              {isDragActive ? 'Solte a imagem aqui' : 'Arraste ou clique'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              JPG ou PNG, mínimo {minSize}x{minSize}px
            </p>
          </div>
        )}

        {/* Requirements */}
        <div className="mt-4 p-3 rounded-lg bg-muted/30">
          <p className="text-sm font-medium mb-2">Requisitos:</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li className="flex items-center gap-2">
              <div className={cn("w-1.5 h-1.5 rounded-full", validation?.valid ? "bg-emerald-500" : "bg-muted-foreground")} />
              Dimensão mínima: {minSize}x{minSize}px
            </li>
            <li className="flex items-center gap-2">
              <div className={cn("w-1.5 h-1.5 rounded-full", validation?.width === validation?.height ? "bg-emerald-500" : "bg-muted-foreground")} />
              Formato quadrado (1:1)
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
              Arquivo JPG ou PNG
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
              Máximo 10MB
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
