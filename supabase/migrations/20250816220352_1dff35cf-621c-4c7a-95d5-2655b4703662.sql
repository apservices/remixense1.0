-- Add RLS policy for users to delete their own tracks
CREATE POLICY "Users can delete their own tracks" 
ON public.tracks 
FOR DELETE 
USING (auth.uid() = user_id);

-- Also allow users to delete from storage (if not already exists)
CREATE POLICY "Users can delete their own track files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'tracks' AND auth.uid()::text = (storage.foldername(name))[1]);