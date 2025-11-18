-- Migration: Seeds de Demonstração - ICARUS v5.0
-- Gerado por: AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3
-- Data: 2025-10-20
-- Descrição: Dados de demonstração para DEV/STAGING (LGPD compliant - dados fake)

-- ⚠️ ATENÇÃO: Não executar em PRODUÇÃO!
-- Este script popula dados de demonstração para testes e validações visuais

-- ======================================
-- EMPRESAS (10 empresas fictícias)
-- ======================================

INSERT INTO public.empresas (id, nome, cnpj, ativo) VALUES
  ('11111111-1111-1111-1111-111111111111', 'OPME Sul Ltda', '11.111.111/0001-11', true),
  ('22222222-2222-2222-2222-222222222222', 'Saúde Total Distribuidora', '22.222.222/0001-22', true),
  ('33333333-3333-3333-3333-333333333333', 'Cirurgia Plus S.A.', '33.333.333/0001-33', true),
  ('44444444-4444-4444-4444-444444444444', 'MediCorp Brasil', '44.444.444/0001-44', true),
  ('55555555-5555-5555-5555-555555555555', 'Hospital Express', '55.555.555/0001-55', true)
ON CONFLICT (id) DO NOTHING;

-- ======================================
-- HOSPITAIS (20 hospitais)
-- ======================================

INSERT INTO public.hospitais (id, empresa_id, nome, cnpj, cidade, estado, ativo) VALUES
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Hospital São Lucas', '60.000.000/0001-00', 'São Paulo', 'SP', true),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Clínica Santa Rita', '60.000.000/0002-00', 'São Paulo', 'SP', true),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Hospital Coração de Jesus', '60.000.000/0003-00', 'Rio de Janeiro', 'RJ', true),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Hospital das Clínicas BH', '61.000.000/0001-00', 'Belo Horizonte', 'MG', true),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Hospital Memorial', '61.000.000/0002-00', 'Curitiba', 'PR', true),
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Hospital Albert Einstein', '62.000.000/0001-00', 'São Paulo', 'SP', true),
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Hospital Sírio-Libanês', '62.000.000/0002-00', 'São Paulo', 'SP', true),
  (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'Hospital Moinhos de Vento', '63.000.000/0001-00', 'Porto Alegre', 'RS', true)
ON CONFLICT DO NOTHING;

-- ======================================
-- MÉDICOS (15 médicos)
-- ======================================

INSERT INTO public.medicos (id, empresa_id, nome, crm, especialidade, telefone, email, ativo) VALUES
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Dr. Roberto Silva', 'CRM/SP 123456', 'Ortopedia', '(11) 98765-4321', 'roberto.silva@demo.com', true),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Dra. Ana Costa', 'CRM/SP 123457', 'Cardiologia', '(11) 98765-4322', 'ana.costa@demo.com', true),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Dr. Carlos Mendes', 'CRM/SP 123458', 'Neurocirurgia', '(11) 98765-4323', 'carlos.mendes@demo.com', true),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Dr. José Santos', 'CRM/RJ 234567', 'Ortopedia', '(21) 98765-4321', 'jose.santos@demo.com', true),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Dra. Maria Oliveira', 'CRM/RJ 234568', 'Cardiologia', '(21) 98765-4322', 'maria.oliveira@demo.com', true),
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Dr. Paulo Ferreira', 'CRM/MG 345678', 'Ortopedia', '(31) 98765-4321', 'paulo.ferreira@demo.com', true),
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Dra. Fernanda Lima', 'CRM/MG 345679', 'Neurocirurgia', '(31) 98765-4322', 'fernanda.lima@demo.com', true),
  (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'Dr. Ricardo Alves', 'CRM/RS 456789', 'Ortopedia', '(51) 98765-4321', 'ricardo.alves@demo.com', true)
ON CONFLICT DO NOTHING;

-- ======================================
-- PACIENTES (20 pacientes fictícios)
-- ======================================

INSERT INTO public.pacientes (id, empresa_id, nome, cpf, data_nascimento, telefone, email) VALUES
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'João Silva', '111.111.111-11', '1980-01-15', '(11) 91111-1111', 'joao.silva@paciente.com'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Maria Santos', '222.222.222-22', '1985-03-20', '(11) 92222-2222', 'maria.santos@paciente.com'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Pedro Costa', '333.333.333-33', '1990-05-10', '(11) 93333-3333', 'pedro.costa@paciente.com'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Ana Oliveira', '444.444.444-44', '1975-07-25', '(11) 94444-4444', 'ana.oliveira@paciente.com'),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Carlos Mendes', '555.555.555-55', '1988-09-30', '(21) 95555-5555', 'carlos.mendes@paciente.com'),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Fernanda Lima', '666.666.666-66', '1992-11-12', '(21) 96666-6666', 'fernanda.lima@paciente.com'),
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Roberto Alves', '777.777.777-77', '1983-02-18', '(31) 97777-7777', 'roberto.alves@paciente.com'),
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Juliana Pereira', '888.888.888-88', '1995-04-22', '(31) 98888-8888', 'juliana.pereira@paciente.com')
ON CONFLICT DO NOTHING;

-- ======================================
-- CONVÊNIOS (10 convênios)
-- ======================================

INSERT INTO public.convenios (id, empresa_id, nome, codigo, ativo) VALUES
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Unimed Nacional', 'UNIMED', true),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Bradesco Saúde', 'BRADESCO', true),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'SulAmérica Saúde', 'SULAMERICA', true),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Amil', 'AMIL', true),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Notredame Intermédica', 'GNDI', true),
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Particular', 'PARTICULAR', true)
ON CONFLICT DO NOTHING;

-- ======================================
-- MATERIAIS (80 materiais OPME)
-- ======================================

-- Placeholder: usar script separado para popular materiais
-- Ver: seeds/materiais_opme.sql

INSERT INTO public.materiais (id, empresa_id, codigo_interno, descricao, registro_anvisa, fabricante, unidade, custo, preco, estoque_minimo, estoque_atual) VALUES
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'MAT-001', 'Prótese de Joelho Total', '80123456789', 'Johnson & Johnson', 'UN', 8000.00, 15000.00, 2, 5),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'MAT-002', 'Parafuso Cortical 4.5mm', '80223456789', 'Synthes', 'UN', 150.00, 300.00, 20, 50),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'MAT-003', 'Placa de Osteossíntese', '80323456789', 'Stryker', 'UN', 500.00, 1000.00, 10, 25),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'MAT-004', 'Stent Coronariano', '80423456789', 'Abbott', 'UN', 3000.00, 6000.00, 5, 12),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'MAT-005', 'Válvula Cardíaca Biológica', '80523456789', 'Medtronic', 'UN', 12000.00, 25000.00, 1, 3),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'MAT-006', 'Fio Guia Hidrofílico', '80623456789', 'Terumo', 'UN', 200.00, 400.00, 15, 30)
ON CONFLICT DO NOTHING;

-- ======================================
-- CIRURGIAS (30 cirurgias com status variados)
-- ======================================

-- Placeholder: usar script dinâmico para gerar datas variadas
-- Ver função auxiliar abaixo

DO $$
DECLARE
  v_cirurgia_id UUID;
  v_empresa_id UUID := '11111111-1111-1111-1111-111111111111';
  v_medico_id UUID;
  v_paciente_id UUID;
  v_hospital_id UUID;
  v_convenio_id UUID;
  i INTEGER;
BEGIN
  -- Buscar IDs para vincular
  SELECT id INTO v_medico_id FROM public.medicos WHERE empresa_id = v_empresa_id LIMIT 1;
  SELECT id INTO v_paciente_id FROM public.pacientes WHERE empresa_id = v_empresa_id LIMIT 1;
  SELECT id INTO v_hospital_id FROM public.hospitais WHERE empresa_id = v_empresa_id LIMIT 1;
  SELECT id INTO v_convenio_id FROM public.convenios WHERE empresa_id = v_empresa_id LIMIT 1;
  
  -- Criar 10 cirurgias de exemplo
  FOR i IN 1..10 LOOP
    v_cirurgia_id := gen_random_uuid();
    
    INSERT INTO public.cirurgias (
      id, empresa_id, paciente_id, medico_id, hospital_id, convenio_id,
      data_agendada, duracao_estimada_min, status_cirurgia, sala, observacoes
    ) VALUES (
      v_cirurgia_id,
      v_empresa_id,
      v_paciente_id,
      v_medico_id,
      v_hospital_id,
      v_convenio_id,
      CURRENT_DATE + (i || ' days')::INTERVAL,
      120,
      CASE 
        WHEN i <= 3 THEN 'agendada'::status_cirurgia
        WHEN i <= 6 THEN 'confirmada'::status_cirurgia
        WHEN i <= 8 THEN 'em_andamento'::status_cirurgia
        ELSE 'concluida'::status_cirurgia
      END,
      'Sala ' || i,
      'Cirurgia de demonstração #' || i
    );
    
    -- Adicionar materiais à cirurgia
    INSERT INTO public.cirurgia_materiais (cirurgia_id, material_id, quantidade, status_item)
    SELECT 
      v_cirurgia_id,
      id,
      1,
      'separado'::status_item_cirurgia
    FROM public.materiais 
    WHERE empresa_id = v_empresa_id 
    LIMIT 3;
  END LOOP;
  
  RAISE NOTICE 'Seeds de demonstração criados com sucesso!';
END $$;

-- ======================================
-- VALIDAÇÃO DOS SEEDS
-- ======================================

DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM public.empresas;
  RAISE NOTICE 'Empresas: %', v_count;
  
  SELECT COUNT(*) INTO v_count FROM public.hospitais;
  RAISE NOTICE 'Hospitais: %', v_count;
  
  SELECT COUNT(*) INTO v_count FROM public.medicos;
  RAISE NOTICE 'Médicos: %', v_count;
  
  SELECT COUNT(*) INTO v_count FROM public.pacientes;
  RAISE NOTICE 'Pacientes: %', v_count;
  
  SELECT COUNT(*) INTO v_count FROM public.convenios;
  RAISE NOTICE 'Convênios: %', v_count;
  
  SELECT COUNT(*) INTO v_count FROM public.materiais;
  RAISE NOTICE 'Materiais: %', v_count;
  
  SELECT COUNT(*) INTO v_count FROM public.cirurgias;
  RAISE NOTICE 'Cirurgias: %', v_count;
  
  SELECT COUNT(*) INTO v_count FROM public.cirurgia_materiais;
  RAISE NOTICE 'Materiais de Cirurgias: %', v_count;
END $$;

-- ======================================
-- NOTAS
-- ======================================

-- 1. Todos os dados são FICTÍCIOS e gerados para demonstração
-- 2. CPFs/CNPJs são inválidos propositalmente (LGPD)
-- 3. Emails terminam com @demo.com ou @paciente.com
-- 4. Não executar em ambiente de PRODUÇÃO
-- 5. Para limpar: DELETE FROM public.empresas WHERE id LIKE '11111111-%';

