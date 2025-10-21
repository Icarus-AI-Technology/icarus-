-- ============================================
-- MIGRAÇÃO SUPABASE: PORTAIS OPME
-- Sistema: ICARUS v5.0
-- Módulo: Gestão de Cirurgias
-- Data: Outubro 2025
-- ============================================

-- 1. CONFIGURAÇÃO DE PORTAIS
-- ============================================

CREATE TABLE IF NOT EXISTS portais_opme_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  portal VARCHAR(50) NOT NULL UNIQUE,
  nome_exibicao VARCHAR(100) NOT NULL,
  url_base VARCHAR(255) NOT NULL,
  
  -- Tipo de Integração
  tipo_integracao VARCHAR(50) NOT NULL CHECK (tipo_integracao IN ('api_rest', 'api_graphql', 'scraping', 'hibrida')),
  api_endpoint VARCHAR(255),
  api_key TEXT,
  api_secret TEXT,
  
  -- Scraping Config
  scraping_enabled BOOLEAN DEFAULT FALSE,
  user_agent TEXT,
  proxy_enabled BOOLEAN DEFAULT FALSE,
  
  -- Status e Limites
  ativo BOOLEAN DEFAULT TRUE,
  rate_limit_por_minuto INTEGER DEFAULT 60,
  timeout_segundos INTEGER DEFAULT 30,
  retry_max INTEGER DEFAULT 3,
  
  -- Estatísticas
  total_requisicoes INTEGER DEFAULT 0,
  requisicoes_sucesso INTEGER DEFAULT 0,
  requisicoes_erro INTEGER DEFAULT 0,
  ultima_requisicao TIMESTAMP,
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES usuarios(id)
);

COMMENT ON TABLE portais_opme_config IS 'Configuração dos portais OPME integrados (OPMENEXO, Inpart, EMS, VSSupply)';

-- 2. PALAVRAS-CHAVE PARA BUSCA
-- ============================================

CREATE TABLE IF NOT EXISTS portais_opme_palavras_chave (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Produto
  produto_id UUID REFERENCES produtos_opme(id) ON DELETE CASCADE,
  palavra_chave VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) DEFAULT 'principal' CHECK (tipo IN ('principal', 'sinonimo', 'variacao', 'codigo')),
  prioridade INTEGER DEFAULT 1,
  portal VARCHAR(50),
  
  -- Estatísticas de Efetividade
  total_buscas INTEGER DEFAULT 0,
  total_resultados INTEGER DEFAULT 0,
  taxa_sucesso DECIMAL(5, 2) DEFAULT 0.00,
  
  -- IA
  sugerida_por_ia BOOLEAN DEFAULT FALSE,
  confianca_ia DECIMAL(5, 2),
  
  -- Status
  ativo BOOLEAN DEFAULT TRUE,
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES usuarios(id),
  
  UNIQUE(produto_id, palavra_chave, portal)
);

COMMENT ON TABLE portais_opme_palavras_chave IS 'Keywords otimizadas para busca de produtos nos portais OPME';

-- 3. COTAÇÕES REALIZADAS
-- ============================================

CREATE TABLE IF NOT EXISTS portais_opme_cotacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Referências
  produto_id UUID REFERENCES produtos_opme(id),
  cirurgia_id UUID REFERENCES cirurgias(id),
  
  -- Parâmetros da Cotação
  palavra_chave VARCHAR(255) NOT NULL,
  quantidade INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'processando' CHECK (status IN ('processando', 'concluida', 'erro', 'cancelada')),
  
  -- Resultados
  total_portais_consultados INTEGER DEFAULT 0,
  total_ofertas_encontradas INTEGER DEFAULT 0,
  melhor_preco DECIMAL(15, 2),
  portal_melhor_preco VARCHAR(50),
  economia_estimada DECIMAL(15, 2),
  percentual_economia DECIMAL(5, 2),
  
  -- Performance
  tempo_execucao_ms INTEGER,
  data_cotacao TIMESTAMP DEFAULT NOW(),
  realizado_por UUID REFERENCES usuarios(id),
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE portais_opme_cotacoes IS 'Histórico de cotações realizadas nos portais OPME';

-- 4. HISTÓRICO DETALHADO POR PORTAL
-- ============================================

CREATE TABLE IF NOT EXISTS portais_opme_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Referência
  cotacao_id UUID REFERENCES portais_opme_cotacoes(id) ON DELETE CASCADE,
  portal VARCHAR(50) NOT NULL,
  
  -- Resultado
  sucesso BOOLEAN DEFAULT FALSE,
  erro_mensagem TEXT,
  ofertas JSONB,
  total_ofertas INTEGER DEFAULT 0,
  
  -- Detalhes das Ofertas (Top 3)
  melhor_oferta JSONB,
  segunda_melhor JSONB,
  terceira_melhor JSONB,
  
  -- Performance
  tempo_resposta_ms INTEGER,
  data_consulta TIMESTAMP DEFAULT NOW(),
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE portais_opme_historico IS 'Histórico detalhado de cada consulta aos portais OPME';

-- 5. CACHE DE RESULTADOS
-- ============================================

CREATE TABLE IF NOT EXISTS portais_opme_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Chave do Cache
  portal VARCHAR(50) NOT NULL,
  palavra_chave VARCHAR(255) NOT NULL,
  quantidade INTEGER NOT NULL,
  
  -- Dados
  resultado JSONB NOT NULL,
  expira_em TIMESTAMP NOT NULL,
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(portal, palavra_chave, quantidade)
);

COMMENT ON TABLE portais_opme_cache IS 'Cache de resultados de cotações (TTL: 1 hora)';

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

-- Portais Config
CREATE INDEX IF NOT EXISTS idx_portais_config_ativo ON portais_opme_config(ativo);
CREATE INDEX IF NOT EXISTS idx_portais_config_portal ON portais_opme_config(portal);

-- Palavras-Chave
CREATE INDEX IF NOT EXISTS idx_palavras_chave_produto ON portais_opme_palavras_chave(produto_id);
CREATE INDEX IF NOT EXISTS idx_palavras_chave_ativo ON portais_opme_palavras_chave(ativo);
CREATE INDEX IF NOT EXISTS idx_palavras_chave_portal ON portais_opme_palavras_chave(portal);
CREATE INDEX IF NOT EXISTS idx_palavras_chave_taxa_sucesso ON portais_opme_palavras_chave(taxa_sucesso DESC);

-- Cotações
CREATE INDEX IF NOT EXISTS idx_cotacoes_data ON portais_opme_cotacoes(data_cotacao DESC);
CREATE INDEX IF NOT EXISTS idx_cotacoes_produto ON portais_opme_cotacoes(produto_id);
CREATE INDEX IF NOT EXISTS idx_cotacoes_cirurgia ON portais_opme_cotacoes(cirurgia_id);
CREATE INDEX IF NOT EXISTS idx_cotacoes_status ON portais_opme_cotacoes(status);

-- Histórico
CREATE INDEX IF NOT EXISTS idx_historico_cotacao ON portais_opme_historico(cotacao_id);
CREATE INDEX IF NOT EXISTS idx_historico_portal ON portais_opme_historico(portal);
CREATE INDEX IF NOT EXISTS idx_historico_sucesso ON portais_opme_historico(sucesso);

-- Cache
CREATE INDEX IF NOT EXISTS idx_cache_expiracao ON portais_opme_cache(expira_em);
CREATE INDEX IF NOT EXISTS idx_cache_portal_palavra ON portais_opme_cache(portal, palavra_chave);

-- ============================================
-- FUNÇÕES SQL
-- ============================================

-- Atualizar estatísticas de palavra-chave
CREATE OR REPLACE FUNCTION atualizar_estatisticas_palavra_chave(
  p_palavra_chave_id UUID,
  p_total_resultados INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE portais_opme_palavras_chave
  SET 
    total_buscas = total_buscas + 1,
    total_resultados = total_resultados + p_total_resultados,
    taxa_sucesso = CASE 
      WHEN (total_buscas + 1) = 0 THEN 0
      ELSE ((total_resultados + p_total_resultados)::DECIMAL / (total_buscas + 1)::DECIMAL * 100)
    END,
    updated_at = NOW()
  WHERE id = p_palavra_chave_id;
END;
$$ LANGUAGE plpgsql;

-- Limpar cache expirado
CREATE OR REPLACE FUNCTION limpar_cache_expirado()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM portais_opme_cache
  WHERE expira_em < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Atualizar estatísticas de portal
CREATE OR REPLACE FUNCTION atualizar_estatisticas_portal(
  p_portal VARCHAR,
  p_sucesso BOOLEAN
)
RETURNS VOID AS $$
BEGIN
  UPDATE portais_opme_config
  SET 
    total_requisicoes = total_requisicoes + 1,
    requisicoes_sucesso = CASE WHEN p_sucesso THEN requisicoes_sucesso + 1 ELSE requisicoes_sucesso END,
    requisicoes_erro = CASE WHEN NOT p_sucesso THEN requisicoes_erro + 1 ELSE requisicoes_erro END,
    ultima_requisicao = NOW(),
    updated_at = NOW()
  WHERE portal = p_portal;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- RLS (ROW LEVEL SECURITY)
-- ============================================

ALTER TABLE portais_opme_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE portais_opme_palavras_chave ENABLE ROW LEVEL SECURITY;
ALTER TABLE portais_opme_cotacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE portais_opme_historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE portais_opme_cache ENABLE ROW LEVEL SECURITY;

-- Políticas para portais_opme_config
CREATE POLICY "Usuários podem visualizar configuração de portais"
  ON portais_opme_config FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Apenas admins podem modificar configuração"
  ON portais_opme_config FOR ALL
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Políticas para palavras-chave
CREATE POLICY "Usuários podem visualizar palavras-chave"
  ON portais_opme_palavras_chave FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários podem gerenciar palavras-chave"
  ON portais_opme_palavras_chave FOR ALL
  USING (auth.role() = 'authenticated');

-- Políticas para cotações
CREATE POLICY "Usuários podem visualizar cotações"
  ON portais_opme_cotacoes FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários podem criar cotações"
  ON portais_opme_cotacoes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Políticas para histórico
CREATE POLICY "Usuários podem visualizar histórico"
  ON portais_opme_historico FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Sistema pode inserir histórico"
  ON portais_opme_historico FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Políticas para cache
CREATE POLICY "Sistema pode gerenciar cache"
  ON portais_opme_cache FOR ALL
  USING (auth.role() = 'authenticated');

-- ============================================
-- DADOS INICIAIS (SEED)
-- ============================================

-- Inserir configuração dos 4 portais
INSERT INTO portais_opme_config (portal, nome_exibicao, url_base, tipo_integracao, ativo) VALUES
  ('opmenexo', 'OPMENEXO', 'https://api.opmenexo.com.br', 'api_rest', TRUE),
  ('inpart', 'Inpart Saúde', 'https://www.inpartsaude.com.br', 'hibrida', TRUE),
  ('ems_ventura', 'EMS Ventura Saúde', 'https://api.emsventurasaude.com.br', 'hibrida', TRUE),
  ('vssupply', 'VSSupply', 'https://api.vssupply.com.br', 'api_graphql', TRUE)
ON CONFLICT (portal) DO NOTHING;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_portais_config_updated_at
  BEFORE UPDATE ON portais_opme_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_palavras_chave_updated_at
  BEFORE UPDATE ON portais_opme_palavras_chave
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMENTÁRIOS FINAIS
-- ============================================

COMMENT ON FUNCTION atualizar_estatisticas_palavra_chave IS 'Atualiza estatísticas de efetividade de uma palavra-chave';
COMMENT ON FUNCTION limpar_cache_expirado IS 'Remove entradas de cache expiradas (executar via cron)';
COMMENT ON FUNCTION atualizar_estatisticas_portal IS 'Atualiza estatísticas de performance de um portal';

-- ============================================
-- FIM DA MIGRAÇÃO
-- ============================================

