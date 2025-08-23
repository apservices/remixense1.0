-- Create storage bucket for audio files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('audio-files', 'audio-files', false);

-- Create storage policies for audio files
CREATE POLICY "Users can view their own audio files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'audio-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own audio files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'audio-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own audio files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'audio-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own audio files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'audio-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add upload functionality columns to tracks table
ALTER TABLE tracks 
ADD COLUMN IF NOT EXISTS upload_status text DEFAULT 'completed',
ADD COLUMN IF NOT EXISTS original_filename text,
ADD COLUMN IF NOT EXISTS file_size bigint,
ADD COLUMN IF NOT EXISTS waveform_data jsonb;

-- Create comments table for track feedback
CREATE TABLE public.track_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  track_id uuid NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  timestamp_mark numeric,
  type text DEFAULT 'general' CHECK (type IN ('general', 'cue_point', 'beatmatch', 'transition')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on comments
ALTER TABLE public.track_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for comments
CREATE POLICY "Users can view comments on tracks they can access" 
ON public.track_comments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM tracks 
    WHERE tracks.id = track_comments.track_id 
    AND tracks.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create comments on tracks they can access" 
ON public.track_comments 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM tracks 
    WHERE tracks.id = track_comments.track_id 
    AND tracks.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own comments" 
ON public.track_comments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.track_comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_track_comments_updated_at
BEFORE UPDATE ON public.track_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create DJ sessions table for mix analytics
CREATE TABLE public.dj_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  session_name text NOT NULL,
  duration integer, -- in seconds
  tracks_mixed integer DEFAULT 0,
  session_data jsonb, -- BPM changes, transitions, etc.
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dj_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for DJ sessions
CREATE POLICY "Users can access own DJ sessions" 
ON public.dj_sessions 
FOR ALL 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_dj_sessions_updated_at
BEFORE UPDATE ON public.dj_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();