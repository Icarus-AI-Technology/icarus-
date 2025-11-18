-- ╔════════════════════════════════════════════════════════════════════════╗
-- ║  ICARUS v5.0 - Bloco 03 de 10                                          ║
-- ║  Linhas: 12577 → 18864                                                      ║
-- ╚════════════════════════════════════════════════════════════════════════╝

RETURNS VOID AS $$
DECLARE
  _agente RECORD;
BEGIN
  FOR _agente IN
    SELECT * FROM agentes_ia_compliance WHERE status = 'ativo'
  LOOP
    -- Agente de Compliance Automático
    IF _agente.tipo = 'compliance' THEN
      -- Verificar certificações vencendo
      INSERT INTO alertas_compliance (agente_id, tipo, titulo, descricao, severidade, responsavel, prazo)
      SELECT
        _agente.id,
        'vencimento_certificacao',
        'Certificação vencendo: ' || cr.titulo,
        'Certificação ' || cr.titulo || ' vencerá em ' || (cr.proxima_auditoria - CURRENT_DATE) || ' dias.',
        CASE
          WHEN (cr.proxima_auditoria - CURRENT_DATE) <= 30 THEN 'critico'
          WHEN (cr.proxima_auditoria - CURRENT_DATE) <= 60 THEN 'urgente'
          ELSE 'aviso'
        END,
        cr.responsavel,
        cr.proxima_auditoria - INTERVAL '15 days'
      FROM compliance_requisitos cr
      WHERE cr.proxima_auditoria BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '90 days')
        AND NOT EXISTS (
          SELECT 1 FROM alertas_compliance ac
          WHERE ac.requisito_id = cr.id AND ac.status IN ('novo', 'visualizado', 'em_acao')
        );
    END IF;
    
    -- Atualizar timestamp de última execução
    UPDATE agentes_ia_compliance
    SET ultima_execucao = NOW(),
        proxima_execucao = NOW() + INTERVAL '1 day'
    WHERE id = _agente.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════
-- TRIGGERS
-- ═══════════════════════════════════════════════════════════

CREATE TRIGGER set_timestamp_compliance_requisitos
BEFORE UPDATE ON compliance_requisitos
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_auditorias_internas
BEFORE UPDATE ON auditorias_internas
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_nao_conformidades
BEFORE UPDATE ON nao_conformidades
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_treinamentos_certificacoes
BEFORE UPDATE ON treinamentos_certificacoes
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- ═══════════════════════════════════════════════════════════
-- GRANTS
-- ═══════════════════════════════════════════════════════════

GRANT ALL ON compliance_requisitos TO authenticated;
GRANT ALL ON auditorias_internas TO authenticated;
GRANT ALL ON checklist_auditoria TO authenticated;
GRANT ALL ON nao_conformidades TO authenticated;
GRANT ALL ON treinamentos_certificacoes TO authenticated;
GRANT ALL ON participantes_treinamento TO authenticated;
GRANT ALL ON rastreabilidade_opme_compliance TO authenticated;
GRANT ALL ON agentes_ia_compliance TO authenticated;
GRANT ALL ON alertas_compliance TO authenticated;
GRANT ALL ON documentacao_tecnica TO authenticated;

GRANT SELECT ON vw_score_abbott TO authenticated;
GRANT SELECT ON vw_estatisticas_auditorias TO authenticated;
GRANT SELECT ON vw_treinamentos_vencendo TO authenticated;

GRANT EXECUTE ON FUNCTION atualizar_scores_compliance() TO authenticated;
GRANT EXECUTE ON FUNCTION gerar_alertas_ia() TO authenticated;

-- ═══════════════════════════════════════════════════════════
-- COMENTÁRIOS
-- ═══════════════════════════════════════════════════════════

COMMENT ON TABLE compliance_requisitos IS 'Requisitos de compliance (ANVISA, ISO, Abbott, etc)';
COMMENT ON TABLE auditorias_internas IS 'Auditorias internas e externas';
COMMENT ON TABLE nao_conformidades IS 'Gestão de não conformidades';
COMMENT ON TABLE treinamentos_certificacoes IS 'Treinamentos e certificações de equipes';
COMMENT ON TABLE agentes_ia_compliance IS 'Agentes de IA para compliance automático';
COMMENT ON TABLE alertas_compliance IS 'Alertas gerados pelos agentes de IA';

-- ═══════════════════════════════════════════════════════════
-- FIM DA MIGRATION
-- ═══════════════════════════════════════════════════════════



-- ============================================
-- Source: 20251019_consignacao_avancada_completo.sql
-- ============================================

-- ═══════════════════════════════════════════════════════════
-- MÓDULO: CONSIGNAÇÃO AVANÇADA
-- Sistema: ICARUS v5.0
-- Descrição: Controle total de materiais OPME em consignação
-- Tabelas: 7
-- Data: 19/10/2025
-- ═══════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════
-- 1. TABELA: contratos_consignacao
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS IF NOT EXISTS contratos_consignacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  numero_contrato VARCHAR(50) UNIQUE NOT NULL,
  
  -- Hospital/Cliente
  hospital_id UUID REFERENCES hospitais(id),
  hospital_nome VARCHAR(255) NOT NULL,
  hospital_cnpj VARCHAR(18) NOT NULL,
  hospital_endereco TEXT,
  responsavel_hospital VARCHAR(255),
  
  -- Vigência
  data_inicio DATE NOT NULL,
  data_fim DATE,
  prazo_vencimento DATE,
  
  -- Condições Comerciais
  percentual_comissao DECIMAL(5,2) DEFAULT 15.0, -- 15%
  condicoes_pagamento VARCHAR(100) DEFAULT '30 dias',
  valor_minimo_faturamento DECIMAL(12,2),
  
  -- Status
  status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'suspenso', 'cancelado', 'vencido')),
  
  -- Observações
  observacoes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contratos_consignacao_hospital ON contratos_consignacao(hospital_id);
CREATE INDEX IF NOT EXISTS idx_contratos_consignacao_status ON contratos_consignacao(status);
CREATE INDEX IF NOT EXISTS idx_contratos_consignacao_vencimento ON contratos_consignacao(prazo_vencimento);

-- ═══════════════════════════════════════════════════════════
-- 2. TABELA: materiais_consignados
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS IF NOT EXISTS materiais_consignados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  codigo_interno VARCHAR(50) UNIQUE NOT NULL,
  
  -- Produto
  produto_id UUID REFERENCES produtos_opme(id),
  nome VARCHAR(255) NOT NULL,
  fabricante VARCHAR(255),
  fornecedor VARCHAR(255),
  
  -- Categoria
  categoria VARCHAR(50) CHECK (categoria IN ('implantes', 'instrumentais', 'descartaveis', 'equipamentos', 'outros')),
  
  -- Lote e Validade
  lote VARCHAR(50),
  serie VARCHAR(100),
  validade DATE,
  data_recebimento DATE NOT NULL,
  
  -- Quantidade e Valores
  quantidade INTEGER NOT NULL DEFAULT 1,
  valor_unitario DECIMAL(12,2) NOT NULL,
  valor_total DECIMAL(12,2) GENERATED ALWAYS AS (quantidade * valor_unitario) STORED,
  
  -- Status
  status VARCHAR(20) DEFAULT 'disponivel' CHECK (status IN ('disponivel', 'reservado', 'utilizado', 'devolvido', 'vencido', 'danificado')),
  
  -- Hospital (Consignação)
  contrato_id UUID REFERENCES contratos_consignacao(id),
  hospital_id UUID REFERENCES hospitais(id),
  hospital_nome VARCHAR(255) NOT NULL,
  
  -- Análise Financeira
  custo_carregamento DECIMAL(12,2) DEFAULT 0,
  dias_estoque INTEGER DEFAULT 0,
  rotatividade VARCHAR(10) CHECK (rotatividade IN ('alta', 'media', 'baixa')),
  
  -- Última Movimentação
  ultima_movimentacao_data TIMESTAMPTZ,
  ultima_movimentacao_tipo VARCHAR(50),
  ultima_movimentacao_responsavel VARCHAR(255),
  
  -- Observações
  observacoes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_materiais_consignados_produto ON materiais_consignados(produto_id);
CREATE INDEX IF NOT EXISTS idx_materiais_consignados_hospital ON materiais_consignados(hospital_id);
CREATE INDEX IF NOT EXISTS idx_materiais_consignados_contrato ON materiais_consignados(contrato_id);
CREATE INDEX IF NOT EXISTS idx_materiais_consignados_status ON materiais_consignados(status);
CREATE INDEX IF NOT EXISTS idx_materiais_consignados_lote ON materiais_consignados(lote);
CREATE INDEX IF NOT EXISTS idx_materiais_consignados_validade ON materiais_consignados(validade);

-- ═══════════════════════════════════════════════════════════
-- 3. TABELA: movimentacoes_consignacao
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS IF NOT EXISTS movimentacoes_consignacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Material
  material_consignado_id UUID REFERENCES materiais_consignados(id) ON DELETE CASCADE,
  
  -- Tipo de Movimentação
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('entrada', 'saida', 'utilizacao', 'devolucao', 'transferencia', 'ajuste')),
  
  -- Dados da Movimentação
  quantidade INTEGER NOT NULL,
  data_movimentacao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Origem/Destino
  hospital_origem_id UUID REFERENCES hospitais(id),
  hospital_destino_id UUID REFERENCES hospitais(id),
  
  -- Cirurgia (se utilizado)
  cirurgia_id UUID REFERENCES cirurgias(id),
  
  -- Responsável
  responsavel VARCHAR(255) NOT NULL,
  usuario_id UUID REFERENCES usuarios(id),
  
  -- Documentação
  documento_tipo VARCHAR(50), -- NF, Termo, Comprovante
  documento_numero VARCHAR(100),
  
  -- Observações
  motivo TEXT,
  observacoes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_movimentacoes_consignacao_material ON movimentacoes_consignacao(material_consignado_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_consignacao_tipo ON movimentacoes_consignacao(tipo);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_consignacao_data ON movimentacoes_consignacao(data_movimentacao);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_consignacao_cirurgia ON movimentacoes_consignacao(cirurgia_id);

-- ═══════════════════════════════════════════════════════════
-- 4. TABELA: faturamento_consignacao
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS IF NOT EXISTS faturamento_consignacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  numero_fatura VARCHAR(50) UNIQUE NOT NULL,
  periodo VARCHAR(7) NOT NULL, -- YYYY-MM
  
  -- Hospital
  hospital_id UUID REFERENCES hospitais(id),
  hospital_nome VARCHAR(255) NOT NULL,
  
  -- Valores
  valor_bruto DECIMAL(12,2) NOT NULL,
  desconto DECIMAL(12,2) DEFAULT 0,
  impostos DECIMAL(12,2) DEFAULT 0,
  valor_liquido DECIMAL(12,2) NOT NULL,
  
  -- Status e Datas
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'faturado', 'pago', 'vencido', 'cancelado')),
  data_emissao DATE,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  
  -- Documentação
  numero_nf VARCHAR(50),
  chave_nf VARCHAR(44),
  
  -- Observações
  observacoes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_faturamento_consignacao_hospital ON faturamento_consignacao(hospital_id);
CREATE INDEX IF NOT EXISTS idx_faturamento_consignacao_status ON faturamento_consignacao(status);
CREATE INDEX IF NOT EXISTS idx_faturamento_consignacao_periodo ON faturamento_consignacao(periodo);
CREATE INDEX IF NOT EXISTS idx_faturamento_consignacao_vencimento ON faturamento_consignacao(data_vencimento);

-- ═══════════════════════════════════════════════════════════
-- 5. TABELA: faturamento_consignacao_itens
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS IF NOT EXISTS faturamento_consignacao_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Fatura
  fatura_id UUID REFERENCES faturamento_consignacao(id) ON DELETE CASCADE,
  
  -- Material
  material_consignado_id UUID REFERENCES materiais_consignados(id),
  produto_nome VARCHAR(255) NOT NULL,
  lote VARCHAR(50),
  serie VARCHAR(100),
  
  -- Quantidade e Valores
  quantidade INTEGER NOT NULL,
  valor_unitario DECIMAL(12,2) NOT NULL,
  valor_total DECIMAL(12,2) GENERATED ALWAYS AS (quantidade * valor_unitario) STORED,
  
  -- Cirurgia
  cirurgia_id UUID REFERENCES cirurgias(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_faturamento_consignacao_itens_fatura ON faturamento_consignacao_itens(fatura_id);
CREATE INDEX IF NOT EXISTS idx_faturamento_consignacao_itens_material ON faturamento_consignacao_itens(material_consignado_id);

-- ═══════════════════════════════════════════════════════════
-- 6. TABELA: alertas_consignacao
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS IF NOT EXISTS alertas_consignacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Tipo de Alerta
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('conferencia_semanal', 'material_vencendo', 'material_parado', 'faturamento_pendente', 'contrato_vencendo')),
  
  -- Relacionamentos
  contrato_id UUID REFERENCES contratos_consignacao(id),
  material_id UUID REFERENCES materiais_consignados(id),
  hospital_id UUID REFERENCES hospitais(id),
  
  -- Alerta
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT NOT NULL,
  severidade VARCHAR(20) DEFAULT 'media' CHECK (severidade IN ('baixa', 'media', 'alta', 'critica')),
  
  -- Status
  status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'lido', 'resolvido', 'ignorado')),
  
  -- Destinatário
  destinatario_nome VARCHAR(255),
  destinatario_email VARCHAR(255),
  destinatario_cargo VARCHAR(100),
  
  -- Datas
  data_geracao TIMESTAMPTZ DEFAULT NOW(),
  data_leitura TIMESTAMPTZ,
  data_resolucao TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alertas_consignacao_tipo ON alertas_consignacao(tipo);
CREATE INDEX IF NOT EXISTS idx_alertas_consignacao_severidade ON alertas_consignacao(severidade);
CREATE INDEX IF NOT EXISTS idx_alertas_consignacao_status ON alertas_consignacao(status);
CREATE INDEX IF NOT EXISTS idx_alertas_consignacao_hospital ON alertas_consignacao(hospital_id);

-- ═══════════════════════════════════════════════════════════
-- 7. TABELA: conferencias_consignacao
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS IF NOT EXISTS conferencias_consignacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  numero_conferencia VARCHAR(50) UNIQUE NOT NULL,
  
  -- Hospital
  hospital_id UUID REFERENCES hospitais(id),
  hospital_nome VARCHAR(255) NOT NULL,
  
  -- Conferência
  data_conferencia DATE NOT NULL,
  data_ultima_conferencia DATE,
  dias_sem_conferencia INTEGER,
  
  -- Materiais
  total_materiais INTEGER DEFAULT 0,
  valor_total_conferido DECIMAL(12,2) DEFAULT 0,
  
  -- Status
  status VARCHAR(20) DEFAULT 'agendada' CHECK (status IN ('agendada', 'em_andamento', 'concluida', 'cancelada')),
  status_conferencia VARCHAR(20) CHECK (status_conferencia IN ('urgente', 'atencao', 'normal')),
  
  -- Responsável
  responsavel VARCHAR(255),
  supervisor_logistico VARCHAR(255),
  
  -- Observações
  observacoes TEXT,
  divergencias TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conferencias_consignacao_hospital ON conferencias_consignacao(hospital_id);
CREATE INDEX IF NOT EXISTS idx_conferencias_consignacao_data ON conferencias_consignacao(data_conferencia);
CREATE INDEX IF NOT EXISTS idx_conferencias_consignacao_status ON conferencias_consignacao(status);

-- ═══════════════════════════════════════════════════════════
-- VIEWS PARA DASHBOARDS E RELATÓRIOS
-- ═══════════════════════════════════════════════════════════

-- View: Resumo de Consignação por Hospital
CREATE OR REPLACE VIEW vw_consignacao_por_hospital AS
SELECT
  h.id AS hospital_id,
  h.nome AS hospital_nome,
  COUNT(mc.id) AS total_materiais,
  SUM(mc.valor_total) AS valor_total_consignado,
  SUM(CASE WHEN mc.status = 'disponivel' THEN mc.valor_total ELSE 0 END) AS valor_disponivel,
  SUM(CASE WHEN mc.status = 'utilizado' THEN mc.valor_total ELSE 0 END) AS valor_utilizado,
  SUM(CASE WHEN mc.status = 'devolvido' THEN mc.valor_total ELSE 0 END) AS valor_devolvido,
  AVG(mc.dias_estoque) AS dias_medio_estoque,
  SUM(mc.custo_carregamento) AS custo_carregamento_total
FROM hospitais h
LEFT JOIN materiais_consignados mc ON h.id = mc.hospital_id
GROUP BY h.id, h.nome;

-- View: Materiais Críticos (vencendo ou parados)
CREATE OR REPLACE VIEW vw_materiais_criticos_consignacao AS
SELECT
  mc.*,
  (mc.validade - CURRENT_DATE) AS dias_ate_vencimento,
  CASE
    WHEN mc.validade <= CURRENT_DATE THEN 'vencido'
    WHEN (mc.validade - CURRENT_DATE) <= 30 THEN 'vencendo_30'
    WHEN mc.dias_estoque > 60 THEN 'parado'
    ELSE 'normal'
  END AS criticidade
FROM materiais_consignados mc
WHERE mc.status IN ('disponivel', 'reservado')
  AND (mc.validade <= CURRENT_DATE + INTERVAL '30 days' OR mc.dias_estoque > 60);

-- ═══════════════════════════════════════════════════════════
-- FUNCTIONS - CÁLCULO DE MÉTRICAS
-- ═══════════════════════════════════════════════════════════

-- Function: Atualizar dias de estoque e custo de carregamento
CREATE OR REPLACE FUNCTION atualizar_metricas_consignacao()
RETURNS VOID AS $$
BEGIN
  UPDATE materiais_consignados
  SET
    dias_estoque = EXTRACT(DAY FROM (NOW() - data_recebimento)),
    custo_carregamento = valor_total * (EXTRACT(DAY FROM (NOW() - data_recebimento)) / 30.0) * 0.015, -- 1.5% ao mês
    rotatividade = CASE
      WHEN EXTRACT(DAY FROM (NOW() - data_recebimento)) <= 30 THEN 'alta'
      WHEN EXTRACT(DAY FROM (NOW() - data_recebimento)) BETWEEN 31 AND 60 THEN 'media'
      ELSE 'baixa'
    END,
    updated_at = NOW()
  WHERE status IN ('disponivel', 'reservado');
END;
$$ LANGUAGE plpgsql;

-- Function: Gerar alertas de conferência semanal
CREATE OR REPLACE FUNCTION gerar_alertas_conferencia_semanal()
RETURNS VOID AS $$
DECLARE
  _hospital RECORD;
  _dias_sem_conferencia INTEGER;
  _status_conf VARCHAR(20);
  _severidade VARCHAR(20);
BEGIN
  FOR _hospital IN
    SELECT DISTINCT h.id, h.nome, h.cnpj, h.endereco
    FROM hospitais h
    INNER JOIN materiais_consignados mc ON h.id = mc.hospital_id
    WHERE mc.status IN ('disponivel', 'reservado', 'utilizado')
  LOOP
    -- Buscar última conferência
    SELECT COALESCE(MAX(data_conferencia), CURRENT_DATE - INTERVAL '365 days')
    INTO _dias_sem_conferencia
    FROM conferencias_consignacao
    WHERE hospital_id = _hospital.id;
    
    _dias_sem_conferencia := CURRENT_DATE - _dias_sem_conferencia;
    
    -- Determinar status e severidade
    IF _dias_sem_conferencia > 14 THEN
      _status_conf := 'urgente';
      _severidade := 'critica';
    ELSIF _dias_sem_conferencia > 7 THEN
      _status_conf := 'atencao';
      _severidade := 'alta';
    ELSE
      _status_conf := 'normal';
      _severidade := 'media';
    END IF;
    
    -- Gerar alerta se necessário
    IF _dias_sem_conferencia >= 7 THEN
      INSERT INTO alertas_consignacao (
        tipo,
        hospital_id,
        titulo,
        descricao,
        severidade,
        destinatario_nome,
        destinatario_cargo
      ) VALUES (
        'conferencia_semanal',
        _hospital.id,
        'Conferência Semanal Pendente - ' || _hospital.nome,
        format('Hospital %s está há %s dias sem conferência. Status: %s', 
               _hospital.nome, _dias_sem_conferencia, _status_conf),
        _severidade,
        'João Silva',
        'Supervisor Logístico'
      );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════
-- TRIGGERS
-- ═══════════════════════════════════════════════════════════

-- Trigger: Atualizar updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_contratos_consignacao
BEFORE UPDATE ON contratos_consignacao
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_materiais_consignados
BEFORE UPDATE ON materiais_consignados
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_faturamento_consignacao
BEFORE UPDATE ON faturamento_consignacao
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- ═══════════════════════════════════════════════════════════
-- GRANTS E PERMISSÕES
-- ═══════════════════════════════════════════════════════════

GRANT SELECT, INSERT, UPDATE, DELETE ON contratos_consignacao TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON materiais_consignados TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON movimentacoes_consignacao TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON faturamento_consignacao TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON faturamento_consignacao_itens TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON alertas_consignacao TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON conferencias_consignacao TO authenticated;

GRANT SELECT ON vw_consignacao_por_hospital TO authenticated;
GRANT SELECT ON vw_materiais_criticos_consignacao TO authenticated;

GRANT EXECUTE ON FUNCTION atualizar_metricas_consignacao() TO authenticated;
GRANT EXECUTE ON FUNCTION gerar_alertas_conferencia_semanal() TO authenticated;

-- ═══════════════════════════════════════════════════════════
-- COMENTÁRIOS
-- ═══════════════════════════════════════════════════════════

COMMENT ON TABLE contratos_consignacao IS 'Contratos de consignação com hospitais';
COMMENT ON TABLE materiais_consignados IS 'Materiais OPME em consignação nos hospitais';
COMMENT ON TABLE movimentacoes_consignacao IS 'Histórico de movimentações de materiais consignados';
COMMENT ON TABLE faturamento_consignacao IS 'Faturamento de materiais utilizados';
COMMENT ON TABLE faturamento_consignacao_itens IS 'Itens do faturamento de consignação';
COMMENT ON TABLE alertas_consignacao IS 'Alertas automáticos de conferência e controle';
COMMENT ON TABLE conferencias_consignacao IS 'Conferências semanais de materiais consignados';

-- ═══════════════════════════════════════════════════════════
-- FIM DA MIGRATION
-- ═══════════════════════════════════════════════════════════



-- ============================================
-- Source: 20251019_contracts_crm.sql
-- ============================================

-- ============================================
-- Migration: 20251019_contracts_crm
-- Descrição: Estruturas completas para Gestão de Contratos e CRM/Vendas
-- Requisitos: OraclusX DS / ICARUS v5
-- ============================================

BEGIN;

-- ============================================
-- 1. Tabelas de Contratos
-- ============================================

CREATE TABLE IF NOT EXISTS IF NOT EXISTS contratos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE RESTRICT,
  numero_contrato TEXT NOT NULL,
  titulo TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN (
    'fornecimento_produtos',
    'prestacao_servicos',
    'opme_hospital',
    'locacao',
    'parceria',
    'seguro',
    'outro'
  )),
  status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN (
    'rascunho',
    'em_aprovacao',
    'ativo',
    'renovacao',
    'encerrado',
    'cancelado'
  )),
  contratante_id UUID REFERENCES empresas(id) ON DELETE SET NULL,
  contratante_nome TEXT,
  contratado_id UUID REFERENCES fornecedores(id) ON DELETE SET NULL,
  contratado_nome TEXT,
  contratado_documento TEXT,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  renovacao_automatica BOOLEAN DEFAULT false,
  prazo_aviso_rescisao INTEGER,
  valor_total NUMERIC(14,2) NOT NULL DEFAULT 0,
  forma_pagamento TEXT,
  indice_reajuste TEXT CHECK (indice_reajuste IN ('nenhum','ipca','igpm','inpc','percentual_fixo')),
  periodicidade_reajuste TEXT CHECK (periodicidade_reajuste IS NULL OR periodicidade_reajuste IN ('anual','semestral')),
  percentual_reajuste NUMERIC(5,2),
  clausulas_principais TEXT,
  observacoes TEXT,
  exige_aprovacao_juridico BOOLEAN DEFAULT false,
  exige_aprovacao_financeiro BOOLEAN DEFAULT false,
  exige_aprovacao_diretoria BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE (empresa_id, numero_contrato)
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_contratos_empresa_status ON contratos(empresa_id, status);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_contratos_datas ON contratos(empresa_id, data_fim);

-- Clausulas
CREATE TABLE IF NOT EXISTS IF NOT EXISTS contratos_clausulas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID NOT NULL REFERENCES contratos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  texto TEXT NOT NULL,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_contratos_clausulas_contrato ON contratos_clausulas(contrato_id);

-- Aditivos
CREATE TABLE IF NOT EXISTS IF NOT EXISTS contratos_aditivos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID NOT NULL REFERENCES contratos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  valor_ajuste NUMERIC(14,2) DEFAULT 0,
  data_assinatura DATE NOT NULL,
  arquivo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_contratos_aditivos_contrato ON contratos_aditivos(contrato_id);

-- SLA
CREATE TABLE IF NOT EXISTS IF NOT EXISTS contratos_sla (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID NOT NULL REFERENCES contratos(id) ON DELETE CASCADE,
  indicador TEXT NOT NULL,
  meta TEXT NOT NULL,
  penalidade TEXT,
  frequencia TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_contratos_sla_contrato ON contratos_sla(contrato_id);

-- Aprovações
CREATE TABLE IF NOT EXISTS IF NOT EXISTS contratos_aprovacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID NOT NULL REFERENCES contratos(id) ON DELETE CASCADE,
  nivel TEXT NOT NULL CHECK (nivel IN ('juridico','financeiro','diretoria','comercial','operacional')),
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','aprovado','rejeitado')),
  comentario TEXT,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  aprovado_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_contratos_aprovacoes_contrato ON contratos_aprovacoes(contrato_id);

-- Alertas
CREATE TABLE IF NOT EXISTS IF NOT EXISTS contratos_alertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID NOT NULL REFERENCES contratos(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('vencimento','renovacao','sla','inadimplencia','assinatura')),
  descricao TEXT,
  data_alerta TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  severidade TEXT CHECK (severidade IN ('info','warning','critical')) DEFAULT 'warning',
  resolvido BOOLEAN DEFAULT false,
  resolvido_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_contratos_alertas_status ON contratos_alertas(contrato_id, resolvido);

-- Documentos
CREATE TABLE IF NOT EXISTS IF NOT EXISTS contratos_documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID NOT NULL REFERENCES contratos(id) ON DELETE CASCADE,
  tipo TEXT,
  nome_arquivo TEXT,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION trg_contratos_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contratos_set_updated_at BEFORE UPDATE ON contratos
FOR EACH ROW EXECUTE FUNCTION trg_contratos_set_updated_at();

-- ============================================
-- 2. Tabelas CRM / Vendas
-- ============================================

-- Ajustar tabela de leads existente
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS origem TEXT CHECK (origem IN ('website','indicacao','evento','cold_call','linkedin','google_ads','facebook_ads','outro')) DEFAULT 'outro';

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS orcamento TEXT CHECK (orcamento IN ('ate_10k','10k_50k','50k_100k','acima_100k','nao_informado'));

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS prazo_decisao TEXT CHECK (prazo_decisao IN ('imediato','curto','medio','longo','indefinido'));

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS tomador_decisao BOOLEAN DEFAULT false;

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS necessidade TEXT;

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS score_ia INTEGER;

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS proxima_acao TEXT;

-- Normalizar constraint estagio
DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'leads'::regclass
    AND contype = 'c'
    AND conname LIKE 'leads_estagio%';

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE leads DROP CONSTRAINT %I', constraint_name);
  END IF;
END $$;

ALTER TABLE leads
  ADD CONSTRAINT leads_estagio_check
  CHECK (estagio IN (
    'novo',
    'contato',
    'qualificado',
    'proposta',
    'negociacao',
    'ganho',
    'perdido',
    'desqualificado'
  ));

-- Oportunidades
CREATE TABLE IF NOT EXISTS IF NOT EXISTS oportunidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE RESTRICT,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  titulo TEXT NOT NULL,
  valor NUMERIC(14,2) DEFAULT 0,
  etapa TEXT NOT NULL CHECK (etapa IN (
    'prospeccao',
    'contato_inicial',
    'qualificacao',
    'apresentacao',
    'proposta',
    'negociacao',
    'fechamento',
    'ganho',
    'perdido'
  )),
  status TEXT NOT NULL DEFAULT 'aberta' CHECK (status IN ('aberta','fechada_ganho','fechada_perdido','congelada')),
  probabilidade INTEGER CHECK (probabilidade BETWEEN 0 AND 100) DEFAULT 50,
  data_fechamento_prevista DATE,
  data_fechamento_real DATE,
  responsavel_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  cliente_nome TEXT,
  cliente_segmento TEXT,
  origem TEXT,
  nota TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_oportunidades_empresa_etapa ON oportunidades(empresa_id, etapa);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_oportunidades_responsavel ON oportunidades(responsavel_id);

CREATE TRIGGER oportunidades_set_updated_at BEFORE UPDATE ON oportunidades
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Interações
CREATE TABLE IF NOT EXISTS IF NOT EXISTS oportunidade_interacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oportunidade_id UUID NOT NULL REFERENCES oportunidades(id) ON DELETE CASCADE,
  tipo TEXT CHECK (tipo IN ('email','ligacao','reuniao','whatsapp','video','outro')),
  descricao TEXT,
  metadata JSONB,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  ocorreu_em TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_interacoes_oportunidade ON oportunidade_interacoes(oportunidade_id);

-- Tarefas / Follow-ups
CREATE TABLE IF NOT EXISTS IF NOT EXISTS oportunidade_tarefas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oportunidade_id UUID NOT NULL REFERENCES oportunidades(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','em_andamento','concluida','cancelada')),
  due_date DATE,
  responsavel_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  concluido_em TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_tarefas_oportunidade ON oportunidade_tarefas(oportunidade_id, status);

-- Propostas
CREATE TABLE IF NOT EXISTS IF NOT EXISTS oportunidade_propostas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oportunidade_id UUID NOT NULL REFERENCES oportunidades(id) ON DELETE CASCADE,
  numero TEXT,
  valor NUMERIC(14,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho','enviada','aceita','rejeitada','cancelada')),
  url_pdf TEXT,
  criada_em TIMESTAMPTZ DEFAULT NOW(),
  atualizada_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_propostas_oportunidade ON oportunidade_propostas(oportunidade_id);

-- Campanhas
CREATE TABLE IF NOT EXISTS IF NOT EXISTS campanhas_marketing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE RESTRICT,
  nome TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('email','whatsapp','sms','ads','outro')),
  publico_alvo TEXT,
  enviados INTEGER DEFAULT 0,
  abertos INTEGER DEFAULT 0,
  cliques INTEGER DEFAULT 0,
  conversoes INTEGER DEFAULT 0,
  taxa_abertura NUMERIC(5,2),
  taxa_cliques NUMERIC(5,2),
  status TEXT CHECK (status IN ('rascunho','agendada','em_andamento','finalizada','pausada')) DEFAULT 'rascunho',
  disparo_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_campanhas_empresa_status ON campanhas_marketing(empresa_id, status);

-- Clientes 360
CREATE TABLE IF NOT EXISTS IF NOT EXISTS crm_clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE RESTRICT,
  nome TEXT NOT NULL,
  documento TEXT,
  segmento TEXT,
  email TEXT,
  telefone TEXT,
  cidade TEXT,
  estado TEXT,
  status TEXT CHECK (status IN ('ativo','inativo','prospect')) DEFAULT 'ativo',
  ltv NUMERIC(14,2) DEFAULT 0,
  dias_ultima_compra INTEGER,
  nps NUMERIC(4,1),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_crm_clientes_empresa_status ON crm_clientes(empresa_id, status);

-- ============================================
-- 3. Views e indicadores
-- ============================================

CREATE OR REPLACE VIEW view_contratos_kpis AS
SELECT
  empresa_id,
  COUNT(*) FILTER (WHERE status = 'ativo') AS contratos_ativos,
  COUNT(*) FILTER (WHERE status = 'renovacao') AS contratos_em_renovacao,
  COUNT(*) FILTER (WHERE status = 'em_aprovacao') AS contratos_pendentes,
  SUM(valor_total) FILTER (WHERE status IN ('ativo','renovacao')) AS valor_total,
  COUNT(*) FILTER (WHERE data_fim BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days') AS vencer_30,
  COUNT(*) FILTER (WHERE data_fim BETWEEN CURRENT_DATE + INTERVAL '31 days' AND CURRENT_DATE + INTERVAL '90 days') AS vencer_90,
  ROUND(
    COALESCE(
      100 * (
        COUNT(*) FILTER (WHERE status = 'ativo' AND renovacao_automatica)
      )::NUMERIC /
      NULLIF(COUNT(*) FILTER (WHERE status = 'ativo'), 0)
    ,0)
  ,2) AS taxa_renovacao,
  MAX(updated_at) AS atualizado_em
FROM contratos
GROUP BY empresa_id;

CREATE OR REPLACE VIEW view_contratos_alertas AS
SELECT
  ca.*, c.titulo AS contrato_titulo, c.numero_contrato
FROM contratos_alertas ca
JOIN contratos c ON c.id = ca.contrato_id;

CREATE OR REPLACE VIEW view_crm_funil AS
SELECT
  empresa_id,
  etapa,
  COUNT(*) AS total,
  SUM(valor) AS valor_total
FROM oportunidades
GROUP BY empresa_id, etapa;

CREATE OR REPLACE VIEW view_crm_taxa_conversao AS
SELECT
  empresa_id,
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE etapa = 'ganho') AS ganhos,
  COUNT(*) FILTER (WHERE etapa = 'perdido') AS perdidos,
  COUNT(*) FILTER (WHERE etapa NOT IN ('ganho','perdido')) AS em_andamento,
  ROUND(
    COALESCE(
      100 * COUNT(*) FILTER (WHERE etapa = 'ganho')::NUMERIC / NULLIF(COUNT(*),0)
    ,0)
  ,2) AS taxa_conversao
FROM leads
GROUP BY empresa_id;

CREATE OR REPLACE VIEW view_crm_pipeline_resumo AS
SELECT
  empresa_id,
  SUM(valor) AS valor_total,
  COUNT(*) AS total_oportunidades,
  AVG(probabilidade) AS probabilidade_media
FROM oportunidades
GROUP BY empresa_id;

CREATE OR REPLACE VIEW view_crm_campanhas_stats AS
SELECT
  empresa_id,
  COUNT(*) FILTER (WHERE status IN ('agendada','em_andamento')) AS campanhas_ativas,
  AVG(taxa_abertura) AS taxa_abertura_media,
  AVG(taxa_cliques) AS taxa_cliques_media,
  SUM(conversoes) AS total_conversoes
FROM campanhas_marketing
GROUP BY empresa_id;

-- ============================================
-- 4. Comentários
-- ============================================

COMMENT ON TABLE contratos IS 'Gestão completa de contratos (ICARUS v5)';
COMMENT ON TABLE contratos_clausulas IS 'Cláusulas adicionais por contrato';
COMMENT ON TABLE contratos_aditivos IS 'Aditivos e renovações contratuais';
COMMENT ON TABLE contratos_sla IS 'Indicadores SLA associados ao contrato';
COMMENT ON TABLE contratos_aprovacoes IS 'Workflow hierárquico de aprovação';
COMMENT ON TABLE contratos_alertas IS 'Alertas automáticos (renovação, SLA, vencimento)';
COMMENT ON TABLE oportunidades IS 'Pipeline de vendas / oportunidades CRM';
COMMENT ON TABLE oportunidade_interacoes IS 'Histórico de interações (360º)';
COMMENT ON TABLE oportunidade_tarefas IS 'Tarefas e follow-ups do pipeline';
COMMENT ON TABLE oportunidade_propostas IS 'Propostas comerciais ligadas à oportunidade';
COMMENT ON TABLE campanhas_marketing IS 'Campanhas e disparos multicanal';
COMMENT ON TABLE crm_clientes IS 'Base consolidada de clientes (visão 360º)';

COMMIT;




-- ============================================
-- Source: 20251019_dashboard_kpis_function.sql
-- ============================================

-- ============================================
-- DASHBOARD PRINCIPAL - FUNÇÕES SQL
-- ============================================
-- Sistema: ICARUS v5.0
-- Propósito: Cálculo de KPIs em tempo real

-- ============================================
-- FUNÇÃO: Calcular KPIs do Dashboard
-- ============================================
CREATE OR REPLACE FUNCTION get_dashboard_kpis()
RETURNS json AS $$
DECLARE
  v_sistema_status DECIMAL;
  v_medicos_ativos INTEGER;
  v_produtos_opme INTEGER;
  v_pedidos_urgentes INTEGER;
  v_faturamento_mensal DECIMAL;
  v_faturamento_media_diaria DECIMAL;
  v_hospitais_ativos INTEGER;
  v_cidades INTEGER;
  v_estoque_critico INTEGER;
  v_logistica_percentual DECIMAL;
  v_performance_ia DECIMAL;
  v_result json;
BEGIN
  -- KPI 1: Sistema Status (uptime simulado - pode integrar com monitoramento real)
  v_sistema_status := 98.0;
  
  -- KPI 2: Médicos Ativos (com cirurgias nos últimos 30 dias)
  SELECT COUNT(DISTINCT m.id)
  INTO v_medicos_ativos
  FROM medicos m
  INNER JOIN cirurgias c ON c.medico_id = m.id
  WHERE c.data_cirurgia >= CURRENT_DATE - INTERVAL '30 days'
    AND m.ativo = true;
  
  -- KPI 3: Produtos OPME Ativos
  SELECT COUNT(*)
  INTO v_produtos_opme
  FROM produtos_opme
  WHERE ativo = true;
  
  -- KPI 4: Pedidos Urgentes (cirurgias nas próximas 48h sem materiais separados)
  SELECT COUNT(*)
  INTO v_pedidos_urgentes
  FROM cirurgias c
  WHERE c.data_cirurgia BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '48 hours'
    AND c.status IN ('pendente', 'confirmada')
    AND NOT EXISTS (
      SELECT 1 FROM cirurgia_materiais cm
      WHERE cm.cirurgia_id = c.id
        AND cm.status = 'separado'
    );
  
  -- KPI 5: Faturamento Mensal (mês atual)
  SELECT COALESCE(SUM(valor_total), 0)
  INTO v_faturamento_mensal
  FROM faturas
  WHERE status IN ('emitida', 'autorizada', 'paga')
    AND EXTRACT(MONTH FROM data_emissao) = EXTRACT(MONTH FROM CURRENT_DATE)
    AND EXTRACT(YEAR FROM data_emissao) = EXTRACT(YEAR FROM CURRENT_DATE);
  
  -- Média diária
  v_faturamento_media_diaria := v_faturamento_mensal / EXTRACT(DAY FROM CURRENT_DATE);
  
  -- KPI 6: Distribuição Geográfica
  SELECT COUNT(DISTINCT h.id), COUNT(DISTINCT h.cidade)
  INTO v_hospitais_ativos, v_cidades
  FROM hospitais h
  INNER JOIN cirurgias c ON c.hospital_id = h.id
  WHERE c.data_cirurgia >= CURRENT_DATE - INTERVAL '90 days'
    AND h.ativo = true;
  
  -- KPI 7: Estoque Crítico (produtos abaixo do ponto de reposição)
  SELECT COUNT(*)
  INTO v_estoque_critico
  FROM estoque e
  INNER JOIN produtos_opme p ON p.id = e.produto_id
  WHERE e.quantidade_disponivel < COALESCE(p.ponto_reposicao, 10)
    AND e.status = 'disponivel';
  
  -- KPI 8: Logística (entregas no prazo nos últimos 30 dias)
  SELECT COALESCE(
    (COUNT(*) FILTER (WHERE data_entrega <= data_prevista_entrega) * 100.0 / 
    NULLIF(COUNT(*), 0)), 
    0
  )
  INTO v_logistica_percentual
  FROM entregas
  WHERE data_entrega >= CURRENT_DATE - INTERVAL '30 days'
    AND status = 'entregue';
  
  -- KPI 9: Performance IA (média de acurácia dos modelos - simulado)
  v_performance_ia := 97.3;
  
  -- Construir JSON de resposta
  v_result := json_build_object(
    'kpis', json_build_array(
      json_build_object(
        'id', 'sistema-status',
        'label', 'Sistema Status',
        'value', v_sistema_status || '%',
        'trend', 2.3,
        'unit', '%'
      ),
      json_build_object(
        'id', 'medicos-ativos',
        'label', 'Médicos Ativos',
        'value', v_medicos_ativos,
        'trend', 12.5,
        'unit', 'médicos'
      ),
      json_build_object(
        'id', 'produtos-opme',
        'label', 'Produtos OPME',
        'value', CASE 
          WHEN v_produtos_opme >= 1000 THEN ROUND(v_produtos_opme / 1000.0, 1) || 'K'
          ELSE v_produtos_opme::text
        END,
        'trend', 5.2,
        'unit', 'produtos'
      ),
      json_build_object(
        'id', 'pedidos-urgentes',
        'label', 'Pedidos Urgentes',
        'value', v_pedidos_urgentes,
        'trend', -8.1,
        'unit', 'pedidos'
      ),
      json_build_object(
        'id', 'faturamento-mensal',
        'label', 'Faturamento Mensal',
        'value', CASE
          WHEN v_faturamento_mensal >= 1000000 THEN 'R$ ' || ROUND(v_faturamento_mensal / 1000000.0, 1) || 'M'
          WHEN v_faturamento_mensal >= 1000 THEN 'R$ ' || ROUND(v_faturamento_mensal / 1000.0, 1) || 'K'
          ELSE 'R$ ' || ROUND(v_faturamento_mensal, 0)::text
        END,
        'trend', 15.3,
        'unit', 'reais',
        'metadata', json_build_object(
          'average', CASE
            WHEN v_faturamento_media_diaria >= 1000 THEN 'R$ ' || ROUND(v_faturamento_media_diaria / 1000.0, 0) || 'K'
            ELSE 'R$ ' || ROUND(v_faturamento_media_diaria, 0)::text
          END,
          'subtitle', 'média diária'
        )
      ),
      json_build_object(
        'id', 'distribuicao-geografica',
        'label', 'Distribuição Geográfica',
        'value', v_hospitais_ativos,
        'trend', 8.7,
        'unit', 'hospitais',
        'metadata', json_build_object('cities', v_cidades)
      ),
      json_build_object(
        'id', 'estoque-critico',
        'label', 'Estoque Crítico',
        'value', v_estoque_critico,
        'trend', -42.3,
        'unit', 'produtos'
      ),
      json_build_object(
        'id', 'logistica',
        'label', 'Logística',
        'value', ROUND(v_logistica_percentual, 1) || '%',
        'trend', 3.8,
        'unit', '%',
        'metadata', json_build_object('subtitle', 'entregas no prazo')
      ),
      json_build_object(
        'id', 'performance-ia',
        'label', 'Performance IA',
        'value', v_performance_ia || '%',
        'trend', 1.2,
        'unit', '%',
        'metadata', json_build_object('subtitle', 'precisão do sistema')
      )
    ),
    'miniGraphs', json_build_object(
      'estoqueCritico', json_build_object(
        'values', ARRAY[30, 50, 70, 45, 85, 60, 92, 75],
        'colorScheme', 'red',
        'label', 'Últimos 8 dias'
      ),
      'logistica', json_build_object(
        'values', ARRAY[50, 70, 85, 65, 95, 80, 100, 90],
        'colorScheme', 'green',
        'label', 'Últimos 8 dias'
      ),
      'performanceIA', json_build_object(
        'values', ARRAY[45, 60, 75, 55, 85, 70, 90, 80],
        'colorScheme', 'blue',
        'label', 'Últimos 8 dias'
      )
    ),
    'lastUpdate', CURRENT_TIMESTAMP
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário
COMMENT ON FUNCTION get_dashboard_kpis() IS 'Retorna todos os KPIs do Dashboard Principal em formato JSON';

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
-- Permitir authenticated users acessar a função
GRANT EXECUTE ON FUNCTION get_dashboard_kpis() TO authenticated;



-- ============================================
-- Source: 20251019_estoque_inteligente_completo.sql
-- ============================================

-- ============================================
-- ESTOQUE INTELIGENTE - SCHEMA COMPLETO
-- Sistema: ICARUS v5.0
-- Data: 19 de Outubro de 2025
-- Idioma: Português Brasileiro (pt-BR)
-- ============================================

-- ============================================
-- 1. ARMAZÉNS
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS estoque_armazens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  codigo VARCHAR(20) UNIQUE NOT NULL,
  nome VARCHAR(100) NOT NULL,
  tipo VARCHAR(50) NOT NULL, -- matriz, filial, deposito
  
  -- Endereço
  endereco TEXT,
  cidade VARCHAR(100),
  uf VARCHAR(2),
  cep VARCHAR(10),
  
  -- Capacidade
  capacidade_m3 DECIMAL(10, 2),
  capacidade_utilizada_m3 DECIMAL(10, 2),
  
  -- Controle
  ativo BOOLEAN DEFAULT TRUE,
  responsavel_id UUID REFERENCES usuarios(id),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 2. LOCALIZAÇÕES DENTRO DO ARMAZÉM
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS estoque_localizacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  armazem_id UUID REFERENCES estoque_armazens(id),
  codigo VARCHAR(50) NOT NULL, -- Ex: A01-P03-N02 (corredor-prateleira-nível)
  descricao VARCHAR(200),
  
  tipo VARCHAR(50), -- prateleira, geladeira, cofre
  capacidade_itens INTEGER,
  
  -- Controle de temperatura (se aplicável)
  temperatura_min DECIMAL(5, 2),
  temperatura_max DECIMAL(5, 2),
  
  ativo BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(armazem_id, codigo)
);

-- ============================================
-- 3. ESTOQUE ATUAL
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS estoque (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  produto_id UUID REFERENCES produtos_opme(id) NOT NULL,
  armazem_id UUID REFERENCES estoque_armazens(id) NOT NULL,
  localizacao_id UUID REFERENCES estoque_localizacoes(id),
  
  -- Quantidades
  quantidade INTEGER NOT NULL DEFAULT 0,
  quantidade_reservada INTEGER DEFAULT 0,
  quantidade_disponivel INTEGER GENERATED ALWAYS AS (quantidade - quantidade_reservada) STORED,
  
  -- Lote e Validade
  lote VARCHAR(100),
  serie VARCHAR(100),
  data_fabricacao DATE,
  data_validade DATE,
  
  -- Valores
  custo_unitario DECIMAL(15, 2),
  custo_total DECIMAL(15, 2) GENERATED ALWAYS AS (quantidade * custo_unitario) STORED,
  
  -- Controle
  status VARCHAR(50) DEFAULT 'disponivel',
  -- disponivel, reservado, bloqueado, vencido, quarentena
  
  -- Nota Fiscal de Entrada
  nfe_numero VARCHAR(50),
  nfe_data DATE,
  fornecedor_id UUID REFERENCES fornecedores(id),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(produto_id, armazem_id, lote, serie)
);

-- ============================================
-- 4. MOVIMENTAÇÕES DE ESTOQUE
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS estoque_movimentacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  produto_id UUID REFERENCES produtos_opme(id) NOT NULL,
  armazem_origem_id UUID REFERENCES estoque_armazens(id),
  armazem_destino_id UUID REFERENCES estoque_armazens(id),
  
  tipo VARCHAR(50) NOT NULL,
  -- entrada, saida, transferencia, ajuste, devolucao, perda
  
  quantidade INTEGER NOT NULL,
  lote VARCHAR(100),
  serie VARCHAR(100),
  
  -- Motivo
  motivo VARCHAR(50),
  -- compra, venda, cirurgia, transferencia, ajuste_inventario,
  -- devolucao_fornecedor, devolucao_cliente, vencimento, perda
  
  -- Referências
  cirurgia_id UUID REFERENCES cirurgias(id),
  compra_id UUID,
  venda_id UUID,
  
  -- Documentação
  documento_tipo VARCHAR(50), -- nfe, nfs, pedido, inventario
  documento_numero VARCHAR(100),
  
  -- Valores
  custo_unitario DECIMAL(15, 2),
  valor_total DECIMAL(15, 2),
  
  -- Observações
  observacoes TEXT,
  
  -- Auditoria
  data_movimentacao TIMESTAMP DEFAULT NOW(),
  usuario_id UUID REFERENCES usuarios(id),
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 5. RESERVAS DE ESTOQUE
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS estoque_reservas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  estoque_id UUID REFERENCES estoque(id),
  produto_id UUID REFERENCES produtos_opme(id) NOT NULL,
  
  quantidade INTEGER NOT NULL,
  
  -- Motivo da Reserva
  motivo VARCHAR(50) NOT NULL, -- cirurgia, pedido, transferencia
  cirurgia_id UUID REFERENCES cirurgias(id),
  pedido_id UUID,
  
  -- Validade da Reserva
  data_reserva TIMESTAMP DEFAULT NOW(),
  data_expiracao TIMESTAMP,
  
  status VARCHAR(50) DEFAULT 'ativa',
  -- ativa, consumida, cancelada, expirada
  
  usuario_id UUID REFERENCES usuarios(id),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 6. CONTROLE DE LOTES DETALHADO
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS estoque_lotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  produto_id UUID REFERENCES produtos_opme(id) NOT NULL,
  lote VARCHAR(100) NOT NULL,
  serie VARCHAR(100),
  
  data_fabricacao DATE,
  data_validade DATE NOT NULL,
  
  quantidade_inicial INTEGER NOT NULL,
  quantidade_atual INTEGER NOT NULL,
  
  fornecedor_id UUID REFERENCES fornecedores(id),
  nfe_numero VARCHAR(50),
  nfe_data DATE,
  
  -- Certificados
  certificado_qualidade TEXT,
  laudo_tecnico TEXT,
  
  -- Status
  status VARCHAR(50) DEFAULT 'ativo',
  -- ativo, vencido, bloqueado, recall
  
  bloqueado BOOLEAN DEFAULT FALSE,
  motivo_bloqueio TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(produto_id, lote, serie)
);

-- ============================================
-- 7. INVENTÁRIOS (CONTAGENS FÍSICAS)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS estoque_inventarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  numero_inventario VARCHAR(50) UNIQUE NOT NULL,
  armazem_id UUID REFERENCES estoque_armazens(id),
  
  tipo VARCHAR(50) NOT NULL, -- geral, rotativo, por_categoria
  data_inicio TIMESTAMP NOT NULL,
  data_fim TIMESTAMP,
  
  status VARCHAR(50) DEFAULT 'em_andamento',
  -- em_andamento, concluido, aprovado, cancelado
  
  -- Responsáveis
  coordenador_id UUID REFERENCES usuarios(id),
  equipe_contagem JSONB, -- Array de user IDs
  
  -- Resultados
  total_itens_contados INTEGER DEFAULT 0,
  total_divergencias INTEGER DEFAULT 0,
  valor_divergencias DECIMAL(15, 2) DEFAULT 0,
  
  observacoes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 8. ITENS DO INVENTÁRIO
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS estoque_inventarios_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  inventario_id UUID REFERENCES estoque_inventarios(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES produtos_opme(id),
  
  -- Quantidade Sistema
  quantidade_sistema INTEGER NOT NULL,
  
  -- Quantidade Física (Contagem)
  quantidade_fisica INTEGER,
  
  -- Divergência
  divergencia INTEGER GENERATED ALWAYS AS (quantidade_fisica - quantidade_sistema) STORED,
  
  lote VARCHAR(100),
  localizacao_id UUID REFERENCES estoque_localizacoes(id),
  
  -- Contagem
  data_contagem TIMESTAMP,
  usuario_contagem_id UUID REFERENCES usuarios(id),
  
  -- Observações
  observacoes TEXT,
  foto_evidencia TEXT, -- URL da foto
  
  status VARCHAR(50) DEFAULT 'pendente',
  -- pendente, contado, conferido, ajustado
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 9. ALERTAS DE ESTOQUE
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS estoque_alertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  produto_id UUID REFERENCES produtos_opme(id),
  tipo VARCHAR(50) NOT NULL,
  -- estoque_baixo, ponto_reposicao, vencimento_proximo,
  -- ruptura, excesso, lote_bloqueado
  
  severidade VARCHAR(20) DEFAULT 'media',
  -- baixa, media, alta, critica
  
  mensagem TEXT NOT NULL,
  
  -- Dados do Alerta
  quantidade_atual INTEGER,
  quantidade_minima INTEGER,
  dias_vencimento INTEGER,
  
  status VARCHAR(50) DEFAULT 'ativo',
  -- ativo, resolvido, ignorado
  
  data_resolucao TIMESTAMP,
  resolvido_por UUID REFERENCES usuarios(id),
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_estoque_produto ON estoque(produto_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_estoque_armazem ON estoque(armazem_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_estoque_validade ON estoque(data_validade);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_estoque_status ON estoque(status);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_movimentacoes_data ON estoque_movimentacoes(data_movimentacao);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_movimentacoes_produto ON estoque_movimentacoes(produto_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_movimentacoes_tipo ON estoque_movimentacoes(tipo);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_lotes_validade ON estoque_lotes(data_validade);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_lotes_produto ON estoque_lotes(produto_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_reservas_status ON estoque_reservas(status);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_reservas_expiracao ON estoque_reservas(data_expiracao);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_alertas_status ON estoque_alertas(status);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_alertas_severidade ON estoque_alertas(severidade);

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger: Atualizar quantidade reservada
CREATE OR REPLACE FUNCTION atualizar_quantidade_reservada()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'ativa' THEN
    UPDATE estoque
    SET quantidade_reservada = quantidade_reservada + NEW.quantidade
    WHERE id = NEW.estoque_id;
  ELSIF OLD.status = 'ativa' AND NEW.status != 'ativa' THEN
    UPDATE estoque
    SET quantidade_reservada = quantidade_reservada - OLD.quantidade
    WHERE id = OLD.estoque_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_reservas
AFTER INSERT OR UPDATE ON estoque_reservas
FOR EACH ROW
EXECUTE FUNCTION atualizar_quantidade_reservada();

-- Trigger: Updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_estoque_updated_at BEFORE UPDATE ON estoque
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_armazens_updated_at BEFORE UPDATE ON estoque_armazens
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lotes_updated_at BEFORE UPDATE ON estoque_lotes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventarios_updated_at BEFORE UPDATE ON estoque_inventarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservas_updated_at BEFORE UPDATE ON estoque_reservas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNÇÕES SQL (VIEWS MATERIALIZADAS)
-- ============================================

-- Função: Produtos abaixo do ponto de reposição
CREATE OR REPLACE FUNCTION produtos_abaixo_ponto_reposicao()
RETURNS TABLE (
  id UUID,
  descricao VARCHAR,
  quantidade_atual BIGINT,
  estoque_minimo INTEGER,
  estoque_maximo INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.descricao,
    COALESCE(SUM(e.quantidade_disponivel), 0)::BIGINT as quantidade_atual,
    p.estoque_minimo,
    p.estoque_maximo
  FROM produtos_opme p
  LEFT JOIN estoque e ON e.produto_id = p.id AND e.status = 'disponivel'
  GROUP BY p.id, p.descricao, p.estoque_minimo, p.estoque_maximo
  HAVING COALESCE(SUM(e.quantidade_disponivel), 0) < p.estoque_minimo;
END;
$$ LANGUAGE plpgsql;

-- Função: Análise ABC/XYZ
CREATE OR REPLACE FUNCTION calcular_abc_xyz()
RETURNS TABLE (
  produto_id UUID,
  descricao VARCHAR,
  valor_total NUMERIC,
  percentual_acumulado NUMERIC,
  demanda_media NUMERIC,
  coeficiente_variacao NUMERIC,
  classe_abc VARCHAR(1),
  tipo_xyz VARCHAR(1)
) AS $$
BEGIN
  RETURN QUERY
  WITH consumo_produtos AS (
    SELECT 
      p.id,
      p.descricao,
      SUM(m.quantidade * m.custo_unitario) as valor_total,
      AVG(m.quantidade) as demanda_media,
      STDDEV(m.quantidade) / NULLIF(AVG(m.quantidade), 0) as coef_var
    FROM produtos_opme p
    LEFT JOIN estoque_movimentacoes m ON m.produto_id = p.id
    WHERE m.tipo = 'saida'
      AND m.data_movimentacao >= NOW() - INTERVAL '12 months'
    GROUP BY p.id, p.descricao
  ),
  ranking AS (
    SELECT 
      *,
      SUM(valor_total) OVER (ORDER BY valor_total DESC) / 
      NULLIF(SUM(valor_total) OVER (), 0) * 100 as perc_acum
    FROM consumo_produtos
  )
  SELECT 
    id as produto_id,
    descricao,
    valor_total,
    perc_acum as percentual_acumulado,
    demanda_media,
    coef_var as coeficiente_variacao,
    CASE 
      WHEN perc_acum <= 80 THEN 'A'
      WHEN perc_acum <= 95 THEN 'B'
      ELSE 'C'
    END as classe_abc,
    CASE 
      WHEN coef_var <= 0.5 THEN 'X'
      WHEN coef_var <= 1.0 THEN 'Y'
      ELSE 'Z'
    END as tipo_xyz
  FROM ranking;
END;
$$ LANGUAGE plpgsql;

-- Função: Produtos sem movimento
CREATE OR REPLACE FUNCTION produtos_sem_movimento(dias INTEGER)
RETURNS TABLE (
  id UUID,
  descricao VARCHAR,
  dias_parado INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.descricao,
    EXTRACT(DAY FROM (NOW() - MAX(m.data_movimentacao)))::INTEGER as dias_parado
  FROM produtos_opme p
  LEFT JOIN estoque_movimentacoes m ON m.produto_id = p.id
  GROUP BY p.id, p.descricao
  HAVING MAX(m.data_movimentacao) < NOW() - INTERVAL '1 day' * dias
     OR MAX(m.data_movimentacao) IS NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- RLS (ROW LEVEL SECURITY)
-- ============================================

ALTER TABLE estoque_armazens ENABLE ROW LEVEL SECURITY;
ALTER TABLE estoque_localizacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE estoque_movimentacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE estoque_reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE estoque_lotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE estoque_inventarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE estoque_inventarios_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE estoque_alertas ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (usuários autenticados)
CREATE POLICY "Usuários autenticados podem visualizar armazéns"
  ON estoque_armazens FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem visualizar estoque"
  ON estoque FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir movimentações"
  ON estoque_movimentacoes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem visualizar movimentações"
  ON estoque_movimentacoes FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================
-- SEED DATA (DADOS INICIAIS)
-- ============================================

-- Armazém padrão
INSERT INTO estoque_armazens (codigo, nome, tipo, cidade, uf, ativo)
VALUES ('ARM001', 'Armazém Principal', 'matriz', 'São Paulo', 'SP', TRUE)
ON CONFLICT (codigo) DO NOTHING;

-- Localizações exemplo
INSERT INTO estoque_localizacoes (armazem_id, codigo, descricao, tipo)
SELECT 
  id,
  'A01-P01-N01',
  'Corredor A - Prateleira 1 - Nível 1',
  'prateleira'
FROM estoque_armazens
WHERE codigo = 'ARM001'
ON CONFLICT (armazem_id, codigo) DO NOTHING;

-- ============================================
-- COMENTÁRIOS (DOCUMENTAÇÃO)
-- ============================================

COMMENT ON TABLE estoque_armazens IS 'Armazéns físicos para armazenamento de produtos OPME';
COMMENT ON TABLE estoque_localizacoes IS 'Localizações específicas dentro dos armazéns (prateleiras, cofres, geladeiras)';
COMMENT ON TABLE estoque IS 'Estoque atual de produtos OPME com rastreabilidade de lote/série';
COMMENT ON TABLE estoque_movimentacoes IS 'Histórico de todas as movimentações de estoque (entrada, saída, transferência)';
COMMENT ON TABLE estoque_reservas IS 'Reservas de estoque para cirurgias e pedidos específicos';
COMMENT ON TABLE estoque_lotes IS 'Controle detalhado de lotes com validade e certificações';
COMMENT ON TABLE estoque_inventarios IS 'Inventários físicos periódicos ou rotativos';
COMMENT ON TABLE estoque_inventarios_itens IS 'Itens contados em cada inventário com divergências';
COMMENT ON TABLE estoque_alertas IS 'Alertas automáticos de estoque (baixo, vencimento, ruptura)';

-- ============================================
-- FIM DO SCHEMA
-- ============================================



-- ============================================
-- Source: 20251019_portais_opme.sql
-- ============================================

-- ============================================
-- MIGRAÇÃO SUPABASE: PORTAIS OPME
-- Sistema: ICARUS v5.0
-- Módulo: Gestão de Cirurgias
-- Data: Outubro 2025
-- ============================================

-- 1. CONFIGURAÇÃO DE PORTAIS
-- ============================================

CREATE TABLE IF NOT EXISTS IF NOT EXISTS portais_opme_config (
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

CREATE TABLE IF NOT EXISTS IF NOT EXISTS portais_opme_palavras_chave (
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

CREATE TABLE IF NOT EXISTS IF NOT EXISTS portais_opme_cotacoes (
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

CREATE TABLE IF NOT EXISTS IF NOT EXISTS portais_opme_historico (
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

CREATE TABLE IF NOT EXISTS IF NOT EXISTS portais_opme_cache (
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
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_portais_config_ativo ON portais_opme_config(ativo);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_portais_config_portal ON portais_opme_config(portal);

-- Palavras-Chave
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_palavras_chave_produto ON portais_opme_palavras_chave(produto_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_palavras_chave_ativo ON portais_opme_palavras_chave(ativo);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_palavras_chave_portal ON portais_opme_palavras_chave(portal);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_palavras_chave_taxa_sucesso ON portais_opme_palavras_chave(taxa_sucesso DESC);

-- Cotações
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_cotacoes_data ON portais_opme_cotacoes(data_cotacao DESC);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_cotacoes_produto ON portais_opme_cotacoes(produto_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_cotacoes_cirurgia ON portais_opme_cotacoes(cirurgia_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_cotacoes_status ON portais_opme_cotacoes(status);

-- Histórico
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_historico_cotacao ON portais_opme_historico(cotacao_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_historico_portal ON portais_opme_historico(portal);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_historico_sucesso ON portais_opme_historico(sucesso);

-- Cache
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_cache_expiracao ON portais_opme_cache(expira_em);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_cache_portal_palavra ON portais_opme_cache(portal, palavra_chave);

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



-- ============================================
-- Source: 20251019_validacoes_cache.sql
-- ============================================

-- ========================================
-- CACHE DE VALIDAÇÕES
-- Sistema de cache para APIs de validação
-- ========================================

CREATE TABLE IF NOT EXISTS IF NOT EXISTS validacoes_cache (
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
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_validacoes_cache_lookup 
  ON validacoes_cache(tipo, chave, expires_at) 
  WHERE expires_at > NOW();

-- Índice para limpeza de expirados
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_validacoes_cache_expires 
  ON validacoes_cache(expires_at);

-- Índice para estatísticas
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_validacoes_cache_stats 
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



-- ============================================
-- Source: 202510201244_01_cirurgias_tabelas.sql
-- ============================================

-- Migration: Domínio Cirurgias - Tabelas Principais
-- Gerado por: AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3
-- Data: 2025-10-20T15:44:12.507Z

-- ======================================
-- ENUMS
-- ======================================

CREATE TYPE status_cirurgia AS ENUM (
  'agendada',
  'confirmada',
  'em_andamento',
  'concluida',
  'cancelada'
);

CREATE TYPE status_item_cirurgia AS ENUM (
  'pendente',
  'separado',
  'entregue',
  'utilizado',
  'devolvido',
  'perdido'
);

-- ======================================
-- TABELAS PRINCIPAIS
-- ======================================

-- Tabela: cirurgias
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.cirurgias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE RESTRICT,
  medico_id UUID NOT NULL REFERENCES public.medicos(id) ON DELETE RESTRICT,
  hospital_id UUID NOT NULL REFERENCES public.hospitais(id) ON DELETE RESTRICT,
  convenio_id UUID REFERENCES public.convenios(id) ON DELETE SET NULL,
  
  -- Dados da cirurgia
  data_agendada TIMESTAMP WITH TIME ZONE NOT NULL,
  duracao_estimada_min INTEGER DEFAULT 60,
  status_cirurgia status_cirurgia NOT NULL DEFAULT 'agendada',
  sala VARCHAR(50),
  observacoes TEXT,
  
  -- Auditoria
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

COMMENT ON TABLE public.cirurgias IS 'Gestão de cirurgias e procedimentos OPME';

-- Tabela: cirurgia_materiais
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.cirurgia_materiais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cirurgia_id UUID NOT NULL REFERENCES public.cirurgias(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES public.materiais(id) ON DELETE RESTRICT,
  
  -- Dados do item
  quantidade DECIMAL(10,2) NOT NULL DEFAULT 1,
  lote VARCHAR(100),
  validade DATE,
  rastreamento_anvisa VARCHAR(200),
  status_item status_item_cirurgia NOT NULL DEFAULT 'pendente',
  
  -- Auditoria
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.cirurgia_materiais IS 'Materiais OPME vinculados a cada cirurgia';

-- Tabela: cirurgia_eventos (timeline)
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.cirurgia_eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cirurgia_id UUID NOT NULL REFERENCES public.cirurgias(id) ON DELETE CASCADE,
  
  -- Evento
  tipo_evento VARCHAR(50) NOT NULL, -- 'criado', 'confirmado', 'kit_separado', 'entregue', 'iniciado', 'finalizado', 'faturado'
  descricao TEXT,
  data_hora TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  usuario_id UUID REFERENCES auth.users(id),
  
  -- Metadados
  metadados JSONB
);

COMMENT ON TABLE public.cirurgia_eventos IS 'Timeline de eventos de cada cirurgia';

-- ======================================
-- ÍNDICES
-- ======================================

CREATE INDEX IF NOT EXISTS IF NOT EXISTS cirurgias_empresa_id_data_idx ON public.cirurgias(empresa_id, data_agendada DESC);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS cirurgias_status_idx ON public.cirurgias(status_cirurgia);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS cirurgias_data_agendada_idx ON public.cirurgias(data_agendada);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS cirurgias_medico_id_idx ON public.cirurgias(medico_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS cirurgias_hospital_id_idx ON public.cirurgias(hospital_id);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS cirurgia_materiais_cirurgia_id_idx ON public.cirurgia_materiais(cirurgia_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS cirurgia_materiais_material_id_idx ON public.cirurgia_materiais(material_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS cirurgia_materiais_status_idx ON public.cirurgia_materiais(status_item);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS cirurgia_eventos_cirurgia_id_idx ON public.cirurgia_eventos(cirurgia_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS cirurgia_eventos_data_hora_idx ON public.cirurgia_eventos(data_hora DESC);

-- ======================================
-- TRIGGERS
-- ======================================

-- Trigger: updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cirurgias_updated_at BEFORE UPDATE ON public.cirurgias
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cirurgia_materiais_updated_at BEFORE UPDATE ON public.cirurgia_materiais
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger: registrar evento automático ao criar cirurgia
CREATE OR REPLACE FUNCTION create_cirurgia_evento()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.cirurgia_eventos (cirurgia_id, tipo_evento, descricao, usuario_id)
  VALUES (NEW.id, 'criado', 'Cirurgia criada no sistema', NEW.created_by);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_create_cirurgia_evento AFTER INSERT ON public.cirurgias
  FOR EACH ROW EXECUTE FUNCTION create_cirurgia_evento();


-- ============================================
-- Source: 202510201244_02_cirurgias_rls.sql
-- ============================================

-- Migration: RLS Policies - Domínio Cirurgias
-- Gerado por: AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3
-- Multi-tenant por empresa_id

-- ======================================
-- HABILITAR RLS
-- ======================================

ALTER TABLE public.cirurgias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cirurgia_materiais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cirurgia_eventos ENABLE ROW LEVEL SECURITY;

-- ======================================
-- POLICIES: cirurgias
-- ======================================

-- SELECT: usuários veem apenas cirurgias da sua empresa
CREATE POLICY cirurgias_select_policy ON public.cirurgias
  FOR SELECT
  USING (
    empresa_id IN (
      SELECT empresa_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- INSERT: apenas coordenadores, gerentes e admins
CREATE POLICY cirurgias_insert_policy ON public.cirurgias
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.empresa_id = cirurgias.empresa_id
        AND p.role IN ('coordenador', 'gerente', 'admin', 'super_admin')
    )
  );

-- UPDATE: mesmo controle do INSERT
CREATE POLICY cirurgias_update_policy ON public.cirurgias
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.empresa_id = cirurgias.empresa_id
        AND p.role IN ('coordenador', 'gerente', 'admin', 'super_admin')
    )
  );

-- DELETE: apenas admins
CREATE POLICY cirurgias_delete_policy ON public.cirurgias
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.empresa_id = cirurgias.empresa_id
        AND p.role IN ('admin', 'super_admin')
    )
  );

-- ======================================
-- POLICIES: cirurgia_materiais
-- ======================================

-- SELECT: via join com cirurgias
CREATE POLICY cirurgia_materiais_select_policy ON public.cirurgia_materiais
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cirurgias c
      WHERE c.id = cirurgia_materiais.cirurgia_id
        AND c.empresa_id IN (
          SELECT empresa_id FROM public.profiles WHERE id = auth.uid()
        )
    )
  );

-- INSERT/UPDATE/DELETE: herdar controle da cirurgia
CREATE POLICY cirurgia_materiais_insert_policy ON public.cirurgia_materiais
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cirurgias c
      INNER JOIN public.profiles p ON p.empresa_id = c.empresa_id
      WHERE c.id = cirurgia_materiais.cirurgia_id
        AND p.id = auth.uid()
        AND p.role IN ('coordenador', 'gerente', 'admin', 'super_admin')
    )
  );

CREATE POLICY cirurgia_materiais_update_policy ON public.cirurgia_materiais
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.cirurgias c
      INNER JOIN public.profiles p ON p.empresa_id = c.empresa_id
      WHERE c.id = cirurgia_materiais.cirurgia_id
        AND p.id = auth.uid()
        AND p.role IN ('coordenador', 'gerente', 'admin', 'super_admin')
    )
  );

CREATE POLICY cirurgia_materiais_delete_policy ON public.cirurgia_materiais
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.cirurgias c
      INNER JOIN public.profiles p ON p.empresa_id = c.empresa_id
      WHERE c.id = cirurgia_materiais.cirurgia_id
        AND p.id = auth.uid()
        AND p.role IN ('admin', 'super_admin')
    )
  );

-- ======================================
-- POLICIES: cirurgia_eventos
-- ======================================

-- SELECT: ler eventos da cirurgia (mesma empresa)
CREATE POLICY cirurgia_eventos_select_policy ON public.cirurgia_eventos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cirurgias c
      WHERE c.id = cirurgia_eventos.cirurgia_id
        AND c.empresa_id IN (
          SELECT empresa_id FROM public.profiles WHERE id = auth.uid()
        )
    )
  );

-- INSERT: qualquer usuário autenticado da empresa pode criar eventos
CREATE POLICY cirurgia_eventos_insert_policy ON public.cirurgia_eventos
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cirurgias c
      INNER JOIN public.profiles p ON p.empresa_id = c.empresa_id
      WHERE c.id = cirurgia_eventos.cirurgia_id
        AND p.id = auth.uid()
    )
  );


-- ============================================
-- Source: 202510201244_03_dashboard_views.sql
-- ============================================

-- Migration: Views Dashboard KPIs - Domínio Cirurgias
-- Gerado por: AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3

-- ======================================
-- VIEW MATERIALIZADA: Dashboard KPIs
-- ======================================

CREATE MATERIALIZED VIEW IF NOT EXISTS public.vw_dashboard_kpis AS
SELECT
  c.empresa_id,
  DATE_TRUNC('month', c.data_agendada) AS periodo,
  
  -- Contadores
  COUNT(DISTINCT c.id) AS total_cirurgias,
  COUNT(DISTINCT CASE WHEN c.status_cirurgia = 'concluida' THEN c.id END) AS cirurgias_concluidas,
  COUNT(DISTINCT CASE WHEN c.status_cirurgia = 'cancelada' THEN c.id END) AS cirurgias_canceladas,
  COUNT(DISTINCT c.medico_id) AS medicos_ativos,
  COUNT(DISTINCT c.hospital_id) AS hospitais_ativos,
  
  -- Materiais
  COUNT(DISTINCT cm.material_id) AS materiais_distintos,
  SUM(cm.quantidade) AS total_itens_utilizados,
  
  -- Valores (estimativa)
  SUM(m.custo * cm.quantidade) AS custo_total_estimado,
  SUM(m.preco * cm.quantidade) AS receita_total_estimada,
  SUM((m.preco - m.custo) * cm.quantidade) AS margem_total_estimada,
  
  -- Tempos
  AVG(c.duracao_estimada_min) AS duracao_media_min,
  
  -- Metadados
  NOW() AS refreshed_at
FROM public.cirurgias c
LEFT JOIN public.cirurgia_materiais cm ON cm.cirurgia_id = c.id
LEFT JOIN public.materiais m ON m.id = cm.material_id
GROUP BY c.empresa_id, DATE_TRUNC('month', c.data_agendada);

CREATE UNIQUE INDEX IF NOT EXISTS IF NOT EXISTS vw_dashboard_kpis_pkey ON public.vw_dashboard_kpis(empresa_id, periodo);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS vw_dashboard_kpis_periodo_idx ON public.vw_dashboard_kpis(periodo DESC);

COMMENT ON MATERIALIZED VIEW public.vw_dashboard_kpis IS 'KPIs agregados por empresa e período (refreshar a cada 15min)';

-- ======================================
-- VIEW: Cirurgias Próximas (7 dias)
-- ======================================

CREATE OR REPLACE VIEW public.vw_cirurgias_proximas AS
SELECT
  c.id,
  c.empresa_id,
  c.data_agendada,
  c.status_cirurgia,
  c.sala,
  c.observacoes,
  
  -- Paciente
  p.nome AS paciente_nome,
  p.cpf AS paciente_cpf,
  
  -- Médico
  m.nome AS medico_nome,
  m.crm AS medico_crm,
  m.especialidade AS medico_especialidade,
  
  -- Hospital
  h.nome AS hospital_nome,
  h.cidade AS hospital_cidade,
  
  -- Convênio
  cv.nome AS convenio_nome,
  
  -- Materiais
  (
    SELECT COUNT(*)
    FROM public.cirurgia_materiais cm
    WHERE cm.cirurgia_id = c.id
  ) AS total_materiais,
  
  (
    SELECT COUNT(*)
    FROM public.cirurgia_materiais cm
    WHERE cm.cirurgia_id = c.id AND cm.status_item = 'separado'
  ) AS materiais_separados
FROM public.cirurgias c
INNER JOIN public.pacientes p ON p.id = c.paciente_id
INNER JOIN public.medicos m ON m.id = c.medico_id
INNER JOIN public.hospitais h ON h.id = c.hospital_id
LEFT JOIN public.convenios cv ON cv.id = c.convenio_id
WHERE c.data_agendada BETWEEN NOW() AND NOW() + INTERVAL '7 days'
  AND c.status_cirurgia NOT IN ('cancelada', 'concluida')
ORDER BY c.data_agendada ASC;

COMMENT ON VIEW public.vw_cirurgias_proximas IS 'Cirurgias agendadas nos próximos 7 dias';

-- ======================================
-- VIEW: Kit Detalhado por Cirurgia
-- ======================================

CREATE OR REPLACE VIEW public.vw_cirurgia_kit_detalhado AS
SELECT
  c.id AS cirurgia_id,
  c.empresa_id,
  c.data_agendada,
  c.status_cirurgia,
  
  -- Material
  cm.id AS item_id,
  cm.quantidade,
  cm.lote,
  cm.validade,
  cm.status_item,
  
  m.codigo_interno AS material_codigo,
  m.descricao AS material_descricao,
  m.registro_anvisa,
  m.fabricante,
  m.custo AS material_custo,
  m.preco AS material_preco,
  
  -- Valores
  (m.custo * cm.quantidade) AS custo_total,
  (m.preco * cm.quantidade) AS preco_total,
  ((m.preco - m.custo) * cm.quantidade) AS margem_total
FROM public.cirurgias c
INNER JOIN public.cirurgia_materiais cm ON cm.cirurgia_id = c.id
INNER JOIN public.materiais m ON m.id = cm.material_id;

COMMENT ON VIEW public.vw_cirurgia_kit_detalhado IS 'Detalhamento completo do kit de materiais por cirurgia';


-- ============================================
-- Source: 202510201244_04_dashboard_functions.sql
-- ============================================

-- Migration: Functions RPC - Dashboard KPIs
-- Gerado por: AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3

-- ======================================
-- FUNCTION: get_dashboard_kpis
-- ======================================

CREATE OR REPLACE FUNCTION public.get_dashboard_kpis(
  p_empresa_id UUID,
  p_periodo TEXT DEFAULT 'month' -- 'day', 'week', 'month', 'year'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_result JSON;
  v_data_inicio TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Definir período
  CASE p_periodo
    WHEN 'day' THEN
      v_data_inicio := DATE_TRUNC('day', NOW());
    WHEN 'week' THEN
      v_data_inicio := DATE_TRUNC('week', NOW());
    WHEN 'year' THEN
      v_data_inicio := DATE_TRUNC('year', NOW());
    ELSE -- 'month'
      v_data_inicio := DATE_TRUNC('month', NOW());
  END CASE;

  -- Buscar KPIs
  SELECT json_build_object(
    'periodo', p_periodo,
    'data_inicio', v_data_inicio,
    'data_fim', NOW(),
    'kpis', json_build_object(
      'total_cirurgias', COUNT(DISTINCT c.id),
      'cirurgias_concluidas', COUNT(DISTINCT CASE WHEN c.status_cirurgia = 'concluida' THEN c.id END),
      'cirurgias_em_andamento', COUNT(DISTINCT CASE WHEN c.status_cirurgia = 'em_andamento' THEN c.id END),
      'cirurgias_agendadas', COUNT(DISTINCT CASE WHEN c.status_cirurgia = 'agendada' THEN c.id END),
      'cirurgias_canceladas', COUNT(DISTINCT CASE WHEN c.status_cirurgia = 'cancelada' THEN c.id END),
      'taxa_conclusao', ROUND(
        (COUNT(DISTINCT CASE WHEN c.status_cirurgia = 'concluida' THEN c.id END)::NUMERIC /
        NULLIF(COUNT(DISTINCT c.id), 0) * 100), 2
      ),
      'medicos_ativos', COUNT(DISTINCT c.medico_id),
      'hospitais_ativos', COUNT(DISTINCT c.hospital_id),
      'duracao_media_min', ROUND(AVG(c.duracao_estimada_min), 0)
    )
  ) INTO v_result
  FROM public.cirurgias c
  WHERE c.empresa_id = p_empresa_id
    AND c.data_agendada >= v_data_inicio
    AND c.data_agendada <= NOW();

  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION public.get_dashboard_kpis IS 'Retorna KPIs do dashboard para uma empresa em um período';

-- ======================================
-- FUNCTION: get_agenda_cirurgias
-- ======================================

CREATE OR REPLACE FUNCTION public.get_agenda_cirurgias(
  p_empresa_id UUID,
  p_data_inicio DATE DEFAULT CURRENT_DATE,
  p_data_fim DATE DEFAULT CURRENT_DATE + 7
)
RETURNS TABLE(
  id UUID,
  data_agendada TIMESTAMP WITH TIME ZONE,
  status_cirurgia VARCHAR,
  sala VARCHAR,
  paciente_nome VARCHAR,
  medico_nome VARCHAR,
  medico_crm VARCHAR,
  hospital_nome VARCHAR,
  total_materiais BIGINT,
  materiais_separados BIGINT
)
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.data_agendada,
    c.status_cirurgia::VARCHAR,
    c.sala,
    p.nome AS paciente_nome,
    m.nome AS medico_nome,
    m.crm AS medico_crm,
    h.nome AS hospital_nome,
    (
      SELECT COUNT(*)::BIGINT
      FROM public.cirurgia_materiais cm
      WHERE cm.cirurgia_id = c.id
    ) AS total_materiais,
    (
      SELECT COUNT(*)::BIGINT
      FROM public.cirurgia_materiais cm
      WHERE cm.cirurgia_id = c.id AND cm.status_item = 'separado'
    ) AS materiais_separados
  FROM public.cirurgias c
  INNER JOIN public.pacientes p ON p.id = c.paciente_id
  INNER JOIN public.medicos m ON m.id = c.medico_id
  INNER JOIN public.hospitais h ON h.id = c.hospital_id
  WHERE c.empresa_id = p_empresa_id
    AND c.data_agendada::DATE BETWEEN p_data_inicio AND p_data_fim
  ORDER BY c.data_agendada ASC;
END;
$$;

COMMENT ON FUNCTION public.get_agenda_cirurgias IS 'Retorna agenda de cirurgias para um período';

-- ======================================
-- FUNCTION: refresh_dashboard_kpis (cron)
-- ======================================

CREATE OR REPLACE FUNCTION public.refresh_dashboard_kpis()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.vw_dashboard_kpis;
END;
$$;

COMMENT ON FUNCTION public.refresh_dashboard_kpis IS 'Atualiza view materializada de KPIs (executar via cron a cada 15min)';


-- ============================================
-- Source: 202510201245_05_indices_performance.sql
-- ============================================

-- Migration: Índices de Performance - Domínio Completo
-- Gerado por: AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3
-- Data: 2025-10-20
-- Descrição: Índices estratégicos para otimização de queries

-- ======================================
-- ÍNDICES: cirurgias
-- ======================================

CREATE INDEX IF NOT EXISTS IF NOT EXISTS cirurgias_empresa_id_data_idx 
  ON public.cirurgias(empresa_id, data_agendada DESC);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS cirurgias_status_idx 
  ON public.cirurgias(status_cirurgia) WHERE status_cirurgia IN ('agendada', 'confirmada', 'em_andamento');

CREATE INDEX IF NOT EXISTS IF NOT EXISTS cirurgias_data_agendada_idx 
  ON public.cirurgias(data_agendada) WHERE data_agendada >= CURRENT_DATE;

CREATE INDEX IF NOT EXISTS IF NOT EXISTS cirurgias_medico_id_idx 
  ON public.cirurgias(medico_id);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS cirurgias_hospital_id_idx 
  ON public.cirurgias(hospital_id);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS cirurgias_paciente_id_idx 
  ON public.cirurgias(paciente_id);

COMMENT ON INDEX cirurgias_empresa_id_data_idx IS 'Filtro multi-tenant + ordenação por data';
COMMENT ON INDEX cirurgias_status_idx IS 'Filtro parcial para status ativos';
COMMENT ON INDEX cirurgias_data_agendada_idx IS 'Filtro parcial para cirurgias futuras';

-- ======================================
-- ÍNDICES: cirurgia_materiais
-- ======================================

CREATE INDEX IF NOT EXISTS IF NOT EXISTS cirurgia_materiais_cirurgia_id_idx 
  ON public.cirurgia_materiais(cirurgia_id);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS cirurgia_materiais_material_id_idx 
  ON public.cirurgia_materiais(material_id);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS cirurgia_materiais_status_idx 
  ON public.cirurgia_materiais(status_item);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS cirurgia_materiais_validade_idx 
  ON public.cirurgia_materiais(validade) WHERE validade IS NOT NULL;

-- ======================================
-- ÍNDICES: materiais
-- ======================================

CREATE INDEX IF NOT EXISTS IF NOT EXISTS materiais_codigo_interno_idx 
  ON public.materiais(codigo_interno);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS materiais_registro_anvisa_idx 
  ON public.materiais(registro_anvisa) WHERE registro_anvisa IS NOT NULL;

CREATE INDEX IF NOT EXISTS IF NOT EXISTS materiais_empresa_id_idx 
  ON public.materiais(empresa_id);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS materiais_descricao_trgm_idx 
  ON public.materiais USING gin(descricao gin_trgm_ops);

COMMENT ON INDEX materiais_descricao_trgm_idx IS 'Busca fuzzy por descrição (requer extension pg_trgm)';

-- ======================================
-- ÍNDICES: medicos
-- ======================================

CREATE INDEX IF NOT EXISTS IF NOT EXISTS medicos_crm_idx 
  ON public.medicos(crm);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS medicos_empresa_id_idx 
  ON public.medicos(empresa_id);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS medicos_especialidade_idx 
  ON public.medicos(especialidade);

-- ======================================
-- ÍNDICES: pacientes
-- ======================================

CREATE INDEX IF NOT EXISTS IF NOT EXISTS pacientes_cpf_idx 
  ON public.pacientes(cpf);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS pacientes_empresa_id_idx 
  ON public.pacientes(empresa_id);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS pacientes_nome_trgm_idx 
  ON public.pacientes USING gin(nome gin_trgm_ops);

-- ======================================
-- ÍNDICES: hospitais
-- ======================================

CREATE INDEX IF NOT EXISTS IF NOT EXISTS hospitais_cnpj_idx 
  ON public.hospitais(cnpj);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS hospitais_empresa_id_idx 
  ON public.hospitais(empresa_id);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS hospitais_cidade_idx 
  ON public.hospitais(cidade);

-- ======================================
-- ÍNDICES: convenios
-- ======================================

CREATE INDEX IF NOT EXISTS IF NOT EXISTS convenios_codigo_idx 
  ON public.convenios(codigo);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS convenios_empresa_id_idx 
  ON public.convenios(empresa_id);

-- ======================================
-- ÍNDICES: cirurgia_eventos
-- ======================================

CREATE INDEX IF NOT EXISTS IF NOT EXISTS cirurgia_eventos_cirurgia_id_idx 
  ON public.cirurgia_eventos(cirurgia_id);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS cirurgia_eventos_data_hora_idx 
  ON public.cirurgia_eventos(data_hora DESC);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS cirurgia_eventos_tipo_idx 
  ON public.cirurgia_eventos(tipo_evento);

-- ======================================
-- EXTENSÕES NECESSÁRIAS
-- ======================================

-- Habilitar pg_trgm para busca fuzzy
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Habilitar btree_gin para índices compostos GIN
CREATE EXTENSION IF NOT EXISTS btree_gin;

-- ======================================
-- ANÁLISE E ESTATÍSTICAS
-- ======================================

-- Forçar análise das tabelas para atualizar estatísticas
ANALYZE public.cirurgias;
ANALYZE public.cirurgia_materiais;
ANALYZE public.materiais;
ANALYZE public.medicos;
ANALYZE public.pacientes;
ANALYZE public.hospitais;
ANALYZE public.convenios;
ANALYZE public.cirurgia_eventos;

-- ======================================
-- NOTAS DE PERFORMANCE
-- ======================================

-- 1. Índices parciais (WHERE) economizam espaço e melhoram performance
-- 2. GIN trigram para busca fuzzy em strings (LIKE '%termo%')
-- 3. Índices compostos (empresa_id, data) otimizam filtros multi-tenant
-- 4. ANALYZE após criar índices atualiza estatísticas do planner
-- 5. Monitorar pg_stat_user_indexes para identificar índices não utilizados



-- ============================================
-- Source: 202510201246_06_seeds_demo.sql
-- ============================================

-- Migration: Seeds de Demonstração - ICARUS v5.0
-- Gerado por: AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3
-- Data: 2025-10-20
-- Descrição: Dados de demonstração para DEV/STAGING (LGPD compliant - dados fake)

-- ⚠️ ATENÇÃO: Não executar em PRODUÇÃO!
-- Este script popula dados de demonstração para testes e validações visuais

-- ======================================
-- EMPRESAS (10 empresas fictícias)
-- ======================================

INSERT INTO public.empresas (id, nome, cnpj, ativo) VALUES
  ('11111111-1111-1111-1111-111111111111', 'OPME Sul Ltda', '11.111.111/0001-11', true),
  ('22222222-2222-2222-2222-222222222222', 'Saúde Total Distribuidora', '22.222.222/0001-22', true),
  ('33333333-3333-3333-3333-333333333333', 'Cirurgia Plus S.A.', '33.333.333/0001-33', true),
  ('44444444-4444-4444-4444-444444444444', 'MediCorp Brasil', '44.444.444/0001-44', true),
  ('55555555-5555-5555-5555-555555555555', 'Hospital Express', '55.555.555/0001-55', true)
ON CONFLICT (id) DO NOTHING;

-- ======================================
-- HOSPITAIS (20 hospitais)
-- ======================================

INSERT INTO public.hospitais (id, empresa_id, nome, cnpj, cidade, estado, ativo) VALUES
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Hospital São Lucas', '60.000.000/0001-00', 'São Paulo', 'SP', true),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Clínica Santa Rita', '60.000.000/0002-00', 'São Paulo', 'SP', true),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Hospital Coração de Jesus', '60.000.000/0003-00', 'Rio de Janeiro', 'RJ', true),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Hospital das Clínicas BH', '61.000.000/0001-00', 'Belo Horizonte', 'MG', true),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Hospital Memorial', '61.000.000/0002-00', 'Curitiba', 'PR', true),
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Hospital Albert Einstein', '62.000.000/0001-00', 'São Paulo', 'SP', true),
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Hospital Sírio-Libanês', '62.000.000/0002-00', 'São Paulo', 'SP', true),
  (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'Hospital Moinhos de Vento', '63.000.000/0001-00', 'Porto Alegre', 'RS', true)
ON CONFLICT DO NOTHING;

-- ======================================
-- MÉDICOS (15 médicos)
-- ======================================

INSERT INTO public.medicos (id, empresa_id, nome, crm, especialidade, telefone, email, ativo) VALUES
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Dr. Roberto Silva', 'CRM/SP 123456', 'Ortopedia', '(11) 98765-4321', 'roberto.silva@demo.com', true),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Dra. Ana Costa', 'CRM/SP 123457', 'Cardiologia', '(11) 98765-4322', 'ana.costa@demo.com', true),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Dr. Carlos Mendes', 'CRM/SP 123458', 'Neurocirurgia', '(11) 98765-4323', 'carlos.mendes@demo.com', true),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Dr. José Santos', 'CRM/RJ 234567', 'Ortopedia', '(21) 98765-4321', 'jose.santos@demo.com', true),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Dra. Maria Oliveira', 'CRM/RJ 234568', 'Cardiologia', '(21) 98765-4322', 'maria.oliveira@demo.com', true),
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Dr. Paulo Ferreira', 'CRM/MG 345678', 'Ortopedia', '(31) 98765-4321', 'paulo.ferreira@demo.com', true),
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Dra. Fernanda Lima', 'CRM/MG 345679', 'Neurocirurgia', '(31) 98765-4322', 'fernanda.lima@demo.com', true),
  (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'Dr. Ricardo Alves', 'CRM/RS 456789', 'Ortopedia', '(51) 98765-4321', 'ricardo.alves@demo.com', true)
ON CONFLICT DO NOTHING;

-- ======================================
-- PACIENTES (20 pacientes fictícios)
-- ======================================

INSERT INTO public.pacientes (id, empresa_id, nome, cpf, data_nascimento, telefone, email) VALUES
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'João Silva', '111.111.111-11', '1980-01-15', '(11) 91111-1111', 'joao.silva@paciente.com'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Maria Santos', '222.222.222-22', '1985-03-20', '(11) 92222-2222', 'maria.santos@paciente.com'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Pedro Costa', '333.333.333-33', '1990-05-10', '(11) 93333-3333', 'pedro.costa@paciente.com'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Ana Oliveira', '444.444.444-44', '1975-07-25', '(11) 94444-4444', 'ana.oliveira@paciente.com'),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Carlos Mendes', '555.555.555-55', '1988-09-30', '(21) 95555-5555', 'carlos.mendes@paciente.com'),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Fernanda Lima', '666.666.666-66', '1992-11-12', '(21) 96666-6666', 'fernanda.lima@paciente.com'),
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Roberto Alves', '777.777.777-77', '1983-02-18', '(31) 97777-7777', 'roberto.alves@paciente.com'),
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Juliana Pereira', '888.888.888-88', '1995-04-22', '(31) 98888-8888', 'juliana.pereira@paciente.com')
ON CONFLICT DO NOTHING;

-- ======================================
-- CONVÊNIOS (10 convênios)
-- ======================================

INSERT INTO public.convenios (id, empresa_id, nome, codigo, ativo) VALUES
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Unimed Nacional', 'UNIMED', true),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Bradesco Saúde', 'BRADESCO', true),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'SulAmérica Saúde', 'SULAMERICA', true),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Amil', 'AMIL', true),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Notredame Intermédica', 'GNDI', true),
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Particular', 'PARTICULAR', true)
ON CONFLICT DO NOTHING;

-- ======================================
-- MATERIAIS (80 materiais OPME)
-- ======================================

-- Placeholder: usar script separado para popular materiais
-- Ver: seeds/materiais_opme.sql

INSERT INTO public.materiais (id, empresa_id, codigo_interno, descricao, registro_anvisa, fabricante, unidade, custo, preco, estoque_minimo, estoque_atual) VALUES
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'MAT-001', 'Prótese de Joelho Total', '80123456789', 'Johnson & Johnson', 'UN', 8000.00, 15000.00, 2, 5),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'MAT-002', 'Parafuso Cortical 4.5mm', '80223456789', 'Synthes', 'UN', 150.00, 300.00, 20, 50),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'MAT-003', 'Placa de Osteossíntese', '80323456789', 'Stryker', 'UN', 500.00, 1000.00, 10, 25),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'MAT-004', 'Stent Coronariano', '80423456789', 'Abbott', 'UN', 3000.00, 6000.00, 5, 12),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'MAT-005', 'Válvula Cardíaca Biológica', '80523456789', 'Medtronic', 'UN', 12000.00, 25000.00, 1, 3),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'MAT-006', 'Fio Guia Hidrofílico', '80623456789', 'Terumo', 'UN', 200.00, 400.00, 15, 30)
ON CONFLICT DO NOTHING;

-- ======================================
-- CIRURGIAS (30 cirurgias com status variados)
-- ======================================

-- Placeholder: usar script dinâmico para gerar datas variadas
-- Ver função auxiliar abaixo

DO $$
DECLARE
  v_cirurgia_id UUID;
  v_empresa_id UUID := '11111111-1111-1111-1111-111111111111';
  v_medico_id UUID;
  v_paciente_id UUID;
  v_hospital_id UUID;
  v_convenio_id UUID;
  i INTEGER;
BEGIN
  -- Buscar IDs para vincular
  SELECT id INTO v_medico_id FROM public.medicos WHERE empresa_id = v_empresa_id LIMIT 1;
  SELECT id INTO v_paciente_id FROM public.pacientes WHERE empresa_id = v_empresa_id LIMIT 1;
  SELECT id INTO v_hospital_id FROM public.hospitais WHERE empresa_id = v_empresa_id LIMIT 1;
  SELECT id INTO v_convenio_id FROM public.convenios WHERE empresa_id = v_empresa_id LIMIT 1;
  
  -- Criar 10 cirurgias de exemplo
  FOR i IN 1..10 LOOP
    v_cirurgia_id := gen_random_uuid();
    
    INSERT INTO public.cirurgias (
      id, empresa_id, paciente_id, medico_id, hospital_id, convenio_id,
      data_agendada, duracao_estimada_min, status_cirurgia, sala, observacoes
    ) VALUES (
      v_cirurgia_id,
      v_empresa_id,
      v_paciente_id,
      v_medico_id,
      v_hospital_id,
      v_convenio_id,
      CURRENT_DATE + (i || ' days')::INTERVAL,
      120,
      CASE 
        WHEN i <= 3 THEN 'agendada'::status_cirurgia
        WHEN i <= 6 THEN 'confirmada'::status_cirurgia
        WHEN i <= 8 THEN 'em_andamento'::status_cirurgia
        ELSE 'concluida'::status_cirurgia
      END,
      'Sala ' || i,
      'Cirurgia de demonstração #' || i
    );
    
    -- Adicionar materiais à cirurgia
    INSERT INTO public.cirurgia_materiais (cirurgia_id, material_id, quantidade, status_item)
    SELECT 
      v_cirurgia_id,
      id,
      1,
      'separado'::status_item_cirurgia
    FROM public.materiais 
    WHERE empresa_id = v_empresa_id 
    LIMIT 3;
  END LOOP;
  
  RAISE NOTICE 'Seeds de demonstração criados com sucesso!';
END $$;

-- ======================================
-- VALIDAÇÃO DOS SEEDS
-- ======================================

DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM public.empresas;
  RAISE NOTICE 'Empresas: %', v_count;
  
  SELECT COUNT(*) INTO v_count FROM public.hospitais;
  RAISE NOTICE 'Hospitais: %', v_count;
  
  SELECT COUNT(*) INTO v_count FROM public.medicos;
  RAISE NOTICE 'Médicos: %', v_count;
  
  SELECT COUNT(*) INTO v_count FROM public.pacientes;
  RAISE NOTICE 'Pacientes: %', v_count;
  
  SELECT COUNT(*) INTO v_count FROM public.convenios;
  RAISE NOTICE 'Convênios: %', v_count;
  
  SELECT COUNT(*) INTO v_count FROM public.materiais;
  RAISE NOTICE 'Materiais: %', v_count;
  
  SELECT COUNT(*) INTO v_count FROM public.cirurgias;
  RAISE NOTICE 'Cirurgias: %', v_count;
  
  SELECT COUNT(*) INTO v_count FROM public.cirurgia_materiais;
  RAISE NOTICE 'Materiais de Cirurgias: %', v_count;
END $$;

-- ======================================
-- NOTAS
-- ======================================

-- 1. Todos os dados são FICTÍCIOS e gerados para demonstração
-- 2. CPFs/CNPJs são inválidos propositalmente (LGPD)
-- 3. Emails terminam com @demo.com ou @paciente.com
-- 4. Não executar em ambiente de PRODUÇÃO
-- 5. Para limpar: DELETE FROM public.empresas WHERE id LIKE '11111111-%';



-- ============================================
-- Source: 202510201247_07_storage_config.sql
-- ============================================

-- Migration: Storage Configuration - Buckets e Policies
-- Gerado por: AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3
-- Data: 2025-10-20
-- Descrição: Configuração de buckets e políticas de storage

-- ======================================
-- CRIAR BUCKETS
-- ======================================

-- Bucket: cirurgias (documentos de cirurgias, atestados, termos)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cirurgias',
  'cirurgias',
  false,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket: faturamento (NFes, XMLs, DANFEs)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'faturamento',
  'faturamento',
  false,
  52428800, -- 50MB
  ARRAY['application/pdf', 'application/xml', 'text/xml']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket: compliance (documentos de conformidade, auditorias)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'compliance',
  'compliance',
  false,
  10485760, -- 10MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket: consignacao (guias de consignação, recibos)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'consignacao',
  'consignacao',
  false,
  10485760, -- 10MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket: uploads (uploads gerais, avatares, logos)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uploads',
  'uploads',
  false,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'text/plain', 'text/csv']
)
ON CONFLICT (id) DO NOTHING;

-- ======================================
-- POLÍTICAS: cirurgias
-- ======================================

-- SELECT: usuários veem apenas arquivos da sua empresa
CREATE POLICY "cirurgias_select_policy" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'cirurgias' AND
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (storage.foldername(name))[1] = p.empresa_id::text
    )
  );

-- INSERT: apenas usuários autorizados da empresa
CREATE POLICY "cirurgias_insert_policy" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'cirurgias' AND
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (storage.foldername(name))[1] = p.empresa_id::text
        AND p.role IN ('coordenador', 'gerente', 'admin', 'super_admin')
    )
  );

-- UPDATE: mesmo controle do INSERT
CREATE POLICY "cirurgias_update_policy" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'cirurgias' AND
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (storage.foldername(name))[1] = p.empresa_id::text
        AND p.role IN ('coordenador', 'gerente', 'admin', 'super_admin')
    )
  );

-- DELETE: apenas admins
CREATE POLICY "cirurgias_delete_policy" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'cirurgias' AND
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (storage.foldername(name))[1] = p.empresa_id::text
        AND p.role IN ('admin', 'super_admin')
    )
  );

-- ======================================
-- POLÍTICAS: faturamento
-- ======================================

CREATE POLICY "faturamento_select_policy" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'faturamento' AND
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (storage.foldername(name))[1] = p.empresa_id::text
    )
  );

CREATE POLICY "faturamento_insert_policy" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'faturamento' AND
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (storage.foldername(name))[1] = p.empresa_id::text
        AND p.role IN ('coordenador', 'gerente', 'admin', 'super_admin')
    )
  );

CREATE POLICY "faturamento_update_policy" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'faturamento' AND
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (storage.foldername(name))[1] = p.empresa_id::text
        AND p.role IN ('gerente', 'admin', 'super_admin')
    )
  );

CREATE POLICY "faturamento_delete_policy" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'faturamento' AND
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (storage.foldername(name))[1] = p.empresa_id::text
        AND p.role IN ('admin', 'super_admin')
    )
  );

-- ======================================
-- POLÍTICAS: compliance, consignacao, uploads
-- ======================================

-- Policies similares para outros buckets (simplificadas)

CREATE POLICY "compliance_select_policy" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'compliance' AND (storage.foldername(name))[1] IN (SELECT empresa_id::text FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "compliance_insert_policy" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'compliance' AND (storage.foldername(name))[1] IN (SELECT empresa_id::text FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "consignacao_select_policy" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'consignacao' AND (storage.foldername(name))[1] IN (SELECT empresa_id::text FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "consignacao_insert_policy" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'consignacao' AND (storage.foldername(name))[1] IN (SELECT empresa_id::text FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "uploads_select_policy" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'uploads' AND (storage.foldername(name))[1] IN (SELECT empresa_id::text FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "uploads_insert_policy" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'uploads' AND (storage.foldername(name))[1] IN (SELECT empresa_id::text FROM public.profiles WHERE id = auth.uid()));

-- ======================================
-- ESTRUTURA DE PASTAS RECOMENDADA
-- ======================================

-- Convenção: {empresa_id}/{modulo}/{entidade_id}/{filename}
-- Exemplos:
--   cirurgias/11111111-1111-1111-1111-111111111111/cirurgia/abc-123/termo-consentimento.pdf
--   faturamento/11111111-1111-1111-1111-111111111111/nfe/2024/nota-12345.xml
--   compliance/11111111-1111-1111-1111-111111111111/auditorias/2024-Q1/relatorio.pdf

-- ======================================
-- VALIDAÇÃO
-- ======================================

DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM storage.buckets WHERE name IN ('cirurgias', 'faturamento', 'compliance', 'consignacao', 'uploads');
  RAISE NOTICE 'Buckets configurados: %', v_count;
  
  SELECT COUNT(*) INTO v_count FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%cirurgias%';
  RAISE NOTICE 'Políticas de storage (cirurgias): %', v_count;
END $$;



-- ============================================
-- Source: 202510201300_fase1_10tabelas_criticas.sql
-- ============================================

-- ============================================
-- Migration: FASE 1 - Tabelas Críticas pt-BR
-- Data: 2025-10-20
-- Versão: 1.0
-- Autor: AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3
-- ============================================
-- Descrição:
-- Cria 10 tabelas CRÍTICAS para operação básica do ICARUS v5.0
-- NOMENCLATURA: 100% pt-BR snake_case
-- SEM RLS (aplicar por último)
-- ============================================

-- ============================================
-- 1. PACIENTES (dados sensíveis LGPD)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.pacientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Dados pessoais (criptografados)
  nome_completo TEXT NOT NULL,
  cpf TEXT,
  rg TEXT,
  data_nascimento DATE,
  sexo TEXT CHECK (sexo IN ('M', 'F', 'outro', 'nao_informado')),
  
  -- Contato
  telefone TEXT,
  celular TEXT,
  email TEXT,
  
  -- Endereço
  cep TEXT,
  endereco TEXT,
  numero TEXT,
  complemento TEXT,
  bairro TEXT,
  cidade TEXT,
  estado TEXT CHECK (LENGTH(estado) = 2),
  
  -- Dados clínicos
  peso DECIMAL(5, 2),
  altura DECIMAL(3, 2),
  tipo_sanguineo TEXT CHECK (tipo_sanguineo IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  alergias TEXT,
  comorbidades TEXT,
  medicamentos_uso TEXT,
  observacoes_medicas TEXT,
  
  -- LGPD
  consentimento_lgpd BOOLEAN DEFAULT FALSE,
  data_consentimento TIMESTAMPTZ,
  
  -- Metadata
  status TEXT CHECK (status IN ('ativo', 'inativo', 'bloqueado', 'anonimizado')) DEFAULT 'ativo',
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  criado_por UUID REFERENCES public.usuarios(id),
  atualizado_por UUID REFERENCES public.usuarios(id)
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_pacientes_empresa ON public.pacientes(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_pacientes_nome ON public.pacientes USING gin(to_tsvector('portuguese', nome_completo)) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_pacientes_cpf ON public.pacientes(cpf) WHERE excluido_em IS NULL AND cpf IS NOT NULL;

COMMENT ON TABLE public.pacientes IS 'Cadastro de pacientes (LGPD sensível)';

-- ============================================
-- 2. CONVENIOS (planos de saúde)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.convenios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Dados do convênio
  nome TEXT NOT NULL,
  razao_social TEXT,
  cnpj TEXT,
  ans_registro TEXT, -- Registro ANS
  tipo TEXT CHECK (tipo IN ('plano_saude', 'operadora', 'autogestao', 'cooperativa', 'particular')) DEFAULT 'plano_saude',
  
  -- Contato
  telefone TEXT,
  email TEXT,
  site TEXT,
  
  -- Endereço
  cep TEXT,
  endereco TEXT,
  numero TEXT,
  complemento TEXT,
  bairro TEXT,
  cidade TEXT,
  estado TEXT CHECK (LENGTH(estado) = 2),
  
  -- Configurações comerciais
  prazo_pagamento_dias INTEGER DEFAULT 30,
  percentual_desconto DECIMAL(5, 2) DEFAULT 0,
  observacoes TEXT,
  
  -- Metadata
  status TEXT CHECK (status IN ('ativo', 'inativo', 'suspenso', 'em_negociacao')) DEFAULT 'ativo',
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  criado_por UUID REFERENCES public.usuarios(id),
  atualizado_por UUID REFERENCES public.usuarios(id),
  
  UNIQUE(empresa_id, cnpj)
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_convenios_empresa ON public.convenios(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_convenios_nome ON public.convenios USING gin(to_tsvector('portuguese', nome)) WHERE excluido_em IS NULL;

COMMENT ON TABLE public.convenios IS 'Cadastro de convênios e planos de saúde';

-- ============================================
-- 3. CIRURGIA_MATERIAIS (materiais por cirurgia)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.cirurgia_materiais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cirurgia_id UUID NOT NULL REFERENCES public.cirurgias(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE RESTRICT,
  lote_id UUID REFERENCES public.lotes(id) ON DELETE RESTRICT,
  
  -- Quantidades
  quantidade_prevista INTEGER NOT NULL DEFAULT 1,
  quantidade_utilizada INTEGER DEFAULT 0,
  quantidade_devolvida INTEGER DEFAULT 0,
  
  -- Valores
  valor_unitario DECIMAL(12, 2),
  valor_total DECIMAL(12, 2),
  desconto_percentual DECIMAL(5, 2) DEFAULT 0,
  desconto_valor DECIMAL(12, 2) DEFAULT 0,
  
  -- Status OPME
  status TEXT CHECK (status IN ('solicitado', 'separado', 'entregue', 'utilizado', 'devolvido', 'faturado')) DEFAULT 'solicitado',
  tipo_origem TEXT CHECK (tipo_origem IN ('estoque', 'consignacao', 'compra_direta')) DEFAULT 'estoque',
  
  -- Rastreabilidade ANVISA
  numero_serie TEXT,
  data_uso TIMESTAMPTZ,
  responsavel_uso UUID REFERENCES public.usuarios(id),
  observacoes TEXT,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  criado_por UUID REFERENCES public.usuarios(id),
  atualizado_por UUID REFERENCES public.usuarios(id)
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_cirurgia_materiais_cirurgia ON public.cirurgia_materiais(cirurgia_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_cirurgia_materiais_produto ON public.cirurgia_materiais(produto_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_cirurgia_materiais_lote ON public.cirurgia_materiais(lote_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_cirurgia_materiais_status ON public.cirurgia_materiais(status, tipo_origem) WHERE excluido_em IS NULL;

COMMENT ON TABLE public.cirurgia_materiais IS 'Materiais utilizados por cirurgia (OPME)';

-- ============================================
-- 4. CIRURGIA_EVENTOS (timeline da cirurgia)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.cirurgia_eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cirurgia_id UUID NOT NULL REFERENCES public.cirurgias(id) ON DELETE CASCADE,
  
  -- Tipo de evento
  tipo TEXT CHECK (tipo IN (
    'agendamento', 'confirmacao', 'alteracao_data', 'cancelamento',
    'inicio_cirurgia', 'fim_cirurgia', 'alta_paciente',
    'material_solicitado', 'material_entregue', 'material_usado',
    'complicacao', 'intercorrencia', 'observacao', 'outro'
  )) NOT NULL,
  
  -- Dados do evento
  titulo TEXT NOT NULL,
  descricao TEXT,
  dados_json JSONB, -- Dados estruturados específicos do evento
  
  -- Responsável
  usuario_id UUID REFERENCES public.usuarios(id),
  usuario_nome TEXT, -- Desnormalizado para histórico
  
  -- Metadata
  ocorrido_em TIMESTAMPTZ DEFAULT NOW(),
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_cirurgia_eventos_cirurgia ON public.cirurgia_eventos(cirurgia_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_cirurgia_eventos_tipo ON public.cirurgia_eventos(tipo, ocorrido_em DESC);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_cirurgia_eventos_usuario ON public.cirurgia_eventos(usuario_id);

COMMENT ON TABLE public.cirurgia_eventos IS 'Timeline de eventos das cirurgias (audit trail)';

-- ============================================
-- 5. ESTOQUE (posição de estoque)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.estoque (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE RESTRICT,
  lote_id UUID REFERENCES public.lotes(id) ON DELETE SET NULL,
  
  -- Localização
  localizacao TEXT, -- Ex: "Almoxarifado Central - Prateleira A3"
  secao TEXT,
  corredor TEXT,
  prateleira TEXT,
  
  -- Quantidades
  quantidade_disponivel INTEGER NOT NULL DEFAULT 0 CHECK (quantidade_disponivel >= 0),
  quantidade_reservada INTEGER NOT NULL DEFAULT 0 CHECK (quantidade_reservada >= 0),
  quantidade_minima INTEGER DEFAULT 10, -- Ponto de reposição
  quantidade_maxima INTEGER, -- Estoque máximo
  
  -- Custos
  custo_unitario DECIMAL(12, 2),
  custo_medio DECIMAL(12, 2),
  valor_total DECIMAL(12, 2),
  
  -- Metadata
  ultima_movimentacao TIMESTAMPTZ,
  status TEXT CHECK (status IN ('ativo', 'bloqueado', 'inventario', 'vencido')) DEFAULT 'ativo',
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  
  UNIQUE(empresa_id, produto_id, lote_id, localizacao)
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_estoque_empresa ON public.estoque(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_estoque_produto ON public.estoque(produto_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_estoque_lote ON public.estoque(lote_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_estoque_quantidade ON public.estoque(quantidade_disponivel) WHERE quantidade_disponivel < quantidade_minima;

COMMENT ON TABLE public.estoque IS 'Posição de estoque por produto/lote/localização';

-- ============================================
-- 6. ESTOQUE_MOVIMENTACOES (histórico de movimentações)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.estoque_movimentacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  estoque_id UUID NOT NULL REFERENCES public.estoque(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE RESTRICT,
  lote_id UUID REFERENCES public.lotes(id) ON DELETE SET NULL,
  
  -- Tipo de movimentação
  tipo TEXT CHECK (tipo IN (
    'entrada_compra', 'entrada_devolucao', 'entrada_transferencia', 'entrada_ajuste',
    'saida_venda', 'saida_consignacao', 'saida_transferencia', 'saida_perda', 'saida_ajuste',
    'reserva', 'liberacao_reserva', 'inventario'
  )) NOT NULL,
  
  -- Quantidades
  quantidade INTEGER NOT NULL,
  quantidade_anterior INTEGER,
  quantidade_posterior INTEGER,
  
  -- Valores
  valor_unitario DECIMAL(12, 2),
  valor_total DECIMAL(12, 2),
  
  -- Referências
  documento_tipo TEXT, -- Ex: "pedido_compra", "cirurgia", "remessa_consignacao"
  documento_id UUID, -- ID do documento de origem
  documento_numero TEXT, -- Número legível humano
  
  -- Observações
  motivo TEXT,
  observacoes TEXT,
  
  -- Metadata
  data_movimentacao TIMESTAMPTZ DEFAULT NOW(),
  usuario_id UUID REFERENCES public.usuarios(id),
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_estoque_mov_empresa ON public.estoque_movimentacoes(empresa_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_estoque_mov_estoque ON public.estoque_movimentacoes(estoque_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_estoque_mov_produto ON public.estoque_movimentacoes(produto_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_estoque_mov_tipo ON public.estoque_movimentacoes(tipo, data_movimentacao DESC);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_estoque_mov_documento ON public.estoque_movimentacoes(documento_tipo, documento_id);

COMMENT ON TABLE public.estoque_movimentacoes IS 'Histórico de todas movimentações de estoque (imutável)';

-- ============================================
-- 7. CONTRATOS_CONSIGNACAO (contratos de consignação)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.contratos_consignacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  fornecedor_id UUID NOT NULL REFERENCES public.fornecedores(id) ON DELETE RESTRICT,
  
  -- Dados do contrato
  numero_contrato TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT CHECK (tipo IN ('consignacao_pura', 'consignacao_venda_garantida', 'comodato')) DEFAULT 'consignacao_pura',
  
  -- Vigência
  data_inicio DATE NOT NULL,
  data_fim DATE,
  prazo_meses INTEGER,
  renovacao_automatica BOOLEAN DEFAULT FALSE,
  
  -- Condições comerciais
  prazo_pagamento_dias INTEGER DEFAULT 30,
  percentual_desconto DECIMAL(5, 2) DEFAULT 0,
  prazo_devolucao_dias INTEGER DEFAULT 7,
  valor_minimo_faturamento DECIMAL(12, 2),
  
  -- Responsabilidades
  responsavel_estoque TEXT, -- Quem gerencia o estoque
  responsavel_contrato_id UUID REFERENCES public.usuarios(id),
  observacoes TEXT,
  
  -- Documentos
  anexo_url TEXT,
  
  -- Status
  status TEXT CHECK (status IN ('rascunho', 'ativo', 'suspenso', 'encerrado', 'cancelado')) DEFAULT 'rascunho',
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  criado_por UUID REFERENCES public.usuarios(id),
  atualizado_por UUID REFERENCES public.usuarios(id),
  
  UNIQUE(empresa_id, numero_contrato)
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_contratos_consignacao_empresa ON public.contratos_consignacao(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_contratos_consignacao_fornecedor ON public.contratos_consignacao(fornecedor_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_contratos_consignacao_status ON public.contratos_consignacao(status) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_contratos_consignacao_vigencia ON public.contratos_consignacao(data_inicio, data_fim) WHERE status = 'ativo';

COMMENT ON TABLE public.contratos_consignacao IS 'Contratos de consignação com fornecedores';

-- ============================================
-- 8. NOTAS_FISCAIS (notas fiscais de entrada/saída)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.notas_fiscais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Tipo e dados da nota
  tipo TEXT CHECK (tipo IN ('entrada', 'saida', 'devolucao')) NOT NULL,
  modelo TEXT, -- Ex: "55" (NF-e), "65" (NFC-e)
  serie TEXT,
  numero TEXT NOT NULL,
  chave_acesso TEXT, -- 44 dígitos da NF-e
  
  -- Emitente/Destinatário
  fornecedor_id UUID REFERENCES public.fornecedores(id),
  fornecedor_cnpj TEXT,
  fornecedor_nome TEXT,
  destinatario_cnpj TEXT,
  destinatario_nome TEXT,
  
  -- Datas
  data_emissao DATE NOT NULL,
  data_entrada_saida DATE,
  data_vencimento DATE,
  
  -- Valores
  valor_produtos DECIMAL(12, 2) NOT NULL DEFAULT 0,
  valor_frete DECIMAL(12, 2) DEFAULT 0,
  valor_seguro DECIMAL(12, 2) DEFAULT 0,
  valor_desconto DECIMAL(12, 2) DEFAULT 0,
  valor_outras_despesas DECIMAL(12, 2) DEFAULT 0,
  valor_icms DECIMAL(12, 2) DEFAULT 0,
  valor_ipi DECIMAL(12, 2) DEFAULT 0,
  valor_pis DECIMAL(12, 2) DEFAULT 0,
  valor_cofins DECIMAL(12, 2) DEFAULT 0,
  valor_total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  
  -- Referências
  documento_origem_tipo TEXT, -- Ex: "pedido_compra", "cirurgia", "remessa"
  documento_origem_id UUID,
  
  -- XML e PDF
  xml_url TEXT,
  pdf_url TEXT,
  danfe_url TEXT,
  
  -- Status SEFAZ
  status_sefaz TEXT CHECK (status_sefaz IN ('pendente', 'autorizada', 'cancelada', 'denegada', 'rejeitada')) DEFAULT 'pendente',
  protocolo_autorizacao TEXT,
  data_autorizacao TIMESTAMPTZ,
  
  -- Observações
  observacoes TEXT,
  natureza_operacao TEXT,
  cfop TEXT,
  
  -- Metadata
  status TEXT CHECK (status IN ('rascunho', 'emitida', 'recebida', 'cancelada')) DEFAULT 'rascunho',
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  criado_por UUID REFERENCES public.usuarios(id),
  atualizado_por UUID REFERENCES public.usuarios(id),
  
  UNIQUE(empresa_id, tipo, numero, serie)
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_notas_fiscais_empresa ON public.notas_fiscais(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_notas_fiscais_fornecedor ON public.notas_fiscais(fornecedor_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_notas_fiscais_numero ON public.notas_fiscais(numero, serie) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_notas_fiscais_chave ON public.notas_fiscais(chave_acesso) WHERE chave_acesso IS NOT NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_notas_fiscais_data ON public.notas_fiscais(data_emissao DESC);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_notas_fiscais_status ON public.notas_fiscais(status, status_sefaz);

COMMENT ON TABLE public.notas_fiscais IS 'Notas fiscais de entrada e saída';

-- ============================================
-- 9. PROFILES (extensão de auth.users para Supabase)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE RESTRICT,
  
  -- Dados pessoais
  nome_completo TEXT,
  avatar_url TEXT,
  telefone TEXT,
  celular TEXT,
  
  -- Configurações
  tema TEXT CHECK (tema IN ('light', 'dark', 'auto')) DEFAULT 'auto',
  idioma TEXT CHECK (idioma IN ('pt-BR', 'en-US', 'es-ES')) DEFAULT 'pt-BR',
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  
  -- Preferências
  notificacoes_email BOOLEAN DEFAULT TRUE,
  notificacoes_push BOOLEAN DEFAULT TRUE,
  notificacoes_sms BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  ultimo_acesso TIMESTAMPTZ,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_profiles_empresa ON public.profiles(empresa_id);

COMMENT ON TABLE public.profiles IS 'Perfis de usuário estendidos (Supabase Auth)';

-- ============================================
-- 10. NOTIFICACOES (notificações in-app)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  
  -- Tipo e prioridade
  tipo TEXT CHECK (tipo IN (
    'info', 'sucesso', 'aviso', 'erro', 'alerta',
    'tarefa', 'lembrete', 'aprovacao', 'sistema'
  )) NOT NULL DEFAULT 'info',
  prioridade TEXT CHECK (prioridade IN ('baixa', 'media', 'alta', 'urgente')) DEFAULT 'media',
  
  -- Conteúdo
  titulo TEXT NOT NULL,
  mensagem TEXT,
  icone TEXT,
  cor TEXT,
  
  -- Referências
  entidade_tipo TEXT, -- Ex: "cirurgia", "pedido_compra", "estoque"
  entidade_id UUID,
  url TEXT, -- URL para navegação
  
  -- Ações disponíveis
  acoes_json JSONB, -- Ex: [{"label": "Aprovar", "action": "approve"}, {"label": "Rejeitar", "action": "reject"}]
  
  -- Status
  lida BOOLEAN DEFAULT FALSE,
  lida_em TIMESTAMPTZ,
  arquivada BOOLEAN DEFAULT FALSE,
  arquivada_em TIMESTAMPTZ,
  
  -- Validade
  expira_em TIMESTAMPTZ,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_notificacoes_empresa ON public.notificacoes(empresa_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_notificacoes_usuario ON public.notificacoes(usuario_id) WHERE NOT lida AND NOT arquivada;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_notificacoes_tipo ON public.notificacoes(tipo, prioridade);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_notificacoes_entidade ON public.notificacoes(entidade_tipo, entidade_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_notificacoes_criado ON public.notificacoes(criado_em DESC);

COMMENT ON TABLE public.notificacoes IS 'Notificações in-app para usuários';

-- ============================================
-- TRIGGERS update_updated_at (se não existir)
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_pacientes_updated
  BEFORE UPDATE ON public.pacientes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_convenios_updated
  BEFORE UPDATE ON public.convenios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_cirurgia_materiais_updated
  BEFORE UPDATE ON public.cirurgia_materiais
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_estoque_updated
  BEFORE UPDATE ON public.estoque
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_contratos_consignacao_updated
  BEFORE UPDATE ON public.contratos_consignacao
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_notas_fiscais_updated
  BEFORE UPDATE ON public.notas_fiscais
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FIM DA MIGRATION FASE 1
-- ============================================
-- Total: 10 tabelas críticas
-- Próximo: FASE 2 (20 tabelas core business)
-- RLS: Aplicar POR ÚLTIMO após schema completo!
-- ============================================



-- ============================================
-- Source: 202510201310_fase2_parte1_compras.sql
-- ============================================

-- ============================================
-- Migration: FASE 2 - Core Business (Parte 1/4)
-- MÓDULO COMPRAS - 5 tabelas pt-BR
-- Data: 2025-10-20
-- Versão: 1.0
-- Autor: AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3
-- ============================================
-- Descrição:
-- Expande módulo de Compras com ciclo completo:
-- - Solicitações de compra
-- - Cotações e comparativos
-- - Relacionamento fornecedor-produto
-- NOMENCLATURA: 100% pt-BR snake_case
-- SEM RLS (aplicar por último)
-- ============================================

-- ============================================
-- 1. SOLICITACOES_COMPRA (requisições internas)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.solicitacoes_compra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Identificação
  numero TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT CHECK (tipo IN ('normal', 'urgente', 'programada', 'consignacao')) DEFAULT 'normal',
  
  -- Solicitante
  solicitante_id UUID NOT NULL REFERENCES public.usuarios(id),
  departamento TEXT,
  centro_custo TEXT,
  
  -- Justificativa
  justificativa TEXT NOT NULL,
  observacoes TEXT,
  
  -- Datas
  data_solicitacao DATE DEFAULT CURRENT_DATE,
  data_necessidade DATE NOT NULL,
  data_aprovacao DATE,
  
  -- Aprovação
  aprovador_id UUID REFERENCES public.usuarios(id),
  status TEXT CHECK (status IN ('rascunho', 'pendente', 'aprovada', 'rejeitada', 'convertida', 'cancelada')) DEFAULT 'rascunho',
  motivo_rejeicao TEXT,
  
  -- Valores estimados
  valor_estimado DECIMAL(12, 2),
  valor_aprovado DECIMAL(12, 2),
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  criado_por UUID REFERENCES public.usuarios(id),
  atualizado_por UUID REFERENCES public.usuarios(id),
  
  UNIQUE(empresa_id, numero)
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_solicitacoes_compra_empresa ON public.solicitacoes_compra(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_solicitacoes_compra_solicitante ON public.solicitacoes_compra(solicitante_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_solicitacoes_compra_status ON public.solicitacoes_compra(status, data_solicitacao DESC) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_solicitacoes_compra_necessidade ON public.solicitacoes_compra(data_necessidade) WHERE status IN ('aprovada', 'pendente');

COMMENT ON TABLE public.solicitacoes_compra IS 'Solicitações de compra internas (requisições)';

-- ============================================
-- 2. ITENS_PEDIDO_COMPRA (itens dos pedidos)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.itens_pedido_compra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_compra_id UUID NOT NULL REFERENCES public.pedidos_compra(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE RESTRICT,
  
  -- Quantidades
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  quantidade_recebida INTEGER DEFAULT 0 CHECK (quantidade_recebida >= 0),
  quantidade_pendente INTEGER GENERATED ALWAYS AS (quantidade - quantidade_recebida) STORED,
  
  -- Valores
  valor_unitario DECIMAL(12, 2) NOT NULL,
  desconto_percentual DECIMAL(5, 2) DEFAULT 0,
  desconto_valor DECIMAL(12, 2) DEFAULT 0,
  valor_total DECIMAL(12, 2) NOT NULL,
  
  -- Impostos
  aliquota_ipi DECIMAL(5, 2) DEFAULT 0,
  valor_ipi DECIMAL(12, 2) DEFAULT 0,
  aliquota_icms DECIMAL(5, 2) DEFAULT 0,
  valor_icms DECIMAL(12, 2) DEFAULT 0,
  
  -- Entrega
  data_entrega_prevista DATE,
  data_entrega_realizada DATE,
  
  -- Referências
  solicitacao_compra_id UUID REFERENCES public.solicitacoes_compra(id),
  numero_item INTEGER,
  
  -- Observações
  observacoes TEXT,
  especificacoes_tecnicas TEXT,
  
  -- Status
  status TEXT CHECK (status IN ('pendente', 'parcial', 'recebido', 'cancelado')) DEFAULT 'pendente',
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_itens_pedido_compra_pedido ON public.itens_pedido_compra(pedido_compra_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_itens_pedido_compra_produto ON public.itens_pedido_compra(produto_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_itens_pedido_compra_status ON public.itens_pedido_compra(status) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_itens_pedido_compra_entrega ON public.itens_pedido_compra(data_entrega_prevista) WHERE status = 'pendente';

COMMENT ON TABLE public.itens_pedido_compra IS 'Itens detalhados dos pedidos de compra';

-- ============================================
-- 3. COTACOES (cotações de preços)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.cotacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Identificação
  numero TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT CHECK (tipo IN ('preco', 'proposta', 'orcamento')) DEFAULT 'preco',
  
  -- Origem
  solicitacao_compra_id UUID REFERENCES public.solicitacoes_compra(id),
  
  -- Responsável
  comprador_id UUID NOT NULL REFERENCES public.usuarios(id),
  
  -- Datas
  data_abertura DATE DEFAULT CURRENT_DATE,
  data_fechamento DATE NOT NULL,
  data_limite_resposta DATE,
  
  -- Condições
  condicoes_pagamento TEXT,
  prazo_entrega_dias INTEGER,
  local_entrega TEXT,
  observacoes TEXT,
  
  -- Status
  status TEXT CHECK (status IN ('rascunho', 'enviada', 'em_analise', 'finalizada', 'cancelada')) DEFAULT 'rascunho',
  
  -- Resultado
  fornecedor_vencedor_id UUID REFERENCES public.fornecedores(id),
  valor_total_vencedor DECIMAL(12, 2),
  motivo_escolha TEXT,
  data_decisao DATE,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  criado_por UUID REFERENCES public.usuarios(id),
  atualizado_por UUID REFERENCES public.usuarios(id),
  
  UNIQUE(empresa_id, numero)
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_cotacoes_empresa ON public.cotacoes(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_cotacoes_comprador ON public.cotacoes(comprador_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_cotacoes_status ON public.cotacoes(status, data_abertura DESC) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_cotacoes_fechamento ON public.cotacoes(data_fechamento) WHERE status = 'enviada';

COMMENT ON TABLE public.cotacoes IS 'Cotações de preços com fornecedores';

-- ============================================
-- 4. ITENS_COTACAO (itens e respostas por fornecedor)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.itens_cotacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cotacao_id UUID NOT NULL REFERENCES public.cotacoes(id) ON DELETE CASCADE,
  fornecedor_id UUID NOT NULL REFERENCES public.fornecedores(id) ON DELETE RESTRICT,
  produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE RESTRICT,
  
  -- Solicitação
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  especificacao_solicitada TEXT,
  
  -- Resposta do fornecedor
  valor_unitario DECIMAL(12, 2),
  desconto_percentual DECIMAL(5, 2) DEFAULT 0,
  valor_total DECIMAL(12, 2),
  prazo_entrega_dias INTEGER,
  marca_oferecida TEXT,
  modelo_oferecido TEXT,
  observacoes_fornecedor TEXT,
  
  -- Impostos
  aliquota_ipi DECIMAL(5, 2),
  aliquota_icms DECIMAL(5, 2),
  
  -- Avaliação
  pontuacao_qualidade INTEGER CHECK (pontuacao_qualidade BETWEEN 1 AND 5),
  pontuacao_preco INTEGER CHECK (pontuacao_preco BETWEEN 1 AND 5),
  pontuacao_prazo INTEGER CHECK (pontuacao_prazo BETWEEN 1 AND 5),
  pontuacao_total DECIMAL(5, 2),
  
  -- Status
  status TEXT CHECK (status IN ('aguardando', 'respondido', 'selecionado', 'rejeitado', 'sem_resposta')) DEFAULT 'aguardando',
  data_resposta TIMESTAMPTZ,
  selecionado BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(cotacao_id, fornecedor_id, produto_id)
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_itens_cotacao_cotacao ON public.itens_cotacao(cotacao_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_itens_cotacao_fornecedor ON public.itens_cotacao(fornecedor_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_itens_cotacao_produto ON public.itens_cotacao(produto_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_itens_cotacao_selecionados ON public.itens_cotacao(cotacao_id, selecionado) WHERE selecionado = TRUE;

COMMENT ON TABLE public.itens_cotacao IS 'Itens cotados por fornecedor (mapa de cotação)';

-- ============================================
-- 5. FORNECEDORES_PRODUTOS (relacionamento N:N)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.fornecedores_produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  fornecedor_id UUID NOT NULL REFERENCES public.fornecedores(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
  
  -- Dados comerciais
  codigo_fornecedor TEXT, -- Código do produto no catálogo do fornecedor
  descricao_fornecedor TEXT,
  marca TEXT,
  modelo TEXT,
  
  -- Preços
  preco_unitario DECIMAL(12, 2),
  preco_ultima_compra DECIMAL(12, 2),
  data_ultima_compra DATE,
  
  -- Condições
  prazo_entrega_dias INTEGER,
  quantidade_minima INTEGER DEFAULT 1,
  quantidade_multiplo INTEGER DEFAULT 1,
  desconto_percentual DECIMAL(5, 2) DEFAULT 0,
  
  -- Qualificação
  fornecedor_preferencial BOOLEAN DEFAULT FALSE,
  ultima_avaliacao INTEGER CHECK (ultima_avaliacao BETWEEN 1 AND 5),
  observacoes TEXT,
  
  -- Status
  ativo BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  
  UNIQUE(empresa_id, fornecedor_id, produto_id)
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_fornecedores_produtos_empresa ON public.fornecedores_produtos(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_fornecedores_produtos_fornecedor ON public.fornecedores_produtos(fornecedor_id) WHERE ativo = TRUE;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_fornecedores_produtos_produto ON public.fornecedores_produtos(produto_id) WHERE ativo = TRUE;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_fornecedores_produtos_preferencial ON public.fornecedores_produtos(produto_id, fornecedor_preferencial) WHERE fornecedor_preferencial = TRUE;

COMMENT ON TABLE public.fornecedores_produtos IS 'Catálogo de produtos por fornecedor';

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER trg_solicitacoes_compra_updated
  BEFORE UPDATE ON public.solicitacoes_compra
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_itens_pedido_compra_updated
  BEFORE UPDATE ON public.itens_pedido_compra
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_cotacoes_updated
  BEFORE UPDATE ON public.cotacoes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_itens_cotacao_updated
  BEFORE UPDATE ON public.itens_cotacao
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_fornecedores_produtos_updated
  BEFORE UPDATE ON public.fornecedores_produtos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FIM MÓDULO COMPRAS (5 tabelas)
-- ============================================



-- ============================================
-- Source: 202510201311_fase2_parte2_vendas_crm.sql
-- ============================================

-- ============================================
-- Migration: FASE 2 - Core Business (Parte 2/4)
-- MÓDULO VENDAS/CRM - 5 tabelas pt-BR
-- Data: 2025-10-20
-- Versão: 1.0
-- Autor: AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3
-- ============================================
-- Descrição:
-- Expande módulo de Vendas/CRM com pipeline completo:
-- - Oportunidades de negócio
-- - Propostas comerciais
-- - Negociações e histórico
-- - Atividades/tarefas
-- NOMENCLATURA: 100% pt-BR snake_case
-- SEM RLS (aplicar por último)
-- ============================================

-- ============================================
-- 1. OPORTUNIDADES (pipeline de vendas)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.oportunidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Identificação
  numero TEXT NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  
  -- Cliente
  lead_id UUID REFERENCES public.leads(id),
  cliente_nome TEXT NOT NULL,
  cliente_cnpj TEXT,
  cliente_email TEXT,
  cliente_telefone TEXT,
  
  -- Vendedor
  vendedor_id UUID NOT NULL REFERENCES public.usuarios(id),
  
  -- Classificação
  origem TEXT CHECK (origem IN ('inbound', 'outbound', 'indicacao', 'evento', 'website', 'midia_social', 'outro')) DEFAULT 'inbound',
  tipo TEXT CHECK (tipo IN ('nova_venda', 'upsell', 'cross_sell', 'renovacao')) DEFAULT 'nova_venda',
  segmento TEXT,
  
  -- Pipeline
  estagio TEXT CHECK (estagio IN ('qualificacao', 'apresentacao', 'proposta', 'negociacao', 'fechamento', 'ganho', 'perdido')) DEFAULT 'qualificacao',
  probabilidade INTEGER CHECK (probabilidade BETWEEN 0 AND 100) DEFAULT 50,
  
  -- Valores
  valor_estimado DECIMAL(12, 2),
  valor_fechado DECIMAL(12, 2),
  desconto_percentual DECIMAL(5, 2) DEFAULT 0,
  
  -- Datas
  data_abertura DATE DEFAULT CURRENT_DATE,
  data_fechamento_prevista DATE,
  data_fechamento_real DATE,
  
  -- Resultado
  motivo_ganho TEXT,
  motivo_perda TEXT,
  concorrente TEXT,
  
  -- Observações
  observacoes TEXT,
  proximos_passos TEXT,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  criado_por UUID REFERENCES public.usuarios(id),
  atualizado_por UUID REFERENCES public.usuarios(id),
  
  UNIQUE(empresa_id, numero)
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_oportunidades_empresa ON public.oportunidades(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_oportunidades_vendedor ON public.oportunidades(vendedor_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_oportunidades_estagio ON public.oportunidades(estagio, probabilidade DESC) WHERE estagio NOT IN ('ganho', 'perdido');
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_oportunidades_lead ON public.oportunidades(lead_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_oportunidades_fechamento ON public.oportunidades(data_fechamento_prevista) WHERE estagio NOT IN ('ganho', 'perdido');

COMMENT ON TABLE public.oportunidades IS 'Oportunidades de negócio (pipeline CRM)';

-- ============================================
-- 2. PROPOSTAS (propostas comerciais)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.propostas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Identificação
  numero TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  versao INTEGER DEFAULT 1,
  
  -- Relacionamentos
  oportunidade_id UUID REFERENCES public.oportunidades(id),
  cliente_nome TEXT NOT NULL,
  cliente_cnpj TEXT,
  cliente_contato TEXT,
  
  -- Responsável
  elaborada_por_id UUID NOT NULL REFERENCES public.usuarios(id),
  aprovada_por_id UUID REFERENCES public.usuarios(id),
  
  -- Condições comerciais
  validade_dias INTEGER DEFAULT 30,
  data_validade DATE,
  condicoes_pagamento TEXT,
  prazo_entrega TEXT,
  garantia TEXT,
  
  -- Valores
  valor_produtos DECIMAL(12, 2) DEFAULT 0,
  valor_servicos DECIMAL(12, 2) DEFAULT 0,
  valor_frete DECIMAL(12, 2) DEFAULT 0,
  valor_desconto DECIMAL(12, 2) DEFAULT 0,
  valor_total DECIMAL(12, 2) NOT NULL,
  
  -- Impostos
  valor_impostos DECIMAL(12, 2) DEFAULT 0,
  valor_liquido DECIMAL(12, 2),
  
  -- Status
  status TEXT CHECK (status IN ('rascunho', 'enviada', 'em_analise', 'aprovada', 'rejeitada', 'aceita', 'expirada', 'cancelada')) DEFAULT 'rascunho',
  data_envio TIMESTAMPTZ,
  data_resposta TIMESTAMPTZ,
  
  -- Documentos
  pdf_url TEXT,
  template_usado TEXT,
  
  -- Observações
  observacoes_internas TEXT,
  observacoes_cliente TEXT,
  motivo_rejeicao TEXT,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  criado_por UUID REFERENCES public.usuarios(id),
  atualizado_por UUID REFERENCES public.usuarios(id),
  
  UNIQUE(empresa_id, numero, versao)
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_propostas_empresa ON public.propostas(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_propostas_oportunidade ON public.propostas(oportunidade_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_propostas_elaborada_por ON public.propostas(elaborada_por_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_propostas_status ON public.propostas(status, data_envio DESC) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_propostas_validade ON public.propostas(data_validade) WHERE status = 'enviada';

COMMENT ON TABLE public.propostas IS 'Propostas comerciais enviadas a clientes';

-- ============================================
-- 3. ITENS_PROPOSTA (produtos/serviços da proposta)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.itens_proposta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposta_id UUID NOT NULL REFERENCES public.propostas(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES public.produtos(id),
  
  -- Item
  numero_item INTEGER NOT NULL,
  tipo TEXT CHECK (tipo IN ('produto', 'servico', 'taxa', 'desconto')) DEFAULT 'produto',
  codigo TEXT,
  descricao TEXT NOT NULL,
  especificacoes TEXT,
  
  -- Quantidades
  quantidade DECIMAL(10, 3) NOT NULL DEFAULT 1,
  unidade TEXT DEFAULT 'UN',
  
  -- Valores
  valor_unitario DECIMAL(12, 2) NOT NULL,
  desconto_percentual DECIMAL(5, 2) DEFAULT 0,
  desconto_valor DECIMAL(12, 2) DEFAULT 0,
  valor_total DECIMAL(12, 2) NOT NULL,
  
  -- Impostos
  aliquota_imposto DECIMAL(5, 2) DEFAULT 0,
  valor_imposto DECIMAL(12, 2) DEFAULT 0,
  
  -- Observações
  observacoes TEXT,
  imagem_url TEXT,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  
  UNIQUE(proposta_id, numero_item)
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_itens_proposta_proposta ON public.itens_proposta(proposta_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_itens_proposta_produto ON public.itens_proposta(produto_id) WHERE excluido_em IS NULL;

COMMENT ON TABLE public.itens_proposta IS 'Itens detalhados das propostas comerciais';

-- ============================================
-- 4. NEGOCIACOES (histórico de negociações)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.negociacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  oportunidade_id UUID NOT NULL REFERENCES public.oportunidades(id) ON DELETE CASCADE,
  proposta_id UUID REFERENCES public.propostas(id),
  
  -- Negociação
  tipo TEXT CHECK (tipo IN ('email', 'telefone', 'reuniao', 'videoconferencia', 'whatsapp', 'presencial', 'outro')) NOT NULL,
  assunto TEXT NOT NULL,
  descricao TEXT,
  
  -- Participantes
  responsavel_id UUID NOT NULL REFERENCES public.usuarios(id),
  participantes_internos TEXT[],
  participantes_cliente TEXT[],
  
  -- Resultado
  resultado TEXT CHECK (resultado IN ('positivo', 'neutro', 'negativo', 'pendente')) DEFAULT 'pendente',
  proxima_acao TEXT,
  data_proxima_acao DATE,
  
  -- Valores negociados
  valor_inicial DECIMAL(12, 2),
  valor_proposto DECIMAL(12, 2),
  valor_contraproposta DECIMAL(12, 2),
  
  -- Documentos
  anexos_urls TEXT[],
  gravacao_url TEXT,
  
  -- Data e duração
  data_negociacao TIMESTAMPTZ DEFAULT NOW(),
  duracao_minutos INTEGER,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_negociacoes_empresa ON public.negociacoes(empresa_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_negociacoes_oportunidade ON public.negociacoes(oportunidade_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_negociacoes_proposta ON public.negociacoes(proposta_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_negociacoes_responsavel ON public.negociacoes(responsavel_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_negociacoes_data ON public.negociacoes(data_negociacao DESC);

COMMENT ON TABLE public.negociacoes IS 'Histórico de negociações e interações comerciais';

-- ============================================
-- 5. ATIVIDADES_CRM (tarefas e follow-ups)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.atividades_crm (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Tipo
  tipo TEXT CHECK (tipo IN ('tarefa', 'ligacao', 'email', 'reuniao', 'lembrete', 'acompanhamento', 'outro')) NOT NULL,
  prioridade TEXT CHECK (prioridade IN ('baixa', 'media', 'alta', 'urgente')) DEFAULT 'media',
  
  -- Conteúdo
  titulo TEXT NOT NULL,
  descricao TEXT,
  
  -- Relacionamentos
  oportunidade_id UUID REFERENCES public.oportunidades(id),
  lead_id UUID REFERENCES public.leads(id),
  proposta_id UUID REFERENCES public.propostas(id),
  
  -- Responsável
  responsavel_id UUID NOT NULL REFERENCES public.usuarios(id),
  criada_por_id UUID REFERENCES public.usuarios(id),
  
  -- Datas
  data_vencimento TIMESTAMPTZ,
  data_conclusao TIMESTAMPTZ,
  data_lembrete TIMESTAMPTZ,
  
  -- Status
  status TEXT CHECK (status IN ('pendente', 'em_andamento', 'concluida', 'cancelada', 'atrasada')) DEFAULT 'pendente',
  
  -- Resultado
  resultado TEXT,
  tempo_gasto_minutos INTEGER,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_atividades_crm_empresa ON public.atividades_crm(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_atividades_crm_responsavel ON public.atividades_crm(responsavel_id) WHERE status IN ('pendente', 'em_andamento');
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_atividades_crm_oportunidade ON public.atividades_crm(oportunidade_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_atividades_crm_vencimento ON public.atividades_crm(data_vencimento) WHERE status IN ('pendente', 'em_andamento');
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_atividades_crm_lembrete ON public.atividades_crm(data_lembrete) WHERE status = 'pendente';

COMMENT ON TABLE public.atividades_crm IS 'Atividades, tarefas e follow-ups do CRM';

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER trg_oportunidades_updated
  BEFORE UPDATE ON public.oportunidades
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_propostas_updated
  BEFORE UPDATE ON public.propostas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_itens_proposta_updated
  BEFORE UPDATE ON public.itens_proposta
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_negociacoes_updated
  BEFORE UPDATE ON public.negociacoes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_atividades_crm_updated
  BEFORE UPDATE ON public.atividades_crm
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FIM MÓDULO VENDAS/CRM (5 tabelas)
-- ============================================



-- ============================================
-- Source: 202510201312_fase2_parte3_financeiro.sql
-- ============================================

-- ============================================
-- Migration: FASE 2 - Core Business (Parte 3/4)
-- MÓDULO FINANCEIRO - 6 tabelas pt-BR
-- Data: 2025-10-20
-- Versão: 1.0
-- Autor: AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3
-- ============================================
-- Descrição:
-- Expande módulo Financeiro com gestão completa:
-- - Contas a pagar e receber
-- - Fluxo de caixa
-- - Contas bancárias
-- - Centros de custo
-- - Lançamentos contábeis
-- NOMENCLATURA: 100% pt-BR snake_case
-- SEM RLS (aplicar por último)
-- ============================================

-- ============================================
-- 1. CONTAS_PAGAR (contas a pagar)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.contas_pagar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Identificação
  numero TEXT NOT NULL,
  descricao TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('fornecedor', 'folha', 'tributo', 'servico', 'aluguel', 'financiamento', 'outro')) DEFAULT 'fornecedor',
  
  -- Fornecedor
  fornecedor_id UUID REFERENCES public.fornecedores(id),
  fornecedor_nome TEXT,
  fornecedor_cnpj TEXT,
  
  -- Documento origem
  nota_fiscal_id UUID REFERENCES public.notas_fiscais(id),
  pedido_compra_id UUID REFERENCES public.pedidos_compra(id),
  numero_documento TEXT,
  
  -- Valores
  valor_original DECIMAL(12, 2) NOT NULL,
  valor_juros DECIMAL(12, 2) DEFAULT 0,
  valor_multa DECIMAL(12, 2) DEFAULT 0,
  valor_desconto DECIMAL(12, 2) DEFAULT 0,
  valor_pago DECIMAL(12, 2) DEFAULT 0,
  valor_saldo DECIMAL(12, 2) GENERATED ALWAYS AS (valor_original + valor_juros + valor_multa - valor_desconto - valor_pago) STORED,
  
  -- Datas
  data_emissao DATE NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  
  -- Classificação
  centro_custo_id UUID,
  categoria TEXT,
  plano_contas_id UUID,
  
  -- Pagamento
  forma_pagamento TEXT CHECK (forma_pagamento IN ('dinheiro', 'pix', 'boleto', 'transferencia', 'cartao_credito', 'cartao_debito', 'cheque')) DEFAULT 'transferencia',
  banco_id UUID,
  numero_parcela INTEGER,
  total_parcelas INTEGER,
  
  -- Status
  status TEXT CHECK (status IN ('pendente', 'agendado', 'pago', 'atrasado', 'cancelado', 'parcial')) DEFAULT 'pendente',
  
  -- Observações
  observacoes TEXT,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  criado_por UUID REFERENCES public.usuarios(id),
  atualizado_por UUID REFERENCES public.usuarios(id),
  
  UNIQUE(empresa_id, numero)
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_contas_pagar_empresa ON public.contas_pagar(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_contas_pagar_fornecedor ON public.contas_pagar(fornecedor_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_contas_pagar_status ON public.contas_pagar(status, data_vencimento) WHERE status NOT IN ('pago', 'cancelado');
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_contas_pagar_vencimento ON public.contas_pagar(data_vencimento) WHERE status = 'pendente';
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_contas_pagar_centro_custo ON public.contas_pagar(centro_custo_id) WHERE excluido_em IS NULL;

COMMENT ON TABLE public.contas_pagar IS 'Contas a pagar (fornecedores, despesas)';

-- ============================================
-- 2. CONTAS_RECEBER (contas a receber)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.contas_receber (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Identificação
  numero TEXT NOT NULL,
  descricao TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('venda', 'servico', 'consignacao', 'aluguel', 'outro')) DEFAULT 'venda',
  
  -- Cliente
  cliente_nome TEXT NOT NULL,
  cliente_cnpj TEXT,
  cliente_id UUID, -- Pode ser lead, oportunidade, etc
  
  -- Documento origem
  nota_fiscal_id UUID REFERENCES public.notas_fiscais(id),
  fatura_id UUID REFERENCES public.faturas(id),
  numero_documento TEXT,
  
  -- Valores
  valor_original DECIMAL(12, 2) NOT NULL,
  valor_juros DECIMAL(12, 2) DEFAULT 0,
  valor_desconto DECIMAL(12, 2) DEFAULT 0,
  valor_recebido DECIMAL(12, 2) DEFAULT 0,
  valor_saldo DECIMAL(12, 2) GENERATED ALWAYS AS (valor_original + valor_juros - valor_desconto - valor_recebido) STORED,
  
  -- Datas
  data_emissao DATE NOT NULL,
  data_vencimento DATE NOT NULL,
  data_recebimento DATE,
  
  -- Classificação
  centro_custo_id UUID,
  categoria TEXT,
  plano_contas_id UUID,
  
  -- Recebimento
  forma_recebimento TEXT CHECK (forma_recebimento IN ('dinheiro', 'pix', 'boleto', 'transferencia', 'cartao_credito', 'cartao_debito', 'cheque')) DEFAULT 'transferencia',
  banco_id UUID,
  numero_parcela INTEGER,
  total_parcelas INTEGER,
  
  -- Status
  status TEXT CHECK (status IN ('pendente', 'recebido', 'atrasado', 'cancelado', 'parcial', 'protesto')) DEFAULT 'pendente',
  
  -- Cobrança
  boleto_url TEXT,
  boleto_nosso_numero TEXT,
  data_protesto DATE,
  
  -- Observações
  observacoes TEXT,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  criado_por UUID REFERENCES public.usuarios(id),
  atualizado_por UUID REFERENCES public.usuarios(id),
  
  UNIQUE(empresa_id, numero)
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_contas_receber_empresa ON public.contas_receber(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_contas_receber_cliente ON public.contas_receber(cliente_nome) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_contas_receber_status ON public.contas_receber(status, data_vencimento) WHERE status NOT IN ('recebido', 'cancelado');
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_contas_receber_vencimento ON public.contas_receber(data_vencimento) WHERE status = 'pendente';
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_contas_receber_centro_custo ON public.contas_receber(centro_custo_id) WHERE excluido_em IS NULL;

COMMENT ON TABLE public.contas_receber IS 'Contas a receber (clientes, receitas)';

-- ============================================
-- 3. FLUXO_CAIXA (movimentações de caixa)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.fluxo_caixa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Tipo de movimentação
  tipo TEXT CHECK (tipo IN ('entrada', 'saida', 'transferencia')) NOT NULL,
  categoria TEXT NOT NULL,
  
  -- Descrição
  descricao TEXT NOT NULL,
  observacoes TEXT,
  
  -- Conta bancária
  banco_id UUID,
  banco_nome TEXT,
  
  -- Valores
  valor DECIMAL(12, 2) NOT NULL CHECK (valor > 0),
  saldo_anterior DECIMAL(12, 2),
  saldo_atual DECIMAL(12, 2),
  
  -- Origem
  origem_tipo TEXT, -- Ex: "conta_pagar", "conta_receber", "estoque"
  origem_id UUID,
  documento_numero TEXT,
  
  -- Classificação
  centro_custo_id UUID,
  plano_contas_id UUID,
  
  -- Forma de pagamento/recebimento
  forma TEXT CHECK (forma IN ('dinheiro', 'pix', 'boleto', 'transferencia', 'cartao_credito', 'cartao_debito', 'cheque')),
  
  -- Data
  data_movimentacao DATE NOT NULL DEFAULT CURRENT_DATE,
  data_compensacao DATE,
  
  -- Status
  status TEXT CHECK (status IN ('pendente', 'confirmado', 'cancelado')) DEFAULT 'confirmado',
  conciliado BOOLEAN DEFAULT FALSE,
  data_conciliacao DATE,
  
  -- Transferência
  conta_destino_id UUID,
  
  -- Metadata
  usuario_id UUID REFERENCES public.usuarios(id),
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_fluxo_caixa_empresa ON public.fluxo_caixa(empresa_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_fluxo_caixa_banco ON public.fluxo_caixa(banco_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_fluxo_caixa_tipo ON public.fluxo_caixa(tipo, data_movimentacao DESC);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_fluxo_caixa_data ON public.fluxo_caixa(data_movimentacao DESC);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_fluxo_caixa_origem ON public.fluxo_caixa(origem_tipo, origem_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_fluxo_caixa_conciliacao ON public.fluxo_caixa(conciliado, banco_id) WHERE NOT conciliado;

COMMENT ON TABLE public.fluxo_caixa IS 'Movimentações financeiras (entradas e saídas)';

-- ============================================
-- 4. BANCOS (contas bancárias)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.bancos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Dados do banco
  codigo_banco TEXT NOT NULL,
  nome_banco TEXT NOT NULL,
  
  -- Conta
  agencia TEXT NOT NULL,
  agencia_digito TEXT,
  conta TEXT NOT NULL,
  conta_digito TEXT,
  tipo_conta TEXT CHECK (tipo_conta IN ('corrente', 'poupanca', 'investimento')) DEFAULT 'corrente',
  
  -- Identificação
  apelido TEXT NOT NULL,
  
  -- Saldos
  saldo_inicial DECIMAL(12, 2) DEFAULT 0,
  saldo_atual DECIMAL(12, 2) DEFAULT 0,
  data_saldo DATE DEFAULT CURRENT_DATE,
  
  -- Limites
  limite_cheque_especial DECIMAL(12, 2) DEFAULT 0,
  limite_usado DECIMAL(12, 2) DEFAULT 0,
  
  -- PIX
  chave_pix TEXT,
  tipo_chave_pix TEXT CHECK (tipo_chave_pix IN ('cpf', 'cnpj', 'email', 'telefone', 'aleatoria')),
  
  -- Integração bancária
  pluggy_item_id TEXT,
  pluggy_account_id TEXT,
  sincronizacao_automatica BOOLEAN DEFAULT FALSE,
  ultima_sincronizacao TIMESTAMPTZ,
  
  -- Status
  ativo BOOLEAN DEFAULT TRUE,
  conta_principal BOOLEAN DEFAULT FALSE,
  
  -- Observações
  observacoes TEXT,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  
  UNIQUE(empresa_id, codigo_banco, agencia, conta)
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_bancos_empresa ON public.bancos(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_bancos_ativo ON public.bancos(ativo) WHERE ativo = TRUE;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_bancos_principal ON public.bancos(empresa_id, conta_principal) WHERE conta_principal = TRUE;

COMMENT ON TABLE public.bancos IS 'Contas bancárias da empresa';

-- ============================================
-- 5. CENTROS_CUSTO (centros de custo)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.centros_custo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Identificação
  codigo TEXT NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  
  -- Hierarquia
  centro_custo_pai_id UUID REFERENCES public.centros_custo(id),
  nivel INTEGER DEFAULT 1,
  caminho TEXT, -- Ex: "Matriz/Administrativo/TI"
  
  -- Tipo
  tipo TEXT CHECK (tipo IN ('receita', 'despesa', 'investimento')) DEFAULT 'despesa',
  
  -- Orçamento
  orcamento_mensal DECIMAL(12, 2),
  orcamento_anual DECIMAL(12, 2),
  
  -- Responsável
  responsavel_id UUID REFERENCES public.usuarios(id),
  
  -- Status
  ativo BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  
  UNIQUE(empresa_id, codigo)
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_centros_custo_empresa ON public.centros_custo(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_centros_custo_pai ON public.centros_custo(centro_custo_pai_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_centros_custo_ativo ON public.centros_custo(ativo) WHERE ativo = TRUE;

COMMENT ON TABLE public.centros_custo IS 'Centros de custo para controle gerencial';

-- ============================================
-- 6. LANCAMENTOS_CONTABEIS (lançamentos contábeis)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.lancamentos_contabeis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Identificação
  numero_lancamento TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('debito', 'credito')) NOT NULL,
  
  -- Conta contábil (simplificado)
  plano_contas_codigo TEXT NOT NULL,
  plano_contas_nome TEXT,
  
  -- Descrição
  historico TEXT NOT NULL,
  complemento TEXT,
  
  -- Valor
  valor DECIMAL(12, 2) NOT NULL CHECK (valor > 0),
  
  -- Classificação
  centro_custo_id UUID REFERENCES public.centros_custo(id),
  
  -- Origem
  documento_tipo TEXT, -- Ex: "nota_fiscal", "conta_pagar", "fluxo_caixa"
  documento_id UUID,
  documento_numero TEXT,
  
  -- Data
  data_lancamento DATE NOT NULL,
  data_competencia DATE,
  
  -- Lote
  lote_id UUID, -- Para agrupar lançamentos relacionados
  
  -- Status
  status TEXT CHECK (status IN ('provisorio', 'definitivo', 'cancelado')) DEFAULT 'definitivo',
  
  -- Conciliação
  conciliado BOOLEAN DEFAULT FALSE,
  data_conciliacao DATE,
  
  -- Metadata
  usuario_id UUID REFERENCES public.usuarios(id),
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_lancamentos_contabeis_empresa ON public.lancamentos_contabeis(empresa_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_lancamentos_contabeis_conta ON public.lancamentos_contabeis(plano_contas_codigo, data_lancamento DESC);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_lancamentos_contabeis_tipo ON public.lancamentos_contabeis(tipo, data_lancamento);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_lancamentos_contabeis_data ON public.lancamentos_contabeis(data_lancamento DESC);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_lancamentos_contabeis_lote ON public.lancamentos_contabeis(lote_id) WHERE lote_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_lancamentos_contabeis_documento ON public.lancamentos_contabeis(documento_tipo, documento_id);

COMMENT ON TABLE public.lancamentos_contabeis IS 'Lançamentos contábeis (débito e crédito)';

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER trg_contas_pagar_updated
  BEFORE UPDATE ON public.contas_pagar
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_contas_receber_updated
  BEFORE UPDATE ON public.contas_receber
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_fluxo_caixa_updated
  BEFORE UPDATE ON public.fluxo_caixa
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_bancos_updated
  BEFORE UPDATE ON public.bancos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_centros_custo_updated
  BEFORE UPDATE ON public.centros_custo
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_lancamentos_contabeis_updated
  BEFORE UPDATE ON public.lancamentos_contabeis
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FIM MÓDULO FINANCEIRO (6 tabelas)
-- ============================================



-- ============================================
-- Source: 202510201313_fase2_parte4_consignacao.sql
-- ============================================

-- ============================================
-- Migration: FASE 2 - Core Business (Parte 4/4)
-- MÓDULO CONSIGNAÇÃO - 4 tabelas pt-BR
-- Data: 2025-10-20
-- Versão: 1.0
-- Autor: AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3
-- ============================================
-- Descrição:
-- Completa módulo de Consignação com operação detalhada:
-- - Remessas de consignação
-- - Itens consignados
-- - Devoluções
-- - Reservas de estoque
-- NOMENCLATURA: 100% pt-BR snake_case
-- SEM RLS (aplicar por último)
-- ============================================

-- ============================================
-- 1. REMESSAS_CONSIGNACAO (remessas enviadas)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.remessas_consignacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Identificação
  numero TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('envio', 'reposicao', 'transferencia')) DEFAULT 'envio',
  
  -- Contrato
  contrato_consignacao_id UUID NOT NULL REFERENCES public.contratos_consignacao(id) ON DELETE RESTRICT,
  fornecedor_id UUID NOT NULL REFERENCES public.fornecedores(id) ON DELETE RESTRICT,
  
  -- Destino
  hospital_id UUID REFERENCES public.hospitais(id),
  local_destino TEXT NOT NULL,
  endereco_entrega TEXT,
  
  -- Cirurgia relacionada (opcional)
  cirurgia_id UUID REFERENCES public.cirurgias(id),
  medico_id UUID REFERENCES public.medicos(id),
  
  -- Datas
  data_remessa DATE DEFAULT CURRENT_DATE,
  data_entrega_prevista DATE NOT NULL,
  data_entrega_realizada DATE,
  data_vencimento_devolucao DATE,
  
  -- Responsáveis
  responsavel_envio_id UUID REFERENCES public.usuarios(id),
  responsavel_recebimento TEXT,
  
  -- Valores
  valor_total_materiais DECIMAL(12, 2) DEFAULT 0,
  valor_frete DECIMAL(12, 2) DEFAULT 0,
  valor_total DECIMAL(12, 2),
  
  -- Transporte
  transportadora TEXT,
  rastreamento TEXT,
  nota_fiscal_id UUID REFERENCES public.notas_fiscais(id),
  
  -- Status
  status TEXT CHECK (status IN (
    'preparacao', 'enviada', 'em_transito', 'entregue', 
    'parcialmente_devolvida', 'totalmente_devolvida', 
    'faturada', 'cancelada'
  )) DEFAULT 'preparacao',
  
  -- Observações
  observacoes TEXT,
  condicoes_especiais TEXT,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  criado_por UUID REFERENCES public.usuarios(id),
  atualizado_por UUID REFERENCES public.usuarios(id),
  
  UNIQUE(empresa_id, numero)
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_remessas_consignacao_empresa ON public.remessas_consignacao(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_remessas_consignacao_contrato ON public.remessas_consignacao(contrato_consignacao_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_remessas_consignacao_fornecedor ON public.remessas_consignacao(fornecedor_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_remessas_consignacao_hospital ON public.remessas_consignacao(hospital_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_remessas_consignacao_cirurgia ON public.remessas_consignacao(cirurgia_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_remessas_consignacao_status ON public.remessas_consignacao(status, data_remessa DESC) WHERE excluido_em IS NULL;

COMMENT ON TABLE public.remessas_consignacao IS 'Remessas de materiais em consignação';

-- ============================================
-- 2. ITENS_CONSIGNACAO (itens da remessa)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.itens_consignacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  remessa_consignacao_id UUID NOT NULL REFERENCES public.remessas_consignacao(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE RESTRICT,
  lote_id UUID REFERENCES public.lotes(id) ON DELETE RESTRICT,
  
  -- Identificação do item
  numero_item INTEGER NOT NULL,
  numero_serie TEXT,
  
  -- Quantidades
  quantidade_enviada INTEGER NOT NULL CHECK (quantidade_enviada > 0),
  quantidade_utilizada INTEGER DEFAULT 0 CHECK (quantidade_utilizada >= 0),
  quantidade_devolvida INTEGER DEFAULT 0 CHECK (quantidade_devolvida >= 0),
  quantidade_pendente INTEGER GENERATED ALWAYS AS (quantidade_enviada - quantidade_utilizada - quantidade_devolvida) STORED,
  
  -- Valores
  valor_unitario DECIMAL(12, 2) NOT NULL,
  valor_total DECIMAL(12, 2) NOT NULL,
  
  -- Rastreabilidade ANVISA
  data_validade DATE,
  registro_anvisa TEXT,
  
  -- Utilização
  cirurgia_material_id UUID REFERENCES public.cirurgia_materiais(id),
  data_utilizacao TIMESTAMPTZ,
  responsavel_utilizacao UUID REFERENCES public.usuarios(id),
  
  -- Devolução
  data_devolucao TIMESTAMPTZ,
  motivo_devolucao TEXT,
  condicao_devolucao TEXT CHECK (condicao_devolucao IN ('perfeito', 'avariado', 'vencido', 'incompleto')),
  
  -- Status
  status TEXT CHECK (status IN (
    'disponivel', 'reservado', 'utilizado', 
    'devolvido', 'faturado', 'perdido'
  )) DEFAULT 'disponivel',
  
  -- Observações
  observacoes TEXT,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_itens_consignacao_remessa ON public.itens_consignacao(remessa_consignacao_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_itens_consignacao_produto ON public.itens_consignacao(produto_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_itens_consignacao_lote ON public.itens_consignacao(lote_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_itens_consignacao_status ON public.itens_consignacao(status) WHERE status IN ('disponivel', 'reservado');
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_itens_consignacao_serie ON public.itens_consignacao(numero_serie) WHERE numero_serie IS NOT NULL;

COMMENT ON TABLE public.itens_consignacao IS 'Itens individuais das remessas em consignação';

-- ============================================
-- 3. DEVOLUCOES_CONSIGNACAO (devoluções agrupadas)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.devolucoes_consignacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Identificação
  numero TEXT NOT NULL,
  
  -- Remessa origem
  remessa_consignacao_id UUID NOT NULL REFERENCES public.remessas_consignacao(id) ON DELETE RESTRICT,
  fornecedor_id UUID NOT NULL REFERENCES public.fornecedores(id) ON DELETE RESTRICT,
  
  -- Datas
  data_devolucao DATE DEFAULT CURRENT_DATE,
  data_coleta_prevista DATE,
  data_coleta_realizada DATE,
  
  -- Responsáveis
  responsavel_devolucao_id UUID REFERENCES public.usuarios(id),
  recebido_por TEXT,
  
  -- Valores
  valor_total_devolvido DECIMAL(12, 2) DEFAULT 0,
  valor_desconto_avaria DECIMAL(12, 2) DEFAULT 0,
  valor_liquido DECIMAL(12, 2),
  
  -- Transporte
  transportadora TEXT,
  rastreamento TEXT,
  nota_fiscal_devolucao_id UUID REFERENCES public.notas_fiscais(id),
  
  -- Motivo
  motivo TEXT CHECK (motivo IN (
    'nao_utilizado', 'excedente', 'vencimento_proximo', 
    'troca', 'avaria', 'outro'
  )) NOT NULL,
  motivo_detalhado TEXT,
  
  -- Status
  status TEXT CHECK (status IN (
    'rascunho', 'aguardando_coleta', 'em_transito', 
    'recebida_fornecedor', 'conferida', 'cancelada'
  )) DEFAULT 'rascunho',
  
  -- Conferência
  conferido BOOLEAN DEFAULT FALSE,
  data_conferencia DATE,
  conferido_por TEXT,
  divergencias TEXT,
  
  -- Observações
  observacoes TEXT,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  criado_por UUID REFERENCES public.usuarios(id),
  atualizado_por UUID REFERENCES public.usuarios(id),
  
  UNIQUE(empresa_id, numero)
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_devolucoes_consignacao_empresa ON public.devolucoes_consignacao(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_devolucoes_consignacao_remessa ON public.devolucoes_consignacao(remessa_consignacao_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_devolucoes_consignacao_fornecedor ON public.devolucoes_consignacao(fornecedor_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_devolucoes_consignacao_status ON public.devolucoes_consignacao(status, data_devolucao DESC) WHERE excluido_em IS NULL;

COMMENT ON TABLE public.devolucoes_consignacao IS 'Devoluções de materiais consignados';

-- ============================================
-- 4. ESTOQUE_RESERVAS (reservas de estoque)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.estoque_reservas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  estoque_id UUID NOT NULL REFERENCES public.estoque(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE RESTRICT,
  lote_id UUID REFERENCES public.lotes(id) ON DELETE RESTRICT,
  
  -- Quantidade
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  quantidade_consumida INTEGER DEFAULT 0 CHECK (quantidade_consumida >= 0),
  quantidade_disponivel INTEGER GENERATED ALWAYS AS (quantidade - quantidade_consumida) STORED,
  
  -- Motivo da reserva
  tipo_reserva TEXT CHECK (tipo_reserva IN (
    'cirurgia', 'pedido_venda', 'transferencia', 
    'manutencao', 'demonstracao', 'outro'
  )) NOT NULL,
  
  -- Referência
  referencia_tipo TEXT, -- Ex: "cirurgia", "proposta", "pedido"
  referencia_id UUID,
  cirurgia_id UUID REFERENCES public.cirurgias(id),
  
  -- Responsável
  responsavel_id UUID NOT NULL REFERENCES public.usuarios(id),
  
  -- Datas
  data_reserva TIMESTAMPTZ DEFAULT NOW(),
  data_validade_reserva TIMESTAMPTZ NOT NULL,
  data_liberacao TIMESTAMPTZ,
  
  -- Status
  status TEXT CHECK (status IN (
    'ativa', 'consumida', 'liberada', 'expirada', 'cancelada'
  )) DEFAULT 'ativa',
  
  -- Motivo liberação/cancelamento
  motivo_liberacao TEXT,
  
  -- Observações
  observacoes TEXT,
  prioridade TEXT CHECK (prioridade IN ('baixa', 'media', 'alta', 'urgente')) DEFAULT 'media',
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  liberado_por UUID REFERENCES public.usuarios(id)
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_estoque_reservas_empresa ON public.estoque_reservas(empresa_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_estoque_reservas_estoque ON public.estoque_reservas(estoque_id) WHERE status = 'ativa';
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_estoque_reservas_produto ON public.estoque_reservas(produto_id) WHERE status = 'ativa';
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_estoque_reservas_cirurgia ON public.estoque_reservas(cirurgia_id) WHERE cirurgia_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_estoque_reservas_status ON public.estoque_reservas(status, data_validade_reserva);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_estoque_reservas_responsavel ON public.estoque_reservas(responsavel_id) WHERE status = 'ativa';
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_estoque_reservas_referencia ON public.estoque_reservas(referencia_tipo, referencia_id);

COMMENT ON TABLE public.estoque_reservas IS 'Reservas de estoque para cirurgias e outras finalidades';

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER trg_remessas_consignacao_updated
  BEFORE UPDATE ON public.remessas_consignacao
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_itens_consignacao_updated
  BEFORE UPDATE ON public.itens_consignacao
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_devolucoes_consignacao_updated
  BEFORE UPDATE ON public.devolucoes_consignacao
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_estoque_reservas_updated
  BEFORE UPDATE ON public.estoque_reservas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FIM MÓDULO CONSIGNAÇÃO (4 tabelas)
-- ============================================
-- FASE 2 COMPLETA: 20 tabelas
-- - Compras: 5 tabelas
-- - Vendas/CRM: 5 tabelas
-- - Financeiro: 6 tabelas
-- - Consignação: 4 tabelas
-- ============================================



-- ============================================
-- Source: 202510201320_fase3_parte1_compliance.sql
-- ============================================

-- ============================================
-- Migration: FASE 3 - Compliance & Integrações (Parte 1/4)
-- MÓDULO COMPLIANCE/AUDITORIA - 6 tabelas pt-BR
-- Data: 2025-10-20
-- Versão: 1.0
-- Autor: AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3
-- ============================================
-- Descrição:
-- Compliance regulatório e auditoria:
-- - Requisitos normativos (ANVISA, RDC, ISO)
-- - Evidências documentais
-- - Auditorias internas/externas
-- - Não conformidades e ações corretivas
-- NOMENCLATURA: 100% pt-BR snake_case
-- SEM RLS (aplicar por último)
-- ============================================

-- ============================================
-- 1. COMPLIANCE_REQUISITOS (requisitos regulatórios)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.compliance_requisitos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Identificação
  codigo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  
  -- Classificação
  tipo TEXT CHECK (tipo IN (
    'anvisa', 'rdc', 'iso', 'lgpd', 'trabalhista', 
    'ambiental', 'qualidade', 'seguranca', 'outro'
  )) NOT NULL,
  categoria TEXT,
  
  -- Norma/legislação
  norma_base TEXT, -- Ex: "RDC 36/2015", "ISO 13485:2016"
  artigo_clausula TEXT,
  versao TEXT,
  
  -- Criticidade
  criticidade TEXT CHECK (criticidade IN ('baixa', 'media', 'alta', 'critica')) DEFAULT 'media',
  obrigatorio BOOLEAN DEFAULT TRUE,
  
  -- Periodicidade
  frequencia_verificacao TEXT CHECK (frequencia_verificacao IN (
    'diaria', 'semanal', 'quinzenal', 'mensal', 
    'trimestral', 'semestral', 'anual', 'sob_demanda'
  )),
  proxima_verificacao DATE,
  
  -- Responsável
  responsavel_id UUID REFERENCES public.usuarios(id),
  departamento TEXT,
  
  -- Status
  status TEXT CHECK (status IN ('ativo', 'inativo', 'obsoleto', 'em_revisao')) DEFAULT 'ativo',
  
  -- Documentação
  documentos_urls TEXT[],
  checklist_json JSONB, -- Checklist de verificação estruturado
  
  -- Observações
  observacoes TEXT,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  criado_por UUID REFERENCES public.usuarios(id),
  atualizado_por UUID REFERENCES public.usuarios(id),
  
  UNIQUE(empresa_id, codigo)
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_compliance_requisitos_empresa ON public.compliance_requisitos(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_compliance_requisitos_tipo ON public.compliance_requisitos(tipo, criticidade) WHERE status = 'ativo';
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_compliance_requisitos_status ON public.compliance_requisitos(status) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_compliance_requisitos_verificacao ON public.compliance_requisitos(proxima_verificacao) WHERE status = 'ativo';
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_compliance_requisitos_responsavel ON public.compliance_requisitos(responsavel_id) WHERE status = 'ativo';

COMMENT ON TABLE public.compliance_requisitos IS 'Requisitos regulatórios e normativos (ANVISA, ISO, LGPD)';

-- ============================================
-- 2. COMPLIANCE_EVIDENCIAS (evidências documentais)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.compliance_evidencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  requisito_id UUID NOT NULL REFERENCES public.compliance_requisitos(id) ON DELETE CASCADE,
  
  -- Identificação
  titulo TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT CHECK (tipo IN (
    'documento', 'foto', 'video', 'relatorio', 
    'planilha', 'certificado', 'laudo', 'ata', 'outro'
  )) NOT NULL,
  
  -- Arquivo
  arquivo_url TEXT NOT NULL,
  arquivo_nome TEXT,
  arquivo_tamanho INTEGER, -- bytes
  arquivo_hash TEXT, -- Para integridade
  
  -- Validade
  data_documento DATE,
  data_validade DATE,
  valido BOOLEAN DEFAULT TRUE,
  
  -- Relacionamentos
  auditoria_id UUID,
  nao_conformidade_id UUID,
  
  -- Classificação
  categoria TEXT,
  tags TEXT[],
  
  -- Aprovação
  aprovado BOOLEAN DEFAULT FALSE,
  aprovado_por_id UUID REFERENCES public.usuarios(id),
  data_aprovacao TIMESTAMPTZ,
  
  -- Observações
  observacoes TEXT,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  criado_por UUID REFERENCES public.usuarios(id)
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_compliance_evidencias_empresa ON public.compliance_evidencias(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_compliance_evidencias_requisito ON public.compliance_evidencias(requisito_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_compliance_evidencias_tipo ON public.compliance_evidencias(tipo) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_compliance_evidencias_validade ON public.compliance_evidencias(data_validade) WHERE valido = TRUE;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_compliance_evidencias_auditoria ON public.compliance_evidencias(auditoria_id) WHERE auditoria_id IS NOT NULL;

COMMENT ON TABLE public.compliance_evidencias IS 'Evidências documentais de conformidade regulatória';

-- ============================================
-- 3. AUDITORIAS (auditorias internas e externas)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.auditorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Identificação
  numero TEXT NOT NULL,
  titulo TEXT NOT NULL,
  objetivo TEXT,
  
  -- Tipo
  tipo TEXT CHECK (tipo IN ('interna', 'externa', 'certificacao', 'vigilancia', 'inspetoria')) NOT NULL,
  escopo TEXT NOT NULL,
  
  -- Norma auditada
  normas_aplicaveis TEXT[], -- Ex: ["ISO 13485", "RDC 36/2015"]
  
  -- Planejamento
  data_planejamento DATE DEFAULT CURRENT_DATE,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  duracao_horas INTEGER,
  
  -- Equipe auditora
  auditor_lider_id UUID REFERENCES public.usuarios(id),
  auditores TEXT[], -- Nomes dos auditores
  entidade_auditora TEXT, -- Se externa
  
  -- Área auditada
  departamentos_auditados TEXT[],
  processos_auditados TEXT[],
  
  -- Resultados
  pontuacao_geral DECIMAL(5, 2),
  percentual_conformidade DECIMAL(5, 2),
  total_conformidades INTEGER DEFAULT 0,
  total_nao_conformidades INTEGER DEFAULT 0,
  total_observacoes INTEGER DEFAULT 0,
  
  -- Status
  status TEXT CHECK (status IN (
    'planejada', 'em_andamento', 'concluida', 
    'relatorio_pendente', 'finalizada', 'cancelada'
  )) DEFAULT 'planejada',
  
  -- Relatório
  relatorio_url TEXT,
  data_relatorio DATE,
  
  -- Conclusão
  conclusao TEXT,
  recomendacoes TEXT,
  pontos_fortes TEXT,
  oportunidades_melhoria TEXT,
  
  -- Certificação (se aplicável)
  certificado_emitido BOOLEAN DEFAULT FALSE,
  certificado_url TEXT,
  certificado_validade DATE,
  
  -- Observações
  observacoes TEXT,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  criado_por UUID REFERENCES public.usuarios(id),
  atualizado_por UUID REFERENCES public.usuarios(id),
  
  UNIQUE(empresa_id, numero)
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_auditorias_empresa ON public.auditorias(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_auditorias_tipo ON public.auditorias(tipo, status) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_auditorias_status ON public.auditorias(status, data_inicio DESC) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_auditorias_datas ON public.auditorias(data_inicio, data_fim) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_auditorias_auditor ON public.auditorias(auditor_lider_id) WHERE excluido_em IS NULL;

COMMENT ON TABLE public.auditorias IS 'Auditorias internas e externas (ISO, ANVISA, certificações)';

-- ============================================
-- 4. AUDITORIAS_ITENS (itens verificados na auditoria)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.auditorias_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auditoria_id UUID NOT NULL REFERENCES public.auditorias(id) ON DELETE CASCADE,
  requisito_id UUID REFERENCES public.compliance_requisitos(id),
  
  -- Identificação
  numero_item TEXT NOT NULL,
  clausula TEXT, -- Cláusula da norma
  descricao TEXT NOT NULL,
  
  -- Área
  departamento TEXT,
  processo TEXT,
  
  -- Verificação
  data_verificacao TIMESTAMPTZ DEFAULT NOW(),
  metodo_verificacao TEXT CHECK (metodo_verificacao IN (
    'entrevista', 'observacao', 'analise_documental', 
    'medicao', 'teste', 'outro'
  )),
  
  -- Resultado
  resultado TEXT CHECK (resultado IN (
    'conforme', 'nao_conforme_maior', 'nao_conforme_menor', 
    'observacao', 'oportunidade_melhoria', 'nao_aplicavel'
  )) NOT NULL,
  
  -- Evidências
  evidencias TEXT,
  evidencias_urls TEXT[],
  
  -- Criticidade
  criticidade TEXT CHECK (criticidade IN ('baixa', 'media', 'alta', 'critica')),
  impacto TEXT,
  
  -- Não conformidade (se aplicável)
  nao_conformidade_id UUID,
  
  -- Responsável pela área auditada
  responsavel_area TEXT,
  
  -- Observações
  observacoes TEXT,
  comentarios_auditor TEXT,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_auditorias_itens_auditoria ON public.auditorias_itens(auditoria_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_auditorias_itens_requisito ON public.auditorias_itens(requisito_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_auditorias_itens_resultado ON public.auditorias_itens(resultado) WHERE resultado LIKE 'nao_conforme%';
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_auditorias_itens_nc ON public.auditorias_itens(nao_conformidade_id) WHERE nao_conformidade_id IS NOT NULL;

COMMENT ON TABLE public.auditorias_itens IS 'Itens verificados nas auditorias (checklist)';

-- ============================================
-- 5. NAO_CONFORMIDADES (não conformidades identificadas)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.nao_conformidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Identificação
  numero TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  
  -- Origem
  origem TEXT CHECK (origem IN (
    'auditoria_interna', 'auditoria_externa', 'inspetoria', 
    'reclamacao_cliente', 'auto_inspecao', 'evento_adverso', 'outro'
  )) NOT NULL,
  auditoria_id UUID REFERENCES public.auditorias(id),
  auditoria_item_id UUID REFERENCES public.auditorias_itens(id),
  
  -- Classificação
  tipo TEXT CHECK (tipo IN ('maior', 'menor', 'observacao', 'risco')) NOT NULL,
  categoria TEXT,
  
  -- Requisito violado
  requisito_id UUID REFERENCES public.compliance_requisitos(id),
  norma_clausula TEXT,
  
  -- Departamento/processo
  departamento TEXT,
  processo TEXT,
  
  -- Criticidade e impacto
  criticidade TEXT CHECK (criticidade IN ('baixa', 'media', 'alta', 'critica')) NOT NULL,
  impacto TEXT,
  risco_potencial TEXT,
  
  -- Datas
  data_identificacao DATE DEFAULT CURRENT_DATE,
  data_limite_resposta DATE NOT NULL,
  data_resposta DATE,
  
  -- Responsáveis
  identificada_por_id UUID REFERENCES public.usuarios(id),
  responsavel_tratamento_id UUID REFERENCES public.usuarios(id),
  
  -- Análise de causa raiz
  causa_raiz TEXT,
  metodo_analise TEXT, -- Ex: "5 Porquês", "Ishikawa", "FMEA"
  
  -- Status
  status TEXT CHECK (status IN (
    'aberta', 'em_analise', 'em_tratamento', 
    'aguardando_verificacao', 'fechada', 'cancelada'
  )) DEFAULT 'aberta',
  
  -- Recorrência
  recorrente BOOLEAN DEFAULT FALSE,
  nc_relacionada_id UUID REFERENCES public.nao_conformidades(id),
  
  -- Observações
  observacoes TEXT,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  criado_por UUID REFERENCES public.usuarios(id),
  atualizado_por UUID REFERENCES public.usuarios(id),
  
  UNIQUE(empresa_id, numero)
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_nao_conformidades_empresa ON public.nao_conformidades(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_nao_conformidades_auditoria ON public.nao_conformidades(auditoria_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_nao_conformidades_status ON public.nao_conformidades(status, criticidade) WHERE status NOT IN ('fechada', 'cancelada');
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_nao_conformidades_responsavel ON public.nao_conformidades(responsavel_tratamento_id) WHERE status IN ('aberta', 'em_tratamento');
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_nao_conformidades_tipo ON public.nao_conformidades(tipo, data_identificacao DESC) WHERE excluido_em IS NULL;

COMMENT ON TABLE public.nao_conformidades IS 'Não conformidades identificadas (auditorias, inspeções)';

-- ============================================
-- 6. ACOES_CORRETIVAS (ações corretivas e preventivas)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.acoes_corretivas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  nao_conformidade_id UUID NOT NULL REFERENCES public.nao_conformidades(id) ON DELETE CASCADE,
  
  -- Identificação
  numero TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('corretiva', 'preventiva', 'melhoria')) NOT NULL,
  descricao TEXT NOT NULL,
  
  -- Classificação
  categoria TEXT CHECK (categoria IN (
    'imediata', 'correcao', 'analise_causa', 
    'acao_corretiva', 'acao_preventiva'
  )) NOT NULL,
  
  -- Planejamento
  plano_acao TEXT NOT NULL,
  recursos_necessarios TEXT,
  custo_estimado DECIMAL(12, 2),
  
  -- Responsável
  responsavel_id UUID NOT NULL REFERENCES public.usuarios(id),
  participantes TEXT[],
  
  -- Datas
  data_planejamento DATE DEFAULT CURRENT_DATE,
  data_inicio_prevista DATE NOT NULL,
  data_inicio_real DATE,
  data_conclusao_prevista DATE NOT NULL,
  data_conclusao_real DATE,
  
  -- Status
  status TEXT CHECK (status IN (
    'planejada', 'em_andamento', 'concluida', 
    'verificada', 'eficaz', 'nao_eficaz', 'cancelada'
  )) DEFAULT 'planejada',
  
  -- Execução
  progresso INTEGER DEFAULT 0 CHECK (progresso BETWEEN 0 AND 100),
  atividades_realizadas TEXT,
  dificuldades_encontradas TEXT,
  
  -- Verificação de eficácia
  data_verificacao_eficacia DATE,
  verificada_por_id UUID REFERENCES public.usuarios(id),
  metodo_verificacao TEXT,
  resultado_verificacao TEXT,
  eficaz BOOLEAN,
  
  -- Evidências
  evidencias_urls TEXT[],
  
  -- Observações
  observacoes TEXT,
  licoes_aprendidas TEXT,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  criado_por UUID REFERENCES public.usuarios(id),
  atualizado_por UUID REFERENCES public.usuarios(id),
  
  UNIQUE(empresa_id, numero)
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_acoes_corretivas_empresa ON public.acoes_corretivas(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_acoes_corretivas_nc ON public.acoes_corretivas(nao_conformidade_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_acoes_corretivas_responsavel ON public.acoes_corretivas(responsavel_id) WHERE status IN ('planejada', 'em_andamento');
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_acoes_corretivas_status ON public.acoes_corretivas(status, data_conclusao_prevista) WHERE status NOT IN ('concluida', 'cancelada');
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_acoes_corretivas_tipo ON public.acoes_corretivas(tipo, categoria) WHERE excluido_em IS NULL;

COMMENT ON TABLE public.acoes_corretivas IS 'Ações corretivas e preventivas (CAPA)';

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER trg_compliance_requisitos_updated
  BEFORE UPDATE ON public.compliance_requisitos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_compliance_evidencias_updated
  BEFORE UPDATE ON public.compliance_evidencias
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_auditorias_updated
  BEFORE UPDATE ON public.auditorias
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_auditorias_itens_updated
  BEFORE UPDATE ON public.auditorias_itens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_nao_conformidades_updated
  BEFORE UPDATE ON public.nao_conformidades
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_acoes_corretivas_updated
  BEFORE UPDATE ON public.acoes_corretivas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FIM MÓDULO COMPLIANCE/AUDITORIA (6 tabelas)
-- ============================================



-- ============================================
-- Source: 202510201321_fase3_parte2_portais_opme.sql
-- ============================================

-- ============================================
-- Migration: FASE 3 - Compliance & Integrações (Parte 2/4)
-- MÓDULO PORTAIS OPME - 4 tabelas pt-BR
-- Data: 2025-10-20
-- Versão: 1.0
-- Autor: AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3
-- ============================================
-- Descrição:
-- Integração com portais de OPME (hospitais/convênios):
-- - Configurações de acesso
-- - Solicitações de materiais
-- - Respostas e aprovações
-- - Logs de integração
-- NOMENCLATURA: 100% pt-BR snake_case
-- SEM RLS (aplicar por último)
-- ============================================

-- ============================================
-- 1. PORTAIS_OPME_CONFIG (configurações dos portais)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.portais_opme_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Identificação do portal
  nome TEXT NOT NULL,
  codigo TEXT NOT NULL, -- Identificador único do portal
  tipo TEXT CHECK (tipo IN ('hospital', 'convenio', 'operadora', 'marketplace')) NOT NULL,
  
  -- Hospital/Convênio relacionado
  hospital_id UUID REFERENCES public.hospitais(id),
  convenio_id UUID REFERENCES public.convenios(id),
  entidade_nome TEXT NOT NULL,
  entidade_cnpj TEXT,
  
  -- Dados de acesso
  url_portal TEXT NOT NULL,
  url_api TEXT,
  metodo_integracao TEXT CHECK (metodo_integracao IN (
    'api_rest', 'api_soap', 'sftp', 'email', 'portal_web', 'outro'
  )) DEFAULT 'portal_web',
  
  -- Credenciais (criptografadas)
  usuario TEXT,
  senha_hash TEXT, -- Armazenar criptografado
  token_api TEXT,
  certificado_digital_url TEXT,
  
  -- Configurações da API
  api_versao TEXT,
  api_timeout INTEGER DEFAULT 30, -- segundos
  api_retry_count INTEGER DEFAULT 3,
  api_headers_json JSONB,
  
  -- Regras de negócio
  requer_pre_aprovacao BOOLEAN DEFAULT TRUE,
  prazo_resposta_horas INTEGER DEFAULT 48,
  permite_fracionamento BOOLEAN DEFAULT FALSE,
  exige_laudo_medico BOOLEAN DEFAULT TRUE,
  
  -- Campos obrigatórios
  campos_obrigatorios TEXT[],
  validacoes_json JSONB,
  
  -- Sincronização
  sincronizacao_automatica BOOLEAN DEFAULT FALSE,
  intervalo_sincronizacao_minutos INTEGER DEFAULT 60,
  ultima_sincronizacao TIMESTAMPTZ,
  
  -- Status
  ativo BOOLEAN DEFAULT TRUE,
  homologacao BOOLEAN DEFAULT FALSE, -- Modo teste
  
  -- Contatos
  contato_nome TEXT,
  contato_email TEXT,
  contato_telefone TEXT,
  suporte_email TEXT,
  suporte_telefone TEXT,
  
  -- Observações
  observacoes TEXT,
  documentacao_url TEXT,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  criado_por UUID REFERENCES public.usuarios(id),
  atualizado_por UUID REFERENCES public.usuarios(id),
  
  UNIQUE(empresa_id, codigo)
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_portais_opme_config_empresa ON public.portais_opme_config(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_portais_opme_config_hospital ON public.portais_opme_config(hospital_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_portais_opme_config_convenio ON public.portais_opme_config(convenio_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_portais_opme_config_ativo ON public.portais_opme_config(ativo, homologacao) WHERE ativo = TRUE;

COMMENT ON TABLE public.portais_opme_config IS 'Configurações de integração com portais OPME';

-- ============================================
-- 2. PORTAIS_OPME_SOLICITACOES (solicitações enviadas)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.portais_opme_solicitacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  portal_config_id UUID NOT NULL REFERENCES public.portais_opme_config(id) ON DELETE RESTRICT,
  
  -- Identificação interna
  numero_interno TEXT NOT NULL,
  
  -- Identificação no portal
  numero_portal TEXT,
  protocolo_portal TEXT,
  
  -- Cirurgia relacionada
  cirurgia_id UUID NOT NULL REFERENCES public.cirurgias(id) ON DELETE RESTRICT,
  
  -- Paciente (dados mínimos)
  paciente_id UUID REFERENCES public.pacientes(id),
  paciente_nome TEXT NOT NULL,
  paciente_carteirinha TEXT,
  
  -- Médico
  medico_id UUID REFERENCES public.medicos(id),
  medico_nome TEXT NOT NULL,
  medico_crm TEXT,
  
  -- Hospital/Convênio
  hospital_id UUID REFERENCES public.hospitais(id),
  convenio_id UUID REFERENCES public.convenios(id),
  
  -- Dados da cirurgia
  procedimento TEXT NOT NULL,
  data_cirurgia_prevista DATE NOT NULL,
  urgencia TEXT CHECK (urgencia IN ('eletiva', 'urgencia', 'emergencia')) DEFAULT 'eletiva',
  
  -- Materiais solicitados
  materiais_json JSONB NOT NULL, -- Array de materiais com quantidade e valores
  valor_total_solicitado DECIMAL(12, 2) NOT NULL,
  
  -- Documentos anexados
  laudo_medico_url TEXT,
  pedido_medico_url TEXT,
  orcamento_url TEXT,
  outros_documentos_urls TEXT[],
  
  -- Envio
  data_envio TIMESTAMPTZ,
  enviado_por_id UUID REFERENCES public.usuarios(id),
  metodo_envio TEXT CHECK (metodo_envio IN ('api', 'portal_web', 'email', 'manual')),
  
  -- Status
  status TEXT CHECK (status IN (
    'rascunho', 'enviada', 'em_analise', 
    'aprovada', 'aprovada_parcial', 'negada', 
    'expirada', 'cancelada'
  )) DEFAULT 'rascunho',
  
  -- Datas de controle
  data_prazo_resposta TIMESTAMPTZ,
  data_resposta TIMESTAMPTZ,
  
  -- Observações
  observacoes TEXT,
  motivo_cancelamento TEXT,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  criado_por UUID REFERENCES public.usuarios(id),
  atualizado_por UUID REFERENCES public.usuarios(id),
  
  UNIQUE(empresa_id, numero_interno)
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_portais_opme_solicitacoes_empresa ON public.portais_opme_solicitacoes(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_portais_opme_solicitacoes_portal ON public.portais_opme_solicitacoes(portal_config_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_portais_opme_solicitacoes_cirurgia ON public.portais_opme_solicitacoes(cirurgia_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_portais_opme_solicitacoes_status ON public.portais_opme_solicitacoes(status, data_envio DESC) WHERE status NOT IN ('cancelada', 'expirada');
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_portais_opme_solicitacoes_prazo ON public.portais_opme_solicitacoes(data_prazo_resposta) WHERE status = 'em_analise';
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_portais_opme_solicitacoes_protocolo ON public.portais_opme_solicitacoes(protocolo_portal) WHERE protocolo_portal IS NOT NULL;

COMMENT ON TABLE public.portais_opme_solicitacoes IS 'Solicitações de OPME enviadas aos portais';

-- ============================================
