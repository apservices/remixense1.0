import { useState } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { StemsEditor } from '@/components/studio/StemsEditor';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function StemsStudio() {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [trackId] = useState(() => crypto.randomUUID());

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      toast({
        title: 'Arquivo inválido',
        description: 'Por favor, selecione um arquivo de áudio',
        variant: 'destructive'
      });
      return;
    }

    setSelectedFile(file);
  };

  return (
    <MainLayout>
      <div className="container max-w-6xl mx-auto py-8 space-y-6">
        <div>
          <h1 className="text-heading-xl mb-2">🎛️ Studio de Stems</h1>
          <p className="text-muted-foreground">
            Separe e edite stems com IA - voz, bateria, baixo, harmonia e FX
          </p>
        </div>

        {!selectedFile ? (
          <Card className="glass glass-border p-12">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="h-20 w-20 rounded-full glass glass-border flex items-center justify-center">
                <Upload className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h3 className="text-heading-lg mb-2">🚧 Recurso em Desenvolvimento</h3>
                <p className="text-muted-foreground mb-4 max-w-md">
                  A separação de stems por IA está em desenvolvimento. 
                  Esta funcionalidade utilizará modelos como Demucs ou Spleeter para separação real.
                </p>
                <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 text-sm text-warning">
                  ⚠️ Atualmente apenas simula o processo
                </div>
              </div>
              <label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled
                />
                <Button size="lg" className="neon-glow" disabled>
                  📁 Em Breve
                </Button>
              </label>
            </div>
          </Card>
        ) : (
          <>
            <Card className="glass glass-border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{selectedFile.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedFile(null)}
                >
                  Trocar Arquivo
                </Button>
              </div>
            </Card>

            <StemsEditor
              trackId={trackId}
              trackTitle={selectedFile.name.replace(/\.[^/.]+$/, '')}
              audioFile={selectedFile}
            />
          </>
        )}
      </div>
    </MainLayout>
  );
}
