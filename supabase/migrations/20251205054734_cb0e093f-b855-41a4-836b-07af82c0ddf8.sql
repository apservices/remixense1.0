-- Fix tracks type constraint to allow ai_generation and existing types
ALTER TABLE public.tracks DROP CONSTRAINT IF EXISTS tracks_type_check;

-- Add new constraint that includes all types
ALTER TABLE public.tracks ADD CONSTRAINT tracks_type_check 
CHECK (type IS NULL OR type IN ('upload', 'track', 'ai_generation', 'remix', 'sample', 'stem'));