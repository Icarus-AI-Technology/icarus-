-- ═══════════════════════════════════════════════════════════
-- MÓDULO: COMPLIANCE & AUDITORIA AVANÇADO
-- Sistema: ICARUS v5.0
-- Descrição: Gestão regulatória completa (ANVISA, ISO, Abbott)
-- Tabelas: 10
-- Data: 19/10/2025
-- ═══════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════
-- 1. TABELA: compliance_requisitos
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS compliance_requisitos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  codigo VARCHAR(20) UNIQUE NOT NULL, -- ABB001, ABB002, etc
  categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('qualidade', 'rastreabilidade', 'armazenamento', 'transporte', 'documentacao', 'treinamento', 'etica')),
  
  -- Fabricante/Regulador
  fabricante VARCHAR(50) CHECK (fabricante IN ('abbott', 'medtronic', 'jnj', 'stryker', 'boston_scientific', 'anvisa', 'iso', 'todos')),
  
  -- Requisito
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  
  -- Status de Conformidade
  status VARCHAR(20) DEFAULT 'conforme' CHECK (status IN ('conforme', 'nao_conforme', 'parcial', 'nao_aplicavel')),
  score_conformidade DECIMAL(5,2) DEFAULT 0 CHECK (score_conformidade BETWEEN 0 AND 100),
  
  -- Evidências
  evidencias TEXT[], -- Array de evidências
  documentos_anexados TEXT[], -- Array de paths de arquivos
  
  -- Auditorias
  data_ultima_auditoria DATE,
  proxima_auditoria DATE,
  
  -- Responsabilidades
  responsavel VARCHAR(255),
  responsavel_cargo VARCHAR(100),
  responsavel_email VARCHAR(255),
  
  -- Ações Corretivas
  acoes_corretivas TEXT[],
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_compliance_requisitos_fabricante ON compliance_requisitos(fabricante);
CREATE INDEX idx_compliance_requisitos_categoria ON compliance_requisitos(categoria);
CREATE INDEX idx_compliance_requisitos_status ON compliance_requisitos(status);

-- ═══════════════════════════════════════════════════════════
-- 2. TABELA: auditorias_internas
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS auditorias_internas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  codigo VARCHAR(50) UNIQUE NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  
  -- Tipo
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('iso_13485', 'anvisa', 'fabricante', 'bpd', 'interna')),
  fabricante_alvo VARCHAR(50) CHECK (fabricante_alvo IN ('abbott', 'medtronic', 'jnj', 'stryker', 'boston_scientific', 'todos')),
  
  -- Cronograma
  data_planejamento DATE,
  data_execucao DATE,
  data_conclusao DATE,
  
  -- Status
  status VARCHAR(20) DEFAULT 'planejada' CHECK (status IN ('planejada', 'em_andamento', 'concluida', 'cancelada')),
  
  -- Equipe
  auditor_lider VARCHAR(255),
  equipe_auditoria TEXT[], -- Array de nomes
  
  -- Escopo
  areas_auditadas TEXT[], -- Array de áreas
  
  -- Resultados
  score_global DECIMAL(5,2) CHECK (score_global BETWEEN 0 AND 100),
  nao_conformidades_criticas INTEGER DEFAULT 0,
  nao_conformidades_maiores INTEGER DEFAULT 0,
  nao_conformidades_menores INTEGER DEFAULT 0,
  observacoes_positivas TEXT[],
  
  -- Documentação
  relatorio_pdf VARCHAR(500),
  plano_acao_gerado BOOLEAN DEFAULT FALSE,
  
  -- Observações
  observacoes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_auditorias_internas_tipo ON auditorias_internas(tipo);
CREATE INDEX idx_auditorias_internas_status ON auditorias_internas(status);
CREATE INDEX idx_auditorias_internas_data_execucao ON auditorias_internas(data_execucao);

-- ═══════════════════════════════════════════════════════════
-- 3. TABELA: checklist_auditoria
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS checklist_auditoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Auditoria
  auditoria_id UUID REFERENCES auditorias_internas(id) ON DELETE CASCADE,
  
  -- Item do Checklist
  categoria VARCHAR(100) NOT NULL,
  requisito VARCHAR(100) NOT NULL,
  descricao TEXT,
  
  -- Avaliação
  conforme BOOLEAN,
  evidencia TEXT,
  observacoes TEXT,
  
  -- Criticidade
  criticidade VARCHAR(20) DEFAULT 'menor' CHECK (criticidade IN ('critica', 'maior', 'menor')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_checklist_auditoria_auditoria ON checklist_auditoria(auditoria_id);
CREATE INDEX idx_checklist_auditoria_conforme ON checklist_auditoria(conforme);

-- ═══════════════════════════════════════════════════════════
-- 4. TABELA: nao_conformidades
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS nao_conformidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  codigo_nc VARCHAR(50) UNIQUE NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descricao_completa TEXT,
  
  -- Classificação
  categoria VARCHAR(100),
  severidade VARCHAR(20) NOT NULL CHECK (severidade IN ('critica', 'maior', 'menor', 'observacao')),
  origem VARCHAR(50) NOT NULL CHECK (origem IN ('auditoria_interna', 'auditoria_externa', 'cliente', 'fornecedor', 'autoinspecao')),
  
  -- Relacionamento
  auditoria_id UUID REFERENCES auditorias_internas(id),
  
  -- Cronograma
  data_identificacao DATE NOT NULL,
  data_prazo_correcao DATE NOT NULL,
  data_correcao_efetiva DATE,
  
  -- Status
  status VARCHAR(30) DEFAULT 'aberta' CHECK (status IN ('aberta', 'em_analise', 'em_correcao', 'aguardando_verificacao', 'verificada', 'fechada')),
  
  -- Responsabilidades
  responsavel_analise VARCHAR(255),
  responsavel_correcao VARCHAR(255),
  
  -- Análise de Causa Raiz
  causa_raiz TEXT,
  
  -- Plano de Ação
  acao_imediata TEXT,
  acao_corretiva TEXT,
  acao_preventiva TEXT,
  
  -- Impacto
  custo_estimado DECIMAL(12,2),
  custo_real DECIMAL(12,2),
  impacto_negocio TEXT,
  impacto_cliente TEXT,
  
  -- Evidências
  evidencias_correcao TEXT[],
  
  -- Verificação
  verificacao_eficacia BOOLEAN DEFAULT FALSE,
  reincidencia BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_nao_conformidades_severidade ON nao_conformidades(severidade);
CREATE INDEX idx_nao_conformidades_status ON nao_conformidades(status);
CREATE INDEX idx_nao_conformidades_auditoria ON nao_conformidades(auditoria_id);
CREATE INDEX idx_nao_conformidades_prazo ON nao_conformidades(data_prazo_correcao);

-- ═══════════════════════════════════════════════════════════
-- 5. TABELA: treinamentos_certificacoes
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS treinamentos_certificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  codigo VARCHAR(50) UNIQUE NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  
  -- Tipo
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('inicial', 'reciclagem', 'especializacao', 'compliance', 'tecnico')),
  fabricante VARCHAR(50) CHECK (fabricante IN ('abbott', 'medtronic', 'jnj', 'stryker', 'boston_scientific', 'geral')),
  categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('opme', 'qualidade', 'regulatorio', 'etica', 'seguranca', 'operacional')),
  
  -- Configuração
  duracao_horas INTEGER NOT NULL,
  modalidade VARCHAR(20) NOT NULL CHECK (modalidade IN ('presencial', 'online', 'hibrido')),
  instrutor VARCHAR(255),
  data_realizacao DATE NOT NULL,
  
  -- Conteúdo
  conteudo_programatico TEXT[],
  
  -- Avaliação
  avaliacao_final BOOLEAN DEFAULT TRUE,
  nota_minima_aprovacao DECIMAL(4,2) DEFAULT 7.0,
  
  -- Certificação
  certificado_emitido BOOLEAN DEFAULT FALSE,
  validade_certificado_meses INTEGER DEFAULT 24,
  
  -- Status
  status VARCHAR(20) DEFAULT 'agendado' CHECK (status IN ('agendado', 'em_andamento', 'concluido', 'cancelado')),
  
  -- Estatísticas
  total_participantes INTEGER DEFAULT 0,
  total_aprovados INTEGER DEFAULT 0,
  total_reprovados INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_treinamentos_certificacoes_tipo ON treinamentos_certificacoes(tipo);
CREATE INDEX idx_treinamentos_certificacoes_fabricante ON treinamentos_certificacoes(fabricante);
CREATE INDEX idx_treinamentos_certificacoes_data ON treinamentos_certificacoes(data_realizacao);
CREATE INDEX idx_treinamentos_certificacoes_status ON treinamentos_certificacoes(status);

-- ═══════════════════════════════════════════════════════════
-- 6. TABELA: participantes_treinamento
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS participantes_treinamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Treinamento
  treinamento_id UUID REFERENCES treinamentos_certificacoes(id) ON DELETE CASCADE,
  
  -- Participante
  usuario_id UUID REFERENCES usuarios(id),
  nome VARCHAR(255) NOT NULL,
  cargo VARCHAR(100),
  departamento VARCHAR(100),
  
  -- Avaliação
  nota_final DECIMAL(4,2),
  aprovado BOOLEAN,
  presenca_percentual DECIMAL(5,2) DEFAULT 100,
  
  -- Certificação
  certificado_numero VARCHAR(100),
  data_emissao_certificado DATE,
  data_validade_certificado DATE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_participantes_treinamento_treinamento ON participantes_treinamento(treinamento_id);
CREATE INDEX idx_participantes_treinamento_usuario ON participantes_treinamento(usuario_id);
CREATE INDEX idx_participantes_treinamento_aprovado ON participantes_treinamento(aprovado);

-- ═══════════════════════════════════════════════════════════
-- 7. TABELA: rastreabilidade_opme_compliance
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS rastreabilidade_opme_compliance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Produto
  produto_id UUID REFERENCES produtos_opme(id),
  produto_nome VARCHAR(255) NOT NULL,
  fabricante VARCHAR(255) NOT NULL,
  codigo_anvisa VARCHAR(20),
  
  -- Rastreabilidade
  lote VARCHAR(50) NOT NULL,
  numero_serie VARCHAR(100),
  validade DATE NOT NULL,
  
  -- Movimentação
  data_entrada DATE NOT NULL,
  data_saida DATE,
  hospital_destino_id UUID REFERENCES hospitais(id),
  hospital_destino VARCHAR(255),
  paciente_id UUID, -- Protegido por LGPD
  cirurgia_id UUID REFERENCES cirurgias(id),
  
  -- Status
  status VARCHAR(20) NOT NULL CHECK (status IN ('estoque', 'consignado', 'implantado', 'devolvido', 'descartado')),
  
  -- Condições
  temperatura_armazenamento DECIMAL(5,2),
  umidade_armazenamento DECIMAL(5,2),
  responsavel_armazenamento VARCHAR(255),
  
  -- Transporte
  certificado_transporte VARCHAR(500),
  datalogger_numero VARCHAR(100),
  
  -- Validação
  rastreamento_completo BOOLEAN DEFAULT FALSE,
  compliance_abbott BOOLEAN DEFAULT FALSE,
  compliance_anvisa BOOLEAN DEFAULT FALSE,
  
  -- Notificações
  notificacao_anvisa_enviada BOOLEAN DEFAULT FALSE,
  notificacao_fabricante_enviada BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rastreabilidade_opme_compliance_produto ON rastreabilidade_opme_compliance(produto_id);
CREATE INDEX idx_rastreabilidade_opme_compliance_lote ON rastreabilidade_opme_compliance(lote);
CREATE INDEX idx_rastreabilidade_opme_compliance_serie ON rastreabilidade_opme_compliance(numero_serie);
CREATE INDEX idx_rastreabilidade_opme_compliance_status ON rastreabilidade_opme_compliance(status);

-- ═══════════════════════════════════════════════════════════
-- 8. TABELA: agentes_ia_compliance
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS agentes_ia_compliance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('compliance', 'documentacao', 'auditoria', 'treinamento', 'risco')),
  
  -- Status
  status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'processando', 'erro')),
  ultima_execucao TIMESTAMPTZ,
  proxima_execucao TIMESTAMPTZ,
  
  -- Performance
  alertas_gerados INTEGER DEFAULT 0,
  acoes_sugeridas INTEGER DEFAULT 0,
  taxa_acerto DECIMAL(5,2) DEFAULT 0 CHECK (taxa_acerto BETWEEN 0 AND 100),
  falsos_positivos INTEGER DEFAULT 0,
  falsos_negativos INTEGER DEFAULT 0,
  
  -- Configuração
  frequencia_analise VARCHAR(20) DEFAULT 'diaria' CHECK (frequencia_analise IN ('tempo_real', 'horaria', 'diaria', 'semanal')),
  nivel_sensibilidade VARCHAR(20) DEFAULT 'medio' CHECK (nivel_sensibilidade IN ('baixo', 'medio', 'alto', 'critico')),
  auto_correcao_habilitada BOOLEAN DEFAULT FALSE,
  notificacoes_habilitadas BOOLEAN DEFAULT TRUE,
  integracao_externa BOOLEAN DEFAULT FALSE,
  
  -- Modelo de IA
  modelo VARCHAR(100),
  versao_modelo VARCHAR(20),
  ultima_atualizacao_modelo DATE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agentes_ia_compliance_tipo ON agentes_ia_compliance(tipo);
CREATE INDEX idx_agentes_ia_compliance_status ON agentes_ia_compliance(status);

-- ═══════════════════════════════════════════════════════════
-- 9. TABELA: alertas_compliance
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS alertas_compliance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Agente Gerador
  agente_id UUID REFERENCES agentes_ia_compliance(id),
  
  -- Tipo de Alerta
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('vencimento_certificacao', 'treinamento_vencido', 'auditoria_programada', 'nao_conformidade', 'documento_revisao', 'calibracao_vencida')),
  
  -- Relacionamentos
  requisito_id UUID REFERENCES compliance_requisitos(id),
  auditoria_id UUID REFERENCES auditorias_internas(id),
  nc_id UUID REFERENCES nao_conformidades(id),
  treinamento_id UUID REFERENCES treinamentos_certificacoes(id),
  
  -- Alerta
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT NOT NULL,
  severidade VARCHAR(20) DEFAULT 'aviso' CHECK (severidade IN ('aviso', 'urgente', 'critico')),
  
  -- Análise do Agente IA
  analise_ia TEXT,
  acao_sugerida TEXT,
  prioridade INTEGER DEFAULT 3 CHECK (prioridade BETWEEN 1 AND 5),
  
  -- Status
  status VARCHAR(20) DEFAULT 'novo' CHECK (status IN ('novo', 'visualizado', 'em_acao', 'resolvido', 'ignorado')),
  
  -- Responsável
  responsavel VARCHAR(255),
  responsavel_cargo VARCHAR(100),
  prazo DATE,
  
  -- Datas
  data_geracao TIMESTAMPTZ DEFAULT NOW(),
  data_visualizacao TIMESTAMPTZ,
  data_resolucao TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alertas_compliance_tipo ON alertas_compliance(tipo);
CREATE INDEX idx_alertas_compliance_severidade ON alertas_compliance(severidade);
CREATE INDEX idx_alertas_compliance_status ON alertas_compliance(status);
CREATE INDEX idx_alertas_compliance_agente ON alertas_compliance(agente_id);

-- ═══════════════════════════════════════════════════════════
-- 10. TABELA: documentacao_tecnica
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS documentacao_tecnica (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  codigo VARCHAR(50) UNIQUE NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('manual', 'pop', 'procedimento', 'formulario', 'politica', 'certificado', 'relatorio')),
  
  -- Versão e Revisão
  versao VARCHAR(20) NOT NULL,
  data_versao DATE NOT NULL,
  data_proxima_revisao DATE,
  
  -- Status
  status VARCHAR(20) DEFAULT 'vigente' CHECK (status IN ('rascunho', 'em_revisao', 'aprovado', 'vigente', 'obsoleto')),
  
  -- Aprovações
  elaborado_por VARCHAR(255),
  revisado_por VARCHAR(255),
  aprovado_por VARCHAR(255),
  data_aprovacao DATE,
  
  -- Conteúdo
  descricao TEXT,
  caminho_arquivo VARCHAR(500),
  tamanho_bytes INTEGER,
  hash_md5 VARCHAR(32),
  
  -- Conformidade
  iso_13485 BOOLEAN DEFAULT FALSE,
  anvisa_rdc_16 BOOLEAN DEFAULT FALSE,
  fabricante_requisito BOOLEAN DEFAULT FALSE,
  
  -- Controle
  numero_paginas INTEGER,
  palavras_chave TEXT[],
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documentacao_tecnica_tipo ON documentacao_tecnica(tipo);
CREATE INDEX idx_documentacao_tecnica_status ON documentacao_tecnica(status);
CREATE INDEX idx_documentacao_tecnica_revisao ON documentacao_tecnica(data_proxima_revisao);

-- ═══════════════════════════════════════════════════════════
-- VIEWS PARA DASHBOARDS
-- ═══════════════════════════════════════════════════════════

-- View: Score Global Abbott
CREATE OR REPLACE VIEW vw_score_abbott AS
SELECT
  AVG(score_conformidade) AS score_global,
  COUNT(*) AS total_requisitos,
  SUM(CASE WHEN status = 'conforme' THEN 1 ELSE 0 END) AS requisitos_conformes,
  SUM(CASE WHEN status = 'nao_conforme' THEN 1 ELSE 0 END) AS requisitos_nao_conformes,
  SUM(CASE WHEN status = 'parcial' THEN 1 ELSE 0 END) AS requisitos_parciais
FROM compliance_requisitos
WHERE fabricante = 'abbott';

-- View: Estatísticas de Auditorias
CREATE OR REPLACE VIEW vw_estatisticas_auditorias AS
SELECT
  COUNT(*) AS total_auditorias,
  AVG(score_global) AS score_medio,
  SUM(nao_conformidades_criticas) AS total_nc_criticas,
  SUM(nao_conformidades_maiores) AS total_nc_maiores,
  SUM(nao_conformidades_menores) AS total_nc_menores,
  SUM(CASE WHEN status = 'concluida' THEN 1 ELSE 0 END) AS auditorias_concluidas
FROM auditorias_internas
WHERE EXTRACT(YEAR FROM data_execucao) = EXTRACT(YEAR FROM CURRENT_DATE);

-- View: Treinamentos Vencendo
CREATE OR REPLACE VIEW vw_treinamentos_vencendo AS
SELECT
  pt.nome,
  pt.cargo,
  tc.titulo AS treinamento,
  tc.fabricante,
  pt.data_validade_certificado,
  (pt.data_validade_certificado - CURRENT_DATE) AS dias_ate_vencimento
FROM participantes_treinamento pt
INNER JOIN treinamentos_certificacoes tc ON pt.treinamento_id = tc.id
WHERE pt.aprovado = TRUE
  AND pt.data_validade_certificado <= CURRENT_DATE + INTERVAL '30 days'
  AND pt.data_validade_certificado >= CURRENT_DATE
ORDER BY pt.data_validade_certificado;

-- ═══════════════════════════════════════════════════════════
-- FUNCTIONS
-- ═══════════════════════════════════════════════════════════

-- Function: Atualizar score global de requisitos
CREATE OR REPLACE FUNCTION atualizar_scores_compliance()
RETURNS VOID AS $$
BEGIN
  -- Atualizar score baseado em evidências e conformidade
  UPDATE compliance_requisitos
  SET
    score_conformidade = CASE
      WHEN status = 'conforme' THEN 100.0
      WHEN status = 'parcial' THEN 50.0
      WHEN status = 'nao_conforme' THEN 0.0
      ELSE 0.0
    END,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function: Gerar alertas de agentes IA
CREATE OR REPLACE FUNCTION gerar_alertas_ia()
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

