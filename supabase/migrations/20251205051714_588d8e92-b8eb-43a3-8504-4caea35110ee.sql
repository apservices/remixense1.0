-- Corrigir VIEWs com SECURITY INVOKER (mais seguro que DEFINER)
DROP VIEW IF EXISTS public.public_profiles;
DROP VIEW IF EXISTS public.public_user_profiles;

-- Recriar VIEW para user_profiles com SECURITY INVOKER
CREATE VIEW public.public_profiles 
WITH (security_invoker = true)
AS
SELECT 
  id,
  username,
  dj_name,
  avatar_url,
  verified,
  followers_count,
  total_plays
FROM public.user_profiles;

-- Recriar VIEW para profiles com SECURITY INVOKER
CREATE VIEW public.public_user_profiles 
WITH (security_invoker = true)
AS
SELECT 
  id,
  username,
  display_name,
  avatar_url,
  subscription_plan
FROM public.profiles;

-- Dar acesso às VIEWs
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;
GRANT SELECT ON public.public_user_profiles TO authenticated;
GRANT SELECT ON public.public_user_profiles TO anon;