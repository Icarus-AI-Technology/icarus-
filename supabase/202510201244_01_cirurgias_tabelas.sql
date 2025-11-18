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
CREATE TABLE IF NOT EXISTS public.cirurgias (
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
CREATE TABLE IF NOT EXISTS public.cirurgia_materiais (
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
CREATE TABLE IF NOT EXISTS public.cirurgia_eventos (
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

CREATE INDEX IF NOT EXISTS cirurgias_empresa_id_data_idx ON public.cirurgias(empresa_id, data_agendada DESC);
CREATE INDEX IF NOT EXISTS cirurgias_status_idx ON public.cirurgias(status_cirurgia);
CREATE INDEX IF NOT EXISTS cirurgias_data_agendada_idx ON public.cirurgias(data_agendada);
CREATE INDEX IF NOT EXISTS cirurgias_medico_id_idx ON public.cirurgias(medico_id);
CREATE INDEX IF NOT EXISTS cirurgias_hospital_id_idx ON public.cirurgias(hospital_id);

CREATE INDEX IF NOT EXISTS cirurgia_materiais_cirurgia_id_idx ON public.cirurgia_materiais(cirurgia_id);
CREATE INDEX IF NOT EXISTS cirurgia_materiais_material_id_idx ON public.cirurgia_materiais(material_id);
CREATE INDEX IF NOT EXISTS cirurgia_materiais_status_idx ON public.cirurgia_materiais(status_item);

CREATE INDEX IF NOT EXISTS cirurgia_eventos_cirurgia_id_idx ON public.cirurgia_eventos(cirurgia_id);
CREATE INDEX IF NOT EXISTS cirurgia_eventos_data_hora_idx ON public.cirurgia_eventos(data_hora DESC);

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
