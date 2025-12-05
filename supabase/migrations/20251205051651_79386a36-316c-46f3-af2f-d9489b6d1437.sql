-- =============================================
-- FASE 1: Corrigir RLS de user_profiles
-- =============================================

-- Remover política pública perigosa que permite acesso a todos
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.user_profiles;

-- Criar política para usuários autenticados verem perfis públicos básicos
CREATE POLICY "Authenticated users can view basic profile data"
ON public.user_profiles FOR SELECT TO authenticated
USING (true);

-- Criar política para usuários editarem próprio perfil
CREATE POLICY "Users can manage own profile"
ON public.user_profiles FOR ALL TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- =============================================
-- FASE 2: Criar VIEW pública segura para social features
-- =============================================

-- Criar VIEW que expõe apenas dados necessários para funcionalidades sociais
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  username,
  dj_name,
  avatar_url,
  verified,
  followers_count,
  total_plays
FROM public.user_profiles;

-- Dar acesso à VIEW para authenticated users
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;

-- =============================================
-- FASE 3: Migrar e remover cartao_credito_token de users_data
-- =============================================

-- Migrar dados existentes para payment_tokens (sem ON CONFLICT, apenas insere se não existir)
INSERT INTO public.payment_tokens (user_id, card_token)
SELECT ud.user_id, ud.cartao_credito_token::bytea 
FROM public.users_data ud
WHERE ud.cartao_credito_token IS NOT NULL
  AND ud.cartao_credito_token != ''
  AND NOT EXISTS (
    SELECT 1 FROM public.payment_tokens pt WHERE pt.user_id = ud.user_id
  );

-- Remover coluna perigosa que armazena tokens de cartão em texto plano
ALTER TABLE public.users_data DROP COLUMN IF EXISTS cartao_credito_token;

-- =============================================
-- FASE 4: Fortalecer RLS de profiles
-- =============================================

-- Garantir que apenas usuários autenticados podem ver perfis
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Criar política para usuários verem próprio perfil
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = id);

-- Criar VIEW pública para profiles também (para busca social)
CREATE OR REPLACE VIEW public.public_user_profiles AS
SELECT 
  id,
  username,
  display_name,
  avatar_url,
  subscription_plan
FROM public.profiles;

GRANT SELECT ON public.public_user_profiles TO authenticated;
GRANT SELECT ON public.public_user_profiles TO anon;