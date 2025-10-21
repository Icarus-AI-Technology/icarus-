-- ============================================
-- Migration 0003: Índices de Performance
-- Data: 2025-10-18
-- Versão: 1.0
-- Autor: Agente Sênior BD
-- ============================================
-- Descrição:
-- - Índices compostos para queries multi-tenant
-- - Índices parciais (WHERE excluido_em IS NULL)
-- - GIN trigram para busca textual
-- - Índices para ordenação DESC (keyset pagination)
-- Meta: p95 < 250ms para 50 usuários simultâneos
-- ============================================

-- ============================================
-- ÍNDICES: empresas
-- ============================================
CREATE INDEX IF NOT EXISTS idx_empresas_cnpj ON empresas(cnpj) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_empresas_status ON empresas(status) WHERE excluido_em IS NULL;

-- ============================================
-- ÍNDICES: usuarios
-- ============================================
-- Composto: empresa + perfil (filtragem comum)
CREATE INDEX IF NOT EXISTS idx_usuarios_empresa_perfil ON usuarios(empresa_id, perfil) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_usuarios_empresa_criado ON usuarios(empresa_id, criado_em DESC) WHERE excluido_em IS NULL;

-- ============================================
-- ÍNDICES: produtos
-- ============================================
-- Composto: empresa + status (listagens filtradas)
CREATE INDEX IF NOT EXISTS idx_produtos_empresa_status ON produtos(empresa_id, status) WHERE excluido_em IS NULL;

-- Composto: empresa + codigo_sku (busca rápida)
CREATE INDEX IF NOT EXISTS idx_produtos_empresa_sku ON produtos(empresa_id, codigo_sku) WHERE excluido_em IS NULL;

-- GIN trigram: busca textual em descrição
CREATE INDEX IF NOT EXISTS idx_produtos_descricao_gin ON produtos USING GIN (to_tsvector('portuguese', descricao)) WHERE excluido_em IS NULL;

-- Índice para ordenação (keyset pagination)
CREATE INDEX IF NOT EXISTS idx_produtos_empresa_criado ON produtos(empresa_id, criado_em DESC, id) WHERE excluido_em IS NULL;

-- Registro ANVISA
CREATE INDEX IF NOT EXISTS idx_produtos_registro_anvisa ON produtos(registro_anvisa) WHERE excluido_em IS NULL AND registro_anvisa IS NOT NULL;

-- ============================================
-- ÍNDICES: lotes
-- ============================================
-- Composto: produto + status
CREATE INDEX IF NOT EXISTS idx_lotes_produto_status ON lotes(produto_id, status) WHERE excluido_em IS NULL;

-- Lotes vencidos (alerta)
CREATE INDEX IF NOT EXISTS idx_lotes_validade ON lotes(data_validade) WHERE excluido_em IS NULL AND data_validade >= CURRENT_DATE;

-- Lotes disponíveis
CREATE INDEX IF NOT EXISTS idx_lotes_disponiveis ON lotes(produto_id, status, quantidade_disponivel) WHERE excluido_em IS NULL AND status = 'disponivel' AND quantidade_disponivel > 0;

-- Número de lote (rastreabilidade ANVISA)
CREATE INDEX IF NOT EXISTS idx_lotes_numero ON lotes(numero_lote, numero_serie) WHERE excluido_em IS NULL;

-- ============================================
-- ÍNDICES: medicos
-- ============================================
-- Composto: empresa + status
CREATE INDEX IF NOT EXISTS idx_medicos_empresa_status ON medicos(empresa_id, status) WHERE excluido_em IS NULL;

-- CRM (busca)
CREATE INDEX IF NOT EXISTS idx_medicos_crm ON medicos(crm, crm_uf) WHERE excluido_em IS NULL;

-- GIN trigram: busca por nome
CREATE INDEX IF NOT EXISTS idx_medicos_nome_gin ON medicos USING GIN (to_tsvector('portuguese', nome)) WHERE excluido_em IS NULL;

-- Especialidade (filtro comum)
CREATE INDEX IF NOT EXISTS idx_medicos_especialidade ON medicos(empresa_id, especialidade) WHERE excluido_em IS NULL;

-- ============================================
-- ÍNDICES: hospitais
-- ============================================
-- Composto: empresa + status
CREATE INDEX IF NOT EXISTS idx_hospitais_empresa_status ON hospitais(empresa_id, status) WHERE excluido_em IS NULL;

-- CNPJ
CREATE INDEX IF NOT EXISTS idx_hospitais_cnpj ON hospitais(empresa_id, cnpj) WHERE excluido_em IS NULL;

-- GIN trigram: busca por nome
CREATE INDEX IF NOT EXISTS idx_hospitais_nome_gin ON hospitais USING GIN (to_tsvector('portuguese', nome)) WHERE excluido_em IS NULL;

-- ============================================
-- ÍNDICES: cirurgias
-- ============================================
-- Composto: empresa + status + data (dashboard principal)
CREATE INDEX IF NOT EXISTS idx_cirurgias_empresa_status_data ON cirurgias(empresa_id, status, data_cirurgia DESC) WHERE excluido_em IS NULL;

-- Composto: empresa + data (calendário)
CREATE INDEX IF NOT EXISTS idx_cirurgias_empresa_data ON cirurgias(empresa_id, data_cirurgia DESC, hora_cirurgia) WHERE excluido_em IS NULL;

-- Médico (filtro)
CREATE INDEX IF NOT EXISTS idx_cirurgias_medico ON cirurgias(medico_id, data_cirurgia DESC) WHERE excluido_em IS NULL;

-- Hospital (filtro)
CREATE INDEX IF NOT EXISTS idx_cirurgias_hospital ON cirurgias(hospital_id, data_cirurgia DESC) WHERE excluido_em IS NULL;

-- Prioridade (urgências)
CREATE INDEX IF NOT EXISTS idx_cirurgias_prioridade ON cirurgias(empresa_id, prioridade, status) WHERE excluido_em IS NULL AND status IN ('agendada', 'confirmada');

-- Keyset pagination
CREATE INDEX IF NOT EXISTS idx_cirurgias_empresa_criado ON cirurgias(empresa_id, criado_em DESC, id) WHERE excluido_em IS NULL;

-- ============================================
-- ÍNDICES: kits
-- ============================================
-- Composto: empresa + status
CREATE INDEX IF NOT EXISTS idx_kits_empresa_status ON kits(empresa_id, status) WHERE excluido_em IS NULL;

-- Cirurgia
CREATE INDEX IF NOT EXISTS idx_kits_cirurgia ON kits(cirurgia_id, status) WHERE excluido_em IS NULL;

-- Keyset pagination
CREATE INDEX IF NOT EXISTS idx_kits_empresa_criado ON kits(empresa_id, criado_em DESC, id) WHERE excluido_em IS NULL;

-- ============================================
-- ÍNDICES: itens_kit
-- ============================================
-- Composto: kit (JOIN comum)
CREATE INDEX IF NOT EXISTS idx_itens_kit_kit ON itens_kit(kit_id);

-- Produto (rastreabilidade)
CREATE INDEX IF NOT EXISTS idx_itens_kit_produto ON itens_kit(produto_id);

-- Lote (rastreabilidade ANVISA)
CREATE INDEX IF NOT EXISTS idx_itens_kit_lote ON itens_kit(lote_id);

-- ============================================
-- ÍNDICES: leads
-- ============================================
-- Composto: empresa + estagio (pipeline CRM)
CREATE INDEX IF NOT EXISTS idx_leads_empresa_estagio ON leads(empresa_id, estagio) WHERE excluido_em IS NULL;

-- Responsável
CREATE INDEX IF NOT EXISTS idx_leads_responsavel ON leads(responsavel_id, estagio) WHERE excluido_em IS NULL;

-- GIN trigram: busca por nome
CREATE INDEX IF NOT EXISTS idx_leads_nome_gin ON leads USING GIN (to_tsvector('portuguese', nome)) WHERE excluido_em IS NULL;

-- Keyset pagination
CREATE INDEX IF NOT EXISTS idx_leads_empresa_criado ON leads(empresa_id, criado_em DESC, id) WHERE excluido_em IS NULL;

-- ============================================
-- ÍNDICES: transacoes
-- ============================================
-- Composto: empresa + tipo + status (dashboard financeiro)
CREATE INDEX IF NOT EXISTS idx_transacoes_empresa_tipo_status ON transacoes(empresa_id, tipo, status) WHERE excluido_em IS NULL;

-- Data vencimento (alertas)
CREATE INDEX IF NOT EXISTS idx_transacoes_vencimento ON transacoes(empresa_id, data_vencimento) WHERE excluido_em IS NULL AND status = 'pendente';

-- Vencidas
CREATE INDEX IF NOT EXISTS idx_transacoes_vencidas ON transacoes(empresa_id, status) WHERE excluido_em IS NULL AND status = 'vencido';

-- Keyset pagination
CREATE INDEX IF NOT EXISTS idx_transacoes_empresa_criado ON transacoes(empresa_id, criado_em DESC, id) WHERE excluido_em IS NULL;

-- ============================================
-- ÍNDICES: fornecedores
-- ============================================
-- Composto: empresa + status
CREATE INDEX IF NOT EXISTS idx_fornecedores_empresa_status ON fornecedores(empresa_id, status) WHERE excluido_em IS NULL;

-- CNPJ
CREATE INDEX IF NOT EXISTS idx_fornecedores_cnpj ON fornecedores(empresa_id, cnpj) WHERE excluido_em IS NULL;

-- GIN trigram: busca por nome
CREATE INDEX IF NOT EXISTS idx_fornecedores_nome_gin ON fornecedores USING GIN (to_tsvector('portuguese', nome)) WHERE excluido_em IS NULL;

-- ============================================
-- ÍNDICES: pedidos_compra
-- ============================================
-- Composto: empresa + status
CREATE INDEX IF NOT EXISTS idx_pedidos_empresa_status ON pedidos_compra(empresa_id, status) WHERE excluido_em IS NULL;

-- Fornecedor
CREATE INDEX IF NOT EXISTS idx_pedidos_fornecedor ON pedidos_compra(fornecedor_id, status) WHERE excluido_em IS NULL;

-- Urgência
CREATE INDEX IF NOT EXISTS idx_pedidos_urgencia ON pedidos_compra(empresa_id, urgencia, status) WHERE excluido_em IS NULL AND status IN ('aguardando', 'aprovado');

-- Keyset pagination
CREATE INDEX IF NOT EXISTS idx_pedidos_empresa_criado ON pedidos_compra(empresa_id, criado_em DESC, id) WHERE excluido_em IS NULL;

-- ============================================
-- ÍNDICES: faturas
-- ============================================
-- Composto: empresa + status
CREATE INDEX IF NOT EXISTS idx_faturas_empresa_status ON faturas(empresa_id, status) WHERE excluido_em IS NULL;

-- Número NF-e (busca)
CREATE INDEX IF NOT EXISTS idx_faturas_numero ON faturas(empresa_id, numero_nfe, serie) WHERE excluido_em IS NULL;

-- Chave de acesso (rastreabilidade fiscal)
CREATE INDEX IF NOT EXISTS idx_faturas_chave ON faturas(chave_acesso) WHERE excluido_em IS NULL AND chave_acesso IS NOT NULL;

-- Cliente CPF/CNPJ
CREATE INDEX IF NOT EXISTS idx_faturas_cliente ON faturas(empresa_id, cliente_cpf_cnpj) WHERE excluido_em IS NULL;

-- Data emissão (relatórios)
CREATE INDEX IF NOT EXISTS idx_faturas_emissao ON faturas(empresa_id, data_emissao DESC) WHERE excluido_em IS NULL;

-- Pedido/Cirurgia (relacionamentos)
CREATE INDEX IF NOT EXISTS idx_faturas_pedido ON faturas(pedido_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_faturas_cirurgia ON faturas(cirurgia_id) WHERE excluido_em IS NULL;

-- Keyset pagination
CREATE INDEX IF NOT EXISTS idx_faturas_empresa_criado ON faturas(empresa_id, criado_em DESC, id) WHERE excluido_em IS NULL;

-- ============================================
-- ÍNDICES: audit_log
-- ============================================
-- Composto: empresa + tabela + criado (consultas de auditoria)
CREATE INDEX IF NOT EXISTS idx_audit_empresa_tabela_criado ON audit_log(empresa_id, tabela, criado_em DESC);

-- Registro auditado
CREATE INDEX IF NOT EXISTS idx_audit_registro ON audit_log(tabela, registro_id, criado_em DESC);

-- Usuário (quem fez a ação)
CREATE INDEX IF NOT EXISTS idx_audit_usuario ON audit_log(usuario_id, criado_em DESC);

-- Hash chain (verificação de integridade)
CREATE INDEX IF NOT EXISTS idx_audit_hash ON audit_log(criado_em ASC, id);

-- ============================================
-- VIEWS MATERIALIZADAS (KPIs)
-- ============================================

-- Dashboard: KPIs por empresa
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_kpis_empresa AS
SELECT
  e.id AS empresa_id,
  e.nome AS empresa_nome,
  -- Cirurgias
  COUNT(DISTINCT c.id) AS total_cirurgias,
  COUNT(DISTINCT CASE WHEN c.status = 'agendada' THEN c.id END) AS cirurgias_agendadas,
  COUNT(DISTINCT CASE WHEN c.status = 'concluida' THEN c.id END) AS cirurgias_concluidas,
  -- Produtos
  COUNT(DISTINCT p.id) AS total_produtos,
  SUM(CASE WHEN l.status = 'disponivel' THEN l.quantidade_disponivel ELSE 0 END) AS estoque_disponivel,
  -- Financeiro
  SUM(CASE WHEN t.tipo = 'receita' AND t.status = 'pago' THEN t.valor ELSE 0 END) AS receitas_pagas,
  SUM(CASE WHEN t.tipo = 'despesa' AND t.status = 'pago' THEN t.valor ELSE 0 END) AS despesas_pagas,
  SUM(CASE WHEN t.tipo = 'receita' AND t.status = 'pendente' THEN t.valor ELSE 0 END) AS receitas_pendentes,
  -- Leads
  COUNT(DISTINCT ld.id) AS total_leads,
  COUNT(DISTINCT CASE WHEN ld.estagio = 'fechamento' THEN ld.id END) AS leads_fechamento,
  -- Timestamp
  NOW() AS atualizado_em
FROM empresas e
LEFT JOIN cirurgias c ON c.empresa_id = e.id AND c.excluido_em IS NULL
LEFT JOIN produtos p ON p.empresa_id = e.id AND p.excluido_em IS NULL
LEFT JOIN lotes l ON l.produto_id = p.id AND l.excluido_em IS NULL
LEFT JOIN transacoes t ON t.empresa_id = e.id AND t.excluido_em IS NULL
LEFT JOIN leads ld ON ld.empresa_id = e.id AND ld.excluido_em IS NULL
WHERE e.excluido_em IS NULL
GROUP BY e.id, e.nome;

-- Índice na MV
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_kpis_empresa ON mv_kpis_empresa(empresa_id);

-- ============================================
-- COMENTÁRIOS
-- ============================================
COMMENT ON INDEX idx_produtos_descricao_gin IS 'Busca textual full-text em descrição de produtos';
COMMENT ON INDEX idx_cirurgias_empresa_status_data IS 'Índice composto para dashboard principal de cirurgias';
COMMENT ON INDEX idx_lotes_disponiveis IS 'Índice parcial para lotes disponíveis (performance)';
COMMENT ON MATERIALIZED VIEW mv_kpis_empresa IS 'KPIs agregados por empresa (refresh periódico via job)';

-- ============================================
-- FUNÇÃO: Refresh MV (executar via cron/BullMQ)
-- ============================================
CREATE OR REPLACE FUNCTION refresh_mv_kpis()
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpis_empresa;
END;
$$;

COMMENT ON FUNCTION refresh_mv_kpis() IS 'Atualiza MVs de KPIs (executar a cada 5min via job)';

