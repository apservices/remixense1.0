import { z } from 'zod';

export const projectSchema = z.object({
  title: z.string().min(1, 'Título obrigatório').max(200),
  description: z.string().max(2000).optional(),
  genre: z.string().optional(),
  bpm: z.number().min(20).max(300).optional(),
  key: z.string().optional(),
  status: z.enum(['draft', 'in_progress', 'ready', 'released']).default('draft')
});

export const releaseSchema = z.object({
  title: z.string().min(1, 'Título obrigatório').max(200),
  artist_name: z.string().min(1, 'Nome do artista obrigatório').max(200),
  release_date: z.date(),
  genre: z.string().min(1, 'Gênero obrigatório'),
  isrc: z.string().optional(),
  upc: z.string().optional(),
  copyright: z.string().optional(),
  record_label: z.string().optional(),
  explicit_content: z.boolean().default(false),
  platforms: z.array(z.string()).min(1, 'Selecione pelo menos uma plataforma')
});

export const landingPageSchema = z.object({
  project_id: z.string().uuid(),
  template: z.enum(['minimal', 'bold', 'gradient', 'artist']).default('minimal'),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#7B2FF7'),
  secondary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#1FD1F9'),
  custom_domain: z.string().optional(),
  social_links: z.object({
    spotify: z.string().url().optional(),
    apple_music: z.string().url().optional(),
    youtube: z.string().url().optional(),
    soundcloud: z.string().url().optional()
  }).optional()
});

export type ProjectFormData = z.infer<typeof projectSchema>;
export type ReleaseFormData = z.infer<typeof releaseSchema>;
export type LandingPageFormData = z.infer<typeof landingPageSchema>;
