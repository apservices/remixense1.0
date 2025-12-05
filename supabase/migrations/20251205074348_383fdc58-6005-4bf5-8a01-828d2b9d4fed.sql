-- Add missing columns to profiles table that the application expects
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS dj_name TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS favorite_genres TEXT[];