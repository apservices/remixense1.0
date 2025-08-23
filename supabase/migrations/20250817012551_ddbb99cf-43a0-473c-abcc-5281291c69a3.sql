-- Fix the get_user_subscription_info function to use correct column names
CREATE OR REPLACE FUNCTION public.get_user_subscription_info(user_uuid uuid DEFAULT auth.uid())
 RETURNS TABLE(plan_type text, status text, max_tracks integer, max_storage_mb integer, can_export boolean, can_use_community boolean, can_use_marketplace boolean, marketplace_commission_rate numeric, current_period_end timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT 
    COALESCE(s.plan_id, 'free'),
    COALESCE(s.status, 'inactive'),
    l.max_tracks,
    l.max_storage_mb,
    l.can_export,
    l.can_use_community,
    l.can_use_marketplace,
    l.marketplace_commission_rate,
    s.current_period_end
  FROM public.subscription_limits l
  LEFT JOIN public.subscriptions s ON s.plan_id = l.plan_type AND s.user_id = user_uuid
  WHERE l.plan_type = COALESCE(s.plan_id, 'free');
$function$