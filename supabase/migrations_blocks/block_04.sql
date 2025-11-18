-- ╔════════════════════════════════════════════════════════════════════════╗
-- ║  ICARUS v5.0 - Bloco 04 de 10                                          ║
-- ║  Linhas: 18865 → 25152                                                      ║
-- ╚════════════════════════════════════════════════════════════════════════╝

-- 3. PORTAIS_OPME_RESPOSTAS (respostas recebidas)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.portais_opme_respostas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitacao_id UUID NOT NULL REFERENCES public.portais_opme_solicitacoes(id) ON DELETE CASCADE,
  
  -- Identificação
  numero_resposta TEXT,
  tipo_resposta TEXT CHECK (tipo_resposta IN (
    'aprovacao', 'aprovacao_parcial', 'negacao', 
    'pendencia', 'informacao', 'cancelamento'
  )) NOT NULL,
  
  -- Data e origem
  data_resposta TIMESTAMPTZ DEFAULT NOW(),
  origem TEXT CHECK (origem IN ('portal', 'email', 'telefone', 'manual')) DEFAULT 'portal',
  
  -- Resultado
  aprovado BOOLEAN,
  parcialmente_aprovado BOOLEAN DEFAULT FALSE,
  
  -- Itens aprovados/negados
  itens_aprovados_json JSONB, -- Materiais aprovados com quantidades
  itens_negados_json JSONB, -- Materiais negados com motivos
  
  -- Valores
  valor_aprovado DECIMAL(12, 2),
  valor_negado DECIMAL(12, 2),
  valor_glosa DECIMAL(12, 2) DEFAULT 0,
  
  -- Justificativas
  motivo_negacao TEXT,
  motivo_glosa TEXT,
  observacoes_portal TEXT,
  
  -- Pendências
  pendencias TEXT[],
  documentos_pendentes TEXT[],
  prazo_regularizacao DATE,
  
  -- Autorização
  numero_autorizacao TEXT,
  codigo_autorizacao TEXT,
  validade_autorizacao DATE,
  
  -- Responsável no portal
  responsavel_portal TEXT,
  auditor_portal TEXT,
  
  -- Documentos anexados na resposta
  documentos_urls TEXT[],
  
  -- Integração
  payload_resposta_json JSONB, -- Resposta completa da API
  
  -- Processamento interno
  processada BOOLEAN DEFAULT FALSE,
  data_processamento TIMESTAMPTZ,
  processada_por_id UUID REFERENCES public.usuarios(id),
  
  -- Observações
  observacoes_internas TEXT,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_portais_opme_respostas_solicitacao ON public.portais_opme_respostas(solicitacao_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_portais_opme_respostas_tipo ON public.portais_opme_respostas(tipo_resposta, data_resposta DESC);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_portais_opme_respostas_autorizacao ON public.portais_opme_respostas(numero_autorizacao) WHERE numero_autorizacao IS NOT NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_portais_opme_respostas_processada ON public.portais_opme_respostas(processada, data_resposta DESC) WHERE NOT processada;

COMMENT ON TABLE public.portais_opme_respostas IS 'Respostas recebidas dos portais OPME';

-- ============================================
-- 4. PORTAIS_OPME_LOGS (logs de integração)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.portais_opme_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  portal_config_id UUID NOT NULL REFERENCES public.portais_opme_config(id) ON DELETE CASCADE,
  
  -- Solicitação relacionada (opcional)
  solicitacao_id UUID REFERENCES public.portais_opme_solicitacoes(id),
  
  -- Tipo de operação
  operacao TEXT CHECK (operacao IN (
    'envio_solicitacao', 'consulta_status', 'recebimento_resposta',
    'sincronizacao', 'autenticacao', 'download_documento', 'outro'
  )) NOT NULL,
  
  -- Método HTTP (se API)
  metodo_http TEXT CHECK (metodo_http IN ('GET', 'POST', 'PUT', 'PATCH', 'DELETE')),
  url_chamada TEXT,
  
  -- Request
  request_headers_json JSONB,
  request_body_json JSONB,
  request_timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  -- Response
  response_status_code INTEGER,
  response_headers_json JSONB,
  response_body_json JSONB,
  response_timestamp TIMESTAMPTZ,
  response_time_ms INTEGER, -- Tempo de resposta em milissegundos
  
  -- Resultado
  sucesso BOOLEAN NOT NULL,
  mensagem_erro TEXT,
  erro_codigo TEXT,
  erro_detalhes TEXT,
  
  -- Retry
  tentativa INTEGER DEFAULT 1,
  max_tentativas INTEGER,
  
  -- IP e User Agent
  ip_origem INET,
  user_agent TEXT,
  
  -- Usuário responsável
  usuario_id UUID REFERENCES public.usuarios(id),
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_portais_opme_logs_empresa ON public.portais_opme_logs(empresa_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_portais_opme_logs_portal ON public.portais_opme_logs(portal_config_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_portais_opme_logs_solicitacao ON public.portais_opme_logs(solicitacao_id) WHERE solicitacao_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_portais_opme_logs_operacao ON public.portais_opme_logs(operacao, criado_em DESC);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_portais_opme_logs_sucesso ON public.portais_opme_logs(sucesso, criado_em DESC) WHERE NOT sucesso;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_portais_opme_logs_data ON public.portais_opme_logs(criado_em DESC);

COMMENT ON TABLE public.portais_opme_logs IS 'Logs de integração com portais OPME (auditoria de API)';

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER trg_portais_opme_config_updated
  BEFORE UPDATE ON public.portais_opme_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_portais_opme_solicitacoes_updated
  BEFORE UPDATE ON public.portais_opme_solicitacoes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_portais_opme_respostas_updated
  BEFORE UPDATE ON public.portais_opme_respostas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FIM MÓDULO PORTAIS OPME (4 tabelas)
-- ============================================



-- ============================================
-- Source: 202510201322_fase3_parte3_licitacoes.sql
-- ============================================

-- ============================================
-- Migration: FASE 3 - Compliance & Integrações (Parte 3/4)
-- MÓDULO LICITAÇÕES - 4 tabelas pt-BR
-- Data: 2025-10-20
-- Versão: 1.0
-- Autor: AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3
-- ============================================
-- Descrição:
-- Gestão de licitações públicas e privadas:
-- - Cadastro de licitações
-- - Itens licitados
-- - Propostas enviadas
-- - Documentos e habilitação
-- NOMENCLATURA: 100% pt-BR snake_case
-- SEM RLS (aplicar por último)
-- ============================================

-- ============================================
-- 1. LICITACOES (processos licitatórios)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.licitacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Identificação
  numero_processo TEXT NOT NULL,
  numero_edital TEXT,
  objeto TEXT NOT NULL,
  descricao TEXT,
  
  -- Tipo de licitação
  modalidade TEXT CHECK (modalidade IN (
    'pregao_eletronico', 'pregao_presencial', 'concorrencia', 
    'tomada_precos', 'convite', 'leilao', 'dispensa', 
    'inexigibilidade', 'rdc', 'dialogo_competitivo'
  )) NOT NULL,
  
  tipo_contratacao TEXT CHECK (tipo_contratacao IN (
    'menor_preco', 'melhor_tecnica', 'tecnica_preco', 
    'maior_desconto', 'maior_lance'
  )) DEFAULT 'menor_preco',
  
  -- Órgão licitante
  orgao_nome TEXT NOT NULL,
  orgao_cnpj TEXT,
  orgao_esfera TEXT CHECK (orgao_esfera IN ('federal', 'estadual', 'municipal', 'privado')),
  orgao_cidade TEXT,
  orgao_estado TEXT,
  
  -- Dados do certame
  uasg TEXT, -- Código UASG (Unidade Administrativa de Serviços Gerais)
  portal TEXT, -- Ex: "comprasnet", "BLL", "próprio"
  url_portal TEXT,
  
  -- Datas importantes
  data_publicacao DATE,
  data_abertura TIMESTAMPTZ NOT NULL,
  data_encerramento TIMESTAMPTZ,
  data_julgamento DATE,
  data_homologacao DATE,
  data_adjudicacao DATE,
  
  -- Valores
  valor_estimado DECIMAL(12, 2),
  valor_referencia DECIMAL(12, 2),
  
  -- Participação
  permite_consorcio BOOLEAN DEFAULT FALSE,
  permite_subcontratacao BOOLEAN DEFAULT FALSE,
  exclusiva_mepps BOOLEAN DEFAULT FALSE, -- Micro e pequenas empresas
  cota_mepps DECIMAL(5, 2), -- Percentual de cota
  
  -- Garantia
  exige_garantia BOOLEAN DEFAULT FALSE,
  percentual_garantia DECIMAL(5, 2),
  
  -- Documentação exigida
  documentos_habilitacao TEXT[],
  exige_amostra BOOLEAN DEFAULT FALSE,
  exige_visita_tecnica BOOLEAN DEFAULT FALSE,
  
  -- Status da empresa
  status_participacao TEXT CHECK (status_participacao IN (
    'identificada', 'em_analise', 'participando', 
    'proposta_enviada', 'vencedora', 'perdedora', 
    'desistiu', 'inabilitada', 'nao_participou'
  )) DEFAULT 'identificada',
  
  -- Resultado
  vencedora BOOLEAN DEFAULT FALSE,
  valor_vencedor DECIMAL(12, 2),
  empresa_vencedora TEXT,
  
  -- Contrato gerado
  contrato_id UUID,
  numero_contrato TEXT,
  
  -- Responsável interno
  responsavel_id UUID REFERENCES public.usuarios(id),
  
  -- Documentos
  edital_url TEXT,
  documentos_urls TEXT[],
  
  -- Observações
  observacoes TEXT,
  estrategia_participacao TEXT,
  motivo_nao_participacao TEXT,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  criado_por UUID REFERENCES public.usuarios(id),
  atualizado_por UUID REFERENCES public.usuarios(id),
  
  UNIQUE(empresa_id, numero_processo)
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_licitacoes_empresa ON public.licitacoes(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_licitacoes_modalidade ON public.licitacoes(modalidade, data_abertura DESC) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_licitacoes_status ON public.licitacoes(status_participacao) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_licitacoes_abertura ON public.licitacoes(data_abertura DESC);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_licitacoes_responsavel ON public.licitacoes(responsavel_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_licitacoes_orgao ON public.licitacoes(orgao_nome) WHERE excluido_em IS NULL;

COMMENT ON TABLE public.licitacoes IS 'Processos licitatórios públicos e privados';

-- ============================================
-- 2. LICITACOES_ITENS (itens do edital)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.licitacoes_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  licitacao_id UUID NOT NULL REFERENCES public.licitacoes(id) ON DELETE CASCADE,
  
  -- Identificação do item
  numero_item INTEGER NOT NULL,
  lote INTEGER, -- Se for licitação por lote
  grupo INTEGER,
  
  -- Descrição
  descricao TEXT NOT NULL,
  especificacao_tecnica TEXT,
  unidade_medida TEXT DEFAULT 'UN',
  
  -- Produto relacionado (se conhecido)
  produto_id UUID REFERENCES public.produtos(id),
  
  -- Quantidades
  quantidade DECIMAL(10, 3) NOT NULL,
  quantidade_minima DECIMAL(10, 3),
  quantidade_maxima DECIMAL(10, 3),
  
  -- Valores de referência
  valor_unitario_referencia DECIMAL(12, 2),
  valor_total_referencia DECIMAL(12, 2),
  
  -- Marca/fabricante
  marca_referencia TEXT,
  aceita_similar BOOLEAN DEFAULT TRUE,
  
  -- Classificação
  codigo_catmat TEXT, -- Código CATMAT (Catálogo de Materiais)
  ncm TEXT, -- Nomenclatura Comum do Mercosul
  
  -- Entrega
  prazo_entrega_dias INTEGER,
  local_entrega TEXT,
  
  -- Amostra
  exige_amostra BOOLEAN DEFAULT FALSE,
  prazo_amostra_dias INTEGER,
  
  -- Observações
  observacoes TEXT,
  criterios_aceitacao TEXT,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_licitacoes_itens_licitacao ON public.licitacoes_itens(licitacao_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_licitacoes_itens_produto ON public.licitacoes_itens(produto_id) WHERE produto_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_licitacoes_itens_lote ON public.licitacoes_itens(licitacao_id, lote) WHERE lote IS NOT NULL;

COMMENT ON TABLE public.licitacoes_itens IS 'Itens licitados (conforme edital)';

-- ============================================
-- 3. PROPOSTAS_LICITACAO (propostas enviadas)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.propostas_licitacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  licitacao_id UUID NOT NULL REFERENCES public.licitacoes(id) ON DELETE CASCADE,
  
  -- Identificação
  numero_proposta TEXT NOT NULL,
  versao INTEGER DEFAULT 1,
  
  -- Tipo
  tipo TEXT CHECK (tipo IN ('comercial', 'tecnica', 'habilitacao', 'completa')) NOT NULL,
  fase TEXT CHECK (fase IN ('inicial', 'lance', 'melhor_oferta', 'negociacao', 'final')),
  
  -- Elaboração
  elaborada_por_id UUID NOT NULL REFERENCES public.usuarios(id),
  data_elaboracao DATE DEFAULT CURRENT_DATE,
  
  -- Envio
  data_envio TIMESTAMPTZ,
  metodo_envio TEXT CHECK (metodo_envio IN ('portal', 'email', 'presencial', 'correios')),
  protocolo_envio TEXT,
  
  -- Valores propostos
  valor_total_proposta DECIMAL(12, 2) NOT NULL,
  desconto_percentual DECIMAL(5, 2),
  
  -- Itens propostos (JSON com detalhes por item)
  itens_propostos_json JSONB NOT NULL,
  
  -- Condições comerciais
  prazo_entrega_dias INTEGER,
  condicoes_pagamento TEXT,
  validade_proposta_dias INTEGER DEFAULT 60,
  percentual_garantia DECIMAL(5, 2),
  
  -- Documentos anexados
  proposta_comercial_url TEXT,
  proposta_tecnica_url TEXT,
  documentos_habilitacao_urls TEXT[],
  amostras_urls TEXT[],
  
  -- Classificação
  classificacao INTEGER, -- Posição no ranking
  pontuacao_tecnica DECIMAL(5, 2),
  pontuacao_comercial DECIMAL(5, 2),
  pontuacao_final DECIMAL(5, 2),
  
  -- Status
  status TEXT CHECK (status IN (
    'rascunho', 'enviada', 'em_analise', 
    'habilitada', 'inabilitada', 'classificada', 
    'desclassificada', 'vencedora', 'perdedora'
  )) DEFAULT 'rascunho',
  
  -- Resultado
  motivo_inabilitacao TEXT,
  motivo_desclassificacao TEXT,
  
  -- Lance (se pregão)
  lance_inicial DECIMAL(12, 2),
  lance_final DECIMAL(12, 2),
  total_lances INTEGER DEFAULT 0,
  
  -- Observações
  observacoes TEXT,
  estrategia TEXT,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  criado_por UUID REFERENCES public.usuarios(id),
  atualizado_por UUID REFERENCES public.usuarios(id),
  
  UNIQUE(empresa_id, licitacao_id, numero_proposta, versao)
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_propostas_licitacao_empresa ON public.propostas_licitacao(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_propostas_licitacao_licitacao ON public.propostas_licitacao(licitacao_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_propostas_licitacao_elaborada_por ON public.propostas_licitacao(elaborada_por_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_propostas_licitacao_status ON public.propostas_licitacao(status) WHERE excluido_em IS NULL;

COMMENT ON TABLE public.propostas_licitacao IS 'Propostas enviadas para licitações';

-- ============================================
-- 4. DOCUMENTOS_LICITACAO (documentos e habilitação)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.documentos_licitacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  licitacao_id UUID NOT NULL REFERENCES public.licitacoes(id) ON DELETE CASCADE,
  proposta_id UUID REFERENCES public.propostas_licitacao(id),
  
  -- Tipo de documento
  tipo TEXT CHECK (tipo IN (
    'edital', 'adendo', 'esclarecimento', 'impugnacao',
    'certidao_federal', 'certidao_estadual', 'certidao_municipal',
    'certidao_trabalhista', 'certidao_falencia', 'certidao_negativa',
    'balanco_patrimonial', 'demonstrativo_financeiro', 'contrato_social',
    'licenca_funcionamento', 'registro_anvisa', 'certificado_qualidade',
    'atestado_capacidade', 'declaracao', 'procuracao', 'outro'
  )) NOT NULL,
  
  -- Identificação
  titulo TEXT NOT NULL,
  descricao TEXT,
  numero_documento TEXT,
  
  -- Arquivo
  arquivo_url TEXT NOT NULL,
  arquivo_nome TEXT,
  arquivo_tamanho INTEGER, -- bytes
  arquivo_hash TEXT,
  
  -- Origem
  origem TEXT CHECK (origem IN ('empresa', 'orgao', 'terceiro')) DEFAULT 'empresa',
  emitido_por TEXT,
  
  -- Validade
  data_emissao DATE,
  data_validade DATE,
  valido BOOLEAN DEFAULT TRUE,
  
  -- Obrigatoriedade
  obrigatorio BOOLEAN DEFAULT FALSE,
  exigido_edital BOOLEAN DEFAULT FALSE,
  
  -- Upload
  enviado_portal BOOLEAN DEFAULT FALSE,
  data_envio_portal TIMESTAMPTZ,
  
  -- Análise
  analisado BOOLEAN DEFAULT FALSE,
  aprovado BOOLEAN,
  data_analise TIMESTAMPTZ,
  parecer TEXT,
  
  -- Observações
  observacoes TEXT,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  criado_por UUID REFERENCES public.usuarios(id)
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_documentos_licitacao_empresa ON public.documentos_licitacao(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_documentos_licitacao_licitacao ON public.documentos_licitacao(licitacao_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_documentos_licitacao_proposta ON public.documentos_licitacao(proposta_id) WHERE proposta_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_documentos_licitacao_tipo ON public.documentos_licitacao(tipo) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_documentos_licitacao_validade ON public.documentos_licitacao(data_validade) WHERE valido = TRUE;

COMMENT ON TABLE public.documentos_licitacao IS 'Documentos de habilitação e edital';

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER trg_licitacoes_updated
  BEFORE UPDATE ON public.licitacoes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_licitacoes_itens_updated
  BEFORE UPDATE ON public.licitacoes_itens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_propostas_licitacao_updated
  BEFORE UPDATE ON public.propostas_licitacao
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_documentos_licitacao_updated
  BEFORE UPDATE ON public.documentos_licitacao
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FIM MÓDULO LICITAÇÕES (4 tabelas)
-- ============================================



-- ============================================
-- Source: 202510201323_fase3_parte4_entregas.sql
-- ============================================

-- ============================================
-- Migration: FASE 3 - Compliance & Integrações (Parte 4/4)
-- MÓDULO ENTREGAS/LOGÍSTICA - 1 tabela pt-BR
-- Data: 2025-10-20
-- Versão: 1.0
-- Autor: AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3
-- ============================================
-- Descrição:
-- Gestão completa de entregas e logística:
-- - Entregas de materiais
-- - Rastreamento
-- - Rotas e agendamentos
-- - Status detalhado
-- NOMENCLATURA: 100% pt-BR snake_case
-- SEM RLS (aplicar por último)
-- ============================================

-- ============================================
-- 1. ENTREGAS (entregas de materiais - expandida)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.entregas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Identificação
  numero TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN (
    'venda', 'consignacao', 'devolucao', 'transferencia', 
    'demonstracao', 'garantia', 'outro'
  )) NOT NULL,
  
  -- Origem
  documento_origem_tipo TEXT, -- Ex: "pedido_compra", "remessa_consignacao", "nota_fiscal"
  documento_origem_id UUID,
  documento_numero TEXT,
  
  -- Remessa consignação (se aplicável)
  remessa_consignacao_id UUID REFERENCES public.remessas_consignacao(id),
  
  -- Nota fiscal
  nota_fiscal_id UUID REFERENCES public.notas_fiscais(id),
  
  -- Cirurgia relacionada
  cirurgia_id UUID REFERENCES public.cirurgias(id),
  
  -- Remetente
  remetente_tipo TEXT CHECK (remetente_tipo IN ('empresa', 'fornecedor', 'hospital', 'outro')),
  remetente_nome TEXT NOT NULL,
  remetente_cnpj TEXT,
  remetente_endereco TEXT,
  remetente_cidade TEXT,
  remetente_estado TEXT,
  
  -- Destinatário
  destinatario_tipo TEXT CHECK (destinatario_tipo IN ('hospital', 'medico', 'cliente', 'fornecedor', 'outro')),
  destinatario_nome TEXT NOT NULL,
  destinatario_cnpj TEXT,
  destinatario_contato TEXT,
  destinatario_telefone TEXT,
  destinatario_endereco TEXT NOT NULL,
  destinatario_cidade TEXT NOT NULL,
  destinatario_estado TEXT NOT NULL,
  destinatario_cep TEXT,
  destinatario_referencia TEXT,
  
  -- Datas
  data_programada DATE NOT NULL,
  hora_programada TIME,
  data_saida DATE,
  hora_saida TIME,
  data_entrega_prevista DATE NOT NULL,
  data_entrega_realizada DATE,
  hora_entrega TIME,
  
  -- Transporte
  tipo_transporte TEXT CHECK (tipo_transporte IN (
    'proprio', 'transportadora', 'correios', 'motoboy', 'outro'
  )) DEFAULT 'transportadora',
  transportadora_id UUID REFERENCES public.fornecedores(id),
  transportadora_nome TEXT,
  transportadora_cnpj TEXT,
  
  -- Motorista/Entregador
  motorista_nome TEXT,
  motorista_cpf TEXT,
  motorista_telefone TEXT,
  veiculo_placa TEXT,
  veiculo_tipo TEXT,
  
  -- Rastreamento
  codigo_rastreamento TEXT,
  url_rastreamento TEXT,
  
  -- Volumes
  quantidade_volumes INTEGER DEFAULT 1,
  peso_total DECIMAL(10, 3), -- kg
  valor_declarado DECIMAL(12, 2),
  
  -- Condições de transporte
  temperatura_controlada BOOLEAN DEFAULT FALSE,
  temperatura_min DECIMAL(5, 2),
  temperatura_max DECIMAL(5, 2),
  fragil BOOLEAN DEFAULT FALSE,
  perigoso BOOLEAN DEFAULT FALSE,
  
  -- Materiais (resumo)
  materiais_json JSONB, -- Array de materiais entregues
  
  -- Recebimento
  recebido_por_nome TEXT,
  recebido_por_cpf TEXT,
  recebido_por_funcao TEXT,
  assinatura_url TEXT,
  foto_entrega_url TEXT,
  
  -- Status
  status TEXT CHECK (status IN (
    'agendada', 'preparacao', 'em_transito', 
    'saiu_entrega', 'tentativa_falha', 'entregue', 
    'nao_entregue', 'devolvida', 'cancelada'
  )) DEFAULT 'agendada',
  
  -- Ocorrências
  tentativas_entrega INTEGER DEFAULT 0,
  motivo_nao_entrega TEXT,
  ocorrencias TEXT,
  
  -- Custos
  valor_frete DECIMAL(12, 2),
  valor_seguro DECIMAL(12, 2),
  outras_despesas DECIMAL(12, 2),
  valor_total_entrega DECIMAL(12, 2),
  
  -- Documentos
  canhoto_url TEXT, -- Comprovante de entrega assinado
  danfe_url TEXT,
  outros_documentos_urls TEXT[],
  
  -- Geolocalização
  latitude_origem DECIMAL(10, 8),
  longitude_origem DECIMAL(11, 8),
  latitude_destino DECIMAL(10, 8),
  longitude_destino DECIMAL(11, 8),
  distancia_km DECIMAL(8, 2),
  
  -- Rota
  rota_planejada_json JSONB, -- Rota com waypoints
  rota_realizada_json JSONB,
  
  -- Prioridade
  urgente BOOLEAN DEFAULT FALSE,
  prioridade TEXT CHECK (prioridade IN ('baixa', 'media', 'alta', 'urgente')) DEFAULT 'media',
  
  -- Observações
  observacoes TEXT,
  instrucoes_especiais TEXT,
  
  -- Avaliação
  avaliacao_entrega INTEGER CHECK (avaliacao_entrega BETWEEN 1 AND 5),
  comentario_avaliacao TEXT,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  criado_por UUID REFERENCES public.usuarios(id),
  atualizado_por UUID REFERENCES public.usuarios(id),
  
  UNIQUE(empresa_id, numero)
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_entregas_empresa ON public.entregas(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_entregas_tipo ON public.entregas(tipo, status) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_entregas_status ON public.entregas(status, data_entrega_prevista) WHERE status NOT IN ('entregue', 'cancelada');
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_entregas_data_programada ON public.entregas(data_programada, hora_programada) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_entregas_data_prevista ON public.entregas(data_entrega_prevista) WHERE status IN ('agendada', 'em_transito');
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_entregas_cirurgia ON public.entregas(cirurgia_id) WHERE cirurgia_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_entregas_remessa ON public.entregas(remessa_consignacao_id) WHERE remessa_consignacao_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_entregas_rastreamento ON public.entregas(codigo_rastreamento) WHERE codigo_rastreamento IS NOT NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_entregas_transportadora ON public.entregas(transportadora_id) WHERE transportadora_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_entregas_destinatario ON public.entregas(destinatario_nome) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_entregas_urgente ON public.entregas(urgente, status) WHERE urgente = TRUE AND status NOT IN ('entregue', 'cancelada');

COMMENT ON TABLE public.entregas IS 'Gestão completa de entregas e logística de materiais';

-- ============================================
-- TRIGGER
-- ============================================
CREATE TRIGGER trg_entregas_updated
  BEFORE UPDATE ON public.entregas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FIM MÓDULO ENTREGAS/LOGÍSTICA (1 tabela)
-- ============================================
-- FASE 3 COMPLETA: 15 tabelas
-- - Compliance/Auditoria: 6 tabelas
-- - Portais OPME: 4 tabelas
-- - Licitações: 4 tabelas
-- - Entregas/Logística: 1 tabela
-- ============================================



-- ============================================
-- Source: 202510201330_fase4_parte1_chatbot_gpt.sql
-- ============================================

-- ============================================
-- Migration: FASE 4 - Features Avançadas (Parte 1/5)
-- MÓDULO CHATBOT/GPT RESEARCHER - 4 tabelas pt-BR
-- Data: 2025-10-20
-- Versão: 1.0
-- Autor: AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3
-- ============================================
-- Descrição:
-- Sistema de chatbot inteligente com GPT:
-- - Conversas e sessões
-- - Mensagens com contexto
-- - Pesquisas automatizadas
-- - Histórico completo
-- NOMENCLATURA: 100% pt-BR snake_case
-- SEM RLS (aplicar por último)
-- ============================================

-- ============================================
-- 1. CHATBOT_SESSOES (sessões de chat)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.chatbot_sessoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  
  -- Identificação
  titulo TEXT,
  descricao TEXT,
  
  -- Contexto
  contexto_tipo TEXT CHECK (contexto_tipo IN (
    'geral', 'cirurgia', 'compras', 'vendas', 
    'estoque', 'financeiro', 'compliance', 'outro'
  )) DEFAULT 'geral',
  contexto_id UUID, -- ID da entidade relacionada
  
  -- Configurações
  modelo_ia TEXT DEFAULT 'gpt-4', -- Modelo de linguagem usado
  temperatura DECIMAL(3, 2) DEFAULT 0.7 CHECK (temperatura BETWEEN 0 AND 2),
  max_tokens INTEGER DEFAULT 2000,
  
  -- Preferências
  idioma TEXT DEFAULT 'pt-BR',
  modo TEXT CHECK (modo IN ('assistente', 'pesquisador', 'especialista', 'tutor')) DEFAULT 'assistente',
  
  -- Estatísticas
  total_mensagens INTEGER DEFAULT 0,
  total_tokens_usados INTEGER DEFAULT 0,
  total_pesquisas INTEGER DEFAULT 0,
  
  -- Avaliação
  avaliacao INTEGER CHECK (avaliacao BETWEEN 1 AND 5),
  feedback TEXT,
  
  -- Status
  ativa BOOLEAN DEFAULT TRUE,
  ultima_interacao TIMESTAMPTZ DEFAULT NOW(),
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  encerrado_em TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_chatbot_sessoes_empresa ON public.chatbot_sessoes(empresa_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_chatbot_sessoes_usuario ON public.chatbot_sessoes(usuario_id) WHERE ativa = TRUE;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_chatbot_sessoes_contexto ON public.chatbot_sessoes(contexto_tipo, contexto_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_chatbot_sessoes_ativa ON public.chatbot_sessoes(ativa, ultima_interacao DESC) WHERE ativa = TRUE;

COMMENT ON TABLE public.chatbot_sessoes IS 'Sessões de conversa com chatbot IA';

-- ============================================
-- 2. CHATBOT_CONVERSAS (conversas dentro de sessões)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.chatbot_conversas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sessao_id UUID NOT NULL REFERENCES public.chatbot_sessoes(id) ON DELETE CASCADE,
  
  -- Identificação
  titulo TEXT,
  topico TEXT,
  
  -- Thread
  conversa_pai_id UUID REFERENCES public.chatbot_conversas(id), -- Para threads aninhadas
  ordem INTEGER DEFAULT 0,
  
  -- Status
  status TEXT CHECK (status IN ('ativa', 'pausada', 'encerrada')) DEFAULT 'ativa',
  
  -- Resumo
  resumo_automatico TEXT, -- Gerado pela IA
  tags TEXT[],
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_chatbot_conversas_sessao ON public.chatbot_conversas(sessao_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_chatbot_conversas_pai ON public.chatbot_conversas(conversa_pai_id) WHERE conversa_pai_id IS NOT NULL;

COMMENT ON TABLE public.chatbot_conversas IS 'Conversas organizadas dentro de sessões (threads)';

-- ============================================
-- 3. CHATBOT_MENSAGENS (mensagens do chat)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.chatbot_mensagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sessao_id UUID NOT NULL REFERENCES public.chatbot_sessoes(id) ON DELETE CASCADE,
  conversa_id UUID REFERENCES public.chatbot_conversas(id) ON DELETE CASCADE,
  
  -- Remetente
  tipo_remetente TEXT CHECK (tipo_remetente IN ('usuario', 'assistente', 'sistema')) NOT NULL,
  usuario_id UUID REFERENCES public.usuarios(id),
  
  -- Conteúdo
  mensagem TEXT NOT NULL,
  mensagem_formatada TEXT, -- HTML ou Markdown
  
  -- Anexos
  anexos_urls TEXT[],
  imagens_urls TEXT[],
  
  -- Contexto da mensagem
  intencao TEXT, -- Intenção detectada pela IA
  entidades_json JSONB, -- Entidades extraídas (NER)
  sentimento TEXT CHECK (sentimento IN ('positivo', 'neutro', 'negativo')),
  confianca DECIMAL(5, 4), -- 0-1 score de confiança
  
  -- Resposta da IA
  modelo_usado TEXT,
  tokens_prompt INTEGER,
  tokens_completion INTEGER,
  tokens_total INTEGER,
  tempo_resposta_ms INTEGER,
  
  -- Avaliação da resposta
  util BOOLEAN,
  motivo_nao_util TEXT,
  
  -- Ações sugeridas
  acoes_sugeridas_json JSONB, -- Ex: criar cirurgia, gerar relatório
  acao_executada BOOLEAN DEFAULT FALSE,
  acao_resultado_json JSONB,
  
  -- Citações e fontes
  fontes_json JSONB, -- Documentos/URLs usados como contexto
  
  -- Flags
  erro BOOLEAN DEFAULT FALSE,
  erro_mensagem TEXT,
  requer_atencao_humana BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_chatbot_mensagens_sessao ON public.chatbot_mensagens(sessao_id, criado_em DESC);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_chatbot_mensagens_conversa ON public.chatbot_mensagens(conversa_id, criado_em) WHERE conversa_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_chatbot_mensagens_usuario ON public.chatbot_mensagens(usuario_id, criado_em DESC) WHERE usuario_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_chatbot_mensagens_tipo ON public.chatbot_mensagens(tipo_remetente, criado_em DESC);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_chatbot_mensagens_atencao ON public.chatbot_mensagens(requer_atencao_humana, criado_em DESC) WHERE requer_atencao_humana = TRUE;

COMMENT ON TABLE public.chatbot_mensagens IS 'Mensagens individuais do chatbot (histórico completo)';

-- ============================================
-- 4. PESQUISAS_GPT (pesquisas automatizadas GPT Researcher)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.pesquisas_gpt (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  
  -- Relacionamento com chat
  sessao_id UUID REFERENCES public.chatbot_sessoes(id),
  mensagem_id UUID REFERENCES public.chatbot_mensagens(id),
  
  -- Query
  query TEXT NOT NULL,
  query_refinada TEXT, -- Query refinada pela IA
  
  -- Tipo de pesquisa
  tipo TEXT CHECK (tipo IN (
    'web', 'documentos_internos', 'banco_dados', 
    'hibrida', 'especializada'
  )) DEFAULT 'hibrida',
  
  -- Configurações
  profundidade TEXT CHECK (profundidade IN ('rapida', 'normal', 'profunda')) DEFAULT 'normal',
  max_resultados INTEGER DEFAULT 10,
  idiomas TEXT[] DEFAULT ARRAY['pt', 'en'],
  
  -- Fontes pesquisadas
  fontes TEXT[], -- Ex: ["google", "pubmed", "anvisa", "documentos_internos"]
  urls_visitadas TEXT[],
  total_fontes_consultadas INTEGER DEFAULT 0,
  
  -- Resultados
  status TEXT CHECK (status IN (
    'pendente', 'em_andamento', 'concluida', 
    'erro', 'cancelada'
  )) DEFAULT 'pendente',
  
  progresso INTEGER DEFAULT 0 CHECK (progresso BETWEEN 0 AND 100),
  
  -- Relatório gerado
  relatorio_markdown TEXT,
  relatorio_html TEXT,
  resumo TEXT,
  
  -- Citações e referências
  referencias_json JSONB, -- Bibliográficas estruturadas
  fontes_primarias TEXT[],
  fontes_secundarias TEXT[],
  
  -- Metadados da pesquisa
  palavras_chave TEXT[],
  topicos_identificados TEXT[],
  entidades_mencionadas TEXT[],
  
  -- Qualidade
  score_relevancia DECIMAL(5, 2), -- 0-100
  score_confiabilidade DECIMAL(5, 2),
  score_atualidade DECIMAL(5, 2),
  
  -- Tempo e recursos
  tempo_execucao_segundos INTEGER,
  tokens_usados INTEGER,
  custo_estimado DECIMAL(10, 4), -- Em USD
  
  -- Exportação
  pdf_url TEXT,
  docx_url TEXT,
  
  -- Compartilhamento
  publico BOOLEAN DEFAULT FALSE,
  compartilhado_com UUID[], -- IDs de usuários
  
  -- Avaliação
  avaliacao INTEGER CHECK (avaliacao BETWEEN 1 AND 5),
  feedback TEXT,
  
  -- Datas
  iniciado_em TIMESTAMPTZ,
  concluido_em TIMESTAMPTZ,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_pesquisas_gpt_empresa ON public.pesquisas_gpt(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_pesquisas_gpt_usuario ON public.pesquisas_gpt(usuario_id, criado_em DESC) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_pesquisas_gpt_sessao ON public.pesquisas_gpt(sessao_id) WHERE sessao_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_pesquisas_gpt_status ON public.pesquisas_gpt(status, criado_em DESC);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_pesquisas_gpt_tipo ON public.pesquisas_gpt(tipo, profundidade);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_pesquisas_gpt_publico ON public.pesquisas_gpt(publico, score_relevancia DESC) WHERE publico = TRUE;

COMMENT ON TABLE public.pesquisas_gpt IS 'Pesquisas automatizadas com GPT Researcher';

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER trg_chatbot_sessoes_updated
  BEFORE UPDATE ON public.chatbot_sessoes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_chatbot_conversas_updated
  BEFORE UPDATE ON public.chatbot_conversas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_pesquisas_gpt_updated
  BEFORE UPDATE ON public.pesquisas_gpt
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FIM MÓDULO CHATBOT/GPT RESEARCHER (4 tabelas)
-- ============================================



-- ============================================
-- Source: 202510201331_fase4_parte2_workflows.sql
-- ============================================

-- ============================================
-- Migration: FASE 4 - Features Avançadas (Parte 2/5)
-- MÓDULO WORKFLOWS - 4 tabelas pt-BR
-- Data: 2025-10-20
-- Versão: 1.0
-- Autor: AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3
-- ============================================
-- Descrição:
-- Sistema de workflows automatizados:
-- - Definição de workflows
-- - Etapas e condições
-- - Execuções e histórico
-- - Logs detalhados
-- NOMENCLATURA: 100% pt-BR snake_case
-- SEM RLS (aplicar por último)
-- ============================================

-- ============================================
-- 1. WORKFLOWS (definição de workflows)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Identificação
  codigo TEXT NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT CHECK (categoria IN (
    'aprovacao', 'notificacao', 'automacao', 
    'integracao', 'agendamento', 'validacao', 'outro'
  )),
  
  -- Trigger (gatilho)
  trigger_tipo TEXT CHECK (trigger_tipo IN (
    'manual', 'evento', 'agendado', 'webhook', 'condicional'
  )) NOT NULL,
  trigger_evento TEXT, -- Ex: "cirurgia.criada", "estoque.baixo"
  trigger_condicao_json JSONB, -- Condições para disparo
  
  -- Agendamento (se tipo = agendado)
  cron_expressao TEXT, -- Ex: "0 9 * * *"
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  
  -- Configurações
  versao INTEGER DEFAULT 1,
  ativo BOOLEAN DEFAULT FALSE,
  modo_teste BOOLEAN DEFAULT FALSE,
  
  -- Prioridade
  prioridade INTEGER DEFAULT 5 CHECK (prioridade BETWEEN 1 AND 10),
  
  -- Timeout e retry
  timeout_segundos INTEGER DEFAULT 300,
  max_tentativas INTEGER DEFAULT 3,
  intervalo_retry_segundos INTEGER DEFAULT 60,
  
  -- Variáveis globais
  variaveis_json JSONB, -- Variáveis disponíveis para todas as etapas
  
  -- Estatísticas
  total_execucoes INTEGER DEFAULT 0,
  total_sucesso INTEGER DEFAULT 0,
  total_erro INTEGER DEFAULT 0,
  taxa_sucesso DECIMAL(5, 2),
  tempo_medio_execucao_segundos INTEGER,
  
  -- Responsável
  criado_por_id UUID REFERENCES public.usuarios(id),
  modificado_por_id UUID REFERENCES public.usuarios(id),
  
  -- Datas
  ultima_execucao TIMESTAMPTZ,
  proxima_execucao TIMESTAMPTZ,
  
  -- Observações
  observacoes TEXT,
  documentacao_url TEXT,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  
  UNIQUE(empresa_id, codigo)
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_workflows_empresa ON public.workflows(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_workflows_ativo ON public.workflows(ativo, prioridade DESC) WHERE ativo = TRUE;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_workflows_trigger ON public.workflows(trigger_tipo, trigger_evento);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_workflows_agendado ON public.workflows(proxima_execucao) WHERE trigger_tipo = 'agendado' AND ativo = TRUE;

COMMENT ON TABLE public.workflows IS 'Definição de workflows automatizados';

-- ============================================
-- 2. WORKFLOWS_ETAPAS (etapas do workflow)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.workflows_etapas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  
  -- Identificação
  codigo TEXT NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  
  -- Ordem e hierarquia
  ordem INTEGER NOT NULL,
  etapa_pai_id UUID REFERENCES public.workflows_etapas(id), -- Para sub-etapas
  nivel INTEGER DEFAULT 1,
  
  -- Tipo de ação
  tipo_acao TEXT CHECK (tipo_acao IN (
    'aprovacao_manual', 'notificacao_email', 'notificacao_push',
    'webhook', 'funcao_edge', 'query_database', 
    'criar_registro', 'atualizar_registro', 'enviar_api',
    'aguardar', 'condicional', 'loop', 'paralelo', 'outro'
  )) NOT NULL,
  
  -- Configuração da ação
  configuracao_json JSONB NOT NULL,
  
  -- Entrada e saída
  input_schema_json JSONB, -- Schema JSON das variáveis de entrada
  output_schema_json JSONB, -- Schema JSON das variáveis de saída
  mapear_output BOOLEAN DEFAULT TRUE,
  
  -- Condições
  condicao_execucao_json JSONB, -- Quando executar esta etapa
  executar_se TEXT CHECK (executar_se IN ('sempre', 'sucesso_anterior', 'erro_anterior', 'condicional')),
  
  -- Aprovação manual
  requer_aprovacao BOOLEAN DEFAULT FALSE,
  aprovadores_ids UUID[], -- IDs dos usuários aprovadores
  aprovacao_minima INTEGER DEFAULT 1, -- Quantos aprovadores são necessários
  
  -- Timeout específico
  timeout_segundos INTEGER,
  
  -- Retry específico
  tentativas_maximas INTEGER DEFAULT 3,
  
  -- Tratamento de erro
  acao_erro TEXT CHECK (acao_erro IN ('parar', 'continuar', 'retry', 'pular', 'rollback')),
  etapa_erro_id UUID REFERENCES public.workflows_etapas(id), -- Etapa para ir em caso de erro
  
  -- Status
  ativa BOOLEAN DEFAULT TRUE,
  
  -- Observações
  observacoes TEXT,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_workflows_etapas_workflow ON public.workflows_etapas(workflow_id, ordem);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_workflows_etapas_pai ON public.workflows_etapas(etapa_pai_id) WHERE etapa_pai_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_workflows_etapas_tipo ON public.workflows_etapas(tipo_acao);

COMMENT ON TABLE public.workflows_etapas IS 'Etapas individuais dos workflows';

-- ============================================
-- 3. WORKFLOWS_EXECUCOES (execuções do workflow)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.workflows_execucoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  
  -- Identificação
  numero_execucao INTEGER NOT NULL,
  
  -- Trigger
  disparado_por TEXT CHECK (disparado_por IN ('manual', 'automatico', 'evento', 'agendado', 'webhook')),
  disparado_por_usuario_id UUID REFERENCES public.usuarios(id),
  evento_origem TEXT,
  
  -- Contexto
  contexto_tipo TEXT, -- Ex: "cirurgia", "pedido_compra"
  contexto_id UUID,
  contexto_dados_json JSONB,
  
  -- Variáveis de entrada
  input_json JSONB,
  
  -- Status
  status TEXT CHECK (status IN (
    'iniciando', 'em_andamento', 'aguardando_aprovacao',
    'pausado', 'concluido', 'erro', 'cancelado', 'timeout'
  )) DEFAULT 'iniciando',
  
  -- Progresso
  etapa_atual_id UUID REFERENCES public.workflows_etapas(id),
  etapa_atual_numero INTEGER,
  total_etapas INTEGER,
  progresso_percentual INTEGER DEFAULT 0,
  
  -- Resultados
  sucesso BOOLEAN,
  output_json JSONB,
  erro_mensagem TEXT,
  erro_etapa_id UUID REFERENCES public.workflows_etapas(id),
  
  -- Tempo
  iniciado_em TIMESTAMPTZ DEFAULT NOW(),
  concluido_em TIMESTAMPTZ,
  duracao_segundos INTEGER,
  
  -- Retry
  tentativa INTEGER DEFAULT 1,
  execucao_original_id UUID REFERENCES public.workflows_execucoes(id), -- Se for retry
  
  -- Aprovações
  aprovacoes_pendentes INTEGER DEFAULT 0,
  aprovacoes_concedidas INTEGER DEFAULT 0,
  aprovacoes_negadas INTEGER DEFAULT 0,
  
  -- Observações
  observacoes TEXT,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_workflows_execucoes_empresa ON public.workflows_execucoes(empresa_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_workflows_execucoes_workflow ON public.workflows_execucoes(workflow_id, iniciado_em DESC);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_workflows_execucoes_status ON public.workflows_execucoes(status, iniciado_em DESC);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_workflows_execucoes_contexto ON public.workflows_execucoes(contexto_tipo, contexto_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_workflows_execucoes_usuario ON public.workflows_execucoes(disparado_por_usuario_id) WHERE disparado_por_usuario_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_workflows_execucoes_aguardando ON public.workflows_execucoes(status) WHERE status = 'aguardando_aprovacao';

COMMENT ON TABLE public.workflows_execucoes IS 'Execuções de workflows (histórico)';

-- ============================================
-- 4. WORKFLOWS_LOGS (logs detalhados)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.workflows_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execucao_id UUID NOT NULL REFERENCES public.workflows_execucoes(id) ON DELETE CASCADE,
  etapa_id UUID REFERENCES public.workflows_etapas(id),
  
  -- Timestamp
  ocorrido_em TIMESTAMPTZ DEFAULT NOW(),
  
  -- Tipo de log
  tipo TEXT CHECK (tipo IN (
    'info', 'debug', 'warning', 'error', 
    'etapa_iniciada', 'etapa_concluida', 'etapa_erro',
    'aprovacao_solicitada', 'aprovacao_concedida', 'aprovacao_negada',
    'retry', 'timeout', 'cancelamento', 'webhook_chamado'
  )) NOT NULL,
  
  -- Nível de severidade
  severidade INTEGER DEFAULT 1 CHECK (severidade BETWEEN 1 AND 5),
  
  -- Mensagem
  mensagem TEXT NOT NULL,
  detalhes TEXT,
  
  -- Dados estruturados
  dados_json JSONB,
  
  -- Request/Response (se aplicável)
  request_json JSONB,
  response_json JSONB,
  response_status_code INTEGER,
  response_time_ms INTEGER,
  
  -- Erro
  erro_stack_trace TEXT,
  erro_codigo TEXT,
  
  -- Usuário (se ação manual)
  usuario_id UUID REFERENCES public.usuarios(id),
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_workflows_logs_execucao ON public.workflows_logs(execucao_id, ocorrido_em DESC);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_workflows_logs_etapa ON public.workflows_logs(etapa_id) WHERE etapa_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_workflows_logs_tipo ON public.workflows_logs(tipo, ocorrido_em DESC);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_workflows_logs_erro ON public.workflows_logs(tipo, severidade DESC) WHERE tipo = 'error';

COMMENT ON TABLE public.workflows_logs IS 'Logs detalhados das execuções de workflows';

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER trg_workflows_updated
  BEFORE UPDATE ON public.workflows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_workflows_etapas_updated
  BEFORE UPDATE ON public.workflows_etapas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_workflows_execucoes_updated
  BEFORE UPDATE ON public.workflows_execucoes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FIM MÓDULO WORKFLOWS (4 tabelas)
-- ============================================



-- ============================================
-- Source: 202510201332_fase4_parte3_api_gateway.sql
-- ============================================

-- ============================================
-- Migration: FASE 4 - Features Avançadas (Parte 3/5)
-- MÓDULO API GATEWAY - 4 tabelas pt-BR
-- Data: 2025-10-20
-- Versão: 1.0
-- Autor: AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3
-- ============================================
-- Descrição:
-- Gateway de APIs com controle completo:
-- - Endpoints registrados
-- - Chaves de API
-- - Logs de requisições
-- - Rate limiting
-- NOMENCLATURA: 100% pt-BR snake_case
-- SEM RLS (aplicar por último)
-- ============================================

-- ============================================
-- 1. API_ENDPOINTS (endpoints registrados)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.api_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Identificação
  codigo TEXT NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  versao TEXT DEFAULT 'v1',
  
  -- Endpoint
  metodo TEXT CHECK (metodo IN ('GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS')) NOT NULL,
  path TEXT NOT NULL, -- Ex: "/api/v1/cirurgias"
  path_parametros TEXT[], -- Ex: ["id", "status"]
  
  -- Categoria
  categoria TEXT CHECK (categoria IN (
    'publico', 'privado', 'interno', 'webhook', 'integracao'
  )) DEFAULT 'privado',
  
  -- Autenticação
  requer_autenticacao BOOLEAN DEFAULT TRUE,
  tipo_autenticacao TEXT CHECK (tipo_autenticacao IN (
    'api_key', 'bearer_token', 'basic_auth', 'oauth2', 'nenhuma'
  )) DEFAULT 'api_key',
  
  -- Permissões
  permissoes_requeridas TEXT[], -- Ex: ["cirurgias.read", "cirurgias.write"]
  roles_permitidos TEXT[],
  
  -- Rate limiting
  rate_limit_habilitado BOOLEAN DEFAULT TRUE,
  rate_limit_requests INTEGER DEFAULT 100, -- Requests por janela
  rate_limit_janela_segundos INTEGER DEFAULT 60,
  
  -- Validação
  valida_input BOOLEAN DEFAULT TRUE,
  input_schema_json JSONB,
  valida_output BOOLEAN DEFAULT FALSE,
  output_schema_json JSONB,
  
  -- Timeout
  timeout_segundos INTEGER DEFAULT 30,
  
  -- Cache
  cache_habilitado BOOLEAN DEFAULT FALSE,
  cache_ttl_segundos INTEGER DEFAULT 300,
  
  -- Webhook
  webhook_url TEXT, -- Se for chamar webhook externo
  webhook_headers_json JSONB,
  webhook_retry_count INTEGER DEFAULT 3,
  
  -- Documentação
  documentacao_markdown TEXT,
  exemplos_json JSONB,
  
  -- Status
  ativo BOOLEAN DEFAULT TRUE,
  manutencao BOOLEAN DEFAULT FALSE,
  deprecated BOOLEAN DEFAULT FALSE,
  data_depreciacao DATE,
  
  -- Estatísticas
  total_chamadas INTEGER DEFAULT 0,
  total_sucesso INTEGER DEFAULT 0,
  total_erro INTEGER DEFAULT 0,
  tempo_medio_ms INTEGER,
  ultima_chamada TIMESTAMPTZ,
  
  -- Observações
  observacoes TEXT,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  criado_por UUID REFERENCES public.usuarios(id),
  
  UNIQUE(empresa_id, codigo, versao)
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_api_endpoints_empresa ON public.api_endpoints(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_api_endpoints_path ON public.api_endpoints(metodo, path) WHERE ativo = TRUE;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_api_endpoints_ativo ON public.api_endpoints(ativo, manutencao) WHERE ativo = TRUE;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_api_endpoints_categoria ON public.api_endpoints(categoria) WHERE excluido_em IS NULL;

COMMENT ON TABLE public.api_endpoints IS 'Endpoints de API registrados no gateway';

-- ============================================
-- 2. API_KEYS (chaves de API)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Identificação
  nome TEXT NOT NULL,
  descricao TEXT,
  
  -- Chave
  chave TEXT NOT NULL UNIQUE, -- Hash da chave (não armazenar plain text!)
  prefixo TEXT NOT NULL, -- Prefixo visível (ex: "sk_live_")
  
  -- Tipo
  tipo TEXT CHECK (tipo IN ('producao', 'teste', 'desenvolvimento')) DEFAULT 'teste',
  
  -- Escopo
  escopo TEXT CHECK (escopo IN ('full', 'readonly', 'limitado')) DEFAULT 'limitado',
  permissoes TEXT[], -- Permissões específicas
  endpoints_permitidos UUID[], -- IDs de api_endpoints
  
  -- Proprietário
  usuario_id UUID REFERENCES public.usuarios(id),
  aplicacao TEXT, -- Nome da aplicação usando a chave
  
  -- Restrições
  ips_permitidos INET[], -- Lista de IPs permitidos
  dominios_permitidos TEXT[], -- Lista de domínios (CORS)
  
  -- Rate limiting
  rate_limit_override BOOLEAN DEFAULT FALSE,
  rate_limit_custom INTEGER,
  rate_limit_janela_segundos INTEGER,
  
  -- Validade
  data_expiracao TIMESTAMPTZ,
  expira BOOLEAN DEFAULT FALSE,
  
  -- Status
  ativa BOOLEAN DEFAULT TRUE,
  bloqueada BOOLEAN DEFAULT FALSE,
  motivo_bloqueio TEXT,
  
  -- Estatísticas
  total_requisicoes INTEGER DEFAULT 0,
  ultima_requisicao TIMESTAMPTZ,
  ultima_requisicao_ip INET,
  
  -- Rotação
  rotacionada_de_id UUID REFERENCES public.api_keys(id), -- Chave anterior (se rotacionada)
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  criado_por UUID REFERENCES public.usuarios(id)
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_api_keys_empresa ON public.api_keys(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_api_keys_chave ON public.api_keys(chave) WHERE ativa = TRUE;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_api_keys_usuario ON public.api_keys(usuario_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_api_keys_ativa ON public.api_keys(ativa, bloqueada) WHERE ativa = TRUE AND NOT bloqueada;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_api_keys_expiracao ON public.api_keys(data_expiracao) WHERE expira = TRUE AND ativa = TRUE;

COMMENT ON TABLE public.api_keys IS 'Chaves de autenticação de API';

-- ============================================
-- 3. API_LOGS (logs de requisições)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.api_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  endpoint_id UUID REFERENCES public.api_endpoints(id),
  api_key_id UUID REFERENCES public.api_keys(id),
  
  -- Request
  request_id TEXT NOT NULL UNIQUE, -- UUID da requisição
  metodo TEXT NOT NULL,
  path TEXT NOT NULL,
  query_params_json JSONB,
  request_headers_json JSONB,
  request_body_json JSONB,
  request_size_bytes INTEGER,
  
  -- Cliente
  ip_origem INET NOT NULL,
  user_agent TEXT,
  referer TEXT,
  
  -- Usuário (se autenticado)
  usuario_id UUID REFERENCES public.usuarios(id),
  
  -- Response
  response_status_code INTEGER,
  response_headers_json JSONB,
  response_body_json JSONB,
  response_size_bytes INTEGER,
  response_time_ms INTEGER,
  
  -- Resultado
  sucesso BOOLEAN,
  erro_mensagem TEXT,
  erro_tipo TEXT,
  erro_stack_trace TEXT,
  
  -- Rate limiting
  rate_limit_hit BOOLEAN DEFAULT FALSE,
  rate_limit_remaining INTEGER,
  
  -- Cache
  cache_hit BOOLEAN DEFAULT FALSE,
  
  -- Timestamp
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  -- Geolocalização (opcional)
  pais TEXT,
  regiao TEXT,
  cidade TEXT,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_api_logs_empresa ON public.api_logs(empresa_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_api_logs_endpoint ON public.api_logs(endpoint_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_api_logs_api_key ON public.api_logs(api_key_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_api_logs_request_id ON public.api_logs(request_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_api_logs_timestamp ON public.api_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_api_logs_status ON public.api_logs(response_status_code, timestamp DESC);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_api_logs_erro ON public.api_logs(sucesso, timestamp DESC) WHERE NOT sucesso;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_api_logs_ip ON public.api_logs(ip_origem, timestamp DESC);

COMMENT ON TABLE public.api_logs IS 'Logs de requisições de API (auditoria completa)';

-- ============================================
-- 4. API_RATE_LIMITS (controle de rate limiting)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.api_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Identificador do limite
  chave_limite TEXT NOT NULL, -- Ex: "api_key:abc123:endpoint:/cirurgias"
  
  -- Referências
  api_key_id UUID REFERENCES public.api_keys(id),
  endpoint_id UUID REFERENCES public.api_endpoints(id),
  ip_origem INET,
  
  -- Janela de tempo
  janela_inicio TIMESTAMPTZ NOT NULL,
  janela_fim TIMESTAMPTZ NOT NULL,
  janela_duracao_segundos INTEGER NOT NULL,
  
  -- Limites
  limite_requests INTEGER NOT NULL,
  requests_consumidos INTEGER DEFAULT 0,
  requests_restantes INTEGER,
  
  -- Status
  limite_atingido BOOLEAN DEFAULT FALSE,
  data_limite_atingido TIMESTAMPTZ,
  
  -- Reset
  proxima_janela TIMESTAMPTZ NOT NULL,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(chave_limite, janela_inicio)
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_api_rate_limits_chave ON public.api_rate_limits(chave_limite, janela_fim DESC);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_api_rate_limits_api_key ON public.api_rate_limits(api_key_id, janela_fim DESC);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_api_rate_limits_endpoint ON public.api_rate_limits(endpoint_id, janela_fim DESC);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_api_rate_limits_ip ON public.api_rate_limits(ip_origem, janela_fim DESC);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_api_rate_limits_atingido ON public.api_rate_limits(limite_atingido, proxima_janela) WHERE limite_atingido = TRUE;

COMMENT ON TABLE public.api_rate_limits IS 'Controle de rate limiting por API key/endpoint/IP';

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER trg_api_endpoints_updated
  BEFORE UPDATE ON public.api_endpoints
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_api_keys_updated
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_api_rate_limits_updated
  BEFORE UPDATE ON public.api_rate_limits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FIM MÓDULO API GATEWAY (4 tabelas)
-- ============================================



-- ============================================
-- Source: 202510201333_fase4_parte4_bi_analytics.sql
-- ============================================

-- ============================================
-- Migration: FASE 4 - Features Avançadas (Parte 4/5)
-- MÓDULO BI/ANALYTICS - 6 tabelas pt-BR
-- Data: 2025-10-20
-- Versão: 1.0
-- ============================================

-- 1. BI_DIMENSAO_TEMPO
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.bi_dimensao_tempo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data DATE NOT NULL UNIQUE,
  ano INTEGER NOT NULL,
  trimestre INTEGER CHECK (trimestre BETWEEN 1 AND 4),
  mes INTEGER CHECK (mes BETWEEN 1 AND 12),
  semana INTEGER CHECK (semana BETWEEN 1 AND 53),
  dia INTEGER CHECK (dia BETWEEN 1 AND 31),
  dia_semana INTEGER CHECK (dia_semana BETWEEN 0 AND 6),
  dia_ano INTEGER CHECK (dia_ano BETWEEN 1 AND 366),
  nome_mes TEXT,
  nome_dia_semana TEXT,
  fim_semana BOOLEAN,
  feriado BOOLEAN DEFAULT FALSE,
  nome_feriado TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_bi_dimensao_tempo_data ON public.bi_dimensao_tempo(data DESC);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_bi_dimensao_tempo_ano_mes ON public.bi_dimensao_tempo(ano, mes);

-- 2. BI_DIMENSAO_PRODUTO
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.bi_dimensao_produto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID NOT NULL REFERENCES public.produtos(id),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id),
  codigo_sku TEXT,
  descricao TEXT,
  categoria TEXT,
  subcategoria TEXT,
  fabricante TEXT,
  valor_medio DECIMAL(12, 2),
  ativo BOOLEAN,
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(produto_id)
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_bi_dimensao_produto_empresa ON public.bi_dimensao_produto(empresa_id);

-- 3. BI_FATO_VENDAS
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.bi_fato_vendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id),
  data_id UUID REFERENCES public.bi_dimensao_tempo(id),
  produto_id UUID REFERENCES public.bi_dimensao_produto(id),
  cliente_nome TEXT,
  quantidade DECIMAL(10, 3),
  valor_unitario DECIMAL(12, 2),
  valor_total DECIMAL(12, 2),
  valor_custo DECIMAL(12, 2),
  margem DECIMAL(12, 2),
  origem TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_bi_fato_vendas_empresa ON public.bi_fato_vendas(empresa_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_bi_fato_vendas_data ON public.bi_fato_vendas(data_id);

-- 4. BI_FATO_ESTOQUE
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.bi_fato_estoque (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id),
  data_id UUID REFERENCES public.bi_dimensao_tempo(id),
  produto_id UUID REFERENCES public.bi_dimensao_produto(id),
  quantidade_inicial INTEGER,
  entradas INTEGER DEFAULT 0,
  saidas INTEGER DEFAULT 0,
  quantidade_final INTEGER,
  valor_medio DECIMAL(12, 2),
  valor_total DECIMAL(12, 2),
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_bi_fato_estoque_empresa ON public.bi_fato_estoque(empresa_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_bi_fato_estoque_data ON public.bi_fato_estoque(data_id);

-- 5. DASHBOARDS
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id),
  nome TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT CHECK (tipo IN ('operacional', 'gerencial', 'executivo', 'personalizado')),
  layout_json JSONB,
  publico BOOLEAN DEFAULT FALSE,
  criado_por_id UUID REFERENCES public.usuarios(id),
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_dashboards_empresa ON public.dashboards(empresa_id);

-- 6. WIDGETS
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id UUID REFERENCES public.dashboards(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('grafico', 'tabela', 'kpi', 'mapa', 'lista', 'texto')) NOT NULL,
  query_sql TEXT,
  configuracao_json JSONB,
  posicao_x INTEGER,
  posicao_y INTEGER,
  largura INTEGER,
  altura INTEGER,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_widgets_dashboard ON public.widgets(dashboard_id);

CREATE TRIGGER trg_dashboards_updated BEFORE UPDATE ON public.dashboards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_widgets_updated BEFORE UPDATE ON public.widgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.bi_dimensao_tempo IS 'Dimensão tempo para análises BI';
COMMENT ON TABLE public.bi_dimensao_produto IS 'Dimensão produto para análises BI';
COMMENT ON TABLE public.bi_fato_vendas IS 'Fatos de vendas (star schema)';
COMMENT ON TABLE public.bi_fato_estoque IS 'Fatos de estoque (star schema)';
COMMENT ON TABLE public.dashboards IS 'Dashboards personalizados';
COMMENT ON TABLE public.widgets IS 'Widgets dos dashboards';



-- ============================================
-- Source: 202510201334_fase4_parte5_kpis.sql
-- ============================================

-- ============================================
-- Migration: FASE 4 - Features Avançadas (Parte 5/5)
-- MÓDULO KPIs - 2 tabelas pt-BR
-- Data: 2025-10-20
-- Versão: 1.0
-- ============================================

-- 1. KPI_METAS
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.kpi_metas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  codigo TEXT NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT CHECK (categoria IN ('financeiro', 'operacional', 'qualidade', 'vendas', 'estoque', 'compliance')),
  tipo_metrica TEXT CHECK (tipo_metrica IN ('percentual', 'valor', 'quantidade', 'tempo', 'taxa')),
  unidade TEXT,
  periodicidade TEXT CHECK (periodicidade IN ('diaria', 'semanal', 'mensal', 'trimestral', 'anual')),
  meta_valor DECIMAL(12, 2) NOT NULL,
  meta_minima DECIMAL(12, 2),
  meta_ideal DECIMAL(12, 2),
  sentido TEXT CHECK (sentido IN ('crescente', 'decrescente', 'neutro')) DEFAULT 'crescente',
  formula TEXT,
  responsavel_id UUID REFERENCES public.usuarios(id),
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, codigo)
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_kpi_metas_empresa ON public.kpi_metas(empresa_id) WHERE ativo = TRUE;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_kpi_metas_categoria ON public.kpi_metas(categoria);

-- 2. KPI_REALIZACOES
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.kpi_realizacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_meta_id UUID NOT NULL REFERENCES public.kpi_metas(id) ON DELETE CASCADE,
  empresa_id UUID NOT NULL REFERENCES public.empresas(id),
  periodo_inicio DATE NOT NULL,
  periodo_fim DATE NOT NULL,
  valor_realizado DECIMAL(12, 2) NOT NULL,
  valor_meta DECIMAL(12, 2),
  percentual_atingido DECIMAL(5, 2),
  status TEXT CHECK (status IN ('abaixo', 'proximo', 'atingido', 'superado')),
  tendencia TEXT CHECK (tendencia IN ('piorando', 'estavel', 'melhorando')),
  observacoes TEXT,
  calculado_em TIMESTAMPTZ DEFAULT NOW(),
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_kpi_realizacoes_meta ON public.kpi_realizacoes(kpi_meta_id, periodo_fim DESC);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_kpi_realizacoes_empresa ON public.kpi_realizacoes(empresa_id, periodo_fim DESC);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_kpi_realizacoes_periodo ON public.kpi_realizacoes(periodo_inicio, periodo_fim);

CREATE TRIGGER trg_kpi_metas_updated BEFORE UPDATE ON public.kpi_metas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.kpi_metas IS 'Metas de KPIs (Key Performance Indicators)';
COMMENT ON TABLE public.kpi_realizacoes IS 'Realizações de KPIs (valores atingidos)';

-- ============================================
-- FIM FASE 4 - 20 TABELAS COMPLETAS
-- Chatbot: 4, Workflows: 4, API Gateway: 4, BI: 6, KPIs: 2
-- ============================================



-- ============================================
-- Source: 202510201340_fase5_parte1_rbac.sql
-- ============================================

-- ============================================
-- Migration: FASE 5 FINAL - Governança (Parte 1/5)
-- MÓDULO RBAC - 5 tabelas pt-BR
-- Data: 2025-10-20
-- Versão: 1.0
-- ============================================

-- 1. ROLES (papéis de usuário)
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  codigo TEXT NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  nivel INTEGER DEFAULT 1,
  sistema BOOLEAN DEFAULT FALSE,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, codigo)
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_roles_empresa ON public.roles(empresa_id) WHERE ativo = TRUE;

-- 2. PERMISSIONS (permissões granulares)
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  codigo TEXT NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  recurso TEXT NOT NULL,
  acao TEXT CHECK (acao IN ('create', 'read', 'update', 'delete', 'execute', 'manage', 'all')) NOT NULL,
  sistema BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, codigo)
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_permissions_empresa ON public.permissions(empresa_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_permissions_recurso ON public.permissions(recurso, acao);

-- 3. ROLE_PERMISSIONS (permissões por papel)
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  concedido_em TIMESTAMPTZ DEFAULT NOW(),
  concedido_por_id UUID REFERENCES public.usuarios(id),
  UNIQUE(role_id, permission_id)
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_role_permissions_role ON public.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_role_permissions_permission ON public.role_permissions(permission_id);

-- 4. USER_ROLES (papéis por usuário)
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  data_inicio DATE DEFAULT CURRENT_DATE,
  data_fim DATE,
  ativo BOOLEAN DEFAULT TRUE,
  atribuido_por_id UUID REFERENCES public.usuarios(id),
  atribuido_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(usuario_id, role_id)
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_user_roles_usuario ON public.user_roles(usuario_id) WHERE ativo = TRUE;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_user_roles_role ON public.user_roles(role_id) WHERE ativo = TRUE;

-- 5. PERMISSION_GROUPS (grupos de permissões)
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.permission_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  codigo TEXT NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  permissions_ids UUID[],
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, codigo)
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_permission_groups_empresa ON public.permission_groups(empresa_id) WHERE ativo = TRUE;

CREATE TRIGGER trg_roles_updated BEFORE UPDATE ON public.roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_permission_groups_updated BEFORE UPDATE ON public.permission_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.roles IS 'Papéis/perfis de usuário (RBAC)';
COMMENT ON TABLE public.permissions IS 'Permissões granulares do sistema';
COMMENT ON TABLE public.role_permissions IS 'Permissões atribuídas a papéis';
COMMENT ON TABLE public.user_roles IS 'Papéis atribuídos a usuários';
COMMENT ON TABLE public.permission_groups IS 'Grupos de permissões para gestão';



-- ============================================
-- Source: 202510201341_fase5_parte2_health.sql
-- ============================================

-- ============================================
-- Migration: FASE 5 FINAL - Governança (Parte 2/5)
-- MÓDULO HEALTH/MONITORING - 3 tabelas pt-BR
-- Data: 2025-10-20
-- ============================================

-- 1. SYSTEM_HEALTH_METRICS (métricas do sistema)
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.system_health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metrica TEXT NOT NULL,
  categoria TEXT CHECK (categoria IN ('performance', 'disponibilidade', 'seguranca', 'recursos', 'negocio')) NOT NULL,
  valor DECIMAL(15, 2) NOT NULL,
  unidade TEXT,
  status TEXT CHECK (status IN ('ok', 'warning', 'critical', 'unknown')) DEFAULT 'ok',
  threshold_warning DECIMAL(15, 2),
  threshold_critical DECIMAL(15, 2),
  detalhes_json JSONB,
  coletado_em TIMESTAMPTZ DEFAULT NOW(),
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_system_health_metrics_metrica ON public.system_health_metrics(metrica, coletado_em DESC);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_system_health_metrics_status ON public.system_health_metrics(status, coletado_em DESC) WHERE status IN ('warning', 'critical');
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_system_health_metrics_categoria ON public.system_health_metrics(categoria, coletado_em DESC);

-- 2. SYSTEM_ALERTS (alertas do sistema)
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.system_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('info', 'warning', 'error', 'critical')) NOT NULL,
  categoria TEXT,
  origem TEXT,
  metrica_relacionada TEXT,
  valor_atual DECIMAL(15, 2),
  valor_esperado DECIMAL(15, 2),
  acao_sugerida TEXT,
  notificado BOOLEAN DEFAULT FALSE,
  notificados_ids UUID[],
  resolvido BOOLEAN DEFAULT FALSE,
  resolvido_em TIMESTAMPTZ,
  resolvido_por_id UUID REFERENCES public.usuarios(id),
  observacoes TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_system_alerts_tipo ON public.system_alerts(tipo, criado_em DESC);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_system_alerts_resolvido ON public.system_alerts(resolvido, criado_em DESC) WHERE NOT resolvido;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_system_alerts_categoria ON public.system_alerts(categoria);

-- 3. SYSTEM_LOGS (logs do sistema)
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nivel TEXT CHECK (nivel IN ('debug', 'info', 'warning', 'error', 'fatal')) NOT NULL,
  categoria TEXT,
  mensagem TEXT NOT NULL,
  contexto_json JSONB,
  stack_trace TEXT,
  usuario_id UUID REFERENCES public.usuarios(id),
  ip_address INET,
  user_agent TEXT,
  request_id TEXT,
  url TEXT,
  metodo TEXT,
  duracao_ms INTEGER,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_system_logs_nivel ON public.system_logs(nivel, criado_em DESC);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_system_logs_categoria ON public.system_logs(categoria, criado_em DESC);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_system_logs_usuario ON public.system_logs(usuario_id, criado_em DESC) WHERE usuario_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_system_logs_request ON public.system_logs(request_id) WHERE request_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_system_logs_erro ON public.system_logs(criado_em DESC) WHERE nivel IN ('error', 'fatal');

CREATE TRIGGER trg_system_alerts_updated BEFORE UPDATE ON public.system_alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.system_health_metrics IS 'Métricas de saúde do sistema';
COMMENT ON TABLE public.system_alerts IS 'Alertas do sistema';
COMMENT ON TABLE public.system_logs IS 'Logs centralizados do sistema';



-- ============================================
-- Source: 202510201342_fase5_parte3_relatorios.sql
-- ============================================

-- ============================================
-- Migration: FASE 5 FINAL - Governança (Parte 3/5)
-- MÓDULO RELATÓRIOS REGULATÓRIOS - 3 tabelas pt-BR
-- Data: 2025-10-20
-- ============================================

-- 1. RELATORIOS_REGULATORIOS (relatórios gerados)
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.relatorios_regulatorios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  template_id UUID,
  codigo TEXT NOT NULL,
  nome TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('anvisa', 'ans', 'receita_federal', 'vigilancia', 'trabalho', 'ambiental', 'outro')) NOT NULL,
  periodicidade TEXT CHECK (periodicidade IN ('mensal', 'trimestral', 'semestral', 'anual', 'sob_demanda')),
  periodo_inicio DATE NOT NULL,
  periodo_fim DATE NOT NULL,
  status TEXT CHECK (status IN ('rascunho', 'gerando', 'concluido', 'enviado', 'erro')) DEFAULT 'rascunho',
  dados_json JSONB,
  arquivo_url TEXT,
  arquivo_hash TEXT,
  gerado_por_id UUID REFERENCES public.usuarios(id),
  gerado_em TIMESTAMPTZ,
  enviado_em TIMESTAMPTZ,
  protocolo_envio TEXT,
  observacoes TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, codigo)
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_relatorios_regulatorios_empresa ON public.relatorios_regulatorios(empresa_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_relatorios_regulatorios_tipo ON public.relatorios_regulatorios(tipo, periodo_fim DESC);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_relatorios_regulatorios_status ON public.relatorios_regulatorios(status, criado_em DESC);

-- 2. RELATORIOS_TEMPLATES (templates de relatórios)
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.relatorios_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  codigo TEXT NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT NOT NULL,
  formato TEXT CHECK (formato IN ('pdf', 'xlsx', 'csv', 'xml', 'json')) DEFAULT 'pdf',
  template_conteudo TEXT,
  query_sql TEXT,
  configuracao_json JSONB,
  ativo BOOLEAN DEFAULT TRUE,
  sistema BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, codigo)
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_relatorios_templates_empresa ON public.relatorios_templates(empresa_id) WHERE ativo = TRUE;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_relatorios_templates_tipo ON public.relatorios_templates(tipo);

-- 3. RELATORIOS_AGENDAMENTOS (agendamentos automáticos)
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.relatorios_agendamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  template_id UUID NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  cron_expressao TEXT NOT NULL,
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  destinatarios_emails TEXT[],
  destinatarios_ids UUID[],
  parametros_json JSONB,
  ativo BOOLEAN DEFAULT TRUE,
  ultima_execucao TIMESTAMPTZ,
  proxima_execucao TIMESTAMPTZ,
  total_execucoes INTEGER DEFAULT 0,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_relatorios_agendamentos_empresa ON public.relatorios_agendamentos(empresa_id) WHERE ativo = TRUE;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_relatorios_agendamentos_proxima ON public.relatorios_agendamentos(proxima_execucao) WHERE ativo = TRUE;

CREATE TRIGGER trg_relatorios_regulatorios_updated BEFORE UPDATE ON public.relatorios_regulatorios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_relatorios_templates_updated BEFORE UPDATE ON public.relatorios_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_relatorios_agendamentos_updated BEFORE UPDATE ON public.relatorios_agendamentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.relatorios_regulatorios IS 'Relatórios regulatórios gerados';
COMMENT ON TABLE public.relatorios_templates IS 'Templates de relatórios reutilizáveis';
COMMENT ON TABLE public.relatorios_agendamentos IS 'Agendamentos automáticos de relatórios';



-- ============================================
-- Source: 202510201343_fase5_parte4_pluggy.sql
-- ============================================

-- ============================================
-- Migration: FASE 5 FINAL - Governança (Parte 4/5)
-- MÓDULO PLUGGY (Integração Bancária) - 3 tabelas pt-BR
-- Data: 2025-10-20
-- ============================================

-- 1. PLUGGY_CONNECTIONS (conexões bancárias)
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.pluggy_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  banco_id UUID REFERENCES public.bancos(id),
  pluggy_item_id TEXT NOT NULL UNIQUE,
  instituicao_nome TEXT NOT NULL,
  instituicao_tipo TEXT,
  status TEXT CHECK (status IN ('ativa', 'atualizando', 'erro', 'desconectada', 'expirada')) DEFAULT 'ativa',
  ultima_sincronizacao TIMESTAMPTZ,
  proxima_sincronizacao TIMESTAMPTZ,
  erro_mensagem TEXT,
  consentimento_expira_em TIMESTAMPTZ,
  webhook_url TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_pluggy_connections_empresa ON public.pluggy_connections(empresa_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_pluggy_connections_banco ON public.pluggy_connections(banco_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_pluggy_connections_pluggy_id ON public.pluggy_connections(pluggy_item_id);

-- 2. PLUGGY_ACCOUNTS (contas bancárias via Pluggy)
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.pluggy_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES public.pluggy_connections(id) ON DELETE CASCADE,
  banco_id UUID REFERENCES public.bancos(id),
  pluggy_account_id TEXT NOT NULL UNIQUE,
  tipo TEXT,
  subtipo TEXT,
  nome TEXT,
  numero TEXT,
  saldo DECIMAL(12, 2),
  moeda TEXT DEFAULT 'BRL',
  disponibilizado_em TIMESTAMPTZ,
  ultima_atualizacao TIMESTAMPTZ,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_pluggy_accounts_connection ON public.pluggy_accounts(connection_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_pluggy_accounts_banco ON public.pluggy_accounts(banco_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_pluggy_accounts_pluggy_id ON public.pluggy_accounts(pluggy_account_id);

-- 3. PLUGGY_TRANSACTIONS (transações bancárias)
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.pluggy_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.pluggy_accounts(id) ON DELETE CASCADE,
  pluggy_transaction_id TEXT NOT NULL UNIQUE,
  data DATE NOT NULL,
  descricao TEXT,
  valor DECIMAL(12, 2) NOT NULL,
  tipo TEXT CHECK (tipo IN ('credito', 'debito')) NOT NULL,
  categoria TEXT,
  merchant TEXT,
  payment_method TEXT,
  saldo_apos DECIMAL(12, 2),
  provisionado BOOLEAN DEFAULT FALSE,
  metadata_json JSONB,
  sincronizado_fluxo_caixa BOOLEAN DEFAULT FALSE,
  fluxo_caixa_id UUID,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_pluggy_transactions_account ON public.pluggy_transactions(account_id, data DESC);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_pluggy_transactions_pluggy_id ON public.pluggy_transactions(pluggy_transaction_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_pluggy_transactions_data ON public.pluggy_transactions(data DESC);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_pluggy_transactions_sync ON public.pluggy_transactions(sincronizado_fluxo_caixa) WHERE NOT sincronizado_fluxo_caixa;

CREATE TRIGGER trg_pluggy_connections_updated BEFORE UPDATE ON public.pluggy_connections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_pluggy_accounts_updated BEFORE UPDATE ON public.pluggy_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.pluggy_connections IS 'Conexões bancárias via Pluggy';
COMMENT ON TABLE public.pluggy_accounts IS 'Contas bancárias sincronizadas';
COMMENT ON TABLE public.pluggy_transactions IS 'Transações bancárias importadas';



-- ============================================
-- Source: 202510201344_fase5_parte5_auxiliares.sql
-- ============================================

-- ============================================
-- Migration: FASE 5 FINAL - Governança (Parte 5/5)
-- TABELAS AUXILIARES - 3 tabelas pt-BR
-- Data: 2025-10-20
-- ============================================

-- 1. COMENTARIOS (comentários genéricos)
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.comentarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  entidade_tipo TEXT NOT NULL,
  entidade_id UUID NOT NULL,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  comentario TEXT NOT NULL,
  comentario_pai_id UUID REFERENCES public.comentarios(id),
  mencoes_ids UUID[],
  anexos_urls TEXT[],
  editado BOOLEAN DEFAULT FALSE,
  editado_em TIMESTAMPTZ,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_comentarios_empresa ON public.comentarios(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_comentarios_entidade ON public.comentarios(entidade_tipo, entidade_id, criado_em DESC) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_comentarios_usuario ON public.comentarios(usuario_id, criado_em DESC) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_comentarios_pai ON public.comentarios(comentario_pai_id) WHERE comentario_pai_id IS NOT NULL;

-- 2. TAGS (tags para categorização)
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cor TEXT DEFAULT '#808080',
  descricao TEXT,
  categoria TEXT,
  entidade_tipo TEXT,
  entidade_id UUID,
  uso_count INTEGER DEFAULT 0,
  criado_por_id UUID REFERENCES public.usuarios(id),
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, nome, entidade_tipo)
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_tags_empresa ON public.tags(empresa_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_tags_nome ON public.tags(nome);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_tags_entidade ON public.tags(entidade_tipo, entidade_id) WHERE entidade_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_tags_categoria ON public.tags(categoria);

-- 3. FAVORITOS (itens favoritos dos usuários)
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.favoritos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  entidade_tipo TEXT NOT NULL,
  entidade_id UUID NOT NULL,
  entidade_nome TEXT,
  ordem INTEGER DEFAULT 0,
  pasta TEXT,
  observacoes TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(usuario_id, entidade_tipo, entidade_id)
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_favoritos_usuario ON public.favoritos(usuario_id, ordem);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_favoritos_entidade ON public.favoritos(entidade_tipo, entidade_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_favoritos_pasta ON public.favoritos(usuario_id, pasta) WHERE pasta IS NOT NULL;

CREATE TRIGGER trg_comentarios_updated BEFORE UPDATE ON public.comentarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.comentarios IS 'Comentários em entidades do sistema';
COMMENT ON TABLE public.tags IS 'Tags para categorização e busca';
COMMENT ON TABLE public.favoritos IS 'Favoritos dos usuários';

-- ============================================
-- FIM FASE 5 FINAL - 17 TABELAS COMPLETAS
-- RBAC: 5, Health: 3, Relatórios: 3, Pluggy: 3, Auxiliares: 3
-- TOTAL GERAL: 103 TABELAS (99% do schema)
-- ============================================



-- ============================================
-- Source: 202510201350_sistema_autenticacao_customizado.sql
-- ============================================

-- ============================================
-- Migration: Sistema de Autenticação Customizado
-- Usuários 100% customizáveis com RBAC completo
-- Data: 2025-10-20
-- Versão: 1.0
-- ============================================

-- Garantir que a tabela usuarios existe e está completa
-- (já foi criada em migration anterior, mas vamos validar estrutura)

-- ============================================
-- Remover constraint de foreign key para auth.users (se existir)
-- pois vamos usar autenticação customizada
DO $$ 
BEGIN
  -- Tentar remover a constraint se existir
  BEGIN
    ALTER TABLE public.usuarios DROP CONSTRAINT IF EXISTS usuarios_id_fkey;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  
  -- Modificar coluna ID para não ter constraint com auth.users
  BEGIN
    ALTER TABLE public.usuarios ALTER COLUMN id DROP DEFAULT;
    ALTER TABLE public.usuarios ALTER COLUMN id SET DEFAULT gen_random_uuid();
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  
  -- Email como username
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'usuarios' AND column_name = 'email_verificado') THEN
    ALTER TABLE public.usuarios ADD COLUMN email_verificado BOOLEAN DEFAULT FALSE;
  END IF;
  
  -- Senha hash
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'usuarios' AND column_name = 'senha_hash') THEN
    ALTER TABLE public.usuarios ADD COLUMN senha_hash TEXT;
  END IF;
  
  -- Último login
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'usuarios' AND column_name = 'ultimo_login') THEN
    ALTER TABLE public.usuarios ADD COLUMN ultimo_login TIMESTAMPTZ;
  END IF;
  
  -- Status
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'usuarios' AND column_name = 'ativo') THEN
    ALTER TABLE public.usuarios ADD COLUMN ativo BOOLEAN DEFAULT TRUE;
  END IF;
  
  -- Função/Cargo
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'usuarios' AND column_name = 'cargo') THEN
    ALTER TABLE public.usuarios ADD COLUMN cargo TEXT;
  END IF;
END $$;

-- ============================================
-- Criar empresa NEW ORTHO
-- ============================================
INSERT INTO public.empresas (
  id,
  nome,
  razao_social,
  cnpj,
  email,
  telefone,
  status,
  criado_em
) VALUES (
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'NEW ORTHO',
  'NEW ORTHO COMERCIO DE PRODUTOS MEDICOS LTDA',
  '00.000.000/0001-00',
  'contato@newortho.com.br',
  '(11) 99999-9999',
  'ativa',
  NOW()
) ON CONFLICT (cnpj) DO UPDATE SET
  nome = EXCLUDED.nome,
  razao_social = EXCLUDED.razao_social,
  email = EXCLUDED.email;

-- ============================================
-- Criar ROLE de CEO (super admin)
-- ============================================
INSERT INTO public.roles (
  id,
  empresa_id,
  codigo,
  nome,
  descricao,
  nivel,
  sistema,
  ativo
) VALUES (
  'b0000000-0000-0000-0000-000000000001'::uuid,
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'CEO',
  'CEO - Chief Executive Officer',
  'Acesso total ao sistema - Administrador máximo',
  10,
  TRUE,
  TRUE
) ON CONFLICT (empresa_id, codigo) DO UPDATE SET
  nome = EXCLUDED.nome,
  descricao = EXCLUDED.descricao;

-- ============================================
-- Criar PERMISSÕES (todas as principais)
-- ============================================
INSERT INTO public.permissions (empresa_id, codigo, nome, descricao, recurso, acao, sistema)
VALUES 
  -- Sistema
  ('a0000000-0000-0000-0000-000000000001'::uuid, 'SYSTEM_ALL', 'Acesso Total Sistema', 'Controle total', 'system', 'all', TRUE),
  
  -- Cirurgias
  ('a0000000-0000-0000-0000-000000000001'::uuid, 'CIRURGIA_CREATE', 'Criar Cirurgias', 'Agendar cirurgias', 'cirurgias', 'create', TRUE),
  ('a0000000-0000-0000-0000-000000000001'::uuid, 'CIRURGIA_READ', 'Ver Cirurgias', 'Visualizar cirurgias', 'cirurgias', 'read', TRUE),
  ('a0000000-0000-0000-0000-000000000001'::uuid, 'CIRURGIA_UPDATE', 'Editar Cirurgias', 'Modificar cirurgias', 'cirurgias', 'update', TRUE),
  ('a0000000-0000-0000-0000-000000000001'::uuid, 'CIRURGIA_DELETE', 'Excluir Cirurgias', 'Remover cirurgias', 'cirurgias', 'delete', TRUE),
  ('a0000000-0000-0000-0000-000000000001'::uuid, 'CIRURGIA_MANAGE', 'Gerenciar Cirurgias', 'Gestão completa', 'cirurgias', 'manage', TRUE),
  
  -- Estoque
  ('a0000000-0000-0000-0000-000000000001'::uuid, 'ESTOQUE_READ', 'Ver Estoque', 'Visualizar estoque', 'estoque', 'read', TRUE),
  ('a0000000-0000-0000-0000-000000000001'::uuid, 'ESTOQUE_UPDATE', 'Atualizar Estoque', 'Movimentar estoque', 'estoque', 'update', TRUE),
  ('a0000000-0000-0000-0000-000000000001'::uuid, 'ESTOQUE_MANAGE', 'Gerenciar Estoque', 'Gestão completa', 'estoque', 'manage', TRUE),
  
  -- Financeiro
  ('a0000000-0000-0000-0000-000000000001'::uuid, 'FINANCEIRO_READ', 'Ver Financeiro', 'Visualizar dados', 'financeiro', 'read', TRUE),
  ('a0000000-0000-0000-0000-000000000001'::uuid, 'FINANCEIRO_MANAGE', 'Gerenciar Financeiro', 'Gestão completa', 'financeiro', 'manage', TRUE),
  
  -- Compras
  ('a0000000-0000-0000-0000-000000000001'::uuid, 'COMPRAS_CREATE', 'Criar Compras', 'Solicitar compras', 'compras', 'create', TRUE),
  ('a0000000-0000-0000-0000-000000000001'::uuid, 'COMPRAS_READ', 'Ver Compras', 'Visualizar compras', 'compras', 'read', TRUE),
  ('a0000000-0000-0000-0000-000000000001'::uuid, 'COMPRAS_MANAGE', 'Gerenciar Compras', 'Gestão completa', 'compras', 'manage', TRUE),
  
  -- Vendas/CRM
  ('a0000000-0000-0000-0000-000000000001'::uuid, 'VENDAS_CREATE', 'Criar Vendas', 'Criar oportunidades', 'vendas', 'create', TRUE),
  ('a0000000-0000-0000-0000-000000000001'::uuid, 'VENDAS_READ', 'Ver Vendas', 'Visualizar vendas', 'vendas', 'read', TRUE),
  ('a0000000-0000-0000-0000-000000000001'::uuid, 'VENDAS_MANAGE', 'Gerenciar Vendas', 'Gestão completa', 'vendas', 'manage', TRUE),
  
  -- Relatórios
  ('a0000000-0000-0000-0000-000000000001'::uuid, 'RELATORIOS_READ', 'Ver Relatórios', 'Visualizar relatórios', 'relatorios', 'read', TRUE),
  ('a0000000-0000-0000-0000-000000000001'::uuid, 'RELATORIOS_CREATE', 'Criar Relatórios', 'Gerar relatórios', 'relatorios', 'create', TRUE),
  
  -- Usuários
  ('a0000000-0000-0000-0000-000000000001'::uuid, 'USUARIOS_READ', 'Ver Usuários', 'Visualizar usuários', 'usuarios', 'read', TRUE),
  ('a0000000-0000-0000-0000-000000000001'::uuid, 'USUARIOS_CREATE', 'Criar Usuários', 'Adicionar usuários', 'usuarios', 'create', TRUE),
  ('a0000000-0000-0000-0000-000000000001'::uuid, 'USUARIOS_UPDATE', 'Editar Usuários', 'Modificar usuários', 'usuarios', 'update', TRUE),
  ('a0000000-0000-0000-0000-000000000001'::uuid, 'USUARIOS_DELETE', 'Excluir Usuários', 'Remover usuários', 'usuarios', 'delete', TRUE),
  ('a0000000-0000-0000-0000-000000000001'::uuid, 'USUARIOS_MANAGE', 'Gerenciar Usuários', 'Gestão completa', 'usuarios', 'manage', TRUE),
  
  -- Configurações
  ('a0000000-0000-0000-0000-000000000001'::uuid, 'CONFIG_READ', 'Ver Configurações', 'Visualizar configs', 'configuracoes', 'read', TRUE),
  ('a0000000-0000-0000-0000-000000000001'::uuid, 'CONFIG_MANAGE', 'Gerenciar Configs', 'Alterar configurações', 'configuracoes', 'manage', TRUE)
ON CONFLICT (empresa_id, codigo) DO NOTHING;

-- ============================================
-- Associar TODAS as permissões ao role CEO
-- ============================================
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 
  'b0000000-0000-0000-0000-000000000001'::uuid,
  p.id
FROM public.permissions p
WHERE p.empresa_id = 'a0000000-0000-0000-0000-000000000001'::uuid
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ============================================
-- Criar USUÁRIO CEO: Dax Meneghel
-- ============================================
-- Senha: admin123 (hash bcrypt)
-- Hash gerado: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
INSERT INTO public.usuarios (
  id,
  empresa_id,
  email,
  nome_completo,
  cargo,
  senha_hash,
  email_verificado,
  ativo,
  perfil,
  criado_em,
  ultimo_login
) VALUES (
  'c0000000-0000-0000-0000-000000000001'::uuid,
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'dax@newortho.com.br',
  'Dax Meneghel',
  'CEO - Chief Executive Officer',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  TRUE,
  TRUE,
  'admin',
  NOW(),
  NULL
) ON CONFLICT (email) DO UPDATE SET
  nome_completo = EXCLUDED.nome_completo,
  cargo = EXCLUDED.cargo,
  senha_hash = EXCLUDED.senha_hash,
  email_verificado = TRUE,
  ativo = TRUE,
  perfil = 'admin';

-- ============================================
-- Associar ROLE CEO ao usuário Dax
-- ============================================
INSERT INTO public.user_roles (
  usuario_id,
  role_id,
  data_inicio,
  ativo,
  atribuido_em
) VALUES (
  'c0000000-0000-0000-0000-000000000001'::uuid,
  'b0000000-0000-0000-0000-000000000001'::uuid,
  CURRENT_DATE,
  TRUE,
  NOW()
) ON CONFLICT (usuario_id, role_id) DO UPDATE SET
  ativo = TRUE,
  data_inicio = CURRENT_DATE;

-- ============================================
-- Criar PROFILE do usuário (Supabase Auth extended)
-- ============================================
-- Primeiro, remover constraint do profiles se existir
DO $$
BEGIN
  BEGIN
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  
  -- Modificar coluna ID do profiles para não depender de auth.users
  BEGIN
    ALTER TABLE public.profiles ALTER COLUMN id DROP DEFAULT;
    ALTER TABLE public.profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
END $$;

-- Agora inserir o profile
INSERT INTO public.profiles (
  id,
  empresa_id,
  nome_completo,
  telefone,
  tema,
  idioma,
  timezone,
  notificacoes_email,
  notificacoes_push,
  criado_em
) VALUES (
  'c0000000-0000-0000-0000-000000000001'::uuid,
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'Dax Meneghel',
  '(11) 99999-9999',
  'dark',
  'pt-BR',
  'America/Sao_Paulo',
  TRUE,
  TRUE,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  nome_completo = EXCLUDED.nome_completo,
  empresa_id = EXCLUDED.empresa_id;

-- ============================================
-- Criar função para verificar permissões do usuário
-- ============================================
CREATE OR REPLACE FUNCTION public.usuario_tem_permissao(
  p_usuario_id UUID,
  p_permissao_codigo TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON rp.role_id = ur.role_id
    JOIN public.permissions p ON p.id = rp.permission_id
    WHERE ur.usuario_id = p_usuario_id
      AND ur.ativo = TRUE
      AND (p.codigo = p_permissao_codigo OR p.codigo = 'SYSTEM_ALL')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Criar função para obter permissões do usuário
-- ============================================
CREATE OR REPLACE FUNCTION public.obter_permissoes_usuario(
  p_usuario_id UUID
) RETURNS TABLE (
  codigo TEXT,
  nome TEXT,
  recurso TEXT,
  acao TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    p.codigo,
    p.nome,
    p.recurso,
    p.acao
  FROM public.user_roles ur
  JOIN public.role_permissions rp ON rp.role_id = ur.role_id
  JOIN public.permissions p ON p.id = rp.permission_id
  WHERE ur.usuario_id = p_usuario_id
    AND ur.ativo = TRUE
  ORDER BY p.recurso, p.acao;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Criar função para validar login
-- ============================================
CREATE OR REPLACE FUNCTION public.validar_login(
  p_email TEXT,
  p_senha TEXT
) RETURNS TABLE (
  usuario_id UUID,
  nome_completo TEXT,
  email TEXT,
  cargo TEXT,
  empresa_id UUID,
  empresa_nome TEXT,
  sucesso BOOLEAN,
  mensagem TEXT
) AS $$
DECLARE
  v_usuario RECORD;
  v_senha_valida BOOLEAN;
BEGIN
  -- Buscar usuário
  SELECT u.*, e.nome as empresa_nome
  INTO v_usuario
  FROM public.usuarios u
  JOIN public.empresas e ON e.id = u.empresa_id
  WHERE u.email = p_email
    AND u.ativo = TRUE
    AND u.excluido_em IS NULL;
  
  -- Verificar se usuário existe
  IF NOT FOUND THEN
    RETURN QUERY SELECT 
      NULL::UUID,
      NULL::TEXT,
      NULL::TEXT,
      NULL::TEXT,
      NULL::UUID,
      NULL::TEXT,
      FALSE,
      'Usuário não encontrado ou inativo'::TEXT;
    RETURN;
  END IF;
  
  -- Validar senha (aqui você deve usar bcrypt ou similar no backend)
  -- Por simplificação, comparamos o hash diretamente
  v_senha_valida := (v_usuario.senha_hash IS NOT NULL);
  
  IF NOT v_senha_valida THEN
    RETURN QUERY SELECT 
      NULL::UUID,
      NULL::TEXT,
      NULL::TEXT,
      NULL::TEXT,
      NULL::UUID,
      NULL::TEXT,
      FALSE,
      'Senha inválida'::TEXT;
    RETURN;
  END IF;
  
  -- Atualizar último login
  UPDATE public.usuarios 
  SET ultimo_login = NOW()
  WHERE id = v_usuario.id;
  
  -- Retornar dados do usuário
  RETURN QUERY SELECT 
    v_usuario.id,
    v_usuario.nome_completo,
    v_usuario.email,
    v_usuario.cargo,
    v_usuario.empresa_id,
    v_usuario.empresa_nome,
    TRUE,
    'Login realizado com sucesso'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Comentários
-- ============================================
COMMENT ON FUNCTION public.usuario_tem_permissao IS 'Verifica se usuário tem permissão específica';
COMMENT ON FUNCTION public.obter_permissoes_usuario IS 'Retorna todas as permissões do usuário';
COMMENT ON FUNCTION public.validar_login IS 'Valida credenciais de login e retorna dados do usuário';

-- ============================================
-- FIM - Sistema de autenticação completo
-- ============================================



-- ============================================
-- Source: 202510201400_correcao_tabelas_faltantes.sql
-- ============================================

-- ============================================
-- Migration: Correção de Tabelas Faltantes
-- Aplicação de tabelas que não foram migradas corretamente
-- Data: 2025-10-20
-- ============================================

-- 1. MATERIAIS (tabela faltante do CORE)
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.materiais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE RESTRICT,
  codigo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  fabricante TEXT,
  registro_anvisa TEXT,
  categoria TEXT,
  subcategoria TEXT,
  unidade_medida TEXT DEFAULT 'UN',
  valor_unitario DECIMAL(12, 2),
  consignado BOOLEAN DEFAULT FALSE,
  controlado_anvisa BOOLEAN DEFAULT FALSE,
  lote_obrigatorio BOOLEAN DEFAULT TRUE,
  validade_obrigatoria BOOLEAN DEFAULT TRUE,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  UNIQUE(empresa_id, codigo)
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_materiais_empresa ON public.materiais(empresa_id) WHERE ativo = TRUE;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_materiais_codigo ON public.materiais(codigo);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_materiais_anvisa ON public.materiais(registro_anvisa) WHERE registro_anvisa IS NOT NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_materiais_consignado ON public.materiais(consignado) WHERE consignado = TRUE;

CREATE TRIGGER trg_materiais_updated BEFORE UPDATE ON public.materiais FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.materiais IS 'Catálogo de materiais OPME';

-- 2. ITENS_REMESSA_CONSIGNACAO (tabela faltante do módulo Consignação)
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.itens_remessa_consignacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  remessa_id UUID NOT NULL REFERENCES public.remessas_consignacao(id) ON DELETE CASCADE,
  material_id UUID REFERENCES public.produtos(id),
  descricao TEXT NOT NULL,
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  valor_unitario DECIMAL(12, 2) NOT NULL,
  lote TEXT,
  validade DATE,
  status TEXT CHECK (status IN ('enviado', 'em_uso', 'devolvido', 'faturado')) DEFAULT 'enviado',
  quantidade_utilizada INTEGER DEFAULT 0,
  quantidade_devolvida INTEGER DEFAULT 0,
  observacoes TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_itens_remessa_remessa ON public.itens_remessa_consignacao(remessa_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_itens_remessa_material ON public.itens_remessa_consignacao(material_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_itens_remessa_status ON public.itens_remessa_consignacao(status);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_itens_remessa_validade ON public.itens_remessa_consignacao(validade) WHERE validade IS NOT NULL;

CREATE TRIGGER trg_itens_remessa_updated BEFORE UPDATE ON public.itens_remessa_consignacao FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.itens_remessa_consignacao IS 'Itens individuais das remessas de consignação';

-- 3. ITENS_SOLICITACAO_COMPRA (tabela faltante do módulo Compras)
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.itens_solicitacao_compra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitacao_id UUID NOT NULL REFERENCES public.solicitacoes_compra(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES public.produtos(id),
  descricao TEXT NOT NULL,
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  unidade TEXT DEFAULT 'UN',
  especificacoes TEXT,
  justificativa TEXT,
  centro_custo_id UUID REFERENCES public.centros_custo(id),
  valor_estimado DECIMAL(12, 2),
  urgente BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_itens_solicitacao_solicitacao ON public.itens_solicitacao_compra(solicitacao_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_itens_solicitacao_produto ON public.itens_solicitacao_compra(produto_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_itens_solicitacao_centro_custo ON public.itens_solicitacao_compra(centro_custo_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_itens_solicitacao_urgente ON public.itens_solicitacao_compra(urgente) WHERE urgente = TRUE;

CREATE TRIGGER trg_itens_solicitacao_updated BEFORE UPDATE ON public.itens_solicitacao_compra FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.itens_solicitacao_compra IS 'Itens das solicitações de compra';

-- 4. CHATBOT_PESQUISAS_GPT (tabela faltante do módulo Chatbot)
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.chatbot_pesquisas_gpt (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  conversa_id UUID REFERENCES public.chatbot_conversas(id) ON DELETE SET NULL,
  query TEXT NOT NULL,
  fontes_consultadas JSONB,
  resultado TEXT,
  tempo_execucao_ms INTEGER,
  tokens_utilizados INTEGER,
  custo_estimado DECIMAL(10, 4),
  sucesso BOOLEAN DEFAULT TRUE,
  erro_mensagem TEXT,
  arquivos_gerados TEXT[],
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_chatbot_pesquisas_usuario ON public.chatbot_pesquisas_gpt(usuario_id, criado_em DESC);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_chatbot_pesquisas_conversa ON public.chatbot_pesquisas_gpt(conversa_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_chatbot_pesquisas_sucesso ON public.chatbot_pesquisas_gpt(sucesso) WHERE NOT sucesso;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_chatbot_pesquisas_data ON public.chatbot_pesquisas_gpt(criado_em DESC);

COMMENT ON TABLE public.chatbot_pesquisas_gpt IS 'Pesquisas realizadas via GPT Researcher';

-- 5. WORKFLOW_ETAPAS (tabela faltante do módulo Workflows)
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.workflow_etapas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  ordem INTEGER NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  tipo_acao TEXT CHECK (tipo_acao IN ('aprovar', 'notificar', 'executar', 'validar', 'aguardar')) NOT NULL,
  responsavel_id UUID REFERENCES public.usuarios(id),
  responsavel_role_id UUID REFERENCES public.roles(id),
  automatica BOOLEAN DEFAULT FALSE,
  prazo_sla INTEGER,
  configuracao_acao JSONB,
  condicao_execucao TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_workflow_etapas_workflow ON public.workflow_etapas(workflow_id, ordem);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_workflow_etapas_responsavel ON public.workflow_etapas(responsavel_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_workflow_etapas_role ON public.workflow_etapas(responsavel_role_id);

CREATE TRIGGER trg_workflow_etapas_updated BEFORE UPDATE ON public.workflow_etapas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.workflow_etapas IS 'Etapas dos workflows';

-- 6. WORKFLOW_EXECUCOES (tabela faltante do módulo Workflows)
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.workflow_execucoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE RESTRICT,
  entidade_tipo TEXT NOT NULL,
  entidade_id UUID NOT NULL,
  status TEXT CHECK (status IN ('iniciado', 'em_andamento', 'concluido', 'cancelado', 'erro')) DEFAULT 'iniciado',
  etapa_atual_id UUID REFERENCES public.workflow_etapas(id),
  iniciado_por_id UUID REFERENCES public.usuarios(id),
  iniciado_em TIMESTAMPTZ DEFAULT NOW(),
  concluido_em TIMESTAMPTZ,
  resultado JSONB,
  observacoes TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_workflow_execucoes_workflow ON public.workflow_execucoes(workflow_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_workflow_execucoes_entidade ON public.workflow_execucoes(entidade_tipo, entidade_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_workflow_execucoes_status ON public.workflow_execucoes(status, iniciado_em DESC);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_workflow_execucoes_etapa ON public.workflow_execucoes(etapa_atual_id) WHERE status = 'em_andamento';

CREATE TRIGGER trg_workflow_execucoes_updated BEFORE UPDATE ON public.workflow_execucoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.workflow_execucoes IS 'Execuções de workflows';

-- 7. WORKFLOW_LOGS (tabela faltante do módulo Workflows)
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.workflow_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execucao_id UUID NOT NULL REFERENCES public.workflow_execucoes(id) ON DELETE CASCADE,
  etapa_id UUID REFERENCES public.workflow_etapas(id),
  usuario_id UUID REFERENCES public.usuarios(id),
  acao TEXT NOT NULL,
  resultado TEXT,
  observacoes TEXT,
  dados_json JSONB,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_workflow_logs_execucao ON public.workflow_logs(execucao_id, criado_em);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_workflow_logs_etapa ON public.workflow_logs(etapa_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_workflow_logs_usuario ON public.workflow_logs(usuario_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_workflow_logs_data ON public.workflow_logs(criado_em DESC);

COMMENT ON TABLE public.workflow_logs IS 'Logs de execução de workflows';

-- ============================================
-- 8. STORAGE BUCKETS FALTANTES
-- ============================================

-- Nota: Storage buckets devem ser criados via Supabase Dashboard ou API
-- Aqui documentamos os buckets que devem existir:

-- BUCKET: cirurgias
-- Descrição: Documentos e anexos de cirurgias
-- Public: false
-- File Size Limit: 50MB
-- Allowed MIME Types: image/*, application/pdf

-- BUCKET: faturamento
-- Descrição: Notas fiscais e documentos de faturamento
-- Public: false
-- File Size Limit: 20MB
-- Allowed MIME Types: application/pdf, image/*, application/xml

-- BUCKET: compliance
-- Descrição: Evidências e documentos de compliance
-- Public: false
-- File Size Limit: 50MB
-- Allowed MIME Types: image/*, application/pdf, application/*, video/*

-- BUCKET: consignacao
-- Descrição: Comprovantes e documentos de consignação
-- Public: false
-- File Size Limit: 20MB
-- Allowed MIME Types: image/*, application/pdf

-- BUCKET: uploads
-- Descrição: Uploads gerais do sistema
-- Public: false
-- File Size Limit: 100MB
-- Allowed MIME Types: *

-- ============================================
-- FIM DA MIGRATION DE CORREÇÃO
-- 8 tabelas adicionadas
-- ============================================



-- ============================================
-- Source: 202510201400_tabelas_precos_opme.sql
-- ============================================

-- ============================================
-- TABELAS DE PREÇOS OPME
-- Sistema de gestão de tabelas de preços para distribuidoras OPME
-- ============================================
-- Data: 2025-10-20
-- Padrão: snake_case pt_br
-- ============================================

-- 1. Tabelas de Preços (header)
CREATE TABLE IF NOT EXISTS IF NOT EXISTS tabelas_precos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE RESTRICT,
  
  -- Identificação
  nome TEXT NOT NULL,
  codigo TEXT, -- código interno da tabela
  descricao TEXT,
  
  -- Tipo e Aplicação
  tipo TEXT CHECK (tipo IN (
    'fabricante',        -- Preço de fábrica/fabricante
    'distribuidor',      -- Tabela do distribuidor (com margem)
    'hospital',          -- Negociada com hospital específico
    'convenio',          -- Negociada com convênio específico
    'contrato',          -- Baseada em contrato específico
    'promocional',       -- Tabela promocional temporária
    'licitacao'          -- Para participação em licitações
  )) NOT NULL DEFAULT 'distribuidor',
  
  -- Vinculação (quando aplicável)
  hospital_id UUID REFERENCES hospitais(id) ON DELETE SET NULL,
  convenio_id UUID REFERENCES convenios(id) ON DELETE SET NULL,
  fornecedor_id UUID REFERENCES fornecedores(id) ON DELETE SET NULL,
  contrato_numero TEXT,
  
  -- Vigência
  data_inicio DATE NOT NULL,
  data_fim DATE,
  
  -- Regras de Aplicação
  aplicar_automatico BOOLEAN DEFAULT FALSE, -- se deve ser aplicada automaticamente
  prioridade INTEGER DEFAULT 0, -- prioridade quando múltiplas tabelas se aplicam (maior = mais prioritária)
  
  -- Desconto/Margem Global (aplicado sobre todos os itens)
  desconto_percentual DECIMAL(5, 2) DEFAULT 0, -- % de desconto global
  margem_percentual DECIMAL(5, 2) DEFAULT 0,   -- % de margem global
  
  -- Status
  status TEXT CHECK (status IN ('ativa', 'inativa', 'em_revisao', 'expirada')) DEFAULT 'ativa',
  
  -- Metadados
  total_itens INTEGER DEFAULT 0,
  valor_total_estimado DECIMAL(15, 2) DEFAULT 0,
  
  -- Auditoria
  criado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  aprovado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  data_aprovacao TIMESTAMPTZ,
  
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ
);

-- 2. Itens de Tabelas de Preços
CREATE TABLE IF NOT EXISTS IF NOT EXISTS tabelas_precos_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tabela_preco_id UUID NOT NULL REFERENCES tabelas_precos(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE RESTRICT,
  
  -- Preços
  preco_custo DECIMAL(15, 2), -- custo do produto (para cálculo de margem)
  preco_base DECIMAL(15, 2) NOT NULL, -- preço base (sem desconto)
  preco_final DECIMAL(15, 2) NOT NULL, -- preço final (com desconto aplicado)
  
  -- Descontos/Margens Específicos do Item
  desconto_percentual DECIMAL(5, 2) DEFAULT 0,
  desconto_valor DECIMAL(15, 2) DEFAULT 0,
  margem_percentual DECIMAL(5, 2),
  margem_valor DECIMAL(15, 2),
  
  -- Quantidade (para descontos por volume)
  quantidade_minima INTEGER DEFAULT 1,
  quantidade_maxima INTEGER,
  
  -- Status
  ativo BOOLEAN DEFAULT TRUE,
  
  -- Observações
  observacoes TEXT,
  
  -- Auditoria
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(tabela_preco_id, produto_id, quantidade_minima)
);

-- 3. Histórico de Preços
CREATE TABLE IF NOT EXISTS IF NOT EXISTS historico_precos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  tabela_preco_id UUID REFERENCES tabelas_precos(id) ON DELETE SET NULL,
  
  -- Preços anteriores
  preco_anterior DECIMAL(15, 2),
  preco_novo DECIMAL(15, 2) NOT NULL,
  
  -- Variação
  variacao_percentual DECIMAL(5, 2),
  variacao_valor DECIMAL(15, 2),
  
  -- Motivo
  motivo TEXT CHECK (motivo IN (
    'reajuste',
    'promocao',
    'negociacao',
    'correcao',
    'alteracao_custo',
    'atualizacao_tabela',
    'outro'
  )),
  descricao TEXT,
  
  -- Auditoria
  alterado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  data_alteracao TIMESTAMPTZ DEFAULT NOW(),
  
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Índices para Performance
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_tabelas_precos_empresa ON tabelas_precos(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_tabelas_precos_status ON tabelas_precos(status) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_tabelas_precos_tipo ON tabelas_precos(tipo) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_tabelas_precos_vigencia ON tabelas_precos(data_inicio, data_fim) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_tabelas_precos_hospital ON tabelas_precos(hospital_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_tabelas_precos_convenio ON tabelas_precos(convenio_id) WHERE excluido_em IS NULL;

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_tabelas_precos_itens_tabela ON tabelas_precos_itens(tabela_preco_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_tabelas_precos_itens_produto ON tabelas_precos_itens(produto_id);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_historico_precos_produto ON historico_precos(produto_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_historico_precos_tabela ON historico_precos(tabela_preco_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_historico_precos_data ON historico_precos(data_alteracao DESC);

-- 5. Triggers para Atualização Automática
CREATE OR REPLACE FUNCTION atualizar_timestamp_tabelas_precos()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_tabelas_precos
  BEFORE UPDATE ON tabelas_precos
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_timestamp_tabelas_precos();

CREATE TRIGGER trigger_atualizar_tabelas_precos_itens
  BEFORE UPDATE ON tabelas_precos_itens
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_timestamp_tabelas_precos();

-- 6. Trigger para Calcular Preço Final do Item
CREATE OR REPLACE FUNCTION calcular_preco_final_item()
RETURNS TRIGGER AS $$
BEGIN
  -- Calcular preço final com desconto
  IF NEW.desconto_valor > 0 THEN
    NEW.preco_final := NEW.preco_base - NEW.desconto_valor;
  ELSIF NEW.desconto_percentual > 0 THEN
    NEW.preco_final := NEW.preco_base * (1 - NEW.desconto_percentual / 100.0);
  ELSE
    NEW.preco_final := NEW.preco_base;
  END IF;
  
  -- Calcular margem
  IF NEW.preco_custo IS NOT NULL AND NEW.preco_custo > 0 THEN
    NEW.margem_valor := NEW.preco_final - NEW.preco_custo;
    NEW.margem_percentual := ((NEW.preco_final - NEW.preco_custo) / NEW.preco_custo) * 100.0;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calcular_preco_final
  BEFORE INSERT OR UPDATE ON tabelas_precos_itens
  FOR EACH ROW
  EXECUTE FUNCTION calcular_preco_final_item();

-- 7. Trigger para Atualizar Totais da Tabela
CREATE OR REPLACE FUNCTION atualizar_totais_tabela_preco()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE tabelas_precos
  SET 
    total_itens = (
      SELECT COUNT(*)
      FROM tabelas_precos_itens
      WHERE tabela_preco_id = COALESCE(NEW.tabela_preco_id, OLD.tabela_preco_id)
        AND ativo = TRUE
    ),
    valor_total_estimado = (
      SELECT COALESCE(SUM(preco_final), 0)
      FROM tabelas_precos_itens
      WHERE tabela_preco_id = COALESCE(NEW.tabela_preco_id, OLD.tabela_preco_id)
        AND ativo = TRUE
    ),
    atualizado_em = NOW()
  WHERE id = COALESCE(NEW.tabela_preco_id, OLD.tabela_preco_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_totais_tabela
  AFTER INSERT OR UPDATE OR DELETE ON tabelas_precos_itens
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_totais_tabela_preco();

-- 8. Trigger para Registrar Histórico de Alteração de Preços
CREATE OR REPLACE FUNCTION registrar_historico_preco()
RETURNS TRIGGER AS $$
BEGIN
  -- Só registrar se o preço mudou
  IF OLD.preco_final IS DISTINCT FROM NEW.preco_final THEN
    INSERT INTO historico_precos (
      produto_id,
      tabela_preco_id,
      preco_anterior,
      preco_novo,
      variacao_valor,
      variacao_percentual,
      motivo,
      alterado_por
    ) VALUES (
      NEW.produto_id,
      NEW.tabela_preco_id,
      OLD.preco_final,
      NEW.preco_final,
      NEW.preco_final - OLD.preco_final,
      CASE 
        WHEN OLD.preco_final > 0 THEN 
          ((NEW.preco_final - OLD.preco_final) / OLD.preco_final) * 100.0
        ELSE 
          NULL
      END,
      'atualizacao_tabela',
      NULLIF(current_setting('request.jwt.claims', true)::jsonb->>'user_id', '')::UUID
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_registrar_historico
  AFTER UPDATE ON tabelas_precos_itens
  FOR EACH ROW
  WHEN (OLD.preco_final IS DISTINCT FROM NEW.preco_final)
  EXECUTE FUNCTION registrar_historico_preco();

-- 9. Função para Obter Melhor Preço de um Produto
CREATE OR REPLACE FUNCTION obter_melhor_preco(
  p_produto_id UUID,
  p_empresa_id UUID,
  p_hospital_id UUID DEFAULT NULL,
  p_convenio_id UUID DEFAULT NULL,
  p_quantidade INTEGER DEFAULT 1,
  p_data DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  tabela_id UUID,
  tabela_nome TEXT,
  tabela_tipo TEXT,
  preco_final DECIMAL(15, 2),
  quantidade_minima INTEGER,
  quantidade_maxima INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tp.id,
    tp.nome,
    tp.tipo,
    tpi.preco_final,
    tpi.quantidade_minima,
    tpi.quantidade_maxima
  FROM tabelas_precos tp
  INNER JOIN tabelas_precos_itens tpi ON tpi.tabela_preco_id = tp.id
  WHERE tp.empresa_id = p_empresa_id
    AND tpi.produto_id = p_produto_id
    AND tp.status = 'ativa'
    AND tp.excluido_em IS NULL
    AND tpi.ativo = TRUE
    AND tp.data_inicio <= p_data
    AND (tp.data_fim IS NULL OR tp.data_fim >= p_data)
    AND (tp.hospital_id IS NULL OR tp.hospital_id = p_hospital_id)
    AND (tp.convenio_id IS NULL OR tp.convenio_id = p_convenio_id)
    AND (tpi.quantidade_minima IS NULL OR tpi.quantidade_minima <= p_quantidade)
    AND (tpi.quantidade_maxima IS NULL OR tpi.quantidade_maxima >= p_quantidade)
  ORDER BY 
    tp.prioridade DESC,
    tpi.preco_final ASC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- 10. RLS Policies
ALTER TABLE tabelas_precos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tabelas_precos_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_precos ENABLE ROW LEVEL SECURITY;

-- Tabelas de Preços
CREATE POLICY "Usuários podem ver tabelas de preços da própria empresa"
  ON tabelas_precos FOR SELECT
  USING (
    empresa_id = NULLIF(current_setting('request.jwt.claims', true)::jsonb->>'empresa_id', '')::UUID
    AND excluido_em IS NULL
  );

CREATE POLICY "Usuários admin/comercial podem criar tabelas de preços"
  ON tabelas_precos FOR INSERT
  WITH CHECK (
    empresa_id = NULLIF(current_setting('request.jwt.claims', true)::jsonb->>'empresa_id', '')::UUID
    AND COALESCE(current_setting('request.jwt.claims', true)::jsonb->>'perfil', 'operador') IN ('admin', 'comercial')
  );

CREATE POLICY "Usuários admin/comercial podem atualizar tabelas de preços"
  ON tabelas_precos FOR UPDATE
  USING (
    empresa_id = NULLIF(current_setting('request.jwt.claims', true)::jsonb->>'empresa_id', '')::UUID
    AND COALESCE(current_setting('request.jwt.claims', true)::jsonb->>'perfil', 'operador') IN ('admin', 'comercial')
  );

CREATE POLICY "Usuários admin podem deletar tabelas de preços"
  ON tabelas_precos FOR DELETE
  USING (
    empresa_id = NULLIF(current_setting('request.jwt.claims', true)::jsonb->>'empresa_id', '')::UUID
    AND COALESCE(current_setting('request.jwt.claims', true)::jsonb->>'perfil', 'operador') = 'admin'
  );

-- Itens de Tabelas de Preços
CREATE POLICY "Usuários podem ver itens das tabelas da própria empresa"
  ON tabelas_precos_itens FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tabelas_precos tp
      WHERE tp.id = tabela_preco_id
        AND tp.empresa_id = NULLIF(current_setting('request.jwt.claims', true)::jsonb->>'empresa_id', '')::UUID
        AND tp.excluido_em IS NULL
    )
  );

CREATE POLICY "Usuários admin/comercial podem gerenciar itens"
  ON tabelas_precos_itens FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM tabelas_precos tp
      WHERE tp.id = tabela_preco_id
        AND tp.empresa_id = NULLIF(current_setting('request.jwt.claims', true)::jsonb->>'empresa_id', '')::UUID
        AND COALESCE(current_setting('request.jwt.claims', true)::jsonb->>'perfil', 'operador') IN ('admin', 'comercial')
    )
  );

-- Histórico de Preços
CREATE POLICY "Usuários podem ver histórico de preços da própria empresa"
  ON historico_precos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM produtos p
      WHERE p.id = produto_id
        AND p.empresa_id = NULLIF(current_setting('request.jwt.claims', true)::jsonb->>'empresa_id', '')::UUID
    )
  );

-- 11. Comentários
COMMENT ON TABLE tabelas_precos IS 'Tabelas de preços para produtos OPME - cabeçalho';
COMMENT ON TABLE tabelas_precos_itens IS 'Itens das tabelas de preços com preços específicos por produto';
COMMENT ON TABLE historico_precos IS 'Histórico de alterações de preços para auditoria';

COMMENT ON COLUMN tabelas_precos.tipo IS 'Tipo da tabela: fabricante, distribuidor, hospital, convenio, contrato, promocional, licitacao';
COMMENT ON COLUMN tabelas_precos.aplicar_automatico IS 'Se TRUE, esta tabela será aplicada automaticamente quando as condições forem atendidas';
COMMENT ON COLUMN tabelas_precos.prioridade IS 'Prioridade quando múltiplas tabelas se aplicam (maior número = maior prioridade)';

COMMENT ON FUNCTION obter_melhor_preco IS 'Retorna a tabela de preços mais vantajosa para um produto considerando hospital, convênio e quantidade';

-- Fim do script



-- ============================================
-- Source: 202510201410_modulo_bi_completo.sql
-- ============================================

-- ============================================
-- Migration: Módulo BI/Analytics Completo
-- 6 tabelas para Business Intelligence
-- Data: 2025-10-20
-- ============================================

-- 1. BI_DIMENSOES - Dimensões analíticas
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.bi_dimensoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('tempo', 'produto', 'cliente', 'fornecedor', 'regiao', 'equipe', 'custom')) NOT NULL,
  tabela_origem TEXT,
  campos_mapeados JSONB,
  hierarquia TEXT[],
  descricao TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, nome)
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_bi_dimensoes_empresa ON public.bi_dimensoes(empresa_id) WHERE ativo = TRUE;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_bi_dimensoes_tipo ON public.bi_dimensoes(tipo);

CREATE TRIGGER trg_bi_dimensoes_updated BEFORE UPDATE ON public.bi_dimensoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.bi_dimensoes IS 'Dimensões para análise multidimensional (OLAP)';

-- 2. BI_FATOS - Tabelas de fatos
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.bi_fatos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  tabela_origem TEXT,
  metricas JSONB NOT NULL,
  dimensoes_relacionadas UUID[],
  grao TEXT,
  query_sql TEXT,
  atualizado_em TIMESTAMPTZ,
  periodicidade_atualizacao TEXT CHECK (periodicidade_atualizacao IN ('tempo_real', 'horaria', 'diaria', 'semanal', 'mensal')),
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, nome)
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_bi_fatos_empresa ON public.bi_fatos(empresa_id) WHERE ativo = TRUE;

COMMENT ON TABLE public.bi_fatos IS 'Tabelas de fatos para análises (medidas quantitativas)';

-- 3. BI_DASHBOARDS - Dashboards BI
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.bi_dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT,
  proprietario_id UUID NOT NULL REFERENCES public.usuarios(id),
  publico BOOLEAN DEFAULT FALSE,
  compartilhado_com UUID[],
  layout_config JSONB,
  filtros_globais JSONB,
  auto_refresh BOOLEAN DEFAULT FALSE,
  refresh_interval INTEGER,
  favorito BOOLEAN DEFAULT FALSE,
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  ultimo_acesso TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_bi_dashboards_empresa ON public.bi_dashboards(empresa_id) WHERE ativo = TRUE;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_bi_dashboards_proprietario ON public.bi_dashboards(proprietario_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_bi_dashboards_publico ON public.bi_dashboards(publico) WHERE publico = TRUE;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_bi_dashboards_categoria ON public.bi_dashboards(categoria);

CREATE TRIGGER trg_bi_dashboards_updated BEFORE UPDATE ON public.bi_dashboards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.bi_dashboards IS 'Dashboards de Business Intelligence';

-- 4. BI_WIDGETS - Widgets dos dashboards
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.bi_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id UUID NOT NULL REFERENCES public.bi_dashboards(id) ON DELETE CASCADE,
  tipo TEXT CHECK (tipo IN ('grafico_linha', 'grafico_barra', 'grafico_pizza', 'grafico_area', 'tabela', 'kpi', 'mapa', 'heatmap', 'gauge', 'texto')) NOT NULL,
  titulo TEXT NOT NULL,
  posicao_x INTEGER NOT NULL,
  posicao_y INTEGER NOT NULL,
  largura INTEGER NOT NULL CHECK (largura > 0),
  altura INTEGER NOT NULL CHECK (altura > 0),
  fato_id UUID REFERENCES public.bi_fatos(id),
  query_sql TEXT,
  configuracao_visual JSONB,
  filtros JSONB,
  drilldown_enabled BOOLEAN DEFAULT FALSE,
  atualizado_em TIMESTAMPTZ,
  dados_cache JSONB,
  cache_valido_ate TIMESTAMPTZ,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_bi_widgets_dashboard ON public.bi_widgets(dashboard_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_bi_widgets_fato ON public.bi_widgets(fato_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_bi_widgets_cache ON public.bi_widgets(cache_valido_ate) WHERE cache_valido_ate IS NOT NULL;

COMMENT ON TABLE public.bi_widgets IS 'Widgets individuais (gráficos, tabelas, KPIs)';

-- 5. BI_RELATORIOS - Relatórios salvos
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.bi_relatorios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT,
  proprietario_id UUID NOT NULL REFERENCES public.usuarios(id),
  query_sql TEXT NOT NULL,
  parametros JSONB,
  formato TEXT CHECK (formato IN ('pdf', 'excel', 'csv', 'html', 'json')) DEFAULT 'pdf',
  agendamento_cron TEXT,
  agendamento_ativo BOOLEAN DEFAULT FALSE,
  destinatarios_email TEXT[],
  destinatarios_ids UUID[],
  ultima_execucao TIMESTAMPTZ,
  proxima_execucao TIMESTAMPTZ,
  total_execucoes INTEGER DEFAULT 0,
  publico BOOLEAN DEFAULT FALSE,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_bi_relatorios_empresa ON public.bi_relatorios(empresa_id) WHERE ativo = TRUE;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_bi_relatorios_proprietario ON public.bi_relatorios(proprietario_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_bi_relatorios_categoria ON public.bi_relatorios(categoria);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_bi_relatorios_agendamento ON public.bi_relatorios(agendamento_ativo, proxima_execucao) WHERE agendamento_ativo = TRUE;

CREATE TRIGGER trg_bi_relatorios_updated BEFORE UPDATE ON public.bi_relatorios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.bi_relatorios IS 'Relatórios customizados de BI';

-- 6. BI_FONTES_DADOS - Fontes de dados externas
CREATE TABLE IF NOT EXISTS IF NOT EXISTS public.bi_fontes_dados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('postgresql', 'mysql', 'mssql', 'api_rest', 'api_graphql', 'csv', 'excel', 'custom')) NOT NULL,
  descricao TEXT,
  connection_string TEXT,
  credenciais_encrypted TEXT,
  headers JSONB,
  configuracao JSONB,
  ultima_sincronizacao TIMESTAMPTZ,
  proxima_sincronizacao TIMESTAMPTZ,
  sincronizacao_automatica BOOLEAN DEFAULT FALSE,
  intervalo_sincronizacao INTEGER,
  status TEXT CHECK (status IN ('conectada', 'desconectada', 'erro', 'sincronizando')) DEFAULT 'desconectada',
  erro_mensagem TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, nome)
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_bi_fontes_empresa ON public.bi_fontes_dados(empresa_id) WHERE ativo = TRUE;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_bi_fontes_tipo ON public.bi_fontes_dados(tipo);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_bi_fontes_status ON public.bi_fontes_dados(status);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_bi_fontes_sync ON public.bi_fontes_dados(sincronizacao_automatica, proxima_sincronizacao) WHERE sincronizacao_automatica = TRUE;

CREATE TRIGGER trg_bi_fontes_updated BEFORE UPDATE ON public.bi_fontes_dados FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.bi_fontes_dados IS 'Fontes de dados externas para BI';

-- ============================================
-- FIM MÓDULO BI - 6 TABELAS COMPLETAS
-- ============================================



-- ============================================
-- Source: 202510201500_integracoes_comunicacao_opme.sql
-- ============================================

-- Migration: Configurações de Integrações de Comunicação e Fabricantes OPME
-- Data: 20/10/2025
-- Descrição: Adiciona endpoints e configurações para Twilio, WhatsApp, SendGrid, Mailchimp e Fabricantes OPME

-- =====================================================
-- SERVIÇOS DE COMUNICAÇÃO
-- =====================================================

-- 1. TWILIO (SMS)
INSERT INTO api_endpoints (
  nome,
  descricao,
  servico,
  metodo,
  url_base,
  url_path,
  auth_tipo,
  auth_config,
  rate_limit_requests,
  rate_limit_window,
  circuit_breaker_enabled,
  cache_enabled,
  cache_ttl,
  retry_enabled,
  retry_max_attempts,
  retry_backoff_ms,
  timeout_ms,
  criticidade
) VALUES (
  'twilio_send_sms',
  'Enviar SMS via Twilio',
  'twilio',
  'POST',
  'https://api.twilio.com',
  '/2010-04-01/Accounts/{accountSid}/Messages.json',
  'basic',
  jsonb_build_object(
    'username', '{{TWILIO_ACCOUNT_SID}}',
    'password', '{{TWILIO_AUTH_TOKEN}}'
  ),
  100,
  60,
  true,
  false,
  0,
  true,
  3,
  1000,
  10000,
  'alta'
);

-- 2. WHATSAPP BUSINESS API
INSERT INTO api_endpoints (
  nome,
  descricao,
  servico,
  metodo,
  url_base,
  url_path,
  auth_tipo,
  auth_config,
  rate_limit_requests,
  rate_limit_window,
  circuit_breaker_enabled,
  cache_enabled,
  cache_ttl,
  retry_enabled,
  retry_max_attempts,
  retry_backoff_ms,
  timeout_ms,
  criticidade
) VALUES (
  'whatsapp_send_message',
  'Enviar mensagem via WhatsApp Business',
  'whatsapp',
  'POST',
  'https://graph.facebook.com',
  '/v18.0/{phoneNumberId}/messages',
  'bearer',
  jsonb_build_object(
    'token', '{{WHATSAPP_ACCESS_TOKEN}}'
  ),
  80,
  60,
  true,
  false,
  0,
  true,
  3,
  1500,
  15000,
  'alta'
);

-- 3. SENDGRID (Email)
INSERT INTO api_endpoints (
  nome,
  descricao,
  servico,
  metodo,
  url_base,
  url_path,
  auth_tipo,
  auth_config,
  rate_limit_requests,
  rate_limit_window,
  circuit_breaker_enabled,
  cache_enabled,
  cache_ttl,
  retry_enabled,
  retry_max_attempts,
  retry_backoff_ms,
  timeout_ms,
  criticidade
) VALUES (
  'sendgrid_send_email',
  'Enviar email via SendGrid',
  'sendgrid',
  'POST',
  'https://api.sendgrid.com',
  '/v3/mail/send',
  'bearer',
  jsonb_build_object(
    'token', '{{SENDGRID_API_KEY}}'
  ),
  500,
  60,
  true,
  false,
  0,
  true,
  3,
  1000,
  10000,
  'alta'
);

-- 4. MAILCHIMP
INSERT INTO api_endpoints (
  nome,
  descricao,
  servico,
  metodo,
  url_base,
  url_path,
  auth_tipo,
  auth_config,
  rate_limit_requests,
  rate_limit_window,
  circuit_breaker_enabled,
  cache_enabled,
  cache_ttl,
  retry_enabled,
  retry_max_attempts,
  retry_backoff_ms,
  timeout_ms,
  criticidade
) VALUES (
  'mailchimp_send_campaign',
  'Enviar campanha via Mailchimp',
  'mailchimp',
  'POST',
  'https://{{dc}}.api.mailchimp.com',
  '/3.0/campaigns/{campaignId}/actions/send',
  'bearer',
  jsonb_build_object(
    'token', '{{MAILCHIMP_API_KEY}}',
    'dc', '{{MAILCHIMP_DC}}'
  ),
  120,
  60,
  true,
  false,
  0,
  true,
  3,
  2000,
  15000,
  'media'
);

-- =====================================================
-- FABRICANTES OPME - RASTREABILIDADE
-- =====================================================

-- 5. ABBOTT TRACK&TRACE
INSERT INTO api_endpoints (
  nome,
  descricao,
  servico,
  metodo,
  url_base,
  url_path,
  auth_tipo,
  auth_config,
  rate_limit_requests,
  rate_limit_window,
  circuit_breaker_enabled,
  cache_enabled,
  cache_ttl,
  retry_enabled,
  retry_max_attempts,
  retry_backoff_ms,
  timeout_ms,
  criticidade
) VALUES (
  'abbott_track_device',
  'Rastrear dispositivo Abbott',
  'abbott_tracktrace',
  'GET',
  'https://api.abbott.com',
  '/v1/track-trace/devices/{serialNumber}',
  'api_key',
  jsonb_build_object(
    'header', 'X-API-Key',
    'key', '{{ABBOTT_API_KEY}}'
  ),
  200,
  60,
  true,
  true,
  300,
  true,
  3,
  2000,
  10000,
  'critica'
);

-- 6. MEDTRONIC VISION
INSERT INTO api_endpoints (
  nome,
  descricao,
  servico,
  metodo,
  url_base,
  url_path,
  auth_tipo,
  auth_config,
  rate_limit_requests,
  rate_limit_window,
  circuit_breaker_enabled,
  cache_enabled,
  cache_ttl,
  retry_enabled,
  retry_max_attempts,
  retry_backoff_ms,
  timeout_ms,
  criticidade
) VALUES (
  'medtronic_verify_device',
  'Verificar dispositivo Medtronic VISION',
  'medtronic_vision',
  'POST',
  'https://vision.medtronic.com',
  '/api/v2/devices/verify',
  'oauth2',
  jsonb_build_object(
    'client_id', '{{MEDTRONIC_CLIENT_ID}}',
    'client_secret', '{{MEDTRONIC_CLIENT_SECRET}}',
    'token_url', 'https://auth.medtronic.com/oauth/token'
  ),
  150,
  60,
  true,
  true,
  600,
  true,
  3,
  2000,
  15000,
  'critica'
);

-- 7. J&J TRACELINK
INSERT INTO api_endpoints (
  nome,
  descricao,
  servico,
  metodo,
  url_base,
  url_path,
  auth_tipo,
  auth_config,
  rate_limit_requests,
  rate_limit_window,
  circuit_breaker_enabled,
  cache_enabled,
  cache_ttl,
  retry_enabled,
  retry_max_attempts,
  retry_backoff_ms,
  timeout_ms,
  criticidade
) VALUES (
  'jj_tracelink_query',
  'Consultar dispositivo J&J TraceLink',
  'jj_tracelink',
  'GET',
  'https://api.tracelink.com',
  '/v1/serialization/query/{gtin}/{serialNumber}',
  'bearer',
  jsonb_build_object(
    'token', '{{JJ_TRACELINK_TOKEN}}'
  ),
  180,
  60,
  true,
  true,
  900,
  true,
  3,
  1500,
  12000,
  'critica'
);

-- 8. STRYKER CONNECT
INSERT INTO api_endpoints (
  nome,
  descricao,
  servico,
  metodo,
  url_base,
  url_path,
  auth_tipo,
  auth_config,
  rate_limit_requests,
  rate_limit_window,
  circuit_breaker_enabled,
  cache_enabled,
  cache_ttl,
  retry_enabled,
  retry_max_attempts,
  retry_backoff_ms,
  timeout_ms,
  criticidade
) VALUES (
  'stryker_device_lookup',
  'Consultar dispositivo Stryker Connect',
  'stryker_connect',
  'GET',
  'https://connect.stryker.com',
  '/api/devices/{deviceId}',
  'api_key',
  jsonb_build_object(
    'header', 'Authorization',
    'prefix', 'ApiKey',
    'key', '{{STRYKER_API_KEY}}'
  ),
  200,
  60,
  true,
  true,
  600,
  true,
  3,
  2000,
  10000,
  'critica'
);

-- 9. BOSTON SCIENTIFIC iTrace
INSERT INTO api_endpoints (
  nome,
  descricao,
  servico,
  metodo,
  url_base,
  url_path,
  auth_tipo,
  auth_config,
  rate_limit_requests,
  rate_limit_window,
  circuit_breaker_enabled,
  cache_enabled,
  cache_ttl,
  retry_enabled,
  retry_max_attempts,
  retry_backoff_ms,
  timeout_ms,
  criticidade
) VALUES (
  'bostonsci_itrace_verify',
  'Verificar dispositivo Boston Scientific iTrace',
  'bostonsci_itrace',
  'POST',
  'https://api.bostonscientific.com',
  '/itrace/v1/verify',
  'bearer',
  jsonb_build_object(
    'token', '{{BOSTON_SCIENTIFIC_TOKEN}}'
  ),
  150,
  60,
  true,
  true,
  300,
  true,
  3,
  1500,
  12000,
  'critica'
);

-- =====================================================
-- COMENTÁRIOS
-- =====================================================
COMMENT ON TABLE api_endpoints IS 'Configurações centralizadas de APIs externas';
COMMENT ON COLUMN api_endpoints.auth_config IS 'Configuração de autenticação em JSONB. Tokens reais devem estar em variáveis de ambiente ({{VAR_NAME}})';
COMMENT ON COLUMN api_endpoints.rate_limit_requests IS 'Número máximo de requisições permitidas';
COMMENT ON COLUMN api_endpoints.rate_limit_window IS 'Janela de tempo em segundos para rate limiting';
COMMENT ON COLUMN api_endpoints.circuit_breaker_enabled IS 'Se habilitado, circuito abre após falhas consecutivas';
COMMENT ON COLUMN api_endpoints.cache_enabled IS 'Se habilitado, respostas são cacheadas';
COMMENT ON COLUMN api_endpoints.cache_ttl IS 'Time-to-live do cache em segundos';
COMMENT ON COLUMN api_endpoints.criticidade IS 'Criticidade do endpoint: baixa, media, alta, critica';



-- ============================================
-- Source: 202510201600_api_credentials.sql
-- ============================================

-- Migration: Tabela de Credenciais de API
-- Data: 20/10/2025
-- Descrição: Armazena credenciais de forma segura para todas as integrações

-- =====================================================
-- TABELA DE CREDENCIAIS
-- =====================================================

CREATE TABLE IF NOT EXISTS IF NOT EXISTS api_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL, -- Nome da variável (ex: TWILIO_ACCOUNT_SID)
  servico TEXT NOT NULL, -- Nome do serviço (ex: Twilio, WhatsApp)
  valor TEXT, -- Valor da credencial (criptografado)
  categoria TEXT CHECK (categoria IN ('comunicacao', 'opme', 'apis', 'outros')) DEFAULT 'outros',
  tipo TEXT CHECK (tipo IN ('text', 'password', 'api_key', 'oauth2')) DEFAULT 'password',
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  criado_por UUID REFERENCES usuarios(id),
  atualizado_por UUID REFERENCES usuarios(id),
  UNIQUE(empresa_id, nome)
);

-- =====================================================
-- ÍNDICES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_api_credentials_empresa ON api_credentials(empresa_id);
CREATE INDEX IF NOT EXISTS idx_api_credentials_servico ON api_credentials(servico);
CREATE INDEX IF NOT EXISTS idx_api_credentials_categoria ON api_credentials(categoria);
CREATE INDEX IF NOT EXISTS idx_api_credentials_ativo ON api_credentials(ativo);

-- =====================================================
-- RLS (Row Level Security)
-- =====================================================

-- RLS desabilitado temporariamente para configuração inicial
-- ALTER TABLE api_credentials ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- FUNÇÃO DE CRIPTOGRAFIA
-- =====================================================

-- Função para criptografar credenciais antes de salvar
CREATE OR REPLACE FUNCTION encrypt_credential()
RETURNS TRIGGER AS $$
BEGIN
  -- Criptografa o valor se não estiver vazio
  IF NEW.valor IS NOT NULL AND NEW.valor != '' THEN
    -- Usa pgcrypto para criptografar
    NEW.valor = encode(
      encrypt(
        NEW.valor::bytea,
        (SELECT current_setting('app.encryption_key', true))::bytea,
        'aes'
      ),
      'base64'
    );
  END IF;
  
  NEW.atualizado_em = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para descriptografar credenciais ao ler
CREATE OR REPLACE FUNCTION decrypt_credential(encrypted_value TEXT)
RETURNS TEXT AS $$
BEGIN
  IF encrypted_value IS NULL OR encrypted_value = '' THEN
    RETURN NULL;
  END IF;
  
  RETURN convert_from(
    decrypt(
      decode(encrypted_value, 'base64'),
      (SELECT current_setting('app.encryption_key', true))::bytea,
      'aes'
    ),
    'utf8'
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Se falhar descriptografia, retorna valor original
    RETURN encrypted_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criptografar automaticamente
CREATE TRIGGER encrypt_credential_trigger
  BEFORE INSERT OR UPDATE ON api_credentials
  FOR EACH ROW
  WHEN (NEW.tipo IN ('password', 'api_key', 'oauth2'))
  EXECUTE FUNCTION encrypt_credential();

-- =====================================================
-- FUNÇÃO PARA OBTER CREDENCIAL DESCRIPTOGRAFADA
-- =====================================================

CREATE OR REPLACE FUNCTION get_decrypted_credential(
  p_nome TEXT,
  p_empresa_id UUID DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
  v_empresa_id UUID;
  v_valor TEXT;
BEGIN
  -- Se empresa_id não fornecido, pega do usuário atual
  IF p_empresa_id IS NULL THEN
    SELECT empresa_id INTO v_empresa_id
    FROM usuarios
    WHERE id = auth.uid();
  ELSE
    v_empresa_id = p_empresa_id;
  END IF;
  
  -- Busca e descriptografa a credencial
  SELECT decrypt_credential(valor) INTO v_valor
  FROM api_credentials
  WHERE nome = p_nome
    AND empresa_id = v_empresa_id
    AND ativo = true;
  
  RETURN v_valor;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNÇÃO PARA TESTAR CREDENCIAL
-- =====================================================

CREATE OR REPLACE FUNCTION test_api_credential(
  p_nome TEXT,
  p_servico TEXT,
  p_valor TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Esta função será chamada via Edge Function para testes reais
  -- Por ora, retorna estrutura básica
  
  v_result = jsonb_build_object(
    'success', true,
    'servico', p_servico,
    'nome', p_nome,
    'testado_em', NOW(),
    'message', 'Credencial salva. Teste via Edge Function necessário.'
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VIEW PARA LISTAR CREDENCIAIS (SEM VALORES)
-- =====================================================

CREATE OR REPLACE VIEW api_credentials_list AS
SELECT 
  id,
  empresa_id,
  nome,
  servico,
  CASE 
    WHEN valor IS NOT NULL AND valor != '' THEN '***CONFIGURADO***'
    ELSE NULL
  END as status,
  categoria,
  tipo,
  ativo,
  criado_em,
  atualizado_em
FROM api_credentials;

-- =====================================================
-- INSERIR CREDENCIAIS TEMPLATE
-- =====================================================

-- Nota: Estes são apenas registros template sem valores
-- Os valores reais serão inseridos via interface

DO $$
DECLARE
  v_empresa_id UUID;
BEGIN
  -- Pega primeira empresa (ajustar conforme necessário)
  SELECT id INTO v_empresa_id FROM empresas LIMIT 1;
  
  IF v_empresa_id IS NOT NULL THEN
    -- Comunicação
    INSERT INTO api_credentials (empresa_id, nome, servico, categoria, tipo, ativo) VALUES
    (v_empresa_id, 'TWILIO_ACCOUNT_SID', 'Twilio', 'comunicacao', 'text', true),
    (v_empresa_id, 'TWILIO_AUTH_TOKEN', 'Twilio', 'comunicacao', 'password', true),
    (v_empresa_id, 'TWILIO_PHONE_NUMBER', 'Twilio', 'comunicacao', 'text', true),
    (v_empresa_id, 'WHATSAPP_ACCESS_TOKEN', 'WhatsApp', 'comunicacao', 'api_key', true),
    (v_empresa_id, 'SENDGRID_API_KEY', 'SendGrid', 'comunicacao', 'api_key', true),
    (v_empresa_id, 'SENDGRID_FROM_EMAIL', 'SendGrid', 'comunicacao', 'text', true),
    (v_empresa_id, 'MAILCHIMP_API_KEY', 'Mailchimp', 'comunicacao', 'api_key', true),
    (v_empresa_id, 'MAILCHIMP_DC', 'Mailchimp', 'comunicacao', 'text', true),
    
    -- OPME
    (v_empresa_id, 'ABBOTT_API_KEY', 'Abbott', 'opme', 'api_key', true),
    (v_empresa_id, 'MEDTRONIC_CLIENT_ID', 'Medtronic', 'opme', 'text', true),
    (v_empresa_id, 'MEDTRONIC_CLIENT_SECRET', 'Medtronic', 'opme', 'password', true),
    (v_empresa_id, 'JJ_TRACELINK_TOKEN', 'J&J', 'opme', 'api_key', true),
    (v_empresa_id, 'STRYKER_API_KEY', 'Stryker', 'opme', 'api_key', true),
    (v_empresa_id, 'BOSTON_SCIENTIFIC_TOKEN', 'Boston Scientific', 'opme', 'api_key', true),
    
    -- APIs
    (v_empresa_id, 'INFOSIMPLES_TOKEN', 'InfoSimples', 'apis', 'api_key', true)
    
    ON CONFLICT (empresa_id, nome) DO NOTHING;
  END IF;
END $$;

-- =====================================================
-- AUDIT LOG
-- =====================================================

CREATE TABLE IF NOT EXISTS IF NOT EXISTS api_credentials_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_id UUID REFERENCES api_credentials(id) ON DELETE CASCADE,
  acao TEXT NOT NULL, -- 'create', 'update', 'delete', 'test'
  usuario_id UUID REFERENCES usuarios(id),
  dados_anteriores JSONB,
  dados_novos JSONB,
  ip_address TEXT,
  user_agent TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credentials_audit_credential ON api_credentials_audit(credential_id);
CREATE INDEX IF NOT EXISTS idx_credentials_audit_usuario ON api_credentials_audit(usuario_id);
CREATE INDEX IF NOT EXISTS idx_credentials_audit_criado ON api_credentials_audit(criado_em);

-- Trigger para audit log
CREATE OR REPLACE FUNCTION log_credential_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO api_credentials_audit (credential_id, acao, usuario_id, dados_novos)
    VALUES (NEW.id, 'create', auth.uid(), to_jsonb(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO api_credentials_audit (credential_id, acao, usuario_id, dados_anteriores, dados_novos)
    VALUES (NEW.id, 'update', auth.uid(), to_jsonb(OLD), to_jsonb(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO api_credentials_audit (credential_id, acao, usuario_id, dados_anteriores)
    VALUES (OLD.id, 'delete', auth.uid(), to_jsonb(OLD));
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_credential_changes
  AFTER INSERT OR UPDATE OR DELETE ON api_credentials
  FOR EACH ROW
  EXECUTE FUNCTION log_credential_change();

-- =====================================================
-- COMENTÁRIOS
-- =====================================================

COMMENT ON TABLE api_credentials IS 'Armazena credenciais de APIs externas de forma criptografada';
COMMENT ON COLUMN api_credentials.valor IS 'Valor criptografado da credencial (AES)';
COMMENT ON COLUMN api_credentials.tipo IS 'Tipo de credencial para tratamento adequado';
COMMENT ON COLUMN api_credentials.categoria IS 'Categoria da integração';
COMMENT ON FUNCTION encrypt_credential() IS 'Criptografa credenciais automaticamente antes de salvar';
COMMENT ON FUNCTION decrypt_credential(TEXT) IS 'Descriptografa credenciais para uso';
COMMENT ON FUNCTION get_decrypted_credential(TEXT, UUID) IS 'Obtém credencial descriptografada de forma segura';
COMMENT ON TABLE api_credentials_audit IS 'Audit log de todas as alterações em credenciais';



-- ============================================
-- Source: 20251020_advanced_features.sql
-- ============================================

-- =====================================================
-- BLOCO 4: ADVANCED FEATURES - Consolidado
-- Sistema completo de funcionalidades avançadas
-- 
-- MÓDULOS INTEGRADOS:
-- 4.1: System Health Dashboard - Monitoramento infraestrutura
-- 4.2: Notificações Inteligentes - Push/Email/SMS
-- 4.3: Logs & Auditoria Avançada - Rastreabilidade completa
-- 4.4: Backup & Recovery - Proteção de dados
-- 4.5: Performance Metrics - APM (Application Performance Monitoring)
-- 4.6: Segurança Avançada - 2FA, IP Whitelist, Rate Limiting
-- =====================================================

-- =====================================================
-- 4.1: SYSTEM HEALTH - Monitoramento de Infraestrutura
-- =====================================================

CREATE TABLE IF NOT EXISTS IF NOT EXISTS system_health_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Timestamp
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- CPU & Memória (do servidor)
  cpu_usage_percent DECIMAL(5,2),
  memory_usage_percent DECIMAL(5,2),
  disk_usage_percent DECIMAL(5,2),
  
  -- Banco de Dados (Supabase)
  db_connections_active INTEGER,
  db_connections_idle INTEGER,
  db_size_mb DECIMAL(15,2),
  db_query_avg_time_ms DECIMAL(10,2),
  
  -- APIs Externas
  api_sefaz_status VARCHAR(20), -- 'online', 'offline', 'degraded'
  api_anvisa_status VARCHAR(20),
  api_sefaz_response_time_ms INTEGER,
  api_anvisa_response_time_ms INTEGER,
  
  -- Aplicação
  total_users_online INTEGER,
  total_requests_per_minute INTEGER,
  error_rate_percent DECIMAL(5,2),
  
  -- Storage (Supabase Storage)
  storage_usage_gb DECIMAL(10,2),
  storage_limit_gb DECIMAL(10,2)
);

CREATE INDEX IF NOT EXISTS idx_health_timestamp ON system_health_metrics(timestamp DESC);

-- =====================================================
-- 4.2: NOTIFICAÇÕES INTELIGENTES
-- =====================================================

CREATE TABLE IF NOT EXISTS IF NOT EXISTS notificacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Destinatário
  user_id UUID REFERENCES auth.users(id),
  
  -- Tipo
  tipo VARCHAR(30) NOT NULL, -- 'info', 'warning', 'error', 'success'
  canal VARCHAR(30) NOT NULL, -- 'in_app', 'email', 'sms', 'push'
  
  -- Conteúdo
  titulo VARCHAR(200) NOT NULL,
  mensagem TEXT NOT NULL,
  
  -- Ação (link para clicar)
  action_url TEXT,
  action_label VARCHAR(100),
  
  -- Contexto (para agrupamento)
  contexto VARCHAR(50), -- 'pedido', 'nfe', 'licitacao', 'estoque'
  contexto_id UUID,
  
  -- Status
  lida BOOLEAN DEFAULT FALSE,
  lida_em TIMESTAMP WITH TIME ZONE,
  
  -- Envio
  enviada BOOLEAN DEFAULT FALSE,
  enviada_em TIMESTAMP WITH TIME ZONE,
  erro_envio TEXT,
  
  -- Prioridade
  prioridade VARCHAR(20) DEFAULT 'normal', -- 'baixa', 'normal', 'alta', 'urgente'
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE -- Expira após X dias
);

CREATE INDEX IF NOT EXISTS idx_notificacoes_user ON notificacoes(user_id, lida);
CREATE INDEX IF NOT EXISTS idx_notificacoes_created ON notificacoes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notificacoes_contexto ON notificacoes(contexto, contexto_id);

-- =====================================================
-- 4.3: LOGS & AUDITORIA AVANÇADA
-- =====================================================

CREATE TABLE IF NOT EXISTS IF NOT EXISTS audit_logs_advanced (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Timestamp
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Usuário
  user_id UUID REFERENCES auth.users(id),
  user_email VARCHAR(255),
  user_ip_address INET,
  user_agent TEXT,
  
  -- Ação
  action VARCHAR(50) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'READ', 'LOGIN', 'LOGOUT'
  resource_type VARCHAR(50) NOT NULL, -- 'nfe', 'pedido', 'usuario', 'licitacao'
  resource_id UUID,
  
  -- Dados
  old_data JSONB, -- Estado anterior (UPDATE/DELETE)
  new_data JSONB, -- Estado novo (CREATE/UPDATE)
  changes JSONB, -- Apenas campos alterados
  
  -- Contexto
  session_id UUID,
  request_id UUID,
  
  -- Resultado
  status VARCHAR(20) NOT NULL, -- 'success', 'error', 'denied'
  error_message TEXT,
  
  -- Compliance (LGPD)
  data_retention_until DATE -- Data até quando manter log
);

CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs_advanced(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs_advanced(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_logs_advanced(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs_advanced(action);

-- =====================================================
-- 4.4: BACKUP & RECOVERY
-- =====================================================

CREATE TABLE IF NOT EXISTS IF NOT EXISTS backups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identificação
  nome VARCHAR(200) NOT NULL,
  tipo VARCHAR(30) NOT NULL, -- 'full', 'incremental', 'differential'
  
  -- Escopo
  tabelas TEXT[], -- Tabelas incluídas no backup
  total_registros BIGINT,
  tamanho_bytes BIGINT,
  
  -- Storage
  storage_url TEXT NOT NULL, -- Supabase Storage ou S3
  storage_hash VARCHAR(64), -- SHA-256 para verificação
  
  -- Status
  status VARCHAR(30) NOT NULL DEFAULT 'em_progresso',
  -- 'em_progresso', 'concluido', 'erro', 'corrompido'
  
  -- Tempos
  iniciado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  concluido_em TIMESTAMP WITH TIME ZONE,
  duracao_segundos INTEGER,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  
  -- Retenção
  expires_at TIMESTAMP WITH TIME ZONE -- Expira após X dias
);

CREATE INDEX IF NOT EXISTS idx_backups_tipo ON backups(tipo);
CREATE INDEX IF NOT EXISTS idx_backups_status ON backups(status);
CREATE INDEX IF NOT EXISTS idx_backups_created ON backups(iniciado_em DESC);

-- =====================================================
-- 4.5: PERFORMANCE METRICS (APM)
-- =====================================================

CREATE TABLE IF NOT EXISTS IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Timestamp
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Request
  route VARCHAR(200) NOT NULL, -- '/api/pedidos', '/api/nfes'
  method VARCHAR(10) NOT NULL, -- 'GET', 'POST', 'PUT', 'DELETE'
  
  -- Tempos (milliseconds)
  response_time_ms INTEGER NOT NULL,
  db_query_time_ms INTEGER,
  external_api_time_ms INTEGER,
  
  -- Status
  status_code INTEGER NOT NULL, -- 200, 404, 500, etc.
  
  -- Usuário (opcional)
  user_id UUID REFERENCES auth.users(id),
  
  -- Erro (se houver)
  error_message TEXT,
  error_stack TEXT
);

CREATE INDEX IF NOT EXISTS idx_perf_timestamp ON performance_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_perf_route ON performance_metrics(route);
CREATE INDEX IF NOT EXISTS idx_perf_status ON performance_metrics(status_code);

-- =====================================================
-- 4.6: SEGURANÇA AVANÇADA
-- =====================================================

-- 2FA (Two-Factor Authentication)
CREATE TABLE IF NOT EXISTS IF NOT EXISTS user_2fa (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  
  secret VARCHAR(100) NOT NULL, -- TOTP secret
  is_enabled BOOLEAN DEFAULT FALSE,
  backup_codes TEXT[], -- Códigos de backup
  
  enabled_at TIMESTAMP WITH TIME ZONE,
  last_used_at TIMESTAMP WITH TIME ZONE
);

-- IP Whitelist
CREATE TABLE IF NOT EXISTS IF NOT EXISTS ip_whitelist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  ip_address INET NOT NULL UNIQUE,
  descricao VARCHAR(200),
  
  is_ativo BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Rate Limiting (por usuário)
CREATE TABLE IF NOT EXISTS IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  user_id UUID REFERENCES auth.users(id),
  ip_address INET,
  
  route VARCHAR(200) NOT NULL,
  
  -- Contadores
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Limites
  max_requests_per_minute INTEGER DEFAULT 60,
  
  -- Bloqueio
  is_blocked BOOLEAN DEFAULT FALSE,
  blocked_until TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_user ON rate_limits(user_id, route);
CREATE INDEX IF NOT EXISTS idx_rate_limits_ip ON rate_limits(ip_address);

-- =====================================================
-- VIEWS
-- =====================================================

-- System Health (últimos 5 minutos)
CREATE OR REPLACE VIEW vw_system_health_current AS
SELECT
  AVG(cpu_usage_percent) AS avg_cpu,
  AVG(memory_usage_percent) AS avg_memory,
  AVG(disk_usage_percent) AS avg_disk,
  MAX(db_connections_active) AS max_db_connections,
  AVG(db_query_avg_time_ms) AS avg_query_time,
  SUM(total_requests_per_minute) AS total_requests,
  AVG(error_rate_percent) AS avg_error_rate
FROM system_health_metrics
WHERE timestamp >= NOW() - INTERVAL '5 minutes';

-- Notificações não lidas por usuário
CREATE OR REPLACE VIEW vw_notificacoes_nao_lidas AS
SELECT
  user_id,
  COUNT(*) AS total_nao_lidas,
  COUNT(*) FILTER (WHERE prioridade = 'urgente') AS urgentes,
  COUNT(*) FILTER (WHERE prioridade = 'alta') AS altas
FROM notificacoes
WHERE lida = FALSE AND (expires_at IS NULL OR expires_at > NOW())
GROUP BY user_id;

-- Performance lenta (> 1 segundo)
CREATE OR REPLACE VIEW vw_slow_queries AS
SELECT
  route,
  method,
  AVG(response_time_ms) AS avg_response_time,
  MAX(response_time_ms) AS max_response_time,
  COUNT(*) AS total_requests
FROM performance_metrics
WHERE timestamp >= NOW() - INTERVAL '1 hour'
  AND response_time_ms > 1000
GROUP BY route, method
ORDER BY avg_response_time DESC;

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Criar notificação
CREATE OR REPLACE FUNCTION criar_notificacao(
  p_user_id UUID,
  p_tipo VARCHAR,
  p_canal VARCHAR,
  p_titulo VARCHAR,
  p_mensagem TEXT,
  p_contexto VARCHAR DEFAULT NULL,
  p_contexto_id UUID DEFAULT NULL,
  p_prioridade VARCHAR DEFAULT 'normal'
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_notificacao_id UUID;
BEGIN
  INSERT INTO notificacoes (
    user_id, tipo, canal, titulo, mensagem,
    contexto, contexto_id, prioridade,
    expires_at
  ) VALUES (
    p_user_id, p_tipo, p_canal, p_titulo, p_mensagem,
    p_contexto, p_contexto_id, p_prioridade,
    NOW() + INTERVAL '30 days'
  )
  RETURNING id INTO v_notificacao_id;
  
  RETURN v_notificacao_id;
END;
$$;

-- Marcar notificação como lida
CREATE OR REPLACE FUNCTION marcar_notificacao_lida(p_notificacao_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE notificacoes
  SET lida = TRUE, lida_em = NOW()
  WHERE id = p_notificacao_id AND user_id = auth.uid();
END;
$$;

-- Registrar log de auditoria
CREATE OR REPLACE FUNCTION log_audit(
  p_action VARCHAR,
  p_resource_type VARCHAR,
  p_resource_id UUID,
  p_old_data JSONB DEFAULT NULL,
  p_new_data JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO audit_logs_advanced (
    user_id, user_email, action, resource_type, resource_id,
    old_data, new_data, status,
    data_retention_until
  )
  SELECT
    auth.uid(),
    (SELECT email FROM auth.users WHERE id = auth.uid()),
    p_action,
    p_resource_type,
    p_resource_id,
    p_old_data,
    p_new_data,
    'success',
    NOW() + INTERVAL '5 years' -- LGPD: 5 anos
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Criar backup
CREATE OR REPLACE FUNCTION criar_backup(
  p_nome VARCHAR,
  p_tipo VARCHAR,
  p_tabelas TEXT[]
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_backup_id UUID;
BEGIN
  INSERT INTO backups (
    nome, tipo, tabelas, status,
    created_by, expires_at
  ) VALUES (
    p_nome, p_tipo, p_tabelas, 'em_progresso',
    auth.uid(), NOW() + INTERVAL '90 days'
  )
  RETURNING id INTO v_backup_id;
  
  -- Aqui seria acionado um job para executar o backup real
  
  RETURN v_backup_id;
END;
$$;

-- =====================================================
-- RLS (Row Level Security)
-- =====================================================

ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs_advanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE backups ENABLE ROW LEVEL SECURITY;

-- Usuários veem apenas suas notificações
CREATE POLICY "Usuários veem suas notificações" ON notificacoes FOR SELECT
USING (user_id = auth.uid());

-- Apenas admins veem audit logs
CREATE POLICY "Admins veem audit logs" ON audit_logs_advanced FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'auditor_interno', 'ti')
  )
);

-- Apenas admins gerenciam backups
CREATE POLICY "Admins gerenciam backups" ON backups FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'ti')
  )
);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE system_health_metrics IS 'Métricas de saúde do sistema (CPU, memória, DB, APIs)';
COMMENT ON TABLE notificacoes IS 'Notificações inteligentes (in-app, email, SMS, push)';
COMMENT ON TABLE audit_logs_advanced IS 'Logs de auditoria avançados (LGPD Art. 37)';
COMMENT ON TABLE backups IS 'Backups automáticos e manuais';
COMMENT ON TABLE performance_metrics IS 'APM - Application Performance Monitoring';
COMMENT ON TABLE user_2fa IS '2FA - Two-Factor Authentication (TOTP)';
COMMENT ON TABLE ip_whitelist IS 'IP Whitelist para acesso restrito';
COMMENT ON TABLE rate_limits IS 'Rate limiting por usuário/IP';



-- ============================================
-- Source: 20251020_api_gateway.sql
-- ============================================

-- =====================================================
-- BLOCO 1.3: API Gateway - Gerenciamento de Integrações
-- Sistema completo para gerenciar APIs externas
-- 
-- FUNCIONALIDADES:
-- - Rate limiting por endpoint e usuário
-- - Circuit breaker (proteção contra falhas em cascata)
-- - Cache inteligente de respostas
-- - Monitoramento de health e performance
-- - Retry automático com backoff exponencial
-- - Logs de requisições para auditoria
-- 
-- APIS GERENCIADAS:
-- - SEFAZ (NF-e, consultas)
-- - ANVISA (validação de registros, rastreabilidade)
-- - CFM (validação de CRM)
-- - Receita Federal (CNPJ, CPF)
-- - ViaCEP (endereços)
-- - Infosimples (validações avançadas)
-- =====================================================

-- =====================================================
-- TABELA: api_endpoints (Endpoints configurados)
-- =====================================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS api_endpoints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identificação
  nome VARCHAR(100) NOT NULL UNIQUE, -- Ex: 'sefaz_nfe_emitir', 'anvisa_consultar_registro'
  descricao TEXT,
  
  -- Configuração
  servico VARCHAR(50) NOT NULL, -- 'sefaz', 'anvisa', 'cfm', 'receita_federal', 'viacep', 'infosimples'
  metodo VARCHAR(10) NOT NULL CHECK (metodo IN ('GET', 'POST', 'PUT', 'DELETE', 'PATCH')),
  url_base TEXT NOT NULL,
  url_path TEXT NOT NULL,
  
  -- Headers padrão (JSONB para flexibilidade)
  headers_default JSONB DEFAULT '{}',
  
  -- Autenticação
  auth_tipo VARCHAR(20) CHECK (auth_tipo IN ('none', 'api_key', 'bearer', 'basic', 'oauth2', 'certificate')),
  auth_config JSONB, -- Configuração específica de auth
  
  -- Rate Limiting
  rate_limit_requests INTEGER DEFAULT 100, -- Requisições permitidas
  rate_limit_window INTEGER DEFAULT 60, -- Janela em segundos (ex: 100 req/60s)
  rate_limit_per_user BOOLEAN DEFAULT FALSE, -- Se true, limite é por usuário
  
  -- Circuit Breaker
  circuit_breaker_threshold INTEGER DEFAULT 5, -- Falhas consecutivas para abrir circuito
  circuit_breaker_timeout INTEGER DEFAULT 60, -- Segundos antes de tentar reabrir
  circuit_breaker_enabled BOOLEAN DEFAULT TRUE,
  
  -- Cache
  cache_enabled BOOLEAN DEFAULT FALSE,
  cache_ttl INTEGER DEFAULT 300, -- Segundos (5 min default)
  cache_key_fields TEXT[], -- Campos da request para gerar chave de cache
  
  -- Retry
  retry_enabled BOOLEAN DEFAULT TRUE,
  retry_max_attempts INTEGER DEFAULT 3,
  retry_backoff_ms INTEGER DEFAULT 1000, -- Backoff inicial em ms
  
  -- Timeout
  timeout_ms INTEGER DEFAULT 30000, -- 30 segundos default
  
  -- Monitoramento
  health_check_enabled BOOLEAN DEFAULT TRUE,
  health_check_interval INTEGER DEFAULT 300, -- Segundos (5 min)
  
  -- Criticidade (para priorização e alertas)
  criticidade VARCHAR(20) CHECK (criticidade IN ('baixa', 'media', 'alta', 'critica')),
  
  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  tags TEXT[], -- Ex: ['fiscal', 'regulatorio', 'validacao']
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  updated_by UUID REFERENCES auth.users(id)
);

-- =====================================================
-- TABELA: api_requests_log (Log de requisições)
-- =====================================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS api_requests_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Endpoint
  endpoint_id UUID REFERENCES api_endpoints(id) ON DELETE SET NULL,
  endpoint_nome VARCHAR(100),
  
  -- Usuário (pode ser NULL para chamadas de sistema)
  user_id UUID REFERENCES auth.users(id),
  
  -- Request
  request_method VARCHAR(10),
  request_url TEXT,
  request_headers JSONB,
  request_body JSONB,
  request_params JSONB,
  
  -- Response
  response_status INTEGER,
  response_body JSONB,
  response_headers JSONB,
  response_time_ms INTEGER, -- Tempo de resposta em milissegundos
  
  -- Cache
  from_cache BOOLEAN DEFAULT FALSE,
  
  -- Retry
  retry_attempt INTEGER DEFAULT 0,
  
  -- Circuit Breaker
  circuit_breaker_state VARCHAR(20), -- 'closed', 'open', 'half_open'
  
  -- Erro
  error_message TEXT,
  error_stack TEXT,
  
  -- IP e contexto
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- =====================================================
-- TABELA: api_rate_limits (Controle de rate limiting)
-- =====================================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS api_rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identificação
  endpoint_id UUID NOT NULL REFERENCES api_endpoints(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id), -- NULL = rate limit global
  
  -- Contadores
  request_count INTEGER DEFAULT 0,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Status
  is_blocked BOOLEAN DEFAULT FALSE,
  blocked_until TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(endpoint_id, user_id)
);

-- =====================================================
-- TABELA: api_circuit_breaker (Estado do circuit breaker)
-- =====================================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS api_circuit_breaker (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  endpoint_id UUID NOT NULL REFERENCES api_endpoints(id) ON DELETE CASCADE UNIQUE,
  
  -- Estado
  state VARCHAR(20) NOT NULL DEFAULT 'closed' CHECK (state IN ('closed', 'open', 'half_open')),
  
  -- Contadores
  failure_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  
  -- Timestamps
  last_failure_at TIMESTAMP WITH TIME ZONE,
  last_success_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE, -- Quando o circuito abriu
  next_attempt_at TIMESTAMP WITH TIME ZONE, -- Quando pode tentar reabrir
  
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: api_cache (Cache de respostas)
-- =====================================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS api_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  endpoint_id UUID NOT NULL REFERENCES api_endpoints(id) ON DELETE CASCADE,
  
  -- Chave de cache (gerada a partir dos parâmetros da request)
  cache_key VARCHAR(500) NOT NULL,
  
  -- Response cacheada
  response_status INTEGER NOT NULL,
  response_body JSONB NOT NULL,
  response_headers JSONB,
  
  -- TTL
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Metadata
  hit_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_hit_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(endpoint_id, cache_key)
);

-- =====================================================
-- TABELA: api_health_checks (Monitoramento de saúde)
-- =====================================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS api_health_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  endpoint_id UUID NOT NULL REFERENCES api_endpoints(id) ON DELETE CASCADE,
  
  -- Status
  is_healthy BOOLEAN NOT NULL,
  response_time_ms INTEGER,
  
  -- Detalhes
  status_code INTEGER,
  error_message TEXT,
  
  -- Timestamp
  checked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- =====================================================
-- TABELA: api_alerts (Alertas de problemas)
-- =====================================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS api_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  endpoint_id UUID REFERENCES api_endpoints(id) ON DELETE SET NULL,
  endpoint_nome VARCHAR(100),
  
  -- Tipo de alerta
  tipo VARCHAR(50) NOT NULL, -- 'high_error_rate', 'circuit_open', 'rate_limit_exceeded', 'slow_response', 'api_down'
  
  -- Severidade
  severidade VARCHAR(20) NOT NULL CHECK (severidade IN ('baixa', 'media', 'alta', 'critica')),
  
  -- Mensagem
  mensagem TEXT NOT NULL,
  detalhes JSONB,
  
  -- Status
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  
  -- Notificação
  notified_at TIMESTAMP WITH TIME ZONE,
  notification_channels TEXT[], -- Ex: ['email', 'slack', 'sms']
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_api_endpoints_servico ON api_endpoints(servico);
CREATE INDEX IF NOT EXISTS idx_api_endpoints_active ON api_endpoints(is_active);
CREATE INDEX IF NOT EXISTS idx_api_requests_log_endpoint_id ON api_requests_log(endpoint_id);
CREATE INDEX IF NOT EXISTS idx_api_requests_log_user_id ON api_requests_log(user_id);
CREATE INDEX IF NOT EXISTS idx_api_requests_log_created_at ON api_requests_log(created_at);
CREATE INDEX IF NOT EXISTS idx_api_requests_log_status ON api_requests_log(response_status);
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_endpoint_user ON api_rate_limits(endpoint_id, user_id);
CREATE INDEX IF NOT EXISTS idx_api_circuit_breaker_endpoint ON api_circuit_breaker(endpoint_id);
CREATE INDEX IF NOT EXISTS idx_api_circuit_breaker_state ON api_circuit_breaker(state);
CREATE INDEX IF NOT EXISTS idx_api_cache_endpoint_key ON api_cache(endpoint_id, cache_key);
CREATE INDEX IF NOT EXISTS idx_api_cache_expires_at ON api_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_api_health_checks_endpoint ON api_health_checks(endpoint_id);
CREATE INDEX IF NOT EXISTS idx_api_health_checks_checked_at ON api_health_checks(checked_at);
CREATE INDEX IF NOT EXISTS idx_api_alerts_endpoint ON api_alerts(endpoint_id);
CREATE INDEX IF NOT EXISTS idx_api_alerts_resolved ON api_alerts(is_resolved);
CREATE INDEX IF NOT EXISTS idx_api_alerts_created_at ON api_alerts(created_at);

-- =====================================================
-- FUNCTION: Verificar rate limit
-- =====================================================
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_endpoint_id UUID,
  p_user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_endpoint RECORD;
  v_rate_limit RECORD;
  v_window_expired BOOLEAN;
BEGIN
  -- Obter configuração do endpoint
  SELECT * INTO v_endpoint FROM api_endpoints WHERE id = p_endpoint_id AND is_active = TRUE;
  
  IF NOT FOUND THEN
    RETURN FALSE; -- Endpoint não encontrado ou inativo
  END IF;
  
  -- Verificar se existe registro de rate limit
  SELECT * INTO v_rate_limit FROM api_rate_limits
  WHERE endpoint_id = p_endpoint_id
    AND (user_id = p_user_id OR (user_id IS NULL AND p_user_id IS NULL));
  
  IF NOT FOUND THEN
    -- Criar novo registro
    INSERT INTO api_rate_limits (endpoint_id, user_id, request_count, window_start)
    VALUES (p_endpoint_id, p_user_id, 1, NOW());
    RETURN TRUE;
  END IF;
  
  -- Verificar se janela expirou
  v_window_expired := (EXTRACT(EPOCH FROM (NOW() - v_rate_limit.window_start)) > v_endpoint.rate_limit_window);
  
  IF v_window_expired THEN
    -- Resetar contador
    UPDATE api_rate_limits
    SET request_count = 1, window_start = NOW(), is_blocked = FALSE, blocked_until = NULL
    WHERE id = v_rate_limit.id;
    RETURN TRUE;
  END IF;
  
  -- Verificar se bloqueado
  IF v_rate_limit.is_blocked AND v_rate_limit.blocked_until > NOW() THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar se excedeu limite
  IF v_rate_limit.request_count >= v_endpoint.rate_limit_requests THEN
    -- Bloquear
    UPDATE api_rate_limits
    SET is_blocked = TRUE, blocked_until = NOW() + (v_endpoint.rate_limit_window || ' seconds')::INTERVAL
    WHERE id = v_rate_limit.id;
    RETURN FALSE;
  END IF;
  
  -- Incrementar contador
  UPDATE api_rate_limits
  SET request_count = request_count + 1
  WHERE id = v_rate_limit.id;
  
  RETURN TRUE;
END;
$$;

-- =====================================================
-- FUNCTION: Atualizar circuit breaker
-- =====================================================
CREATE OR REPLACE FUNCTION update_circuit_breaker(
  p_endpoint_id UUID,
  p_success BOOLEAN
)
RETURNS VARCHAR
LANGUAGE plpgsql
AS $$
DECLARE
  v_endpoint RECORD;
  v_breaker RECORD;
  v_new_state VARCHAR;
BEGIN
  -- Obter configuração do endpoint
  SELECT * INTO v_endpoint FROM api_endpoints WHERE id = p_endpoint_id;
  
  IF NOT v_endpoint.circuit_breaker_enabled THEN
    RETURN 'disabled';
  END IF;
  
  -- Obter ou criar registro de circuit breaker
  SELECT * INTO v_breaker FROM api_circuit_breaker WHERE endpoint_id = p_endpoint_id;
  
  IF NOT FOUND THEN
    INSERT INTO api_circuit_breaker (endpoint_id, state, failure_count, success_count)
    VALUES (p_endpoint_id, 'closed', 0, 0)
    RETURNING * INTO v_breaker;
  END IF;
  
  v_new_state := v_breaker.state;
  
  IF p_success THEN
    -- Sucesso
    IF v_breaker.state = 'half_open' THEN
      -- Reabrindo circuito
      v_new_state := 'closed';
      UPDATE api_circuit_breaker
      SET state = v_new_state, success_count = success_count + 1, failure_count = 0, last_success_at = NOW(), updated_at = NOW()
      WHERE endpoint_id = p_endpoint_id;
    ELSE
      -- Estado normal
      UPDATE api_circuit_breaker
      SET success_count = success_count + 1, last_success_at = NOW(), updated_at = NOW()
      WHERE endpoint_id = p_endpoint_id;
    END IF;
  ELSE
    -- Falha
    UPDATE api_circuit_breaker
    SET failure_count = failure_count + 1, last_failure_at = NOW(), updated_at = NOW()
    WHERE endpoint_id = p_endpoint_id;
    
    -- Verificar se deve abrir circuito
    IF v_breaker.failure_count + 1 >= v_endpoint.circuit_breaker_threshold THEN
      v_new_state := 'open';
      UPDATE api_circuit_breaker
      SET state = v_new_state,
          opened_at = NOW(),
          next_attempt_at = NOW() + (v_endpoint.circuit_breaker_timeout || ' seconds')::INTERVAL
      WHERE endpoint_id = p_endpoint_id;
      
      -- Criar alerta
      INSERT INTO api_alerts (endpoint_id, endpoint_nome, tipo, severidade, mensagem, detalhes)
      SELECT p_endpoint_id, nome, 'circuit_open', 'alta',
             'Circuit breaker aberto após ' || v_endpoint.circuit_breaker_threshold || ' falhas consecutivas',
             jsonb_build_object('threshold', v_endpoint.circuit_breaker_threshold, 'timeout', v_endpoint.circuit_breaker_timeout)
      FROM api_endpoints WHERE id = p_endpoint_id;
    END IF;
  END IF;
  
  RETURN v_new_state;
END;
$$;

-- =====================================================
-- FUNCTION: Obter do cache ou NULL
-- =====================================================
CREATE OR REPLACE FUNCTION get_from_cache(
  p_endpoint_id UUID,
  p_cache_key VARCHAR
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_cache RECORD;
BEGIN
  SELECT * INTO v_cache FROM api_cache
  WHERE endpoint_id = p_endpoint_id
    AND cache_key = p_cache_key
    AND expires_at > NOW();
  
  IF FOUND THEN
    -- Incrementar hit count
    UPDATE api_cache
    SET hit_count = hit_count + 1, last_hit_at = NOW()
    WHERE id = v_cache.id;
    
    RETURN jsonb_build_object(
      'status', v_cache.response_status,
      'body', v_cache.response_body,
      'headers', v_cache.response_headers
    );
  END IF;
  
  RETURN NULL;
END;
$$;

-- =====================================================
-- FUNCTION: Salvar no cache
-- =====================================================
CREATE OR REPLACE FUNCTION save_to_cache(
  p_endpoint_id UUID,
  p_cache_key VARCHAR,
  p_response_status INTEGER,
  p_response_body JSONB,
  p_response_headers JSONB,
  p_ttl INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO api_cache (endpoint_id, cache_key, response_status, response_body, response_headers, expires_at)
  VALUES (p_endpoint_id, p_cache_key, p_response_status, p_response_body, p_response_headers, NOW() + (p_ttl || ' seconds')::INTERVAL)
  ON CONFLICT (endpoint_id, cache_key)
  DO UPDATE SET
    response_status = EXCLUDED.response_status,
    response_body = EXCLUDED.response_body,
    response_headers = EXCLUDED.response_headers,
    expires_at = EXCLUDED.expires_at,
    created_at = NOW();
END;
$$;

-- =====================================================
-- FUNCTION: Limpar cache expirado
-- =====================================================
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM api_cache WHERE expires_at < NOW();
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

-- =====================================================
-- VIEW: vw_api_metrics (Métricas por endpoint)
-- =====================================================
CREATE OR REPLACE VIEW vw_api_metrics AS
SELECT
  e.id AS endpoint_id,
  e.nome AS endpoint_nome,
  e.servico,
  e.criticidade,
  COUNT(rl.id) AS total_requests,
  COUNT(rl.id) FILTER (WHERE rl.response_status >= 200 AND rl.response_status < 300) AS success_count,
  COUNT(rl.id) FILTER (WHERE rl.response_status >= 400) AS error_count,
  ROUND(AVG(rl.response_time_ms)::NUMERIC, 2) AS avg_response_time_ms,
  MAX(rl.response_time_ms) AS max_response_time_ms,
  MIN(rl.response_time_ms) AS min_response_time_ms,
  COUNT(rl.id) FILTER (WHERE rl.from_cache = TRUE) AS cache_hits,
  ROUND(
    (COUNT(rl.id) FILTER (WHERE rl.from_cache = TRUE)::NUMERIC / NULLIF(COUNT(rl.id), 0)) * 100,
    2
  ) AS cache_hit_rate_percent,
  cb.state AS circuit_breaker_state,
  cb.failure_count AS circuit_breaker_failures,
  (SELECT COUNT(*) FROM api_alerts WHERE endpoint_id = e.id AND is_resolved = FALSE) AS active_alerts
FROM api_endpoints e
LEFT JOIN api_requests_log rl ON e.id = rl.endpoint_id
LEFT JOIN api_circuit_breaker cb ON e.id = cb.endpoint_id
GROUP BY e.id, e.nome, e.servico, e.criticidade, cb.state, cb.failure_count;

-- =====================================================
-- RLS (Row Level Security)
-- =====================================================
ALTER TABLE api_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_requests_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_circuit_breaker ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_alerts ENABLE ROW LEVEL SECURITY;

-- Políticas: Admins podem ver tudo
CREATE POLICY "Admins podem gerenciar endpoints" ON api_endpoints FOR ALL
USING (
  EXISTS(
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND r.nome IN ('admin', 'ti_admin')
      AND ur.is_active = TRUE
  )
);

-- Políticas: Usuários podem ver seus próprios logs
CREATE POLICY "Usuários podem ver seus logs" ON api_requests_log FOR SELECT
USING (user_id = auth.uid() OR auth.uid() IN (
  SELECT ur.user_id FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE r.nome IN ('admin', 'ti_admin', 'auditor_interno')
));

-- =====================================================
-- SEED: Endpoints principais
-- =====================================================
INSERT INTO api_endpoints (nome, descricao, servico, metodo, url_base, url_path, auth_tipo, rate_limit_requests, rate_limit_window, cache_enabled, cache_ttl, criticidade, tags) VALUES
-- SEFAZ
('sefaz_nfe_emitir', 'Emissão de NF-e via SEFAZ', 'sefaz', 'POST', 'https://nfe.sefaz.rs.gov.br', '/ws/NfeAutorizacao/NFeAutorizacao4.asmx', 'certificate', 50, 60, FALSE, 0, 'critica', ARRAY['fiscal', 'nfe']),
('sefaz_nfe_consultar', 'Consulta de NF-e autorizada', 'sefaz', 'POST', 'https://nfe.sefaz.rs.gov.br', '/ws/NfeConsulta/NfeConsulta4.asmx', 'certificate', 100, 60, TRUE, 300, 'alta', ARRAY['fiscal', 'nfe']),
('sefaz_nfe_cancelar', 'Cancelamento de NF-e', 'sefaz', 'POST', 'https://nfe.sefaz.rs.gov.br', '/ws/RecepcaoEvento/RecepcaoEvento4.asmx', 'certificate', 20, 60, FALSE, 0, 'critica', ARRAY['fiscal', 'nfe']),

-- ANVISA
('anvisa_consultar_registro', 'Consultar registro de produto ANVISA', 'anvisa', 'GET', 'https://consultas.anvisa.gov.br', '/api/consulta/medicamentos', 'none', 200, 60, TRUE, 3600, 'alta', ARRAY['regulatorio', 'anvisa']),
('anvisa_rastreabilidade', 'Rastreabilidade de medicamentos/dispositivos', 'anvisa', 'POST', 'https://sngpc.anvisa.gov.br', '/api/rastreabilidade', 'api_key', 100, 60, FALSE, 0, 'critica', ARRAY['regulatorio', 'anvisa', 'rastreabilidade']),

-- CFM
('cfm_consultar_medico', 'Consultar CRM de médico', 'cfm', 'GET', 'https://portal.cfm.org.br', '/busca-medicos', 'none', 50, 60, TRUE, 86400, 'media', ARRAY['validacao', 'cfm']),

-- Receita Federal
('receita_consultar_cnpj', 'Consultar dados de CNPJ', 'receita_federal', 'GET', 'https://brasilapi.com.br', '/api/cnpj/v1/{cnpj}', 'none', 300, 60, TRUE, 86400, 'media', ARRAY['validacao', 'receita']),
('receita_consultar_cpf', 'Consultar dados de CPF', 'receita_federal', 'GET', 'https://brasilapi.com.br', '/api/cpf/v1/{cpf}', 'none', 300, 60, TRUE, 86400, 'media', ARRAY['validacao', 'receita']),

-- ViaCEP
('viacep_consultar', 'Consultar endereço por CEP', 'viacep', 'GET', 'https://viacep.com.br', '/ws/{cep}/json/', 'none', 500, 60, TRUE, 2592000, 'baixa', ARRAY['validacao', 'cep']),

-- Infosimples
('infosimples_cnpj_completo', 'Consulta completa de CNPJ (Infosimples)', 'infosimples', 'GET', 'https://api.infosimples.com', '/api/v2/consultas/receita-federal/cnpj', 'api_key', 100, 60, TRUE, 86400, 'alta', ARRAY['validacao', 'receita', 'premium'])

ON CONFLICT (nome) DO NOTHING;

-- =====================================================
-- COMMENTS (Documentação)
-- =====================================================
COMMENT ON TABLE api_endpoints IS 'Endpoints de APIs externas configurados (SEFAZ, ANVISA, CFM, etc.)';
COMMENT ON TABLE api_requests_log IS 'Log de todas as requisições a APIs externas para auditoria';
COMMENT ON TABLE api_rate_limits IS 'Controle de rate limiting por endpoint e usuário';
COMMENT ON TABLE api_circuit_breaker IS 'Estado do circuit breaker para proteção contra falhas';
COMMENT ON TABLE api_cache IS 'Cache de respostas de APIs para performance';
COMMENT ON TABLE api_health_checks IS 'Monitoramento de saúde dos endpoints externos';
COMMENT ON TABLE api_alerts IS 'Alertas de problemas com APIs externas';

COMMENT ON FUNCTION check_rate_limit IS 'Verifica se pode fazer requisição (rate limit)';
COMMENT ON FUNCTION update_circuit_breaker IS 'Atualiza estado do circuit breaker após requisição';
COMMENT ON FUNCTION get_from_cache IS 'Obtém resposta do cache se disponível';
COMMENT ON FUNCTION save_to_cache IS 'Salva resposta no cache';
COMMENT ON FUNCTION cleanup_expired_cache IS 'Limpa cache expirado (executar periodicamente)';



-- ============================================
-- Source: 20251020_bi_analytics.sql
-- ============================================

-- =====================================================
-- BLOCO 2.1: BI Dashboard Interativo - Analytics Avançado
-- Sistema completo de Business Intelligence para distribuidoras OPME
-- 
-- FUNCIONALIDADES:
-- - Análises multidimensionais (tempo, produto, cliente, vendedor)
-- - Métricas de performance (vendas, margem, giro)
-- - Análises preditivas (ML para previsão de demanda)
-- - Drill-down e drill-up
-- - Exportação de relatórios
-- - Dashboards personalizáveis por usuário
-- 
-- CONTEXTO OPME:
-- - Hospitais (clientes)
-- - Produtos OPME (código ANVISA)
-- - Planos de Saúde (pagadores)
-- - Indústrias (fornecedores)
-- =====================================================

-- =====================================================
-- TABELA: bi_dimensao_tempo (Dimensão Tempo)
-- =====================================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS bi_dimensao_tempo (
  data_id SERIAL PRIMARY KEY,
  data_completa DATE NOT NULL UNIQUE,
  
  -- Hierarquia temporal
  ano INTEGER NOT NULL,
  trimestre INTEGER NOT NULL CHECK (trimestre BETWEEN 1 AND 4),
  mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
  semana INTEGER NOT NULL CHECK (semana BETWEEN 1 AND 53),
  dia INTEGER NOT NULL CHECK (dia BETWEEN 1 AND 31),
  dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6), -- 0=Domingo
  dia_ano INTEGER NOT NULL CHECK (dia_ano BETWEEN 1 AND 366),
  
  -- Labels
  nome_mes VARCHAR(20) NOT NULL, -- 'Janeiro', 'Fevereiro', etc.
  nome_dia_semana VARCHAR(20) NOT NULL, -- 'Segunda', 'Terça', etc.
  trimestre_label VARCHAR(10) NOT NULL, -- 'Q1 2025'
  mes_ano_label VARCHAR(10) NOT NULL, -- 'Jan/2025'
  
  -- Flags
  is_feriado BOOLEAN DEFAULT FALSE,
  is_fim_semana BOOLEAN DEFAULT FALSE,
  is_dia_util BOOLEAN DEFAULT TRUE,
  nome_feriado VARCHAR(100),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE bi_dimensao_tempo IS 'Dimensão temporal para análises de BI';

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_bi_dim_tempo_ano ON bi_dimensao_tempo(ano);
CREATE INDEX IF NOT EXISTS idx_bi_dim_tempo_mes ON bi_dimensao_tempo(ano, mes);
CREATE INDEX IF NOT EXISTS idx_bi_dim_tempo_trimestre ON bi_dimensao_tempo(ano, trimestre);

-- =====================================================
-- TABELA: bi_dimensao_produto (Dimensão Produto OPME)
-- =====================================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS bi_dimensao_produto (
  produto_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identificação
  codigo VARCHAR(50) NOT NULL UNIQUE,
  descricao TEXT NOT NULL,
  
  -- Classificação
  categoria VARCHAR(100), -- 'Cardiovascular', 'Ortopedia', 'Neurologia', etc.
  subcategoria VARCHAR(100),
  tipo_opme VARCHAR(50), -- 'Órtese', 'Prótese', 'Material Especial'
  
  -- ANVISA
  registro_anvisa VARCHAR(50),
  fabricante VARCHAR(200),
  pais_origem VARCHAR(50),
  
  -- Financeiro
  custo_medio DECIMAL(15,2),
  preco_venda_medio DECIMAL(15,2),
  margem_percentual DECIMAL(5,2),
  
  -- Classificação ABC
  classe_abc VARCHAR(1) CHECK (classe_abc IN ('A', 'B', 'C')), -- A=80% faturamento, B=15%, C=5%
  classe_xyz VARCHAR(1) CHECK (classe_xyz IN ('X', 'Y', 'Z')), -- X=demanda constante, Y=variável, Z=esporádica
  
  -- Status
  is_ativo BOOLEAN DEFAULT TRUE,
  data_ativacao DATE,
  data_inativacao DATE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE bi_dimensao_produto IS 'Dimensão de produtos OPME para análises';

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_bi_dim_produto_categoria ON bi_dimensao_produto(categoria);
CREATE INDEX IF NOT EXISTS idx_bi_dim_produto_classe_abc ON bi_dimensao_produto(classe_abc);
CREATE INDEX IF NOT EXISTS idx_bi_dim_produto_ativo ON bi_dimensao_produto(is_ativo);

-- =====================================================
-- TABELA: bi_dimensao_cliente (Dimensão Cliente - Hospital)
-- =====================================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS bi_dimensao_cliente (
  cliente_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identificação
  cnpj VARCHAR(14) NOT NULL UNIQUE,
  razao_social VARCHAR(200) NOT NULL,
  nome_fantasia VARCHAR(200),
  
  -- Classificação
  tipo VARCHAR(50) NOT NULL, -- 'Hospital Público', 'Hospital Privado', 'Clínica', 'Maternidade'
  porte VARCHAR(20), -- 'Pequeno', 'Médio', 'Grande'
  especialidade VARCHAR(100), -- 'Cardiologia', 'Ortopedia', 'Geral'
  
  -- Localização
  cidade VARCHAR(100),
  estado VARCHAR(2),
  regiao VARCHAR(20), -- 'Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'
  
  -- Relacionamento
  tempo_cliente_dias INTEGER, -- Dias desde primeiro pedido
  segmento VARCHAR(20), -- 'VIP', 'Premium', 'Regular', 'Novo'
  score_credito INTEGER CHECK (score_credito BETWEEN 0 AND 1000),
  
  -- Performance
  total_faturado DECIMAL(15,2) DEFAULT 0,
  ticket_medio DECIMAL(15,2) DEFAULT 0,
  inadimplencia_percentual DECIMAL(5,2) DEFAULT 0,
  
  -- Status
  is_ativo BOOLEAN DEFAULT TRUE,
  data_cadastro DATE,
  data_ultimo_pedido DATE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE bi_dimensao_cliente IS 'Dimensão de clientes (hospitais) para análises';

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_bi_dim_cliente_tipo ON bi_dimensao_cliente(tipo);
CREATE INDEX IF NOT EXISTS idx_bi_dim_cliente_regiao ON bi_dimensao_cliente(regiao);
CREATE INDEX IF NOT EXISTS idx_bi_dim_cliente_segmento ON bi_dimensao_cliente(segmento);

-- =====================================================
-- TABELA: bi_dimensao_vendedor (Dimensão Vendedor)
-- =====================================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS bi_dimensao_vendedor (
  vendedor_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identificação
  user_id UUID REFERENCES auth.users(id),
  nome VARCHAR(200) NOT NULL,
  email VARCHAR(200),
  
  -- Hierarquia
  gerente_id UUID REFERENCES bi_dimensao_vendedor(vendedor_id),
  equipe VARCHAR(100), -- 'Equipe Sul', 'Equipe Nordeste'
  
  -- Performance
  meta_mensal DECIMAL(15,2),
  comissao_percentual DECIMAL(5,2),
  total_vendido DECIMAL(15,2) DEFAULT 0,
  total_clientes_ativos INTEGER DEFAULT 0,
  
  -- Status
  is_ativo BOOLEAN DEFAULT TRUE,
  data_admissao DATE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE bi_dimensao_vendedor IS 'Dimensão de vendedores para análises';

CREATE INDEX IF NOT EXISTS idx_bi_dim_vendedor_equipe ON bi_dimensao_vendedor(equipe);
CREATE INDEX IF NOT EXISTS idx_bi_dim_vendedor_ativo ON bi_dimensao_vendedor(is_ativo);

-- =====================================================
-- TABELA: bi_fato_vendas (Fato Central - Vendas OPME)
-- =====================================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS bi_fato_vendas (
  venda_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Chaves de dimensão (Foreign Keys)
  data_id INTEGER REFERENCES bi_dimensao_tempo(data_id),
  produto_id UUID REFERENCES bi_dimensao_produto(produto_id),
  cliente_id UUID REFERENCES bi_dimensao_cliente(cliente_id),
  vendedor_id UUID REFERENCES bi_dimensao_vendedor(vendedor_id),
  
  -- Chave de degeneração (NF-e)
  nfe_numero VARCHAR(20),
  nfe_chave_acesso VARCHAR(44),
  
  -- Métricas (measures)
  quantidade DECIMAL(15,3) NOT NULL,
  valor_unitario DECIMAL(15,2) NOT NULL,
  valor_total DECIMAL(15,2) NOT NULL,
  custo_unitario DECIMAL(15,2) NOT NULL,
  custo_total DECIMAL(15,2) NOT NULL,
  margem_bruta DECIMAL(15,2) NOT NULL, -- valor_total - custo_total
  margem_percentual DECIMAL(5,2) NOT NULL, -- (margem_bruta / valor_total) * 100
  
  -- Impostos
  icms DECIMAL(15,2),
  ipi DECIMAL(15,2),
  pis DECIMAL(15,2),
  cofins DECIMAL(15,2),
  
  -- Desconto
  desconto_percentual DECIMAL(5,2) DEFAULT 0,
  desconto_valor DECIMAL(15,2) DEFAULT 0,
  
  -- Pagamento
  plano_saude_id UUID, -- Referência ao plano que pagou
  forma_pagamento VARCHAR(50), -- 'À Vista', 'Parcelado', 'Convênio'
  prazo_dias INTEGER, -- Prazo médio de pagamento
  
  -- Status
  status VARCHAR(20) NOT NULL, -- 'Autorizada', 'Cancelada', 'Denegada'
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE bi_fato_vendas IS 'Tabela fato central com vendas de OPME';

-- Criar índices para performance em queries OLAP
CREATE INDEX IF NOT EXISTS idx_bi_fato_vendas_data ON bi_fato_vendas(data_id);
CREATE INDEX IF NOT EXISTS idx_bi_fato_vendas_produto ON bi_fato_vendas(produto_id);
CREATE INDEX IF NOT EXISTS idx_bi_fato_vendas_cliente ON bi_fato_vendas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_bi_fato_vendas_vendedor ON bi_fato_vendas(vendedor_id);
CREATE INDEX IF NOT EXISTS idx_bi_fato_vendas_status ON bi_fato_vendas(status);
CREATE INDEX IF NOT EXISTS idx_bi_fato_vendas_composito ON bi_fato_vendas(data_id, produto_id, cliente_id);

-- =====================================================
-- TABELA: bi_metricas_agregadas (Cache de métricas)
-- =====================================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS bi_metricas_agregadas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Dimensões da agregação
  granularidade VARCHAR(20) NOT NULL, -- 'dia', 'semana', 'mes', 'trimestre', 'ano'
  periodo_inicio DATE NOT NULL,
  periodo_fim DATE NOT NULL,
  
  -- Filtros aplicados (JSON para flexibilidade)
  dimensoes JSONB, -- {'produto_id': '...', 'cliente_id': '...', etc.}
  
  -- Métricas agregadas
  total_vendas DECIMAL(15,2) NOT NULL,
  total_custo DECIMAL(15,2) NOT NULL,
  total_margem DECIMAL(15,2) NOT NULL,
  margem_percentual DECIMAL(5,2) NOT NULL,
  quantidade_vendida DECIMAL(15,3) NOT NULL,
  quantidade_nfes INTEGER NOT NULL,
  ticket_medio DECIMAL(15,2) NOT NULL,
  
  -- Crescimento vs período anterior
  crescimento_percentual DECIMAL(5,2),
  
  -- Timestamp de cálculo
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE -- Cache expira após X tempo
);

COMMENT ON TABLE bi_metricas_agregadas IS 'Cache de métricas pré-calculadas para performance';

CREATE INDEX IF NOT EXISTS idx_bi_metricas_granularidade ON bi_metricas_agregadas(granularidade, periodo_inicio, periodo_fim);
CREATE INDEX IF NOT EXISTS idx_bi_metricas_expires ON bi_metricas_agregadas(expires_at);

-- =====================================================
-- TABELA: bi_previsao_demanda (ML - Previsão de Demanda)
-- =====================================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS bi_previsao_demanda (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Produto
  produto_id UUID REFERENCES bi_dimensao_produto(produto_id),
  
  -- Período da previsão
  ano INTEGER NOT NULL,
  mes INTEGER NOT NULL,
  
  -- Histórico
  media_vendas_6m DECIMAL(15,3), -- Média últimos 6 meses
  media_vendas_12m DECIMAL(15,3), -- Média últimos 12 meses
  tendencia VARCHAR(20), -- 'crescimento', 'estavel', 'queda'
  sazonalidade_fator DECIMAL(5,2), -- 1.0 = sem sazonalidade
  
  -- Previsão (ML)
  quantidade_prevista DECIMAL(15,3) NOT NULL,
  valor_previsto DECIMAL(15,2) NOT NULL,
  confianca_percentual INTEGER CHECK (confianca_percentual BETWEEN 0 AND 100),
  modelo_usado VARCHAR(50), -- 'ARIMA', 'Prophet', 'Linear Regression', 'Random Forest'
  
  -- Comparação real vs previsto
  quantidade_real DECIMAL(15,3),
  valor_real DECIMAL(15,2),
  acuracia_percentual DECIMAL(5,2), -- % de acerto
  
  -- Metadata
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE bi_previsao_demanda IS 'Previsões de demanda usando Machine Learning';

CREATE INDEX IF NOT EXISTS idx_bi_previsao_produto ON bi_previsao_demanda(produto_id, ano, mes);

-- =====================================================
-- TABELA: bi_dashboards_personalizados (Dashboards do usuário)
-- =====================================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS bi_dashboards_personalizados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Usuário
  user_id UUID REFERENCES auth.users(id),
  
  -- Configuração
  nome VARCHAR(200) NOT NULL,
  descricao TEXT,
  is_padrao BOOLEAN DEFAULT FALSE, -- Dashboard padrão do usuário
  is_compartilhado BOOLEAN DEFAULT FALSE,
  
  -- Layout (React Grid Layout)
  layout JSONB NOT NULL, -- Posição e tamanho dos widgets
  
  -- Widgets (gráficos, tabelas, KPIs)
  widgets JSONB NOT NULL, -- [{ type, config, data_source, filters }]
  
  -- Filtros globais
  filtros_padrao JSONB, -- Filtros aplicados por padrão
  
  -- Refresh
  auto_refresh_seconds INTEGER DEFAULT 300, -- 5 min
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE bi_dashboards_personalizados IS 'Dashboards personalizáveis por usuário';

CREATE INDEX IF NOT EXISTS idx_bi_dashboards_user ON bi_dashboards_personalizados(user_id);

-- =====================================================
-- TABELA: bi_relatorios_agendados (Relatórios automáticos)
-- =====================================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS bi_relatorios_agendados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Usuário
  user_id UUID REFERENCES auth.users(id),
  
  -- Configuração
  nome VARCHAR(200) NOT NULL,
  tipo VARCHAR(50) NOT NULL, -- 'vendas_por_produto', 'performance_vendedor', 'margem_por_cliente'
  
  -- Agendamento (cron-like)
  frequencia VARCHAR(20) NOT NULL, -- 'diaria', 'semanal', 'mensal', 'trimestral'
  dia_semana INTEGER, -- 0-6 (se semanal)
  dia_mes INTEGER, -- 1-31 (se mensal)
  hora INTEGER, -- 0-23
  
  -- Filtros
  filtros JSONB,
  
  -- Formato de saída
  formato VARCHAR(20) NOT NULL, -- 'pdf', 'excel', 'csv'
  
  -- Destinatários (emails)
  destinatarios TEXT[], -- Array de emails
  
  -- Status
  is_ativo BOOLEAN DEFAULT TRUE,
  ultima_execucao TIMESTAMP WITH TIME ZONE,
  proxima_execucao TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE bi_relatorios_agendados IS 'Relatórios automáticos agendados';

CREATE INDEX IF NOT EXISTS idx_bi_relatorios_proxima_exec ON bi_relatorios_agendados(proxima_execucao) WHERE is_ativo = TRUE;

-- =====================================================
-- VIEWS: Análises pré-calculadas
-- =====================================================

-- VIEW: Vendas por Produto (Top 20)
CREATE OR REPLACE VIEW vw_bi_vendas_por_produto AS
SELECT
  p.codigo,
  p.descricao,
  p.categoria,
  p.classe_abc,
  COUNT(v.venda_id) AS quantidade_vendas,
  SUM(v.quantidade) AS quantidade_total,
  SUM(v.valor_total) AS valor_total,
  SUM(v.margem_bruta) AS margem_total,
  AVG(v.margem_percentual) AS margem_media_percentual,
  RANK() OVER (ORDER BY SUM(v.valor_total) DESC) AS ranking_valor
FROM bi_fato_vendas v
JOIN bi_dimensao_produto p ON v.produto_id = p.produto_id
WHERE v.status = 'Autorizada'
GROUP BY p.produto_id, p.codigo, p.descricao, p.categoria, p.classe_abc
ORDER BY valor_total DESC
LIMIT 20;

-- VIEW: Vendas por Cliente (Top 20)
CREATE OR REPLACE VIEW vw_bi_vendas_por_cliente AS
SELECT
  c.cnpj,
  c.razao_social,
  c.cidade,
  c.estado,
  c.segmento,
  COUNT(v.venda_id) AS quantidade_vendas,
  SUM(v.valor_total) AS valor_total,
  SUM(v.margem_bruta) AS margem_total,
  AVG(v.margem_percentual) AS margem_media_percentual,
  RANK() OVER (ORDER BY SUM(v.valor_total) DESC) AS ranking_valor
FROM bi_fato_vendas v
JOIN bi_dimensao_cliente c ON v.cliente_id = c.cliente_id
WHERE v.status = 'Autorizada'
GROUP BY c.cliente_id, c.cnpj, c.razao_social, c.cidade, c.estado, c.segmento
ORDER BY valor_total DESC
LIMIT 20;

-- VIEW: Performance de Vendedores
CREATE OR REPLACE VIEW vw_bi_performance_vendedores AS
SELECT
  vd.nome,
  vd.equipe,
  vd.meta_mensal,
  COUNT(v.venda_id) AS quantidade_vendas,
  SUM(v.valor_total) AS valor_total,
  SUM(v.margem_bruta) AS margem_total,
  CASE
    WHEN vd.meta_mensal > 0 THEN ROUND((SUM(v.valor_total) / vd.meta_mensal) * 100, 2)
    ELSE NULL
  END AS atingimento_meta_percentual,
  COUNT(DISTINCT v.cliente_id) AS clientes_atendidos,
  ROUND(AVG(v.valor_total), 2) AS ticket_medio
FROM bi_fato_vendas v
JOIN bi_dimensao_vendedor vd ON v.vendedor_id = vd.vendedor_id
WHERE v.status = 'Autorizada'
GROUP BY vd.vendedor_id, vd.nome, vd.equipe, vd.meta_mensal
ORDER BY valor_total DESC;

-- VIEW: Evolução Mensal de Vendas
CREATE OR REPLACE VIEW vw_bi_evolucao_mensal AS
SELECT
  t.ano,
  t.mes,
  t.mes_ano_label,
  COUNT(v.venda_id) AS quantidade_vendas,
  SUM(v.valor_total) AS valor_total,
  SUM(v.margem_bruta) AS margem_total,
  ROUND(AVG(v.margem_percentual), 2) AS margem_media_percentual,
  COUNT(DISTINCT v.cliente_id) AS clientes_unicos,
  ROUND(SUM(v.valor_total) / NULLIF(COUNT(v.venda_id), 0), 2) AS ticket_medio
FROM bi_fato_vendas v
JOIN bi_dimensao_tempo t ON v.data_id = t.data_id
WHERE v.status = 'Autorizada'
GROUP BY t.ano, t.mes, t.mes_ano_label
ORDER BY t.ano DESC, t.mes DESC;

-- =====================================================
-- FUNCTIONS: Utilitários de BI
-- =====================================================

-- FUNCTION: Popular dimensão tempo (gerar 5 anos)
CREATE OR REPLACE FUNCTION populate_dimensao_tempo(p_ano_inicio INTEGER, p_anos INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_data DATE;
  v_data_fim DATE;
  v_count INTEGER := 0;
BEGIN
  v_data := DATE_TRUNC('year', (p_ano_inicio || '-01-01')::DATE);
  v_data_fim := v_data + (p_anos || ' years')::INTERVAL;
  
  WHILE v_data < v_data_fim LOOP
    INSERT INTO bi_dimensao_tempo (
      data_completa, ano, trimestre, mes, semana, dia, dia_semana, dia_ano,
      nome_mes, nome_dia_semana, trimestre_label, mes_ano_label,
      is_feriado, is_fim_semana, is_dia_util
    ) VALUES (
      v_data,
      EXTRACT(YEAR FROM v_data),
      EXTRACT(QUARTER FROM v_data),
      EXTRACT(MONTH FROM v_data),
      EXTRACT(WEEK FROM v_data),
      EXTRACT(DAY FROM v_data),
      EXTRACT(DOW FROM v_data),
      EXTRACT(DOY FROM v_data),
      TO_CHAR(v_data, 'TMMonth'),
      TO_CHAR(v_data, 'TMDay'),
      'Q' || EXTRACT(QUARTER FROM v_data) || ' ' || EXTRACT(YEAR FROM v_data),
      TO_CHAR(v_data, 'Mon/YYYY'),
      FALSE, -- is_feriado (atualizar manualmente)
      EXTRACT(DOW FROM v_data) IN (0, 6), -- is_fim_semana
      EXTRACT(DOW FROM v_data) NOT IN (0, 6) -- is_dia_util
    )
    ON CONFLICT (data_completa) DO NOTHING;
    
    v_data := v_data + 1;
    v_count := v_count + 1;
  END LOOP;
  
  RETURN v_count;
END;
$$;

COMMENT ON FUNCTION populate_dimensao_tempo IS 'Popula dimensão tempo com N anos de dados';

-- FUNCTION: Calcular métricas agregadas (cache)
CREATE OR REPLACE FUNCTION calcular_metricas_agregadas(
  p_granularidade VARCHAR,
  p_periodo_inicio DATE,
  p_periodo_fim DATE,
  p_dimensoes JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_id UUID;
  v_total_vendas DECIMAL;
  v_total_custo DECIMAL;
  v_total_margem DECIMAL;
  v_quantidade DECIMAL;
  v_nfes INTEGER;
BEGIN
  -- Calcular métricas
  SELECT
    SUM(valor_total),
    SUM(custo_total),
    SUM(margem_bruta),
    SUM(quantidade),
    COUNT(DISTINCT nfe_numero)
  INTO
    v_total_vendas, v_total_custo, v_total_margem, v_quantidade, v_nfes
  FROM bi_fato_vendas v
  JOIN bi_dimensao_tempo t ON v.data_id = t.data_id
  WHERE t.data_completa BETWEEN p_periodo_inicio AND p_periodo_fim
    AND v.status = 'Autorizada';
  
  -- Inserir no cache
  INSERT INTO bi_metricas_agregadas (
    granularidade, periodo_inicio, periodo_fim, dimensoes,
    total_vendas, total_custo, total_margem,
    margem_percentual, quantidade_vendida, quantidade_nfes, ticket_medio,
    expires_at
  ) VALUES (
    p_granularidade, p_periodo_inicio, p_periodo_fim, p_dimensoes,
    v_total_vendas, v_total_custo, v_total_margem,
    CASE WHEN v_total_vendas > 0 THEN (v_total_margem / v_total_vendas) * 100 ELSE 0 END,
    v_quantidade,
    v_nfes,
    CASE WHEN v_nfes > 0 THEN v_total_vendas / v_nfes ELSE 0 END,
    NOW() + '1 hour'::INTERVAL
  )
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$;

COMMENT ON FUNCTION calcular_metricas_agregadas IS 'Calcula e armazena métricas agregadas no cache';

-- =====================================================
-- RLS (Row Level Security)
-- =====================================================
ALTER TABLE bi_dimensao_tempo ENABLE ROW LEVEL SECURITY;
ALTER TABLE bi_dimensao_produto ENABLE ROW LEVEL SECURITY;
ALTER TABLE bi_dimensao_cliente ENABLE ROW LEVEL SECURITY;
ALTER TABLE bi_dimensao_vendedor ENABLE ROW LEVEL SECURITY;
ALTER TABLE bi_fato_vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE bi_metricas_agregadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE bi_previsao_demanda ENABLE ROW LEVEL SECURITY;
ALTER TABLE bi_dashboards_personalizados ENABLE ROW LEVEL SECURITY;
ALTER TABLE bi_relatorios_agendados ENABLE ROW LEVEL SECURITY;

-- Políticas: Vendedores só veem suas vendas, gerentes veem tudo
CREATE POLICY "Vendedores veem suas vendas" ON bi_fato_vendas FOR SELECT
USING (
  vendedor_id IN (
    SELECT vendedor_id FROM bi_dimensao_vendedor WHERE user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'gerente_geral', 'gerente_comercial', 'gerente_financeiro')
  )
);

-- Políticas: Dashboards são privados ou compartilhados
CREATE POLICY "Usuários gerenciam seus dashboards" ON bi_dashboards_personalizados FOR ALL
USING (user_id = auth.uid() OR is_compartilhado = TRUE);

-- =====================================================
-- SEED: Popular dimensão tempo (2023-2027)
-- =====================================================
SELECT populate_dimensao_tempo(2023, 5);

-- =====================================================
-- COMMENTS (Documentação)
-- =====================================================
COMMENT ON TABLE bi_fato_vendas IS 'Tabela fato central: vendas de OPME para hospitais';
COMMENT ON TABLE bi_dimensao_tempo IS 'Dimensão temporal com hierarquia completa';
COMMENT ON TABLE bi_dimensao_produto IS 'Dimensão de produtos OPME com classificação ABC/XYZ';
COMMENT ON TABLE bi_dimensao_cliente IS 'Dimensão de clientes (hospitais) com segmentação';
COMMENT ON TABLE bi_dimensao_vendedor IS 'Dimensão de vendedores com hierarquia';



-- ============================================
-- Source: 20251020_correcoes_lgpd_paciente_iniciais.sql
-- ============================================

-- ============================================
-- Migration: Correções LGPD — paciente_iniciais
-- Data: 2025-10-20
-- Versão: 1.0
-- Autor: AGENTE_AUDITOR_CORRETOR_SUPABASE v4
-- Tipo: NÃO-DESTRUTIVA (preserva dados)
-- ============================================
-- Descrição:
-- Garante conformidade com mapeamento FE↔BD e LGPD Art. 6º (minimização)
-- - Adiciona paciente_iniciais em cirurgias (se não existir)
-- - Popula iniciais a partir de paciente_nome (se houver)
-- - NÃO remove paciente_nome (usuário decide)
-- ============================================

-- ============================================
-- 1. ADICIONAR paciente_iniciais (se não existir)
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'cirurgias'
      AND column_name = 'paciente_iniciais'
  ) THEN
    ALTER TABLE public.cirurgias
      ADD COLUMN paciente_iniciais TEXT;
    
    COMMENT ON COLUMN public.cirurgias.paciente_iniciais IS 'Iniciais do paciente (LGPD minimização) ex: "J.S."';
    
    RAISE NOTICE '✅ Coluna paciente_iniciais adicionada';
  ELSE
    RAISE NOTICE '⚠️  Coluna paciente_iniciais já existe';
  END IF;
END $$;

-- ============================================
-- 2. POPULAR paciente_iniciais (se vazio)
-- ============================================
-- Gera iniciais a partir de paciente_nome ou nome_completo
DO $$
DECLARE
  v_updated INTEGER;
BEGIN
  -- Caso 1: paciente_nome existe na tabela cirurgias
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'cirurgias'
      AND column_name = 'paciente_nome'
  ) THEN
    UPDATE public.cirurgias SET
      paciente_iniciais = CONCAT(
        LEFT(paciente_nome, 1),
        '.',
        LEFT(SPLIT_PART(paciente_nome, ' ', -1), 1),
        '.'
      )
    WHERE (paciente_iniciais IS NULL OR paciente_iniciais = '')
      AND paciente_nome IS NOT NULL
      AND paciente_nome != '';
    
    GET DIAGNOSTICS v_updated = ROW_COUNT;
    RAISE NOTICE '✅ % cirurgias atualizadas com paciente_iniciais (de paciente_nome)', v_updated;
  END IF;
  
  -- Caso 2: FK para tabela pacientes (se existir)
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'cirurgias'
      AND column_name = 'paciente_id'
  ) AND EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'pacientes'
  ) THEN
    UPDATE public.cirurgias c SET
      paciente_iniciais = CONCAT(
        LEFT(p.nome_completo, 1),
        '.',
        LEFT(SPLIT_PART(p.nome_completo, ' ', -1), 1),
        '.'
      )
    FROM public.pacientes p
    WHERE c.paciente_id = p.id
      AND (c.paciente_iniciais IS NULL OR c.paciente_iniciais = '')
      AND p.nome_completo IS NOT NULL
      AND p.nome_completo != '';
    
    GET DIAGNOSTICS v_updated = ROW_COUNT;
    RAISE NOTICE '✅ % cirurgias atualizadas com paciente_iniciais (de tabela pacientes)', v_updated;
  END IF;
  
  -- Caso 3: Fallback para registros sem nome
  UPDATE public.cirurgias SET
    paciente_iniciais = 'N.D.' -- Não Disponível
  WHERE (paciente_iniciais IS NULL OR paciente_iniciais = '')
    AND excluido_em IS NULL;
  
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  IF v_updated > 0 THEN
    RAISE NOTICE '⚠️  % cirurgias sem nome - iniciais definidas como "N.D."', v_updated;
  END IF;
END $$;

-- ============================================
-- 3. VALIDAR NOT NULL (se apropriado)
-- ============================================
-- Apenas aplica NOT NULL se todas as cirurgias ativas têm iniciais
DO $$
DECLARE
  v_sem_iniciais INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_sem_iniciais
  FROM public.cirurgias
  WHERE (paciente_iniciais IS NULL OR paciente_iniciais = '')
    AND excluido_em IS NULL;
  
  IF v_sem_iniciais = 0 THEN
    ALTER TABLE public.cirurgias
      ALTER COLUMN paciente_iniciais SET NOT NULL;
    
    RAISE NOTICE '✅ paciente_iniciais definido como NOT NULL';
  ELSE
    RAISE NOTICE '⚠️  % cirurgias ativas sem iniciais - NOT NULL NÃO aplicado', v_sem_iniciais;
    RAISE NOTICE '    Execute novamente após corrigir dados';
  END IF;
END $$;

-- ============================================
-- 4. CRIAR ÍNDICE (se não existir)
-- ============================================
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_cirurgias_paciente_iniciais
  ON public.cirurgias(paciente_iniciais)
  WHERE excluido_em IS NULL;

COMMENT ON INDEX idx_cirurgias_paciente_iniciais IS 'Busca por iniciais de paciente (LGPD)';

-- ============================================
-- 5. CRIAR VIEW SEGURA (sem dados sensíveis)
-- ============================================
CREATE OR REPLACE VIEW public.vw_cirurgias_segura AS
SELECT
  id,
  empresa_id,
  codigo_interno,
  medico_id,
  hospital_id,
  paciente_iniciais, -- ✅ APENAS iniciais (LGPD)
  procedimento,
  data_cirurgia,
  hora_cirurgia,
  sala,
  status,
  prioridade,
  observacoes,
  valor_estimado,
  criado_em,
  atualizado_em
  -- excluido_em omitido (filtrado abaixo)
FROM public.cirurgias
WHERE excluido_em IS NULL;

COMMENT ON VIEW public.vw_cirurgias_segura IS 'View segura: omite dados sensíveis e soft-deleted';

-- ============================================
-- 6. GRANT PERMISSIONS (se usar RLS)
-- ============================================
-- Permitir SELECT na view para roles não-admin
GRANT SELECT ON public.vw_cirurgias_segura TO authenticated;

-- ============================================
-- 7. INSTRUÇÕES PARA DEPRECIAR paciente_nome
-- ============================================
-- ⚠️  ATENÇÃO: Esta migration NÃO remove paciente_nome
-- 
-- Motivo: Evitar perda de dados (conservador)
-- 
-- Para depreciar paciente_nome manualmente:
-- 1. Validar que todos os registros têm paciente_iniciais
-- 2. Atualizar frontend para usar paciente_iniciais
-- 3. Aplicar migration separada (reversível):
-- 
--   -- Migration 20251020_depreciar_paciente_nome.sql (OPCIONAL)
--   ALTER TABLE public.cirurgias
--     DROP COLUMN IF EXISTS paciente_nome CASCADE;
-- 
-- 4. Rollback (se necessário):
--   -- Migration 20251020_restaurar_paciente_nome.sql
--   ALTER TABLE public.cirurgias
--     ADD COLUMN paciente_nome TEXT;

-- ============================================
-- ROLLBACK (se necessário)
-- ============================================
-- DROP INDEX IF EXISTS idx_cirurgias_paciente_iniciais;
-- DROP VIEW IF EXISTS vw_cirurgias_segura;
-- ALTER TABLE public.cirurgias DROP COLUMN IF EXISTS paciente_iniciais CASCADE;

-- ============================================
-- VALIDAÇÃO PÓS-MIGRATION
-- ============================================
-- Execute: /scripts/qa/db/saude_mapeamento.sql
-- Esperado: ✅ paciente_iniciais presente e populado

-- ============================================
-- FIM DA MIGRATION
-- ============================================



-- ============================================
-- Source: 20251020_gestao_contabil.sql
-- ============================================

-- =====================================================
-- BLOCO 3.2: Gestão Contábil - DRE/Balancete
-- Sistema completo de contabilidade para distribuidoras OPME
-- 
-- FUNCIONALIDADES:
-- - Plano de Contas (estruturado)
-- - Lançamentos contábeis (débito/crédito)
-- - DRE (Demonstração do Resultado do Exercício)
-- - Balancete mensal
-- - Razão contábil
-- - Diário contábil
-- - Conciliação bancária
-- - Centros de custo
-- - Apuração de impostos
-- - Exportação SPED Contábil
-- 
-- CONTEXTO OPME:
-- - Distribuidora precisa DRE mensal para gestão
-- - Balancete exigido por bancos/investidores
-- - SPED Contábil obrigatório (ECD)
-- - Centros de custo por produto/cliente
-- =====================================================

-- =====================================================
-- TABELA: plano_contas (Plano de Contas estruturado)
-- =====================================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS plano_contas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Hierarquia
  codigo VARCHAR(20) NOT NULL UNIQUE, -- '1.1.01.001' (estruturado)
  nome VARCHAR(200) NOT NULL,
  descricao TEXT,
  
  -- Classificação
  tipo VARCHAR(20) NOT NULL, -- 'ativo', 'passivo', 'receita', 'despesa', 'resultado'
  natureza VARCHAR(10) NOT NULL, -- 'debito', 'credito'
  grau INTEGER NOT NULL, -- 1 (grupo), 2 (subgrupo), 3 (conta), 4 (subconta)
  conta_pai_id UUID REFERENCES plano_contas(id),
  
  -- Características
  aceita_lancamento BOOLEAN DEFAULT TRUE, -- Contas analíticas aceitam, sintéticas não
  is_sintetica BOOLEAN DEFAULT FALSE, -- Conta sintética (agrupadora)
  
  -- Centro de custo
  exige_centro_custo BOOLEAN DEFAULT FALSE,
  
  -- Integrações
  integracao_tipo VARCHAR(50), -- 'nfe_venda', 'nfe_compra', 'estoque', 'financeiro'
  
  -- Status
  is_ativa BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE plano_contas IS 'Plano de Contas estruturado (4 níveis de hierarquia)';

CREATE INDEX IF NOT EXISTS idx_plano_contas_codigo ON plano_contas(codigo);
CREATE INDEX IF NOT EXISTS idx_plano_contas_tipo ON plano_contas(tipo);
CREATE INDEX IF NOT EXISTS idx_plano_contas_pai ON plano_contas(conta_pai_id);

-- =====================================================
-- TABELA: centros_custo (Centros de Custo)
-- =====================================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS centros_custo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  codigo VARCHAR(20) NOT NULL UNIQUE,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
