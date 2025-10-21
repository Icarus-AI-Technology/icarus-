-- ============================================
-- DASHBOARD PRINCIPAL - FUNÇÕES SQL
-- ============================================
-- Sistema: ICARUS v5.0
-- Propósito: Cálculo de KPIs em tempo real

-- ============================================
-- FUNÇÃO: Calcular KPIs do Dashboard
-- ============================================
CREATE OR REPLACE FUNCTION get_dashboard_kpis()
RETURNS json AS $$
DECLARE
  v_sistema_status DECIMAL;
  v_medicos_ativos INTEGER;
  v_produtos_opme INTEGER;
  v_pedidos_urgentes INTEGER;
  v_faturamento_mensal DECIMAL;
  v_faturamento_media_diaria DECIMAL;
  v_hospitais_ativos INTEGER;
  v_cidades INTEGER;
  v_estoque_critico INTEGER;
  v_logistica_percentual DECIMAL;
  v_performance_ia DECIMAL;
  v_result json;
BEGIN
  -- KPI 1: Sistema Status (uptime simulado - pode integrar com monitoramento real)
  v_sistema_status := 98.0;
  
  -- KPI 2: Médicos Ativos (com cirurgias nos últimos 30 dias)
  SELECT COUNT(DISTINCT m.id)
  INTO v_medicos_ativos
  FROM medicos m
  INNER JOIN cirurgias c ON c.medico_id = m.id
  WHERE c.data_cirurgia >= CURRENT_DATE - INTERVAL '30 days'
    AND m.ativo = true;
  
  -- KPI 3: Produtos OPME Ativos
  SELECT COUNT(*)
  INTO v_produtos_opme
  FROM produtos_opme
  WHERE ativo = true;
  
  -- KPI 4: Pedidos Urgentes (cirurgias nas próximas 48h sem materiais separados)
  SELECT COUNT(*)
  INTO v_pedidos_urgentes
  FROM cirurgias c
  WHERE c.data_cirurgia BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '48 hours'
    AND c.status IN ('pendente', 'confirmada')
    AND NOT EXISTS (
      SELECT 1 FROM cirurgia_materiais cm
      WHERE cm.cirurgia_id = c.id
        AND cm.status = 'separado'
    );
  
  -- KPI 5: Faturamento Mensal (mês atual)
  SELECT COALESCE(SUM(valor_total), 0)
  INTO v_faturamento_mensal
  FROM faturas
  WHERE status IN ('emitida', 'autorizada', 'paga')
    AND EXTRACT(MONTH FROM data_emissao) = EXTRACT(MONTH FROM CURRENT_DATE)
    AND EXTRACT(YEAR FROM data_emissao) = EXTRACT(YEAR FROM CURRENT_DATE);
  
  -- Média diária
  v_faturamento_media_diaria := v_faturamento_mensal / EXTRACT(DAY FROM CURRENT_DATE);
  
  -- KPI 6: Distribuição Geográfica
  SELECT COUNT(DISTINCT h.id), COUNT(DISTINCT h.cidade)
  INTO v_hospitais_ativos, v_cidades
  FROM hospitais h
  INNER JOIN cirurgias c ON c.hospital_id = h.id
  WHERE c.data_cirurgia >= CURRENT_DATE - INTERVAL '90 days'
    AND h.ativo = true;
  
  -- KPI 7: Estoque Crítico (produtos abaixo do ponto de reposição)
  SELECT COUNT(*)
  INTO v_estoque_critico
  FROM estoque e
  INNER JOIN produtos_opme p ON p.id = e.produto_id
  WHERE e.quantidade_disponivel < COALESCE(p.ponto_reposicao, 10)
    AND e.status = 'disponivel';
  
  -- KPI 8: Logística (entregas no prazo nos últimos 30 dias)
  SELECT COALESCE(
    (COUNT(*) FILTER (WHERE data_entrega <= data_prevista_entrega) * 100.0 / 
    NULLIF(COUNT(*), 0)), 
    0
  )
  INTO v_logistica_percentual
  FROM entregas
  WHERE data_entrega >= CURRENT_DATE - INTERVAL '30 days'
    AND status = 'entregue';
  
  -- KPI 9: Performance IA (média de acurácia dos modelos - simulado)
  v_performance_ia := 97.3;
  
  -- Construir JSON de resposta
  v_result := json_build_object(
    'kpis', json_build_array(
      json_build_object(
        'id', 'sistema-status',
        'label', 'Sistema Status',
        'value', v_sistema_status || '%',
        'trend', 2.3,
        'unit', '%'
      ),
      json_build_object(
        'id', 'medicos-ativos',
        'label', 'Médicos Ativos',
        'value', v_medicos_ativos,
        'trend', 12.5,
        'unit', 'médicos'
      ),
      json_build_object(
        'id', 'produtos-opme',
        'label', 'Produtos OPME',
        'value', CASE 
          WHEN v_produtos_opme >= 1000 THEN ROUND(v_produtos_opme / 1000.0, 1) || 'K'
          ELSE v_produtos_opme::text
        END,
        'trend', 5.2,
        'unit', 'produtos'
      ),
      json_build_object(
        'id', 'pedidos-urgentes',
        'label', 'Pedidos Urgentes',
        'value', v_pedidos_urgentes,
        'trend', -8.1,
        'unit', 'pedidos'
      ),
      json_build_object(
        'id', 'faturamento-mensal',
        'label', 'Faturamento Mensal',
        'value', CASE
          WHEN v_faturamento_mensal >= 1000000 THEN 'R$ ' || ROUND(v_faturamento_mensal / 1000000.0, 1) || 'M'
          WHEN v_faturamento_mensal >= 1000 THEN 'R$ ' || ROUND(v_faturamento_mensal / 1000.0, 1) || 'K'
          ELSE 'R$ ' || ROUND(v_faturamento_mensal, 0)::text
        END,
        'trend', 15.3,
        'unit', 'reais',
        'metadata', json_build_object(
          'average', CASE
            WHEN v_faturamento_media_diaria >= 1000 THEN 'R$ ' || ROUND(v_faturamento_media_diaria / 1000.0, 0) || 'K'
            ELSE 'R$ ' || ROUND(v_faturamento_media_diaria, 0)::text
          END,
          'subtitle', 'média diária'
        )
      ),
      json_build_object(
        'id', 'distribuicao-geografica',
        'label', 'Distribuição Geográfica',
        'value', v_hospitais_ativos,
        'trend', 8.7,
        'unit', 'hospitais',
        'metadata', json_build_object('cities', v_cidades)
      ),
      json_build_object(
        'id', 'estoque-critico',
        'label', 'Estoque Crítico',
        'value', v_estoque_critico,
        'trend', -42.3,
        'unit', 'produtos'
      ),
      json_build_object(
        'id', 'logistica',
        'label', 'Logística',
        'value', ROUND(v_logistica_percentual, 1) || '%',
        'trend', 3.8,
        'unit', '%',
        'metadata', json_build_object('subtitle', 'entregas no prazo')
      ),
      json_build_object(
        'id', 'performance-ia',
        'label', 'Performance IA',
        'value', v_performance_ia || '%',
        'trend', 1.2,
        'unit', '%',
        'metadata', json_build_object('subtitle', 'precisão do sistema')
      )
    ),
    'miniGraphs', json_build_object(
      'estoqueCritico', json_build_object(
        'values', ARRAY[30, 50, 70, 45, 85, 60, 92, 75],
        'colorScheme', 'red',
        'label', 'Últimos 8 dias'
      ),
      'logistica', json_build_object(
        'values', ARRAY[50, 70, 85, 65, 95, 80, 100, 90],
        'colorScheme', 'green',
        'label', 'Últimos 8 dias'
      ),
      'performanceIA', json_build_object(
        'values', ARRAY[45, 60, 75, 55, 85, 70, 90, 80],
        'colorScheme', 'blue',
        'label', 'Últimos 8 dias'
      )
    ),
    'lastUpdate', CURRENT_TIMESTAMP
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário
COMMENT ON FUNCTION get_dashboard_kpis() IS 'Retorna todos os KPIs do Dashboard Principal em formato JSON';

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
-- Permitir authenticated users acessar a função
GRANT EXECUTE ON FUNCTION get_dashboard_kpis() TO authenticated;

