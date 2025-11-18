-- ╔════════════════════════════════════════════════════════════════════════╗
-- ║  ICARUS v5.0 - Bloco 02 de 10                                          ║
-- ║  Linhas: 6289 → 12576                                                      ║
-- ╚════════════════════════════════════════════════════════════════════════╝

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



-- ============================================
-- Source: 0005_storage_policies.sql
-- ============================================

-- ============================================
-- Migration 0005: Storage Policies
-- Data: 2025-10-18
-- Versão: 1.0
-- Autor: Agente Sênior BD
-- ============================================
-- Descrição:
-- - Buckets para documentos (NF-e, romaneios, DANFE)
-- - Policies RLS multi-tenant para storage
-- - Validação de tipo/tamanho de arquivo
-- - Nomenclatura padronizada
-- ============================================

-- ============================================
-- BUCKET: documentos_cirurgias
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documentos_cirurgias',
  'documentos_cirurgias',
  FALSE, -- Privado
  10485760, -- 10MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/xml']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- BUCKET: documentos_fiscais
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documentos_fiscais',
  'documentos_fiscais',
  FALSE,
  52428800, -- 50MB (XML NF-e pode ser grande)
  ARRAY['application/pdf', 'application/xml', 'text/xml']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- BUCKET: anexos_produtos
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'anexos_produtos',
  'anexos_produtos',
  FALSE,
  5242880, -- 5MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- BUCKET: avatares (público)
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatares',
  'avatares',
  TRUE, -- Público
  1048576, -- 1MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- POLICIES: documentos_cirurgias
-- ============================================

-- SELECT: Mesma empresa
CREATE POLICY pol_storage_cirurgias_select
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documentos_cirurgias' AND
    (storage.foldername(name))[1] = public.current_empresa()::text
  );

-- INSERT: Admin, operador
CREATE POLICY pol_storage_cirurgias_insert
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documentos_cirurgias' AND
    (storage.foldername(name))[1] = public.current_empresa()::text AND
    public.current_perfil() IN ('admin', 'operador')
  );

-- UPDATE: Admin, operador
CREATE POLICY pol_storage_cirurgias_update
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'documentos_cirurgias' AND
    (storage.foldername(name))[1] = public.current_empresa()::text AND
    public.current_perfil() IN ('admin', 'operador')
  );

-- DELETE: Admin apenas
CREATE POLICY pol_storage_cirurgias_delete
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'documentos_cirurgias' AND
    (storage.foldername(name))[1] = public.current_empresa()::text AND
    public.current_perfil() = 'admin'
  );

-- ============================================
-- POLICIES: documentos_fiscais
-- ============================================

-- SELECT: Admin, financeiro
CREATE POLICY pol_storage_fiscais_select
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documentos_fiscais' AND
    (storage.foldername(name))[1] = public.current_empresa()::text AND
    public.current_perfil() IN ('admin', 'financeiro')
  );

-- INSERT: Admin, financeiro
CREATE POLICY pol_storage_fiscais_insert
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documentos_fiscais' AND
    (storage.foldername(name))[1] = public.current_empresa()::text AND
    public.current_perfil() IN ('admin', 'financeiro')
  );

-- UPDATE: Admin, financeiro
CREATE POLICY pol_storage_fiscais_update
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'documentos_fiscais' AND
    (storage.foldername(name))[1] = public.current_empresa()::text AND
    public.current_perfil() IN ('admin', 'financeiro')
  );

-- DELETE: Admin apenas
CREATE POLICY pol_storage_fiscais_delete
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'documentos_fiscais' AND
    (storage.foldername(name))[1] = public.current_empresa()::text AND
    public.current_perfil() = 'admin'
  );

-- ============================================
-- POLICIES: anexos_produtos
-- ============================================

-- SELECT: Mesma empresa
CREATE POLICY pol_storage_produtos_select
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'anexos_produtos' AND
    (storage.foldername(name))[1] = public.current_empresa()::text
  );

-- INSERT: Admin, comercial, estoque
CREATE POLICY pol_storage_produtos_insert
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'anexos_produtos' AND
    (storage.foldername(name))[1] = public.current_empresa()::text AND
    public.current_perfil() IN ('admin', 'comercial', 'estoque')
  );

-- UPDATE: Admin, comercial, estoque
CREATE POLICY pol_storage_produtos_update
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'anexos_produtos' AND
    (storage.foldername(name))[1] = public.current_empresa()::text AND
    public.current_perfil() IN ('admin', 'comercial', 'estoque')
  );

-- DELETE: Admin apenas
CREATE POLICY pol_storage_produtos_delete
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'anexos_produtos' AND
    (storage.foldername(name))[1] = public.current_empresa()::text AND
    public.current_perfil() = 'admin'
  );

-- ============================================
-- POLICIES: avatares (público)
-- ============================================

-- SELECT: Público
CREATE POLICY pol_storage_avatares_select
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatares');

-- INSERT: Próprio usuário
CREATE POLICY pol_storage_avatares_insert
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatares' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- UPDATE: Próprio usuário
CREATE POLICY pol_storage_avatares_update
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatares' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- DELETE: Próprio usuário
CREATE POLICY pol_storage_avatares_delete
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatares' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================
-- FUNÇÃO: Validar upload de arquivo
-- ============================================
CREATE OR REPLACE FUNCTION validar_upload_arquivo(
  p_bucket TEXT,
  p_nome_arquivo TEXT,
  p_tamanho BIGINT,
  p_mime_type TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_bucket_config RECORD;
  v_mime_permitido BOOLEAN;
BEGIN
  -- Buscar configuração do bucket
  SELECT * INTO v_bucket_config
  FROM storage.buckets
  WHERE id = p_bucket;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Bucket % não existe', p_bucket;
  END IF;
  
  -- Validar tamanho
  IF p_tamanho > v_bucket_config.file_size_limit THEN
    RAISE EXCEPTION 'Arquivo excede tamanho máximo de % bytes', v_bucket_config.file_size_limit;
  END IF;
  
  -- Validar MIME type
  IF v_bucket_config.allowed_mime_types IS NOT NULL THEN
    SELECT p_mime_type = ANY(v_bucket_config.allowed_mime_types) INTO v_mime_permitido;
    
    IF NOT v_mime_permitido THEN
      RAISE EXCEPTION 'Tipo de arquivo % não permitido no bucket %', p_mime_type, p_bucket;
    END IF;
  END IF;
  
  RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION validar_upload_arquivo IS 'Valida upload de arquivo (tamanho + MIME type)';

-- ============================================
-- FUNÇÃO: Gerar caminho padronizado para storage
-- ============================================
CREATE OR REPLACE FUNCTION gerar_caminho_storage(
  p_empresa_id UUID,
  p_entidade TEXT,
  p_registro_id UUID,
  p_extensao TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_caminho TEXT;
  v_timestamp TEXT;
BEGIN
  -- Formato: empresa_id/entidade/registro_id/timestamp.extensao
  v_timestamp := TO_CHAR(NOW(), 'YYYYMMDD_HH24MISS');
  v_caminho := CONCAT(
    p_empresa_id::text,
    '/',
    p_entidade,
    '/',
    p_registro_id::text,
    '/',
    v_timestamp,
    '.',
    p_extensao
  );
  
  RETURN v_caminho;
END;
$$;

COMMENT ON FUNCTION gerar_caminho_storage IS 'Gera caminho padronizado: empresa_id/entidade/registro_id/timestamp.ext';

-- ============================================
-- COMENTÁRIOS
-- ============================================
COMMENT ON POLICY pol_storage_cirurgias_select ON storage.objects IS 'Isolamento multi-tenant para documentos de cirurgias';
COMMENT ON POLICY pol_storage_fiscais_select ON storage.objects IS 'Apenas financeiro/admin acessam documentos fiscais';
COMMENT ON POLICY pol_storage_avatares_insert ON storage.objects IS 'Usuário pode fazer upload apenas do próprio avatar';



-- ============================================
-- Source: 0006_seed_minimo.sql
-- ============================================

-- ============================================
-- Migration 0006: Seed Mínimo
-- Data: 2025-10-18
-- Versão: 1.0
-- Autor: Agente Sênior BD
-- ============================================
-- Descrição:
-- - Dados mínimos para desenvolvimento/teste
-- - Empresa de demonstração
-- - Produtos e lotes OPME exemplo
-- - Médicos e hospitais demo
-- - NÃO executar em produção
-- ============================================

-- ============================================
-- EMPRESA DEMO
-- ============================================
INSERT INTO empresas (
  id,
  nome,
  razao_social,
  cnpj,
  inscricao_estadual,
  licenca_anvisa,
  email,
  telefone,
  cidade,
  estado,
  status
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'ICARUS Distribuidora OPME',
  'ICARUS Distribuidora de Materiais OPME Ltda',
  '12.345.678/0001-90',
  '123.456.789.123',
  'ANV-123456',
  'contato@icarus-opme.com.br',
  '(11) 3456-7890',
  'São Paulo',
  'SP',
  'ativa'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- PRODUTOS OPME DEMO
-- ============================================
INSERT INTO produtos (id, empresa_id, codigo_sku, descricao, fabricante, registro_anvisa, categoria, valor_unitario, status) VALUES
-- Ortopedia
('00000001-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', 'ORT-001', 'Prótese de Joelho Total - Modelo Advanced', 'Stryker', '80149300234', 'Ortopedia', 18500.00, 'ativo'),
('00000001-0001-0001-0001-000000000002', '11111111-1111-1111-1111-111111111111', 'ORT-002', 'Placa de Fixação Coluna Cervical', 'DePuy Synthes', '80149300567', 'Ortopedia', 12800.00, 'ativo'),
('00000001-0001-0001-0001-000000000003', '11111111-1111-1111-1111-111111111111', 'ORT-003', 'Parafuso Pedicular Titânio 6.5mm', 'Medtronic', '80149300891', 'Ortopedia', 450.00, 'ativo'),
-- Cardiologia
('00000001-0001-0001-0001-000000000004', '11111111-1111-1111-1111-111111111111', 'CAR-001', 'Stent Coronário Drug-Eluting 3.0x18mm', 'Abbott', '80340100123', 'Cardiologia', 9200.00, 'ativo'),
('00000001-0001-0001-0001-000000000005', '11111111-1111-1111-1111-111111111111', 'CAR-002', 'Balão de Angioplastia 3.5x20mm', 'Boston Scientific', '80340100456', 'Cardiologia', 2800.00, 'ativo'),
-- Neurocirurgia
('00000001-0001-0001-0001-000000000006', '11111111-1111-1111-1111-111111111111', 'NEU-001', 'Sistema de Derivação Ventricular Programável', 'Medtronic', '80342300789', 'Neurocirurgia', 15600.00, 'ativo')
ON CONFLICT (empresa_id, codigo_sku) DO NOTHING;

-- ============================================
-- LOTES OPME DEMO
-- ============================================
INSERT INTO lotes (produto_id, numero_lote, numero_serie, data_fabricacao, data_validade, quantidade_inicial, quantidade_disponivel, status) VALUES
-- Prótese Joelho
('00000001-0001-0001-0001-000000000001', 'LOT2024-001', 'SN-PKA-2024-001', '2024-01-15', '2029-01-15', 5, 5, 'disponivel'),
('00000001-0001-0001-0001-000000000001', 'LOT2024-002', 'SN-PKA-2024-002', '2024-02-20', '2029-02-20', 3, 3, 'disponivel'),
-- Placa Coluna
('00000001-0001-0001-0001-000000000002', 'LOT2024-010', 'SN-PFC-2024-010', '2024-03-10', '2029-03-10', 10, 10, 'disponivel'),
-- Parafusos
('00000001-0001-0001-0001-000000000003', 'LOT2024-050', NULL, '2024-04-05', '2028-04-05', 100, 98, 'disponivel'),
-- Stents
('00000001-0001-0001-0001-000000000004', 'LOT2024-100', 'SN-STN-2024-100', '2024-05-12', '2027-05-12', 20, 18, 'disponivel'),
('00000001-0001-0001-0001-000000000004', 'LOT2024-101', 'SN-STN-2024-101', '2024-06-08', '2027-06-08', 15, 15, 'disponivel'),
-- Balões
('00000001-0001-0001-0001-000000000005', 'LOT2024-150', NULL, '2024-07-15', '2026-07-15', 50, 47, 'disponivel'),
-- Derivação
('00000001-0001-0001-0001-000000000006', 'LOT2024-200', 'SN-DVP-2024-200', '2024-08-20', '2029-08-20', 8, 8, 'disponivel')
ON CONFLICT (produto_id, numero_lote, numero_serie) DO NOTHING;

-- ============================================
-- MÉDICOS DEMO
-- ============================================
INSERT INTO medicos (empresa_id, nome, crm, crm_uf, especialidade, telefone, email, hospital_principal, status) VALUES
('11111111-1111-1111-1111-111111111111', 'Dr. Roberto Silva Santos', '123456', 'SP', 'Ortopedia', '(11) 98765-4321', 'roberto.silva@hospital.com', 'Hospital São Lucas', 'ativo'),
('11111111-1111-1111-1111-111111111111', 'Dra. Ana Paula Costa', '234567', 'SP', 'Cardiologia', '(11) 97654-3210', 'ana.costa@hospital.com', 'Hospital Sírio-Libanês', 'ativo'),
('11111111-1111-1111-1111-111111111111', 'Dr. Carlos Eduardo Mendes', '345678', 'SP', 'Neurocirurgia', '(11) 96543-2109', 'carlos.mendes@hospital.com', 'Hospital Israelita Albert Einstein', 'ativo'),
('11111111-1111-1111-1111-111111111111', 'Dra. Maria Santos Oliveira', '456789', 'RJ', 'Ortopedia', '(21) 95432-1098', 'maria.santos@hospital.com', 'Hospital Copa D''Or', 'ativo')
ON CONFLICT (empresa_id, crm, crm_uf) DO NOTHING;

-- ============================================
-- HOSPITAIS DEMO
-- ============================================
INSERT INTO hospitais (empresa_id, nome, cnpj, cidade, estado, tipo, status) VALUES
('11111111-1111-1111-1111-111111111111', 'Hospital São Lucas', '12.345.678/0001-10', 'São Paulo', 'SP', 'hospital', 'ativo'),
('11111111-1111-1111-1111-111111111111', 'Hospital Sírio-Libanês', '23.456.789/0001-11', 'São Paulo', 'SP', 'hospital', 'ativo'),
('11111111-1111-1111-1111-111111111111', 'Hospital Israelita Albert Einstein', '34.567.890/0001-12', 'São Paulo', 'SP', 'hospital', 'ativo'),
('11111111-1111-1111-1111-111111111111', 'Hospital Copa D''Or', '45.678.900/0001-13', 'Rio de Janeiro', 'RJ', 'hospital', 'ativo'),
('11111111-1111-1111-1111-111111111111', 'Centro Cirúrgico Avançado', '56.789.012/0001-14', 'São Paulo', 'SP', 'centro_cirurgico', 'ativo')
ON CONFLICT (empresa_id, cnpj) DO NOTHING;

-- ============================================
-- FORNECEDORES DEMO
-- ============================================
INSERT INTO fornecedores (empresa_id, nome, cnpj, categoria, rating, status) VALUES
('11111111-1111-1111-1111-111111111111', 'Stryker do Brasil', '10.123.456/0001-90', 'Ortopedia', 4.8, 'ativo'),
('11111111-1111-1111-1111-111111111111', 'DePuy Synthes Brasil', '20.234.567/0001-91', 'Ortopedia', 4.7, 'ativo'),
('11111111-1111-1111-1111-111111111111', 'Medtronic Brasil', '30.345.678/0001-92', 'Cardiologia', 4.9, 'ativo'),
('11111111-1111-1111-1111-111111111111', 'Abbott Vascular Brasil', '40.456.789/0001-93', 'Cardiologia', 4.6, 'ativo')
ON CONFLICT (empresa_id, cnpj) DO NOTHING;

-- ============================================
-- CIRURGIAS DEMO (próximas 7 dias)
-- ============================================
INSERT INTO cirurgias (
  empresa_id,
  codigo_interno,
  medico_id,
  hospital_id,
  paciente_iniciais,
  procedimento,
  data_cirurgia,
  hora_cirurgia,
  sala,
  status,
  prioridade,
  valor_estimado
) VALUES
(
  '11111111-1111-1111-1111-111111111111',
  'CIR-2025-001',
  (SELECT id FROM medicos WHERE crm = '123456' AND crm_uf = 'SP' LIMIT 1),
  (SELECT id FROM hospitais WHERE nome = 'Hospital São Lucas' LIMIT 1),
  'J.S.',
  'Artroplastia Total de Joelho',
  CURRENT_DATE + INTERVAL '2 days',
  '08:00',
  'Sala 3',
  'agendada',
  'media',
  22000.00
),
(
  '11111111-1111-1111-1111-111111111111',
  'CIR-2025-002',
  (SELECT id FROM medicos WHERE crm = '234567' AND crm_uf = 'SP' LIMIT 1),
  (SELECT id FROM hospitais WHERE nome = 'Hospital Sírio-Libanês' LIMIT 1),
  'M.A.',
  'Angioplastia Coronária com Stent',
  CURRENT_DATE + INTERVAL '3 days',
  '10:30',
  'Sala 1 - Hemodinâmica',
  'confirmada',
  'alta',
  12500.00
),
(
  '11111111-1111-1111-1111-111111111111',
  'CIR-2025-003',
  (SELECT id FROM medicos WHERE crm = '345678' AND crm_uf = 'SP' LIMIT 1),
  (SELECT id FROM hospitais WHERE nome = 'Hospital Israelita Albert Einstein' LIMIT 1),
  'R.P.',
  'Derivação Ventrículo-Peritoneal',
  CURRENT_DATE + INTERVAL '5 days',
  '14:00',
  'Sala 2',
  'agendada',
  'urgente',
  18900.00
)
ON CONFLICT (empresa_id, codigo_interno) DO NOTHING;

-- ============================================
-- COMENTÁRIOS
-- ============================================
COMMENT ON TABLE empresas IS 'Seed: 1 empresa demo';
COMMENT ON TABLE produtos IS 'Seed: 6 produtos OPME (ortopedia, cardiologia, neurocirurgia)';
COMMENT ON TABLE lotes IS 'Seed: 8 lotes com rastreabilidade ANVISA';
COMMENT ON TABLE medicos IS 'Seed: 4 médicos especialistas';
COMMENT ON TABLE hospitais IS 'Seed: 5 hospitais/centros cirúrgicos';
COMMENT ON TABLE cirurgias IS 'Seed: 3 cirurgias agendadas (próximos dias)';

-- ============================================
-- NOTA IMPORTANTE
-- ============================================
-- Este seed é para DESENVOLVIMENTO apenas.
-- Em produção, criar empresa real via signup.
-- UUIDs fixos facilitam testes, mas NÃO usar em prod.



-- ============================================
-- Source: 0007_dpo_encarregado.sql
-- ============================================

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

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_empresas_dpo_email ON empresas(dpo_email) WHERE dpo_email IS NOT NULL;

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



-- ============================================
-- Source: 0008_storage_icarus_new.sql
-- ============================================

-- ============================================
-- Migration: Storage Bucket icarus_new
-- Data: 2025-10-18
-- Versão: 1.1
-- Autor: Agente Sênior BD
-- ============================================
-- Descrição:
-- - Cria bucket icarus_new para armazenamento geral
-- - Policies RLS multi-tenant por empresa_id
-- - Estrutura de pastas: {empresa_id}/{categoria}/{arquivo}
-- ============================================

-- ============================================
-- 1. CRIAR BUCKET
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'icarus_new',
  'icarus_new',
  false, -- privado, requer autenticação
  52428800, -- 50MB limite por arquivo
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'text/plain'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================
-- 2. POLICIES RLS - SELECT (visualizar)
-- ============================================
CREATE POLICY "icarus_new_select_own_empresa"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'icarus_new' AND
  (storage.foldername(name))[1]::uuid = public.current_empresa()
);

-- ============================================
-- 3. POLICIES RLS - INSERT (upload)
-- ============================================
CREATE POLICY "icarus_new_insert_own_empresa"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'icarus_new' AND
  (storage.foldername(name))[1]::uuid = public.current_empresa()
);

-- ============================================
-- 4. POLICIES RLS - UPDATE (atualizar)
-- ============================================
CREATE POLICY "icarus_new_update_own_empresa"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'icarus_new' AND
  (storage.foldername(name))[1]::uuid = public.current_empresa()
)
WITH CHECK (
  bucket_id = 'icarus_new' AND
  (storage.foldername(name))[1]::uuid = public.current_empresa()
);

-- ============================================
-- 5. POLICIES RLS - DELETE (excluir)
-- ============================================
CREATE POLICY "icarus_new_delete_admin_only"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'icarus_new' AND
  (storage.foldername(name))[1]::uuid = public.current_empresa() AND
  public.current_perfil() IN ('admin', 'comercial')
);

-- ============================================
-- COMENTÁRIOS
-- ============================================
COMMENT ON POLICY "icarus_new_select_own_empresa" ON storage.objects IS 
  'Permite visualizar arquivos da própria empresa (multi-tenant)';

COMMENT ON POLICY "icarus_new_insert_own_empresa" ON storage.objects IS 
  'Permite upload de arquivos para a própria empresa';

COMMENT ON POLICY "icarus_new_delete_admin_only" ON storage.objects IS 
  'Permite exclusão apenas para admin e comercial';

-- ============================================
-- ESTRUTURA DE PASTAS SUGERIDA
-- ============================================
-- {empresa_id}/cirurgias/{cirurgia_id}/documento.pdf
-- {empresa_id}/produtos/{produto_id}/imagem.jpg
-- {empresa_id}/usuarios/{usuario_id}/avatar.png
-- {empresa_id}/documentos/contrato.pdf
-- {empresa_id}/nfe/{numero_nfe}.xml
-- {empresa_id}/nfe/{numero_nfe}.pdf



-- ============================================
-- Source: 0009_tutores_economia_corrigido.sql
-- ============================================

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 🚀 MIGRAÇÃO 0009 — TUTORES IA & ECONOMIA
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Data: 2025-10-20
-- Equipe: AGENTE_EQUIPE_ECONOMIA_AI_TUTORES
-- Objetivo: Criar tabelas para Feature Flags, RAG, Tutores IA e Compliance
-- Estratégia: IF NOT EXISTS para evitar conflitos
-- RLS: Removido (será implementado na Fase S4)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================
-- 0. EXTENSION VECTOR (DEVE VIR PRIMEIRO!)
-- ============================================

CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- 1. FEATURE FLAGS (A/B Testing)
-- ============================================

CREATE TABLE IF NOT EXISTS IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT false,
  rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  user_segments TEXT[],
  description TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE feature_flags IS 'Sistema de feature flags para A/B testing e rollout gradual';

-- ============================================
-- 2. BASE DE CONHECIMENTO (RAG)
-- ============================================

CREATE TABLE IF NOT EXISTS IF NOT EXISTS conhecimento_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  documento_id TEXT NOT NULL,
  conteudo_texto TEXT NOT NULL,
  embedding VECTOR(1536),
  categoria TEXT NOT NULL,
  modulo TEXT,
  tags TEXT[],
  url_origem TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_conhecimento_embedding ON conhecimento_base USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_conhecimento_categoria ON conhecimento_base(categoria);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_conhecimento_modulo ON conhecimento_base(modulo);

COMMENT ON TABLE conhecimento_base IS 'Base de conhecimento para RAG (Retrieval Augmented Generation)';

-- ============================================
-- 3. LOGS DE TUTORES IA
-- ============================================

CREATE TABLE IF NOT EXISTS IF NOT EXISTS tutor_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id),
  modulo TEXT NOT NULL,
  pergunta TEXT NOT NULL,
  resposta TEXT NOT NULL,
  feedback INTEGER CHECK (feedback >= 1 AND feedback <= 5),
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_tutor_logs_usuario ON tutor_logs(usuario_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_tutor_logs_modulo ON tutor_logs(modulo);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_tutor_logs_criado ON tutor_logs(criado_em DESC);

COMMENT ON TABLE tutor_logs IS 'Histórico de interações com tutores IA para melhoria contínua';

-- ============================================
-- 4. CERTIFICAÇÕES DE USUÁRIOS
-- ============================================

CREATE TABLE IF NOT EXISTS IF NOT EXISTS certificacoes_usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id),
  papel TEXT NOT NULL,
  data_certificacao TIMESTAMPTZ DEFAULT NOW(),
  data_validade TIMESTAMPTZ,
  evidencia_url TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_cert_usuario ON certificacoes_usuario(usuario_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_cert_validade ON certificacoes_usuario(data_validade);

COMMENT ON TABLE certificacoes_usuario IS 'Certificações e treinamentos dos usuários nos módulos';

-- ============================================
-- 5. ATUALIZAÇÕES DE LEGISLAÇÃO
-- ============================================

CREATE TABLE IF NOT EXISTS IF NOT EXISTS legislacao_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_publicacao DATE,
  link_oficial TEXT,
  impacto_modulos TEXT[],
  status TEXT DEFAULT 'pendente',
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_leg_data ON legislacao_updates(data_publicacao DESC);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_leg_status ON legislacao_updates(status);

COMMENT ON TABLE legislacao_updates IS 'Atualizações de legislação (ANVISA, RFB, etc) capturadas automaticamente';

-- ============================================
-- 6. NOTIFICAÇÕES DE LEGISLAÇÃO
-- ============================================

CREATE TABLE IF NOT EXISTS IF NOT EXISTS notificacoes_legislacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id),
  legislacao_id UUID REFERENCES legislacao_updates(id),
  lida BOOLEAN DEFAULT false,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_notif_usuario ON notificacoes_legislacao(usuario_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_notif_lida ON notificacoes_legislacao(lida);

COMMENT ON TABLE notificacoes_legislacao IS 'Notificações de mudanças legislativas para usuários';

-- ============================================
-- 7. ATUALIZAR TABELA EXISTENTE (se existir)
-- ============================================

DO $$
BEGIN
  -- Adicionar colunas em documentos_regulatorios se a tabela existir
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'documentos_regulatorios') THEN
    
    -- Adicionar coluna analise_ia_jsonb
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'documentos_regulatorios' 
        AND column_name = 'analise_ia_jsonb'
    ) THEN
      ALTER TABLE documentos_regulatorios ADD COLUMN analise_ia_jsonb JSONB;
    END IF;
    
    -- Adicionar coluna status_conformidade
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'documentos_regulatorios' 
        AND column_name = 'status_conformidade'
    ) THEN
      ALTER TABLE documentos_regulatorios ADD COLUMN status_conformidade TEXT;
    END IF;
    
  END IF;
END $$;

-- ============================================
-- 8. TRIGGERS DE UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em tabelas relevantes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_feature_flags_updated_at'
  ) THEN
    CREATE TRIGGER update_feature_flags_updated_at
      BEFORE UPDATE ON feature_flags
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_conhecimento_updated_at'
  ) THEN
    CREATE TRIGGER update_conhecimento_updated_at
      BEFORE UPDATE ON conhecimento_base
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_legislacao_updated_at'
  ) THEN
    CREATE TRIGGER update_legislacao_updated_at
      BEFORE UPDATE ON legislacao_updates
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ============================================
-- ✅ MIGRAÇÃO CONCLUÍDA
-- ============================================

-- Verificação final
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN (
      'feature_flags',
      'conhecimento_base',
      'tutor_logs',
      'certificacoes_usuario',
      'legislacao_updates',
      'notificacoes_legislacao'
    );
  
  RAISE NOTICE 'Migração 0009 concluída! Tabelas criadas: %', table_count;
  RAISE NOTICE 'RLS será implementado na Fase S4 (Auth & Security)';
END $$;


-- ============================================
-- Source: 0010_fulltext_search.sql
-- ============================================

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 🔍 MIGRAÇÃO 0010 — FULL-TEXT SEARCH (PostgreSQL)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Data: 2025-10-20
-- Objetivo: Implementar busca nativa PostgreSQL (sem Meilisearch/Docker)
-- Substitui: Meilisearch
-- Economia: US$ 600-1.2k/ano
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================
-- 1. HABILITAR EXTENSÕES
-- ============================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;  -- Trigram similarity
CREATE EXTENSION IF NOT EXISTS unaccent; -- Remove acentos

-- ============================================
-- 2. CRIAR ÍNDICES FULL-TEXT SEARCH
-- ============================================

-- Índice para conhecimento_base (busca em português)
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_conhecimento_fts 
ON conhecimento_base 
USING GIN (to_tsvector('portuguese', conteudo_texto));

-- Índice trigram para busca aproximada
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_conhecimento_trgm 
ON conhecimento_base 
USING GIN (conteudo_texto gin_trgm_ops);

-- Índice para legislacao_updates
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_legislacao_fts 
ON legislacao_updates 
USING GIN (to_tsvector('portuguese', 
  COALESCE(titulo, '') || ' ' || COALESCE(descricao, '')));

-- ============================================
-- 3. FUNÇÃO DE BUSCA INTELIGENTE
-- ============================================

CREATE OR REPLACE FUNCTION buscar_conhecimento(
  query_text TEXT,
  limit_results INTEGER DEFAULT 10,
  min_rank REAL DEFAULT 0.1
)
RETURNS TABLE (
  id UUID,
  documento_id TEXT,
  conteudo_texto TEXT,
  categoria TEXT,
  modulo TEXT,
  rank REAL,
  relevancia TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cb.id,
    cb.documento_id,
    cb.conteudo_texto,
    cb.categoria,
    cb.modulo,
    ts_rank(
      to_tsvector('portuguese', cb.conteudo_texto), 
      plainto_tsquery('portuguese', query_text)
    ) as rank,
    CASE 
      WHEN ts_rank(to_tsvector('portuguese', cb.conteudo_texto), 
                   plainto_tsquery('portuguese', query_text)) > 0.5 
        THEN 'alta'
      WHEN ts_rank(to_tsvector('portuguese', cb.conteudo_texto), 
                   plainto_tsquery('portuguese', query_text)) > 0.2 
        THEN 'media'
      ELSE 'baixa'
    END as relevancia
  FROM conhecimento_base cb
  WHERE to_tsvector('portuguese', cb.conteudo_texto) 
        @@ plainto_tsquery('portuguese', query_text)
        AND ts_rank(to_tsvector('portuguese', cb.conteudo_texto), 
                    plainto_tsquery('portuguese', query_text)) >= min_rank
  ORDER BY rank DESC
  LIMIT limit_results;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION buscar_conhecimento IS 'Busca full-text em português na base de conhecimento com ranking';

-- ============================================
-- 4. FUNÇÃO DE BUSCA APROXIMADA (TYPOS)
-- ============================================

CREATE OR REPLACE FUNCTION buscar_similar(
  query_text TEXT,
  min_similarity REAL DEFAULT 0.3,
  limit_results INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  documento_id TEXT,
  conteudo_texto TEXT,
  categoria TEXT,
  modulo TEXT,
  similarity REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cb.id,
    cb.documento_id,
    cb.conteudo_texto,
    cb.categoria,
    cb.modulo,
    similarity(cb.conteudo_texto, query_text) as similarity
  FROM conhecimento_base cb
  WHERE cb.conteudo_texto % query_text
        AND similarity(cb.conteudo_texto, query_text) >= min_similarity
  ORDER BY similarity DESC
  LIMIT limit_results;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION buscar_similar IS 'Busca por similaridade (tolera typos)';

-- ============================================
-- 5. FUNÇÃO DE BUSCA EM LEGISLAÇÃO
-- ============================================

CREATE OR REPLACE FUNCTION buscar_legislacao(
  query_text TEXT,
  limit_results INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  titulo TEXT,
  descricao TEXT,
  data_publicacao DATE,
  link_oficial TEXT,
  impacto_modulos TEXT[],
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    lu.id,
    lu.titulo,
    lu.descricao,
    lu.data_publicacao,
    lu.link_oficial,
    lu.impacto_modulos,
    ts_rank(
      to_tsvector('portuguese', 
        COALESCE(lu.titulo, '') || ' ' || COALESCE(lu.descricao, '')), 
      plainto_tsquery('portuguese', query_text)
    ) as rank
  FROM legislacao_updates lu
  WHERE to_tsvector('portuguese', 
        COALESCE(lu.titulo, '') || ' ' || COALESCE(lu.descricao, '')) 
        @@ plainto_tsquery('portuguese', query_text)
  ORDER BY rank DESC, lu.data_publicacao DESC
  LIMIT limit_results;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION buscar_legislacao IS 'Busca full-text em atualizações de legislação';

-- ============================================
-- 6. VIEW MATERIALIZADA PARA PERFORMANCE
-- ============================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_busca_rapida AS
SELECT 
  id,
  documento_id,
  conteudo_texto,
  categoria,
  modulo,
  to_tsvector('portuguese', conteudo_texto) as tsv
FROM conhecimento_base;

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_mv_busca_fts 
ON mv_busca_rapida USING GIN (tsv);

-- Função para refresh da view
CREATE OR REPLACE FUNCTION refresh_busca_cache()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_busca_rapida;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION refresh_busca_cache IS 'Atualiza cache de busca (executar periodicamente)';

-- ============================================
-- 7. FUNÇÃO DE AUTOCOMPLETE/SUGESTÕES
-- ============================================

CREATE OR REPLACE FUNCTION sugerir_termos(
  prefix_text TEXT,
  limit_results INTEGER DEFAULT 5
)
RETURNS TABLE (
  sugestao TEXT,
  frequencia BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    word as sugestao,
    COUNT(*) as frequencia
  FROM (
    SELECT unnest(tsvector_to_array(to_tsvector('portuguese', conteudo_texto))) as word
    FROM conhecimento_base
  ) words
  WHERE word LIKE prefix_text || '%'
  GROUP BY word
  ORDER BY frequencia DESC, word
  LIMIT limit_results;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION sugerir_termos IS 'Autocomplete de termos de busca';

-- ============================================
-- ✅ MIGRAÇÃO CONCLUÍDA
-- ============================================

DO $$
DECLARE
  index_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%_fts';
  
  RAISE NOTICE 'Migração 0010 concluída! Índices FTS criados: %', index_count;
  RAISE NOTICE 'Substituindo Meilisearch por PostgreSQL FTS (economia: US$ 600-1.2k/ano)';
END $$;



-- ============================================
-- Source: 0011_cadastros_completo.sql
-- ============================================

-- ============================================================================
-- MIGRATION: Cadastros Completos (Médicos, Hospitais, Pacientes, Convênios)
-- Versão: 5.0.0
-- Data: Outubro 2025
-- Descrição: Estrutura completa para Gestão de Cadastros Inteligentes
-- ============================================================================

-- ============================================================================
-- 1. TABELA: pacientes
-- ============================================================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS pacientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  
  -- Dados Pessoais
  nome_completo TEXT NOT NULL,
  cpf TEXT,
  rg TEXT,
  data_nascimento DATE NOT NULL,
  sexo TEXT CHECK (sexo IN ('M', 'F', 'Outro')),
  estado_civil TEXT CHECK (estado_civil IN ('solteiro', 'casado', 'divorciado', 'viuvo', 'uniao_estavel')),
  
  -- Filiação
  nome_mae TEXT NOT NULL,
  nome_pai TEXT,
  
  -- Contato
  telefone TEXT,
  celular TEXT,
  email TEXT,
  
  -- Endereço (JSONB)
  endereco JSONB,
  
  -- Dados do Convênio
  convenio_id UUID REFERENCES convenios(id),
  numero_carteirinha TEXT,
  validade_plano DATE,
  plano TEXT,
  tipo_atendimento TEXT CHECK (tipo_atendimento IN ('ambulatorial', 'hospitalar', 'completo')),
  
  -- Informações Médicas
  grupo_sanguineo TEXT,
  alergias TEXT,
  medicamentos_uso TEXT,
  observacoes_saude TEXT,
  
  -- Metadados
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  consentimento_lgpd BOOLEAN DEFAULT false,
  consentimento_lgpd_data TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES usuarios(id),
  updated_by UUID REFERENCES usuarios(id),
  
  -- Índices e Constraints
  CONSTRAINT pacientes_numero_carteirinha_convenio_uk UNIQUE (numero_carteirinha, convenio_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_pacientes_empresa ON pacientes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_cpf ON pacientes(cpf) WHERE cpf IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pacientes_nome ON pacientes USING gin(to_tsvector('portuguese', nome_completo));
CREATE INDEX IF NOT EXISTS idx_pacientes_convenio ON pacientes(convenio_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_ativo ON pacientes(ativo);

-- Trigger para updated_at
CREATE TRIGGER pacientes_updated_at BEFORE UPDATE ON pacientes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE pacientes IS 'Cadastro de pacientes para cirurgias OPME';

-- ============================================================================
-- 2. TABELA: convenios
-- ============================================================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS convenios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  
  -- Dados Institucionais
  nome TEXT NOT NULL,
  cnpj TEXT,
  ans_registro TEXT,
  tipo TEXT CHECK (tipo IN ('plano_saude', 'seguros', 'publico')),
  
  -- Contato
  telefone TEXT,
  whatsapp TEXT,
  email TEXT,
  site TEXT,
  
  -- Dados Financeiros
  prazo_pagamento INT DEFAULT 30,
  taxa_administrativa NUMERIC(5,2) DEFAULT 0,
  forma_pagamento TEXT CHECK (forma_pagamento IN ('ted', 'boleto', 'pix', 'cheque')),
  dia_fechamento INT,
  dia_pagamento INT,
  
  -- Configurações de Faturamento
  faturamento_eletronico BOOLEAN DEFAULT false,
  portal_faturamento TEXT,
  login_portal TEXT,
  exige_autorizacao BOOLEAN DEFAULT false,
  prazo_autorizacao INT,
  
  -- Metadados
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES usuarios(id),
  updated_by UUID REFERENCES usuarios(id),
  
  CONSTRAINT convenios_nome_uk UNIQUE (empresa_id, nome)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_convenios_empresa ON convenios(empresa_id);
CREATE INDEX IF NOT EXISTS idx_convenios_cnpj ON convenios(cnpj) WHERE cnpj IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_convenios_ans ON convenios(ans_registro) WHERE ans_registro IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_convenios_ativo ON convenios(ativo);

-- Trigger
CREATE TRIGGER convenios_updated_at BEFORE UPDATE ON convenios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE convenios IS 'Cadastro de convênios e planos de saúde';

-- ============================================================================
-- 3. TABELA: equipes_medicas
-- ============================================================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS equipes_medicas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  
  -- Identificação
  nome TEXT NOT NULL,
  medico_responsavel_id UUID NOT NULL REFERENCES medicos(id),
  especialidade TEXT,
  hospital_id UUID REFERENCES hospitais(id),
  
  -- Configurações Operacionais
  dias_atuacao TEXT[], -- ['Segunda', 'Terça', ...]
  horarios_preferencia TEXT,
  cirurgias_semana_media INT,
  
  -- Metadados
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES usuarios(id),
  updated_by UUID REFERENCES usuarios(id),
  
  CONSTRAINT equipes_medicas_nome_uk UNIQUE (empresa_id, nome)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_equipes_medicas_empresa ON equipes_medicas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_equipes_medicas_responsavel ON equipes_medicas(medico_responsavel_id);
CREATE INDEX IF NOT EXISTS idx_equipes_medicas_hospital ON equipes_medicas(hospital_id);
CREATE INDEX IF NOT EXISTS idx_equipes_medicas_ativo ON equipes_medicas(ativo);

-- Trigger
CREATE TRIGGER equipes_medicas_updated_at BEFORE UPDATE ON equipes_medicas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE equipes_medicas IS 'Cadastro de equipes médicas';

-- ============================================================================
-- 4. TABELA: membros_equipe
-- ============================================================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS membros_equipe (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipe_id UUID NOT NULL REFERENCES equipes_medicas(id) ON DELETE CASCADE,
  medico_id UUID NOT NULL REFERENCES medicos(id) ON DELETE CASCADE,
  funcao TEXT CHECK (funcao IN ('cirurgiao_principal', 'cirurgiao_auxiliar', 'anestesista', 'instrumentador', 'auxiliar_enfermagem')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT membros_equipe_uk UNIQUE (equipe_id, medico_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_membros_equipe_equipe ON membros_equipe(equipe_id);
CREATE INDEX IF NOT EXISTS idx_membros_equipe_medico ON membros_equipe(medico_id);

COMMENT ON TABLE membros_equipe IS 'Membros das equipes médicas';

-- ============================================================================
-- 5. TABELA: transportadoras
-- ============================================================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS transportadoras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  
  -- Dados Institucionais
  nome TEXT NOT NULL,
  cnpj TEXT,
  tipo TEXT CHECK (tipo IN ('rodoviario', 'aereo', 'courier', 'multimodal')),
  
  -- Contato
  telefone TEXT,
  email TEXT,
  site TEXT,
  
  -- Endereço
  endereco JSONB,
  
  -- Dados Operacionais
  prazo_entrega_medio INT, -- dias
  custo_km NUMERIC(10,2),
  raio_atendimento INT, -- km
  horario_coleta TEXT,
  
  -- Integração API
  possui_api BOOLEAN DEFAULT false,
  api_url TEXT,
  api_token TEXT,
  api_auth_type TEXT CHECK (api_auth_type IN ('bearer', 'basic', 'api_key', 'oauth2')),
  
  -- Avaliação
  avaliacao NUMERIC(2,1) CHECK (avaliacao >= 0 AND avaliacao <= 5),
  
  -- Metadados
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES usuarios(id),
  updated_by UUID REFERENCES usuarios(id),
  
  CONSTRAINT transportadoras_nome_uk UNIQUE (empresa_id, nome)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_transportadoras_empresa ON transportadoras(empresa_id);
CREATE INDEX IF NOT EXISTS idx_transportadoras_cnpj ON transportadoras(cnpj) WHERE cnpj IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_transportadoras_tipo ON transportadoras(tipo);
CREATE INDEX IF NOT EXISTS idx_transportadoras_ativo ON transportadoras(ativo);

-- Trigger
CREATE TRIGGER transportadoras_updated_at BEFORE UPDATE ON transportadoras
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE transportadoras IS 'Cadastro de transportadoras para logística';

-- ============================================================================
-- 6. TABELA: grupos_produtos
-- ============================================================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS grupos_produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT,
  ativo BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT grupos_produtos_nome_uk UNIQUE (empresa_id, nome)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_grupos_produtos_empresa ON grupos_produtos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_grupos_produtos_ativo ON grupos_produtos(ativo);

COMMENT ON TABLE grupos_produtos IS 'Grupos de produtos OPME para organização';

-- ============================================================================
-- VIEWS: Cadastros KPIs
-- ============================================================================

CREATE OR REPLACE VIEW v_cadastros_kpis AS
SELECT
  e.id AS empresa_id,
  COUNT(DISTINCT m.id) FILTER (WHERE m.ativo = true) AS medicos_ativos,
  COUNT(DISTINCT h.id) FILTER (WHERE h.ativo = true) AS hospitais_ativos,
  COUNT(DISTINCT p.id) AS total_pacientes,
  COUNT(DISTINCT c.id) FILTER (WHERE c.ativo = true) AS convenios_ativos,
  COUNT(DISTINCT f.id) FILTER (WHERE f.ativo = true) AS fornecedores_ativos,
  COUNT(DISTINCT pr.id) AS produtos_opme,
  COUNT(DISTINCT eq.id) FILTER (WHERE eq.ativo = true) AS equipes_medicas_ativas,
  COUNT(DISTINCT t.id) FILTER (WHERE t.ativo = true) AS transportadoras_ativas
FROM empresas e
LEFT JOIN medicos m ON m.empresa_id = e.id
LEFT JOIN hospitais h ON h.empresa_id = e.id
LEFT JOIN pacientes p ON p.empresa_id = e.id
LEFT JOIN convenios c ON c.empresa_id = e.id
LEFT JOIN fornecedores f ON f.empresa_id = e.id
LEFT JOIN produtos pr ON pr.empresa_id = e.id
LEFT JOIN equipes_medicas eq ON eq.empresa_id = e.id
LEFT JOIN transportadoras t ON t.empresa_id = e.id
GROUP BY e.id;

COMMENT ON VIEW v_cadastros_kpis IS 'KPIs consolidados de cadastros';

-- ============================================================================
-- GRANTS (RLS configurado separadamente)
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON pacientes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON convenios TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON equipes_medicas TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON membros_equipe TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON transportadoras TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON grupos_produtos TO authenticated;
GRANT SELECT ON v_cadastros_kpis TO authenticated;



-- ============================================
-- Source: 0011_seed_conhecimento.sql
-- ============================================

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 📚 SEED INICIAL — BASE DE CONHECIMENTO
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Popula conhecimento_base com conteúdo inicial dos módulos ICARUS
-- Data: 2025-10-20
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================
-- 1. MÓDULO CIRURGIAS
-- ============================================

INSERT INTO conhecimento_base (documento_id, conteudo_texto, categoria, modulo, tags)
VALUES 
(
  'cirurgias-001',
  'Gestão de Cirurgias - O módulo de cirurgias permite o agendamento completo de procedimentos cirúrgicos, incluindo sala, equipe médica, materiais OPME e anestesistas. Integra com estoque de consignação e faturamento TISS.',
  'documentacao',
  'cirurgias',
  ARRAY['agendamento', 'opme', 'tiss', 'equipe-medica']
),
(
  'cirurgias-002',
  'Checklist ANVISA - Antes de cada cirurgia, o sistema exige preenchimento do checklist de segurança cirúrgica conforme protocolo ANVISA/OMS. Inclui verificação de paciente, sítio cirúrgico, consentimento e disponibilidade de materiais.',
  'compliance',
  'cirurgias',
  ARRAY['anvisa', 'seguranca', 'protocolo', 'checklist']
),
(
  'cirurgias-003',
  'Rastreabilidade OPME - Todo material ortopédico (OPME) utilizado em cirurgia deve ter rastreabilidade completa: lote, validade, fornecedor, número de série. Sistema gera etiquetas e vincula ao prontuário do paciente.',
  'compliance',
  'cirurgias',
  ARRAY['opme', 'rastreabilidade', 'anvisa', 'lote']
);

-- ============================================
-- 2. MÓDULO COMPLIANCE
-- ============================================

INSERT INTO conhecimento_base (documento_id, conteudo_texto, categoria, modulo, tags)
VALUES 
(
  'compliance-001',
  'LGPD - Lei Geral de Proteção de Dados. O sistema ICARUS implementa minimização de dados, consentimento explícito, direito ao esquecimento (soft delete), anonimização e criptografia. Todos os acessos são auditados.',
  'regulatorio',
  'compliance',
  ARRAY['lgpd', 'privacidade', 'dados-pessoais', 'auditoria']
),
(
  'compliance-002',
  'ANVISA RDC 36/2013 - Resolve sobre segurança do paciente e qualidade em serviços de saúde. Estabelece ações para redução de riscos de incidentes, eventos adversos e infecções relacionadas à assistência à saúde.',
  'regulatorio',
  'compliance',
  ARRAY['anvisa', 'rdc-36', 'seguranca-paciente', 'qualidade']
),
(
  'compliance-003',
  'ISO 9001 - Sistema de gestão da qualidade. ICARUS documenta processos, não-conformidades, ações corretivas e preventivas. Inclui indicadores de qualidade e satisfação do cliente.',
  'regulatorio',
  'compliance',
  ARRAY['iso-9001', 'qualidade', 'processos', 'indicadores']
);

-- ============================================
-- 3. MÓDULO ESTOQUE & CONSIGNAÇÃO
-- ============================================

INSERT INTO conhecimento_base (documento_id, conteudo_texto, categoria, modulo, tags)
VALUES 
(
  'estoque-001',
  'Consignação de OPME - Sistema para gestão de materiais em consignação (comodato). Controla entrada, saída, devoluções, cobranças e faturamento. Integra com fornecedores e NFe.',
  'documentacao',
  'estoque',
  ARRAY['consignacao', 'opme', 'fornecedor', 'nfe']
),
(
  'estoque-002',
  'Curva ABC - Classificação de produtos por valor (A: 80% do valor, B: 15%, C: 5%). Sistema calcula automaticamente e sugere políticas de estoque mínimo/máximo por categoria.',
  'documentacao',
  'estoque',
  ARRAY['curva-abc', 'gestao', 'estoque-minimo', 'compras']
),
(
  'estoque-003',
  'Validade de Materiais - Sistema alerta sobre vencimentos próximos (30, 15, 7 dias). Bloqueia uso de materiais vencidos em cirurgias. Gera relatórios de perdas por validade.',
  'documentacao',
  'estoque',
  ARRAY['validade', 'vencimento', 'alertas', 'perdas']
);

-- ============================================
-- 4. MÓDULO FINANCEIRO
-- ============================================

INSERT INTO conhecimento_base (documento_id, conteudo_texto, categoria, modulo, tags)
VALUES 
(
  'financeiro-001',
  'Contas a Receber - Controle de faturamento de cirurgias, consultas e procedimentos. Emite boletos, PIX, cartão. Integra com operadoras de saúde (TISS) e bancos.',
  'documentacao',
  'financeiro',
  ARRAY['contas-receber', 'faturamento', 'tiss', 'cobranca']
),
(
  'financeiro-002',
  'Contas a Pagar - Gestão de fornecedores, boletos, pagamentos programados. Controla fluxo de caixa, centro de custos e aprovações. Integra com bancos para remessa/retorno.',
  'documentacao',
  'financeiro',
  ARRAY['contas-pagar', 'fornecedor', 'fluxo-caixa', 'aprovacao']
),
(
  'financeiro-003',
  'DRE - Demonstração do Resultado do Exercício. Relatório gerencial com receitas, custos, despesas e lucro líquido. Comparativo mensal/anual com gráficos e indicadores.',
  'documentacao',
  'financeiro',
  ARRAY['dre', 'relatorio', 'lucro', 'indicadores']
);

-- ============================================
-- 5. LEGISLAÇÃO & REGULAMENTAÇÕES
-- ============================================

INSERT INTO legislacao_updates (titulo, descricao, data_publicacao, link_oficial, impacto_modulos, status)
VALUES 
(
  'RDC 36/2013 - Segurança do Paciente',
  'Institui ações para a segurança do paciente em serviços de saúde e dá outras providências',
  '2013-07-25',
  'https://www.gov.br/anvisa/pt-br/assuntos/servicosdesaude/seguranca-do-paciente',
  ARRAY['cirurgias', 'compliance', 'qualidade'],
  'vigente'
),
(
  'Lei 13.709/2018 - LGPD',
  'Lei Geral de Proteção de Dados Pessoais. Dispõe sobre o tratamento de dados pessoais, inclusive nos meios digitais',
  '2018-08-14',
  'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm',
  ARRAY['compliance', 'cadastros', 'todos'],
  'vigente'
),
(
  'IN DIOPES 76/2021 - TISS',
  'Padrão TISS - Troca de Informações na Saúde Suplementar. Define padrões de comunicação entre prestadores e operadoras',
  '2021-12-01',
  'https://www.gov.br/ans/pt-br/assuntos/prestadores/padrao-para-troca-de-informacao-de-saude-suplementar-2013-tiss',
  ARRAY['faturamento', 'cirurgias', 'financeiro'],
  'vigente'
);

-- ============================================
-- 6. REFRESH CACHE DE BUSCA
-- ============================================

REFRESH MATERIALIZED VIEW mv_busca_rapida;

-- ============================================
-- ✅ SEED CONCLUÍDO
-- ============================================

DO $$
DECLARE
  doc_count INTEGER;
  leg_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO doc_count FROM conhecimento_base;
  SELECT COUNT(*) INTO leg_count FROM legislacao_updates;
  
  RAISE NOTICE 'Seed concluído! Documentos: %, Legislações: %', doc_count, leg_count;
  RAISE NOTICE 'Cache de busca atualizado!';
END $$;



-- ============================================
-- Source: 0012_compras_completo.sql
-- ============================================

-- ============================================================================
-- MIGRATION: Compras e Fornecedores Completo
-- Versão: 5.0.0
-- Data: Outubro 2025
-- Descrição: Estrutura completa para Gestão de Compras e Fornecedores
-- ============================================================================

-- ============================================================================
-- 1. TABELA: solicitacoes_compra
-- ============================================================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS solicitacoes_compra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  numero TEXT NOT NULL,
  
  -- Dados da Solicitação
  solicitante_id UUID NOT NULL REFERENCES usuarios(id),
  departamento TEXT,
  justificativa TEXT,
  urgencia TEXT CHECK (urgencia IN ('normal', 'urgente', 'emergencia')) DEFAULT 'normal',
  
  -- Status e Aprovação
  status TEXT CHECK (status IN ('rascunho', 'aguardando_aprovacao', 'aprovada', 'rejeitada', 'cancelada')) DEFAULT 'rascunho',
  aprovador_id UUID REFERENCES usuarios(id),
  data_aprovacao TIMESTAMPTZ,
  motivo_rejeicao TEXT,
  
  -- Metadados
  observacoes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES usuarios(id),
  updated_by UUID REFERENCES usuarios(id),
  
  CONSTRAINT solicitacoes_compra_numero_uk UNIQUE (empresa_id, numero)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_solicitacoes_compra_empresa ON solicitacoes_compra(empresa_id);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_compra_solicitante ON solicitacoes_compra(solicitante_id);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_compra_status ON solicitacoes_compra(status);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_compra_urgencia ON solicitacoes_compra(urgencia);

-- Trigger
CREATE TRIGGER solicitacoes_compra_updated_at BEFORE UPDATE ON solicitacoes_compra
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE solicitacoes_compra IS 'Solicitações de compra internas';

-- ============================================================================
-- 2. TABELA: itens_solicitacao_compra
-- ============================================================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS itens_solicitacao_compra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitacao_id UUID NOT NULL REFERENCES solicitacoes_compra(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES produtos(id),
  
  descricao TEXT NOT NULL,
  quantidade NUMERIC(10,2) NOT NULL,
  unidade_medida TEXT,
  preco_referencia NUMERIC(15,2),
  
  observacoes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_itens_solicitacao_solicitacao ON itens_solicitacao_compra(solicitacao_id);
CREATE INDEX IF NOT EXISTS idx_itens_solicitacao_produto ON itens_solicitacao_compra(produto_id);

COMMENT ON TABLE itens_solicitacao_compra IS 'Itens das solicitações de compra';

-- ============================================================================
-- 3. TABELA: cotacoes
-- ============================================================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS cotacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  numero TEXT NOT NULL,
  
  -- Dados da Cotação
  solicitacao_id UUID REFERENCES solicitacoes_compra(id),
  responsavel_id UUID NOT NULL REFERENCES usuarios(id),
  prazo_resposta INT DEFAULT 48, -- horas
  validade_cotacao INT DEFAULT 7, -- dias
  
  -- Status
  status TEXT CHECK (status IN ('rascunho', 'enviada', 'em_analise', 'concluida', 'cancelada')) DEFAULT 'rascunho',
  
  -- Datas
  data_envio TIMESTAMPTZ,
  data_conclusao TIMESTAMPTZ,
  
  -- Metadados
  observacoes TEXT,
  especificacoes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES usuarios(id),
  updated_by UUID REFERENCES usuarios(id),
  
  CONSTRAINT cotacoes_numero_uk UNIQUE (empresa_id, numero)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_cotacoes_empresa ON cotacoes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_cotacoes_solicitacao ON cotacoes(solicitacao_id);
CREATE INDEX IF NOT EXISTS idx_cotacoes_responsavel ON cotacoes(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_cotacoes_status ON cotacoes(status);
CREATE INDEX IF NOT EXISTS idx_cotacoes_data_envio ON cotacoes(data_envio);

-- Trigger
CREATE TRIGGER cotacoes_updated_at BEFORE UPDATE ON cotacoes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE cotacoes IS 'Cotações com fornecedores';

-- ============================================================================
-- 4. TABELA: itens_cotacao
-- ============================================================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS itens_cotacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cotacao_id UUID NOT NULL REFERENCES cotacoes(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES produtos(id),
  
  descricao TEXT NOT NULL,
  quantidade NUMERIC(10,2) NOT NULL,
  unidade_medida TEXT,
  preco_referencia NUMERIC(15,2),
  
  observacoes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_itens_cotacao_cotacao ON itens_cotacao(cotacao_id);
CREATE INDEX IF NOT EXISTS idx_itens_cotacao_produto ON itens_cotacao(produto_id);

COMMENT ON TABLE itens_cotacao IS 'Itens das cotações';

-- ============================================================================
-- 5. TABELA: cotacoes_fornecedores
-- ============================================================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS cotacoes_fornecedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cotacao_id UUID NOT NULL REFERENCES cotacoes(id) ON DELETE CASCADE,
  fornecedor_id UUID NOT NULL REFERENCES fornecedores(id),
  
  -- Status da Resposta
  status TEXT CHECK (status IN ('aguardando', 'respondida', 'nao_respondeu', 'recusada')) DEFAULT 'aguardando',
  data_envio TIMESTAMPTZ,
  data_resposta TIMESTAMPTZ,
  
  -- Metadados
  observacoes_fornecedor TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT cotacoes_fornecedores_uk UNIQUE (cotacao_id, fornecedor_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_cotacoes_fornecedores_cotacao ON cotacoes_fornecedores(cotacao_id);
CREATE INDEX IF NOT EXISTS idx_cotacoes_fornecedores_fornecedor ON cotacoes_fornecedores(fornecedor_id);
CREATE INDEX IF NOT EXISTS idx_cotacoes_fornecedores_status ON cotacoes_fornecedores(status);

COMMENT ON TABLE cotacoes_fornecedores IS 'Relação entre cotações e fornecedores';

-- ============================================================================
-- 6. TABELA: propostas_cotacao
-- ============================================================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS propostas_cotacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cotacao_fornecedor_id UUID NOT NULL REFERENCES cotacoes_fornecedores(id) ON DELETE CASCADE,
  item_cotacao_id UUID NOT NULL REFERENCES itens_cotacao(id) ON DELETE CASCADE,
  
  -- Proposta
  preco_unitario NUMERIC(15,2) NOT NULL,
  quantidade_disponivel NUMERIC(10,2),
  prazo_entrega INT, -- dias
  condicoes_pagamento TEXT,
  validade_proposta DATE,
  
  -- Observações
  observacoes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT propostas_cotacao_uk UNIQUE (cotacao_fornecedor_id, item_cotacao_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_propostas_cotacao_fornecedor ON propostas_cotacao(cotacao_fornecedor_id);
CREATE INDEX IF NOT EXISTS idx_propostas_cotacao_item ON propostas_cotacao(item_cotacao_id);

COMMENT ON TABLE propostas_cotacao IS 'Propostas dos fornecedores por item';

-- ============================================================================
-- 7. TABELA: compras_internacionais
-- ============================================================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS compras_internacionais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  numero TEXT NOT NULL,
  
  -- Dados da Importação
  fornecedor_id UUID REFERENCES fornecedores(id),
  fornecedor_internacional TEXT,
  pais_origem TEXT,
  
  -- Valores
  valor_fob NUMERIC(15,2),
  valor_frete_internacional NUMERIC(15,2),
  valor_seguro NUMERIC(15,2),
  
  -- Tributos
  imposto_importacao NUMERIC(15,2),
  ipi NUMERIC(15,2),
  pis NUMERIC(15,2),
  cofins NUMERIC(15,2),
  icms NUMERIC(15,2),
  
  -- Status
  status TEXT CHECK (status IN ('analise_viabilidade', 'aprovado', 'licenca_importacao', 'embarque', 'desembaraco', 'entregue', 'cancelado')) DEFAULT 'analise_viabilidade',
  
  -- Documentos
  licenca_importacao TEXT,
  numero_di TEXT, -- Declaração de Importação
  data_embarque DATE,
  previsao_chegada DATE,
  data_desembaraco DATE,
  
  -- Metadados
  observacoes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES usuarios(id),
  updated_by UUID REFERENCES usuarios(id),
  
  CONSTRAINT compras_internacionais_numero_uk UNIQUE (empresa_id, numero)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_compras_internacionais_empresa ON compras_internacionais(empresa_id);
CREATE INDEX IF NOT EXISTS idx_compras_internacionais_fornecedor ON compras_internacionais(fornecedor_id);
CREATE INDEX IF NOT EXISTS idx_compras_internacionais_status ON compras_internacionais(status);
CREATE INDEX IF NOT EXISTS idx_compras_internacionais_pais ON compras_internacionais(pais_origem);

-- Trigger
CREATE TRIGGER compras_internacionais_updated_at BEFORE UPDATE ON compras_internacionais
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE compras_internacionais IS 'Gestão de compras internacionais (importação)';

-- ============================================================================
-- 8. TABELA: notas_compra
-- ============================================================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS notas_compra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  pedido_compra_id UUID REFERENCES pedidos_compra(id),
  fornecedor_id UUID NOT NULL REFERENCES fornecedores(id),
  
  -- Dados da NF-e
  numero_nota TEXT NOT NULL,
  serie TEXT,
  chave_acesso TEXT,
  data_emissao TIMESTAMPTZ NOT NULL,
  
  -- Valores
  valor_produtos NUMERIC(15,2) NOT NULL,
  valor_frete NUMERIC(15,2) DEFAULT 0,
  valor_seguro NUMERIC(15,2) DEFAULT 0,
  valor_desconto NUMERIC(15,2) DEFAULT 0,
  valor_outros NUMERIC(15,2) DEFAULT 0,
  valor_total NUMERIC(15,2) NOT NULL,
  
  -- Impostos
  valor_icms NUMERIC(15,2) DEFAULT 0,
  valor_ipi NUMERIC(15,2) DEFAULT 0,
  valor_pis NUMERIC(15,2) DEFAULT 0,
  valor_cofins NUMERIC(15,2) DEFAULT 0,
  
  -- Status
  status TEXT CHECK (status IN ('pendente', 'conferida', 'divergencia', 'entrada_efetuada', 'cancelada')) DEFAULT 'pendente',
  data_entrada TIMESTAMPTZ,
  
  -- XML
  xml_nfe TEXT,
  
  -- Metadados
  observacoes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES usuarios(id),
  updated_by UUID REFERENCES usuarios(id),
  
  CONSTRAINT notas_compra_chave_uk UNIQUE (chave_acesso)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_notas_compra_empresa ON notas_compra(empresa_id);
CREATE INDEX IF NOT EXISTS idx_notas_compra_pedido ON notas_compra(pedido_compra_id);
CREATE INDEX IF NOT EXISTS idx_notas_compra_fornecedor ON notas_compra(fornecedor_id);
CREATE INDEX IF NOT EXISTS idx_notas_compra_status ON notas_compra(status);
CREATE INDEX IF NOT EXISTS idx_notas_compra_numero ON notas_compra(numero_nota);
CREATE INDEX IF NOT EXISTS idx_notas_compra_data_emissao ON notas_compra(data_emissao);

-- Trigger
CREATE TRIGGER notas_compra_updated_at BEFORE UPDATE ON notas_compra
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE notas_compra IS 'Notas fiscais de entrada (compra)';

-- ============================================================================
-- 9. TABELA: itens_nota_compra
-- ============================================================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS itens_nota_compra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nota_compra_id UUID NOT NULL REFERENCES notas_compra(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES produtos(id),
  
  -- Dados do Item
  codigo_produto TEXT,
  descricao TEXT NOT NULL,
  quantidade NUMERIC(10,2) NOT NULL,
  unidade_medida TEXT,
  
  -- Valores
  valor_unitario NUMERIC(15,2) NOT NULL,
  valor_total NUMERIC(15,2) NOT NULL,
  
  -- Rastreabilidade
  lote TEXT,
  validade DATE,
  numero_serie TEXT,
  
  -- Status
  produto_encontrado BOOLEAN DEFAULT false,
  entrada_efetuada BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_itens_nota_compra_nota ON itens_nota_compra(nota_compra_id);
CREATE INDEX IF NOT EXISTS idx_itens_nota_compra_produto ON itens_nota_compra(produto_id);
CREATE INDEX IF NOT EXISTS idx_itens_nota_compra_lote ON itens_nota_compra(lote);

COMMENT ON TABLE itens_nota_compra IS 'Itens das notas fiscais de compra';

-- ============================================================================
-- VIEWS: Compras KPIs
-- ============================================================================

CREATE OR REPLACE VIEW v_compras_kpis AS
WITH mes_atual AS (
  SELECT 
    empresa_id,
    COUNT(*) as total_compras,
    SUM(valor_total) as valor_total
  FROM pedidos_compra
  WHERE status NOT IN ('cancelado')
    AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())
  GROUP BY empresa_id
),
pedidos_stats AS (
  SELECT
    empresa_id,
    COUNT(*) FILTER (WHERE status IN ('rascunho', 'aguardando_aprovacao', 'aprovado', 'enviado')) as pedidos_pendentes
  FROM pedidos_compra
  GROUP BY empresa_id
),
cotacoes_stats AS (
  SELECT
    empresa_id,
    COUNT(*) FILTER (WHERE status IN ('enviada', 'em_analise')) as cotacoes_abertas
  FROM cotacoes
  GROUP BY empresa_id
)
SELECT
  e.id AS empresa_id,
  COALESCE(ma.total_compras, 0) as compras_mes,
  COALESCE(ma.valor_total, 0) as valor_total_mes,
  COALESCE(ps.pedidos_pendentes, 0) as pedidos_pendentes,
  COALESCE(cs.cotacoes_abertas, 0) as cotacoes_abertas,
  COUNT(DISTINCT f.id) FILTER (WHERE f.ativo = true) as fornecedores_ativos
FROM empresas e
LEFT JOIN mes_atual ma ON ma.empresa_id = e.id
LEFT JOIN pedidos_stats ps ON ps.empresa_id = e.id
LEFT JOIN cotacoes_stats cs ON cs.empresa_id = e.id
LEFT JOIN fornecedores f ON f.empresa_id = e.id
GROUP BY e.id, ma.total_compras, ma.valor_total, ps.pedidos_pendentes, cs.cotacoes_abertas;

COMMENT ON VIEW v_compras_kpis IS 'KPIs consolidados de compras';

-- ============================================================================
-- FUNCTIONS: Cálculo de Viabilidade de Importação
-- ============================================================================

CREATE OR REPLACE FUNCTION calcular_custo_importacao(
  p_valor_fob NUMERIC,
  p_valor_frete NUMERIC,
  p_valor_seguro NUMERIC,
  p_aliquota_ii NUMERIC DEFAULT 14, -- Imposto de Importação
  p_aliquota_ipi NUMERIC DEFAULT 5,
  p_aliquota_pis NUMERIC DEFAULT 2.1,
  p_aliquota_cofins NUMERIC DEFAULT 9.65,
  p_aliquota_icms NUMERIC DEFAULT 18
) RETURNS JSONB AS $$
DECLARE
  v_base_calculo NUMERIC;
  v_ii NUMERIC;
  v_ipi NUMERIC;
  v_pis_cofins NUMERIC;
  v_icms NUMERIC;
  v_custo_total NUMERIC;
  v_resultado JSONB;
BEGIN
  -- Base de cálculo
  v_base_calculo := p_valor_fob + p_valor_frete + p_valor_seguro;
  
  -- Imposto de Importação
  v_ii := v_base_calculo * (p_aliquota_ii / 100);
  
  -- IPI
  v_ipi := (v_base_calculo + v_ii) * (p_aliquota_ipi / 100);
  
  -- PIS/COFINS
  v_pis_cofins := v_base_calculo * ((p_aliquota_pis + p_aliquota_cofins) / 100);
  
  -- ICMS
  v_icms := (v_base_calculo + v_ii + v_ipi + v_pis_cofins) * (p_aliquota_icms / 100);
  
  -- Custo Total
  v_custo_total := v_base_calculo + v_ii + v_ipi + v_pis_cofins + v_icms;
  
  -- Montar resultado
  v_resultado := jsonb_build_object(
    'valor_fob', p_valor_fob,
    'valor_frete', p_valor_frete,
    'valor_seguro', p_valor_seguro,
    'base_calculo', v_base_calculo,
    'imposto_importacao', v_ii,
    'ipi', v_ipi,
    'pis_cofins', v_pis_cofins,
    'icms', v_icms,
    'custo_total', v_custo_total,
    'acrescimo_percentual', ROUND(((v_custo_total - p_valor_fob) / p_valor_fob) * 100, 2)
  );
  
  RETURN v_resultado;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calcular_custo_importacao IS 'Calcula custo total de importação incluindo todos os tributos';

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON solicitacoes_compra TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON itens_solicitacao_compra TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON cotacoes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON itens_cotacao TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON cotacoes_fornecedores TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON propostas_cotacao TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON compras_internacionais TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON notas_compra TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON itens_nota_compra TO authenticated;
GRANT SELECT ON v_compras_kpis TO authenticated;
GRANT EXECUTE ON FUNCTION calcular_custo_importacao TO authenticated;



-- ============================================
-- Source: 0012_seed_opme_especializado.sql
-- ============================================

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 📚 SEED ESPECIALIZADO — CONHECIMENTO OPME
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Base de conhecimento para Tutor IA especializado em OPME
-- Data: 2025-10-20
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================
-- 1. DOCUMENTAÇÃO OPME — CONCEITOS
-- ============================================

INSERT INTO conhecimento_base (documento_id, conteudo_texto, categoria, modulo, tags)
VALUES 
(
  'opme-001',
  'OPME - Órteses, Próteses e Materiais Especiais. São dispositivos médicos implantáveis ou de uso único utilizados em procedimentos cirúrgicos. Incluem: placas, parafusos, pinos, stents, válvulas cardíacas, próteses articulares, malhas cirúrgicas, entre outros. A ANS regula o fornecimento de OPME através do Rol de Procedimentos.',
  'documentacao',
  'opme',
  ARRAY['conceito', 'ans', 'definicao', 'dispositivos-medicos']
),
(
  'opme-002',
  'Rastreabilidade OPME - ANVISA RDC 36/2013. Todo material OPME deve ter: número de lote, data de validade, número de série (quando aplicável), registro ANVISA, nome do fabricante. A rastreabilidade é obrigatória e deve ser mantida por no mínimo 5 anos após o uso. Etiquetas devem ser coladas no prontuário do paciente.',
  'compliance',
  'opme',
  ARRAY['rastreabilidade', 'anvisa', 'rdc-36', 'lote', 'validade']
),
(
  'opme-003',
  'Classificação de Risco OPME - ANVISA. Classe I (baixo risco): não invasivos. Classe II (médio risco): invasivos temporários. Classe III (alto risco): invasivos de longo prazo. Classe IV (altíssimo risco): implantáveis ativos ou que sustentam vida. Cada classe tem requisitos regulatórios específicos.',
  'compliance',
  'opme',
  ARRAY['classificacao', 'risco', 'anvisa', 'regulatorio']
);

-- ============================================
-- 2. JUSTIFICATIVA MÉDICA — TEMPLATES
-- ============================================

INSERT INTO conhecimento_base (documento_id, conteudo_texto, categoria, modulo, tags)
VALUES 
(
  'opme-just-001',
  'Justificativa Médica para OPME - Estrutura obrigatória: 1) Identificação do paciente (nome, idade, convênio, carteirinha). 2) Diagnóstico CID-10 completo e detalhado. 3) Indicação cirúrgica clara. 4) Descrição dos materiais solicitados com marca, modelo e quantidade. 5) Justificativa técnica para cada material. 6) Alternativas consideradas e por que foram descartadas. 7) Riscos caso material não seja fornecido. 8) Data, carimbo e assinatura do médico responsável com CRM.',
  'documentacao',
  'opme',
  ARRAY['justificativa', 'template', 'estrutura', 'obrigatorio']
),
(
  'opme-just-002',
  'Justificativa para Prótese de Joelho - Exemplo: "Paciente com 65 anos, portador de gonartrose grave bilateral (CID M17.0), com falha no tratamento conservador (fisioterapia, AINEs, infiltrações). Limitação funcional importante (EVA 8/10). Indicado artroplastia total de joelho. Materiais: Prótese Total de Joelho com Cimentação, componente femoral, tibial e patelar. Marca/Modelo necessários devido compatibilidade com instrumental disponível e experiência da equipe. Sem o material, paciente permanecerá com dor incapacitante e perda de qualidade de vida."',
  'exemplo',
  'opme',
  ARRAY['justificativa', 'joelho', 'protese', 'ortopedia']
),
(
  'opme-just-003',
  'Justificativa para Material de Síntese - Exemplo: "Paciente vítima de trauma, fratura exposta de tíbia Gustilo IIIB (CID S82.2). Indicado RAFI (Redução Aberta e Fixação Interna). Materiais: Placa bloqueada de tíbia, parafusos corticais e esponjosos. Justificativa: Fratura instável que requer estabilização rígida para consolidação óssea. Placa bloqueada indicada devido ao traço de fratura e qualidade óssea. Alternativas como hastes intramedulares não aplicáveis neste caso devido localização e complexidade da fratura."',
  'exemplo',
  'opme',
  ARRAY['justificativa', 'sintese', 'trauma', 'fratura']
);

-- ============================================
-- 3. GLOSAS — PREVENÇÃO E MOTIVOS
-- ============================================

INSERT INTO conhecimento_base (documento_id, conteudo_texto, categoria, modulo, tags)
VALUES 
(
  'opme-glosa-001',
  'Glosas em OPME - Principais motivos: 1) Justificativa médica ausente ou incompleta. 2) Material não previsto no Rol ANS. 3) Falta de orçamentos (mínimo 3 fornecedores). 4) Preço acima da tabela Simpro/Brasíndice. 5) Falta de autorização prévia. 6) Documentação incompleta (nota fiscal, etiquetas). 7) CID incompatível com procedimento. 8) Material usado sem necessidade comprovada.',
  'documentacao',
  'opme',
  ARRAY['glosa', 'prevencao', 'motivos', 'auditoria']
),
(
  'opme-glosa-002',
  'Como evitar glosas OPME: 1) Sempre solicitar pré-autorização com antecedência. 2) Justificativa médica detalhada e personalizada (não usar templates genéricos). 3) Anexar exames que comprovem necessidade (RX, RM, TC). 4) Cotação de no mínimo 3 fornecedores. 5) Verificar se material está no Rol ANS. 6) Conferir validade, lote e registro ANVISA. 7) Fotografar etiquetas e colar no prontuário. 8) Documentar todo o processo cirúrgico.',
  'procedimento',
  'opme',
  ARRAY['glosa', 'prevencao', 'checklist', 'boas-praticas']
),
(
  'opme-glosa-003',
  'Recurso de Glosa OPME - Passos: 1) Identificar motivo da glosa na negativa. 2) Reunir documentação: justificativa original, exames, relatório cirúrgico, nota fiscal, etiquetas. 3) Elaborar contra-argumentação técnica com literatura científica. 4) Reforçar CID e correlação com material. 5) Demonstrar que material é essencial e sem alternativa. 6) Anexar guidelines ou protocolos médicos. 7) Enviar recurso dentro do prazo (geralmente 30 dias). 8) Acompanhar via ANS se negado novamente.',
  'procedimento',
  'opme',
  ARRAY['glosa', 'recurso', 'contestacao', 'ans']
);

-- ============================================
-- 4. TABELAS DE PREÇOS — REFERÊNCIA
-- ============================================

INSERT INTO conhecimento_base (documento_id, conteudo_texto, categoria, modulo, tags)
VALUES 
(
  'opme-preco-001',
  'Tabelas de Preço OPME - Referências: 1) Simpro (Sistema Integrado de Processos): tabela oficial governo federal, atualizada mensalmente. 2) Brasíndice: índice de preços de medicamentos e materiais médicos. 3) Banco de Preços em Saúde (BPS): comparativo de preços praticados. Operadoras usam essas tabelas como teto para autorização. Preços acima requerem justificativa adicional.',
  'documentacao',
  'opme',
  ARRAY['preco', 'tabela', 'simpro', 'brasindice']
),
(
  'opme-preco-002',
  'Negociação de Preços OPME - Boas práticas: 1) Solicitar múltiplos orçamentos (mínimo 3). 2) Verificar se fornecedor é credenciado pela operadora. 3) Conferir preço na tabela Simpro/Brasíndice. 4) Negociar descontos para materiais de alto custo. 5) Considerar pacotes (kit cirúrgico) quando vantajoso. 6) Documentar negociação para auditoria. 7) Atentar para prazo de entrega e validade.',
  'procedimento',
  'opme',
  ARRAY['preco', 'negociacao', 'orcamento', 'fornecedor']
);

-- ============================================
-- 5. TIPOS DE MATERIAIS — CATÁLOGO
-- ============================================

INSERT INTO conhecimento_base (documento_id, conteudo_texto, categoria, modulo, tags)
VALUES 
(
  'opme-cat-001',
  'Materiais de Síntese Óssea: Placas (retas, em T, em L, bloqueadas, não bloqueadas), parafusos (corticais 3.5mm, 4.5mm; esponjosos 4.0mm, 6.5mm; canulados), fios de Kirschner, pinos intramedulares, hastes bloqueadas, fixadores externos, âncoras. Indicações: fraturas, osteotomias, artrodeses. Materiais mais comuns: titânio, aço inoxidável, PEEK.',
  'catalogo',
  'opme',
  ARRAY['sintese-ossea', 'trauma', 'ortopedia', 'materiais']
),
(
  'opme-cat-002',
  'Próteses Articulares: Quadril (total, parcial, revisão), Joelho (total, unicompartimental, revisão), Ombro (total, reversa), Tornozelo, Cotovelo. Componentes: acetábulo, cabeça femoral, haste femoral (cimentada/não cimentada), bandeja tibial, componente femoral, polietileno. Indicações: artrose avançada, necrose óssea, fraturas complexas em idosos.',
  'catalogo',
  'opme',
  ARRAY['protese', 'articular', 'quadril', 'joelho', 'ortopedia']
),
(
  'opme-cat-003',
  'Materiais para Coluna: Parafusos pediculares, hastes, cages intersomáticos (PEEK, titânio), placas cervicais, ganchos, conectores, enxerto ósseo (autólogo, homólogo, sintético - BMP). Indicações: fraturas vertebrais, hérnias discais com instabilidade, espondilolistese, escoliose, tumores. Sistemas: posterior, anterior, minimamente invasivo.',
  'catalogo',
  'opme',
  ARRAY['coluna', 'pedicular', 'cage', 'artrodese']
),
(
  'opme-cat-004',
  'Materiais Cardiovasculares: Stents coronarianos (farmacológicos, convencionais), stents periféricos, válvulas cardíacas (mecânicas, biológicas, TAVI), marcapassos, CDI (cardiodesfibrilador implantável), cateteres, introdutores, guias, balões. Indicações: DAC, valvopatias, arritmias. Alta regulação ANS.',
  'catalogo',
  'opme',
  ARRAY['cardiovascular', 'stent', 'valvula', 'marcapasso']
),
(
  'opme-cat-005',
  'Materiais para Videolaparoscopia/Cirurgia Geral: Grampeadores lineares, circulares, trocateres, clipes de titânio, malhas (polipropileno, compostas), telas para hérnia, dispositivos de sutura mecânica, bisturi harmônico, LigaSure. Indicações: colecistectomia, herniorrafia, bariátrica, colectomia.',
  'catalogo',
  'opme',
  ARRAY['videolaparoscopia', 'grampeador', 'malha', 'hernia']
);

-- ============================================
-- 6. ROL ANS — COBERTURA OBRIGATÓRIA
-- ============================================

INSERT INTO conhecimento_base (documento_id, conteudo_texto, categoria, modulo, tags)
VALUES 
(
  'opme-ans-001',
  'Rol de Procedimentos ANS - OPME: Lista taxativa de materiais de cobertura obrigatória pelos planos de saúde. Atualizado periodicamente. Inclui: próteses articulares, síntese óssea, stents, válvulas, marcapassos, malhas, grampeadores. Materiais fora do Rol podem ser negados, mas há jurisprudência favorável ao paciente em casos de urgência ou única alternativa.',
  'regulatorio',
  'opme',
  ARRAY['ans', 'rol', 'cobertura', 'obrigatoriedade']
),
(
  'opme-ans-002',
  'Negativa de OPME pelo Plano - Direitos: Se material está no Rol ANS e há justificativa médica adequada, a negativa é ilegal. Passos: 1) Solicitar negativa por escrito com motivo. 2) Apresentar recurso administrativo. 3) Acionar ouvidoria da operadora. 4) Registrar reclamação na ANS (0800 701 9656 ou site). 5) Em urgências, buscar tutela judicial (liminar geralmente concedida em 24h).',
  'regulatorio',
  'opme',
  ARRAY['ans', 'negativa', 'direitos', 'recurso']
);

-- ============================================
-- 7. CONSIGNAÇÃO OPME
-- ============================================

INSERT INTO conhecimento_base (documento_id, conteudo_texto, categoria, modulo, tags)
VALUES 
(
  'opme-consig-001',
  'Consignação de OPME - Conceito: Material cedido temporariamente pelo fornecedor ao hospital/clínica sem custo inicial. Cobrança ocorre apenas após uso efetivo em cirurgia. Vantagens: não imobiliza capital, evita estoque parado, reduz perdas por validade. Controle rigoroso necessário: entrada, saída, devoluções, faturamento.',
  'procedimento',
  'opme',
  ARRAY['consignacao', 'estoque', 'fornecedor', 'gestao']
),
(
  'opme-consig-002',
  'Gestão de Consignação OPME - Fluxo: 1) Contrato com fornecedor (prazos, devolução, reposição). 2) Entrada com conferência (nota de remessa, validade, lote). 3) Armazenamento adequado (temperatura, umidade). 4) Reserva para cirurgia (kit cirúrgico). 5) Confirmação de uso (etiquetas, relatório cirúrgico). 6) Faturamento (nota fiscal de venda). 7) Devolução de não usados. 8) Auditoria mensal (físico x sistema).',
  'procedimento',
  'opme',
  ARRAY['consignacao', 'fluxo', 'controle', 'auditoria']
);

-- ============================================
-- 8. LEGISLAÇÃO E COMPLIANCE
-- ============================================

INSERT INTO conhecimento_base (documento_id, conteudo_texto, categoria, modulo, tags)
VALUES 
(
  'opme-leg-001',
  'RDC 185/2001 ANVISA - Registro de Produtos Médicos: Todo OPME deve ter registro na ANVISA antes da comercialização. Produtos importados requerem petição de empresa brasileira. Registro válido por 5 anos (renováveis). Uso de material sem registro é crime. Sempre verificar status do registro no site da ANVISA antes de usar.',
  'regulatorio',
  'opme',
  ARRAY['anvisa', 'rdc-185', 'registro', 'legislacao']
),
(
  'opme-leg-002',
  'Lei 12.842/2013 - Ato Médico: Indicação de OPME é ato privativo do médico. Apenas o médico pode prescrever, indicar e decidir sobre materiais a serem utilizados. Fornecedores, representantes e hospitais não podem influenciar ou determinar a escolha. Ética médica proíbe recebimento de vantagens por indicação de produtos.',
  'regulatorio',
  'opme',
  ARRAY['ato-medico', 'etica', 'prescricao', 'legislacao']
);

-- ============================================
-- 9. RECONHECIMENTO DE DOCUMENTOS (OCR)
-- ============================================

INSERT INTO conhecimento_base (documento_id, conteudo_texto, categoria, modulo, tags)
VALUES 
(
  'opme-ocr-001',
  'Documentos OPME para OCR - Tipos: 1) Pedido médico (receituário, justificativa). 2) Nota fiscal (DANFE, NFe). 3) Etiquetas de material (lote, validade, código de barras). 4) Embalagens (descritivos, instruções de uso). 5) Certificados (registro ANVISA, ISO). 6) Orçamentos (fornecedores). 7) Laudos de auditoria. Sistema deve extrair: texto, datas, valores, códigos, CID.',
  'documentacao',
  'opme',
  ARRAY['ocr', 'documentos', 'digitalizacao', 'automacao']
),
(
  'opme-ocr-002',
  'Extração de Dados de Etiquetas OPME - Campos obrigatórios: Nome do produto, Fabricante, Registro ANVISA (número), Lote, Validade, Código de barras (EAN/DUN), REF (referência do fabricante), Número de série (quando aplicável). OCR deve ser capaz de ler mesmo com qualidade baixa (foto de celular, etiqueta amassada). Validação cruzada com banco de dados de produtos.',
  'tecnico',
  'opme',
  ARRAY['ocr', 'etiqueta', 'extracao', 'rastreabilidade']
);

-- ============================================
-- 10. BOAS PRÁTICAS E DICAS
-- ============================================

INSERT INTO conhecimento_base (documento_id, conteudo_texto, categoria, modulo, tags)
VALUES 
(
  'opme-dicas-001',
  'Checklist Pré-Cirúrgico OPME: ✓ Pré-autorização aprovada. ✓ Justificativa médica completa. ✓ Material entregue e conferido (validade, lote, integridade). ✓ Etiquetas prontas para colar no prontuário. ✓ Notas fiscais conferidas. ✓ Kit cirúrgico completo e esterilizado. ✓ Representante do fornecedor confirmado (se necessário). ✓ Backup de material disponível. ✓ Documentação fotográfica das embalagens.',
  'procedimento',
  'opme',
  ARRAY['checklist', 'pre-operatorio', 'boas-praticas', 'seguranca']
),
(
  'opme-dicas-002',
  'Documentação Pós-Cirúrgica OPME: 1) Colar todas as etiquetas no prontuário. 2) Preencher relatório cirúrgico detalhando materiais usados. 3) Fotografar campo cirúrgico com material implantado. 4) Anotar intercorrências ou trocas de material. 5) Conferir que material cobrado = material usado. 6) Enviar documentação para faturamento em até 24h. 7) Arquivar cópia de segurança (escaneado) por no mínimo 20 anos.',
  'procedimento',
  'opme',
  ARRAY['pos-operatorio', 'documentacao', 'prontuario', 'faturamento']
);

-- ============================================
-- 11. ATUALIZAR CACHE
-- ============================================

REFRESH MATERIALIZED VIEW mv_busca_rapida;

-- ============================================
-- ✅ SEED OPME CONCLUÍDO
-- ============================================

DO $$
DECLARE
  total_opme INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_opme 
  FROM conhecimento_base 
  WHERE modulo = 'opme';
  
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ SEED OPME CONCLUÍDO!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  RAISE NOTICE '📚 Documentos OPME criados: %', total_opme;
  RAISE NOTICE '';
  RAISE NOTICE 'Categorias:';
  RAISE NOTICE '  • Conceitos e definições';
  RAISE NOTICE '  • Justificativas médicas (templates e exemplos)';
  RAISE NOTICE '  • Prevenção e recurso de glosas';
  RAISE NOTICE '  • Tabelas de preços';
  RAISE NOTICE '  • Catálogo de materiais';
  RAISE NOTICE '  • Rol ANS e cobertura';
  RAISE NOTICE '  • Consignação e gestão';
  RAISE NOTICE '  • Legislação e compliance';
  RAISE NOTICE '  • OCR e reconhecimento de documentos';
  RAISE NOTICE '  • Boas práticas e checklists';
  RAISE NOTICE '';
  RAISE NOTICE '🤖 Pronto para Tutor IA especializado!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;



-- ============================================
-- Source: 0013_observabilidade_comportamental.sql
-- ============================================

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 📊 MIGRAÇÃO 0013 — OBSERVABILIDADE & INTELIGÊNCIA COMPORTAMENTAL
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Data: 2025-10-20
-- Objetivo: Sistema completo de treinamento, análise comportamental e alertas
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Ativar extensão necessária para gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- 1. ATIVIDADES DE USUÁRIOS (LOG COMPLETO)
-- ============================================

CREATE TABLE IF NOT EXISTS IF NOT EXISTS user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  acao TEXT NOT NULL,
  modulo TEXT NOT NULL,
  sub_modulo TEXT,
  rota TEXT,
  metodo TEXT CHECK (metodo IN ('CREATE', 'READ', 'UPDATE', 'DELETE', 'NAVIGATE', 'SEARCH', 'EXPORT', 'IMPORT')),
  dados_entrada JSONB,
  dados_saida JSONB,
  tempo_execucao INTEGER,
  sucesso BOOLEAN DEFAULT true,
  erro_mensagem TEXT,
  erro_stack TEXT,
  ip_address INET,
  user_agent TEXT,
  dispositivo TEXT,
  localizacao TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_user_activities_usuario ON user_activities(usuario_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_user_activities_modulo ON user_activities(modulo);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_user_activities_criado ON user_activities(criado_em DESC);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_user_activities_sucesso ON user_activities(sucesso) WHERE sucesso = false;

COMMENT ON TABLE user_activities IS 'Log completo de todas atividades dos usuários no sistema';

-- ============================================
-- 2. PERFIL COMPORTAMENTAL DO USUÁRIO
-- ============================================

CREATE TABLE IF NOT EXISTS IF NOT EXISTS user_behavior_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  modulos_mais_usados JSONB,
  acoes_mais_frequentes JSONB,
  horarios_ativos JSONB,
  dias_semana_ativos JSONB,
  tempo_medio_por_modulo JSONB,
  funcionalidades_dominadas TEXT[],
  funcionalidades_com_dificuldade TEXT[],
  taxa_erro_geral REAL DEFAULT 0,
  total_atividades INTEGER DEFAULT 0,
  total_erros INTEGER DEFAULT 0,
  ultima_atividade TIMESTAMPTZ,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_behavior_usuario ON user_behavior_profile(usuario_id);

COMMENT ON TABLE user_behavior_profile IS 'Perfil comportamental agregado de cada usuário';

-- ============================================
-- 3. TRANSFERÊNCIA DE RESPONSABILIDADES
-- ============================================

CREATE TABLE IF NOT EXISTS IF NOT EXISTS user_handovers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_sainte_id UUID REFERENCES auth.users(id),
  usuario_substituto_id UUID REFERENCES auth.users(id),
  motivo TEXT NOT NULL CHECK (motivo IN ('ferias', 'licenca', 'demissao', 'transferencia', 'outro')),
  data_inicio DATE NOT NULL,
  data_fim DATE,
  responsabilidades_transferidas TEXT[],
  modulos_transferidos TEXT[],
  instrucoes_especiais TEXT,
  documentacao_gerada_url TEXT,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'concluido', 'cancelado')),
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_handovers_sainte ON user_handovers(usuario_sainte_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_handovers_substituto ON user_handovers(usuario_substituto_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_handovers_status ON user_handovers(status);

COMMENT ON TABLE user_handovers IS 'Registro de transferências de responsabilidades entre usuários';

-- ============================================
-- 4. ERROS E ALERTAS
-- ============================================

CREATE TABLE IF NOT EXISTS IF NOT EXISTS system_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id),
  tipo TEXT NOT NULL CHECK (tipo IN ('erro_aplicacao', 'erro_validacao', 'erro_permissao', 'erro_rede', 'erro_banco', 'erro_integracao')),
  severidade TEXT NOT NULL CHECK (severidade IN ('baixa', 'media', 'alta', 'critica')),
  modulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  stack_trace TEXT,
  contexto JSONB,
  impacto TEXT,
  solucao_sugerida TEXT,
  notificado_admin BOOLEAN DEFAULT false,
  notificado_ceo BOOLEAN DEFAULT false,
  resolvido BOOLEAN DEFAULT false,
  resolvido_por UUID REFERENCES auth.users(id),
  resolvido_em TIMESTAMPTZ,
  notas_resolucao TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_errors_usuario ON system_errors(usuario_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_errors_severidade ON system_errors(severidade);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_errors_resolvido ON system_errors(resolvido) WHERE resolvido = false;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_errors_criado ON system_errors(criado_em DESC);

COMMENT ON TABLE system_errors IS 'Registro centralizado de todos erros do sistema';

-- ============================================
-- 5. ALERTAS E PREDIÇÕES
-- ============================================

CREATE TABLE IF NOT EXISTS IF NOT EXISTS system_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN ('prazo_vencendo', 'erro_recorrente', 'comportamento_anomalo', 'performance_baixa', 'tentativa_acesso_nao_autorizado', 'predicao_erro', 'autocorrecao')),
  severidade TEXT NOT NULL CHECK (severidade IN ('info', 'atencao', 'urgente', 'critico')),
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  usuario_afetado_id UUID REFERENCES auth.users(id),
  modulo TEXT,
  dados JSONB,
  acao_sugerida TEXT,
  destinatarios TEXT[] DEFAULT ARRAY['admin', 'ceo'],
  notificado BOOLEAN DEFAULT false,
  lido BOOLEAN DEFAULT false,
  resolvido BOOLEAN DEFAULT false,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_alerts_tipo ON system_alerts(tipo);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_alerts_severidade ON system_alerts(severidade);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_alerts_resolvido ON system_alerts(resolvido) WHERE resolvido = false;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_alerts_criado ON system_alerts(criado_em DESC);

COMMENT ON TABLE system_alerts IS 'Alertas inteligentes e predições do sistema';

-- ============================================
-- 6. TREINAMENTO E ONBOARDING
-- ============================================

CREATE TABLE IF NOT EXISTS IF NOT EXISTS user_training (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  modulo TEXT NOT NULL,
  licao TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('tutorial', 'video', 'documentacao', 'quiz', 'pratico')),
  concluido BOOLEAN DEFAULT false,
  pontuacao INTEGER,
  tempo_gasto INTEGER,
  tentativas INTEGER DEFAULT 0,
  ultima_tentativa TIMESTAMPTZ,
  concluido_em TIMESTAMPTZ,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_training_usuario ON user_training(usuario_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_training_modulo ON user_training(modulo);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_training_concluido ON user_training(concluido);

COMMENT ON TABLE user_training IS 'Progresso de treinamento dos usuários';

-- ============================================
-- 7. HISTÓRICO DE SESSÕES
-- ============================================

CREATE TABLE IF NOT EXISTS IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT,
  ip_address INET,
  user_agent TEXT,
  dispositivo TEXT,
  navegador TEXT,
  sistema_operacional TEXT,
  localizacao TEXT,
  duracao INTEGER,
  paginas_visitadas INTEGER DEFAULT 0,
  acoes_realizadas INTEGER DEFAULT 0,
  inicio_em TIMESTAMPTZ DEFAULT NOW(),
  termino_em TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_sessions_usuario ON user_sessions(usuario_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_sessions_inicio ON user_sessions(inicio_em DESC);

COMMENT ON TABLE user_sessions IS 'Histórico de sessões de usuários';

-- ============================================
-- 8. FUNÇÃO: ATUALIZAR PERFIL COMPORTAMENTAL
-- ============================================

CREATE OR REPLACE FUNCTION atualizar_perfil_comportamental()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_behavior_profile (
    usuario_id,
    total_atividades,
    total_erros,
    taxa_erro_geral,
    ultima_atividade
  )
  VALUES (
    NEW.usuario_id,
    1,
    CASE WHEN NEW.sucesso = false THEN 1 ELSE 0 END,
    CASE WHEN NEW.sucesso = false THEN 1.0 ELSE 0.0 END,
    NEW.criado_em
  )
  ON CONFLICT (usuario_id) DO UPDATE SET
    total_atividades = user_behavior_profile.total_atividades + 1,
    total_erros = user_behavior_profile.total_erros + CASE WHEN NEW.sucesso = false THEN 1 ELSE 0 END,
    taxa_erro_geral = (user_behavior_profile.total_erros::REAL + CASE WHEN NEW.sucesso = false THEN 1 ELSE 0 END::REAL) / 
                      (user_behavior_profile.total_atividades::REAL + 1),
    ultima_atividade = NEW.criado_em,
    atualizado_em = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_atualizar_perfil ON user_activities;
CREATE TRIGGER trigger_atualizar_perfil
  AFTER INSERT ON user_activities
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_perfil_comportamental();

-- ============================================
-- 9. FUNÇÃO: CRIAR ALERTA DE ERRO CRÍTICO
-- ============================================

CREATE OR REPLACE FUNCTION criar_alerta_erro_critico()
RETURNS TRIGGER AS $$
DECLARE
  v_alert_severidade TEXT;
  v_titulo TEXT;
BEGIN
  IF NEW.severidade IN ('alta', 'critica') THEN
    v_alert_severidade := CASE 
      WHEN NEW.severidade = 'critica' THEN 'critico'
      WHEN NEW.severidade = 'alta' THEN 'urgente'
      ELSE 'atencao'
    END;
    
    v_titulo := 'Erro ' || NEW.severidade || ' detectado';
    
    INSERT INTO system_alerts (
      tipo,
      severidade,
      titulo,
      descricao,
      usuario_afetado_id,
      modulo,
      dados,
      acao_sugerida,
      destinatarios
    ) VALUES (
      'erro_recorrente',
      v_alert_severidade,
      v_titulo,
      NEW.mensagem,
      NEW.usuario_id,
      NEW.modulo,
      jsonb_build_object(
        'erro_id', NEW.id,
        'tipo', NEW.tipo,
        'stack_trace', NEW.stack_trace
      ),
      NEW.solucao_sugerida,
      CASE 
        WHEN NEW.severidade = 'critica' THEN ARRAY['admin', 'ceo', 'devops']
        ELSE ARRAY['admin']
      END
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_alerta_erro ON system_errors;
CREATE TRIGGER trigger_alerta_erro
  AFTER INSERT ON system_errors
  FOR EACH ROW
  EXECUTE FUNCTION criar_alerta_erro_critico();

-- ============================================
-- 10. FUNÇÃO: BUSCAR ATIVIDADES DO USUÁRIO
-- ============================================

CREATE OR REPLACE FUNCTION buscar_atividades_usuario(
  p_usuario_email TEXT,
  p_dias_historico INTEGER DEFAULT 90
)
RETURNS TABLE (
  modulo TEXT,
  total_acoes BIGINT,
  acoes_unicas TEXT[],
  tempo_medio_ms NUMERIC,
  taxa_sucesso NUMERIC,
  periodo TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ua.modulo,
    COUNT(*) as total_acoes,
    array_agg(DISTINCT ua.acao) as acoes_unicas,
    ROUND(AVG(ua.tempo_execucao)::NUMERIC, 2) as tempo_medio_ms,
    ROUND((COUNT(*) FILTER (WHERE ua.sucesso = true)::NUMERIC / COUNT(*)::NUMERIC * 100), 2) as taxa_sucesso,
    ('Ultimos ' || p_dias_historico || ' dias')::TEXT as periodo
  FROM user_activities ua
  JOIN auth.users u ON u.id = ua.usuario_id
  WHERE u.email = p_usuario_email
    AND ua.criado_em >= NOW() - (p_dias_historico || ' days')::INTERVAL
  GROUP BY ua.modulo
  ORDER BY total_acoes DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION buscar_atividades_usuario IS 'Busca resumo de atividades de um usuario por email';

-- ============================================
-- 11. FUNÇÃO: COMPARAR USUÁRIOS (HANDOVER)
-- ============================================

CREATE OR REPLACE FUNCTION comparar_usuarios_handover(
  p_usuario_sainte_email TEXT,
  p_usuario_substituto_email TEXT
)
RETURNS TABLE (
  modulo TEXT,
  experiencia_sainte BIGINT,
  experiencia_substituto BIGINT,
  diferenca_experiencia BIGINT,
  precisa_treinamento BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  WITH sainte_stats AS (
    SELECT ua.modulo, COUNT(*) as total
    FROM user_activities ua
    JOIN auth.users u ON u.id = ua.usuario_id
    WHERE u.email = p_usuario_sainte_email
      AND ua.criado_em >= NOW() - INTERVAL '90 days'
    GROUP BY ua.modulo
  ),
  substituto_stats AS (
    SELECT ua.modulo, COUNT(*) as total
    FROM user_activities ua
    JOIN auth.users u ON u.id = ua.usuario_id
    WHERE u.email = p_usuario_substituto_email
      AND ua.criado_em >= NOW() - INTERVAL '90 days'
    GROUP BY ua.modulo
  )
  SELECT 
    COALESCE(s.modulo, sub.modulo) as modulo,
    COALESCE(s.total, 0) as experiencia_sainte,
    COALESCE(sub.total, 0) as experiencia_substituto,
    COALESCE(s.total, 0) - COALESCE(sub.total, 0) as diferenca_experiencia,
    CASE 
      WHEN COALESCE(sub.total, 0) < (COALESCE(s.total, 0) * 0.3) THEN true
      ELSE false
    END as precisa_treinamento
  FROM sainte_stats s
  FULL OUTER JOIN substituto_stats sub ON s.modulo = sub.modulo
  ORDER BY COALESCE(s.total, 0) DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION comparar_usuarios_handover IS 'Compara experiencia entre usuario que sai e substituto';

-- ============================================
-- 12. FUNÇÃO: DETECTAR COMPORTAMENTO ANÔMALO
-- ============================================

CREATE OR REPLACE FUNCTION detectar_comportamento_anomalo()
RETURNS TABLE (
  usuario_id UUID,
  anomalia TEXT,
  detalhes TEXT,
  severidade TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ubp.usuario_id,
    'taxa_erro_alta'::TEXT as anomalia,
    'Taxa de erro de ' || ROUND((ubp.taxa_erro_geral * 100)::NUMERIC, 2)::TEXT || '% esta acima do normal' as detalhes,
    'atencao'::TEXT as severidade
  FROM user_behavior_profile ubp
  WHERE ubp.taxa_erro_geral > 0.3
    AND ubp.total_atividades > 10
  
  UNION ALL
  
  SELECT 
    ubp.usuario_id,
    'inatividade_prolongada'::TEXT as anomalia,
    'Sem atividade ha ' || EXTRACT(day FROM (NOW() - ubp.ultima_atividade))::INTEGER::TEXT || ' dias' as detalhes,
    'info'::TEXT as severidade
  FROM user_behavior_profile ubp
  WHERE ubp.ultima_atividade < NOW() - INTERVAL '7 days'
    AND ubp.total_atividades > 10;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION detectar_comportamento_anomalo IS 'Detecta padroes anomalos de comportamento';

-- ============================================
-- ✅ MIGRAÇÃO CONCLUÍDA
-- ============================================

DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN (
      'user_activities',
      'user_behavior_profile',
      'user_handovers',
      'system_errors',
      'system_alerts',
      'user_training',
      'user_sessions'
    );
  
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ MIGRACAO 0013 CONCLUIDA!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Tabelas criadas: %', table_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Recursos implementados:';
  RAISE NOTICE '  ✅ Log completo de atividades';
  RAISE NOTICE '  ✅ Perfil comportamental';
  RAISE NOTICE '  ✅ Transferencia de responsabilidades';
  RAISE NOTICE '  ✅ Sistema de erros e alertas';
  RAISE NOTICE '  ✅ Alertas inteligentes e predicoes';
  RAISE NOTICE '  ✅ Sistema de treinamento';
  RAISE NOTICE '  ✅ Historico de sessoes';
  RAISE NOTICE '  ✅ Funcoes de analise comportamental';
  RAISE NOTICE '  ✅ Triggers automaticos';
  RAISE NOTICE '';
  RAISE NOTICE '🤖 Pronto para IA comportamental!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;


-- ============================================
-- Source: 20250126000000_edr_integration.sql
-- ============================================

-- ============================================
-- Migration: EDR (Enterprise Deep Research) Integration
-- Version: 1.0.0
-- Date: 2025-01-26
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- 1. EDR Research Sessions
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS edr_research_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Research metadata
  query TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'paused')),
  max_loops INTEGER DEFAULT 10 CHECK (max_loops > 0 AND max_loops <= 50),
  current_loop INTEGER DEFAULT 0,
  
  -- Configuration
  llm_provider VARCHAR(50) DEFAULT 'openai' CHECK (llm_provider IN ('openai', 'anthropic', 'google', 'groq', 'sambanova')),
  llm_model VARCHAR(100),
  search_provider VARCHAR(50) DEFAULT 'tavily' CHECK (search_provider IN ('tavily', 'brave', 'serper')),
  
  -- Steering & control
  steering_enabled BOOLEAN DEFAULT false,
  human_in_loop BOOLEAN DEFAULT false,
  
  -- Results
  final_report TEXT,
  report_url TEXT,
  visualization_data JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Audit & metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Constraints
  CONSTRAINT valid_loop_range CHECK (current_loop >= 0 AND current_loop <= max_loops)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_edr_sessions_org ON edr_research_sessions(organization_id);
CREATE INDEX IF NOT EXISTS idx_edr_sessions_user ON edr_research_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_edr_sessions_status ON edr_research_sessions(status);
CREATE INDEX IF NOT EXISTS idx_edr_sessions_created ON edr_research_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_edr_sessions_provider ON edr_research_sessions(llm_provider);

-- RLS policies
ALTER TABLE edr_research_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organization's research sessions"
  ON edr_research_sessions FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create research sessions"
  ON edr_research_sessions FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own sessions"
  ON edr_research_sessions FOR UPDATE
  USING (user_id = auth.uid());

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_edr_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER edr_sessions_updated_at
  BEFORE UPDATE ON edr_research_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_edr_sessions_updated_at();

-- ============================================
-- 2. EDR Agent Tasks (Decomposition)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS edr_agent_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES edr_research_sessions(id) ON DELETE CASCADE,
  
  -- Task hierarchy
  parent_task_id UUID REFERENCES edr_agent_tasks(id) ON DELETE CASCADE,
  task_order INTEGER DEFAULT 0,
  depth_level INTEGER DEFAULT 0,
  
  -- Task details
  agent_type VARCHAR(50) NOT NULL CHECK (agent_type IN ('master', 'general', 'academic', 'github', 'linkedin', 'visualization', 'reflection')),
  task_description TEXT NOT NULL,
  task_query TEXT,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped', 'cancelled')),
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  
  -- Results
  result TEXT,
  sources JSONB DEFAULT '[]'::jsonb,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  
  -- Execution metrics
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  retry_count INTEGER DEFAULT 0,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_edr_tasks_session ON edr_agent_tasks(session_id);
CREATE INDEX IF NOT EXISTS idx_edr_tasks_status ON edr_agent_tasks(status);
CREATE INDEX IF NOT EXISTS idx_edr_tasks_parent ON edr_agent_tasks(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_edr_tasks_agent ON edr_agent_tasks(agent_type);
CREATE INDEX IF NOT EXISTS idx_edr_tasks_priority ON edr_agent_tasks(priority DESC);
CREATE INDEX IF NOT EXISTS idx_edr_tasks_created ON edr_agent_tasks(created_at);

-- ============================================
-- 3. EDR Search Results (Cache)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS edr_search_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES edr_agent_tasks(id) ON DELETE CASCADE,
  
  -- Search metadata
  search_type VARCHAR(50) CHECK (search_type IN ('general', 'academic', 'github', 'linkedin', 'documentation')),
  query TEXT NOT NULL,
  query_hash TEXT, -- MD5 hash for deduplication
  
  -- Results
  url TEXT,
  title TEXT,
  snippet TEXT,
  content TEXT,
  score DECIMAL(3,2) CHECK (score >= 0 AND score <= 1),
  
  -- Source metadata
  source_type VARCHAR(50) CHECK (source_type IN ('web', 'paper', 'repo', 'profile', 'documentation', 'news')),
  author TEXT,
  published_date DATE,
  
  -- Vector embedding for similarity (OpenAI ada-002: 1536 dimensions)
  embedding vector(1536),
  
  -- Cache control
  cached BOOLEAN DEFAULT true,
  cache_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_edr_search_task ON edr_search_results(task_id);
CREATE INDEX IF NOT EXISTS idx_edr_search_type ON edr_search_results(search_type);
CREATE INDEX IF NOT EXISTS idx_edr_search_hash ON edr_search_results(query_hash);
CREATE INDEX IF NOT EXISTS idx_edr_search_cached ON edr_search_results(cached, cache_expires_at);

-- Vector similarity index (IVFFlat for faster approximate nearest neighbor search)
CREATE INDEX IF NOT EXISTS idx_edr_search_embedding ON edr_search_results 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ============================================
-- 4. EDR Reflection Logs
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS edr_reflection_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES edr_research_sessions(id) ON DELETE CASCADE,
  
  -- Reflection metadata
  loop_number INTEGER NOT NULL,
  reflection_type VARCHAR(50) CHECK (reflection_type IN ('gap_detection', 'quality_assessment', 'direction_update', 'synthesis')),
  
  -- Analysis
  knowledge_gaps JSONB DEFAULT '[]'::jsonb,
  quality_score DECIMAL(3,2) CHECK (quality_score >= 0 AND quality_score <= 1),
  coverage_score DECIMAL(3,2) CHECK (coverage_score >= 0 AND coverage_score <= 1),
  suggested_actions JSONB DEFAULT '[]'::jsonb,
  
  -- Reasoning
  reasoning TEXT,
  
  -- Human feedback
  human_feedback TEXT,
  human_steering JSONB,
  feedback_applied BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_edr_reflection_session ON edr_reflection_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_edr_reflection_loop ON edr_reflection_logs(loop_number);
CREATE INDEX IF NOT EXISTS idx_edr_reflection_type ON edr_reflection_logs(reflection_type);
CREATE INDEX IF NOT EXISTS idx_edr_reflection_created ON edr_reflection_logs(created_at DESC);

-- ============================================
-- 5. EDR Steering Commands
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS edr_steering_commands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES edr_research_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Command
  command_type VARCHAR(50) NOT NULL CHECK (command_type IN ('pause', 'resume', 'refine', 'expand', 'focus', 'stop', 'redirect', 'prioritize')),
  command_text TEXT,
  parameters JSONB DEFAULT '{}'::jsonb,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'rejected', 'expired')),
  applied_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  
  -- Impact
  impact_summary TEXT,
  tasks_affected JSONB DEFAULT '[]'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_edr_steering_session ON edr_steering_commands(session_id);
CREATE INDEX IF NOT EXISTS idx_edr_steering_user ON edr_steering_commands(user_id);
CREATE INDEX IF NOT EXISTS idx_edr_steering_status ON edr_steering_commands(status);
CREATE INDEX IF NOT EXISTS idx_edr_steering_type ON edr_steering_commands(command_type);
CREATE INDEX IF NOT EXISTS idx_edr_steering_created ON edr_steering_commands(created_at DESC);

-- ============================================
-- 6. EDR Visualizations
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS edr_visualizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES edr_research_sessions(id) ON DELETE CASCADE,
  
  -- Visualization metadata
  viz_type VARCHAR(50) CHECK (viz_type IN ('chart', 'graph', 'table', 'network', 'timeline', 'heatmap', 'treemap')),
  title TEXT,
  description TEXT,
  
  -- Data
  viz_data JSONB NOT NULL,
  viz_config JSONB DEFAULT '{}'::jsonb,
  
  -- Generated assets
  image_url TEXT,
  svg_data TEXT,
  
  -- Display
  order_position INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_edr_viz_session ON edr_visualizations(session_id);
CREATE INDEX IF NOT EXISTS idx_edr_viz_type ON edr_visualizations(viz_type);
CREATE INDEX IF NOT EXISTS idx_edr_viz_featured ON edr_visualizations(is_featured);
CREATE INDEX IF NOT EXISTS idx_edr_viz_order ON edr_visualizations(order_position);

-- Trigger for updated_at
CREATE TRIGGER edr_viz_updated_at
  BEFORE UPDATE ON edr_visualizations
  FOR EACH ROW
  EXECUTE FUNCTION update_edr_sessions_updated_at();

-- ============================================
-- 7. EDR Citations & References
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS edr_citations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES edr_research_sessions(id) ON DELETE CASCADE,
  search_result_id UUID REFERENCES edr_search_results(id) ON DELETE SET NULL,
  
  -- Citation details
  citation_text TEXT NOT NULL,
  citation_context TEXT,
  url TEXT,
  title TEXT,
  
  -- Source metadata
  author TEXT,
  published_date DATE,
  source_type VARCHAR(50),
  
  -- Citation metrics
  relevance_score DECIMAL(3,2),
  used_in_report BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_edr_citations_session ON edr_citations(session_id);
CREATE INDEX IF NOT EXISTS idx_edr_citations_search ON edr_citations(search_result_id);
CREATE INDEX IF NOT EXISTS idx_edr_citations_used ON edr_citations(used_in_report);

-- ============================================
-- 8. Views for Analytics
-- ============================================

-- Research session summary
CREATE OR REPLACE VIEW edr_session_summary AS
SELECT 
  s.id,
  s.query,
  s.status,
  s.current_loop,
  s.max_loops,
  s.llm_provider,
  s.created_at,
  s.completed_at,
  EXTRACT(EPOCH FROM (COALESCE(s.completed_at, NOW()) - s.created_at)) AS duration_seconds,
  COUNT(DISTINCT t.id) AS total_tasks,
  COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) AS completed_tasks,
  COUNT(DISTINCT r.id) AS total_reflections,
  COUNT(DISTINCT v.id) AS total_visualizations,
  AVG(r.quality_score) AS avg_quality_score
FROM edr_research_sessions s
LEFT JOIN edr_agent_tasks t ON t.session_id = s.id
LEFT JOIN edr_reflection_logs r ON r.session_id = s.id
LEFT JOIN edr_visualizations v ON v.session_id = s.id
GROUP BY s.id;

-- Agent performance metrics
CREATE OR REPLACE VIEW edr_agent_performance AS
SELECT 
  agent_type,
  COUNT(*) AS total_tasks,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed_tasks,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) AS failed_tasks,
  AVG(duration_ms) AS avg_duration_ms,
  AVG(confidence_score) AS avg_confidence
FROM edr_agent_tasks
GROUP BY agent_type;

-- ============================================
-- 9. Functions for EDR Operations
-- ============================================

-- Function to create a new research session
CREATE OR REPLACE FUNCTION create_edr_session(
  p_query TEXT,
  p_llm_provider VARCHAR(50) DEFAULT 'openai',
  p_max_loops INTEGER DEFAULT 10,
  p_steering_enabled BOOLEAN DEFAULT false
)
RETURNS UUID AS $$
DECLARE
  v_session_id UUID;
  v_org_id UUID;
BEGIN
  -- Get user's organization
  SELECT organization_id INTO v_org_id
  FROM user_organizations
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'User not associated with any organization';
  END IF;
  
  -- Create session
  INSERT INTO edr_research_sessions (
    query,
    llm_provider,
    max_loops,
    steering_enabled,
    organization_id,
    user_id,
    status
  ) VALUES (
    p_query,
    p_llm_provider,
    p_max_loops,
    p_steering_enabled,
    v_org_id,
    auth.uid(),
    'pending'
  )
  RETURNING id INTO v_session_id;
  
  RETURN v_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add steering command
CREATE OR REPLACE FUNCTION add_steering_command(
  p_session_id UUID,
  p_command_type VARCHAR(50),
  p_command_text TEXT DEFAULT NULL,
  p_parameters JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_command_id UUID;
BEGIN
  -- Verify user has access to session
  IF NOT EXISTS (
    SELECT 1 FROM edr_research_sessions
    WHERE id = p_session_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied to session';
  END IF;
  
  -- Create steering command
  INSERT INTO edr_steering_commands (
    session_id,
    user_id,
    command_type,
    command_text,
    parameters,
    status
  ) VALUES (
    p_session_id,
    auth.uid(),
    p_command_type,
    p_command_text,
    p_parameters,
    'pending'
  )
  RETURNING id INTO v_command_id;
  
  RETURN v_command_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 10. Grants
-- ============================================

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE ON edr_research_sessions TO authenticated;
GRANT SELECT, INSERT ON edr_agent_tasks TO authenticated;
GRANT SELECT ON edr_search_results TO authenticated;
GRANT SELECT, INSERT ON edr_reflection_logs TO authenticated;
GRANT SELECT, INSERT ON edr_steering_commands TO authenticated;
GRANT SELECT ON edr_visualizations TO authenticated;
GRANT SELECT ON edr_citations TO authenticated;

-- Grant access to views
GRANT SELECT ON edr_session_summary TO authenticated;
GRANT SELECT ON edr_agent_performance TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION create_edr_session TO authenticated;
GRANT EXECUTE ON FUNCTION add_steering_command TO authenticated;

-- ============================================
-- Migration Complete
-- ============================================

COMMENT ON TABLE edr_research_sessions IS 'Enterprise Deep Research: Research sessions with multi-agent orchestration';
COMMENT ON TABLE edr_agent_tasks IS 'EDR: Decomposed tasks for specialized agents (Master, General, Academic, GitHub, LinkedIn, Visualization)';
COMMENT ON TABLE edr_search_results IS 'EDR: Cached search results with vector embeddings for similarity search';
COMMENT ON TABLE edr_reflection_logs IS 'EDR: Reflection mechanism for knowledge gap detection and quality assessment';
COMMENT ON TABLE edr_steering_commands IS 'EDR: Human-in-the-loop steering commands for real-time research refinement';
COMMENT ON TABLE edr_visualizations IS 'EDR: Generated visualizations and data-driven insights';
COMMENT ON TABLE edr_citations IS 'EDR: Citations and references used in research reports';



-- ============================================
-- Source: 20250126000001_icarus_pro_master.sql
-- ============================================

-- ============================================
-- ICARUS-PRO: Master Migration
-- Complete Database Setup for Supabase
-- Version: 5.0.0
-- Date: 2025-01-26
-- ============================================

-- ============================================
-- EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gin;
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ============================================
-- 1. ORGANIZATIONS & USERS
-- ============================================

-- Organizations
CREATE TABLE IF NOT EXISTS IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  type VARCHAR(50) DEFAULT 'hospital' CHECK (type IN ('hospital', 'distributor', 'manufacturer', 'clinic')),
  cnpj VARCHAR(18) UNIQUE,
  email VARCHAR(255),
  phone VARCHAR(20),
  active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- User Organizations (Many-to-Many)
CREATE TABLE IF NOT EXISTS IF NOT EXISTS user_organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user', 'viewer')),
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);

-- Profiles
CREATE TABLE IF NOT EXISTS IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(200),
  avatar_url TEXT,
  phone VARCHAR(20),
  department VARCHAR(100),
  position VARCHAR(100),
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orgs_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_orgs_active ON organizations(active);
CREATE INDEX IF NOT EXISTS idx_user_orgs_user ON user_organizations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_orgs_org ON user_organizations(organization_id);
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);

-- RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organizations"
  ON organizations FOR SELECT
  USING (id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()));

CREATE POLICY "Users can view their org memberships"
  ON user_organizations FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- ============================================
-- 2. PERMISSIONS & RBAC
-- ============================================

-- Roles
CREATE TABLE IF NOT EXISTS IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Roles
CREATE TABLE IF NOT EXISTS IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role_id, organization_id)
);

-- Permissions
CREATE TABLE IF NOT EXISTS IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  resource VARCHAR(100),
  action VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Role Permissions
CREATE TABLE IF NOT EXISTS IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_org ON user_roles(organization_id);
CREATE INDEX IF NOT EXISTS idx_permissions_code ON permissions(code);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role_id);

-- RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. CONTACT MESSAGES
-- ============================================

CREATE TABLE IF NOT EXISTS IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  subject VARCHAR(500),
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_created ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_email ON contact_messages(email);

-- RLS
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view contact messages"
  ON contact_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'support')
    )
  );

-- ============================================
-- 4. ACTIVITY LOGS
-- ============================================

CREATE TABLE IF NOT EXISTS IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100),
  resource_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_org ON activity_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_activity_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_resource ON activity_logs(resource, resource_id);

-- RLS
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org's activity logs"
  ON activity_logs FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- 5. NOTIFICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notif_org ON notifications(organization_id);
CREATE INDEX IF NOT EXISTS idx_notif_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notif_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notif_priority ON notifications(priority);

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================
-- 6. FEATURE FLAGS
-- ============================================

CREATE TABLE IF NOT EXISTS IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT false,
  rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  target_users UUID[],
  target_organizations UUID[],
  conditions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_flags_key ON feature_flags(key);
CREATE INDEX IF NOT EXISTS idx_flags_enabled ON feature_flags(enabled);

-- RLS
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view enabled feature flags"
  ON feature_flags FOR SELECT
  USING (enabled = true);

-- ============================================
-- 7. SYSTEM SETTINGS
-- ============================================

CREATE TABLE IF NOT EXISTS IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  category VARCHAR(50),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_settings_key ON system_settings(key);
CREATE INDEX IF NOT EXISTS idx_settings_category ON system_settings(category);
CREATE INDEX IF NOT EXISTS idx_settings_public ON system_settings(is_public);

-- RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public settings"
  ON system_settings FOR SELECT
  USING (is_public = true);

-- ============================================
-- 8. AUDIT TRAIL
-- ============================================

CREATE TABLE IF NOT EXISTS IF NOT EXISTS audit_trail (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name VARCHAR(100) NOT NULL,
  record_id UUID NOT NULL,
  operation VARCHAR(10) NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB,
  changed_fields TEXT[],
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_table ON audit_trail(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_record ON audit_trail(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_operation ON audit_trail(operation);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_trail(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_org ON audit_trail(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_trail(created_at DESC);

-- RLS
ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view audit trail for their org"
  ON audit_trail FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- 9. STORAGE BUCKETS SETUP
-- ============================================

-- Create storage buckets (execute via Supabase dashboard or API)
-- INSERT INTO storage.buckets (id, name, public) VALUES
--   ('documentos-dpo', 'documentos-dpo', false),
--   ('notas-fiscais', 'notas-fiscais', false),
--   ('imagens-produtos', 'imagens-produtos', true),
--   ('relatorios', 'relatorios', false),
--   ('certificados', 'certificados', false),
--   ('avatares', 'avatares', true);

-- ============================================
-- 10. FUNCTIONS & TRIGGERS
-- ============================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables
CREATE TRIGGER organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER contact_messages_updated_at BEFORE UPDATE ON contact_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER system_settings_updated_at BEFORE UPDATE ON system_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER feature_flags_updated_at BEFORE UPDATE ON feature_flags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: Log activity
CREATE OR REPLACE FUNCTION log_activity(
  p_action VARCHAR,
  p_resource VARCHAR,
  p_resource_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_activity_id UUID;
  v_org_id UUID;
BEGIN
  -- Get user's primary organization
  SELECT organization_id INTO v_org_id
  FROM user_organizations
  WHERE user_id = auth.uid() AND is_primary = true
  LIMIT 1;
  
  INSERT INTO activity_logs (
    user_id,
    organization_id,
    action,
    resource,
    resource_id,
    details
  ) VALUES (
    auth.uid(),
    v_org_id,
    p_action,
    p_resource,
    p_resource_id,
    p_details
  )
  RETURNING id INTO v_activity_id;
  
  RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type VARCHAR,
  p_title VARCHAR,
  p_message TEXT,
  p_link TEXT DEFAULT NULL,
  p_priority VARCHAR DEFAULT 'normal'
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
  v_org_id UUID;
BEGIN
  -- Get user's primary organization
  SELECT organization_id INTO v_org_id
  FROM user_organizations
  WHERE user_id = p_user_id AND is_primary = true
  LIMIT 1;
  
  INSERT INTO notifications (
    user_id,
    organization_id,
    type,
    title,
    message,
    link,
    priority
  ) VALUES (
    p_user_id,
    v_org_id,
    p_type,
    p_title,
    p_message,
    p_link,
    p_priority
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Check feature flag
CREATE OR REPLACE FUNCTION is_feature_enabled(
  p_flag_key VARCHAR,
  p_user_id UUID DEFAULT auth.uid(),
  p_org_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_flag RECORD;
  v_random INTEGER;
BEGIN
  SELECT * INTO v_flag
  FROM feature_flags
  WHERE key = p_flag_key;
  
  -- Flag doesn't exist or is disabled
  IF NOT FOUND OR v_flag.enabled = false THEN
    RETURN false;
  END IF;
  
  -- Check target users
  IF p_user_id = ANY(v_flag.target_users) THEN
    RETURN true;
  END IF;
  
  -- Check target organizations
  IF p_org_id IS NOT NULL AND p_org_id = ANY(v_flag.target_organizations) THEN
    RETURN true;
  END IF;
  
  -- Check rollout percentage
  v_random := floor(random() * 100)::INTEGER;
  IF v_random < v_flag.rollout_percentage THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 11. INITIAL DATA
-- ============================================

-- Insert default roles
INSERT INTO roles (name, description, permissions) VALUES
  ('admin', 'Full system access', '["*"]'::jsonb),
  ('manager', 'Management access', '["read:*", "create:*", "update:*"]'::jsonb),
  ('user', 'Standard user access', '["read:*", "create:own", "update:own"]'::jsonb),
  ('viewer', 'Read-only access', '["read:*"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Insert default permissions
INSERT INTO permissions (code, name, resource, action) VALUES
  ('SYSTEM_ALL', 'Full System Access', '*', '*'),
  ('READ_ALL', 'Read All', '*', 'read'),
  ('CREATE_ALL', 'Create All', '*', 'create'),
  ('UPDATE_ALL', 'Update All', '*', 'update'),
  ('DELETE_ALL', 'Delete All', '*', 'delete')
ON CONFLICT (code) DO NOTHING;

-- Insert default settings
INSERT INTO system_settings (key, value, description, category, is_public) VALUES
  ('app_name', '"ICARUS v5.0"'::jsonb, 'Application name', 'general', true),
  ('app_version', '"5.0.0"'::jsonb, 'Application version', 'general', true),
  ('maintenance_mode', 'false'::jsonb, 'Maintenance mode flag', 'system', false),
  ('max_file_size_mb', '50'::jsonb, 'Maximum file upload size in MB', 'uploads', true),
  ('session_timeout_minutes', '480'::jsonb, 'Session timeout in minutes', 'security', false)
ON CONFLICT (key) DO NOTHING;

-- Insert default feature flags
INSERT INTO feature_flags (key, name, description, enabled) VALUES
  ('edr_research', 'EDR Research', 'Enable Enterprise Deep Research', true),
  ('gpt_researcher', 'GPT Researcher', 'Enable GPT Researcher chatbot', true),
  ('dark_mode', 'Dark Mode', 'Enable dark mode', true),
  ('advanced_analytics', 'Advanced Analytics', 'Enable advanced analytics dashboard', false),
  ('realtime_collaboration', 'Realtime Collaboration', 'Enable realtime collaboration features', false)
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- 12. GRANTS
-- ============================================

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE ON organizations TO authenticated;
GRANT SELECT, INSERT ON user_organizations TO authenticated;
GRANT SELECT, UPDATE ON profiles TO authenticated;
GRANT SELECT ON roles TO authenticated;
GRANT SELECT ON permissions TO authenticated;
GRANT SELECT, INSERT ON contact_messages TO authenticated;
GRANT SELECT ON activity_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON notifications TO authenticated;
GRANT SELECT ON feature_flags TO authenticated;
GRANT SELECT ON system_settings TO authenticated;
GRANT SELECT ON audit_trail TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION log_activity TO authenticated;
GRANT EXECUTE ON FUNCTION create_notification TO authenticated;
GRANT EXECUTE ON FUNCTION is_feature_enabled TO authenticated;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

COMMENT ON SCHEMA public IS 'ICARUS-PRO v5.0 - Complete Database Schema';



-- ============================================
-- Source: 20251018_entregas.sql
-- ============================================

-- Migration: Tabela de Entregas/Logística
-- Data: 2025-10-18
-- Descrição: Sistema completo de logística e rastreamento de entregas

-- Criar tabela de entregas
CREATE TABLE IF NOT EXISTS IF NOT EXISTS entregas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_rastreio VARCHAR(50) UNIQUE NOT NULL,
  
  -- Origem
  origem_tipo VARCHAR(20) CHECK (origem_tipo IN ('deposito', 'fornecedor', 'hospital')),
  origem_id UUID,
  origem_nome VARCHAR(255) NOT NULL,
  origem_endereco TEXT NOT NULL,
  origem_cidade VARCHAR(100),
  origem_estado VARCHAR(2),
  origem_cep VARCHAR(10),
  
  -- Destino
  destino_tipo VARCHAR(20) CHECK (destino_tipo IN ('hospital', 'medico', 'clinica', 'deposito')),
  destino_id UUID,
  destino_nome VARCHAR(255) NOT NULL,
  destino_endereco TEXT NOT NULL,
  destino_cidade VARCHAR(100),
  destino_estado VARCHAR(2),
  destino_cep VARCHAR(10),
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pendente' 
    CHECK (status IN ('pendente', 'coletado', 'em_transito', 'saiu_entrega', 'entregue', 'devolvido', 'cancelado')),
  
  -- Datas
  data_coleta TIMESTAMP WITH TIME ZONE,
  data_previsao DATE,
  data_entrega TIMESTAMP WITH TIME ZONE,
  
  -- Transportadora
  transportadora VARCHAR(100),
  tipo_entrega VARCHAR(30) CHECK (tipo_entrega IN ('normal', 'expressa', 'urgente')),
  valor_frete DECIMAL(10,2),
  
  -- Relacionamentos
  pedido_id UUID REFERENCES pedidos_compra(id),
  cirurgia_id UUID REFERENCES cirurgias(id),
  
  -- Materiais
  peso_kg DECIMAL(10,2),
  volumes INTEGER DEFAULT 1,
  nota_fiscal VARCHAR(20),
  
  -- Observações
  observacoes TEXT,
  ocorrencias TEXT,
  
  -- Responsável
  motorista VARCHAR(100),
  veiculo_placa VARCHAR(10),
  telefone_contato VARCHAR(20),
  
  -- Assinaturas
  assinado_por VARCHAR(255),
  assinado_em TIMESTAMP WITH TIME ZONE,
  documento_assinante VARCHAR(20),
  
  -- Auditoria
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- Tabela de histórico de rastreamento
CREATE TABLE IF NOT EXISTS IF NOT EXISTS entrega_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entrega_id UUID REFERENCES entregas(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL,
  localizacao TEXT,
  cidade VARCHAR(100),
  estado VARCHAR(2),
  observacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_entregas_codigo_rastreio ON entregas(codigo_rastreio);
CREATE INDEX IF NOT EXISTS idx_entregas_status ON entregas(status);
CREATE INDEX IF NOT EXISTS idx_entregas_data_previsao ON entregas(data_previsao);
CREATE INDEX IF NOT EXISTS idx_entregas_pedido_id ON entregas(pedido_id);
CREATE INDEX IF NOT EXISTS idx_entregas_cirurgia_id ON entregas(cirurgia_id);
CREATE INDEX IF NOT EXISTS idx_entregas_destino_cidade ON entregas(destino_cidade);
CREATE INDEX IF NOT EXISTS idx_entrega_historico_entrega_id ON entrega_historico(entrega_id);
CREATE INDEX IF NOT EXISTS idx_entrega_historico_created_at ON entrega_historico(created_at DESC);

-- Trigger para updated_at
CREATE TRIGGER update_entregas_updated_at
  BEFORE UPDATE ON entregas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Função para adicionar histórico automaticamente
CREATE OR REPLACE FUNCTION add_entrega_historico()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO entrega_historico (entrega_id, status, observacao)
    VALUES (NEW.id, NEW.status, 'Entrega criada no sistema');
  ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO entrega_historico (entrega_id, status, observacao)
    VALUES (NEW.id, NEW.status, 'Status atualizado');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para histórico automático
CREATE TRIGGER entrega_status_history
  AFTER INSERT OR UPDATE ON entregas
  FOR EACH ROW
  EXECUTE FUNCTION add_entrega_historico();

-- Comentários
COMMENT ON TABLE entregas IS 'Tabela de gestão de entregas e logística';
COMMENT ON TABLE entrega_historico IS 'Histórico completo de rastreamento das entregas';
COMMENT ON COLUMN entregas.codigo_rastreio IS 'Código único para rastreamento da entrega';

-- Dados mock para desenvolvimento
INSERT INTO entregas (
  codigo_rastreio, origem_tipo, origem_nome, origem_endereco, origem_cidade, origem_estado, origem_cep,
  destino_tipo, destino_nome, destino_endereco, destino_cidade, destino_estado, destino_cep,
  status, data_coleta, data_previsao, transportadora, tipo_entrega, valor_frete, volumes, peso_kg
) VALUES
  ('ENT001', 'deposito', 'Depósito Central', 'Rua A, 100', 'São Paulo', 'SP', '01000-000',
   'hospital', 'Hospital São Lucas', 'Av. Principal, 500', 'São Paulo', 'SP', '02000-000',
   'em_transito', NOW() - INTERVAL '2 hours', CURRENT_DATE + 1, 'Transportadora Express', 'expressa', 150.00, 3, 25.5),
   
  ('ENT002', 'fornecedor', 'Fornecedor Premium OPME', 'Rua B, 200', 'Rio de Janeiro', 'RJ', '20000-000',
   'hospital', 'Hospital Sírio-Libanês', 'Rua Hospital, 300', 'São Paulo', 'SP', '03000-000',
   'saiu_entrega', NOW() - INTERVAL '1 hour', CURRENT_DATE, 'Logística Rápida', 'urgente', 280.00, 2, 15.0),
   
  ('ENT003', 'deposito', 'Depósito Zona Sul', 'Av. Sul, 400', 'São Paulo', 'SP', '04000-000',
   'clinica', 'Clínica Ortopédica', 'Rua Clínica, 50', 'Campinas', 'SP', '13000-000',
   'pendente', NULL, CURRENT_DATE + 2, 'Transportadora Nacional', 'normal', 95.00, 1, 8.0);



-- ============================================
-- Source: 20251018_faturas.sql
-- ============================================

-- Migration: Tabela de Faturas/NF-e
-- Data: 2025-10-18
-- Descrição: Sistema completo de faturamento e notas fiscais

-- Criar tabela de faturas
CREATE TABLE IF NOT EXISTS IF NOT EXISTS faturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_nfe VARCHAR(20) UNIQUE NOT NULL,
  serie VARCHAR(10) NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('nfe', 'nfse', 'cte', 'mdfe')),
  
  -- Cliente/Destinatário
  cliente_tipo VARCHAR(10) CHECK (cliente_tipo IN ('medico', 'hospital', 'outro')),
  cliente_id UUID,
  cliente_nome VARCHAR(255) NOT NULL,
  cliente_cpf_cnpj VARCHAR(18) NOT NULL,
  
  -- Datas
  data_emissao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_vencimento DATE,
  data_pagamento TIMESTAMP WITH TIME ZONE,
  
  -- Valores
  valor_produtos DECIMAL(15,2) NOT NULL DEFAULT 0,
  valor_desconto DECIMAL(15,2) DEFAULT 0,
  valor_frete DECIMAL(15,2) DEFAULT 0,
  valor_impostos DECIMAL(15,2) DEFAULT 0,
  valor_total DECIMAL(15,2) NOT NULL,
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pendente' 
    CHECK (status IN ('rascunho', 'pendente', 'emitida', 'autorizada', 'cancelada', 'paga')),
  status_sefaz VARCHAR(30),
  
  -- Chave de Acesso NFe
  chave_acesso VARCHAR(44),
  protocolo_autorizacao VARCHAR(20),
  
  -- Relacionamentos
  pedido_id UUID REFERENCES pedidos_compra(id),
  cirurgia_id UUID REFERENCES cirurgias(id),
  
  -- Informações Fiscais
  natureza_operacao VARCHAR(100),
  cfop VARCHAR(10),
  forma_pagamento VARCHAR(20),
  
  -- XML e Arquivos
  xml_nfe TEXT,
  pdf_url TEXT,
  
  -- Observações
  observacoes TEXT,
  observacoes_internas TEXT,
  
  -- Auditoria
  emitida_por UUID REFERENCES profiles(id),
  cancelada_por UUID REFERENCES profiles(id),
  motivo_cancelamento TEXT,
  data_cancelamento TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_faturas_numero_nfe ON faturas(numero_nfe);
CREATE INDEX IF NOT EXISTS idx_faturas_cliente_cpf_cnpj ON faturas(cliente_cpf_cnpj);
CREATE INDEX IF NOT EXISTS idx_faturas_status ON faturas(status);
CREATE INDEX IF NOT EXISTS idx_faturas_data_emissao ON faturas(data_emissao DESC);
CREATE INDEX IF NOT EXISTS idx_faturas_chave_acesso ON faturas(chave_acesso);
CREATE INDEX IF NOT EXISTS idx_faturas_pedido_id ON faturas(pedido_id);

-- Trigger para updated_at
CREATE TRIGGER update_faturas_updated_at
  BEFORE UPDATE ON faturas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE faturas IS 'Tabela de gestão de faturas e notas fiscais eletrônicas';
COMMENT ON COLUMN faturas.chave_acesso IS 'Chave de acesso de 44 dígitos da NF-e';
COMMENT ON COLUMN faturas.status_sefaz IS 'Status de autorização junto à SEFAZ';

-- Dados mock para desenvolvimento
INSERT INTO faturas (
  numero_nfe, serie, tipo, cliente_tipo, cliente_nome, cliente_cpf_cnpj,
  data_emissao, data_vencimento, valor_produtos, valor_total,
  status, natureza_operacao, cfop, forma_pagamento
) VALUES
  ('000001', '1', 'nfe', 'hospital', 'Hospital São Lucas', '12.345.678/0001-90',
   NOW(), NOW() + INTERVAL '30 days', 15000.00, 15000.00,
   'autorizada', 'Venda de mercadoria', '5102', 'boleto'),
   
  ('000002', '1', 'nfe', 'medico', 'Dr. Roberto Silva', '123.456.789-00',
   NOW() - INTERVAL '10 days', NOW() + INTERVAL '20 days', 8500.00, 8500.00,
   'emitida', 'Venda de mercadoria', '5102', 'pix'),
   
  ('000003', '1', 'nfe', 'hospital', 'Hospital Sírio-Libanês', '98.765.432/0001-10',
   NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days', 22000.00, 22000.00,
   'pendente', 'Venda de mercadoria', '5102', 'transferencia');



-- ============================================
-- Source: 20251018_initial_schema.sql
-- ============================================

-- ============================================
-- ICARUS v5.0 - Supabase Database Schema
-- Sistema de Gestão Cirúrgica OPME
-- ============================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. TABELA: profiles (Usuários do Sistema)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('admin', 'medico', 'financeiro', 'estoque', 'vendas')) DEFAULT 'medico',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index para busca rápida por email
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_profiles_email ON profiles(email);

-- ============================================
-- 2. TABELA: medicos (Médicos Cirurgiões)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS medicos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  crm TEXT NOT NULL,
  crm_uf TEXT NOT NULL CHECK (LENGTH(crm_uf) = 2),
  especialidade TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  cep TEXT,
  endereco TEXT,
  hospital_principal TEXT,
  volume_anual_estimado DECIMAL(12, 2),
  taxa_sucesso DECIMAL(5, 2) DEFAULT 0,
  cirurgias_realizadas INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('ativo', 'inativo', 'suspenso')) DEFAULT 'ativo',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(crm, crm_uf)
);

-- Índices para busca e performance
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_medicos_crm ON medicos(crm);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_medicos_especialidade ON medicos(especialidade);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_medicos_status ON medicos(status);

-- ============================================
-- 3. TABELA: hospitais (Hospitais & Clínicas)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS hospitais (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome TEXT NOT NULL,
  cnpj TEXT UNIQUE,
  telefone TEXT,
  email TEXT,
  cep TEXT,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  tipo TEXT CHECK (tipo IN ('hospital', 'clinica', 'centro_cirurgico')) DEFAULT 'hospital',
  status TEXT CHECK (status IN ('ativo', 'inativo')) DEFAULT 'ativo',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. TABELA: cirurgias (Cirurgias & Procedimentos)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS cirurgias (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  medico_id UUID REFERENCES medicos(id) ON DELETE SET NULL,
  hospital_id UUID REFERENCES hospitais(id) ON DELETE SET NULL,
  paciente_nome TEXT NOT NULL,
  procedimento TEXT NOT NULL,
  data_cirurgia DATE NOT NULL,
  hora_cirurgia TIME NOT NULL,
  sala TEXT,
  status TEXT CHECK (status IN ('agendada', 'confirmada', 'preparacao', 'andamento', 'recuperacao', 'concluida', 'cancelada')) DEFAULT 'agendada',
  prioridade TEXT CHECK (prioridade IN ('baixa', 'media', 'alta', 'urgente')) DEFAULT 'media',
  observacoes TEXT,
  valor_estimado DECIMAL(12, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_cirurgias_medico ON cirurgias(medico_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_cirurgias_hospital ON cirurgias(hospital_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_cirurgias_data ON cirurgias(data_cirurgia);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_cirurgias_status ON cirurgias(status);

-- ============================================
-- 5. TABELA: materiais_opme (Materiais Cirúrgicos)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS materiais_opme (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  codigo TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  fabricante TEXT,
  categoria TEXT,
  valor_unitario DECIMAL(12, 2),
  estoque_minimo INTEGER DEFAULT 0,
  estoque_atual INTEGER DEFAULT 0,
  unidade_medida TEXT DEFAULT 'UN',
  status TEXT CHECK (status IN ('ativo', 'inativo', 'descontinuado')) DEFAULT 'ativo',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. TABELA: cirurgia_materiais (Relação N:N)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS cirurgia_materiais (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cirurgia_id UUID REFERENCES cirurgias(id) ON DELETE CASCADE,
  material_id UUID REFERENCES materiais_opme(id) ON DELETE CASCADE,
  quantidade INTEGER NOT NULL DEFAULT 1,
  valor_unitario DECIMAL(12, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cirurgia_id, material_id)
);

-- ============================================
-- 7. TABELA: leads (CRM & Vendas)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome TEXT NOT NULL,
  empresa TEXT,
  cargo TEXT,
  email TEXT,
  telefone TEXT,
  valor_estimado DECIMAL(12, 2),
  estagio TEXT CHECK (estagio IN ('prospeccao', 'qualificacao', 'proposta', 'negociacao', 'fechamento', 'perdido')) DEFAULT 'prospeccao',
  probabilidade INTEGER CHECK (probabilidade >= 0 AND probabilidade <= 100) DEFAULT 50,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  proxima_acao TEXT,
  data_ultimo_contato DATE,
  responsavel_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. TABELA: transacoes (Financeiro)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS transacoes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tipo TEXT CHECK (tipo IN ('receita', 'despesa')) NOT NULL,
  categoria TEXT NOT NULL,
  descricao TEXT NOT NULL,
  valor DECIMAL(12, 2) NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status TEXT CHECK (status IN ('pendente', 'pago', 'vencido', 'cancelado')) DEFAULT 'pendente',
  forma_pagamento TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. TABELA: fornecedores (Compras)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS fornecedores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome TEXT NOT NULL,
  cnpj TEXT UNIQUE,
  email TEXT,
  telefone TEXT,
  endereco TEXT,
  categoria TEXT,
  rating DECIMAL(3, 2) CHECK (rating >= 0 AND rating <= 5),
  volume_compras DECIMAL(12, 2) DEFAULT 0,
  status TEXT CHECK (status IN ('ativo', 'inativo', 'bloqueado')) DEFAULT 'ativo',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 10. TABELA: pedidos_compra (Compras)
-- ============================================
CREATE TABLE IF NOT EXISTS IF NOT EXISTS pedidos_compra (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  numero TEXT UNIQUE NOT NULL,
  fornecedor_id UUID REFERENCES fornecedores(id) ON DELETE SET NULL,
  valor_total DECIMAL(12, 2) NOT NULL,
  status TEXT CHECK (status IN ('aguardando', 'aprovado', 'processando', 'entregue', 'cancelado')) DEFAULT 'aguardando',
  urgencia TEXT CHECK (urgencia IN ('normal', 'urgente', 'critico')) DEFAULT 'normal',
  data_pedido DATE DEFAULT CURRENT_DATE,
  data_entrega_prevista DATE,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRIGGERS: Updated_at automático
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medicos_updated_at BEFORE UPDATE ON medicos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hospitais_updated_at BEFORE UPDATE ON hospitais FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cirurgias_updated_at BEFORE UPDATE ON cirurgias FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_materiais_opme_updated_at BEFORE UPDATE ON materiais_opme FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transacoes_updated_at BEFORE UPDATE ON transacoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fornecedores_updated_at BEFORE UPDATE ON fornecedores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pedidos_compra_updated_at BEFORE UPDATE ON pedidos_compra FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS: Estatísticas e Relatórios
-- ============================================

-- View: Estatísticas de Cirurgias por Médico
CREATE OR REPLACE VIEW view_medicos_stats AS
SELECT 
  m.id,
  m.nome,
  m.especialidade,
  COUNT(c.id) AS total_cirurgias,
  AVG(c.valor_estimado) AS ticket_medio,
  SUM(c.valor_estimado) AS faturamento_total
FROM medicos m
LEFT JOIN cirurgias c ON m.id = c.medico_id
WHERE m.status = 'ativo'
GROUP BY m.id, m.nome, m.especialidade;

-- View: Dashboard Financeiro
CREATE OR REPLACE VIEW view_dashboard_financeiro AS
SELECT 
  SUM(CASE WHEN tipo = 'receita' AND status = 'pago' THEN valor ELSE 0 END) AS receitas_recebidas,
  SUM(CASE WHEN tipo = 'despesa' AND status = 'pago' THEN valor ELSE 0 END) AS despesas_pagas,
  SUM(CASE WHEN tipo = 'receita' AND status = 'pendente' THEN valor ELSE 0 END) AS receitas_pendentes,
  SUM(CASE WHEN tipo = 'despesa' AND status = 'pendente' THEN valor ELSE 0 END) AS despesas_pendentes
FROM transacoes
WHERE DATE_PART('month', data_vencimento) = DATE_PART('month', CURRENT_DATE);

-- ============================================
-- FUNÇÕES: Lógica de Negócio
-- ============================================

-- Função: Atualizar estoque de materiais
CREATE OR REPLACE FUNCTION atualizar_estoque_material(
  p_material_id UUID,
  p_quantidade INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE materiais_opme
  SET estoque_atual = estoque_atual + p_quantidade
  WHERE id = p_material_id;
END;
$$ LANGUAGE plpgsql;

-- Função: Calcular taxa de sucesso do médico
CREATE OR REPLACE FUNCTION calcular_taxa_sucesso_medico(p_medico_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  total_cirurgias INTEGER;
  cirurgias_sucesso INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_cirurgias
  FROM cirurgias
  WHERE medico_id = p_medico_id AND status = 'concluida';
  
  SELECT COUNT(*) INTO cirurgias_sucesso
  FROM cirurgias
  WHERE medico_id = p_medico_id AND status = 'concluida';
  
  IF total_cirurgias = 0 THEN
    RETURN 0;
  END IF;
  
  RETURN (cirurgias_sucesso::DECIMAL / total_cirurgias::DECIMAL) * 100;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DADOS MOCK: Para desenvolvimento
-- ============================================

-- Inserir médicos de exemplo
INSERT INTO medicos (nome, crm, crm_uf, especialidade, telefone, email, hospital_principal, taxa_sucesso, cirurgias_realizadas) VALUES
('Dr. Roberto Silva', '123456', 'SP', 'Ortopedia', '(11) 98765-4321', 'roberto@hospital.com', 'Hospital São Lucas', 98.5, 12),
('Dra. Ana Paula Costa', '234567', 'RJ', 'Cardiologia', '(21) 97654-3210', 'ana@hospital.com', 'Hospital Sírio-Libanês', 99.2, 15),
('Dr. Carlos Mendes', '345678', 'SP', 'Neurocirurgia', '(11) 96543-2109', 'carlos@hospital.com', 'Hospital Israelita', 97.8, 8),
('Dra. Maria Santos', '456789', 'RJ', 'Ortopedia', '(21) 95432-1098', 'maria@hospital.com', 'Hospital Copa D''Or', 98.9, 18)
ON CONFLICT (crm, crm_uf) DO NOTHING;

-- Inserir hospitais de exemplo
INSERT INTO hospitais (nome, cnpj, cidade, estado, tipo) VALUES
('Hospital São Lucas', '12345678000190', 'São Paulo', 'SP', 'hospital'),
('Hospital Sírio-Libanês', '23456789000191', 'São Paulo', 'SP', 'hospital'),
('Hospital Israelita', '34567890000192', 'São Paulo', 'SP', 'hospital'),
('Hospital Copa D''Or', '45678900000193', 'Rio de Janeiro', 'RJ', 'hospital')
ON CONFLICT (cnpj) DO NOTHING;

-- Inserir materiais OPME de exemplo
INSERT INTO materiais_opme (codigo, nome, fabricante, categoria, valor_unitario, estoque_atual) VALUES
('OPME-001', 'Prótese de Joelho', 'Stryker', 'Ortopedia', 15000.00, 10),
('OPME-002', 'Stent Cardíaco', 'Medtronic', 'Cardiologia', 8500.00, 25),
('OPME-003', 'Placa de Fixação Coluna', 'DePuy Synthes', 'Neurocirurgia', 12000.00, 15)
ON CONFLICT (codigo) DO NOTHING;

-- ============================================
-- COMENTÁRIOS FINAIS
-- ============================================
COMMENT ON TABLE medicos IS 'Cadastro de médicos cirurgiões do sistema';
COMMENT ON TABLE cirurgias IS 'Gestão de cirurgias e procedimentos';
COMMENT ON TABLE materiais_opme IS 'Catálogo de materiais OPME';
COMMENT ON TABLE leads IS 'Pipeline de vendas CRM';
COMMENT ON TABLE transacoes IS 'Gestão financeira (receitas/despesas)';



-- ============================================
-- Source: 20251018_rls_policies.sql
-- ============================================

-- ============================================
-- ICARUS v5.0 - Row Level Security (RLS)
-- Políticas de Segurança Supabase
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitais ENABLE ROW LEVEL SECURITY;
ALTER TABLE cirurgias ENABLE ROW LEVEL SECURITY;
ALTER TABLE materiais_opme ENABLE ROW LEVEL SECURITY;
ALTER TABLE cirurgia_materiais ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos_compra ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS: profiles
-- ============================================

-- Usuários podem ver seu próprio perfil
CREATE POLICY "Usuários podem ver próprio perfil"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Usuários podem atualizar seu próprio perfil
CREATE POLICY "Usuários podem atualizar próprio perfil"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins podem ver todos os perfis
CREATE POLICY "Admins podem ver todos os perfis"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- POLÍTICAS: medicos
-- ============================================

-- Todos usuários autenticados podem ler médicos
CREATE POLICY "Usuários autenticados podem ler médicos"
  ON medicos FOR SELECT
  TO authenticated
  USING (true);

-- Apenas admins e usuários financeiros podem criar médicos
CREATE POLICY "Admins/Financeiro podem criar médicos"
  ON medicos FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'financeiro')
    )
  );

-- Apenas admins e usuários financeiros podem atualizar médicos
CREATE POLICY "Admins/Financeiro podem atualizar médicos"
  ON medicos FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'financeiro')
    )
  );

-- Apenas admins podem deletar médicos
CREATE POLICY "Apenas admins podem deletar médicos"
  ON medicos FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- POLÍTICAS: hospitais
-- ============================================

-- Todos usuários autenticados podem ler hospitais
CREATE POLICY "Usuários autenticados podem ler hospitais"
  ON hospitais FOR SELECT
  TO authenticated
  USING (true);

-- Apenas admins podem criar/atualizar/deletar hospitais
CREATE POLICY "Apenas admins podem gerenciar hospitais"
  ON hospitais FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- POLÍTICAS: cirurgias
-- ============================================

-- Usuários autenticados podem ler cirurgias
CREATE POLICY "Usuários autenticados podem ler cirurgias"
  ON cirurgias FOR SELECT
  TO authenticated
  USING (true);

-- Médicos podem criar cirurgias
CREATE POLICY "Médicos podem criar cirurgias"
  ON cirurgias FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'medico')
    )
  );

-- Médicos e admins podem atualizar cirurgias
CREATE POLICY "Médicos/Admins podem atualizar cirurgias"
  ON cirurgias FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'medico')
    )
  );

-- Apenas admins podem deletar cirurgias
CREATE POLICY "Apenas admins podem deletar cirurgias"
  ON cirurgias FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- POLÍTICAS: materiais_opme
-- ============================================

-- Todos usuários autenticados podem ler materiais
CREATE POLICY "Usuários autenticados podem ler materiais"
  ON materiais_opme FOR SELECT
  TO authenticated
  USING (true);

-- Apenas usuários de estoque e admins podem gerenciar materiais
CREATE POLICY "Estoque/Admins podem gerenciar materiais"
  ON materiais_opme FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'estoque')
    )
  );

-- ============================================
-- POLÍTICAS: cirurgia_materiais
-- ============================================

-- Usuários autenticados podem ler materiais de cirurgias
CREATE POLICY "Usuários autenticados podem ler cirurgia_materiais"
  ON cirurgia_materiais FOR SELECT
  TO authenticated
  USING (true);

-- Médicos e estoque podem criar vínculos
CREATE POLICY "Médicos/Estoque podem criar cirurgia_materiais"
  ON cirurgia_materiais FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'medico', 'estoque')
    )
  );

-- ============================================
-- POLÍTICAS: leads
-- ============================================

-- Usuários de vendas podem ler todos os leads
CREATE POLICY "Vendas podem ler leads"
  ON leads FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'vendas')
    )
  );

-- Vendedores podem criar leads
CREATE POLICY "Vendas podem criar leads"
  ON leads FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'vendas')
    )
  );

-- Vendedores podem atualizar seus próprios leads
CREATE POLICY "Vendas podem atualizar próprios leads"
  ON leads FOR UPDATE
  TO authenticated
  USING (
    responsavel_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- POLÍTICAS: transacoes
-- ============================================

-- Usuários financeiros e admins podem ler transações
CREATE POLICY "Financeiro/Admins podem ler transações"
  ON transacoes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'financeiro')
    )
  );

-- Apenas usuários financeiros e admins podem criar transações
CREATE POLICY "Financeiro/Admins podem criar transações"
  ON transacoes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'financeiro')
    )
  );

-- Apenas usuários financeiros e admins podem atualizar transações
CREATE POLICY "Financeiro/Admins podem atualizar transações"
  ON transacoes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'financeiro')
    )
  );

-- ============================================
-- POLÍTICAS: fornecedores
-- ============================================

-- Usuários autenticados podem ler fornecedores
CREATE POLICY "Usuários autenticados podem ler fornecedores"
  ON fornecedores FOR SELECT
  TO authenticated
  USING (true);

-- Apenas admins e estoque podem gerenciar fornecedores
CREATE POLICY "Admins/Estoque podem gerenciar fornecedores"
  ON fornecedores FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'estoque')
    )
  );

-- ============================================
-- POLÍTICAS: pedidos_compra
-- ============================================

-- Usuários de estoque podem ler pedidos
CREATE POLICY "Estoque pode ler pedidos"
  ON pedidos_compra FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'estoque', 'financeiro')
    )
  );

-- Usuários de estoque podem criar pedidos
CREATE POLICY "Estoque pode criar pedidos"
  ON pedidos_compra FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'estoque')
    )
  );

-- Usuários de estoque e financeiro podem atualizar pedidos
CREATE POLICY "Estoque/Financeiro podem atualizar pedidos"
  ON pedidos_compra FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'estoque', 'financeiro')
    )
  );

-- ============================================
-- FUNÇÃO: Criar perfil automaticamente no signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- COMENTÁRIOS
-- ============================================
COMMENT ON POLICY "Usuários podem ver próprio perfil" ON profiles IS 'Permite que usuários vejam apenas seu próprio perfil';
COMMENT ON POLICY "Admins podem ver todos os perfis" ON profiles IS 'Administradores têm acesso total aos perfis';
COMMENT ON POLICY "Médicos podem criar cirurgias" ON cirurgias IS 'Médicos autenticados podem criar novas cirurgias';



-- ============================================
-- Source: 20251019_chatbot_navegacao_ptbr.sql
-- ============================================

-- ============================================
-- CHATBOT IA + NAVEGAÇÃO - SCHEMA PORTUGUÊS
-- Sistema: ICARUS v5.0
-- Versão: 1.0.0
-- Data: Outubro 2025
-- Compliance: LGPD
-- ============================================

-- ============================================
-- TABELAS DO CHATBOT IA
-- ============================================

-- Conversas do Chatbot
CREATE TABLE IF NOT EXISTS IF NOT EXISTS chatbot_conversas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  
  data_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_fim TIMESTAMP WITH TIME ZONE,
  
  status VARCHAR(20) DEFAULT 'ativa' CHECK (status IN ('ativa', 'finalizada', 'abandonada')),
  
  total_mensagens INTEGER DEFAULT 0,
  satisfacao_usuario INTEGER CHECK (satisfacao_usuario BETWEEN 1 AND 5),
  
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mensagens do Chatbot
CREATE TABLE IF NOT EXISTS IF NOT EXISTS chatbot_mensagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversa_id UUID REFERENCES chatbot_conversas(id) ON DELETE CASCADE,
  
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('usuario', 'assistente', 'sistema')),
  conteudo TEXT NOT NULL,
  
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadata de IA (intent, sentiment, confidence, entities)
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Intenções do Chatbot (Intent Catalog)
CREATE TABLE IF NOT EXISTS IF NOT EXISTS chatbot_intencoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  nome VARCHAR(100) UNIQUE NOT NULL,
  categoria VARCHAR(50),
  
  padroes TEXT[] DEFAULT '{}', -- Padrões regex
  palavras_chave TEXT[] DEFAULT '{}',
  variacoes TEXT[] DEFAULT '{}',
  
  resposta_padrao TEXT,
  
  ativo BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FAQs do Chatbot
CREATE TABLE IF NOT EXISTS IF NOT EXISTS chatbot_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  pergunta TEXT NOT NULL,
  resposta TEXT NOT NULL,
  categoria VARCHAR(50),
  
  palavras_chave TEXT[] DEFAULT '{}',
  variacoes TEXT[] DEFAULT '{}',
  
  total_acessos INTEGER DEFAULT 0,
  ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  ativo BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Treinamento do Chatbot
CREATE TABLE IF NOT EXISTS IF NOT EXISTS chatbot_treinamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  input TEXT NOT NULL,
  output_esperado TEXT NOT NULL,
  
  intencao VARCHAR(100),
  entidades JSONB DEFAULT '{}',
  
  usado_em_treino BOOLEAN DEFAULT FALSE,
  data_treino TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Métricas do Chatbot
CREATE TABLE IF NOT EXISTS IF NOT EXISTS chatbot_metricas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  data DATE NOT NULL,
  
  total_conversas INTEGER DEFAULT 0,
  total_mensagens INTEGER DEFAULT 0,
  
  tempo_medio_resposta_ms INTEGER,
  taxa_resolucao DECIMAL(5, 2),
  satisfacao_media DECIMAL(3, 2),
  
  intencoes_mais_comuns JSONB DEFAULT '{}',
  sentimento_medio DECIMAL(3, 2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(data)
);

-- Anexos do Chatbot
CREATE TABLE IF NOT EXISTS IF NOT EXISTS chatbot_anexos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mensagem_id UUID REFERENCES chatbot_mensagens(id) ON DELETE CASCADE,
  
  nome_arquivo VARCHAR(255) NOT NULL,
  tamanho INTEGER NOT NULL,
  tipo_mime VARCHAR(100),
  
  url TEXT, -- Supabase Storage URL
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feedback do Chatbot
CREATE TABLE IF NOT EXISTS IF NOT EXISTS chatbot_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mensagem_id UUID REFERENCES chatbot_mensagens(id) ON DELETE CASCADE,
  
  tipo_feedback VARCHAR(20) NOT NULL CHECK (tipo_feedback IN ('positivo', 'negativo', 'neutro')),
  comentario TEXT,
  
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Log do Chatbot (LGPD Compliant)
CREATE TABLE IF NOT EXISTS IF NOT EXISTS chatbot_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  usuario_id UUID,
  mensagem_id UUID,
  
  texto_mensagem TEXT,
  tipo_mensagem VARCHAR(20),
  
  texto_resposta TEXT,
  confianca_resposta DECIMAL(5, 4),
  
  intencao_detectada VARCHAR(100),
  confianca_intencao DECIMAL(5, 4),
  score_sentimento DECIMAL(5, 4),
  
  modelo_usado VARCHAR(50),
  tempo_processamento_ms INTEGER,
  tokens_usados INTEGER,
  
  data_retencao_ate DATE,
  anonimizado BOOLEAN DEFAULT FALSE,
  
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES DO CHATBOT
-- ============================================

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_chatbot_conversas_usuario ON chatbot_conversas(usuario_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_chatbot_conversas_data ON chatbot_conversas(data_inicio);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_chatbot_conversas_status ON chatbot_conversas(status);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_chatbot_mensagens_conversa ON chatbot_mensagens(conversa_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_chatbot_mensagens_timestamp ON chatbot_mensagens(timestamp);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_chatbot_mensagens_tipo ON chatbot_mensagens(tipo);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_chatbot_intencoes_nome ON chatbot_intencoes(nome);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_chatbot_intencoes_categoria ON chatbot_intencoes(categoria);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_chatbot_intencoes_ativo ON chatbot_intencoes(ativo);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_chatbot_faqs_categoria ON chatbot_faqs(categoria);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_chatbot_faqs_ativo ON chatbot_faqs(ativo);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_chatbot_metricas_data ON chatbot_metricas(data);

CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_chatbot_audit_usuario ON chatbot_audit_log(usuario_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_chatbot_audit_timestamp ON chatbot_audit_log(timestamp);

-- ============================================
-- TRIGGERS E FUNÇÕES
-- ============================================

-- Atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION atualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_chatbot_conversas_updated_at
  BEFORE UPDATE ON chatbot_conversas
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_updated_at();

CREATE TRIGGER trigger_chatbot_intencoes_updated_at
  BEFORE UPDATE ON chatbot_intencoes
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_updated_at();

-- Incrementar total_mensagens na conversa
CREATE OR REPLACE FUNCTION incrementar_total_mensagens()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chatbot_conversas
  SET total_mensagens = total_mensagens + 1
  WHERE id = NEW.conversa_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_incrementar_mensagens
  AFTER INSERT ON chatbot_mensagens
  FOR EACH ROW
  EXECUTE FUNCTION incrementar_total_mensagens();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS
ALTER TABLE chatbot_conversas ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_mensagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_intencoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_treinamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_metricas ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_anexos ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_audit_log ENABLE ROW LEVEL SECURITY;

-- Políticas de Segurança

-- Conversas: usuário só vê suas próprias conversas
CREATE POLICY politica_chatbot_conversas_select ON chatbot_conversas
  FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY politica_chatbot_conversas_insert ON chatbot_conversas
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY politica_chatbot_conversas_update ON chatbot_conversas
  FOR UPDATE USING (auth.uid() = usuario_id);

-- Mensagens: usuário só vê mensagens de suas conversas
CREATE POLICY politica_chatbot_mensagens_select ON chatbot_mensagens
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chatbot_conversas
      WHERE chatbot_conversas.id = chatbot_mensagens.conversa_id
      AND chatbot_conversas.usuario_id = auth.uid()
    )
  );

CREATE POLICY politica_chatbot_mensagens_insert ON chatbot_mensagens
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM chatbot_conversas
      WHERE chatbot_conversas.id = chatbot_mensagens.conversa_id
      AND chatbot_conversas.usuario_id = auth.uid()
    )
  );

-- Intenções e FAQs: leitura pública, escrita apenas admin
CREATE POLICY politica_chatbot_intencoes_select ON chatbot_intencoes
  FOR SELECT USING (ativo = TRUE);

CREATE POLICY politica_chatbot_faqs_select ON chatbot_faqs
  FOR SELECT USING (ativo = TRUE);

-- Audit Log: apenas admin
CREATE POLICY politica_chatbot_audit_admin ON chatbot_audit_log
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.role = 'admin'
    )
  );

-- ============================================
-- DADOS INICIAIS (SEED)
-- ============================================

-- Inserir intenções padrão
INSERT INTO chatbot_intencoes (nome, categoria, padroes, palavras_chave, resposta_padrao, ativo) VALUES
  ('saudacao', 'greeting', ARRAY['/(oi|olá|hey|bom dia)/i'], ARRAY['oi', 'olá', 'hey', 'bom dia'], '👋 Olá! Como posso ajudar você hoje?', TRUE),
  ('despedida', 'greeting', ARRAY['/(tchau|até logo|adeus)/i'], ARRAY['tchau', 'até logo', 'adeus'], 'Até logo! Fico à disposição para ajudar.', TRUE),
  ('consulta', 'question', ARRAY['/(consultar|verificar|ver|mostrar)/i'], ARRAY['consultar', 'verificar', 'ver', 'mostrar'], NULL, TRUE),
  ('status', 'question', ARRAY['/(status|situação|andamento)/i'], ARRAY['status', 'situação', 'andamento'], NULL, TRUE),
  ('ajuda', 'question', ARRAY['/(ajuda|help|socorro|dúvida)/i'], ARRAY['ajuda', 'help', 'socorro', 'dúvida'], 'Claro! Estou aqui para ajudar. O que você gostaria de saber?', TRUE),
  ('reclamacao', 'complaint', ARRAY['/(problema|erro|bug|falha)/i'], ARRAY['problema', 'erro', 'bug', 'falha'], 'Entendo sua preocupação. Vou escalar isso para nossa equipe.', TRUE),
  ('agendamento', 'command', ARRAY['/(agendar|marcar|reservar)/i'], ARRAY['agendar', 'marcar', 'reservar'], NULL, TRUE),
  ('financeiro', 'command', ARRAY['/(pagar|pagamento|boleto|fatura)/i'], ARRAY['pagar', 'pagamento', 'boleto', 'fatura'], NULL, TRUE)
ON CONFLICT (nome) DO NOTHING;

-- Inserir FAQs padrão (Top 10)
INSERT INTO chatbot_faqs (pergunta, resposta, categoria, palavras_chave, variacoes, ativo) VALUES
  (
    'Como consultar status de cirurgia?',
    'Para consultar o status de uma cirurgia, acesse o módulo **Cirurgias & Procedimentos** > **Acompanhamento**. Você pode filtrar por paciente, médico ou data.',
    'cirurgias',
    ARRAY['status', 'cirurgia', 'consultar'],
    ARRAY['ver andamento cirurgia', 'situação procedimento'],
    TRUE
  ),
  (
    'Como emitir NF-e?',
    'Acesse **Faturamento** > **NF-e Automática** > clique em **Nova NF-e**. O sistema preenche automaticamente os dados da cirurgia.',
    'faturamento',
    ARRAY['nfe', 'nota fiscal', 'emitir'],
    ARRAY['criar nota fiscal', 'gerar nfe'],
    TRUE
  ),
  (
    'Como rastrear entrega?',
    'Vá para **Logística Avançada** > **Rastreamento Real-time**. Digite o código de rastreio ou selecione a entrega na lista.',
    'logistica',
    ARRAY['rastreamento', 'entrega', 'rastrear'],
    ARRAY['tracking', 'localizar entrega'],
    TRUE
  ),
  (
    'Como verificar estoque de materiais?',
    'Acesse **Estoque IA** > **Dashboard**. O sistema mostra em tempo real a quantidade de cada material OPME.',
    'estoque',
    ARRAY['estoque', 'materiais', 'verificar'],
    ARRAY['consultar estoque', 'quantidade materiais'],
    TRUE
  ),
  (
    'Como cadastrar novo médico?',
    'Vá para **Cadastros Inteligentes** > **Cadastro Médicos** > **Novo Cadastro**. O sistema valida automaticamente o CRM.',
    'cadastros',
    ARRAY['cadastrar', 'médico', 'novo'],
    ARRAY['adicionar médico', 'registrar médico'],
    TRUE
  ),
  (
    'Como gerar relatório financeiro?',
    'Acesse **Financeiro Avançado** > **Relatórios Financeiros**. Selecione o período e clique em **Gerar Relatório**.',
    'financeiro',
    ARRAY['relatório', 'financeiro', 'gerar'],
    ARRAY['criar relatório', 'exportar relatório'],
    TRUE
  ),
  (
    'Como fazer cotação com fornecedores?',
    'Entre em **Compras & Fornecedores** > **Cotações Automáticas**. O sistema envia automaticamente para os fornecedores cadastrados.',
    'compras',
    ARRAY['cotação', 'fornecedores', 'fazer'],
    ARRAY['solicitar cotação', 'pedir orçamento'],
    TRUE
  ),
  (
    'Como ver pendências de pagamento?',
    'Acesse **Financeiro Avançado** > **Contas a Pagar**. Filtre por status "Pendente" para ver todas as pendências.',
    'financeiro',
    ARRAY['pendências', 'pagamento', 'ver'],
    ARRAY['contas pendentes', 'a pagar'],
    TRUE
  ),
  (
    'Como configurar alertas de estoque?',
    'Vá para **Estoque IA** > **Configurações** > **Alertas**. Defina a quantidade mínima para cada material.',
    'estoque',
    ARRAY['alertas', 'estoque', 'configurar'],
    ARRAY['notificações estoque', 'avisos estoque'],
    TRUE
  ),
  (
    'Como exportar dados de cirurgias?',
    'Entre em **Cirurgias & Procedimentos** > **Relatórios** > **Exportar Dados**. Escolha o formato (Excel, PDF ou CSV).',
    'cirurgias',
    ARRAY['exportar', 'dados', 'cirurgias'],
    ARRAY['baixar dados', 'extrair dados'],
    TRUE
  )
ON CONFLICT DO NOTHING;

-- ============================================
-- COMENTÁRIOS FINAIS
-- ============================================

COMMENT ON TABLE chatbot_conversas IS 'Conversas do chatbot IA - ICARUS v5.0';
COMMENT ON TABLE chatbot_mensagens IS 'Mensagens das conversas do chatbot';
COMMENT ON TABLE chatbot_intencoes IS 'Catálogo de intenções para reconhecimento NLP';
COMMENT ON TABLE chatbot_faqs IS 'Base de conhecimento de perguntas frequentes';
COMMENT ON TABLE chatbot_treinamento IS 'Dados para treinamento contínuo do modelo';
COMMENT ON TABLE chatbot_metricas IS 'Métricas diárias de performance do chatbot';
COMMENT ON TABLE chatbot_anexos IS 'Anexos de arquivos nas conversas';
COMMENT ON TABLE chatbot_feedback IS 'Feedback dos usuários sobre as respostas';
COMMENT ON TABLE chatbot_audit_log IS 'Log de auditoria LGPD compliant';



-- ============================================
-- Source: 20251019_compliance_auditoria_completo.sql
-- ============================================

-- ═══════════════════════════════════════════════════════════
-- MÓDULO: COMPLIANCE & AUDITORIA AVANÇADO
-- Sistema: ICARUS v5.0
-- Descrição: Gestão regulatória completa (ANVISA, ISO, Abbott)
-- Tabelas: 10
-- Data: 19/10/2025
-- ═══════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════
-- 1. TABELA: compliance_requisitos
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS IF NOT EXISTS compliance_requisitos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  codigo VARCHAR(20) UNIQUE NOT NULL, -- ABB001, ABB002, etc
  categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('qualidade', 'rastreabilidade', 'armazenamento', 'transporte', 'documentacao', 'treinamento', 'etica')),
  
  -- Fabricante/Regulador
  fabricante VARCHAR(50) CHECK (fabricante IN ('abbott', 'medtronic', 'jnj', 'stryker', 'boston_scientific', 'anvisa', 'iso', 'todos')),
  
  -- Requisito
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  
  -- Status de Conformidade
  status VARCHAR(20) DEFAULT 'conforme' CHECK (status IN ('conforme', 'nao_conforme', 'parcial', 'nao_aplicavel')),
  score_conformidade DECIMAL(5,2) DEFAULT 0 CHECK (score_conformidade BETWEEN 0 AND 100),
  
  -- Evidências
  evidencias TEXT[], -- Array de evidências
  documentos_anexados TEXT[], -- Array de paths de arquivos
  
  -- Auditorias
  data_ultima_auditoria DATE,
  proxima_auditoria DATE,
  
  -- Responsabilidades
  responsavel VARCHAR(255),
  responsavel_cargo VARCHAR(100),
  responsavel_email VARCHAR(255),
  
  -- Ações Corretivas
  acoes_corretivas TEXT[],
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compliance_requisitos_fabricante ON compliance_requisitos(fabricante);
CREATE INDEX IF NOT EXISTS idx_compliance_requisitos_categoria ON compliance_requisitos(categoria);
CREATE INDEX IF NOT EXISTS idx_compliance_requisitos_status ON compliance_requisitos(status);

-- ═══════════════════════════════════════════════════════════
-- 2. TABELA: auditorias_internas
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS IF NOT EXISTS auditorias_internas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  codigo VARCHAR(50) UNIQUE NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  
  -- Tipo
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('iso_13485', 'anvisa', 'fabricante', 'bpd', 'interna')),
  fabricante_alvo VARCHAR(50) CHECK (fabricante_alvo IN ('abbott', 'medtronic', 'jnj', 'stryker', 'boston_scientific', 'todos')),
  
  -- Cronograma
  data_planejamento DATE,
  data_execucao DATE,
  data_conclusao DATE,
  
  -- Status
  status VARCHAR(20) DEFAULT 'planejada' CHECK (status IN ('planejada', 'em_andamento', 'concluida', 'cancelada')),
  
  -- Equipe
  auditor_lider VARCHAR(255),
  equipe_auditoria TEXT[], -- Array de nomes
  
  -- Escopo
  areas_auditadas TEXT[], -- Array de áreas
  
  -- Resultados
  score_global DECIMAL(5,2) CHECK (score_global BETWEEN 0 AND 100),
  nao_conformidades_criticas INTEGER DEFAULT 0,
  nao_conformidades_maiores INTEGER DEFAULT 0,
  nao_conformidades_menores INTEGER DEFAULT 0,
  observacoes_positivas TEXT[],
  
  -- Documentação
  relatorio_pdf VARCHAR(500),
  plano_acao_gerado BOOLEAN DEFAULT FALSE,
  
  -- Observações
  observacoes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auditorias_internas_tipo ON auditorias_internas(tipo);
CREATE INDEX IF NOT EXISTS idx_auditorias_internas_status ON auditorias_internas(status);
CREATE INDEX IF NOT EXISTS idx_auditorias_internas_data_execucao ON auditorias_internas(data_execucao);

-- ═══════════════════════════════════════════════════════════
-- 3. TABELA: checklist_auditoria
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS IF NOT EXISTS checklist_auditoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Auditoria
  auditoria_id UUID REFERENCES auditorias_internas(id) ON DELETE CASCADE,
  
  -- Item do Checklist
  categoria VARCHAR(100) NOT NULL,
  requisito VARCHAR(100) NOT NULL,
  descricao TEXT,
  
  -- Avaliação
  conforme BOOLEAN,
  evidencia TEXT,
  observacoes TEXT,
  
  -- Criticidade
  criticidade VARCHAR(20) DEFAULT 'menor' CHECK (criticidade IN ('critica', 'maior', 'menor')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_checklist_auditoria_auditoria ON checklist_auditoria(auditoria_id);
CREATE INDEX IF NOT EXISTS idx_checklist_auditoria_conforme ON checklist_auditoria(conforme);

-- ═══════════════════════════════════════════════════════════
-- 4. TABELA: nao_conformidades
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS IF NOT EXISTS nao_conformidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  codigo_nc VARCHAR(50) UNIQUE NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descricao_completa TEXT,
  
  -- Classificação
  categoria VARCHAR(100),
  severidade VARCHAR(20) NOT NULL CHECK (severidade IN ('critica', 'maior', 'menor', 'observacao')),
  origem VARCHAR(50) NOT NULL CHECK (origem IN ('auditoria_interna', 'auditoria_externa', 'cliente', 'fornecedor', 'autoinspecao')),
  
  -- Relacionamento
  auditoria_id UUID REFERENCES auditorias_internas(id),
  
  -- Cronograma
  data_identificacao DATE NOT NULL,
  data_prazo_correcao DATE NOT NULL,
  data_correcao_efetiva DATE,
  
  -- Status
  status VARCHAR(30) DEFAULT 'aberta' CHECK (status IN ('aberta', 'em_analise', 'em_correcao', 'aguardando_verificacao', 'verificada', 'fechada')),
  
  -- Responsabilidades
  responsavel_analise VARCHAR(255),
  responsavel_correcao VARCHAR(255),
  
  -- Análise de Causa Raiz
  causa_raiz TEXT,
  
  -- Plano de Ação
  acao_imediata TEXT,
  acao_corretiva TEXT,
  acao_preventiva TEXT,
  
  -- Impacto
  custo_estimado DECIMAL(12,2),
  custo_real DECIMAL(12,2),
  impacto_negocio TEXT,
  impacto_cliente TEXT,
  
  -- Evidências
  evidencias_correcao TEXT[],
  
  -- Verificação
  verificacao_eficacia BOOLEAN DEFAULT FALSE,
  reincidencia BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nao_conformidades_severidade ON nao_conformidades(severidade);
CREATE INDEX IF NOT EXISTS idx_nao_conformidades_status ON nao_conformidades(status);
CREATE INDEX IF NOT EXISTS idx_nao_conformidades_auditoria ON nao_conformidades(auditoria_id);
CREATE INDEX IF NOT EXISTS idx_nao_conformidades_prazo ON nao_conformidades(data_prazo_correcao);

-- ═══════════════════════════════════════════════════════════
-- 5. TABELA: treinamentos_certificacoes
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS IF NOT EXISTS treinamentos_certificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  codigo VARCHAR(50) UNIQUE NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  
  -- Tipo
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('inicial', 'reciclagem', 'especializacao', 'compliance', 'tecnico')),
  fabricante VARCHAR(50) CHECK (fabricante IN ('abbott', 'medtronic', 'jnj', 'stryker', 'boston_scientific', 'geral')),
  categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('opme', 'qualidade', 'regulatorio', 'etica', 'seguranca', 'operacional')),
  
  -- Configuração
  duracao_horas INTEGER NOT NULL,
  modalidade VARCHAR(20) NOT NULL CHECK (modalidade IN ('presencial', 'online', 'hibrido')),
  instrutor VARCHAR(255),
  data_realizacao DATE NOT NULL,
  
  -- Conteúdo
  conteudo_programatico TEXT[],
  
  -- Avaliação
  avaliacao_final BOOLEAN DEFAULT TRUE,
  nota_minima_aprovacao DECIMAL(4,2) DEFAULT 7.0,
  
  -- Certificação
  certificado_emitido BOOLEAN DEFAULT FALSE,
  validade_certificado_meses INTEGER DEFAULT 24,
  
  -- Status
  status VARCHAR(20) DEFAULT 'agendado' CHECK (status IN ('agendado', 'em_andamento', 'concluido', 'cancelado')),
  
  -- Estatísticas
  total_participantes INTEGER DEFAULT 0,
  total_aprovados INTEGER DEFAULT 0,
  total_reprovados INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_treinamentos_certificacoes_tipo ON treinamentos_certificacoes(tipo);
CREATE INDEX IF NOT EXISTS idx_treinamentos_certificacoes_fabricante ON treinamentos_certificacoes(fabricante);
CREATE INDEX IF NOT EXISTS idx_treinamentos_certificacoes_data ON treinamentos_certificacoes(data_realizacao);
CREATE INDEX IF NOT EXISTS idx_treinamentos_certificacoes_status ON treinamentos_certificacoes(status);

-- ═══════════════════════════════════════════════════════════
-- 6. TABELA: participantes_treinamento
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS IF NOT EXISTS participantes_treinamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Treinamento
  treinamento_id UUID REFERENCES treinamentos_certificacoes(id) ON DELETE CASCADE,
  
  -- Participante
  usuario_id UUID REFERENCES usuarios(id),
  nome VARCHAR(255) NOT NULL,
  cargo VARCHAR(100),
  departamento VARCHAR(100),
  
  -- Avaliação
  nota_final DECIMAL(4,2),
  aprovado BOOLEAN,
  presenca_percentual DECIMAL(5,2) DEFAULT 100,
  
  -- Certificação
  certificado_numero VARCHAR(100),
  data_emissao_certificado DATE,
  data_validade_certificado DATE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_participantes_treinamento_treinamento ON participantes_treinamento(treinamento_id);
CREATE INDEX IF NOT EXISTS idx_participantes_treinamento_usuario ON participantes_treinamento(usuario_id);
CREATE INDEX IF NOT EXISTS idx_participantes_treinamento_aprovado ON participantes_treinamento(aprovado);

-- ═══════════════════════════════════════════════════════════
-- 7. TABELA: rastreabilidade_opme_compliance
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS IF NOT EXISTS rastreabilidade_opme_compliance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Produto
  produto_id UUID REFERENCES produtos_opme(id),
  produto_nome VARCHAR(255) NOT NULL,
  fabricante VARCHAR(255) NOT NULL,
  codigo_anvisa VARCHAR(20),
  
  -- Rastreabilidade
  lote VARCHAR(50) NOT NULL,
  numero_serie VARCHAR(100),
  validade DATE NOT NULL,
  
  -- Movimentação
  data_entrada DATE NOT NULL,
  data_saida DATE,
  hospital_destino_id UUID REFERENCES hospitais(id),
  hospital_destino VARCHAR(255),
  paciente_id UUID, -- Protegido por LGPD
  cirurgia_id UUID REFERENCES cirurgias(id),
  
  -- Status
  status VARCHAR(20) NOT NULL CHECK (status IN ('estoque', 'consignado', 'implantado', 'devolvido', 'descartado')),
  
  -- Condições
  temperatura_armazenamento DECIMAL(5,2),
  umidade_armazenamento DECIMAL(5,2),
  responsavel_armazenamento VARCHAR(255),
  
  -- Transporte
  certificado_transporte VARCHAR(500),
  datalogger_numero VARCHAR(100),
  
  -- Validação
  rastreamento_completo BOOLEAN DEFAULT FALSE,
  compliance_abbott BOOLEAN DEFAULT FALSE,
  compliance_anvisa BOOLEAN DEFAULT FALSE,
  
  -- Notificações
  notificacao_anvisa_enviada BOOLEAN DEFAULT FALSE,
  notificacao_fabricante_enviada BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rastreabilidade_opme_compliance_produto ON rastreabilidade_opme_compliance(produto_id);
CREATE INDEX IF NOT EXISTS idx_rastreabilidade_opme_compliance_lote ON rastreabilidade_opme_compliance(lote);
CREATE INDEX IF NOT EXISTS idx_rastreabilidade_opme_compliance_serie ON rastreabilidade_opme_compliance(numero_serie);
CREATE INDEX IF NOT EXISTS idx_rastreabilidade_opme_compliance_status ON rastreabilidade_opme_compliance(status);

-- ═══════════════════════════════════════════════════════════
-- 8. TABELA: agentes_ia_compliance
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS IF NOT EXISTS agentes_ia_compliance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('compliance', 'documentacao', 'auditoria', 'treinamento', 'risco')),
  
  -- Status
  status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'processando', 'erro')),
  ultima_execucao TIMESTAMPTZ,
  proxima_execucao TIMESTAMPTZ,
  
  -- Performance
  alertas_gerados INTEGER DEFAULT 0,
  acoes_sugeridas INTEGER DEFAULT 0,
  taxa_acerto DECIMAL(5,2) DEFAULT 0 CHECK (taxa_acerto BETWEEN 0 AND 100),
  falsos_positivos INTEGER DEFAULT 0,
  falsos_negativos INTEGER DEFAULT 0,
  
  -- Configuração
  frequencia_analise VARCHAR(20) DEFAULT 'diaria' CHECK (frequencia_analise IN ('tempo_real', 'horaria', 'diaria', 'semanal')),
  nivel_sensibilidade VARCHAR(20) DEFAULT 'medio' CHECK (nivel_sensibilidade IN ('baixo', 'medio', 'alto', 'critico')),
  auto_correcao_habilitada BOOLEAN DEFAULT FALSE,
  notificacoes_habilitadas BOOLEAN DEFAULT TRUE,
  integracao_externa BOOLEAN DEFAULT FALSE,
  
  -- Modelo de IA
  modelo VARCHAR(100),
  versao_modelo VARCHAR(20),
  ultima_atualizacao_modelo DATE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agentes_ia_compliance_tipo ON agentes_ia_compliance(tipo);
CREATE INDEX IF NOT EXISTS idx_agentes_ia_compliance_status ON agentes_ia_compliance(status);

-- ═══════════════════════════════════════════════════════════
-- 9. TABELA: alertas_compliance
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS IF NOT EXISTS alertas_compliance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Agente Gerador
  agente_id UUID REFERENCES agentes_ia_compliance(id),
  
  -- Tipo de Alerta
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('vencimento_certificacao', 'treinamento_vencido', 'auditoria_programada', 'nao_conformidade', 'documento_revisao', 'calibracao_vencida')),
  
  -- Relacionamentos
  requisito_id UUID REFERENCES compliance_requisitos(id),
  auditoria_id UUID REFERENCES auditorias_internas(id),
  nc_id UUID REFERENCES nao_conformidades(id),
  treinamento_id UUID REFERENCES treinamentos_certificacoes(id),
  
  -- Alerta
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT NOT NULL,
  severidade VARCHAR(20) DEFAULT 'aviso' CHECK (severidade IN ('aviso', 'urgente', 'critico')),
  
  -- Análise do Agente IA
  analise_ia TEXT,
  acao_sugerida TEXT,
  prioridade INTEGER DEFAULT 3 CHECK (prioridade BETWEEN 1 AND 5),
  
  -- Status
  status VARCHAR(20) DEFAULT 'novo' CHECK (status IN ('novo', 'visualizado', 'em_acao', 'resolvido', 'ignorado')),
  
  -- Responsável
  responsavel VARCHAR(255),
  responsavel_cargo VARCHAR(100),
  prazo DATE,
  
  -- Datas
  data_geracao TIMESTAMPTZ DEFAULT NOW(),
  data_visualizacao TIMESTAMPTZ,
  data_resolucao TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alertas_compliance_tipo ON alertas_compliance(tipo);
CREATE INDEX IF NOT EXISTS idx_alertas_compliance_severidade ON alertas_compliance(severidade);
CREATE INDEX IF NOT EXISTS idx_alertas_compliance_status ON alertas_compliance(status);
CREATE INDEX IF NOT EXISTS idx_alertas_compliance_agente ON alertas_compliance(agente_id);

-- ═══════════════════════════════════════════════════════════
-- 10. TABELA: documentacao_tecnica
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS IF NOT EXISTS documentacao_tecnica (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  codigo VARCHAR(50) UNIQUE NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('manual', 'pop', 'procedimento', 'formulario', 'politica', 'certificado', 'relatorio')),
  
  -- Versão e Revisão
  versao VARCHAR(20) NOT NULL,
  data_versao DATE NOT NULL,
  data_proxima_revisao DATE,
  
  -- Status
  status VARCHAR(20) DEFAULT 'vigente' CHECK (status IN ('rascunho', 'em_revisao', 'aprovado', 'vigente', 'obsoleto')),
  
  -- Aprovações
  elaborado_por VARCHAR(255),
  revisado_por VARCHAR(255),
  aprovado_por VARCHAR(255),
  data_aprovacao DATE,
  
  -- Conteúdo
  descricao TEXT,
  caminho_arquivo VARCHAR(500),
  tamanho_bytes INTEGER,
  hash_md5 VARCHAR(32),
  
  -- Conformidade
  iso_13485 BOOLEAN DEFAULT FALSE,
  anvisa_rdc_16 BOOLEAN DEFAULT FALSE,
  fabricante_requisito BOOLEAN DEFAULT FALSE,
  
  -- Controle
  numero_paginas INTEGER,
  palavras_chave TEXT[],
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documentacao_tecnica_tipo ON documentacao_tecnica(tipo);
CREATE INDEX IF NOT EXISTS idx_documentacao_tecnica_status ON documentacao_tecnica(status);
CREATE INDEX IF NOT EXISTS idx_documentacao_tecnica_revisao ON documentacao_tecnica(data_proxima_revisao);

-- ═══════════════════════════════════════════════════════════
-- VIEWS PARA DASHBOARDS
-- ═══════════════════════════════════════════════════════════

-- View: Score Global Abbott
CREATE OR REPLACE VIEW vw_score_abbott AS
SELECT
  AVG(score_conformidade) AS score_global,
  COUNT(*) AS total_requisitos,
  SUM(CASE WHEN status = 'conforme' THEN 1 ELSE 0 END) AS requisitos_conformes,
  SUM(CASE WHEN status = 'nao_conforme' THEN 1 ELSE 0 END) AS requisitos_nao_conformes,
  SUM(CASE WHEN status = 'parcial' THEN 1 ELSE 0 END) AS requisitos_parciais
FROM compliance_requisitos
WHERE fabricante = 'abbott';

-- View: Estatísticas de Auditorias
CREATE OR REPLACE VIEW vw_estatisticas_auditorias AS
SELECT
  COUNT(*) AS total_auditorias,
  AVG(score_global) AS score_medio,
  SUM(nao_conformidades_criticas) AS total_nc_criticas,
  SUM(nao_conformidades_maiores) AS total_nc_maiores,
  SUM(nao_conformidades_menores) AS total_nc_menores,
  SUM(CASE WHEN status = 'concluida' THEN 1 ELSE 0 END) AS auditorias_concluidas
FROM auditorias_internas
WHERE EXTRACT(YEAR FROM data_execucao) = EXTRACT(YEAR FROM CURRENT_DATE);

-- View: Treinamentos Vencendo
CREATE OR REPLACE VIEW vw_treinamentos_vencendo AS
SELECT
  pt.nome,
  pt.cargo,
  tc.titulo AS treinamento,
  tc.fabricante,
  pt.data_validade_certificado,
  (pt.data_validade_certificado - CURRENT_DATE) AS dias_ate_vencimento
FROM participantes_treinamento pt
INNER JOIN treinamentos_certificacoes tc ON pt.treinamento_id = tc.id
WHERE pt.aprovado = TRUE
  AND pt.data_validade_certificado <= CURRENT_DATE + INTERVAL '30 days'
  AND pt.data_validade_certificado >= CURRENT_DATE
ORDER BY pt.data_validade_certificado;

-- ═══════════════════════════════════════════════════════════
-- FUNCTIONS
-- ═══════════════════════════════════════════════════════════

-- Function: Atualizar score global de requisitos
CREATE OR REPLACE FUNCTION atualizar_scores_compliance()
RETURNS VOID AS $$
BEGIN
  -- Atualizar score baseado em evidências e conformidade
  UPDATE compliance_requisitos
  SET
    score_conformidade = CASE
      WHEN status = 'conforme' THEN 100.0
      WHEN status = 'parcial' THEN 50.0
      WHEN status = 'nao_conforme' THEN 0.0
      ELSE 0.0
    END,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function: Gerar alertas de agentes IA
CREATE OR REPLACE FUNCTION gerar_alertas_ia()
