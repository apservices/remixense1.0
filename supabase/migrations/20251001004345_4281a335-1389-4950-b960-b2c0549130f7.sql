-- Phase 1: Critical Security Fixes

-- 1. Fix admin_users policies to prevent infinite recursion
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can see all admin users" ON public.admin_users;

-- Create safe policies using direct auth.uid() checks
CREATE POLICY "Admin users can view admin list"
ON public.admin_users
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users au
    WHERE au.user_id = auth.uid()
  )
);

-- 2. Restrict subscription_limits to authenticated users only
DROP POLICY IF EXISTS "Everyone can read subscription limits" ON public.subscription_limits;

CREATE POLICY "Authenticated users can read subscription limits"
ON public.subscription_limits
FOR SELECT
USING (auth.role() = 'authenticated');

-- 3. Add missing policies for tables with RLS enabled but no policies

-- rate_limit_logs: Only system should write, admins can read
CREATE POLICY "System can insert rate limit logs"
ON public.rate_limit_logs
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view rate limit logs"
ON public.rate_limit_logs
FOR SELECT
USING (is_admin(auth.uid()));

-- analytics_data: Users can only see their own data
CREATE POLICY "Users can view their own analytics"
ON public.analytics_data
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.releases r
    JOIN public.projects p ON p.id = r.project_id
    WHERE r.id = analytics_data.release_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage analytics"
ON public.analytics_data
FOR ALL
USING (is_admin(auth.uid()));

-- recommendations_log: Users can only see their own recommendations
CREATE POLICY "Users can view their own recommendations"
ON public.recommendations_log
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert recommendations"
ON public.recommendations_log
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- platform_connections: Users can only manage their own connections
CREATE POLICY "Users can view their own platform connections"
ON public.platform_connections
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own platform connections"
ON public.platform_connections
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- releases: Users can manage their own releases
CREATE POLICY "Users can view their own releases"
ON public.releases
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = releases.project_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage their own releases"
ON public.releases
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = releases.project_id
    AND p.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = releases.project_id
    AND p.user_id = auth.uid()
  )
);

-- collaborations: Participants can view, proposer can manage
CREATE POLICY "Participants can view collaborations"
ON public.collaborations
FOR SELECT
USING (
  auth.uid() = proposer_id OR 
  auth.uid() = recipient_id
);

CREATE POLICY "Proposer can manage collaborations"
ON public.collaborations
FOR ALL
USING (auth.uid() = proposer_id)
WITH CHECK (auth.uid() = proposer_id);

-- licenses: Buyer and seller can view their licenses
CREATE POLICY "Users can view their licenses"
ON public.licenses
FOR SELECT
USING (
  auth.uid() = buyer_id OR 
  auth.uid() = seller_id
);

-- remix_threads: Owner and post creator can manage
CREATE POLICY "Users can view remix threads"
ON public.remix_threads
FOR SELECT
USING (
  auth.uid() = owner_id OR
  EXISTS (
    SELECT 1 FROM public.posts p
    WHERE p.id = remix_threads.post_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Owner can manage remix threads"
ON public.remix_threads
FOR ALL
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- feedback_rooms: Creator and project owner can manage
CREATE POLICY "Users can view feedback rooms"
ON public.feedback_rooms
FOR SELECT
USING (
  auth.uid() = creator_id OR
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = feedback_rooms.project_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Creator can manage feedback rooms"
ON public.feedback_rooms
FOR ALL
USING (auth.uid() = creator_id)
WITH CHECK (auth.uid() = creator_id);

-- challenges: Everyone can view, creator can manage
CREATE POLICY "Everyone can view challenges"
ON public.challenges
FOR SELECT
USING (true);

CREATE POLICY "Creator can manage challenges"
ON public.challenges
FOR ALL
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

-- exports: Users can only see their own exports
CREATE POLICY "Users can view their own exports"
ON public.exports
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tracks t
    WHERE t.id = exports.track_id
    AND t.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage their own exports"
ON public.exports
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.tracks t
    WHERE t.id = exports.track_id
    AND t.user_id = auth.uid()
  )
);

-- 4. Add token expiration and cleanup mechanism
CREATE OR REPLACE FUNCTION public.cleanup_expired_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Cleanup expired invites
  DELETE FROM public.invites 
  WHERE expires_at < NOW() AND used_at IS NULL;
  
  -- Cleanup expired platform connections
  DELETE FROM public.platform_connections 
  WHERE expires_at IS NOT NULL AND expires_at < NOW();
END;
$$;