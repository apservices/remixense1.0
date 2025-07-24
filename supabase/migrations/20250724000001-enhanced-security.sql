-- Enhanced security policies and audit logging

-- Add audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  table_name text NOT NULL,
  operation text NOT NULL,
  old_data jsonb,
  new_data jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for audit logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs (for now, restrict to service role)
CREATE POLICY "Service role can manage audit logs"
  ON audit_logs FOR ALL
  USING (auth.role() = 'service_role');

-- Enhanced RLS policies for platform_connections
DROP POLICY IF EXISTS "Users can view their own connections" ON platform_connections;
DROP POLICY IF EXISTS "Users can manage their own connections" ON platform_connections;

-- More restrictive policies
CREATE POLICY "Users can view their own connections"
  ON platform_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own connections"
  ON platform_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own connections"
  ON platform_connections FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own connections"
  ON platform_connections FOR DELETE
  USING (auth.uid() = user_id);

-- Add encryption for sensitive data (access tokens)
-- Create function to encrypt/decrypt tokens
CREATE OR REPLACE FUNCTION encrypt_token(token text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT encode(digest(token || current_setting('app.jwt_secret', true), 'sha256'), 'base64');
$$;

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_ip inet;
  user_agent_header text;
BEGIN
  -- Try to get IP and user agent from request headers
  user_ip := inet(current_setting('request.headers.x-forwarded-for', true));
  user_agent_header := current_setting('request.headers.user-agent', true);

  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (user_id, table_name, operation, new_data, ip_address, user_agent)
    VALUES (NEW.user_id, TG_TABLE_NAME, TG_OP, to_jsonb(NEW), user_ip, user_agent_header);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (user_id, table_name, operation, old_data, new_data, ip_address, user_agent)
    VALUES (NEW.user_id, TG_TABLE_NAME, TG_OP, to_jsonb(OLD), to_jsonb(NEW), user_ip, user_agent_header);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (user_id, table_name, operation, old_data, ip_address, user_agent)
    VALUES (OLD.user_id, TG_TABLE_NAME, TG_OP, to_jsonb(OLD), user_ip, user_agent_header);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Add audit triggers to sensitive tables
CREATE TRIGGER platform_connections_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON platform_connections
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER exports_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON exports
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_function();

-- Add rate limiting table
CREATE TABLE IF NOT EXISTS rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL, -- IP address or user_id
  endpoint text NOT NULL,
  request_count integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(identifier, endpoint, window_start)
);

-- Enable RLS for rate limits
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service role can manage rate limits
CREATE POLICY "Service role can manage rate limits"
  ON rate_limits FOR ALL
  USING (auth.role() = 'service_role');

-- Function to check rate limits
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_identifier text,
  p_endpoint text,
  p_max_requests integer DEFAULT 60,
  p_window_minutes integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_window timestamp with time zone;
  request_count integer;
BEGIN
  -- Calculate current window start
  current_window := date_trunc('hour', now()) + 
    (EXTRACT(minute FROM now())::integer / p_window_minutes) * 
    (p_window_minutes || ' minutes')::interval;

  -- Get current request count for this window
  SELECT COALESCE(SUM(request_count), 0)
  INTO request_count
  FROM rate_limits
  WHERE identifier = p_identifier
    AND endpoint = p_endpoint
    AND window_start >= current_window;

  -- Check if limit exceeded
  IF request_count >= p_max_requests THEN
    RETURN false;
  END IF;

  -- Increment counter
  INSERT INTO rate_limits (identifier, endpoint, window_start)
  VALUES (p_identifier, p_endpoint, current_window)
  ON CONFLICT (identifier, endpoint, window_start)
  DO UPDATE SET request_count = rate_limits.request_count + 1;

  RETURN true;
END;
$$;