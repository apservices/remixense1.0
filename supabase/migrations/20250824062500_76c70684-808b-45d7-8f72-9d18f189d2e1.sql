-- Create upload analytics table for logging upload events
CREATE TABLE IF NOT EXISTS public.upload_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('upload_started', 'upload_completed', 'upload_failed', 'upload_retry')),
  track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE,
  file_size BIGINT,
  file_type TEXT,
  duration_ms INTEGER,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on upload analytics
ALTER TABLE public.upload_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for upload analytics
CREATE POLICY "Users can view their own upload analytics" ON public.upload_analytics
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own upload analytics" ON public.upload_analytics 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all upload analytics" ON public.upload_analytics
FOR ALL USING (is_admin(auth.uid()));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_upload_analytics_user_created ON public.upload_analytics(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_upload_analytics_event_type ON public.upload_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_upload_analytics_track_id ON public.upload_analytics(track_id);

-- Add deleted_at column to tracks table for soft deletes (trash system)
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Create index for deleted tracks
CREATE INDEX IF NOT EXISTS idx_tracks_deleted_at ON public.tracks(deleted_at);

-- Update tracks RLS policies to handle soft deletes
DROP POLICY IF EXISTS "Users can view their own tracks" ON public.tracks;
CREATE POLICY "Users can view their own non-deleted tracks" ON public.tracks
FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Policy for viewing deleted tracks (for trash/restore functionality)
CREATE POLICY "Users can view their own deleted tracks" ON public.tracks
FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NOT NULL);

-- Create health check edge function table for logging
CREATE TABLE IF NOT EXISTS public.health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('healthy', 'degraded', 'down')),
  response_time_ms INTEGER NOT NULL,
  error_message TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on health checks
ALTER TABLE public.health_checks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for health checks
CREATE POLICY "Admins can manage health checks" ON public.health_checks
FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "System can insert health checks" ON public.health_checks
FOR INSERT WITH CHECK (true);

-- Create indexes for health checks
CREATE INDEX IF NOT EXISTS idx_health_checks_service_created ON public.health_checks(service_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_checks_status ON public.health_checks(status);

-- Enable realtime for upload analytics and health checks
ALTER PUBLICATION supabase_realtime ADD TABLE public.upload_analytics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.health_checks;