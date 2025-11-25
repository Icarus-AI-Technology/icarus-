-- ============================================
-- Migration: 20251120 - Contratos Alignment
-- ============================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enums
DO $$ BEGIN
  CREATE TYPE public.contrato_status_enum AS ENUM ('rascunho','em_aprovacao','ativo','renovacao','encerrado','cancelado');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.contrato_tipo_enum AS ENUM ('fornecimento_produtos','prestacao_servicos','opme_hospital','locacao','parceria','seguro','outro');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.contrato_indice_enum AS ENUM ('nenhum','ipca','igpm','inpc','percentual_fixo');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.contrato_periodicidade_enum AS ENUM ('anual','semestral');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.contrato_alerta_tipo_enum AS ENUM ('vencimento','renovacao','sla','inadimplencia','assinatura');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.contrato_alerta_severidade_enum AS ENUM ('info','warning','critical');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.contrato_aprovacao_nivel_enum AS ENUM ('juridico','financeiro','diretoria','comercial','operacional');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.contrato_aprovacao_status_enum AS ENUM ('pendente','aprovado','rejeitado');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Master table
CREATE TABLE IF NOT EXISTS public.contratos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  numero_contrato TEXT NOT NULL,
  titulo TEXT NOT NULL,
  tipo public.contrato_tipo_enum NOT NULL DEFAULT 'fornecimento_produtos',
  status public.contrato_status_enum NOT NULL DEFAULT 'rascunho',
  contratante_id UUID,
  contratante_nome TEXT,
  contratado_id UUID,
  contratado_nome TEXT,
  contratado_documento TEXT,
  data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  data_fim DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '1 year'),
  renovacao_automatica BOOLEAN NOT NULL DEFAULT FALSE,
  prazo_aviso_rescisao INTEGER NOT NULL DEFAULT 30,
  valor_total NUMERIC(14,2) NOT NULL DEFAULT 0,
  forma_pagamento TEXT NOT NULL DEFAULT '',
  indice_reajuste public.contrato_indice_enum,
  periodicidade_reajuste public.contrato_periodicidade_enum,
  percentual_reajuste NUMERIC(6,2),
  clausulas_principais TEXT,
  observacoes TEXT,
  exige_aprovacao_juridico BOOLEAN NOT NULL DEFAULT FALSE,
  exige_aprovacao_financeiro BOOLEAN NOT NULL DEFAULT FALSE,
  exige_aprovacao_diretoria BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT contratos_empresa_numero_unique UNIQUE (empresa_id, numero_contrato)
);

CREATE INDEX IF NOT EXISTS idx_contratos_empresa ON public.contratos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_contratos_status ON public.contratos(status);

-- Child tables
CREATE TABLE IF NOT EXISTS public.contratos_clausulas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID NOT NULL REFERENCES public.contratos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  texto TEXT NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contratos_clausulas_contrato ON public.contratos_clausulas(contrato_id);

CREATE TABLE IF NOT EXISTS public.contratos_aditivos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID NOT NULL REFERENCES public.contratos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  valor_ajuste NUMERIC(14,2) NOT NULL DEFAULT 0,
  data_assinatura DATE NOT NULL DEFAULT CURRENT_DATE,
  arquivo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contratos_aditivos_contrato ON public.contratos_aditivos(contrato_id);

CREATE TABLE IF NOT EXISTS public.contratos_sla (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID NOT NULL REFERENCES public.contratos(id) ON DELETE CASCADE,
  indicador TEXT NOT NULL,
  meta TEXT NOT NULL,
  penalidade TEXT,
  frequencia TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contratos_sla_contrato ON public.contratos_sla(contrato_id);

CREATE TABLE IF NOT EXISTS public.contratos_aprovacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID NOT NULL REFERENCES public.contratos(id) ON DELETE CASCADE,
  nivel public.contrato_aprovacao_nivel_enum NOT NULL,
  status public.contrato_aprovacao_status_enum NOT NULL DEFAULT 'pendente',
  comentario TEXT,
  usuario_id UUID,
  aprovado_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contratos_aprovacoes_contrato ON public.contratos_aprovacoes(contrato_id);

CREATE TABLE IF NOT EXISTS public.contratos_alertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID NOT NULL REFERENCES public.contratos(id) ON DELETE CASCADE,
  tipo public.contrato_alerta_tipo_enum NOT NULL,
  descricao TEXT,
  data_alerta DATE NOT NULL DEFAULT CURRENT_DATE,
  severidade public.contrato_alerta_severidade_enum NOT NULL DEFAULT 'info',
  resolvido BOOLEAN NOT NULL DEFAULT FALSE,
  resolvido_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contratos_alertas_contrato ON public.contratos_alertas(contrato_id);
CREATE INDEX IF NOT EXISTS idx_contratos_alertas_data ON public.contratos_alertas(data_alerta);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.set_contratos_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_contratos_updated_at ON public.contratos;
CREATE TRIGGER trg_contratos_updated_at
  BEFORE UPDATE ON public.contratos
  FOR EACH ROW
  EXECUTE FUNCTION public.set_contratos_updated_at();

-- Views
CREATE OR REPLACE VIEW public.view_contratos_kpis AS
SELECT
  empresa_id,
  COUNT(*) FILTER (WHERE status = 'ativo') AS contratos_ativos,
  COUNT(*) FILTER (WHERE status = 'renovacao') AS contratos_em_renovacao,
  COUNT(*) FILTER (WHERE status IN ('rascunho','em_aprovacao')) AS contratos_pendentes,
  COALESCE(SUM(valor_total),0)::NUMERIC(14,2) AS valor_total,
  COUNT(*) FILTER (WHERE status IN ('ativo','renovacao') AND data_fim BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days') AS vencer_30,
  COUNT(*) FILTER (WHERE status IN ('ativo','renovacao') AND data_fim BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '90 days') AS vencer_90,
  CASE WHEN COUNT(*) = 0 THEN 0
       ELSE ROUND((COUNT(*) FILTER (WHERE status = 'renovacao')::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
  END AS taxa_renovacao,
  NOW() AS atualizado_em
FROM public.contratos
GROUP BY empresa_id;

CREATE OR REPLACE VIEW public.view_contratos_alertas AS
SELECT
  ca.id,
  ca.contrato_id,
  ca.tipo,
  ca.descricao,
  ca.data_alerta,
  ca.severidade,
  ca.resolvido,
  ca.resolvido_em,
  ca.created_at,
  c.titulo AS contrato_titulo,
  c.numero_contrato,
  c.empresa_id
FROM public.contratos_alertas ca
JOIN public.contratos c ON c.id = ca.contrato_id;

GRANT SELECT ON public.view_contratos_kpis TO authenticated;
GRANT SELECT ON public.view_contratos_alertas TO authenticated;

COMMIT;
