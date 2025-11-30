-- Criar tabela de eventos de lançamento
CREATE TABLE IF NOT EXISTS public.launch_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  launch_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  platform TEXT,
  reminder_enabled BOOLEAN DEFAULT true,
  reminder_days_before INTEGER DEFAULT 7,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_launch_events_user_id ON public.launch_events(user_id);
CREATE INDEX IF NOT EXISTS idx_launch_events_launch_date ON public.launch_events(launch_date);
CREATE INDEX IF NOT EXISTS idx_launch_events_status ON public.launch_events(status);

-- RLS Policies
ALTER TABLE public.launch_events ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver seus próprios eventos
CREATE POLICY "Users can view own launch events"
  ON public.launch_events
  FOR SELECT
  USING (auth.uid() = user_id);

-- Usuários podem criar seus próprios eventos
CREATE POLICY "Users can create own launch events"
  ON public.launch_events
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar seus próprios eventos
CREATE POLICY "Users can update own launch events"
  ON public.launch_events
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Usuários podem deletar seus próprios eventos
CREATE POLICY "Users can delete own launch events"
  ON public.launch_events
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_launch_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER launch_events_updated_at
  BEFORE UPDATE ON public.launch_events
  FOR EACH ROW
  EXECUTE FUNCTION update_launch_events_updated_at();

-- Comentários
COMMENT ON TABLE public.launch_events IS 'Eventos de lançamento musical agendados pelos usuários';
COMMENT ON COLUMN public.launch_events.status IS 'Status do evento: planned, in_progress, completed, cancelled';
COMMENT ON COLUMN public.launch_events.reminder_enabled IS 'Se o usuário quer receber lembretes deste evento';
COMMENT ON COLUMN public.launch_events.reminder_days_before IS 'Quantos dias antes enviar lembrete';