-- ============================================
-- Migration: 20251118 - SEFAZ Alignment
-- ============================================

BEGIN;

-- -------------------------------------------------
-- 1. Configurações de NF-e por empresa
-- -------------------------------------------------

CREATE TABLE IF NOT EXISTS public.configuracoes_nfe (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  ambiente TEXT NOT NULL DEFAULT 'homologacao' CHECK (ambiente = ANY (ARRAY['homologacao','producao'])),
  certificado_pfx TEXT,
  certificado_senha TEXT,
  certificado_validade DATE,
  certificado_cnpj TEXT,
  serie_padrao INTEGER DEFAULT 1,
  ultimo_numero_emitido INTEGER DEFAULT 0,
  uf_sefaz TEXT DEFAULT 'SP',
  token_sefaz TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS configuracoes_nfe_empresa_idx
  ON public.configuracoes_nfe (empresa_id);

CREATE INDEX IF NOT EXISTS configuracoes_nfe_ambiente_idx
  ON public.configuracoes_nfe (ambiente);

CREATE OR REPLACE FUNCTION public.set_configuracoes_nfe_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_configuracoes_nfe_updated ON public.configuracoes_nfe;

CREATE TRIGGER trg_configuracoes_nfe_updated
BEFORE UPDATE ON public.configuracoes_nfe
FOR EACH ROW
EXECUTE FUNCTION public.set_configuracoes_nfe_updated_at();

-- -------------------------------------------------
-- 2. Notas fiscais: colunas esperadas pelo SEFAZService
-- -------------------------------------------------

ALTER TABLE public.notas_fiscais
  ADD COLUMN IF NOT EXISTS destinatario_cpf_cnpj TEXT,
  ADD COLUMN IF NOT EXISTS protocolo TEXT,
  ADD COLUMN IF NOT EXISTS ambiente TEXT DEFAULT 'homologacao',
  ADD COLUMN IF NOT EXISTS xml_nfe TEXT,
  ADD COLUMN IF NOT EXISTS danfe_pdf TEXT,
  ADD COLUMN IF NOT EXISTS uf TEXT,
  ADD COLUMN IF NOT EXISTS data_cancelamento TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS justificativa_cancelamento TEXT,
  ADD COLUMN IF NOT EXISTS protocolo_cancelamento TEXT;

-- Sincronizar dados existentes
UPDATE public.notas_fiscais
SET protocolo = COALESCE(protocolo, protocolo_autorizacao),
    destinatario_cpf_cnpj = COALESCE(destinatario_cpf_cnpj, destinatario_cnpj),
    ambiente = COALESCE(ambiente, 'homologacao')
WHERE protocolo IS NULL
   OR destinatario_cpf_cnpj IS NULL
   OR ambiente IS NULL;

-- Trigger para manter colunas espelhadas em sincronia
CREATE OR REPLACE FUNCTION public.sync_notas_fiscais_alias_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.protocolo IS NULL AND NEW.protocolo_autorizacao IS NOT NULL THEN
    NEW.protocolo := NEW.protocolo_autorizacao;
  ELSIF NEW.protocolo IS NOT NULL AND COALESCE(NEW.protocolo_autorizacao, '') = '' THEN
    NEW.protocolo_autorizacao := NEW.protocolo;
  END IF;

  IF NEW.destinatario_cpf_cnpj IS NULL AND NEW.destinatario_cnpj IS NOT NULL THEN
    NEW.destinatario_cpf_cnpj := NEW.destinatario_cnpj;
  ELSIF NEW.destinatario_cpf_cnpj IS NOT NULL AND COALESCE(NEW.destinatario_cnpj, '') = '' THEN
    NEW.destinatario_cnpj := NEW.destinatario_cpf_cnpj;
  END IF;

  IF NEW.ambiente IS NULL THEN
    NEW.ambiente := 'homologacao';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_notas_fiscais_alias ON public.notas_fiscais;

CREATE TRIGGER trg_sync_notas_fiscais_alias
BEFORE INSERT OR UPDATE ON public.notas_fiscais
FOR EACH ROW
EXECUTE FUNCTION public.sync_notas_fiscais_alias_columns();

CREATE INDEX IF NOT EXISTS idx_notas_fiscais_ambiente
  ON public.notas_fiscais (ambiente);

COMMIT;


