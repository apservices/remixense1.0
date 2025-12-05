-- AI Generations table for tracking all AI processing jobs
CREATE TABLE IF NOT EXISTS public.ai_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL CHECK (type IN ('melody', 'harmony', 'mastering', 'stems', 'mood', 'waveform')),
  input_track_id uuid REFERENCES public.tracks(id) ON DELETE SET NULL,
  output_url text,
  parameters jsonb DEFAULT '{}',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message text,
  credits_used integer DEFAULT 0,
  processing_time_ms integer,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Enable RLS
ALTER TABLE public.ai_generations ENABLE ROW LEVEL SECURITY;

-- RLS Policies - users can only see their own generations
CREATE POLICY "Users can view their own AI generations"
  ON public.ai_generations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI generations"
  ON public.ai_generations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI generations"
  ON public.ai_generations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI generations"
  ON public.ai_generations FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_ai_generations_user_id ON public.ai_generations(user_id);
CREATE INDEX idx_ai_generations_status ON public.ai_generations(status);
CREATE INDEX idx_ai_generations_type ON public.ai_generations(type);