-- ============================================
-- Migration 0007: DPO (Encarregado de Dados)
-- Data: 2025-10-18
-- Versão: 1.0
-- Descrição: Adiciona campos de DPO conforme LGPD Art. 41
-- ============================================

-- ============================================
-- ADICIONAR CAMPOS DPO NA TABELA EMPRESAS
-- ============================================

ALTER TABLE empresas 
ADD COLUMN IF NOT EXISTS dpo_nome TEXT,
ADD COLUMN IF NOT EXISTS dpo_email TEXT,
ADD COLUMN IF NOT EXISTS dpo_telefone TEXT,
ADD COLUMN IF NOT EXISTS dpo_cpf TEXT,
ADD COLUMN IF NOT EXISTS dpo_nomeado_em TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS dpo_tipo TEXT CHECK (dpo_tipo IN ('interno', 'externo')) DEFAULT 'interno';

-- Comentários
COMMENT ON COLUMN empresas.dpo_nome IS 'Nome completo do Encarregado de Proteção de Dados (LGPD Art. 41)';
COMMENT ON COLUMN empresas.dpo_email IS 'E-mail público de contato do DPO (obrigatório publicar)';
COMMENT ON COLUMN empresas.dpo_telefone IS 'Telefone do DPO (opcional)';
COMMENT ON COLUMN empresas.dpo_cpf IS 'CPF do DPO (interno apenas)';
COMMENT ON COLUMN empresas.dpo_nomeado_em IS 'Data de nomeação formal do DPO';
COMMENT ON COLUMN empresas.dpo_tipo IS 'Tipo: interno (funcionário) ou externo (consultoria)';

-- ============================================
-- CRIAR ÍNDICE PARA BUSCA DE DPO
-- ============================================

CREATE INDEX IF NOT EXISTS idx_empresas_dpo_email ON empresas(dpo_email) WHERE dpo_email IS NOT NULL;

-- ============================================
-- FUNÇÃO: Validar DPO configurado
-- ============================================

CREATE OR REPLACE FUNCTION validar_dpo_configurado(p_empresa_id UUID)
RETURNS TABLE(
  configurado BOOLEAN,
  mensagem TEXT,
  dpo_nome TEXT,
  dpo_email TEXT,
  dias_desde_nomeacao INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (e.dpo_nome IS NOT NULL AND e.dpo_email IS NOT NULL) AS configurado,
    CASE
      WHEN e.dpo_nome IS NULL THEN 'DPO não nomeado (obrigatório LGPD Art. 41)'
      WHEN e.dpo_email IS NULL THEN 'E-mail do DPO não configurado'
      WHEN e.dpo_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN 'E-mail do DPO inválido'
      ELSE '✅ DPO configurado corretamente'
    END AS mensagem,
    e.dpo_nome,
    e.dpo_email,
    EXTRACT(DAY FROM NOW() - e.dpo_nomeado_em)::INTEGER AS dias_desde_nomeacao
  FROM empresas e
  WHERE e.id = p_empresa_id;
END;
$$;

COMMENT ON FUNCTION validar_dpo_configurado IS 'Valida se DPO está corretamente configurado (LGPD Art. 41)';

-- ============================================
-- TRIGGER: Alerta de DPO não configurado
-- ============================================

CREATE OR REPLACE FUNCTION check_dpo_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Avisar se empresa criada sem DPO
  IF NEW.dpo_email IS NULL THEN
    RAISE WARNING 'Empresa criada sem DPO. Configure em até 30 dias (LGPD Art. 41)';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_check_dpo_empresas
  AFTER INSERT ON empresas
  FOR EACH ROW
  EXECUTE FUNCTION check_dpo_on_insert();

-- ============================================
-- VIEW: Empresas sem DPO configurado
-- ============================================

CREATE OR REPLACE VIEW view_empresas_sem_dpo AS
SELECT
  id,
  nome,
  cnpj,
  email,
  criado_em,
  EXTRACT(DAY FROM NOW() - criado_em)::INTEGER AS dias_desde_criacao,
  CASE
    WHEN EXTRACT(DAY FROM NOW() - criado_em) > 30 THEN '🔴 CRÍTICO (>30 dias)'
    WHEN EXTRACT(DAY FROM NOW() - criado_em) > 15 THEN '🟡 URGENTE (>15 dias)'
    ELSE '🟢 OK (<15 dias)'
  END AS alerta
FROM empresas
WHERE (dpo_nome IS NULL OR dpo_email IS NULL)
  AND excluido_em IS NULL
  AND status = 'ativa';

COMMENT ON VIEW view_empresas_sem_dpo IS 'Lista empresas sem DPO configurado (compliance check)';

-- ============================================
-- SEED: Atualizar empresa demo com DPO
-- ============================================

-- Exemplo: Atualizar empresa demo (ajustar conforme necessário)
UPDATE empresas
SET
  dpo_nome = 'DPO Provisório',
  dpo_email = 'dpo@icarus-opme.com.br',
  dpo_telefone = '(11) 99999-9999',
  dpo_tipo = 'interno',
  dpo_nomeado_em = NOW()
WHERE id = '11111111-1111-1111-1111-111111111111'
  AND dpo_email IS NULL;  -- Só atualiza se ainda não tem

-- ============================================
-- DADOS DE EXEMPLO (comentado - descomentar para testar)
-- ============================================

/*
-- Exemplo de nomeação de DPO interno
UPDATE empresas
SET
  dpo_nome = 'João Silva Santos',
  dpo_email = 'joao.silva@empresa.com.br',
  dpo_telefone = '(11) 98765-4321',
  dpo_cpf = '123.456.789-00',
  dpo_tipo = 'interno',
  dpo_nomeado_em = NOW()
WHERE cnpj = '12.345.678/0001-90';

-- Exemplo de DPO externo (consultoria)
UPDATE empresas
SET
  dpo_nome = 'DataPrivacy Brasil Consultoria',
  dpo_email = 'contato@dataprivacy.com.br',
  dpo_telefone = '(11) 3456-7890',
  dpo_tipo = 'externo',
  dpo_nomeado_em = NOW()
WHERE cnpj = '98.765.432/0001-10';
*/

-- ============================================
-- VALIDAÇÃO
-- ============================================

-- Verificar empresas sem DPO
DO $$
DECLARE
  empresas_sem_dpo INTEGER;
BEGIN
  SELECT COUNT(*) INTO empresas_sem_dpo
  FROM view_empresas_sem_dpo;
  
  IF empresas_sem_dpo > 0 THEN
    RAISE NOTICE '⚠️  % empresa(s) sem DPO configurado', empresas_sem_dpo;
    RAISE NOTICE 'Execute: SELECT * FROM view_empresas_sem_dpo;';
  ELSE
    RAISE NOTICE '✅ Todas as empresas têm DPO configurado';
  END IF;
END $$;

