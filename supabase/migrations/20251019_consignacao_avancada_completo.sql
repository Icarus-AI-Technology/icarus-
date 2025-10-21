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

CREATE TABLE IF NOT EXISTS contratos_consignacao (
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

CREATE INDEX idx_contratos_consignacao_hospital ON contratos_consignacao(hospital_id);
CREATE INDEX idx_contratos_consignacao_status ON contratos_consignacao(status);
CREATE INDEX idx_contratos_consignacao_vencimento ON contratos_consignacao(prazo_vencimento);

-- ═══════════════════════════════════════════════════════════
-- 2. TABELA: materiais_consignados
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS materiais_consignados (
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

CREATE INDEX idx_materiais_consignados_produto ON materiais_consignados(produto_id);
CREATE INDEX idx_materiais_consignados_hospital ON materiais_consignados(hospital_id);
CREATE INDEX idx_materiais_consignados_contrato ON materiais_consignados(contrato_id);
CREATE INDEX idx_materiais_consignados_status ON materiais_consignados(status);
CREATE INDEX idx_materiais_consignados_lote ON materiais_consignados(lote);
CREATE INDEX idx_materiais_consignados_validade ON materiais_consignados(validade);

-- ═══════════════════════════════════════════════════════════
-- 3. TABELA: movimentacoes_consignacao
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS movimentacoes_consignacao (
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

CREATE INDEX idx_movimentacoes_consignacao_material ON movimentacoes_consignacao(material_consignado_id);
CREATE INDEX idx_movimentacoes_consignacao_tipo ON movimentacoes_consignacao(tipo);
CREATE INDEX idx_movimentacoes_consignacao_data ON movimentacoes_consignacao(data_movimentacao);
CREATE INDEX idx_movimentacoes_consignacao_cirurgia ON movimentacoes_consignacao(cirurgia_id);

-- ═══════════════════════════════════════════════════════════
-- 4. TABELA: faturamento_consignacao
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS faturamento_consignacao (
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

CREATE INDEX idx_faturamento_consignacao_hospital ON faturamento_consignacao(hospital_id);
CREATE INDEX idx_faturamento_consignacao_status ON faturamento_consignacao(status);
CREATE INDEX idx_faturamento_consignacao_periodo ON faturamento_consignacao(periodo);
CREATE INDEX idx_faturamento_consignacao_vencimento ON faturamento_consignacao(data_vencimento);

-- ═══════════════════════════════════════════════════════════
-- 5. TABELA: faturamento_consignacao_itens
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS faturamento_consignacao_itens (
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

CREATE INDEX idx_faturamento_consignacao_itens_fatura ON faturamento_consignacao_itens(fatura_id);
CREATE INDEX idx_faturamento_consignacao_itens_material ON faturamento_consignacao_itens(material_consignado_id);

-- ═══════════════════════════════════════════════════════════
-- 6. TABELA: alertas_consignacao
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS alertas_consignacao (
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

CREATE INDEX idx_alertas_consignacao_tipo ON alertas_consignacao(tipo);
CREATE INDEX idx_alertas_consignacao_severidade ON alertas_consignacao(severidade);
CREATE INDEX idx_alertas_consignacao_status ON alertas_consignacao(status);
CREATE INDEX idx_alertas_consignacao_hospital ON alertas_consignacao(hospital_id);

-- ═══════════════════════════════════════════════════════════
-- 7. TABELA: conferencias_consignacao
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS conferencias_consignacao (
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

CREATE INDEX idx_conferencias_consignacao_hospital ON conferencias_consignacao(hospital_id);
CREATE INDEX idx_conferencias_consignacao_data ON conferencias_consignacao(data_conferencia);
CREATE INDEX idx_conferencias_consignacao_status ON conferencias_consignacao(status);

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

