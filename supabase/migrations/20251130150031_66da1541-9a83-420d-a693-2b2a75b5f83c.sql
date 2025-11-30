-- Create function to increment comment count on posts
CREATE OR REPLACE FUNCTION increment_comment_count(post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE social_posts 
  SET comment_count = COALESCE(comment_count, 0) + 1 
  WHERE id = post_id;
END;
$$;

-- Create function to decrement comment count on posts
CREATE OR REPLACE FUNCTION decrement_comment_count(post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE social_posts 
  SET comment_count = GREATEST(COALESCE(comment_count, 0) - 1, 0)
  WHERE id = post_id;
END;
$$;