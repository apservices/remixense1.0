-- Ensure track_cues and track_loops tables are optimized for DJ tools
-- Add indexes for better performance on DJ operations

-- Add index for track_cues queries by track_id and position
CREATE INDEX IF NOT EXISTS idx_track_cues_track_position ON track_cues(track_id, position_ms);

-- Add index for track_loops queries by track_id
CREATE INDEX IF NOT EXISTS idx_track_loops_track_id ON track_loops(track_id, start_ms);

-- Add index for track_features queries for compatibility analysis
CREATE INDEX IF NOT EXISTS idx_track_features_track_bpm_key ON track_features(track_id, bpm, key_signature);

-- Enable realtime for DJ tools tables
ALTER TABLE track_cues REPLICA IDENTITY FULL;
ALTER TABLE track_loops REPLICA IDENTITY FULL;
ALTER TABLE track_features REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE track_cues;
ALTER PUBLICATION supabase_realtime ADD TABLE track_loops;
ALTER PUBLICATION supabase_realtime ADD TABLE track_features;