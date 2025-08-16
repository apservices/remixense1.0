-- Storage security policies and tester invites

-- Avatars: public read, owners manage their own files
CREATE POLICY "Avatar files are publicly readable"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users manage own avatars"
ON storage.objects
FOR ALL
USING (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Private buckets: audio-files and tracks (per-user folder access)
CREATE POLICY "Users read own private audio/track files"
ON storage.objects
FOR SELECT
USING (
  bucket_id IN ('audio-files','tracks')
  AND auth.role() = 'authenticated'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users insert own private audio/track files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id IN ('audio-files','tracks')
  AND auth.role() = 'authenticated'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users update own private audio/track files"
ON storage.objects
FOR UPDATE
USING (
  bucket_id IN ('audio-files','tracks')
  AND auth.role() = 'authenticated'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id IN ('audio-files','tracks')
  AND auth.role() = 'authenticated'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users delete own private audio/track files"
ON storage.objects
FOR DELETE
USING (
  bucket_id IN ('audio-files','tracks')
  AND auth.role() = 'authenticated'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Insert real invites for testers (expires_at uses table default)
INSERT INTO public.invites (email, token, plan_type)
VALUES
  ('tester1@remixense.com', '5b8f4f5a-7b0a-4c3f-9c1d-1d2e3f4a5b6c', 'free'),
  ('tester2@remixense.com', '6c7d8e9f-0a1b-2c3d-4e5f-60718293a4b5', 'pro'),
  ('tester3@remixense.com', '7e8f901a-2b3c-4d5e-6f70-8192a3b4c5d6', 'expert'),
  ('tester4@remixense.com', '8f901a2b-3c4d-5e6f-7081-92a3b4c5d6e7', 'free'),
  ('tester5@remixense.com', '9a1b2c3d-4e5f-6071-8293-a4b5c6d7e8f9', 'pro');