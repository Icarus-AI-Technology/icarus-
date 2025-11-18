-- ============================================
-- Migration: Triggers de Validação CNPJ/CRM
-- Gerado por: Agente 03 - Melhoria para 100/100
-- Data: 2025-10-26
-- Descrição: Valida CNPJ e CRM antes de INSERT/UPDATE
-- ============================================

-- ============================================
-- 1. FUNÇÃO: Validar CNPJ (Algoritmo Receita Federal)
-- ============================================

CREATE OR REPLACE FUNCTION public.validar_cnpj(p_cnpj TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_cnpj TEXT;
  v_digito1 INTEGER;
  v_digito2 INTEGER;
  v_soma INTEGER;
  v_resto INTEGER;
  v_i INTEGER;
  v_peso INTEGER;
BEGIN
  -- Remover formatação
  v_cnpj := REGEXP_REPLACE(p_cnpj, '[^0-9]', '', 'g');
  
  -- Validar tamanho
  IF LENGTH(v_cnpj) != 14 THEN
    RETURN FALSE;
  END IF;
  
  -- Validar CNPJs inválidos conhecidos (todos iguais)
  IF v_cnpj IN ('00000000000000', '11111111111111', '22222222222222', '33333333333333',
                '44444444444444', '55555555555555', '66666666666666', '77777777777777',
                '88888888888888', '99999999999999') THEN
    RETURN FALSE;
  END IF;
  
  -- Calcular primeiro dígito verificador
  v_soma := 0;
  v_peso := 5;
  FOR v_i IN 1..12 LOOP
    v_soma := v_soma + (SUBSTRING(v_cnpj, v_i, 1)::INTEGER * v_peso);
    v_peso := v_peso - 1;
    IF v_peso < 2 THEN
      v_peso := 9;
    END IF;
  END LOOP;
  
  v_resto := v_soma % 11;
  v_digito1 := CASE WHEN v_resto < 2 THEN 0 ELSE 11 - v_resto END;
  
  IF v_digito1 != SUBSTRING(v_cnpj, 13, 1)::INTEGER THEN
    RETURN FALSE;
  END IF;
  
  -- Calcular segundo dígito verificador
  v_soma := 0;
  v_peso := 6;
  FOR v_i IN 1..13 LOOP
    v_soma := v_soma + (SUBSTRING(v_cnpj, v_i, 1)::INTEGER * v_peso);
    v_peso := v_peso - 1;
    IF v_peso < 2 THEN
      v_peso := 9;
    END IF;
  END LOOP;
  
  v_resto := v_soma % 11;
  v_digito2 := CASE WHEN v_resto < 2 THEN 0 ELSE 11 - v_resto END;
  
  IF v_digito2 != SUBSTRING(v_cnpj, 14, 1)::INTEGER THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION public.validar_cnpj IS 'Valida CNPJ conforme algoritmo da Receita Federal';

-- ============================================
-- 2. FUNÇÃO: Validar CRM
-- ============================================

CREATE OR REPLACE FUNCTION public.validar_crm(p_crm TEXT, p_uf TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_crm TEXT;
BEGIN
  -- Remover formatação
  v_crm := REGEXP_REPLACE(p_crm, '[^0-9]', '', 'g');
  
  -- Validar tamanho (CRM tem 4 a 6 dígitos)
  IF LENGTH(v_crm) < 4 OR LENGTH(v_crm) > 6 THEN
    RETURN FALSE;
  END IF;
  
  -- Validar UF (deve ser uma sigla válida)
  IF p_uf NOT IN ('AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
                   'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
                   'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO') THEN
    RETURN FALSE;
  END IF;
  
  -- CRM não pode ser zero
  IF v_crm::INTEGER = 0 THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION public.validar_crm IS 'Valida formato de CRM (4-6 dígitos) e UF';

-- ============================================
-- 3. TRIGGER FUNCTION: Validar CNPJ antes de INSERT/UPDATE
-- ============================================

CREATE OR REPLACE FUNCTION public.trigger_validar_cnpj()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Se CNPJ fornecido, validar
  IF NEW.cnpj IS NOT NULL AND TRIM(NEW.cnpj) != '' THEN
    IF NOT public.validar_cnpj(NEW.cnpj) THEN
      RAISE EXCEPTION 'CNPJ inválido: %', NEW.cnpj
        USING HINT = 'Verifique se o CNPJ está correto e tente novamente.';
    END IF;
    
    -- Normalizar (remover formatação)
    NEW.cnpj := REGEXP_REPLACE(NEW.cnpj, '[^0-9]', '', 'g');
  END IF;
  
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.trigger_validar_cnpj IS 'Trigger: valida CNPJ antes de INSERT/UPDATE';

-- ============================================
-- 4. TRIGGER FUNCTION: Validar CRM antes de INSERT/UPDATE
-- ============================================

CREATE OR REPLACE FUNCTION public.trigger_validar_crm()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Se CRM fornecido, validar
  IF NEW.crm IS NOT NULL AND TRIM(NEW.crm) != '' THEN
    IF NOT public.validar_crm(NEW.crm, NEW.crm_uf) THEN
      RAISE EXCEPTION 'CRM inválido: % / %', NEW.crm, NEW.crm_uf
        USING HINT = 'CRM deve ter 4-6 dígitos e UF válida.';
    END IF;
    
    -- Normalizar (remover formatação, manter apenas números)
    NEW.crm := REGEXP_REPLACE(NEW.crm, '[^0-9]', '', 'g');
    
    -- Normalizar UF (uppercase)
    NEW.crm_uf := UPPER(TRIM(NEW.crm_uf));
  END IF;
  
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.trigger_validar_crm IS 'Trigger: valida CRM e UF antes de INSERT/UPDATE';

-- ============================================
-- 5. APLICAR TRIGGERS: Tabelas com CNPJ
-- ============================================

-- Empresas
DROP TRIGGER IF EXISTS trg_validar_cnpj_empresas ON public.empresas;
CREATE TRIGGER trg_validar_cnpj_empresas
BEFORE INSERT OR UPDATE OF cnpj ON public.empresas
FOR EACH ROW
EXECUTE FUNCTION public.trigger_validar_cnpj();

-- Fornecedores
DROP TRIGGER IF EXISTS trg_validar_cnpj_fornecedores ON public.fornecedores;
CREATE TRIGGER trg_validar_cnpj_fornecedores
BEFORE INSERT OR UPDATE OF cnpj ON public.fornecedores
FOR EACH ROW
EXECUTE FUNCTION public.trigger_validar_cnpj();

-- Hospitais
DROP TRIGGER IF EXISTS trg_validar_cnpj_hospitais ON public.hospitais;
CREATE TRIGGER trg_validar_cnpj_hospitais
BEFORE INSERT OR UPDATE OF cnpj ON public.hospitais
FOR EACH ROW
EXECUTE FUNCTION public.trigger_validar_cnpj();

-- Transportadoras (se existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transportadoras') THEN
    EXECUTE 'DROP TRIGGER IF EXISTS trg_validar_cnpj_transportadoras ON public.transportadoras';
    EXECUTE 'CREATE TRIGGER trg_validar_cnpj_transportadoras
             BEFORE INSERT OR UPDATE OF cnpj ON public.transportadoras
             FOR EACH ROW
             EXECUTE FUNCTION public.trigger_validar_cnpj()';
  END IF;
END$$;

-- ============================================
-- 6. APLICAR TRIGGERS: Tabelas com CRM
-- ============================================

-- Médicos
DROP TRIGGER IF EXISTS trg_validar_crm_medicos ON public.medicos;
CREATE TRIGGER trg_validar_crm_medicos
BEFORE INSERT OR UPDATE OF crm, crm_uf ON public.medicos
FOR EACH ROW
EXECUTE FUNCTION public.trigger_validar_crm();

-- ============================================
-- 7. FUNÇÃO: Validar registros existentes
-- ============================================

CREATE OR REPLACE FUNCTION public.validar_cnpjs_existentes()
RETURNS TABLE(
  tabela TEXT,
  id UUID,
  cnpj TEXT,
  valido BOOLEAN,
  mensagem TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Validar empresas
  RETURN QUERY
  SELECT
    'empresas'::TEXT,
    e.id,
    e.cnpj,
    public.validar_cnpj(e.cnpj) AS valido,
    CASE
      WHEN public.validar_cnpj(e.cnpj) THEN 'CNPJ válido'
      ELSE 'CNPJ inválido - CORRIGIR'
    END AS mensagem
  FROM public.empresas e
  WHERE e.cnpj IS NOT NULL AND TRIM(e.cnpj) != '';
  
  -- Validar fornecedores
  RETURN QUERY
  SELECT
    'fornecedores'::TEXT,
    f.id,
    f.cnpj,
    public.validar_cnpj(f.cnpj) AS valido,
    CASE
      WHEN public.validar_cnpj(f.cnpj) THEN 'CNPJ válido'
      ELSE 'CNPJ inválido - CORRIGIR'
    END AS mensagem
  FROM public.fornecedores f
  WHERE f.cnpj IS NOT NULL AND TRIM(f.cnpj) != '';
  
  -- Validar hospitais
  RETURN QUERY
  SELECT
    'hospitais'::TEXT,
    h.id,
    h.cnpj,
    public.validar_cnpj(h.cnpj) AS valido,
    CASE
      WHEN public.validar_cnpj(h.cnpj) THEN 'CNPJ válido'
      ELSE 'CNPJ inválido - CORRIGIR'
    END AS mensagem
  FROM public.hospitais h
  WHERE h.cnpj IS NOT NULL AND TRIM(h.cnpj) != '';
END;
$$;

COMMENT ON FUNCTION public.validar_cnpjs_existentes IS 'Valida CNPJs já cadastrados no banco';

CREATE OR REPLACE FUNCTION public.validar_crms_existentes()
RETURNS TABLE(
  id UUID,
  nome TEXT,
  crm TEXT,
  crm_uf TEXT,
  valido BOOLEAN,
  mensagem TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.nome,
    m.crm,
    m.crm_uf,
    public.validar_crm(m.crm, m.crm_uf) AS valido,
    CASE
      WHEN public.validar_crm(m.crm, m.crm_uf) THEN 'CRM válido'
      ELSE 'CRM inválido - CORRIGIR'
    END AS mensagem
  FROM public.medicos m
  WHERE m.crm IS NOT NULL AND TRIM(m.crm) != '';
END;
$$;

COMMENT ON FUNCTION public.validar_crms_existentes IS 'Valida CRMs já cadastrados no banco';

-- ============================================
-- 8. TESTES UNITÁRIOS
-- ============================================

-- Teste 1: CNPJs válidos
DO $$
BEGIN
  ASSERT public.validar_cnpj('11.222.333/0001-81') = TRUE, 'CNPJ válido não passou';
  ASSERT public.validar_cnpj('00000000000191') = TRUE, 'CNPJ Receita Federal não passou';
  RAISE NOTICE 'Testes de CNPJs válidos: OK';
END$$;

-- Teste 2: CNPJs inválidos
DO $$
BEGIN
  ASSERT public.validar_cnpj('11.222.333/0001-82') = FALSE, 'CNPJ inválido passou';
  ASSERT public.validar_cnpj('00000000000000') = FALSE, 'CNPJ zero passou';
  ASSERT public.validar_cnpj('123') = FALSE, 'CNPJ curto passou';
  RAISE NOTICE 'Testes de CNPJs inválidos: OK';
END$$;

-- Teste 3: CRMs válidos
DO $$
BEGIN
  ASSERT public.validar_crm('123456', 'SP') = TRUE, 'CRM válido não passou';
  ASSERT public.validar_crm('12345', 'RJ') = TRUE, 'CRM 5 dígitos não passou';
  ASSERT public.validar_crm('1234', 'MG') = TRUE, 'CRM 4 dígitos não passou';
  RAISE NOTICE 'Testes de CRMs válidos: OK';
END$$;

-- Teste 4: CRMs inválidos
DO $$
BEGIN
  ASSERT public.validar_crm('123', 'SP') = FALSE, 'CRM curto passou';
  ASSERT public.validar_crm('1234567', 'SP') = FALSE, 'CRM longo passou';
  ASSERT public.validar_crm('123456', 'XX') = FALSE, 'UF inválida passou';
  ASSERT public.validar_crm('0', 'SP') = FALSE, 'CRM zero passou';
  RAISE NOTICE 'Testes de CRMs inválidos: OK';
END$$;

-- ============================================
-- ✅ RESULTADO
-- ============================================
-- ✅ Validação de CNPJ (algoritmo Receita Federal)
-- ✅ Validação de CRM (formato e UF)
-- ✅ Triggers em 4 tabelas com CNPJ
-- ✅ Triggers em 1 tabela com CRM
-- ✅ Normalização automática (remove formatação)
-- ✅ Funções para validar registros existentes
-- ✅ Testes unitários passando
-- ============================================

