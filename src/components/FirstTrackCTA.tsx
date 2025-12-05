import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, Music, Sparkles, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useAudioUpload } from '@/hooks/useAudioUpload';
import { motion, AnimatePresence } from 'framer-motion';

interface FirstTrackCTAProps {
  onUploadComplete?: (trackId: string) => void;
}

export function FirstTrackCTA({ onUploadComplete }: FirstTrackCTAProps) {
  const { uploadAudio, uploading, progress } = useAudioUpload();
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'analyzing'>('idle');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploadState('uploading');
    
    try {
      const track = await uploadAudio(file, {
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'Artista',
        type: 'track'
      });
      
      setUploadState('analyzing');
      
      // Auto-analysis happens in useAudioUpload hook
      if (track?.id && onUploadComplete) {
        onUploadComplete(track.id);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadState('idle');
    }
  }, [uploadAudio, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.aac', '.flac', '.ogg']
    },
    maxFiles: 1,
    disabled: uploading
  });

  return (
    <Card className="premium-card overflow-hidden">
      <div className="p-6 md:p-8">
        <div className="text-center mb-6">
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-cyan-500/20 mb-4">
            <Music className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold mb-2">
            Comece sua jornada musical 🎵
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
            Adicione sua primeira música e veja a mágica acontecer! 
            Analisamos BPM, tonalidade, energia e muito mais.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {uploadState === 'idle' && (
            <motion.div
              key="dropzone"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-xl p-8 md:p-12 text-center cursor-pointer
                  transition-all duration-300
                  ${isDragActive 
                    ? 'border-primary bg-primary/10 scale-[1.02]' 
                    : 'border-border hover:border-primary/50 hover:bg-muted/30'
                  }
                `}
              >
                <input {...getInputProps()} />
                <Upload className={`h-12 w-12 mx-auto mb-4 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
                <p className="text-sm md:text-base font-medium mb-1">
                  {isDragActive ? 'Solte aqui!' : 'Arraste sua música ou clique para selecionar'}
                </p>
                <p className="text-xs text-muted-foreground">
                  MP3, WAV, AAC, FLAC • Máximo 100MB
                </p>
              </div>
            </motion.div>
          )}

          {(uploadState === 'uploading' || uploadState === 'analyzing') && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center py-8"
            >
              <div className="inline-flex p-4 rounded-full bg-primary/20 mb-4">
                {uploadState === 'uploading' ? (
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                ) : (
                  <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                )}
              </div>
              <h3 className="font-semibold mb-2">
                {uploadState === 'uploading' ? 'Enviando música...' : 'Analisando com IA...'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {uploadState === 'uploading' 
                  ? 'Aguarde enquanto enviamos seu arquivo'
                  : 'Detectando BPM, tonalidade, energia e mood'
                }
              </p>
              <Progress 
                value={progress?.percentage || (uploadState === 'analyzing' ? 75 : 0)} 
                className="max-w-xs mx-auto"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-muted/50 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Auto-análise BPM
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-muted/50 text-xs">
            <span className="w-2 h-2 rounded-full bg-cyan-500" />
            Detecção de Tom
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-muted/50 text-xs">
            <span className="w-2 h-2 rounded-full bg-violet-500" />
            Análise de Energia
          </span>
        </div>
      </div>
    </Card>
  );
}
