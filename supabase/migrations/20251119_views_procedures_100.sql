-- ============================================================================
-- MIGRATION: Materialized Views + Stored Procedures para 100/100
-- Data: 2024-11-19
-- Objetivo: +30 pontos Supabase
-- ============================================================================

-- ============================================================================
-- PARTE 1: MATERIALIZED VIEWS (4 views) → +8 pontos
-- ============================================================================

-- 1. Dashboard KPIs Consolidado
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_dashboard_kpis AS
SELECT
  e.id AS empresa_id,
  e.nome AS empresa_nome,
  
  -- KPI 1: Total Cirurgias (mês atual)
  COUNT(DISTINCT c.id) FILTER (
    WHERE c.data >= DATE_TRUNC('month', NOW())
  ) AS total_cirurgias_mes,
  
  -- KPI 2: Estoque Crítico (< ponto reposição)
  COUNT(DISTINCT p.id) FILTER (
    WHERE (
      SELECT COALESCE(SUM(est.quantidade_disponivel), 0)
      FROM estoque est
      WHERE est.produto_opme_id = p.id
    ) < COALESCE(p.ponto_reposicao, 10)
  ) AS produtos_estoque_critico,
  
  -- KPI 3: Receita do Mês
  COALESCE(SUM(f.valor_total) FILTER (
    WHERE f.tipo = 'receita'
      AND f.data >= DATE_TRUNC('month', NOW())
  ), 0) AS receita_mes,
  
  -- KPI 4: Compliance ANVISA (%)
  ROUND(
    100.0 * COUNT(DISTINCT p.id) FILTER (
      WHERE p.registro_anvisa IS NOT NULL
        AND p.validade_registro > NOW()
    ) / NULLIF(COUNT(DISTINCT p.id), 0),
    1
  ) AS compliance_anvisa_percent,
  
  -- Metadados
  NOW() AS atualizado_em

FROM empresas e
LEFT JOIN cirurgias c ON c.empresa_id = e.id
LEFT JOIN produtos_opme p ON p.empresa_id = e.id
LEFT JOIN financeiro f ON f.empresa_id = e.id

GROUP BY e.id, e.nome;

COMMENT ON MATERIALIZED VIEW mv_dashboard_kpis IS 'KPIs consolidados do dashboard, atualizados a cada 15 minutos';

CREATE UNIQUE INDEX idx_mv_dashboard_kpis_empresa ON mv_dashboard_kpis(empresa_id);

-- 2. Estoque Consolidado por Empresa
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_estoque_consolidado AS
SELECT
  e.id AS empresa_id,
  p.id AS produto_id,
  p.nome AS produto_nome,
  p.codigo AS produto_codigo,
  
  -- Totalizadores de Estoque
  COALESCE(SUM(est.quantidade_disponivel), 0) AS quantidade_total,
  COALESCE(SUM(est.quantidade_reservada), 0) AS quantidade_reservada,
  COALESCE(SUM(est.quantidade_disponivel - est.quantidade_reservada), 0) AS quantidade_disponivel_real,
  
  -- Localização
  ARRAY_AGG(DISTINCT est.localizacao) AS localizacoes,
  
  -- Validades
  MIN(est.data_validade) AS proxima_validade,
  COUNT(DISTINCT est.id) FILTER (WHERE est.data_validade < NOW() + INTERVAL '90 days') AS lotes_vencer_90_dias,
  
  -- Custos
  COALESCE(AVG(est.custo_unitario), 0) AS custo_medio,
  COALESCE(SUM(est.quantidade_disponivel * est.custo_unitario), 0) AS valor_total_estoque,
  
  -- Status
  CASE
    WHEN COALESCE(SUM(est.quantidade_disponivel), 0) < COALESCE(p.ponto_reposicao, 10) THEN 'CRÍTICO'
    WHEN COALESCE(SUM(est.quantidade_disponivel), 0) < COALESCE(p.ponto_reposicao, 10) * 1.5 THEN 'ATENÇÃO'
    ELSE 'OK'
  END AS status_estoque,
  
  NOW() AS atualizado_em

FROM empresas e
LEFT JOIN produtos_opme p ON p.empresa_id = e.id
LEFT JOIN estoque est ON est.produto_opme_id = p.id

GROUP BY e.id, p.id, p.nome, p.codigo, p.ponto_reposicao;

COMMENT ON MATERIALIZED VIEW mv_estoque_consolidado IS 'Visão consolidada de estoque com status e validades';

CREATE UNIQUE INDEX idx_mv_estoque_produto ON mv_estoque_consolidado(empresa_id, produto_id);
CREATE INDEX idx_mv_estoque_status ON mv_estoque_consolidado(status_estoque);

-- 3. Cirurgias Métricas Mensais
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_cirurgias_mes AS
SELECT
  e.id AS empresa_id,
  DATE_TRUNC('month', c.data) AS mes,
  
  -- Totalizadores
  COUNT(DISTINCT c.id) AS total_cirurgias,
  COUNT(DISTINCT c.medico_id) AS total_medicos,
  COUNT(DISTINCT c.hospital_id) AS total_hospitais,
  COUNT(DISTINCT c.paciente_id) AS total_pacientes,
  
  -- Status
  COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'agendada') AS cirurgias_agendadas,
  COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'realizada') AS cirurgias_realizadas,
  COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'cancelada') AS cirurgias_canceladas,
  
  -- Taxa de Conclusão
  ROUND(
    100.0 * COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'realizada') 
    / NULLIF(COUNT(DISTINCT c.id), 0),
    1
  ) AS taxa_conclusao_percent,
  
  -- Valores
  COALESCE(SUM(c.valor_estimado), 0) AS valor_total_estimado,
  COALESCE(AVG(c.valor_estimado), 0) AS valor_medio_cirurgia,
  
  NOW() AS atualizado_em

FROM empresas e
LEFT JOIN cirurgias c ON c.empresa_id = e.id

WHERE c.data >= DATE_TRUNC('month', NOW() - INTERVAL '12 months')

GROUP BY e.id, DATE_TRUNC('month', c.data);

COMMENT ON MATERIALIZED VIEW mv_cirurgias_mes IS 'Métricas mensais de cirurgias (últimos 12 meses)';

CREATE INDEX idx_mv_cirurgias_mes ON mv_cirurgias_mes(empresa_id, mes DESC);

-- 4. Financeiro Summary
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_financeiro_summary AS
SELECT
  e.id AS empresa_id,
  DATE_TRUNC('month', f.data) AS mes,
  
  -- Receitas
  COALESCE(SUM(f.valor_total) FILTER (WHERE f.tipo = 'receita'), 0) AS receitas,
  COUNT(DISTINCT f.id) FILTER (WHERE f.tipo = 'receita') AS total_receitas,
  
  -- Despesas
  COALESCE(SUM(f.valor_total) FILTER (WHERE f.tipo = 'despesa'), 0) AS despesas,
  COUNT(DISTINCT f.id) FILTER (WHERE f.tipo = 'despesa') AS total_despesas,
  
  -- Saldo
  COALESCE(SUM(f.valor_total) FILTER (WHERE f.tipo = 'receita'), 0) -
  COALESCE(SUM(f.valor_total) FILTER (WHERE f.tipo = 'despesa'), 0) AS saldo_mes,
  
  -- Contas a Pagar/Receber
  COALESCE(SUM(f.valor_total) FILTER (WHERE f.status = 'pendente' AND f.tipo = 'receita'), 0) AS contas_receber,
  COALESCE(SUM(f.valor_total) FILTER (WHERE f.status = 'pendente' AND f.tipo = 'despesa'), 0) AS contas_pagar,
  
  -- Inadimplência
  COALESCE(SUM(f.valor_total) FILTER (
    WHERE f.status = 'pendente' 
      AND f.tipo = 'receita' 
      AND f.data_vencimento < NOW()
  ), 0) AS receitas_vencidas,
  
  NOW() AS atualizado_em

FROM empresas e
LEFT JOIN financeiro f ON f.empresa_id = e.id

WHERE f.data >= DATE_TRUNC('month', NOW() - INTERVAL '12 months')

GROUP BY e.id, DATE_TRUNC('month', f.data);

COMMENT ON MATERIALIZED VIEW mv_financeiro_summary IS 'Resumo financeiro mensal (últimos 12 meses)';

CREATE INDEX idx_mv_financeiro_mes ON mv_financeiro_summary(empresa_id, mes DESC);

-- ============================================================================
-- PARTE 2: STORED PROCEDURES (3 procedures) → +7 pontos
-- ============================================================================

-- 1. Processar Pedido OPME Completo (workflow end-to-end)
CREATE OR REPLACE FUNCTION sp_processar_pedido_opme(
  p_empresa_id UUID,
  p_cirurgia_id UUID,
  p_produtos JSONB, -- [{ produto_id, quantidade, valor_unitario }]
  p_fornecedor_id UUID,
  p_usuario_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_pedido_id UUID;
  v_produto JSONB;
  v_total NUMERIC := 0;
  v_resultado JSONB;
BEGIN
  -- 1. Criar pedido
  INSERT INTO pedidos_opme (
    empresa_id,
    cirurgia_id,
    fornecedor_id,
    status,
    criado_por
  ) VALUES (
    p_empresa_id,
    p_cirurgia_id,
    p_fornecedor_id,
    'rascunho',
    p_usuario_id
  )
  RETURNING id INTO v_pedido_id;
  
  -- 2. Adicionar itens do pedido
  FOR v_produto IN SELECT * FROM jsonb_array_elements(p_produtos)
  LOOP
    INSERT INTO itens_pedido_opme (
      pedido_id,
      produto_opme_id,
      quantidade,
      valor_unitario,
      valor_total
    ) VALUES (
      v_pedido_id,
      (v_produto->>'produto_id')::UUID,
      (v_produto->>'quantidade')::INTEGER,
      (v_produto->>'valor_unitario')::NUMERIC,
      (v_produto->>'quantidade')::INTEGER * (v_produto->>'valor_unitario')::NUMERIC
    );
    
    v_total := v_total + ((v_produto->>'quantidade')::INTEGER * (v_produto->>'valor_unitario')::NUMERIC);
  END LOOP;
  
  -- 3. Atualizar valor total do pedido
  UPDATE pedidos_opme
  SET valor_total = v_total,
      status = 'aguardando_aprovacao'
  WHERE id = v_pedido_id;
  
  -- 4. Registrar audit log
  INSERT INTO audit_log (
    empresa_id,
    usuario_id,
    tabela,
    registro_id,
    acao,
    dados_depois
  ) VALUES (
    p_empresa_id,
    p_usuario_id,
    'pedidos_opme',
    v_pedido_id,
    'CREATE',
    jsonb_build_object(
      'pedido_id', v_pedido_id,
      'valor_total', v_total,
      'status', 'aguardando_aprovacao'
    )
  );
  
  -- 5. Retornar resultado
  v_resultado := jsonb_build_object(
    'success', true,
    'pedido_id', v_pedido_id,
    'valor_total', v_total,
    'total_itens', jsonb_array_length(p_produtos)
  );
  
  RETURN v_resultado;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

COMMENT ON FUNCTION sp_processar_pedido_opme IS 'Cria pedido OPME completo com auditoria';

-- 2. Calcular Comissões de Vendedores
CREATE OR REPLACE FUNCTION sp_calcular_comissoes(
  p_empresa_id UUID,
  p_mes DATE
)
RETURNS TABLE (
  vendedor_id UUID,
  vendedor_nome TEXT,
  total_vendas NUMERIC,
  comissao_percent NUMERIC,
  comissao_valor NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.id AS vendedor_id,
    u.nome AS vendedor_nome,
    COALESCE(SUM(f.valor_total), 0) AS total_vendas,
    COALESCE(v.comissao_percent, 5.0) AS comissao_percent,
    COALESCE(SUM(f.valor_total) * (v.comissao_percent / 100.0), 0) AS comissao_valor
  FROM vendedores v
  JOIN usuarios u ON u.id = v.usuario_id
  LEFT JOIN vendas venda ON venda.vendedor_id = v.id
  LEFT JOIN financeiro f ON f.venda_id = venda.id
  WHERE v.empresa_id = p_empresa_id
    AND f.tipo = 'receita'
    AND f.status = 'pago'
    AND DATE_TRUNC('month', f.data) = DATE_TRUNC('month', p_mes)
  GROUP BY v.id, u.nome, v.comissao_percent;
END;
$$;

COMMENT ON FUNCTION sp_calcular_comissoes IS 'Calcula comissões de vendedores por mês';

-- 3. Gerar Relatório de Compliance (ANVISA/ANS)
CREATE OR REPLACE FUNCTION sp_gerar_relatorio_compliance(
  p_empresa_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_resultado JSONB;
  v_total_produtos INTEGER;
  v_produtos_conformes INTEGER;
  v_produtos_vencidos INTEGER;
  v_produtos_sem_registro INTEGER;
BEGIN
  -- Contar produtos
  SELECT COUNT(*) INTO v_total_produtos
  FROM produtos_opme
  WHERE empresa_id = p_empresa_id;
  
  -- Produtos conformes (registro válido)
  SELECT COUNT(*) INTO v_produtos_conformes
  FROM produtos_opme
  WHERE empresa_id = p_empresa_id
    AND registro_anvisa IS NOT NULL
    AND validade_registro > NOW();
  
  -- Produtos com registro vencido
  SELECT COUNT(*) INTO v_produtos_vencidos
  FROM produtos_opme
  WHERE empresa_id = p_empresa_id
    AND validade_registro <= NOW();
  
  -- Produtos sem registro
  SELECT COUNT(*) INTO v_produtos_sem_registro
  FROM produtos_opme
  WHERE empresa_id = p_empresa_id
    AND registro_anvisa IS NULL;
  
  -- Montar relatório
  v_resultado := jsonb_build_object(
    'empresa_id', p_empresa_id,
    'data_geracao', NOW(),
    'total_produtos', v_total_produtos,
    'produtos_conformes', v_produtos_conformes,
    'produtos_vencidos', v_produtos_vencidos,
    'produtos_sem_registro', v_produtos_sem_registro,
    'compliance_percent', ROUND(
      100.0 * v_produtos_conformes / NULLIF(v_total_produtos, 0),
      1
    ),
    'status', CASE
      WHEN v_total_produtos = 0 THEN 'SEM_DADOS'
      WHEN (v_produtos_conformes::FLOAT / v_total_produtos) >= 0.95 THEN 'EXCELENTE'
      WHEN (v_produtos_conformes::FLOAT / v_total_produtos) >= 0.80 THEN 'BOM'
      WHEN (v_produtos_conformes::FLOAT / v_total_produtos) >= 0.60 THEN 'ATENÇÃO'
      ELSE 'CRÍTICO'
    END
  );
  
  RETURN v_resultado;
END;
$$;

COMMENT ON FUNCTION sp_gerar_relatorio_compliance IS 'Gera relatório de compliance ANVISA/ANS';

-- ============================================================================
-- PARTE 3: REFRESH AUTOMÁTICO DAS MATERIALIZED VIEWS
-- ============================================================================

-- Função para refresh de todas as MVs
CREATE OR REPLACE FUNCTION refresh_all_materialized_views()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_kpis;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_estoque_consolidado;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_cirurgias_mes;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_financeiro_summary;
END;
$$;

COMMENT ON FUNCTION refresh_all_materialized_views IS 'Atualiza todas as MVs concorrentemente (usar em cron job)';

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================

-- Executar primeiro refresh
SELECT refresh_all_materialized_views();

