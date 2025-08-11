-- Idempotent migration to ensure track_features, track_cues, and track_loops exist with RLS and triggers

-- Ensure timestamp update function exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- track_features
CREATE TABLE IF NOT EXISTS public.track_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  track_id text NOT NULL,
  bpm numeric,
  mode text,
  camelot text,
  key_signature text,
  energy_level integer,
  analysis jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.track_features ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_track_features_updated_at'
  ) THEN
    CREATE TRIGGER update_track_features_updated_at
    BEFORE UPDATE ON public.track_features
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Policies for track_features
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'track_features' AND polname = 'Users can view their own track_features'
  ) THEN
    CREATE POLICY "Users can view their own track_features"
    ON public.track_features
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'track_features' AND polname = 'Users can insert their own track_features'
  ) THEN
    CREATE POLICY "Users can insert their own track_features"
    ON public.track_features
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'track_features' AND polname = 'Users can update their own track_features'
  ) THEN
    CREATE POLICY "Users can update their own track_features"
    ON public.track_features
    FOR UPDATE
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'track_features' AND polname = 'Users can delete their own track_features'
  ) THEN
    CREATE POLICY "Users can delete their own track_features"
    ON public.track_features
    FOR DELETE
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- track_cues
CREATE TABLE IF NOT EXISTS public.track_cues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  track_id text NOT NULL,
  position_ms integer NOT NULL,
  label text,
  color text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.track_cues ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_track_cues_updated_at'
  ) THEN
    CREATE TRIGGER update_track_cues_updated_at
    BEFORE UPDATE ON public.track_cues
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Policies for track_cues
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'track_cues' AND polname = 'Users can view their own track_cues'
  ) THEN
    CREATE POLICY "Users can view their own track_cues"
    ON public.track_cues
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'track_cues' AND polname = 'Users can insert their own track_cues'
  ) THEN
    CREATE POLICY "Users can insert their own track_cues"
    ON public.track_cues
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'track_cues' AND polname = 'Users can update their own track_cues'
  ) THEN
    CREATE POLICY "Users can update their own track_cues"
    ON public.track_cues
    FOR UPDATE
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'track_cues' AND polname = 'Users can delete their own track_cues'
  ) THEN
    CREATE POLICY "Users can delete their own track_cues"
    ON public.track_cues
    FOR DELETE
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- track_loops
CREATE TABLE IF NOT EXISTS public.track_loops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  track_id text NOT NULL,
  start_ms integer NOT NULL,
  end_ms integer NOT NULL,
  label text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.track_loops ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_track_loops_updated_at'
  ) THEN
    CREATE TRIGGER update_track_loops_updated_at
    BEFORE UPDATE ON public.track_loops
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Policies for track_loops
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'track_loops' AND polname = 'Users can view their own track_loops'
  ) THEN
    CREATE POLICY "Users can view their own track_loops"
    ON public.track_loops
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'track_loops' AND polname = 'Users can insert their own track_loops'
  ) THEN
    CREATE POLICY "Users can insert their own track_loops"
    ON public.track_loops
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'track_loops' AND polname = 'Users can update their own track_loops'
  ) THEN
    CREATE POLICY "Users can update their own track_loops"
    ON public.track_loops
    FOR UPDATE
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'track_loops' AND polname = 'Users can delete their own track_loops'
  ) THEN
    CREATE POLICY "Users can delete their own track_loops"
    ON public.track_loops
    FOR DELETE
    USING (auth.uid() = user_id);
  END IF;
END $$;