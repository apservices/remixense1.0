-- 1) Server-side enforcement of upload limits on tracks
-- Drop permissive insert policy and replace with plan-aware policy
DROP POLICY IF EXISTS "tracks_insert_own" ON public.tracks;

CREATE POLICY "tracks_insert_with_limit"
ON public.tracks
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND public.can_user_upload_track(auth.uid())
);

-- 2) Storage: enforce plan limits for uploads to private buckets
-- Allow inserting only into user's own folder and only if within plan limits
CREATE POLICY IF NOT EXISTS "tracks_bucket_insert_with_limit"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'tracks'
  AND auth.role() = 'authenticated'
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND public.can_user_upload_track(auth.uid())
);

CREATE POLICY IF NOT EXISTS "audio_files_bucket_insert_with_limit"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'audio-files'
  AND auth.role() = 'authenticated'
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND public.can_user_upload_track(auth.uid())
);

-- 3) Database-backed rate limiting (used by edge functions)
-- Create table to log requests for rate limiting if it doesn't exist
CREATE TABLE IF NOT EXISTS public.rate_limit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  endpoint text NOT NULL,
  ts timestamptz NOT NULL DEFAULT now()
);

-- Helpful index for fast lookups
CREATE INDEX IF NOT EXISTS idx_rate_limit_logs_identifier_endpoint_ts
  ON public.rate_limit_logs (identifier, endpoint, ts);

-- Create or replace the RPC used by edge functions
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier text,
  p_endpoint text,
  p_max_requests integer,
  p_window_minutes integer
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_count integer;
BEGIN
  -- Count requests in the given window
  SELECT COUNT(*) INTO v_count
  FROM public.rate_limit_logs
  WHERE identifier = p_identifier
    AND endpoint = p_endpoint
    AND ts > (now() - make_interval(mins => p_window_minutes));

  IF v_count >= p_max_requests THEN
    RETURN false; -- over the limit
  END IF;

  -- Log this request
  INSERT INTO public.rate_limit_logs(identifier, endpoint, ts)
  VALUES (p_identifier, p_endpoint, now());

  RETURN true; -- allowed
END;
$$;