-- ============================================
-- Migration: 20251119 - Portais OPME Alignment
-- Objetivo: tipar colunas críticas (ENUM) e expor views de monitoramento
-- ============================================

BEGIN;

-- -------------------------------------------------
-- 1. Tipo ENUM utilizado pelos portais
-- -------------------------------------------------
DO $$
BEGIN
  CREATE TYPE public.portal_tipo_integracao_enum AS ENUM ('api_rest','api_graphql','scraping','hibrida');
EXCEPTION WHEN duplicate_object THEN NULL;
END$$;

-- -------------------------------------------------
-- 2. Converter coluna de integração para ENUM
-- -------------------------------------------------
ALTER TABLE public.portais_opme_config
  DROP CONSTRAINT IF EXISTS portais_opme_config_tipo_integracao_check,
  ALTER COLUMN tipo_integracao TYPE public.portal_tipo_integracao_enum
    USING CASE
      WHEN tipo_integracao IS NULL THEN 'api_rest'
      ELSE LOWER(tipo_integracao)::public.portal_tipo_integracao_enum
    END,
  ALTER COLUMN tipo_integracao SET DEFAULT 'api_rest';

-- -------------------------------------------------
-- 3. Views para dashboards e monitoramento
-- -------------------------------------------------
CREATE OR REPLACE VIEW public.view_portais_opme_performance AS
SELECT
  cfg.id AS portal_config_id,
  cfg.portal,
  cfg.nome_exibicao,
  cfg.tipo_integracao,
  cfg.ativo,
  cfg.rate_limit_por_minuto,
  cfg.timeout_segundos,
  cfg.retry_max,
  cfg.total_requisicoes,
  cfg.requisicoes_sucesso,
  cfg.requisicoes_erro,
  cfg.ultima_requisicao,
  COALESCE(stats.total_execucoes_30d, 0) AS total_execucoes_30d,
  COALESCE(stats.execucoes_sucesso_30d, 0) AS execucoes_sucesso_30d,
  COALESCE(stats.execucoes_erro_30d, 0) AS execucoes_erro_30d,
  COALESCE(stats.tempo_execucao_medio_ms, 0) AS tempo_execucao_medio_ms,
  COALESCE(stats.melhor_oferta_medio, 0) AS melhor_oferta_medio
FROM public.portais_opme_config cfg
LEFT JOIN (
  SELECT
    portal,
    COUNT(*) AS total_execucoes_30d,
    COUNT(*) FILTER (WHERE sucesso) AS execucoes_sucesso_30d,
    COUNT(*) FILTER (WHERE NOT sucesso) AS execucoes_erro_30d,
    AVG(tempo_resposta_ms)::numeric(12,2) AS tempo_execucao_medio_ms,
    AVG((melhor_oferta ->> 'preco_unitario')::numeric) AS melhor_oferta_medio
  FROM public.portais_opme_historico
  WHERE data_consulta >= NOW() - INTERVAL '30 days'
  GROUP BY portal
) AS stats
  ON stats.portal = cfg.portal;

ALTER VIEW public.view_portais_opme_performance SET (security_invoker = true);

CREATE OR REPLACE VIEW public.view_portais_opme_cotacoes_recent AS
SELECT
  c.id,
  c.data_cotacao,
  c.produto_id,
  prod.nome AS produto_nome,
  c.quantidade,
  c.status,
  c.total_portais_consultados,
  c.total_ofertas_encontradas,
  c.melhor_preco,
  c.portal_melhor_preco,
  c.economia_estimada,
  c.percentual_economia,
  c.tempo_execucao_ms
FROM public.portais_opme_cotacoes c
LEFT JOIN public.produtos_opme prod ON prod.id = c.produto_id
WHERE c.data_cotacao >= NOW() - INTERVAL '14 days'
ORDER BY c.data_cotacao DESC;

ALTER VIEW public.view_portais_opme_cotacoes_recent SET (security_invoker = true);

COMMIT;

