-- Migration: 20251028_ceo_notifications_system.sql
-- Sistema completo de notificações para o CEO

-- Tabela: ceo_notifications
-- Armazena todas as notificações enviadas ao CEO
CREATE TABLE IF NOT EXISTS public.ceo_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id),
  tipo TEXT NOT NULL, -- 'alerta', 'recomendacao', 'metrica_critica', 'decisao_pendente'
  severidade TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
  titulo TEXT NOT NULL,
  descricao TEXT,
  agente_origem TEXT NOT NULL,
  categoria TEXT NOT NULL,
  acoes_requeridas TEXT[],
  deadline TIMESTAMP WITH TIME ZONE,
  dados_contexto JSONB,
  status TEXT DEFAULT 'pendente', -- 'pendente', 'lida', 'resolvida', 'ignorada'
  enviada_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  lida_em TIMESTAMP WITH TIME ZONE,
  resolvida_em TIMESTAMP WITH TIME ZONE,
  notas_resolucao TEXT
);

COMMENT ON TABLE public.ceo_notifications IS 'Notificações proativas para o CEO baseadas em eventos críticos dos agentes de IA.';

-- Índices
CREATE INDEX idx_ceo_notifications_empresa ON public.ceo_notifications(empresa_id);
CREATE INDEX idx_ceo_notifications_status ON public.ceo_notifications(status);
CREATE INDEX idx_ceo_notifications_severidade ON public.ceo_notifications(severidade);
CREATE INDEX idx_ceo_notifications_enviada ON public.ceo_notifications(enviada_em DESC);

-- RLS
ALTER TABLE public.ceo_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for users by company" ON public.ceo_notifications
FOR SELECT USING (
  (SELECT empresa_id FROM public.profiles WHERE id = auth.uid()) = empresa_id
);

CREATE POLICY "Enable insert for authenticated users" ON public.ceo_notifications
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for users by company" ON public.ceo_notifications
FOR UPDATE USING (
  (SELECT empresa_id FROM public.profiles WHERE id = auth.uid()) = empresa_id
);

-- Tabela: ceo_notifications_realtime
-- Trigger para notificações em tempo real via Supabase Realtime
CREATE TABLE IF NOT EXISTS public.ceo_notifications_realtime (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES public.ceo_notifications(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.ceo_notifications_realtime IS 'Tabela para triggers de notificações em tempo real.';

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.ceo_notifications_realtime;

-- Índices
CREATE INDEX idx_ceo_notifications_realtime_timestamp ON public.ceo_notifications_realtime(timestamp DESC);

-- RLS
ALTER TABLE public.ceo_notifications_realtime ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for authenticated users" ON public.ceo_notifications_realtime
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Tabela: ceo_digests
-- Armazena digests diários e semanais para o CEO
CREATE TABLE IF NOT EXISTS public.ceo_digests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id),
  tipo TEXT NOT NULL, -- 'daily', 'weekly'
  periodo TEXT NOT NULL,
  eventos_criticos INTEGER DEFAULT 0,
  eventos_altos INTEGER DEFAULT 0,
  recomendacoes_roi_alto INTEGER DEFAULT 0,
  areas_atencao TEXT[],
  conteudo JSONB, -- { top_eventos, top_recomendacoes, tendencias }
  enviado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.ceo_digests IS 'Digests diários e semanais consolidados para o CEO.';

-- Índices
CREATE INDEX idx_ceo_digests_empresa ON public.ceo_digests(empresa_id);
CREATE INDEX idx_ceo_digests_tipo ON public.ceo_digests(tipo);
CREATE INDEX idx_ceo_digests_enviado ON public.ceo_digests(enviado_em DESC);

-- RLS
ALTER TABLE public.ceo_digests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for users by company" ON public.ceo_digests
FOR SELECT USING (
  (SELECT empresa_id FROM public.profiles WHERE id = auth.uid()) = empresa_id
);

CREATE POLICY "Enable insert for authenticated users" ON public.ceo_digests
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Tabela: ceo_notification_preferences
-- Preferências de notificação do CEO
CREATE TABLE IF NOT EXISTS public.ceo_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id),
  usuario_id UUID NOT NULL REFERENCES auth.users(id),
  enable_realtime BOOLEAN DEFAULT true,
  enable_daily_digest BOOLEAN DEFAULT true,
  enable_weekly_digest BOOLEAN DEFAULT true,
  critical_only BOOLEAN DEFAULT false,
  digest_time TEXT DEFAULT '08:00', -- HH:MM format
  notification_channels TEXT[] DEFAULT ARRAY['in_app'], -- 'in_app', 'email', 'sms'
  UNIQUE(empresa_id, usuario_id)
);

COMMENT ON TABLE public.ceo_notification_preferences IS 'Preferências de notificação para o CEO por empresa e usuário.';

-- Índices
CREATE INDEX idx_ceo_notification_prefs_empresa ON public.ceo_notification_preferences(empresa_id);
CREATE INDEX idx_ceo_notification_prefs_usuario ON public.ceo_notification_preferences(usuario_id);

-- RLS
ALTER TABLE public.ceo_notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for users" ON public.ceo_notification_preferences
FOR ALL USING (
  usuario_id = auth.uid() OR
  (SELECT empresa_id FROM public.profiles WHERE id = auth.uid()) = empresa_id
);

-- Function: auto_generate_daily_digest
-- Function para gerar digest diário automaticamente
CREATE OR REPLACE FUNCTION public.auto_generate_daily_digest()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  empresa_record RECORD;
  digest_content JSONB;
BEGIN
  -- Iterar por todas as empresas
  FOR empresa_record IN SELECT id FROM public.empresas LOOP
    -- Gerar digest (implementação simplificada, será chamada pelo backend)
    INSERT INTO public.ceo_digests (empresa_id, tipo, periodo)
    VALUES (
      empresa_record.id,
      'daily',
      'Últimas 24 horas'
    );
    
    RAISE NOTICE 'Digest diário gerado para empresa %', empresa_record.id;
  END LOOP;
END;
$$;

COMMENT ON FUNCTION public.auto_generate_daily_digest IS 'Gera digests diários automaticamente para todas as empresas.';

-- Function: cleanup_old_notifications
-- Limpa notificações antigas (90 dias)
CREATE OR REPLACE FUNCTION public.cleanup_old_notifications()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.ceo_notifications
  WHERE created_at < NOW() - INTERVAL '90 days'
  AND status IN ('lida', 'resolvida', 'ignorada');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RAISE NOTICE 'Limpeza concluída: % notificações removidas', deleted_count;
  RETURN deleted_count;
END;
$$;

COMMENT ON FUNCTION public.cleanup_old_notifications IS 'Remove notificações antigas (>90 dias) já processadas.';

-- View: ceo_notifications_summary
-- Resumo de notificações pendentes por severidade
CREATE OR REPLACE VIEW public.ceo_notifications_summary AS
SELECT
  n.empresa_id,
  n.severidade,
  n.categoria,
  COUNT(*) AS total_notificacoes,
  COUNT(CASE WHEN n.status = 'pendente' THEN 1 END) AS pendentes,
  COUNT(CASE WHEN n.deadline < NOW() THEN 1 END) AS vencidas,
  MAX(n.enviada_em) AS ultima_notificacao
FROM public.ceo_notifications n
WHERE n.status = 'pendente'
GROUP BY n.empresa_id, n.severidade, n.categoria;

COMMENT ON VIEW public.ceo_notifications_summary IS 'Resumo consolidado de notificações pendentes para o CEO.';

-- Grants
GRANT SELECT ON public.ceo_notifications_summary TO authenticated;
GRANT EXECUTE ON FUNCTION public.auto_generate_daily_digest TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_old_notifications TO authenticated;

-- Inserir preferências padrão para CEO (exemplo)
-- As preferências reais serão criadas quando o usuário configurar
INSERT INTO public.ceo_notification_preferences (empresa_id, usuario_id)
SELECT 
  e.id AS empresa_id,
  u.id AS usuario_id
FROM public.empresas e
CROSS JOIN auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.ceo_notification_preferences cnp
  WHERE cnp.empresa_id = e.id AND cnp.usuario_id = u.id
)
LIMIT 0; -- Não inserir agora, apenas estrutura

-- Trigger: update_notification_timestamp
-- Atualiza timestamp de leitura automaticamente
CREATE OR REPLACE FUNCTION update_notification_read_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'lida' AND OLD.status != 'lida' THEN
    NEW.lida_em = NOW();
  END IF;
  
  IF NEW.status = 'resolvida' AND OLD.status != 'resolvida' THEN
    NEW.resolvida_em = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_notification_timestamps
BEFORE UPDATE ON public.ceo_notifications
FOR EACH ROW
EXECUTE FUNCTION update_notification_read_timestamp();

