-- Fix RLS Disabled in Public security issue
-- Enable RLS on payment_tokens and plans tables

-- 1. Enable RLS on payment_tokens table
ALTER TABLE public.payment_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies for payment_tokens (users can only access their own tokens)
CREATE POLICY "Users can view their own payment tokens" 
ON public.payment_tokens 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment tokens" 
ON public.payment_tokens 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment tokens" 
ON public.payment_tokens 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payment tokens" 
ON public.payment_tokens 
FOR DELETE 
USING (auth.uid() = user_id);

-- Admins can manage all payment tokens
CREATE POLICY "Admins can manage all payment tokens" 
ON public.payment_tokens 
FOR ALL 
USING (is_admin(auth.uid()));

-- 2. Enable RLS on plans table
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Create policies for plans (read-only for all users, write for admins only)
CREATE POLICY "Everyone can view plans" 
ON public.plans 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can insert plans" 
ON public.plans 
FOR INSERT 
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Only admins can update plans" 
ON public.plans 
FOR UPDATE 
USING (is_admin(auth.uid()));

CREATE POLICY "Only admins can delete plans" 
ON public.plans 
FOR DELETE 
USING (is_admin(auth.uid()));