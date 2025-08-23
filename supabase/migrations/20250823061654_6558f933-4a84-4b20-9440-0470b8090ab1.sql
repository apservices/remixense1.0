-- Fix missing RLS policies for core tables

-- Fix tracks table policies (enable proper user access)
CREATE POLICY "Users can view their own tracks" ON public.tracks
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tracks" ON public.tracks 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tracks" ON public.tracks
FOR UPDATE USING (auth.uid() = user_id);

-- Fix profiles table policies (already have some but ensure complete coverage)
CREATE POLICY "Users can insert their own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Fix dj_sessions table policies (already exist but ensure completeness)
CREATE POLICY "Users can delete their own dj_sessions" ON public.dj_sessions
FOR DELETE USING (auth.uid() = user_id);

-- Fix playlists table policies (already exist but ensure completeness)  
CREATE POLICY "Users can delete their own playlists" ON public.playlists
FOR DELETE USING (auth.uid() = user_id);

-- Fix posts table policies (already exist but ensure completeness)
CREATE POLICY "Users can delete their own posts" ON public.posts
FOR DELETE USING (auth.uid() = user_id);

-- Fix projects table policies (already exist but ensure completeness)
CREATE POLICY "Users can delete their own projects" ON public.projects  
FOR DELETE USING (auth.uid() = user_id);

-- Fix stems table policies (already exist but ensure completeness)
CREATE POLICY "Users can delete their own stems" ON public.stems
FOR DELETE USING (auth.uid() = user_id);

-- Fix notes table policies (already exist but ensure completeness)  
CREATE POLICY "Users can delete their own notes" ON public.notes
FOR DELETE USING (auth.uid() = user_id);

-- Fix comments table policies (already exist but ensure completeness)
CREATE POLICY "Users can delete their own comments" ON public.comments
FOR DELETE USING (auth.uid() = user_id);

-- Fix likes table policies (already exist but ensure completeness)
CREATE POLICY "Users can delete their own likes" ON public.likes  
FOR DELETE USING (auth.uid() = user_id);

-- Fix post_likes table policies (already exist but ensure completeness)
CREATE POLICY "Users can delete their own post_likes" ON public.post_likes
FOR DELETE USING (auth.uid() = user_id);

-- Fix feedback_comments table policies (already exist but ensure completeness)
CREATE POLICY "Users can delete their own feedback_comments" ON public.feedback_comments
FOR DELETE USING (auth.uid() = user_id);

-- Fix challenge_submissions table policies (already exist but ensure completeness) 
CREATE POLICY "Users can delete their own challenge_submissions" ON public.challenge_submissions
FOR DELETE USING (auth.uid() = user_id);

-- Add admin policies for administrative access
CREATE POLICY "Admins can manage all tracks" ON public.tracks
FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage all profiles" ON public.profiles  
FOR ALL USING (is_admin(auth.uid()));

-- Fix storage bucket policies for tracks
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('tracks', 'tracks', false, 52428800, ARRAY['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/flac', 'audio/ogg'])
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/flac', 'audio/ogg'];

-- Storage policies for tracks bucket
CREATE POLICY "Users can upload their own tracks" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'tracks' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own tracks" ON storage.objects  
FOR SELECT USING (
  bucket_id = 'tracks' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own tracks" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'tracks' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own tracks" ON storage.objects
FOR DELETE USING (
  bucket_id = 'tracks' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Admin storage policies
CREATE POLICY "Admins can manage all track files" ON storage.objects
FOR ALL USING (bucket_id = 'tracks' AND is_admin(auth.uid()));