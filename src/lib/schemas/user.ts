import { z } from 'zod';

export const profileSchema = z.object({
  username: z.string()
    .min(3, 'Mínimo 3 caracteres')
    .max(30, 'Máximo 30 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Apenas letras, números e underscore'),
  display_name: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  avatar_url: z.string().url().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  social_links: z.object({
    instagram: z.string().optional(),
    tiktok: z.string().optional(),
    spotify: z.string().optional(),
    soundcloud: z.string().optional(),
    youtube: z.string().optional()
  }).optional()
});

export const securityPreferencesSchema = z.object({
  two_factor_enabled: z.boolean().default(false),
  login_notifications: z.boolean().default(true),
  session_timeout_minutes: z.number().min(15).max(10080).default(1440) // 15min to 7 days
});

export const notificationPreferencesSchema = z.object({
  email_marketing: z.boolean().default(true),
  email_updates: z.boolean().default(true),
  push_notifications: z.boolean().default(true),
  collaboration_requests: z.boolean().default(true),
  challenge_updates: z.boolean().default(true),
  new_followers: z.boolean().default(true)
});

export type ProfileFormData = z.infer<typeof profileSchema>;
export type SecurityPreferences = z.infer<typeof securityPreferencesSchema>;
export type NotificationPreferences = z.infer<typeof notificationPreferencesSchema>;
