-- Fix SECURITY DEFINER view issue for public_tracks
-- Recreate the view with SECURITY INVOKER to respect RLS policies of querying user

DROP VIEW IF EXISTS public_tracks;

CREATE VIEW public_tracks 
WITH (security_invoker = true) AS
SELECT 
    id,
    title,
    artist,
    duration,
    bpm,
    genre,
    key_signature,
    energy_level,
    tags,
    is_featured,
    play_count,
    created_at,
    waveform_data,
    original_filename
FROM tracks
WHERE deleted_at IS NULL;