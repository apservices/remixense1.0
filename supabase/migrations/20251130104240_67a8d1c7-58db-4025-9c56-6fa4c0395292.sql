-- ================================
-- REMIXENSE - COMPLETE DATABASE SCHEMA
-- ================================

-- 1. STEMS & AI ANALYSIS
CREATE TABLE IF NOT EXISTS public.track_stems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  stem_type TEXT NOT NULL CHECK (stem_type IN ('vocals', 'drums', 'bass', 'harmony', 'fx', 'other')),
  file_url TEXT NOT NULL,
  file_size BIGINT,
  duration NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audio_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  bpm NUMERIC,
  key_signature TEXT,
  energy_level NUMERIC CHECK (energy_level >= 0 AND energy_level <= 1),
  danceability NUMERIC CHECK (danceability >= 0 AND danceability <= 1),
  valence NUMERIC CHECK (valence >= 0 AND valence <= 1),
  loudness NUMERIC,
  tempo_confidence NUMERIC,
  key_confidence NUMERIC,
  time_signature INTEGER,
  genre_tags TEXT[],
  mood_tags TEXT[],
  instruments TEXT[],
  audio_fingerprint TEXT,
  waveform_data JSONB,
  spectral_data JSONB,
  analysis_version TEXT DEFAULT '1.0',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(track_id)
);

-- 2. DJ SETS & AUTO-MIX
CREATE TABLE IF NOT EXISTS public.dj_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  set_name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT true,
  total_duration INTEGER,
  average_bpm NUMERIC,
  energy_flow JSONB,
  cover_art_url TEXT,
  play_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.dj_set_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id UUID NOT NULL REFERENCES public.dj_sets(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  start_time NUMERIC DEFAULT 0,
  end_time NUMERIC,
  bpm_shift NUMERIC DEFAULT 0,
  key_shift TEXT,
  crossfade_duration NUMERIC DEFAULT 8,
  transition_type TEXT DEFAULT 'fade' CHECK (transition_type IN ('fade', 'cut', 'filter', 'echo')),
  cue_in NUMERIC DEFAULT 0,
  cue_out NUMERIC,
  fx_chain JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mix_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id UUID NOT NULL REFERENCES public.dj_sets(id) ON DELETE CASCADE,
  compatibility_score NUMERIC CHECK (compatibility_score >= 0 AND compatibility_score <= 100),
  energy_curve JSONB,
  key_progression TEXT[],
  bpm_progression NUMERIC[],
  transition_quality JSONB,
  suggestions JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. SOCIAL FEED
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  dj_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  cover_url TEXT,
  location TEXT,
  website_url TEXT,
  instagram_handle TEXT,
  soundcloud_handle TEXT,
  spotify_url TEXT,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  total_plays INTEGER DEFAULT 0,
  total_likes INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  post_type TEXT NOT NULL CHECK (post_type IN ('set', 'remix', 'track', 'text')),
  content_id UUID,
  caption TEXT,
  media_urls TEXT[],
  hashtags TEXT[],
  mentions UUID[],
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  repost_count INTEGER DEFAULT 0,
  play_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL,
  following_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- 4. STREAMING & PLAYBACK
CREATE TABLE IF NOT EXISTS public.stream_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('track', 'set', 'remix')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  quality TEXT DEFAULT 'high',
  device_type TEXT,
  ip_address INET,
  location JSONB
);

CREATE TABLE IF NOT EXISTS public.plays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('track', 'set', 'remix')),
  duration_listened INTEGER,
  completion_rate NUMERIC,
  played_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. MARKETPLACE & MONETIZATION
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL,
  product_type TEXT NOT NULL CHECK (product_type IN ('remix', 'loop', 'kit', 'stem', 'preset', 'sample_pack')),
  title TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  currency TEXT DEFAULT 'BRL',
  file_url TEXT,
  preview_url TEXT,
  cover_image_url TEXT,
  tags TEXT[],
  bpm INTEGER,
  key_signature TEXT,
  genre TEXT,
  downloads_count INTEGER DEFAULT 0,
  rating NUMERIC DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id),
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'BRL',
  commission INTEGER NOT NULL,
  seller_amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT,
  payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'BRL',
  pix_key TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  transaction_id TEXT
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_track_stems_track_id ON public.track_stems(track_id);
CREATE INDEX IF NOT EXISTS idx_track_stems_user_id ON public.track_stems(user_id);
CREATE INDEX IF NOT EXISTS idx_audio_analysis_track_id ON public.audio_analysis(track_id);
CREATE INDEX IF NOT EXISTS idx_dj_sets_user_id ON public.dj_sets(user_id);
CREATE INDEX IF NOT EXISTS idx_dj_sets_is_public ON public.dj_sets(is_public);
CREATE INDEX IF NOT EXISTS idx_dj_set_tracks_set_id ON public.dj_set_tracks(set_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_user_id ON public.social_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_created_at ON public.social_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_stream_sessions_user_id ON public.stream_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_plays_user_id ON public.plays(user_id);
CREATE INDEX IF NOT EXISTS idx_plays_content_id ON public.plays(content_id);
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON public.products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON public.orders(seller_id);

-- TRIGGERS FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_track_stems_updated_at BEFORE UPDATE ON public.track_stems
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audio_analysis_updated_at BEFORE UPDATE ON public.audio_analysis
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dj_sets_updated_at BEFORE UPDATE ON public.dj_sets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_posts_updated_at BEFORE UPDATE ON public.social_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS POLICIES
ALTER TABLE public.track_stems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dj_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dj_set_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mix_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stream_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- Track Stems Policies
CREATE POLICY "Users can view own stems" ON public.track_stems FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own stems" ON public.track_stems FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own stems" ON public.track_stems FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own stems" ON public.track_stems FOR DELETE USING (auth.uid() = user_id);

-- Audio Analysis Policies
CREATE POLICY "Users can view own analysis" ON public.audio_analysis FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analysis" ON public.audio_analysis FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own analysis" ON public.audio_analysis FOR UPDATE USING (auth.uid() = user_id);

-- DJ Sets Policies
CREATE POLICY "Public sets are viewable" ON public.dj_sets FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can insert own sets" ON public.dj_sets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sets" ON public.dj_sets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sets" ON public.dj_sets FOR DELETE USING (auth.uid() = user_id);

-- DJ Set Tracks Policies
CREATE POLICY "Set tracks viewable via set" ON public.dj_set_tracks FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.dj_sets WHERE id = set_id AND (is_public = true OR user_id = auth.uid())));
CREATE POLICY "Users can manage own set tracks" ON public.dj_set_tracks FOR ALL
  USING (EXISTS (SELECT 1 FROM public.dj_sets WHERE id = set_id AND user_id = auth.uid()));

-- User Profiles Policies
CREATE POLICY "Profiles are viewable by everyone" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Social Posts Policies
CREATE POLICY "Public posts are viewable" ON public.social_posts FOR SELECT USING (true);
CREATE POLICY "Users can insert own posts" ON public.social_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON public.social_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON public.social_posts FOR DELETE USING (auth.uid() = user_id);

-- Follows Policies
CREATE POLICY "Follows are viewable" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users can follow" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- Stream Sessions Policies
CREATE POLICY "Users can view own streams" ON public.stream_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own streams" ON public.stream_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own streams" ON public.stream_sessions FOR UPDATE USING (auth.uid() = user_id);

-- Plays Policies
CREATE POLICY "Users can view own plays" ON public.plays FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert plays" ON public.plays FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Products Policies
CREATE POLICY "Active products are viewable" ON public.products FOR SELECT USING (is_active = true OR auth.uid() = seller_id);
CREATE POLICY "Sellers can insert products" ON public.products FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Sellers can update own products" ON public.products FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Sellers can delete own products" ON public.products FOR DELETE USING (auth.uid() = seller_id);

-- Orders Policies
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Buyers can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Payouts Policies
CREATE POLICY "Users can view own payouts" ON public.payouts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can request payouts" ON public.payouts FOR INSERT WITH CHECK (auth.uid() = user_id);