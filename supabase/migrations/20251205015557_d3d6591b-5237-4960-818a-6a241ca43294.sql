-- Fix users_data: Remove inconsistent policy that uses wrong column
DROP POLICY IF EXISTS "user_self_access" ON users_data;

-- Add DELETE policy for users_data (currently missing)
CREATE POLICY "Users can delete their own user data" ON users_data
FOR DELETE USING (auth.uid() = user_id);

-- Ensure user_id is required for proper RLS enforcement
-- (Cannot alter to NOT NULL if existing records have NULL, so we add a comment instead)
COMMENT ON COLUMN users_data.user_id IS 'SECURITY: Must always match auth.uid() for RLS enforcement';