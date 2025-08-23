-- Create subscriptions table to track user subscription information
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan_type TEXT NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'pro', 'expert')),
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'canceled', 'past_due')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id),
  UNIQUE(email)
);

-- Enable Row Level Security
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies for subscriptions
CREATE POLICY "Users can view their own subscription" 
ON public.subscriptions 
FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Service can manage subscriptions" 
ON public.subscriptions 
FOR ALL 
USING (true);

-- Create subscription limits table
CREATE TABLE public.subscription_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_type TEXT NOT NULL UNIQUE CHECK (plan_type IN ('free', 'pro', 'expert')),
  max_tracks INTEGER NOT NULL,
  max_storage_mb INTEGER NOT NULL,
  can_export BOOLEAN DEFAULT false,
  can_use_community BOOLEAN DEFAULT false,
  can_use_marketplace BOOLEAN DEFAULT false,
  marketplace_commission_rate DECIMAL(5,2) NOT NULL DEFAULT 50.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default limits
INSERT INTO public.subscription_limits (plan_type, max_tracks, max_storage_mb, can_export, can_use_community, can_use_marketplace, marketplace_commission_rate) VALUES
('free', 3, 100, false, false, false, 50.00),
('pro', -1, 2048, true, true, true, 30.00),
('expert', -1, 10240, true, true, true, 20.00);

-- Enable RLS for limits
ALTER TABLE public.subscription_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read subscription limits" 
ON public.subscription_limits 
FOR SELECT 
USING (true);

-- Create marketplace transactions table
CREATE TABLE public.marketplace_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL,
  buyer_id UUID NOT NULL,
  track_id UUID REFERENCES public.tracks(id),
  stripe_payment_intent_id TEXT NOT NULL,
  gross_amount INTEGER NOT NULL, -- in cents
  platform_fee INTEGER NOT NULL, -- in cents
  seller_amount INTEGER NOT NULL, -- in cents
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.marketplace_transactions ENABLE ROW LEVEL SECURITY;

-- Policies for marketplace transactions
CREATE POLICY "Users can view their own transactions" 
ON public.marketplace_transactions 
FOR SELECT 
USING (auth.uid()::text = seller_id::text OR auth.uid()::text = buyer_id::text);

CREATE POLICY "Service can manage transactions" 
ON public.marketplace_transactions 
FOR ALL 
USING (true);

-- Create function to get user subscription info
CREATE OR REPLACE FUNCTION public.get_user_subscription_info(user_uuid UUID DEFAULT auth.uid())
RETURNS TABLE (
  plan_type TEXT,
  status TEXT,
  max_tracks INTEGER,
  max_storage_mb INTEGER,
  can_export BOOLEAN,
  can_use_community BOOLEAN,
  can_use_marketplace BOOLEAN,
  marketplace_commission_rate DECIMAL(5,2),
  current_period_end TIMESTAMPTZ
) 
LANGUAGE SQL 
STABLE SECURITY DEFINER
AS $$
  SELECT 
    COALESCE(s.plan_type, 'free'),
    COALESCE(s.status, 'inactive'),
    l.max_tracks,
    l.max_storage_mb,
    l.can_export,
    l.can_use_community,
    l.can_use_marketplace,
    l.marketplace_commission_rate,
    s.current_period_end
  FROM public.subscription_limits l
  LEFT JOIN public.subscriptions s ON s.plan_type = l.plan_type AND s.user_id = user_uuid
  WHERE l.plan_type = COALESCE(s.plan_type, 'free');
$$;

-- Create function to check if user can upload more tracks
CREATE OR REPLACE FUNCTION public.can_user_upload_track(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT 
    CASE 
      WHEN info.max_tracks = -1 THEN true -- unlimited
      ELSE (SELECT COUNT(*) FROM public.tracks WHERE user_id = user_uuid) < info.max_tracks
    END
  FROM public.get_user_subscription_info(user_uuid) info;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketplace_transactions_updated_at
  BEFORE UPDATE ON public.marketplace_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();