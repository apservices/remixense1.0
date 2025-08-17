-- Create invites table for restricted access with token-based onboarding
CREATE EXTENSION IF NOT EXISTS citext;

-- 1) Table
CREATE TABLE IF NOT EXISTS public.invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email citext NOT NULL,
  token text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','revoked')),
  expires_at timestamptz NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  accepted_by uuid NULL,
  accepted_at timestamptz NULL,
  note text NULL
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_invites_email ON public.invites (email);
CREATE UNIQUE INDEX IF NOT EXISTS unique_pending_invite_per_email ON public.invites (email) WHERE status = 'pending';

-- 2) RLS
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- Admin-only management policies using existing is_admin() helper
DROP POLICY IF EXISTS "Admins can insert invites" ON public.invites;
CREATE POLICY "Admins can insert invites"
ON public.invites
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can select invites" ON public.invites;
CREATE POLICY "Admins can select invites"
ON public.invites
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update invites" ON public.invites;
CREATE POLICY "Admins can update invites"
ON public.invites
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete invites" ON public.invites;
CREATE POLICY "Admins can delete invites"
ON public.invites
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- 3) Updated-at trigger
DROP TRIGGER IF EXISTS update_invites_updated_at ON public.invites;
CREATE TRIGGER update_invites_updated_at
BEFORE UPDATE ON public.invites
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();