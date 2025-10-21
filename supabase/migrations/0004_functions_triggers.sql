-- ============================================
-- Migration 0004: Funções & Triggers
-- Data: 2025-10-18
-- Versão: 1.0
-- Autor: Agente Sênior BD
-- ============================================
-- Descrição:
-- - Audit log com hash chain (blockchain-like)
-- - Triggers de auditoria em tabelas críticas
-- - Funções LGPD (anonimização, exportação)
-- - Funções de negócio (reservar_kit, consumir_kit)
-- - Validações ANVISA (lotes vencidos)
-- ============================================

-- ============================================
-- AUDIT LOG: Hash Chain (blockchain-like)
-- ============================================

-- Função: Computar hash SHA-256 do registro de audit
CREATE OR REPLACE FUNCTION compute_audit_hash(
  p_empresa_id UUID,
  p_usuario_id UUID,
  p_tabela TEXT,
  p_registro_id UUID,
  p_acao TEXT,
  p_dados_antes JSONB,
  p_dados_depois JSONB,
  p_hash_anterior TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_payload TEXT;
BEGIN
  -- Concatenar dados para hash
  v_payload := CONCAT(
    COALESCE(p_empresa_id::text, ''),
    '|',
    COALESCE(p_usuario_id::text, ''),
    '|',
    p_tabela,
    '|',
    p_registro_id::text,
    '|',
    p_acao,
    '|',
    COALESCE(p_dados_antes::text, ''),
    '|',
    COALESCE(p_dados_depois::text, ''),
    '|',
    COALESCE(p_hash_anterior, '')
  );
  
  -- Retornar SHA-256
  RETURN encode(digest(v_payload, 'sha256'), 'hex');
END;
$$;

-- Função: Inserir log de auditoria com hash chain
CREATE OR REPLACE FUNCTION insert_audit_log(
  p_empresa_id UUID,
  p_usuario_id UUID,
  p_tabela TEXT,
  p_registro_id UUID,
  p_acao TEXT,
  p_dados_antes JSONB,
  p_dados_depois JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_hash_anterior TEXT;
  v_hash_atual TEXT;
BEGIN
  -- Buscar último hash da cadeia
  SELECT hash_atual INTO v_hash_anterior
  FROM audit_log
  ORDER BY criado_em DESC, id DESC
  LIMIT 1;
  
  -- Computar hash atual
  v_hash_atual := compute_audit_hash(
    p_empresa_id,
    p_usuario_id,
    p_tabela,
    p_registro_id,
    p_acao,
    p_dados_antes,
    p_dados_depois,
    v_hash_anterior
  );
  
  -- Inserir registro
  INSERT INTO audit_log (
    empresa_id,
    usuario_id,
    tabela,
    registro_id,
    acao,
    dados_antes,
    dados_depois,
    hash_anterior,
    hash_atual
  ) VALUES (
    p_empresa_id,
    p_usuario_id,
    p_tabela,
    p_registro_id,
    p_acao,
    p_dados_antes,
    p_dados_depois,
    v_hash_anterior,
    v_hash_atual
  );
END;
$$;

COMMENT ON FUNCTION compute_audit_hash IS 'Computa SHA-256 para hash chain de auditoria';
COMMENT ON FUNCTION insert_audit_log IS 'Insere log de auditoria com hash chain blockchain-like';

-- ============================================
-- TRIGGER: Auditoria automática
-- ============================================

-- Função genérica de trigger de auditoria
CREATE OR REPLACE FUNCTION trigger_audit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_empresa_id UUID;
  v_usuario_id UUID;
  v_acao TEXT;
  v_dados_antes JSONB;
  v_dados_depois JSONB;
BEGIN
  -- Determinar empresa_id (se existe na tabela)
  IF TG_OP = 'DELETE' THEN
    v_empresa_id := (to_jsonb(OLD)->>'empresa_id')::uuid;
  ELSE
    v_empresa_id := (to_jsonb(NEW)->>'empresa_id')::uuid;
  END IF;
  
  -- Capturar usuario_id do JWT
  BEGIN
    v_usuario_id := auth.uid();
  EXCEPTION WHEN OTHERS THEN
    v_usuario_id := NULL;
  END;
  
  -- Definir ação e dados
  CASE TG_OP
    WHEN 'INSERT' THEN
      v_acao := 'INSERT';
      v_dados_antes := NULL;
      v_dados_depois := to_jsonb(NEW);
    WHEN 'UPDATE' THEN
      v_acao := 'UPDATE';
      v_dados_antes := to_jsonb(OLD);
      v_dados_depois := to_jsonb(NEW);
    WHEN 'DELETE' THEN
      v_acao := 'DELETE';
      v_dados_antes := to_jsonb(OLD);
      v_dados_depois := NULL;
  END CASE;
  
  -- Inserir audit log
  PERFORM insert_audit_log(
    v_empresa_id,
    v_usuario_id,
    TG_TABLE_NAME,
    COALESCE((to_jsonb(NEW)->>'id')::uuid, (to_jsonb(OLD)->>'id')::uuid),
    v_acao,
    v_dados_antes,
    v_dados_depois
  );
  
  -- Retornar registro apropriado
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Aplicar trigger de auditoria em tabelas críticas
CREATE TRIGGER trg_audit_produtos AFTER INSERT OR UPDATE OR DELETE ON produtos FOR EACH ROW EXECUTE FUNCTION trigger_audit();
CREATE TRIGGER trg_audit_lotes AFTER INSERT OR UPDATE OR DELETE ON lotes FOR EACH ROW EXECUTE FUNCTION trigger_audit();
CREATE TRIGGER trg_audit_cirurgias AFTER INSERT OR UPDATE OR DELETE ON cirurgias FOR EACH ROW EXECUTE FUNCTION trigger_audit();
CREATE TRIGGER trg_audit_kits AFTER INSERT OR UPDATE OR DELETE ON kits FOR EACH ROW EXECUTE FUNCTION trigger_audit();
CREATE TRIGGER trg_audit_itens_kit AFTER INSERT OR UPDATE OR DELETE ON itens_kit FOR EACH ROW EXECUTE FUNCTION trigger_audit();
CREATE TRIGGER trg_audit_transacoes AFTER INSERT OR UPDATE OR DELETE ON transacoes FOR EACH ROW EXECUTE FUNCTION trigger_audit();
CREATE TRIGGER trg_audit_faturas AFTER INSERT OR UPDATE OR DELETE ON faturas FOR EACH ROW EXECUTE FUNCTION trigger_audit();

COMMENT ON FUNCTION trigger_audit IS 'Trigger genérico para auditoria com hash chain';

-- ============================================
-- LGPD: Funções de Compliance
-- ============================================

-- Função: Exportar dados do usuário (Art. 18 LGPD)
CREATE OR REPLACE FUNCTION exportar_dados_usuario(p_usuario_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_resultado JSONB;
BEGIN
  -- Verificar permissão (próprio usuário ou admin)
  IF auth.uid() != p_usuario_id AND auth.current_perfil() != 'admin' THEN
    RAISE EXCEPTION 'Sem permissão para exportar dados de outro usuário';
  END IF;
  
  -- Agregar dados do usuário
  SELECT jsonb_build_object(
    'usuario', (SELECT row_to_json(u.*) FROM usuarios u WHERE u.id = p_usuario_id),
    'leads_responsavel', (SELECT jsonb_agg(row_to_json(l.*)) FROM leads l WHERE l.responsavel_id = p_usuario_id AND l.excluido_em IS NULL),
    'audit_log', (SELECT jsonb_agg(row_to_json(a.*)) FROM audit_log a WHERE a.usuario_id = p_usuario_id ORDER BY a.criado_em DESC LIMIT 100)
  ) INTO v_resultado;
  
  RETURN v_resultado;
END;
$$;

-- Função: Anonimizar dados do usuário (LGPD)
CREATE OR REPLACE FUNCTION anonimizar_dados_usuario(p_usuario_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar permissão (admin apenas)
  IF auth.current_perfil() != 'admin' THEN
    RAISE EXCEPTION 'Apenas admins podem anonimizar usuários';
  END IF;
  
  -- Anonimizar dados sensíveis
  UPDATE usuarios
  SET
    nome_completo = 'Usuário Anonimizado',
    email = CONCAT('anonimizado_', id::text, '@example.com'),
    avatar_url = NULL,
    excluido_em = NOW()
  WHERE id = p_usuario_id;
  
  -- Limpar leads associados
  UPDATE leads
  SET responsavel_id = NULL
  WHERE responsavel_id = p_usuario_id;
  
  RAISE NOTICE 'Usuário % anonimizado com sucesso', p_usuario_id;
END;
$$;

COMMENT ON FUNCTION exportar_dados_usuario IS 'Exporta dados do usuário (Art. 18 LGPD - portabilidade)';
COMMENT ON FUNCTION anonimizar_dados_usuario IS 'Anonimiza dados do usuário (LGPD - direito ao esquecimento)';

-- ============================================
-- ANVISA: Validações de rastreabilidade
-- ============================================

-- Função: Validar lote (verificar validade + registro)
CREATE OR REPLACE FUNCTION validar_lote(p_lote_id UUID)
RETURNS TABLE(
  valido BOOLEAN,
  motivo TEXT,
  lote_id UUID,
  produto_descricao TEXT,
  numero_lote TEXT,
  data_validade DATE,
  registro_anvisa TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    CASE
      WHEN l.data_validade < CURRENT_DATE THEN FALSE
      WHEN p.registro_anvisa IS NULL THEN FALSE
      WHEN l.status = 'bloqueado' THEN FALSE
      WHEN l.quantidade_disponivel <= 0 THEN FALSE
      ELSE TRUE
    END AS valido,
    CASE
      WHEN l.data_validade < CURRENT_DATE THEN 'Lote vencido'
      WHEN p.registro_anvisa IS NULL THEN 'Produto sem registro ANVISA'
      WHEN l.status = 'bloqueado' THEN 'Lote bloqueado'
      WHEN l.quantidade_disponivel <= 0 THEN 'Lote sem estoque'
      ELSE 'Lote válido'
    END AS motivo,
    l.id AS lote_id,
    p.descricao AS produto_descricao,
    l.numero_lote,
    l.data_validade,
    COALESCE(l.registro_anvisa, p.registro_anvisa) AS registro_anvisa
  FROM lotes l
  JOIN produtos p ON l.produto_id = p.id
  WHERE l.id = p_lote_id;
END;
$$;

-- Função: Bloquear lotes vencidos (job diário)
CREATE OR REPLACE FUNCTION bloquear_lotes_vencidos()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE lotes
  SET status = 'vencido'
  WHERE data_validade < CURRENT_DATE
    AND status NOT IN ('vencido', 'consumido')
    AND excluido_em IS NULL;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  RAISE NOTICE '% lotes marcados como vencidos', v_count;
  RETURN v_count;
END;
$$;

COMMENT ON FUNCTION validar_lote IS 'Valida lote (validade + registro ANVISA + disponibilidade)';
COMMENT ON FUNCTION bloquear_lotes_vencidos IS 'Bloqueia lotes vencidos (executar diariamente via cron)';

-- ============================================
-- NEGÓCIO: Funções operacionais
-- ============================================

-- Função: Reservar kit (decrementa estoque)
CREATE OR REPLACE FUNCTION reservar_kit(p_kit_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_item RECORD;
  v_lote_valido BOOLEAN;
BEGIN
  -- Validar status do kit
  IF NOT EXISTS (
    SELECT 1 FROM kits
    WHERE id = p_kit_id AND status = 'planejamento' AND excluido_em IS NULL
  ) THEN
    RAISE EXCEPTION 'Kit não está em status planejamento ou não existe';
  END IF;
  
  -- Iterar sobre itens do kit
  FOR v_item IN
    SELECT ik.id, ik.lote_id, ik.quantidade
    FROM itens_kit ik
    WHERE ik.kit_id = p_kit_id
  LOOP
    -- Validar lote
    SELECT valido INTO v_lote_valido
    FROM validar_lote(v_item.lote_id);
    
    IF NOT v_lote_valido THEN
      RAISE EXCEPTION 'Lote % inválido para reserva', v_item.lote_id;
    END IF;
    
    -- Decrementar estoque
    UPDATE lotes
    SET
      quantidade_disponivel = quantidade_disponivel - v_item.quantidade,
      status = CASE
        WHEN quantidade_disponivel - v_item.quantidade <= 0 THEN 'reservado'
        ELSE status
      END
    WHERE id = v_item.lote_id;
  END LOOP;
  
  -- Atualizar status do kit
  UPDATE kits
  SET status = 'reservado'
  WHERE id = p_kit_id;
  
  RETURN TRUE;
END;
$$;

-- Função: Consumir kit (marca como consumido)
CREATE OR REPLACE FUNCTION consumir_kit(
  p_kit_id UUID,
  p_quantidades_consumidas JSONB -- {item_kit_id: quantidade}
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_item_id UUID;
  v_qtd_consumida INTEGER;
BEGIN
  -- Validar status do kit
  IF NOT EXISTS (
    SELECT 1 FROM kits
    WHERE id = p_kit_id AND status IN ('reservado', 'montado', 'despachado') AND excluido_em IS NULL
  ) THEN
    RAISE EXCEPTION 'Kit não está em status válido para consumo';
  END IF;
  
  -- Atualizar quantidades consumidas
  FOR v_item_id, v_qtd_consumida IN
    SELECT * FROM jsonb_each_text(p_quantidades_consumidas)
  LOOP
    UPDATE itens_kit
    SET quantidade_consumida = v_qtd_consumida::integer
    WHERE id = v_item_id::uuid AND kit_id = p_kit_id;
    
    -- Marcar lote como consumido se quantidade zerada
    UPDATE lotes l
    SET status = 'consumido'
    WHERE l.id IN (
      SELECT lote_id FROM itens_kit
      WHERE id = v_item_id::uuid
    ) AND l.quantidade_disponivel = 0;
  END LOOP;
  
  -- Atualizar kit
  UPDATE kits
  SET
    status = 'consumido',
    data_consumo = NOW()
  WHERE id = p_kit_id;
  
  RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION reservar_kit IS 'Reserva kit e decrementa estoque de lotes';
COMMENT ON FUNCTION consumir_kit IS 'Marca kit como consumido e atualiza quantidades';

-- ============================================
-- FUNÇÃO: Verificar integridade do hash chain
-- ============================================
CREATE OR REPLACE FUNCTION verificar_integridade_audit_log()
RETURNS TABLE(
  registro_id UUID,
  hash_esperado TEXT,
  hash_registrado TEXT,
  integro BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH audit_ordenado AS (
    SELECT
      id,
      empresa_id,
      usuario_id,
      tabela,
      registro_id AS reg_id,
      acao,
      dados_antes,
      dados_depois,
      hash_anterior,
      hash_atual,
      LAG(hash_atual) OVER (ORDER BY criado_em, id) AS hash_anterior_real
    FROM audit_log
    ORDER BY criado_em, id
  )
  SELECT
    ao.id AS registro_id,
    ao.hash_anterior_real AS hash_esperado,
    ao.hash_anterior AS hash_registrado,
    COALESCE(ao.hash_anterior = ao.hash_anterior_real, ao.hash_anterior IS NULL) AS integro
  FROM audit_ordenado ao
  WHERE ao.hash_anterior_real IS NOT NULL;
END;
$$;

COMMENT ON FUNCTION verificar_integridade_audit_log IS 'Verifica integridade da cadeia de hashes (blockchain-like)';

-- ============================================
-- TRIGGER: Validar criação de cirurgia
-- ============================================
CREATE OR REPLACE FUNCTION validar_cirurgia()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Validar data futura
  IF NEW.data_cirurgia < CURRENT_DATE THEN
    RAISE EXCEPTION 'Data da cirurgia não pode ser no passado';
  END IF;
  
  -- Validar médico ativo
  IF NEW.medico_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM medicos
      WHERE id = NEW.medico_id AND status = 'ativo' AND excluido_em IS NULL
    ) THEN
      RAISE EXCEPTION 'Médico inativo ou inexistente';
    END IF;
  END IF;
  
  -- Validar hospital ativo
  IF NEW.hospital_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM hospitais
      WHERE id = NEW.hospital_id AND status = 'ativo' AND excluido_em IS NULL
    ) THEN
      RAISE EXCEPTION 'Hospital inativo ou inexistente';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validar_cirurgia
  BEFORE INSERT OR UPDATE ON cirurgias
  FOR EACH ROW
  EXECUTE FUNCTION validar_cirurgia();

COMMENT ON FUNCTION validar_cirurgia IS 'Valida dados da cirurgia antes de INSERT/UPDATE';

