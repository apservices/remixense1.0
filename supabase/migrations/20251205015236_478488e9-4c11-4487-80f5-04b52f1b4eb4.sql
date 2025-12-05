-- Fix access_logs INSERT policy to require user ownership
DROP POLICY IF EXISTS "System can insert access logs" ON access_logs;

CREATE POLICY "Users can insert own access logs" ON access_logs
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Fix function search_path mutable warnings by setting search_path on affected functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_like_count()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $function$
begin
  if tg_op = 'INSERT' then
    update public.posts set like_count = like_count + 1 where id = new.post_id;
  elsif tg_op = 'DELETE' then
    update public.posts set like_count = like_count - 1 where id = old.post_id;
  end if;
  return null;
end;
$function$;

CREATE OR REPLACE FUNCTION public.update_launch_events_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $function$
begin new.updated_at = now(); return new; end $function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  DELETE FROM public.invites 
  WHERE expires_at < NOW() AND used_at IS NULL;
  
  DELETE FROM public.platform_connections 
  WHERE expires_at IS NOT NULL AND expires_at < NOW();
END;
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  DELETE FROM public.processing_cache 
  WHERE expires_at < NOW();
END;
$function$;

CREATE OR REPLACE FUNCTION public.can_create_playlist(p_user uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SET search_path = public, pg_temp
AS $function$
declare
  lim int; cnt int;
begin
  if to_regclass('public.playlists') is null then
    return true;
  end if;

  select pl.max_playlists
    into lim
  from public.profiles pr
  join public.plans pl on pl.id = pr.plan
  where pr.id = p_user;

  if lim is null then
    return true;
  end if;

  select count(*) into cnt
  from public.playlists
  where user_id = p_user;

  return cnt < lim;
end
$function$;

CREATE OR REPLACE FUNCTION public.can_create_mix(p_user uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SET search_path = public, pg_temp
AS $function$
declare
  lim int; cnt int;
begin
  if to_regclass('public.mixes') is null then
    return true;
  end if;

  select pl.max_mixes
    into lim
  from public.profiles pr
  join public.plans pl on pl.id = pr.plan
  where pr.id = p_user;

  if lim is null then
    return true;
  end if;

  select count(*) into cnt
  from public.mixes
  where user_id = p_user;

  return cnt < lim;
end
$function$;

CREATE OR REPLACE FUNCTION public.can_create_track(p_user uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SET search_path = public, pg_temp
AS $function$
declare
  lim int; cnt int;
begin
  if to_regclass('public.tracks') is null then
    return true;
  end if;

  select pl.max_tracks
    into lim
  from public.profiles pr
  join public.plans pl on pl.id = pr.plan
  where pr.id = p_user;

  if lim is null then
    return true;
  end if;

  select count(*) into cnt
  from public.tracks
  where user_id = p_user;

  return cnt < lim;
end
$function$;