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

