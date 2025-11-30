-- Make tracks storage bucket public for audio playback
UPDATE storage.buckets 
SET public = true 
WHERE id = 'tracks';

-- Drop existing policy if it exists and recreate
DROP POLICY IF EXISTS "Public access to tracks bucket" ON storage.objects;

-- Create public read policy for tracks bucket
CREATE POLICY "Public access to tracks bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'tracks');