-- Migration: Criar Tabelas Críticas Ausentes
-- Gerado por: Agente 03 - Próximos Passos
-- Data: 2025-10-25
-- Descrição: Cria 4 tabelas críticas identificadas como ausentes na auditoria

-- ============================================================================
-- TABELA 1: consignacao_materiais
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.consignacao_materiais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Identificação da Consignação
  numero_consignacao VARCHAR(50) NOT NULL,
  tipo_consignacao VARCHAR(20) NOT NULL CHECK (tipo_consignacao IN ('ENTRADA', 'SAIDA', 'DEVOLUCAO')),
  status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'APROVADA', 'REJEITADA', 'FINALIZADA', 'CANCELADA')),
  
  -- Relacionamentos
  cirurgia_id UUID REFERENCES public.cirurgias(id) ON DELETE SET NULL,
  hospital_id UUID REFERENCES public.hospitais(id) ON DELETE SET NULL,
  fornecedor_id UUID REFERENCES public.fornecedores(id) ON DELETE SET NULL,
  
  -- Produto
  produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE RESTRICT,
  lote_id UUID REFERENCES public.lotes(id) ON DELETE SET NULL,
  quantidade DECIMAL(10,2) NOT NULL CHECK (quantidade > 0),
  quantidade_utilizada DECIMAL(10,2) DEFAULT 0 CHECK (quantidade_utilizada >= 0),
  unidade_medida VARCHAR(10) NOT NULL DEFAULT 'UN',
  
  -- Valores Financeiros
  valor_unitario DECIMAL(10,2) NOT NULL CHECK (valor_unitario >= 0),
  valor_total DECIMAL(10,2) GENERATED ALWAYS AS (quantidade * valor_unitario) STORED,
  
  -- Datas
  data_consignacao TIMESTAMP NOT NULL DEFAULT NOW(),
  data_prevista_retorno TIMESTAMP,
  data_retorno TIMESTAMP,
  data_utilizacao TIMESTAMP,
  
  -- Rastreabilidade
  numero_nota_fiscal VARCHAR(50),
  serie_nota_fiscal VARCHAR(10),
  numero_serie_produto VARCHAR(100),
  
  -- Observações
  observacoes TEXT,
  motivo_rejeicao TEXT,
  
  -- Responsáveis
  responsavel_envio_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  responsavel_recebimento_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  
  -- Auditoria
  criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMP NOT NULL DEFAULT NOW(),
  criado_por UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  atualizado_por UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  
  -- Constraints
  CONSTRAINT uk_consignacao_numero UNIQUE (empresa_id, numero_consignacao),
  CONSTRAINT ck_quantidade_utilizada CHECK (quantidade_utilizada <= quantidade),
  CONSTRAINT ck_data_retorno CHECK (data_retorno IS NULL OR data_retorno >= data_consignacao)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_consignacao_materiais_empresa ON public.consignacao_materiais(empresa_id);
CREATE INDEX IF NOT EXISTS idx_consignacao_materiais_cirurgia ON public.consignacao_materiais(cirurgia_id);
CREATE INDEX IF NOT EXISTS idx_consignacao_materiais_produto ON public.consignacao_materiais(produto_id);
CREATE INDEX IF NOT EXISTS idx_consignacao_materiais_status ON public.consignacao_materiais(status);
CREATE INDEX IF NOT EXISTS idx_consignacao_materiais_data ON public.consignacao_materiais(data_consignacao);
CREATE INDEX IF NOT EXISTS idx_consignacao_materiais_tipo ON public.consignacao_materiais(tipo_consignacao);

-- Comentários
COMMENT ON TABLE public.consignacao_materiais IS 'Controle de materiais em consignação - entrada, saída e devolução';
COMMENT ON COLUMN public.consignacao_materiais.quantidade_utilizada IS 'Quantidade efetivamente utilizada na cirurgia';
COMMENT ON COLUMN public.consignacao_materiais.valor_total IS 'Valor total calculado automaticamente (quantidade * valor_unitario)';


-- ============================================================================
-- TABELA 2: produtos_opme
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.produtos_opme (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Identificação do Produto OPME
  codigo_interno VARCHAR(50) NOT NULL,
  codigo_anvisa VARCHAR(50) UNIQUE,
  registro_anvisa VARCHAR(50),
  codigo_fabricante VARCHAR(50),
  codigo_barras VARCHAR(50),
  
  -- Informações Básicas
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('ORTESE', 'PROTESE', 'MATERIAL_ESPECIAL', 'IMPLANTE')),
  subcategoria VARCHAR(100),
  tipo_material VARCHAR(100),
  
  -- Fabricante
  fabricante_id UUID REFERENCES public.fabricantes(id) ON DELETE SET NULL,
  fabricante_nome VARCHAR(255),
  pais_origem VARCHAR(2),
  
  -- Especificações Técnicas
  marca VARCHAR(100),
  modelo VARCHAR(100),
  tamanho VARCHAR(50),
  cor VARCHAR(50),
  lado VARCHAR(20) CHECK (lado IN ('DIREITO', 'ESQUERDO', 'BILATERAL', 'NAO_APLICAVEL')),
  material_composicao TEXT,
  
  -- Características OPME
  requer_rastreabilidade BOOLEAN NOT NULL DEFAULT true,
  requer_serie BOOLEAN NOT NULL DEFAULT true,
  vida_util_meses INTEGER,
  esteril BOOLEAN DEFAULT false,
  biocompativel BOOLEAN DEFAULT true,
  
  -- Classificação de Risco ANVISA
  classe_risco VARCHAR(10) CHECK (classe_risco IN ('I', 'II', 'III', 'IV')),
  
  -- Valores
  valor_compra DECIMAL(10,2) CHECK (valor_compra >= 0),
  valor_venda DECIMAL(10,2) CHECK (valor_venda >= 0),
  valor_tabela_sus DECIMAL(10,2),
  margem_lucro DECIMAL(5,2),
  
  -- Unidades
  unidade_medida VARCHAR(10) NOT NULL DEFAULT 'UN',
  unidades_por_embalagem INTEGER DEFAULT 1,
  
  -- Estoque
  estoque_minimo INTEGER DEFAULT 0,
  estoque_maximo INTEGER,
  ponto_reposicao INTEGER,
  
  -- Status
  ativo BOOLEAN NOT NULL DEFAULT true,
  bloqueado BOOLEAN DEFAULT false,
  motivo_bloqueio TEXT,
  
  -- Documentação
  possui_laudo_tecnico BOOLEAN DEFAULT false,
  possui_certificado_conformidade BOOLEAN DEFAULT false,
  data_validade_registro TIMESTAMP,
  
  -- Fornecimento
  tempo_entrega_dias INTEGER,
  fornecedor_principal_id UUID REFERENCES public.fornecedores(id) ON DELETE SET NULL,
  
  -- Observações
  observacoes TEXT,
  indicacoes_uso TEXT,
  contraindicacoes TEXT,
  
  -- Auditoria
  criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMP NOT NULL DEFAULT NOW(),
  criado_por UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  atualizado_por UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  
  -- Constraints
  CONSTRAINT uk_produtos_opme_codigo UNIQUE (empresa_id, codigo_interno),
  CONSTRAINT ck_valores_opme CHECK (valor_venda IS NULL OR valor_compra IS NULL OR valor_venda >= valor_compra)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_produtos_opme_empresa ON public.produtos_opme(empresa_id);
CREATE INDEX IF NOT EXISTS idx_produtos_opme_anvisa ON public.produtos_opme(codigo_anvisa);
CREATE INDEX IF NOT EXISTS idx_produtos_opme_categoria ON public.produtos_opme(categoria);
CREATE INDEX IF NOT EXISTS idx_produtos_opme_ativo ON public.produtos_opme(ativo);
CREATE INDEX IF NOT EXISTS idx_produtos_opme_nome ON public.produtos_opme USING gin(to_tsvector('portuguese', nome));
CREATE INDEX IF NOT EXISTS idx_produtos_opme_fabricante ON public.produtos_opme(fabricante_id);

-- Comentários
COMMENT ON TABLE public.produtos_opme IS 'Cadastro de produtos OPME (Órteses, Próteses e Materiais Especiais)';
COMMENT ON COLUMN public.produtos_opme.requer_rastreabilidade IS 'Define se o produto exige rastreabilidade completa (lote + série)';
COMMENT ON COLUMN public.produtos_opme.classe_risco IS 'Classificação de risco ANVISA: I (baixo) a IV (alto)';


-- ============================================================================
-- TABELA 3: rastreabilidade_opme
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.rastreabilidade_opme (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Identificação do Produto
  produto_opme_id UUID NOT NULL REFERENCES public.produtos_opme(id) ON DELETE RESTRICT,
  lote_id UUID REFERENCES public.lotes(id) ON DELETE SET NULL,
  numero_serie VARCHAR(100) NOT NULL,
  codigo_barras VARCHAR(100),
  
  -- Rastreabilidade Completa
  numero_lote VARCHAR(50),
  data_fabricacao DATE,
  data_validade DATE,
  data_esterilizacao DATE,
  metodo_esterilizacao VARCHAR(100),
  
  -- Origem
  fornecedor_id UUID REFERENCES public.fornecedores(id) ON DELETE SET NULL,
  fabricante_id UUID REFERENCES public.fabricantes(id) ON DELETE SET NULL,
  pais_origem VARCHAR(2),
  
  -- Entrada no Sistema
  tipo_entrada VARCHAR(20) NOT NULL CHECK (tipo_entrada IN ('COMPRA', 'CONSIGNACAO', 'DEVOLUCAO', 'TRANSFERENCIA')),
  data_entrada TIMESTAMP NOT NULL DEFAULT NOW(),
  nota_fiscal_entrada VARCHAR(50),
  serie_nf_entrada VARCHAR(10),
  valor_entrada DECIMAL(10,2),
  
  -- Localização Atual
  localizacao_atual VARCHAR(20) NOT NULL DEFAULT 'ESTOQUE' CHECK (
    localizacao_atual IN ('ESTOQUE', 'CONSIGNACAO', 'EM_USO', 'UTILIZADO', 'DEVOLVIDO', 'DESCARTADO')
  ),
  deposito_id UUID REFERENCES public.depositos(id) ON DELETE SET NULL,
  prateleira VARCHAR(50),
  
  -- Utilização
  cirurgia_id UUID REFERENCES public.cirurgias(id) ON DELETE SET NULL,
  paciente_id UUID REFERENCES public.pacientes(id) ON DELETE SET NULL,
  medico_id UUID REFERENCES public.medicos(id) ON DELETE SET NULL,
  data_utilizacao TIMESTAMP,
  hospital_id UUID REFERENCES public.hospitais(id) ON DELETE SET NULL,
  
  -- Consignação
  consignacao_id UUID REFERENCES public.consignacao_materiais(id) ON DELETE SET NULL,
  data_consignacao TIMESTAMP,
  data_devolucao TIMESTAMP,
  
  -- Saída do Sistema
  tipo_saida VARCHAR(20) CHECK (tipo_saida IN ('VENDA', 'USO_PROPRIO', 'DEVOLUCAO', 'DESCARTE', 'PERDA')),
  data_saida TIMESTAMP,
  motivo_saida TEXT,
  nota_fiscal_saida VARCHAR(50),
  serie_nf_saida VARCHAR(10),
  
  -- Documentação
  certificado_origem TEXT,
  laudo_tecnico TEXT,
  possui_documentacao_completa BOOLEAN DEFAULT false,
  
  -- Quarentena e Bloqueio
  em_quarentena BOOLEAN DEFAULT false,
  motivo_quarentena TEXT,
  data_inicio_quarentena TIMESTAMP,
  bloqueado BOOLEAN DEFAULT false,
  motivo_bloqueio TEXT,
  
  -- Recall
  possui_recall BOOLEAN DEFAULT false,
  numero_recall VARCHAR(50),
  data_recall DATE,
  motivo_recall TEXT,
  
  -- Observações
  observacoes TEXT,
  
  -- Auditoria
  criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMP NOT NULL DEFAULT NOW(),
  criado_por UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  atualizado_por UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  
  -- Constraints
  CONSTRAINT uk_rastreabilidade_serie UNIQUE (produto_opme_id, numero_serie),
  CONSTRAINT ck_data_validade CHECK (data_validade IS NULL OR data_validade >= data_fabricacao),
  CONSTRAINT ck_data_saida CHECK (data_saida IS NULL OR data_saida >= data_entrada)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_rastreabilidade_empresa ON public.rastreabilidade_opme(empresa_id);
CREATE INDEX IF NOT EXISTS idx_rastreabilidade_produto ON public.rastreabilidade_opme(produto_opme_id);
CREATE INDEX IF NOT EXISTS idx_rastreabilidade_serie ON public.rastreabilidade_opme(numero_serie);
CREATE INDEX IF NOT EXISTS idx_rastreabilidade_lote ON public.rastreabilidade_opme(numero_lote);
CREATE INDEX IF NOT EXISTS idx_rastreabilidade_cirurgia ON public.rastreabilidade_opme(cirurgia_id);
CREATE INDEX IF NOT EXISTS idx_rastreabilidade_paciente ON public.rastreabilidade_opme(paciente_id);
CREATE INDEX IF NOT EXISTS idx_rastreabilidade_localizacao ON public.rastreabilidade_opme(localizacao_atual);
CREATE INDEX IF NOT EXISTS idx_rastreabilidade_recall ON public.rastreabilidade_opme(possui_recall) WHERE possui_recall = true;

-- Comentários
COMMENT ON TABLE public.rastreabilidade_opme IS 'Rastreabilidade completa de produtos OPME da entrada até a utilização final';
COMMENT ON COLUMN public.rastreabilidade_opme.numero_serie IS 'Número de série único do produto OPME';
COMMENT ON COLUMN public.rastreabilidade_opme.localizacao_atual IS 'Localização atual do produto no fluxo';


-- ============================================================================
-- TABELA 4: compliance_requisitos_abbott
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.compliance_requisitos_abbott (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Identificação do Requisito
  codigo_requisito VARCHAR(50) NOT NULL,
  categoria VARCHAR(50) NOT NULL CHECK (categoria IN (
    'DOCUMENTACAO', 
    'TREINAMENTO', 
    'QUALIDADE', 
    'RASTREABILIDADE', 
    'FINANCEIRO',
    'OPERACIONAL',
    'REGULATORIO'
  )),
  nome_requisito VARCHAR(255) NOT NULL,
  descricao TEXT,
  
  -- Criticidade
  nivel_criticidade VARCHAR(20) NOT NULL DEFAULT 'MEDIA' CHECK (nivel_criticidade IN ('BAIXA', 'MEDIA', 'ALTA', 'CRITICA')),
  obrigatorio BOOLEAN NOT NULL DEFAULT true,
  
  -- Período de Avaliação
  tipo_periodo VARCHAR(20) CHECK (tipo_periodo IN ('MENSAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL', 'PONTUAL')),
  data_inicio_vigencia DATE NOT NULL,
  data_fim_vigencia DATE,
  
  -- Status de Conformidade
  status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE' CHECK (status IN (
    'PENDENTE',
    'EM_ANALISE', 
    'CONFORME', 
    'NAO_CONFORME', 
    'PARCIALMENTE_CONFORME',
    'EM_ADEQUACAO',
    'DISPENSADO'
  )),
  percentual_conformidade DECIMAL(5,2) DEFAULT 0 CHECK (percentual_conformidade BETWEEN 0 AND 100),
  
  -- Score Abbott
  peso_calculo INTEGER NOT NULL DEFAULT 1 CHECK (peso_calculo BETWEEN 1 AND 10),
  pontos_possiveis DECIMAL(5,2) NOT NULL DEFAULT 100,
  pontos_obtidos DECIMAL(5,2) DEFAULT 0 CHECK (pontos_obtidos >= 0),
  
  -- Datas de Verificação
  data_ultima_avaliacao TIMESTAMP,
  data_proxima_avaliacao TIMESTAMP,
  frequencia_dias INTEGER,
  
  -- Responsabilidades
  responsavel_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  auditor_abbott_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  
  -- Evidências
  requer_evidencia BOOLEAN DEFAULT true,
  tipo_evidencia TEXT,
  evidencias_anexadas JSONB DEFAULT '[]'::jsonb,
  
  -- Não Conformidades
  numero_nao_conformidades INTEGER DEFAULT 0,
  data_primeira_nao_conformidade TIMESTAMP,
  data_ultima_nao_conformidade TIMESTAMP,
  
  -- Plano de Ação
  possui_plano_acao BOOLEAN DEFAULT false,
  plano_acao TEXT,
  prazo_adequacao DATE,
  status_adequacao VARCHAR(20),
  
  -- Observações do Auditor
  observacoes_auditoria TEXT,
  recomendacoes TEXT,
  pontos_fortes TEXT,
  pontos_melhoria TEXT,
  
  -- Histórico
  historico_avaliacoes JSONB DEFAULT '[]'::jsonb,
  
  -- Referências Normativas
  norma_referencia VARCHAR(100),
  clausula_norma VARCHAR(50),
  legislacao_aplicavel TEXT,
  
  -- Documentação Abbott
  codigo_documento_abbott VARCHAR(50),
  versao_documento VARCHAR(10),
  link_documento TEXT,
  
  -- Flags
  ativo BOOLEAN NOT NULL DEFAULT true,
  dispensado BOOLEAN DEFAULT false,
  motivo_dispensa TEXT,
  
  -- Auditoria
  criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMP NOT NULL DEFAULT NOW(),
  criado_por UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  atualizado_por UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  
  -- Constraints
  CONSTRAINT uk_compliance_codigo UNIQUE (empresa_id, codigo_requisito),
  CONSTRAINT ck_pontos_obtidos CHECK (pontos_obtidos <= pontos_possiveis),
  CONSTRAINT ck_data_vigencia CHECK (data_fim_vigencia IS NULL OR data_fim_vigencia >= data_inicio_vigencia)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_compliance_empresa ON public.compliance_requisitos_abbott(empresa_id);
CREATE INDEX IF NOT EXISTS idx_compliance_categoria ON public.compliance_requisitos_abbott(categoria);
CREATE INDEX IF NOT EXISTS idx_compliance_status ON public.compliance_requisitos_abbott(status);
CREATE INDEX IF NOT EXISTS idx_compliance_criticidade ON public.compliance_requisitos_abbott(nivel_criticidade);
CREATE INDEX IF NOT EXISTS idx_compliance_proxima_avaliacao ON public.compliance_requisitos_abbott(data_proxima_avaliacao);
CREATE INDEX IF NOT EXISTS idx_compliance_responsavel ON public.compliance_requisitos_abbott(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_compliance_ativo ON public.compliance_requisitos_abbott(ativo);

-- Comentários
COMMENT ON TABLE public.compliance_requisitos_abbott IS 'Controle de requisitos de compliance para certificação Abbott';
COMMENT ON COLUMN public.compliance_requisitos_abbott.peso_calculo IS 'Peso do requisito no cálculo do score Abbott (1-10)';
COMMENT ON COLUMN public.compliance_requisitos_abbott.percentual_conformidade IS 'Percentual de conformidade calculado nas avaliações';
COMMENT ON COLUMN public.compliance_requisitos_abbott.historico_avaliacoes IS 'Histórico de avaliações em formato JSON';

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================

