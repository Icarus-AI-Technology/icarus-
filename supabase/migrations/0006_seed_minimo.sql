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

