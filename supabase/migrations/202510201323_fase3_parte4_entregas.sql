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
CREATE TABLE IF NOT EXISTS public.entregas (
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

CREATE INDEX IF NOT EXISTS idx_entregas_empresa ON public.entregas(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_entregas_tipo ON public.entregas(tipo, status) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_entregas_status ON public.entregas(status, data_entrega_prevista) WHERE status NOT IN ('entregue', 'cancelada');
CREATE INDEX IF NOT EXISTS idx_entregas_data_programada ON public.entregas(data_programada, hora_programada) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_entregas_data_prevista ON public.entregas(data_entrega_prevista) WHERE status IN ('agendada', 'em_transito');
CREATE INDEX IF NOT EXISTS idx_entregas_cirurgia ON public.entregas(cirurgia_id) WHERE cirurgia_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_entregas_remessa ON public.entregas(remessa_consignacao_id) WHERE remessa_consignacao_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_entregas_rastreamento ON public.entregas(codigo_rastreamento) WHERE codigo_rastreamento IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_entregas_transportadora ON public.entregas(transportadora_id) WHERE transportadora_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_entregas_destinatario ON public.entregas(destinatario_nome) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_entregas_urgente ON public.entregas(urgente, status) WHERE urgente = TRUE AND status NOT IN ('entregue', 'cancelada');

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

