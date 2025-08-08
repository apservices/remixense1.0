import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export function useAudioUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const { toast } = useToast();

  const uploadAudio = async (file: File, metadata: {
    title: string;
    artist: string;
    type: 'track' | 'remix' | 'sample';
    genre?: string;
    bpm?: number;
    energy_level?: number;
    tags?: string[];
  }) => {
    try {
      setUploading(true);
      setProgress({ loaded: 0, total: file.size, percentage: 0 });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Faça login com e-mail e senha para enviar. Logins de teste (Free/Premium/Pro) não permitem upload.');

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('audio-files')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get file URL
      const { data: { publicUrl } } = supabase.storage
        .from('audio-files')
        .getPublicUrl(fileName);

      // Get audio duration (approximate)
      const audio = new Audio();
      const duration = await new Promise<string>((resolve) => {
        audio.addEventListener('loadedmetadata', () => {
          const minutes = Math.floor(audio.duration / 60);
          const seconds = Math.floor(audio.duration % 60);
          resolve(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        });
        audio.src = URL.createObjectURL(file);
      });

      // Create track record
      const { data: track, error: trackError } = await supabase
        .from('tracks')
        .insert({
          user_id: user.id,
          title: metadata.title,
          artist: metadata.artist,
          type: metadata.type,
          duration,
          genre: metadata.genre,
          bpm: metadata.bpm,
          energy_level: metadata.energy_level,
          tags: metadata.tags,
          file_url: publicUrl,
          file_path: fileName,
          original_filename: file.name,
          file_size: file.size,
          upload_status: 'completed'
        })
        .select()
        .single();

      if (trackError) throw trackError;

      toast({
        title: "Upload concluído!",
        description: `${metadata.title} foi adicionado ao seu vault.`
      });

      setProgress({ loaded: file.size, total: file.size, percentage: 100 });
      return track;

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Erro no upload",
        description: error instanceof Error ? error.message : "Falha ao fazer upload do arquivo",
        variant: "destructive"
      });
      throw error;
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(null), 1000);
    }
  };

  return {
    uploadAudio,
    uploading,
    progress
  };
}