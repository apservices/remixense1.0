
-- Add missing column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS credits_remaining INTEGER DEFAULT 100;

-- Create processing_cache table
CREATE TABLE IF NOT EXISTS public.processing_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id UUID NOT NULL,
  service_type TEXT NOT NULL,
  result JSONB NOT NULL,
  credits_used INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add RLS policies for processing_cache
ALTER TABLE public.processing_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own cache" ON public.processing_cache
  FOR ALL USING (auth.uid() = user_id);

-- Add missing columns to track_features table
ALTER TABLE public.track_features ADD COLUMN IF NOT EXISTS tempo NUMERIC;
ALTER TABLE public.track_features ADD COLUMN IF NOT EXISTS musical_key TEXT;
ALTER TABLE public.track_features ADD COLUMN IF NOT EXISTS danceability NUMERIC;
ALTER TABLE public.track_features ADD COLUMN IF NOT EXISTS loudness NUMERIC;

-- Create v_user_library view
CREATE OR REPLACE VIEW public.v_user_library AS
SELECT 
  t.*,
  tf.tempo as bpm,
  tf.musical_key,
  tf.energy_level as energy,
  tf.danceability,
  tf.loudness
FROM public.tracks t
LEFT JOIN public.track_features tf ON t.id = tf.track_id
WHERE t.deleted_at IS NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_processing_cache_user_track ON public.processing_cache(user_id, track_id);
CREATE INDEX IF NOT EXISTS idx_processing_cache_expires ON public.processing_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_track_features_track_id ON public.track_features(track_id);

-- Create audio storage bucket if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('audio', 'audio', false) 
ON CONFLICT (id) DO NOTHING;

-- RLS policies for audio bucket
CREATE POLICY IF NOT EXISTS "Users can upload their own audio files" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'audio' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY IF NOT EXISTS "Users can view their own audio files" 
ON storage.objects FOR SELECT 
USING (
  bucket_id = 'audio' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY IF NOT EXISTS "Users can delete their own audio files" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'audio' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
