-- Drop the existing check constraint and recreate with suno_generation allowed
ALTER TABLE public.ai_generations DROP CONSTRAINT IF EXISTS ai_generations_type_check;

-- Add new check constraint that includes suno_generation
ALTER TABLE public.ai_generations ADD CONSTRAINT ai_generations_type_check 
CHECK (type IN ('melody', 'harmony', 'mastering', 'stem_swap', 'mood_variation', 'waveform', 'suno_generation'));