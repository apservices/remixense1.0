-- Enable RLS on rate_limit_logs to satisfy linter and harden access
ALTER TABLE public.rate_limit_logs ENABLE ROW LEVEL SECURITY;
-- Intentionally no policies so clients cannot access this table.
-- SECURITY DEFINER function public.check_rate_limit will operate with owner privileges.
