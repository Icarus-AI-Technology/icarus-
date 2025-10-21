-- ========================================
-- CACHE DE VALIDAÇÕES
-- Sistema de cache para APIs de validação
-- ========================================

CREATE TABLE IF NOT EXISTS validacoes_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Tipo de validação
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('cep', 'cnpj', 'cpf', 'crm', 'veiculo', 'anvisa')),
  
  -- Chave de busca (valor consultado)
  chave VARCHAR(50) NOT NULL,
  
  -- Dados retornados (JSON)
  dados JSONB NOT NULL,
  
  -- Metadados
  fonte VARCHAR(50) NOT NULL, -- 'viacep', 'receita_federal', 'cfm', 'infosimples', etc.
  sucesso BOOLEAN NOT NULL DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  accessed_at TIMESTAMP DEFAULT NOW(),
  access_count INTEGER DEFAULT 1,
  
  -- Constraints
  CONSTRAINT validacoes_cache_tipo_chave_unique UNIQUE (tipo, chave)
);

-- ========================================
-- ÍNDICES PARA PERFORMANCE
-- ========================================

-- Índice principal para lookup rápido
CREATE INDEX IF NOT EXISTS idx_validacoes_cache_lookup 
  ON validacoes_cache(tipo, chave, expires_at) 
  WHERE expires_at > NOW();

-- Índice para limpeza de expirados
CREATE INDEX IF NOT EXISTS idx_validacoes_cache_expires 
  ON validacoes_cache(expires_at);

-- Índice para estatísticas
CREATE INDEX IF NOT EXISTS idx_validacoes_cache_stats 
  ON validacoes_cache(tipo, fonte, created_at);

-- ========================================
-- FUNÇÃO: Obter do Cache
-- ========================================

CREATE OR REPLACE FUNCTION get_validacao_cache(
  p_tipo VARCHAR,
  p_chave VARCHAR
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_dados JSONB;
BEGIN
  -- Busca no cache (se não expirado)
  SELECT dados INTO v_dados
  FROM validacoes_cache
  WHERE tipo = p_tipo
    AND chave = p_chave
    AND expires_at > NOW();
  
  -- Atualiza estatísticas de acesso
  IF FOUND THEN
    UPDATE validacoes_cache
    SET accessed_at = NOW(),
        access_count = access_count + 1
    WHERE tipo = p_tipo AND chave = p_chave;
  END IF;
  
  RETURN v_dados;
END;
$$;

-- ========================================
-- FUNÇÃO: Salvar no Cache
-- ========================================

CREATE OR REPLACE FUNCTION set_validacao_cache(
  p_tipo VARCHAR,
  p_chave VARCHAR,
  p_dados JSONB,
  p_fonte VARCHAR,
  p_ttl_seconds INTEGER DEFAULT 86400, -- 24h padrão
  p_sucesso BOOLEAN DEFAULT true
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_id UUID;
BEGIN
  -- Insere ou atualiza (UPSERT)
  INSERT INTO validacoes_cache (
    tipo,
    chave,
    dados,
    fonte,
    sucesso,
    expires_at
  ) VALUES (
    p_tipo,
    p_chave,
    p_dados,
    p_fonte,
    p_sucesso,
    NOW() + (p_ttl_seconds || ' seconds')::INTERVAL
  )
  ON CONFLICT (tipo, chave) 
  DO UPDATE SET
    dados = EXCLUDED.dados,
    fonte = EXCLUDED.fonte,
    sucesso = EXCLUDED.sucesso,
    expires_at = EXCLUDED.expires_at,
    created_at = NOW(),
    accessed_at = NOW(),
    access_count = 1
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$;

-- ========================================
-- FUNÇÃO: Limpar Cache Expirado
-- ========================================

CREATE OR REPLACE FUNCTION cleanup_validacoes_cache()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  -- Remove registros expirados
  DELETE FROM validacoes_cache
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  
  RETURN v_deleted;
END;
$$;

-- ========================================
-- FUNÇÃO: Estatísticas do Cache
-- ========================================

CREATE OR REPLACE FUNCTION get_validacoes_cache_stats(
  p_tipo VARCHAR DEFAULT NULL,
  p_periodo_dias INTEGER DEFAULT 7
)
RETURNS TABLE (
  tipo VARCHAR,
  fonte VARCHAR,
  total_consultas BIGINT,
  hit_rate NUMERIC,
  consultas_por_dia NUMERIC,
  mais_consultado TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    vc.tipo,
    vc.fonte,
    COUNT(*)::BIGINT AS total_consultas,
    ROUND(
      (SUM(access_count) / NULLIF(COUNT(*), 0))::NUMERIC, 
      2
    ) AS hit_rate,
    ROUND(
      (COUNT(*) / p_periodo_dias::NUMERIC), 
      2
    ) AS consultas_por_dia,
    (
      SELECT chave 
      FROM validacoes_cache vc2 
      WHERE vc2.tipo = vc.tipo 
      ORDER BY access_count DESC 
      LIMIT 1
    ) AS mais_consultado
  FROM validacoes_cache vc
  WHERE created_at > NOW() - (p_periodo_dias || ' days')::INTERVAL
    AND (p_tipo IS NULL OR vc.tipo = p_tipo)
  GROUP BY vc.tipo, vc.fonte
  ORDER BY total_consultas DESC;
END;
$$;

-- ========================================
-- JOB: Limpeza Automática (Cron)
-- ========================================

-- Nota: Requer extensão pg_cron
-- Para instalar: CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Limpar cache expirado a cada 6 horas
-- SELECT cron.schedule(
--   'cleanup-validacoes-cache',
--   '0 */6 * * *',
--   $$SELECT cleanup_validacoes_cache();$$
-- );

-- ========================================
-- CONFIGURAÇÕES DE TTL (Time To Live)
-- ========================================

COMMENT ON TABLE validacoes_cache IS 
'Cache de validações de APIs externas com TTL configurável por tipo';

COMMENT ON COLUMN validacoes_cache.tipo IS 
'Tipo de validação: cep (30 dias), cnpj (7 dias), cpf (30 dias), crm (30 dias), veiculo (7 dias), anvisa (30 dias)';

COMMENT ON COLUMN validacoes_cache.ttl IS 
'TTL padrão por tipo:
- CEP: 2.592.000s (30 dias) - CEPs não mudam
- CNPJ: 604.800s (7 dias) - Dados podem ser atualizados
- CPF: 2.592.000s (30 dias) - Dados estáveis
- CRM: 2.592.000s (30 dias) - Validação de registro
- Veículo: 604.800s (7 dias) - Pode ter multas/alterações
- ANVISA: 2.592.000s (30 dias) - Registros estáveis';

-- ========================================
-- PERMISSÕES RLS (Row Level Security)
-- ========================================

ALTER TABLE validacoes_cache ENABLE ROW LEVEL SECURITY;

-- Política: Todos usuários autenticados podem ler
CREATE POLICY "Usuários podem ler cache" 
  ON validacoes_cache
  FOR SELECT
  TO authenticated
  USING (true);

-- Política: Apenas funções podem escrever
CREATE POLICY "Apenas funções podem escrever cache" 
  ON validacoes_cache
  FOR INSERT
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- ========================================
-- GRANTS
-- ========================================

GRANT SELECT ON validacoes_cache TO authenticated;
GRANT EXECUTE ON FUNCTION get_validacao_cache TO authenticated;
GRANT EXECUTE ON FUNCTION set_validacao_cache TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_validacoes_cache TO authenticated;
GRANT EXECUTE ON FUNCTION get_validacoes_cache_stats TO authenticated;

-- ========================================
-- DADOS DE EXEMPLO (OPCIONAL - REMOVER EM PROD)
-- ========================================

-- Exemplo de cache CEP
SELECT set_validacao_cache(
  'cep',
  '01310-100',
  '{"cep": "01310-100", "logradouro": "Avenida Paulista", "bairro": "Bela Vista", "cidade": "São Paulo", "uf": "SP"}'::JSONB,
  'viacep',
  2592000, -- 30 dias
  true
);

-- Exemplo de cache CNPJ
SELECT set_validacao_cache(
  'cnpj',
  '00.000.000/0001-91',
  '{"cnpj": "00.000.000/0001-91", "razaoSocial": "Empresa Exemplo Ltda", "situacao": "ativa"}'::JSONB,
  'receita_federal',
  604800, -- 7 dias
  true
);

-- ========================================
-- FIM DO SCHEMA
-- ========================================

