-- =====================================================
-- BLOCO 3.3: Licitações e Propostas
-- Sistema completo de gestão de licitações hospitalares
-- 
-- FUNCIONALIDADES:
-- - Cadastro de licitações (públicas e privadas)
-- - Gestão de propostas comerciais
-- - Documentação anexa (editais, contratos)
-- - Timeline de eventos (abertura, resultado)
-- - Gestão de garantias (caução, seguro)
-- - Acompanhamento de prazos
-- - Análise de viabilidade
-- - Dashboard de licitações ativas
-- 
-- CONTEXTO OPME:
-- - Distribuidoras participam de licitações hospitalares
-- - Pregões eletrônicos (públicos)
-- - Cotações (privadas)
-- - Contratos de longo prazo
-- - Exigências documentais (ANVISA, regularidade fiscal)
-- =====================================================

-- =====================================================
-- TABELA: licitacoes (Licitações e Cotações)
-- =====================================================
CREATE TABLE IF NOT EXISTS licitacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identificação
  numero_edital VARCHAR(100) NOT NULL,
  titulo VARCHAR(300) NOT NULL,
  descricao TEXT,
  
  -- Tipo
  tipo VARCHAR(30) NOT NULL, -- 'pregao_eletronico', 'pregao_presencial', 'concorrencia', 'cotacao_privada', 'dispensa'
  modalidade VARCHAR(30) NOT NULL, -- 'menor_preco', 'tecnica_preco', 'maior_desconto'
  
  -- Órgão comprador
  orgao_comprador_tipo VARCHAR(30) NOT NULL, -- 'hospital_publico', 'hospital_privado', 'plano_saude', 'secretaria_saude'
  orgao_comprador_nome VARCHAR(200) NOT NULL,
  orgao_comprador_cnpj VARCHAR(14),
  orgao_comprador_uf VARCHAR(2),
  orgao_comprador_cidade VARCHAR(100),
  
  -- Portal (se licitação pública)
  portal VARCHAR(50), -- 'comprasnet', 'bll', 'licitanet', 'banrisul'
  url_portal TEXT,
  
  -- Datas importantes
  data_publicacao DATE NOT NULL,
  data_abertura TIMESTAMP WITH TIME ZONE NOT NULL,
  data_encerramento TIMESTAMP WITH TIME ZONE,
  data_resultado TIMESTAMP WITH TIME ZONE,
  prazo_vigencia_inicio DATE, -- Início do contrato (se vencer)
  prazo_vigencia_fim DATE, -- Fim do contrato
  
  -- Valores
  valor_estimado DECIMAL(15,2),
  valor_vencedor DECIMAL(15,2),
  
  -- Status
  status VARCHAR(30) NOT NULL DEFAULT 'publicada', 
  -- 'publicada', 'em_elaboracao', 'enviada', 'em_analise', 'vencida', 'perdida', 'deserta', 'fracassada', 'cancelada'
  
  -- Resultado
  vencedor_nome VARCHAR(200),
  vencedor_cnpj VARCHAR(14),
  nossa_classificacao INTEGER, -- Se participamos, qual nossa posição
  motivo_perda TEXT, -- Se perdemos, por quê
  
  -- Observações
  observacoes TEXT,
  
  -- Produtos envolvidos (JSON array)
  produtos JSONB, -- [{ codigo: 'OPME123', descricao: 'Stent', quantidade: 100, preco_unitario: 5000 }]
  
  -- Responsável interno
  responsavel_id UUID REFERENCES auth.users(id),
  
  -- Auditoria
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id)
);

COMMENT ON TABLE licitacoes IS 'Licitações hospitalares (públicas e privadas)';

CREATE INDEX idx_licitacoes_numero ON licitacoes(numero_edital);
CREATE INDEX idx_licitacoes_status ON licitacoes(status);
CREATE INDEX idx_licitacoes_tipo ON licitacoes(tipo);
CREATE INDEX idx_licitacoes_orgao ON licitacoes(orgao_comprador_nome);
CREATE INDEX idx_licitacoes_abertura ON licitacoes(data_abertura DESC);
CREATE INDEX idx_licitacoes_responsavel ON licitacoes(responsavel_id);

-- =====================================================
-- TABELA: propostas_comerciais (Propostas Enviadas)
-- =====================================================
CREATE TABLE IF NOT EXISTS propostas_comerciais (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Licitação relacionada
  licitacao_id UUID NOT NULL REFERENCES licitacoes(id) ON DELETE CASCADE,
  
  -- Identificação
  numero_proposta VARCHAR(50) NOT NULL UNIQUE,
  versao INTEGER DEFAULT 1, -- Propostas podem ser reenviadas
  
  -- Valores
  valor_total DECIMAL(15,2) NOT NULL,
  desconto_percentual DECIMAL(5,2) DEFAULT 0,
  prazo_pagamento INTEGER, -- dias
  condicoes_pagamento TEXT,
  prazo_entrega INTEGER, -- dias
  
  -- Garantia exigida
  garantia_tipo VARCHAR(30), -- 'caucao', 'seguro_garantia', 'fianca_bancaria'
  garantia_percentual DECIMAL(5,2),
  garantia_valor DECIMAL(15,2),
  
  -- Documentação
  documentos_anexos JSONB, -- [{ nome: 'proposta.pdf', url: 'storage...', tipo: 'proposta' }]
  
  -- Status
  status VARCHAR(30) NOT NULL DEFAULT 'rascunho',
  -- 'rascunho', 'enviada', 'aprovada_interna', 'em_analise', 'aprovada', 'recusada', 'vencedora', 'perdedora'
  
  enviada_em TIMESTAMP WITH TIME ZONE,
  enviada_por UUID REFERENCES auth.users(id),
  
  -- Análise de viabilidade
  margem_bruta_percentual DECIMAL(5,2),
  margem_liquida_percentual DECIMAL(5,2),
  analise_viabilidade TEXT,
  aprovada_comercial BOOLEAN DEFAULT FALSE,
  aprovada_financeiro BOOLEAN DEFAULT FALSE,
  aprovada_diretoria BOOLEAN DEFAULT FALSE,
  
  -- Observações
  observacoes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id)
);

COMMENT ON TABLE propostas_comerciais IS 'Propostas comerciais enviadas para licitações';

CREATE INDEX idx_propostas_licitacao ON propostas_comerciais(licitacao_id);
CREATE INDEX idx_propostas_numero ON propostas_comerciais(numero_proposta);
CREATE INDEX idx_propostas_status ON propostas_comerciais(status);

-- =====================================================
-- TABELA: proposta_itens (Itens da Proposta)
-- =====================================================
CREATE TABLE IF NOT EXISTS proposta_itens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  proposta_id UUID NOT NULL REFERENCES propostas_comerciais(id) ON DELETE CASCADE,
  
  -- Produto
  produto_codigo VARCHAR(50) NOT NULL,
  produto_descricao TEXT NOT NULL,
  registro_anvisa VARCHAR(50),
  fabricante VARCHAR(200),
  
  -- Quantidades e valores
  quantidade DECIMAL(15,3) NOT NULL,
  unidade VARCHAR(10) NOT NULL,
  preco_unitario DECIMAL(15,2) NOT NULL,
  preco_total DECIMAL(15,2) NOT NULL,
  
  -- Custos internos (para análise)
  custo_unitario DECIMAL(15,2),
  margem_unitaria_percentual DECIMAL(5,2),
  
  -- Origem
  origem VARCHAR(30), -- 'nacional', 'importado'
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE proposta_itens IS 'Itens detalhados de cada proposta comercial';

CREATE INDEX idx_proposta_itens_proposta ON proposta_itens(proposta_id);
CREATE INDEX idx_proposta_itens_produto ON proposta_itens(produto_codigo);

-- =====================================================
-- TABELA: licitacao_eventos (Timeline de Eventos)
-- =====================================================
CREATE TABLE IF NOT EXISTS licitacao_eventos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  licitacao_id UUID NOT NULL REFERENCES licitacoes(id) ON DELETE CASCADE,
  
  -- Evento
  tipo VARCHAR(50) NOT NULL, 
  -- 'publicacao', 'esclarecimento', 'impugnacao', 'abertura', 'disputa', 'resultado', 'adjudicacao', 'homologacao'
  titulo VARCHAR(200) NOT NULL,
  descricao TEXT,
  
  data_evento TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Responsável
  responsavel_interno_id UUID REFERENCES auth.users(id),
  
  -- Anexos
  anexos JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

COMMENT ON TABLE licitacao_eventos IS 'Timeline de eventos de cada licitação';

CREATE INDEX idx_eventos_licitacao ON licitacao_eventos(licitacao_id);
CREATE INDEX idx_eventos_data ON licitacao_eventos(data_evento DESC);

-- =====================================================
-- TABELA: licitacao_documentos (Documentos Anexos)
-- =====================================================
CREATE TABLE IF NOT EXISTS licitacao_documentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  licitacao_id UUID NOT NULL REFERENCES licitacoes(id) ON DELETE CASCADE,
  
  -- Documento
  nome VARCHAR(200) NOT NULL,
  tipo VARCHAR(50) NOT NULL, -- 'edital', 'anexo_tecnico', 'contrato', 'ata', 'esclarecimento'
  url TEXT NOT NULL, -- Supabase Storage URL
  tamanho_bytes BIGINT,
  mime_type VARCHAR(100),
  
  -- Metadata
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by UUID REFERENCES auth.users(id)
);

COMMENT ON TABLE licitacao_documentos IS 'Documentos anexos de licitações (editais, contratos)';

CREATE INDEX idx_docs_licitacao ON licitacao_documentos(licitacao_id);
CREATE INDEX idx_docs_tipo ON licitacao_documentos(tipo);

-- =====================================================
-- VIEW: vw_licitacoes_ativas (Licitações Ativas)
-- =====================================================
CREATE OR REPLACE VIEW vw_licitacoes_ativas AS
SELECT
  l.id,
  l.numero_edital,
  l.titulo,
  l.tipo,
  l.modalidade,
  l.orgao_comprador_nome,
  l.orgao_comprador_uf,
  l.data_abertura,
  l.valor_estimado,
  l.status,
  l.responsavel_id,
  u.email AS responsavel_email,
  EXTRACT(DAY FROM (l.data_abertura - NOW())) AS dias_para_abertura,
  (SELECT COUNT(*) FROM propostas_comerciais WHERE licitacao_id = l.id) AS total_propostas,
  (SELECT status FROM propostas_comerciais WHERE licitacao_id = l.id ORDER BY created_at DESC LIMIT 1) AS status_ultima_proposta
FROM licitacoes l
LEFT JOIN auth.users u ON l.responsavel_id = u.id
WHERE l.status IN ('publicada', 'em_elaboracao', 'enviada', 'em_analise')
  AND l.data_abertura >= NOW()
ORDER BY l.data_abertura;

COMMENT ON VIEW vw_licitacoes_ativas IS 'Licitações ativas (ainda não encerradas)';

-- =====================================================
-- VIEW: vw_propostas_pendentes (Propostas Pendentes Aprovação)
-- =====================================================
CREATE OR REPLACE VIEW vw_propostas_pendentes AS
SELECT
  p.id,
  p.numero_proposta,
  p.valor_total,
  p.margem_bruta_percentual,
  p.margem_liquida_percentual,
  p.status,
  p.aprovada_comercial,
  p.aprovada_financeiro,
  p.aprovada_diretoria,
  l.numero_edital,
  l.titulo AS licitacao_titulo,
  l.orgao_comprador_nome,
  l.data_abertura,
  EXTRACT(DAY FROM (l.data_abertura - NOW())) AS dias_para_abertura
FROM propostas_comerciais p
JOIN licitacoes l ON p.licitacao_id = l.id
WHERE p.status IN ('rascunho', 'em_analise')
  AND (p.aprovada_comercial = FALSE OR p.aprovada_financeiro = FALSE OR p.aprovada_diretoria = FALSE)
ORDER BY l.data_abertura;

COMMENT ON VIEW vw_propostas_pendentes IS 'Propostas pendentes de aprovação (comercial, financeiro, diretoria)';

-- =====================================================
-- FUNCTION: Calcular taxa de sucesso em licitações
-- =====================================================
CREATE OR REPLACE FUNCTION calcular_taxa_sucesso_licitacoes(
  p_data_inicio DATE DEFAULT NULL,
  p_data_fim DATE DEFAULT NULL
)
RETURNS TABLE(
  total_participadas BIGINT,
  total_vencidas BIGINT,
  total_perdidas BIGINT,
  taxa_sucesso DECIMAL,
  valor_total_vencido DECIMAL,
  valor_total_perdido DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) AS total_participadas,
    COUNT(*) FILTER (WHERE l.status = 'vencida') AS total_vencidas,
    COUNT(*) FILTER (WHERE l.status = 'perdida') AS total_perdidas,
    ROUND(
      (COUNT(*) FILTER (WHERE l.status = 'vencida')::DECIMAL / NULLIF(COUNT(*), 0)) * 100,
      2
    ) AS taxa_sucesso,
    COALESCE(SUM(l.valor_vencedor) FILTER (WHERE l.status = 'vencida'), 0) AS valor_total_vencido,
    COALESCE(SUM(l.valor_estimado) FILTER (WHERE l.status = 'perdida'), 0) AS valor_total_perdido
  FROM licitacoes l
  WHERE (p_data_inicio IS NULL OR l.data_abertura >= p_data_inicio)
    AND (p_data_fim IS NULL OR l.data_abertura <= p_data_fim)
    AND l.status IN ('vencida', 'perdida');
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calcular_taxa_sucesso_licitacoes IS 'Calcula taxa de sucesso em licitações (vencidas/participadas)';

-- =====================================================
-- FUNCTION: Criar evento automático de licitação
-- =====================================================
CREATE OR REPLACE FUNCTION criar_evento_licitacao(
  p_licitacao_id UUID,
  p_tipo VARCHAR,
  p_titulo VARCHAR,
  p_descricao TEXT DEFAULT NULL,
  p_data_evento TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_evento_id UUID;
BEGIN
  INSERT INTO licitacao_eventos (
    licitacao_id,
    tipo,
    titulo,
    descricao,
    data_evento,
    created_by
  ) VALUES (
    p_licitacao_id,
    p_tipo,
    p_titulo,
    p_descricao,
    p_data_evento,
    auth.uid()
  )
  RETURNING id INTO v_evento_id;
  
  RETURN v_evento_id;
END;
$$;

COMMENT ON FUNCTION criar_evento_licitacao IS 'Cria um evento na timeline da licitação';

-- =====================================================
-- RLS (Row Level Security)
-- =====================================================
ALTER TABLE licitacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE propostas_comerciais ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposta_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE licitacao_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE licitacao_documentos ENABLE ROW LEVEL SECURITY;

-- Políticas: Comercial e Gerentes veem tudo
CREATE POLICY "Comercial veem licitações" ON licitacoes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'gerente_geral', 'gerente_comercial', 'analista_comercial', 'vendedor')
  )
);

CREATE POLICY "Comercial gerenciam propostas" ON propostas_comerciais FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'gerente_geral', 'gerente_comercial', 'analista_comercial')
  )
);

-- =====================================================
-- SEED: Tipos de licitação (comentários para referência)
-- =====================================================
-- Tipos:
-- - pregao_eletronico: Pregão Eletrônico (Lei 10.520/2002)
-- - pregao_presencial: Pregão Presencial
-- - concorrencia: Concorrência (Lei 8.666/93)
-- - cotacao_privada: Cotação de hospitais privados
-- - dispensa: Dispensa de licitação (valores baixos)

-- Modalidades:
-- - menor_preco: Menor preço vence
-- - tecnica_preco: Avaliação técnica + preço
-- - maior_desconto: Maior desconto sobre tabela

-- Status:
-- - publicada: Licitação publicada, ainda não participamos
-- - em_elaboracao: Proposta em elaboração
-- - enviada: Proposta enviada, aguardando abertura
-- - em_analise: Em análise pelo comprador
-- - vencida: Vencemos a licitação!
-- - perdida: Perdemos
-- - deserta: Nenhum fornecedor apresentou proposta
-- - fracassada: Todos fornecedores foram desclassificados
-- - cancelada: Licitação cancelada pelo órgão

-- =====================================================
-- COMMENTS (Documentação)
-- =====================================================
COMMENT ON TABLE licitacoes IS 'Licitações hospitalares (públicas e privadas) - Lei 8.666/93 e 10.520/2002';
COMMENT ON TABLE propostas_comerciais IS 'Propostas comerciais enviadas (com aprovação comercial/financeiro/diretoria)';
COMMENT ON TABLE proposta_itens IS 'Itens detalhados de cada proposta (produtos OPME)';
COMMENT ON TABLE licitacao_eventos IS 'Timeline de eventos (publicação, esclarecimentos, resultado)';
COMMENT ON TABLE licitacao_documentos IS 'Documentos anexos (editais, contratos, atas)';
COMMENT ON FUNCTION calcular_taxa_sucesso_licitacoes IS 'Taxa de sucesso = licitações vencidas / total participadas';
COMMENT ON FUNCTION criar_evento_licitacao IS 'Cria evento na timeline (publicação, abertura, resultado)';

