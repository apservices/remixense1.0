import { z } from 'zod';

// Audio file validation
export const audioFileSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => ['audio/mpeg', 'audio/wav', 'audio/aac', 'audio/mp3', 'audio/x-wav'].includes(file.type),
    'Formato inválido. Use MP3, WAV ou AAC.'
  ).refine(
    (file) => file.size <= 50 * 1024 * 1024, // 50MB
    'Arquivo muito grande. Máximo 50MB.'
  )
});

// Track metadata
export const trackMetadataSchema = z.object({
  title: z.string().min(1, 'Título obrigatório').max(200),
  artist: z.string().min(1, 'Artista obrigatório').max(200),
  genre: z.string().optional(),
  bpm: z.number().min(20).max(300).optional(),
  key: z.string().optional(),
  energy: z.number().min(1).max(10).optional(),
  mood: z.string().optional(),
  tags: z.array(z.string()).optional()
});

// Cover image validation
export const coverImageSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
    'Use JPEG, PNG ou WebP.'
  ).refine(
    (file) => file.size <= 10 * 1024 * 1024, // 10MB
    'Imagem muito grande. Máximo 10MB.'
  )
});

// Distribution validation (3000x3000 for platforms)
export const distributionCoverSchema = coverImageSchema.extend({
  file: z.instanceof(File).refine(
    async (file) => {
      return new Promise<boolean>((resolve) => {
        const img = new Image();
        img.onload = () => {
          resolve(img.width >= 3000 && img.height >= 3000);
        };
        img.onerror = () => resolve(false);
        img.src = URL.createObjectURL(file);
      });
    },
    'Capa deve ter pelo menos 3000x3000 pixels.'
  )
});

// WAV validation for distribution
export const distributionAudioSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => file.type === 'audio/wav' || file.type === 'audio/x-wav',
    'Para distribuição, use WAV 44.1kHz/16bit.'
  )
});

export type AudioFile = z.infer<typeof audioFileSchema>;
export type TrackMetadata = z.infer<typeof trackMetadataSchema>;
export type CoverImage = z.infer<typeof coverImageSchema>;
