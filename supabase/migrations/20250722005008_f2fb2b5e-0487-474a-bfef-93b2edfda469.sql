
-- Criar tabela para comentários temporais nas tracks
ALTER TABLE track_comments ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES track_comments(id);
ALTER TABLE track_comments ADD COLUMN IF NOT EXISTS is_resolved boolean DEFAULT false;
ALTER TABLE track_comments ADD COLUMN IF NOT EXISTS color_code text;

-- Atualizar constraint para permitir comentários temporais com timestamp
ALTER TABLE track_comments ALTER COLUMN type SET DEFAULT 'general';

-- Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_track_comments_timestamp ON track_comments(timestamp_mark) WHERE timestamp_mark IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_track_comments_track_user ON track_comments(track_id, user_id);
CREATE INDEX IF NOT EXISTS idx_track_comments_parent ON track_comments(parent_id) WHERE parent_id IS NOT NULL;

-- Atualizar RLS policies para suportar comentários aninhados
DROP POLICY IF EXISTS "Users can view comments on tracks they can access" ON track_comments;
CREATE POLICY "Users can view comments on tracks they can access" ON track_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tracks 
      WHERE tracks.id = track_comments.track_id 
      AND tracks.user_id = auth.uid()
    )
  );

-- Função para calcular cores automáticas baseadas no tipo de comentário
CREATE OR REPLACE FUNCTION get_comment_color(comment_type text)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  CASE comment_type
    WHEN 'cue_point' THEN RETURN '#10b981'; -- emerald-500
    WHEN 'beatmatch' THEN RETURN '#f59e0b'; -- amber-500
    WHEN 'transition' THEN RETURN '#8b5cf6'; -- violet-500
    WHEN 'general' THEN RETURN '#06b6d4'; -- cyan-500
    ELSE RETURN '#06b6d4'; -- default cyan
  END CASE;
END;
$$;

-- Trigger para definir cor automática se não especificada
CREATE OR REPLACE FUNCTION set_comment_color()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.color_code IS NULL THEN
    NEW.color_code = get_comment_color(NEW.type);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_comment_color_trigger ON track_comments;
CREATE TRIGGER set_comment_color_trigger
  BEFORE INSERT ON track_comments
  FOR EACH ROW
  EXECUTE FUNCTION set_comment_color();
