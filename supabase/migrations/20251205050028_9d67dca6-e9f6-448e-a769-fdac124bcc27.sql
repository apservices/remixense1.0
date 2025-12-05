-- Add missing columns to profiles table for full profile management
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb;

-- Update existing profiles to have empty defaults
UPDATE public.profiles SET 
  display_name = COALESCE(display_name, ''),
  bio = COALESCE(bio, ''),
  website = COALESCE(website, ''),
  social_links = COALESCE(social_links, '{}'::jsonb)
WHERE display_name IS NULL OR bio IS NULL OR website IS NULL OR social_links IS NULL;