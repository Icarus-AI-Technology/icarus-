-- ╔════════════════════════════════════════════════════════════════════════╗
-- ║  ICARUS v5.0 - Bloco 10 de 10                                          ║
-- ║  Linhas: 56593 → 62879                                                      ║
-- ╚════════════════════════════════════════════════════════════════════════╝

  FROM public.consignacao_materiais
  WHERE id = p_consignacao_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'valido', false,
      'erros', jsonb_build_array('Consignação não encontrada')
    );
  END IF;

  -- Validar status
  IF v_consignacao.status != 'PENDENTE' THEN
    v_erros := array_append(v_erros, 'Consignação já foi processada');
  END IF;

  -- Validar estoque (se for SAIDA)
  IF v_consignacao.tipo_consignacao = 'SAIDA' THEN
    SELECT COALESCE(quantidade, 0)
    INTO v_estoque_disponivel
    FROM public.estoque
    WHERE produto_id = v_consignacao.produto_id
      AND empresa_id = v_consignacao.empresa_id;

    IF v_estoque_disponivel < v_consignacao.quantidade THEN
      v_erros := array_append(v_erros, format(
        'Estoque insuficiente. Disponível: %s, Solicitado: %s',
        v_estoque_disponivel,
        v_consignacao.quantidade
      ));
    END IF;
  END IF;

  -- Validar produto ativo
  IF NOT EXISTS (
    SELECT 1 FROM public.produtos
    WHERE id = v_consignacao.produto_id AND ativo = true
  ) THEN
    v_erros := array_append(v_erros, 'Produto inativo ou inexistente');
  END IF;

  -- Retornar resultado
  IF array_length(v_erros, 1) IS NULL OR array_length(v_erros, 1) = 0 THEN
    RETURN jsonb_build_object(
      'valido', true,
      'consignacao_id', p_consignacao_id,
      'mensagem', 'Consignação pode ser aprovada'
    );
  ELSE
    RETURN jsonb_build_object(
      'valido', false,
      'consignacao_id', p_consignacao_id,
      'erros', array_to_json(v_erros)
    );
  END IF;
END;
$$;

COMMENT ON FUNCTION public.validar_consignacao IS 'Valida se consignação pode ser aprovada';


-- ============================================================================
-- RPC 8: calcular_abbott_score
-- Descrição: Calcula score de compliance Abbott para uma empresa
-- ============================================================================
CREATE OR REPLACE FUNCTION public.calcular_abbott_score(
  p_empresa_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_pontos DECIMAL;
  v_pontos_obtidos DECIMAL;
  v_percentual DECIMAL;
  v_nivel VARCHAR;
  v_detalhes JSONB;
BEGIN
  -- Calcular pontuação
  SELECT 
    SUM(pontos_possiveis * peso_calculo) as total,
    SUM(pontos_obtidos * peso_calculo) as obtidos
  INTO v_total_pontos, v_pontos_obtidos
  FROM public.compliance_requisitos_abbott
  WHERE empresa_id = p_empresa_id
    AND ativo = true
    AND NOT dispensado;

  -- Calcular percentual
  IF v_total_pontos > 0 THEN
    v_percentual := (v_pontos_obtidos / v_total_pontos) * 100;
  ELSE
    v_percentual := 0;
  END IF;

  -- Determinar nível
  v_nivel := CASE 
    WHEN v_percentual >= 90 THEN 'EXCELENTE'
    WHEN v_percentual >= 75 THEN 'BOM'
    WHEN v_percentual >= 60 THEN 'REGULAR'
    ELSE 'INSUFICIENTE'
  END;

  -- Detalhes por categoria
  SELECT jsonb_object_agg(
    categoria,
    jsonb_build_object(
      'pontos_possiveis', pontos_possiveis,
      'pontos_obtidos', pontos_obtidos,
      'percentual', ROUND((pontos_obtidos / NULLIF(pontos_possiveis, 0)) * 100, 2)
    )
  )
  INTO v_detalhes
  FROM (
    SELECT 
      categoria,
      SUM(pontos_possiveis) as pontos_possiveis,
      SUM(pontos_obtidos) as pontos_obtidos
    FROM public.compliance_requisitos_abbott
    WHERE empresa_id = p_empresa_id
      AND ativo = true
      AND NOT dispensado
    GROUP BY categoria
  ) sub;

  -- Retornar resultado
  RETURN jsonb_build_object(
    'empresa_id', p_empresa_id,
    'score', ROUND(v_percentual, 2),
    'nivel', v_nivel,
    'pontos_totais', v_total_pontos,
    'pontos_obtidos', v_pontos_obtidos,
    'categorias', v_detalhes,
    'calculado_em', NOW()
  );
END;
$$;

COMMENT ON FUNCTION public.calcular_abbott_score IS 'Calcula score de compliance Abbott com detalhamento por categoria';


-- ============================================================================
-- RPC 9: get_compliance_status
-- Descrição: Retorna status geral de compliance de uma empresa
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_compliance_status(
  p_empresa_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_resultado JSONB;
  v_abbott_score JSONB;
BEGIN
  -- Buscar score Abbott
  v_abbott_score := public.calcular_abbott_score(p_empresa_id);

  -- Montar resultado com estatísticas
  SELECT jsonb_build_object(
    'empresa_id', p_empresa_id,
    'abbott_score', v_abbott_score,
    'requisitos', jsonb_build_object(
      'total', COUNT(*),
      'conformes', COUNT(*) FILTER (WHERE status = 'CONFORME'),
      'nao_conformes', COUNT(*) FILTER (WHERE status = 'NAO_CONFORME'),
      'em_adequacao', COUNT(*) FILTER (WHERE status = 'EM_ADEQUACAO'),
      'pendentes', COUNT(*) FILTER (WHERE status = 'PENDENTE')
    ),
    'proximas_avaliacoes', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'codigo', codigo_requisito,
          'nome', nome_requisito,
          'data', data_proxima_avaliacao,
          'criticidade', nivel_criticidade
        )
        ORDER BY data_proxima_avaliacao
      )
      FROM public.compliance_requisitos_abbott
      WHERE empresa_id = p_empresa_id
        AND ativo = true
        AND data_proxima_avaliacao >= CURRENT_DATE
        AND data_proxima_avaliacao <= CURRENT_DATE + 30
    ),
    'consultado_em', NOW()
  )
  INTO v_resultado
  FROM public.compliance_requisitos_abbott
  WHERE empresa_id = p_empresa_id
    AND ativo = true;

  RETURN v_resultado;
END;
$$;

COMMENT ON FUNCTION public.get_compliance_status IS 'Retorna status completo de compliance incluindo score Abbott';


-- ============================================================================
-- RPC 10: search_cirurgias
-- Descrição: Busca cirurgias por texto (full-text search)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.search_cirurgias(
  p_empresa_id UUID,
  p_query TEXT
)
RETURNS TABLE (
  id UUID,
  numero_cirurgia VARCHAR,
  paciente_nome VARCHAR,
  medico_nome VARCHAR,
  hospital_nome VARCHAR,
  data_cirurgia TIMESTAMP,
  status VARCHAR,
  relevancia REAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.numero_cirurgia,
    p.nome as paciente_nome,
    m.nome as medico_nome,
    h.nome as hospital_nome,
    c.data_cirurgia,
    c.status,
    ts_rank(
      to_tsvector('portuguese', 
        COALESCE(c.numero_cirurgia, '') || ' ' ||
        COALESCE(p.nome, '') || ' ' ||
        COALESCE(m.nome, '') || ' ' ||
        COALESCE(h.nome, '')
      ),
      plainto_tsquery('portuguese', p_query)
    ) as relevancia
  FROM public.cirurgias c
  LEFT JOIN public.pacientes p ON c.paciente_id = p.id
  LEFT JOIN public.medicos m ON c.medico_id = m.id
  LEFT JOIN public.hospitais h ON c.hospital_id = h.id
  WHERE c.empresa_id = p_empresa_id
    AND to_tsvector('portuguese', 
          COALESCE(c.numero_cirurgia, '') || ' ' ||
          COALESCE(p.nome, '') || ' ' ||
          COALESCE(m.nome, '') || ' ' ||
          COALESCE(h.nome, '')
        ) @@ plainto_tsquery('portuguese', p_query)
  ORDER BY relevancia DESC, c.data_cirurgia DESC
  LIMIT 50;
END;
$$;

COMMENT ON FUNCTION public.search_cirurgias IS 'Busca cirurgias usando full-text search em português';


-- ============================================================================
-- RPC 11: get_rastreabilidade
-- Descrição: Retorna rastreabilidade completa de um produto OPME
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_rastreabilidade(
  p_produto_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_resultado JSONB;
BEGIN
  SELECT jsonb_build_object(
    'produto', (
      SELECT jsonb_build_object(
        'id', id,
        'codigo', codigo_interno,
        'nome', nome,
        'codigo_anvisa', codigo_anvisa
      )
      FROM public.produtos_opme
      WHERE id = p_produto_id
    ),
    'historico', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', r.id,
          'numero_serie', r.numero_serie,
          'numero_lote', r.numero_lote,
          'data_fabricacao', r.data_fabricacao,
          'data_validade', r.data_validade,
          'localizacao_atual', r.localizacao_atual,
          'entrada', jsonb_build_object(
            'tipo', r.tipo_entrada,
            'data', r.data_entrada,
            'nota_fiscal', r.nota_fiscal_entrada
          ),
          'utilizacao', CASE 
            WHEN r.cirurgia_id IS NOT NULL THEN
              jsonb_build_object(
                'cirurgia_id', r.cirurgia_id,
                'paciente', (SELECT nome FROM public.pacientes WHERE id = r.paciente_id),
                'medico', (SELECT nome FROM public.medicos WHERE id = r.medico_id),
                'data', r.data_utilizacao
              )
            ELSE NULL
          END,
          'saida', CASE 
            WHEN r.tipo_saida IS NOT NULL THEN
              jsonb_build_object(
                'tipo', r.tipo_saida,
                'data', r.data_saida,
                'motivo', r.motivo_saida
              )
            ELSE NULL
          END,
          'recall', r.possui_recall,
          'em_quarentena', r.em_quarentena
        )
        ORDER BY r.data_entrada DESC
      )
      FROM public.rastreabilidade_opme r
      WHERE r.produto_opme_id = p_produto_id
    ),
    'total_unidades', (
      SELECT COUNT(*)
      FROM public.rastreabilidade_opme
      WHERE produto_opme_id = p_produto_id
    ),
    'em_estoque', (
      SELECT COUNT(*)
      FROM public.rastreabilidade_opme
      WHERE produto_opme_id = p_produto_id
        AND localizacao_atual = 'ESTOQUE'
    ),
    'utilizados', (
      SELECT COUNT(*)
      FROM public.rastreabilidade_opme
      WHERE produto_opme_id = p_produto_id
        AND localizacao_atual = 'UTILIZADO'
    ),
    'consultado_em', NOW()
  )
  INTO v_resultado;

  RETURN v_resultado;
END;
$$;

COMMENT ON FUNCTION public.get_rastreabilidade IS 'Retorna histórico completo de rastreabilidade de um produto OPME';


-- ============================================================================
-- RPC 12: get_metricas_financeiras
-- Descrição: Retorna métricas financeiras de um período
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_metricas_financeiras(
  p_empresa_id UUID,
  p_periodo VARCHAR DEFAULT 'mes_atual'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_data_inicio DATE;
  v_data_fim DATE;
  v_resultado JSONB;
BEGIN
  -- Definir período
  CASE p_periodo
    WHEN 'mes_atual' THEN
      v_data_inicio := date_trunc('month', CURRENT_DATE);
      v_data_fim := date_trunc('month', CURRENT_DATE) + interval '1 month' - interval '1 day';
    WHEN 'mes_anterior' THEN
      v_data_inicio := date_trunc('month', CURRENT_DATE - interval '1 month');
      v_data_fim := date_trunc('month', CURRENT_DATE) - interval '1 day';
    WHEN 'trimestre' THEN
      v_data_inicio := date_trunc('quarter', CURRENT_DATE);
      v_data_fim := date_trunc('quarter', CURRENT_DATE) + interval '3 months' - interval '1 day';
    WHEN 'ano' THEN
      v_data_inicio := date_trunc('year', CURRENT_DATE);
      v_data_fim := date_trunc('year', CURRENT_DATE) + interval '1 year' - interval '1 day';
    ELSE
      v_data_inicio := CURRENT_DATE - 30;
      v_data_fim := CURRENT_DATE;
  END CASE;

  -- Calcular métricas
  SELECT jsonb_build_object(
    'periodo', jsonb_build_object(
      'tipo', p_periodo,
      'inicio', v_data_inicio,
      'fim', v_data_fim
    ),
    'receitas', (
      SELECT COALESCE(SUM(valor), 0)
      FROM public.contas_receber
      WHERE empresa_id = p_empresa_id
        AND data_vencimento BETWEEN v_data_inicio AND v_data_fim
        AND status IN ('RECEBIDO', 'PARCIALMENTE_RECEBIDO')
    ),
    'despesas', (
      SELECT COALESCE(SUM(valor), 0)
      FROM public.contas_pagar
      WHERE empresa_id = p_empresa_id
        AND data_vencimento BETWEEN v_data_inicio AND v_data_fim
        AND status = 'PAGO'
    ),
    'cirurgias', jsonb_build_object(
      'total', (
        SELECT COUNT(*)
        FROM public.cirurgias
        WHERE empresa_id = p_empresa_id
          AND data_cirurgia BETWEEN v_data_inicio AND v_data_fim
      ),
      'finalizadas', (
        SELECT COUNT(*)
        FROM public.cirurgias
        WHERE empresa_id = p_empresa_id
          AND data_cirurgia BETWEEN v_data_inicio AND v_data_fim
          AND status = 'FINALIZADA'
      ),
      'valor_total', (
        SELECT COALESCE(SUM(valor_total), 0)
        FROM public.cirurgias
        WHERE empresa_id = p_empresa_id
          AND data_cirurgia BETWEEN v_data_inicio AND v_data_fim
          AND status = 'FINALIZADA'
      )
    ),
    'calculado_em', NOW()
  )
  INTO v_resultado;

  RETURN v_resultado;
END;
$$;

COMMENT ON FUNCTION public.get_metricas_financeiras IS 'Retorna métricas financeiras consolidadas de um período';


-- ============================================================================
-- RPC 13: otimizar_rota
-- Descrição: Simples cálculo de rota otimizada (placeholder para integração futura)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.otimizar_rota(
  p_origem VARCHAR,
  p_destino VARCHAR
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- TODO: Integrar com serviço de rotas (Google Maps, etc)
  -- Por enquanto, retorna estrutura básica
  
  RETURN jsonb_build_object(
    'origem', p_origem,
    'destino', p_destino,
    'distancia_km', 0,
    'tempo_estimado_minutos', 0,
    'rota_otimizada', false,
    'mensagem', 'Funcionalidade em desenvolvimento - Integração com API de rotas pendente',
    'sugestao', 'Use Google Maps API ou similar para cálculo real de rotas'
  );
END;
$$;

COMMENT ON FUNCTION public.otimizar_rota IS 'Placeholder para otimização de rotas - requer integração com API externa';


-- ============================================================================
-- RPC 14: get_alertas_criticos
-- Descrição: Retorna alertas críticos do sistema para uma empresa
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_alertas_criticos(
  p_empresa_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_alertas JSONB[];
BEGIN
  -- Estoque baixo
  IF EXISTS (
    SELECT 1 FROM public.get_estoque_baixo(p_empresa_id)
    WHERE criticidade = 'CRÍTICO'
  ) THEN
    v_alertas := array_append(v_alertas, jsonb_build_object(
      'tipo', 'ESTOQUE_CRITICO',
      'nivel', 'CRITICO',
      'mensagem', 'Existem produtos com estoque crítico',
      'detalhes', (
        SELECT jsonb_agg(jsonb_build_object('produto', nome, 'estoque', estoque_atual))
        FROM public.get_estoque_baixo(p_empresa_id)
        WHERE criticidade = 'CRÍTICO'
        LIMIT 5
      )
    ));
  END IF;

  -- Compliance baixo
  DECLARE
    v_compliance_score DECIMAL;
  BEGIN
    v_compliance_score := (public.calcular_abbott_score(p_empresa_id)->>'score')::DECIMAL;
    IF v_compliance_score < 60 THEN
      v_alertas := array_append(v_alertas, jsonb_build_object(
        'tipo', 'COMPLIANCE_BAIXO',
        'nivel', 'ALTO',
        'mensagem', format('Score de compliance Abbott baixo: %s%%', v_compliance_score),
        'score', v_compliance_score
      ));
    END IF;
  END;

  -- Contas a receber vencidas
  IF EXISTS (
    SELECT 1 FROM public.contas_receber
    WHERE empresa_id = p_empresa_id
      AND status = 'PENDENTE'
      AND data_vencimento < CURRENT_DATE
  ) THEN
    v_alertas := array_append(v_alertas, jsonb_build_object(
      'tipo', 'CONTAS_VENCIDAS',
      'nivel', 'ALTO',
      'mensagem', 'Existem contas a receber vencidas',
      'total_vencido', (
        SELECT COALESCE(SUM(valor), 0)
        FROM public.contas_receber
        WHERE empresa_id = p_empresa_id
          AND status = 'PENDENTE'
          AND data_vencimento < CURRENT_DATE
      )
    ));
  END IF;

  -- Produtos OPME com recall
  IF EXISTS (
    SELECT 1 FROM public.rastreabilidade_opme
    WHERE empresa_id = p_empresa_id
      AND possui_recall = true
      AND localizacao_atual IN ('ESTOQUE', 'CONSIGNACAO')
  ) THEN
    v_alertas := array_append(v_alertas, jsonb_build_object(
      'tipo', 'RECALL_ATIVO',
      'nivel', 'CRITICO',
      'mensagem', 'Produtos OPME com recall ativo em estoque',
      'quantidade', (
        SELECT COUNT(*)
        FROM public.rastreabilidade_opme
        WHERE empresa_id = p_empresa_id
          AND possui_recall = true
          AND localizacao_atual IN ('ESTOQUE', 'CONSIGNACAO')
      )
    ));
  END IF;

  -- Retornar todos os alertas
  RETURN jsonb_build_object(
    'empresa_id', p_empresa_id,
    'total_alertas', array_length(v_alertas, 1),
    'alertas', array_to_json(v_alertas),
    'consultado_em', NOW()
  );
END;
$$;

COMMENT ON FUNCTION public.get_alertas_criticos IS 'Retorna lista de alertas críticos do sistema';


-- ============================================================================
-- FIM DA MIGRATION - 14 RPCs CRIADAS
-- ============================================================================




-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Migração: 20251025_create_materialized_views.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Migration: Criar Views Materializadas para Performance
-- Gerado por: Agente 03 - Passo 4
-- Data: 2025-10-25
-- Descrição: Cria views materializadas para otimizar queries frequentes

-- ============================================================================
-- VIEW 1: mv_dashboard_kpis
-- Descrição: KPIs principais do dashboard por empresa
-- ============================================================================
DROP MATERIALIZED VIEW IF EXISTS public.mv_dashboard_kpis CASCADE;
CREATE MATERIALIZED VIEW public.mv_dashboard_kpis AS
SELECT 
  e.id as empresa_id,
  e.nome as empresa_nome,
  
  -- Cirurgias
  COUNT(DISTINCT c.id) FILTER (WHERE c.data_cirurgia >= CURRENT_DATE - INTERVAL '30 days') as cirurgias_mes,
  COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'FINALIZADA' AND c.data_cirurgia >= CURRENT_DATE - INTERVAL '30 days') as cirurgias_finalizadas_mes,
  COALESCE(SUM(c.valor_total) FILTER (WHERE c.status = 'FINALIZADA' AND c.data_cirurgia >= CURRENT_DATE - INTERVAL '30 days'), 0) as faturamento_mes,
  
  -- Estoque
  COUNT(DISTINCT e2.produto_id) FILTER (WHERE e2.quantidade < p.estoque_minimo) as produtos_estoque_baixo,
  COUNT(DISTINCT e2.produto_id) FILTER (WHERE e2.quantidade = 0) as produtos_sem_estoque,
  
  -- Compliance
  AVG((cr.pontos_obtidos / NULLIF(cr.pontos_possiveis, 0)) * 100) FILTER (WHERE cr.ativo AND NOT cr.dispensado) as compliance_score,
  
  -- Financeiro
  COALESCE(SUM(cr2.valor) FILTER (WHERE cr2.status = 'PENDENTE' AND cr2.data_vencimento < CURRENT_DATE), 0) as contas_vencidas,
  
  -- Atualizado em
  NOW() as atualizado_em

FROM public.empresas e
LEFT JOIN public.cirurgias c ON e.id = c.empresa_id
LEFT JOIN public.estoque e2 ON e.id = e2.empresa_id
LEFT JOIN public.produtos p ON e2.produto_id = p.id
LEFT JOIN public.compliance_requisitos_abbott cr ON e.id = cr.empresa_id
LEFT JOIN public.contas_receber cr2 ON e.id = cr2.empresa_id
WHERE e.ativa = true
GROUP BY e.id, e.nome;

CREATE UNIQUE INDEX idx_mv_dashboard_kpis_empresa ON public.mv_dashboard_kpis(empresa_id);

COMMENT ON MATERIALIZED VIEW public.mv_dashboard_kpis IS 
  'KPIs principais para dashboard - Atualizar a cada 5 minutos';


-- ============================================================================
-- VIEW 2: mv_cirurgias_stats
-- Descrição: Estatísticas de cirurgias por empresa/período
-- ============================================================================
DROP MATERIALIZED VIEW IF EXISTS public.mv_cirurgias_stats CASCADE;
CREATE MATERIALIZED VIEW public.mv_cirurgias_stats AS
SELECT 
  empresa_id,
  date_trunc('month', data_cirurgia) as mes,
  
  COUNT(*) as total_cirurgias,
  COUNT(*) FILTER (WHERE status = 'FINALIZADA') as finalizadas,
  COUNT(*) FILTER (WHERE status = 'CANCELADA') as canceladas,
  
  COALESCE(SUM(valor_total) FILTER (WHERE status = 'FINALIZADA'), 0) as valor_total,
  COALESCE(AVG(valor_total) FILTER (WHERE status = 'FINALIZADA'), 0) as valor_medio,
  
  COUNT(DISTINCT medico_id) as total_medicos,
  COUNT(DISTINCT hospital_id) as total_hospitais,
  COUNT(DISTINCT paciente_id) as total_pacientes,
  
  NOW() as atualizado_em

FROM public.cirurgias
WHERE data_cirurgia >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY empresa_id, date_trunc('month', data_cirurgia);

CREATE INDEX idx_mv_cirurgias_stats_empresa_mes ON public.mv_cirurgias_stats(empresa_id, mes);

COMMENT ON MATERIALIZED VIEW public.mv_cirurgias_stats IS 
  'Estatísticas mensais de cirurgias - Atualizar diariamente';


-- ============================================================================
-- VIEW 3: mv_produtos_top
-- Descrição: Top produtos mais utilizados
-- ============================================================================
DROP MATERIALIZED VIEW IF EXISTS public.mv_produtos_top CASCADE;
CREATE MATERIALIZED VIEW public.mv_produtos_top AS
SELECT 
  p.empresa_id,
  p.id as produto_id,
  p.codigo,
  p.nome,
  p.categoria,
  
  COUNT(DISTINCT ic.cirurgia_id) as numero_cirurgias,
  SUM(ic.quantidade) as quantidade_total,
  SUM(ic.quantidade * ic.valor_unitario) as valor_total,
  AVG(ic.valor_unitario) as valor_medio_unitario,
  
  MAX(c.data_cirurgia) as ultima_utilizacao,
  
  NOW() as atualizado_em

FROM public.produtos p
INNER JOIN public.itens_cirurgia ic ON p.id = ic.produto_id
INNER JOIN public.cirurgias c ON ic.cirurgia_id = c.id
WHERE c.status = 'FINALIZADA'
  AND c.data_cirurgia >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY p.empresa_id, p.id, p.codigo, p.nome, p.categoria;

CREATE INDEX idx_mv_produtos_top_empresa ON public.mv_produtos_top(empresa_id);
CREATE INDEX idx_mv_produtos_top_quantidade ON public.mv_produtos_top(quantidade_total DESC);

COMMENT ON MATERIALIZED VIEW public.mv_produtos_top IS 
  'Top produtos utilizados nos últimos 90 dias - Atualizar diariamente';


-- ============================================================================
-- VIEW 4: mv_compliance_score
-- Descrição: Scores de compliance por empresa e categoria
-- ============================================================================
DROP MATERIALIZED VIEW IF EXISTS public.mv_compliance_score CASCADE;
CREATE MATERIALIZED VIEW public.mv_compliance_score AS
SELECT 
  empresa_id,
  categoria,
  
  COUNT(*) as total_requisitos,
  COUNT(*) FILTER (WHERE status = 'CONFORME') as requisitos_conformes,
  COUNT(*) FILTER (WHERE status = 'NAO_CONFORME') as requisitos_nao_conformes,
  COUNT(*) FILTER (WHERE status = 'EM_ADEQUACAO') as requisitos_em_adequacao,
  
  SUM(pontos_possiveis * peso_calculo) as pontos_possiveis_total,
  SUM(pontos_obtidos * peso_calculo) as pontos_obtidos_total,
  
  ROUND((SUM(pontos_obtidos * peso_calculo) / NULLIF(SUM(pontos_possiveis * peso_calculo), 0)) * 100, 2) as score_percentual,
  
  MIN(data_proxima_avaliacao) FILTER (WHERE data_proxima_avaliacao >= CURRENT_DATE) as proxima_avaliacao,
  
  NOW() as atualizado_em

FROM public.compliance_requisitos_abbott
WHERE ativo = true
  AND NOT dispensado
GROUP BY empresa_id, categoria;

CREATE INDEX idx_mv_compliance_score_empresa ON public.mv_compliance_score(empresa_id);
CREATE INDEX idx_mv_compliance_score_categoria ON public.mv_compliance_score(categoria);

COMMENT ON MATERIALIZED VIEW public.mv_compliance_score IS 
  'Scores de compliance por categoria - Atualizar a cada hora';


-- ============================================================================
-- VIEW 5: mv_estoque_status
-- Descrição: Status consolidado de estoque
-- ============================================================================
DROP MATERIALIZED VIEW IF EXISTS public.mv_estoque_status CASCADE;
CREATE MATERIALIZED VIEW public.mv_estoque_status AS
SELECT 
  p.empresa_id,
  p.id as produto_id,
  p.codigo,
  p.nome,
  p.categoria,
  
  COALESCE(e.quantidade, 0) as estoque_atual,
  p.estoque_minimo,
  p.estoque_maximo,
  p.ponto_reposicao,
  
  CASE 
    WHEN COALESCE(e.quantidade, 0) = 0 THEN 'SEM_ESTOQUE'
    WHEN COALESCE(e.quantidade, 0) < p.estoque_minimo THEN 'BAIXO'
    WHEN COALESCE(e.quantidade, 0) > p.estoque_maximo THEN 'EXCESSO'
    ELSE 'NORMAL'
  END as status_estoque,
  
  CASE 
    WHEN COALESCE(e.quantidade, 0) = 0 THEN 'CRITICO'
    WHEN COALESCE(e.quantidade, 0) < (p.estoque_minimo * 0.5) THEN 'ALTO'
    WHEN COALESCE(e.quantidade, 0) < p.estoque_minimo THEN 'MEDIO'
    ELSE 'BAIXO'
  END as nivel_criticidade,
  
  p.valor_compra,
  COALESCE(e.quantidade, 0) * p.valor_compra as valor_estoque,
  
  e.atualizado_em as estoque_atualizado_em,
  NOW() as calculado_em

FROM public.produtos p
LEFT JOIN public.estoque e ON p.id = e.produto_id AND p.empresa_id = e.empresa_id
WHERE p.ativo = true;

CREATE INDEX idx_mv_estoque_status_empresa ON public.mv_estoque_status(empresa_id);
CREATE INDEX idx_mv_estoque_status_criticidade ON public.mv_estoque_status(nivel_criticidade);
CREATE INDEX idx_mv_estoque_status_status ON public.mv_estoque_status(status_estoque);

COMMENT ON MATERIALIZED VIEW public.mv_estoque_status IS 
  'Status consolidado de estoque com criticidade - Atualizar a cada 15 minutos';


-- ============================================================================
-- VIEW 6: mv_financeiro_resumo
-- Descrição: Resumo financeiro mensal
-- ============================================================================
DROP MATERIALIZED VIEW IF EXISTS public.mv_financeiro_resumo CASCADE;
CREATE MATERIALIZED VIEW public.mv_financeiro_resumo AS
WITH receitas AS (
  SELECT 
    empresa_id,
    date_trunc('month', data_vencimento) as mes,
    SUM(valor) as total_receitas,
    SUM(valor) FILTER (WHERE status = 'RECEBIDO') as receitas_recebidas,
    SUM(valor) FILTER (WHERE status = 'PENDENTE') as receitas_pendentes,
    SUM(valor) FILTER (WHERE status = 'PENDENTE' AND data_vencimento < CURRENT_DATE) as receitas_vencidas
  FROM public.contas_receber
  WHERE data_vencimento >= CURRENT_DATE - INTERVAL '12 months'
  GROUP BY empresa_id, date_trunc('month', data_vencimento)
),
despesas AS (
  SELECT 
    empresa_id,
    date_trunc('month', data_vencimento) as mes,
    SUM(valor) as total_despesas,
    SUM(valor) FILTER (WHERE status = 'PAGO') as despesas_pagas,
    SUM(valor) FILTER (WHERE status = 'PENDENTE') as despesas_pendentes,
    SUM(valor) FILTER (WHERE status = 'PENDENTE' AND data_vencimento < CURRENT_DATE) as despesas_vencidas
  FROM public.contas_pagar
  WHERE data_vencimento >= CURRENT_DATE - INTERVAL '12 months'
  GROUP BY empresa_id, date_trunc('month', data_vencimento)
)
SELECT 
  COALESCE(r.empresa_id, d.empresa_id) as empresa_id,
  COALESCE(r.mes, d.mes) as mes,
  
  COALESCE(r.total_receitas, 0) as total_receitas,
  COALESCE(r.receitas_recebidas, 0) as receitas_recebidas,
  COALESCE(r.receitas_pendentes, 0) as receitas_pendentes,
  COALESCE(r.receitas_vencidas, 0) as receitas_vencidas,
  
  COALESCE(d.total_despesas, 0) as total_despesas,
  COALESCE(d.despesas_pagas, 0) as despesas_pagas,
  COALESCE(d.despesas_pendentes, 0) as despesas_pendentes,
  COALESCE(d.despesas_vencidas, 0) as despesas_vencidas,
  
  COALESCE(r.receitas_recebidas, 0) - COALESCE(d.despesas_pagas, 0) as saldo_realizado,
  COALESCE(r.total_receitas, 0) - COALESCE(d.total_despesas, 0) as saldo_previsto,
  
  NOW() as atualizado_em

FROM receitas r
FULL OUTER JOIN despesas d ON r.empresa_id = d.empresa_id AND r.mes = d.mes;

CREATE INDEX idx_mv_financeiro_resumo_empresa_mes ON public.mv_financeiro_resumo(empresa_id, mes);

COMMENT ON MATERIALIZED VIEW public.mv_financeiro_resumo IS 
  'Resumo financeiro mensal - Atualizar diariamente';


-- ============================================================================
-- VIEW 7: mv_rastreabilidade_resumo
-- Descrição: Resumo de rastreabilidade por produto OPME
-- ============================================================================
DROP MATERIALIZED VIEW IF EXISTS public.mv_rastreabilidade_resumo CASCADE;
CREATE MATERIALIZED VIEW public.mv_rastreabilidade_resumo AS
SELECT 
  po.empresa_id,
  po.id as produto_opme_id,
  po.codigo_interno,
  po.nome,
  po.codigo_anvisa,
  
  COUNT(r.id) as total_unidades,
  COUNT(r.id) FILTER (WHERE r.localizacao_atual = 'ESTOQUE') as em_estoque,
  COUNT(r.id) FILTER (WHERE r.localizacao_atual = 'CONSIGNACAO') as em_consignacao,
  COUNT(r.id) FILTER (WHERE r.localizacao_atual = 'EM_USO') as em_uso,
  COUNT(r.id) FILTER (WHERE r.localizacao_atual = 'UTILIZADO') as utilizados,
  COUNT(r.id) FILTER (WHERE r.localizacao_atual = 'DEVOLVIDO') as devolvidos,
  COUNT(r.id) FILTER (WHERE r.localizacao_atual = 'DESCARTADO') as descartados,
  
  COUNT(r.id) FILTER (WHERE r.possui_recall = true) as com_recall,
  COUNT(r.id) FILTER (WHERE r.em_quarentena = true) as em_quarentena,
  COUNT(r.id) FILTER (WHERE r.bloqueado = true) as bloqueados,
  
  MIN(r.data_validade) FILTER (WHERE r.localizacao_atual IN ('ESTOQUE', 'CONSIGNACAO')) as proxima_validade,
  
  NOW() as atualizado_em

FROM public.produtos_opme po
LEFT JOIN public.rastreabilidade_opme r ON po.id = r.produto_opme_id
WHERE po.ativo = true
GROUP BY po.empresa_id, po.id, po.codigo_interno, po.nome, po.codigo_anvisa;

CREATE INDEX idx_mv_rastreabilidade_resumo_empresa ON public.mv_rastreabilidade_resumo(empresa_id);
CREATE INDEX idx_mv_rastreabilidade_resumo_recall ON public.mv_rastreabilidade_resumo(com_recall) WHERE com_recall > 0;

COMMENT ON MATERIALIZED VIEW public.mv_rastreabilidade_resumo IS 
  'Resumo de rastreabilidade por produto OPME - Atualizar a cada hora';


-- ============================================================================
-- VIEW 8: mv_consignacao_stats
-- Descrição: Estatísticas de consignação
-- ============================================================================
DROP MATERIALIZED VIEW IF EXISTS public.mv_consignacao_stats CASCADE;
CREATE MATERIALIZED VIEW public.mv_consignacao_stats AS
SELECT 
  empresa_id,
  date_trunc('month', data_consignacao) as mes,
  tipo_consignacao,
  status,
  
  COUNT(*) as total_consignacoes,
  SUM(quantidade) as quantidade_total,
  SUM(quantidade * valor_unitario) as valor_total,
  AVG(valor_unitario) as valor_medio_unitario,
  
  COUNT(DISTINCT hospital_id) as total_hospitais,
  COUNT(DISTINCT fornecedor_id) as total_fornecedores,
  COUNT(DISTINCT produto_id) as total_produtos,
  
  NOW() as atualizado_em

FROM public.consignacao_materiais
WHERE data_consignacao >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY empresa_id, date_trunc('month', data_consignacao), tipo_consignacao, status;

CREATE INDEX idx_mv_consignacao_stats_empresa_mes ON public.mv_consignacao_stats(empresa_id, mes);

COMMENT ON MATERIALIZED VIEW public.mv_consignacao_stats IS 
  'Estatísticas mensais de consignação - Atualizar diariamente';


-- ============================================================================
-- VIEW 9: mv_medicos_performance
-- Descrição: Performance de médicos
-- ============================================================================
DROP MATERIALIZED VIEW IF EXISTS public.mv_medicos_performance CASCADE;
CREATE MATERIALIZED VIEW public.mv_medicos_performance AS
SELECT 
  m.empresa_id,
  m.id as medico_id,
  m.nome,
  m.crm,
  m.especialidade,
  
  COUNT(DISTINCT c.id) FILTER (WHERE c.data_cirurgia >= CURRENT_DATE - INTERVAL '90 days') as cirurgias_90_dias,
  COUNT(DISTINCT c.id) FILTER (WHERE c.data_cirurgia >= CURRENT_DATE - INTERVAL '30 days') as cirurgias_30_dias,
  COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'FINALIZADA') as cirurgias_finalizadas,
  COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'CANCELADA') as cirurgias_canceladas,
  
  COALESCE(SUM(c.valor_total) FILTER (WHERE c.status = 'FINALIZADA' AND c.data_cirurgia >= CURRENT_DATE - INTERVAL '90 days'), 0) as faturamento_90_dias,
  COALESCE(AVG(c.valor_total) FILTER (WHERE c.status = 'FINALIZADA'), 0) as ticket_medio,
  
  COUNT(DISTINCT c.hospital_id) as total_hospitais,
  COUNT(DISTINCT c.paciente_id) as total_pacientes,
  
  MAX(c.data_cirurgia) as ultima_cirurgia,
  
  NOW() as atualizado_em

FROM public.medicos m
LEFT JOIN public.cirurgias c ON m.id = c.medico_id
WHERE m.ativo = true
GROUP BY m.empresa_id, m.id, m.nome, m.crm, m.especialidade;

CREATE INDEX idx_mv_medicos_performance_empresa ON public.mv_medicos_performance(empresa_id);
CREATE INDEX idx_mv_medicos_performance_cirurgias ON public.mv_medicos_performance(cirurgias_90_dias DESC);

COMMENT ON MATERIALIZED VIEW public.mv_medicos_performance IS 
  'Performance de médicos - Atualizar diariamente';


-- ============================================================================
-- VIEW 10: mv_hospitais_stats
-- Descrição: Estatísticas por hospital
-- ============================================================================
DROP MATERIALIZED VIEW IF EXISTS public.mv_hospitais_stats CASCADE;
CREATE MATERIALIZED VIEW public.mv_hospitais_stats AS
SELECT 
  h.empresa_id,
  h.id as hospital_id,
  h.nome,
  h.cnpj,
  h.cidade,
  h.estado,
  
  COUNT(DISTINCT c.id) FILTER (WHERE c.data_cirurgia >= CURRENT_DATE - INTERVAL '90 days') as cirurgias_90_dias,
  COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'FINALIZADA') as cirurgias_finalizadas,
  
  COALESCE(SUM(c.valor_total) FILTER (WHERE c.status = 'FINALIZADA' AND c.data_cirurgia >= CURRENT_DATE - INTERVAL '90 dias'), 0) as faturamento_90_dias,
  
  COUNT(DISTINCT c.medico_id) as total_medicos,
  COUNT(DISTINCT c.paciente_id) as total_pacientes,
  
  COUNT(DISTINCT cm.id) FILTER (WHERE cm.data_consignacao >= CURRENT_DATE - INTERVAL '90 days') as consignacoes_90_dias,
  
  MAX(c.data_cirurgia) as ultima_cirurgia,
  
  NOW() as atualizado_em

FROM public.hospitais h
LEFT JOIN public.cirurgias c ON h.id = c.hospital_id
LEFT JOIN public.consignacao_materiais cm ON h.id = cm.hospital_id
WHERE h.ativo = true
GROUP BY h.empresa_id, h.id, h.nome, h.cnpj, h.cidade, h.estado;

CREATE INDEX idx_mv_hospitais_stats_empresa ON public.mv_hospitais_stats(empresa_id);
CREATE INDEX idx_mv_hospitais_stats_cirurgias ON public.mv_hospitais_stats(cirurgias_90_dias DESC);

COMMENT ON MATERIALIZED VIEW public.mv_hospitais_stats IS 
  'Estatísticas por hospital - Atualizar diariamente';


-- ============================================================================
-- FUNÇÃO PARA REFRESH AUTOMÁTICO
-- ============================================================================
CREATE OR REPLACE FUNCTION public.refresh_materialized_views()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_dashboard_kpis;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_cirurgias_stats;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_produtos_top;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_compliance_score;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_estoque_status;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_financeiro_resumo;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_rastreabilidade_resumo;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_consignacao_stats;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_medicos_performance;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_hospitais_stats;
  
  RAISE NOTICE 'Todas as materialized views foram atualizadas em %', NOW();
END;
$$;

COMMENT ON FUNCTION public.refresh_materialized_views IS 
  'Atualiza todas as materialized views - Executar via cron/scheduler';


-- ============================================================================
-- FIM DA MIGRATION - 10 VIEWS MATERIALIZADAS CRIADAS
-- ============================================================================

-- Para atualizar todas as views, execute:
-- SELECT public.refresh_materialized_views();

-- Recomenda-se agendar refresh automático:
-- - Críticas (dashboard_kpis, estoque_status): a cada 5-15 minutos
-- - Importantes (compliance, rastreabilidade): a cada hora
-- - Estatísticas (cirurgias, financeiro, etc): diariamente




-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Migração: 20251025_create_missing_critical_tables.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Migration: Criar Tabelas Críticas Ausentes
-- Gerado por: Agente 03 - Próximos Passos
-- Data: 2025-10-25
-- Descrição: Cria 4 tabelas críticas identificadas como ausentes na auditoria

-- ============================================================================
-- TABELA 1: consignacao_materiais
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.consignacao_materiais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Identificação da Consignação
  numero_consignacao VARCHAR(50) NOT NULL,
  tipo_consignacao VARCHAR(20) NOT NULL CHECK (tipo_consignacao IN ('ENTRADA', 'SAIDA', 'DEVOLUCAO')),
  status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'APROVADA', 'REJEITADA', 'FINALIZADA', 'CANCELADA')),
  
  -- Relacionamentos
  cirurgia_id UUID REFERENCES public.cirurgias(id) ON DELETE SET NULL,
  hospital_id UUID REFERENCES public.hospitais(id) ON DELETE SET NULL,
  fornecedor_id UUID REFERENCES public.fornecedores(id) ON DELETE SET NULL,
  
  -- Produto
  produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE RESTRICT,
  lote_id UUID REFERENCES public.lotes(id) ON DELETE SET NULL,
  quantidade DECIMAL(10,2) NOT NULL CHECK (quantidade > 0),
  quantidade_utilizada DECIMAL(10,2) DEFAULT 0 CHECK (quantidade_utilizada >= 0),
  unidade_medida VARCHAR(10) NOT NULL DEFAULT 'UN',
  
  -- Valores Financeiros
  valor_unitario DECIMAL(10,2) NOT NULL CHECK (valor_unitario >= 0),
  valor_total DECIMAL(10,2) GENERATED ALWAYS AS (quantidade * valor_unitario) STORED,
  
  -- Datas
  data_consignacao TIMESTAMP NOT NULL DEFAULT NOW(),
  data_prevista_retorno TIMESTAMP,
  data_retorno TIMESTAMP,
  data_utilizacao TIMESTAMP,
  
  -- Rastreabilidade
  numero_nota_fiscal VARCHAR(50),
  serie_nota_fiscal VARCHAR(10),
  numero_serie_produto VARCHAR(100),
  
  -- Observações
  observacoes TEXT,
  motivo_rejeicao TEXT,
  
  -- Responsáveis
  responsavel_envio_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  responsavel_recebimento_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  
  -- Auditoria
  criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMP NOT NULL DEFAULT NOW(),
  criado_por UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  atualizado_por UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  
  -- Constraints
  CONSTRAINT uk_consignacao_numero UNIQUE (empresa_id, numero_consignacao),
  CONSTRAINT ck_quantidade_utilizada CHECK (quantidade_utilizada <= quantidade),
  CONSTRAINT ck_data_retorno CHECK (data_retorno IS NULL OR data_retorno >= data_consignacao)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_consignacao_materiais_empresa ON public.consignacao_materiais(empresa_id);
CREATE INDEX IF NOT EXISTS idx_consignacao_materiais_cirurgia ON public.consignacao_materiais(cirurgia_id);
CREATE INDEX IF NOT EXISTS idx_consignacao_materiais_produto ON public.consignacao_materiais(produto_id);
CREATE INDEX IF NOT EXISTS idx_consignacao_materiais_status ON public.consignacao_materiais(status);
CREATE INDEX IF NOT EXISTS idx_consignacao_materiais_data ON public.consignacao_materiais(data_consignacao);
CREATE INDEX IF NOT EXISTS idx_consignacao_materiais_tipo ON public.consignacao_materiais(tipo_consignacao);

-- Comentários
COMMENT ON TABLE public.consignacao_materiais IS 'Controle de materiais em consignação - entrada, saída e devolução';
COMMENT ON COLUMN public.consignacao_materiais.quantidade_utilizada IS 'Quantidade efetivamente utilizada na cirurgia';
COMMENT ON COLUMN public.consignacao_materiais.valor_total IS 'Valor total calculado automaticamente (quantidade * valor_unitario)';


-- ============================================================================
-- TABELA 2: produtos_opme
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.produtos_opme (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Identificação do Produto OPME
  codigo_interno VARCHAR(50) NOT NULL,
  codigo_anvisa VARCHAR(50) UNIQUE,
  registro_anvisa VARCHAR(50),
  codigo_fabricante VARCHAR(50),
  codigo_barras VARCHAR(50),
  
  -- Informações Básicas
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('ORTESE', 'PROTESE', 'MATERIAL_ESPECIAL', 'IMPLANTE')),
  subcategoria VARCHAR(100),
  tipo_material VARCHAR(100),
  
  -- Fabricante
  fabricante_id UUID REFERENCES public.fabricantes(id) ON DELETE SET NULL,
  fabricante_nome VARCHAR(255),
  pais_origem VARCHAR(2),
  
  -- Especificações Técnicas
  marca VARCHAR(100),
  modelo VARCHAR(100),
  tamanho VARCHAR(50),
  cor VARCHAR(50),
  lado VARCHAR(20) CHECK (lado IN ('DIREITO', 'ESQUERDO', 'BILATERAL', 'NAO_APLICAVEL')),
  material_composicao TEXT,
  
  -- Características OPME
  requer_rastreabilidade BOOLEAN NOT NULL DEFAULT true,
  requer_serie BOOLEAN NOT NULL DEFAULT true,
  vida_util_meses INTEGER,
  esteril BOOLEAN DEFAULT false,
  biocompativel BOOLEAN DEFAULT true,
  
  -- Classificação de Risco ANVISA
  classe_risco VARCHAR(10) CHECK (classe_risco IN ('I', 'II', 'III', 'IV')),
  
  -- Valores
  valor_compra DECIMAL(10,2) CHECK (valor_compra >= 0),
  valor_venda DECIMAL(10,2) CHECK (valor_venda >= 0),
  valor_tabela_sus DECIMAL(10,2),
  margem_lucro DECIMAL(5,2),
  
  -- Unidades
  unidade_medida VARCHAR(10) NOT NULL DEFAULT 'UN',
  unidades_por_embalagem INTEGER DEFAULT 1,
  
  -- Estoque
  estoque_minimo INTEGER DEFAULT 0,
  estoque_maximo INTEGER,
  ponto_reposicao INTEGER,
  
  -- Status
  ativo BOOLEAN NOT NULL DEFAULT true,
  bloqueado BOOLEAN DEFAULT false,
  motivo_bloqueio TEXT,
  
  -- Documentação
  possui_laudo_tecnico BOOLEAN DEFAULT false,
  possui_certificado_conformidade BOOLEAN DEFAULT false,
  data_validade_registro TIMESTAMP,
  
  -- Fornecimento
  tempo_entrega_dias INTEGER,
  fornecedor_principal_id UUID REFERENCES public.fornecedores(id) ON DELETE SET NULL,
  
  -- Observações
  observacoes TEXT,
  indicacoes_uso TEXT,
  contraindicacoes TEXT,
  
  -- Auditoria
  criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMP NOT NULL DEFAULT NOW(),
  criado_por UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  atualizado_por UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  
  -- Constraints
  CONSTRAINT uk_produtos_opme_codigo UNIQUE (empresa_id, codigo_interno),
  CONSTRAINT ck_valores_opme CHECK (valor_venda IS NULL OR valor_compra IS NULL OR valor_venda >= valor_compra)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_produtos_opme_empresa ON public.produtos_opme(empresa_id);
CREATE INDEX IF NOT EXISTS idx_produtos_opme_anvisa ON public.produtos_opme(codigo_anvisa);
CREATE INDEX IF NOT EXISTS idx_produtos_opme_categoria ON public.produtos_opme(categoria);
CREATE INDEX IF NOT EXISTS idx_produtos_opme_ativo ON public.produtos_opme(ativo);
CREATE INDEX IF NOT EXISTS idx_produtos_opme_nome ON public.produtos_opme USING gin(to_tsvector('portuguese', nome));
CREATE INDEX IF NOT EXISTS idx_produtos_opme_fabricante ON public.produtos_opme(fabricante_id);

-- Comentários
COMMENT ON TABLE public.produtos_opme IS 'Cadastro de produtos OPME (Órteses, Próteses e Materiais Especiais)';
COMMENT ON COLUMN public.produtos_opme.requer_rastreabilidade IS 'Define se o produto exige rastreabilidade completa (lote + série)';
COMMENT ON COLUMN public.produtos_opme.classe_risco IS 'Classificação de risco ANVISA: I (baixo) a IV (alto)';


-- ============================================================================
-- TABELA 3: rastreabilidade_opme
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.rastreabilidade_opme (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Identificação do Produto
  produto_opme_id UUID NOT NULL REFERENCES public.produtos_opme(id) ON DELETE RESTRICT,
  lote_id UUID REFERENCES public.lotes(id) ON DELETE SET NULL,
  numero_serie VARCHAR(100) NOT NULL,
  codigo_barras VARCHAR(100),
  
  -- Rastreabilidade Completa
  numero_lote VARCHAR(50),
  data_fabricacao DATE,
  data_validade DATE,
  data_esterilizacao DATE,
  metodo_esterilizacao VARCHAR(100),
  
  -- Origem
  fornecedor_id UUID REFERENCES public.fornecedores(id) ON DELETE SET NULL,
  fabricante_id UUID REFERENCES public.fabricantes(id) ON DELETE SET NULL,
  pais_origem VARCHAR(2),
  
  -- Entrada no Sistema
  tipo_entrada VARCHAR(20) NOT NULL CHECK (tipo_entrada IN ('COMPRA', 'CONSIGNACAO', 'DEVOLUCAO', 'TRANSFERENCIA')),
  data_entrada TIMESTAMP NOT NULL DEFAULT NOW(),
  nota_fiscal_entrada VARCHAR(50),
  serie_nf_entrada VARCHAR(10),
  valor_entrada DECIMAL(10,2),
  
  -- Localização Atual
  localizacao_atual VARCHAR(20) NOT NULL DEFAULT 'ESTOQUE' CHECK (
    localizacao_atual IN ('ESTOQUE', 'CONSIGNACAO', 'EM_USO', 'UTILIZADO', 'DEVOLVIDO', 'DESCARTADO')
  ),
  deposito_id UUID REFERENCES public.depositos(id) ON DELETE SET NULL,
  prateleira VARCHAR(50),
  
  -- Utilização
  cirurgia_id UUID REFERENCES public.cirurgias(id) ON DELETE SET NULL,
  paciente_id UUID REFERENCES public.pacientes(id) ON DELETE SET NULL,
  medico_id UUID REFERENCES public.medicos(id) ON DELETE SET NULL,
  data_utilizacao TIMESTAMP,
  hospital_id UUID REFERENCES public.hospitais(id) ON DELETE SET NULL,
  
  -- Consignação
  consignacao_id UUID REFERENCES public.consignacao_materiais(id) ON DELETE SET NULL,
  data_consignacao TIMESTAMP,
  data_devolucao TIMESTAMP,
  
  -- Saída do Sistema
  tipo_saida VARCHAR(20) CHECK (tipo_saida IN ('VENDA', 'USO_PROPRIO', 'DEVOLUCAO', 'DESCARTE', 'PERDA')),
  data_saida TIMESTAMP,
  motivo_saida TEXT,
  nota_fiscal_saida VARCHAR(50),
  serie_nf_saida VARCHAR(10),
  
  -- Documentação
  certificado_origem TEXT,
  laudo_tecnico TEXT,
  possui_documentacao_completa BOOLEAN DEFAULT false,
  
  -- Quarentena e Bloqueio
  em_quarentena BOOLEAN DEFAULT false,
  motivo_quarentena TEXT,
  data_inicio_quarentena TIMESTAMP,
  bloqueado BOOLEAN DEFAULT false,
  motivo_bloqueio TEXT,
  
  -- Recall
  possui_recall BOOLEAN DEFAULT false,
  numero_recall VARCHAR(50),
  data_recall DATE,
  motivo_recall TEXT,
  
  -- Observações
  observacoes TEXT,
  
  -- Auditoria
  criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMP NOT NULL DEFAULT NOW(),
  criado_por UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  atualizado_por UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  
  -- Constraints
  CONSTRAINT uk_rastreabilidade_serie UNIQUE (produto_opme_id, numero_serie),
  CONSTRAINT ck_data_validade CHECK (data_validade IS NULL OR data_validade >= data_fabricacao),
  CONSTRAINT ck_data_saida CHECK (data_saida IS NULL OR data_saida >= data_entrada)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_rastreabilidade_empresa ON public.rastreabilidade_opme(empresa_id);
CREATE INDEX IF NOT EXISTS idx_rastreabilidade_produto ON public.rastreabilidade_opme(produto_opme_id);
CREATE INDEX IF NOT EXISTS idx_rastreabilidade_serie ON public.rastreabilidade_opme(numero_serie);
CREATE INDEX IF NOT EXISTS idx_rastreabilidade_lote ON public.rastreabilidade_opme(numero_lote);
CREATE INDEX IF NOT EXISTS idx_rastreabilidade_cirurgia ON public.rastreabilidade_opme(cirurgia_id);
CREATE INDEX IF NOT EXISTS idx_rastreabilidade_paciente ON public.rastreabilidade_opme(paciente_id);
CREATE INDEX IF NOT EXISTS idx_rastreabilidade_localizacao ON public.rastreabilidade_opme(localizacao_atual);
CREATE INDEX IF NOT EXISTS idx_rastreabilidade_recall ON public.rastreabilidade_opme(possui_recall) WHERE possui_recall = true;

-- Comentários
COMMENT ON TABLE public.rastreabilidade_opme IS 'Rastreabilidade completa de produtos OPME da entrada até a utilização final';
COMMENT ON COLUMN public.rastreabilidade_opme.numero_serie IS 'Número de série único do produto OPME';
COMMENT ON COLUMN public.rastreabilidade_opme.localizacao_atual IS 'Localização atual do produto no fluxo';


-- ============================================================================
-- TABELA 4: compliance_requisitos_abbott
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.compliance_requisitos_abbott (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Identificação do Requisito
  codigo_requisito VARCHAR(50) NOT NULL,
  categoria VARCHAR(50) NOT NULL CHECK (categoria IN (
    'DOCUMENTACAO', 
    'TREINAMENTO', 
    'QUALIDADE', 
    'RASTREABILIDADE', 
    'FINANCEIRO',
    'OPERACIONAL',
    'REGULATORIO'
  )),
  nome_requisito VARCHAR(255) NOT NULL,
  descricao TEXT,
  
  -- Criticidade
  nivel_criticidade VARCHAR(20) NOT NULL DEFAULT 'MEDIA' CHECK (nivel_criticidade IN ('BAIXA', 'MEDIA', 'ALTA', 'CRITICA')),
  obrigatorio BOOLEAN NOT NULL DEFAULT true,
  
  -- Período de Avaliação
  tipo_periodo VARCHAR(20) CHECK (tipo_periodo IN ('MENSAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL', 'PONTUAL')),
  data_inicio_vigencia DATE NOT NULL,
  data_fim_vigencia DATE,
  
  -- Status de Conformidade
  status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE' CHECK (status IN (
    'PENDENTE',
    'EM_ANALISE', 
    'CONFORME', 
    'NAO_CONFORME', 
    'PARCIALMENTE_CONFORME',
    'EM_ADEQUACAO',
    'DISPENSADO'
  )),
  percentual_conformidade DECIMAL(5,2) DEFAULT 0 CHECK (percentual_conformidade BETWEEN 0 AND 100),
  
  -- Score Abbott
  peso_calculo INTEGER NOT NULL DEFAULT 1 CHECK (peso_calculo BETWEEN 1 AND 10),
  pontos_possiveis DECIMAL(5,2) NOT NULL DEFAULT 100,
  pontos_obtidos DECIMAL(5,2) DEFAULT 0 CHECK (pontos_obtidos >= 0),
  
  -- Datas de Verificação
  data_ultima_avaliacao TIMESTAMP,
  data_proxima_avaliacao TIMESTAMP,
  frequencia_dias INTEGER,
  
  -- Responsabilidades
  responsavel_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  auditor_abbott_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  
  -- Evidências
  requer_evidencia BOOLEAN DEFAULT true,
  tipo_evidencia TEXT,
  evidencias_anexadas JSONB DEFAULT '[]'::jsonb,
  
  -- Não Conformidades
  numero_nao_conformidades INTEGER DEFAULT 0,
  data_primeira_nao_conformidade TIMESTAMP,
  data_ultima_nao_conformidade TIMESTAMP,
  
  -- Plano de Ação
  possui_plano_acao BOOLEAN DEFAULT false,
  plano_acao TEXT,
  prazo_adequacao DATE,
  status_adequacao VARCHAR(20),
  
  -- Observações do Auditor
  observacoes_auditoria TEXT,
  recomendacoes TEXT,
  pontos_fortes TEXT,
  pontos_melhoria TEXT,
  
  -- Histórico
  historico_avaliacoes JSONB DEFAULT '[]'::jsonb,
  
  -- Referências Normativas
  norma_referencia VARCHAR(100),
  clausula_norma VARCHAR(50),
  legislacao_aplicavel TEXT,
  
  -- Documentação Abbott
  codigo_documento_abbott VARCHAR(50),
  versao_documento VARCHAR(10),
  link_documento TEXT,
  
  -- Flags
  ativo BOOLEAN NOT NULL DEFAULT true,
  dispensado BOOLEAN DEFAULT false,
  motivo_dispensa TEXT,
  
  -- Auditoria
  criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMP NOT NULL DEFAULT NOW(),
  criado_por UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  atualizado_por UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  
  -- Constraints
  CONSTRAINT uk_compliance_codigo UNIQUE (empresa_id, codigo_requisito),
  CONSTRAINT ck_pontos_obtidos CHECK (pontos_obtidos <= pontos_possiveis),
  CONSTRAINT ck_data_vigencia CHECK (data_fim_vigencia IS NULL OR data_fim_vigencia >= data_inicio_vigencia)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_compliance_empresa ON public.compliance_requisitos_abbott(empresa_id);
CREATE INDEX IF NOT EXISTS idx_compliance_categoria ON public.compliance_requisitos_abbott(categoria);
CREATE INDEX IF NOT EXISTS idx_compliance_status ON public.compliance_requisitos_abbott(status);
CREATE INDEX IF NOT EXISTS idx_compliance_criticidade ON public.compliance_requisitos_abbott(nivel_criticidade);
CREATE INDEX IF NOT EXISTS idx_compliance_proxima_avaliacao ON public.compliance_requisitos_abbott(data_proxima_avaliacao);
CREATE INDEX IF NOT EXISTS idx_compliance_responsavel ON public.compliance_requisitos_abbott(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_compliance_ativo ON public.compliance_requisitos_abbott(ativo);

-- Comentários
COMMENT ON TABLE public.compliance_requisitos_abbott IS 'Controle de requisitos de compliance para certificação Abbott';
COMMENT ON COLUMN public.compliance_requisitos_abbott.peso_calculo IS 'Peso do requisito no cálculo do score Abbott (1-10)';
COMMENT ON COLUMN public.compliance_requisitos_abbott.percentual_conformidade IS 'Percentual de conformidade calculado nas avaliações';
COMMENT ON COLUMN public.compliance_requisitos_abbott.historico_avaliacoes IS 'Histórico de avaliações em formato JSON';

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================




-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Migração: 20251025_implement_rls_policies.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Migration: Implementar RLS Policies - Multi-Tenant
-- Gerado por: Agente 03 - Passo 4 (RLS)
-- Data: 2025-10-25
-- Descrição: Implementa Row Level Security para todas as tabelas críticas

-- ⚠️ IMPORTANTE: Revisar com time de segurança antes de aplicar em produção!

-- ============================================================================
-- FUNÇÕES AUXILIARES (PRÉ-REQUISITO)
-- ============================================================================

-- Função para obter empresa_id do usuário atual
CREATE OR REPLACE FUNCTION public.current_empresa_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT empresa_id 
    FROM public.profiles 
    WHERE id = auth.uid()
    LIMIT 1
  );
END;
$$;

COMMENT ON FUNCTION public.current_empresa_id IS 
  'Retorna empresa_id do usuário autenticado - Usado em RLS policies';


-- Função para obter role do usuário atual
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM public.profiles 
    WHERE id = auth.uid()
    LIMIT 1
  );
END;
$$;

COMMENT ON FUNCTION public.current_user_role IS 
  'Retorna role do usuário autenticado - Usado em RLS policies';


-- Função helper para verificar se usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN current_user_role() IN ('Admin', 'Super Admin');
END;
$$;

COMMENT ON FUNCTION public.is_admin IS 
  'Verifica se usuário atual é Admin ou Super Admin';


-- ============================================================================
-- 1. CORE TABLES - PROFILES
-- ============================================================================

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Usuários veem apenas seu próprio perfil
DROP POLICY IF EXISTS "users_see_own_profile" ON public.profiles;
CREATE POLICY "users_see_own_profile"
ON public.profiles
FOR SELECT
USING (id = auth.uid());

-- Usuários atualizam apenas seu próprio perfil
DROP POLICY IF EXISTS "users_update_own_profile" ON public.profiles;
CREATE POLICY "users_update_own_profile"
ON public.profiles
FOR UPDATE
USING (id = auth.uid());

-- Service role pode tudo
DROP POLICY IF EXISTS "service_role_all_profiles" ON public.profiles;
CREATE POLICY "service_role_all_profiles"
ON public.profiles
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');


-- ============================================================================
-- 2. CORE TABLES - EMPRESAS
-- ============================================================================

ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;

-- Usuários veem apenas sua empresa
DROP POLICY IF EXISTS "users_see_own_empresa" ON public.empresas;
CREATE POLICY "users_see_own_empresa"
ON public.empresas
FOR SELECT
USING (id = current_empresa_id());

-- Apenas admins atualizam empresa
DROP POLICY IF EXISTS "admins_update_empresa" ON public.empresas;
CREATE POLICY "admins_update_empresa"
ON public.empresas
FOR UPDATE
USING (
  id = current_empresa_id() AND
  is_admin()
);

-- Service role pode tudo
DROP POLICY IF EXISTS "service_role_all_empresas" ON public.empresas;
CREATE POLICY "service_role_all_empresas"
ON public.empresas
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');


-- ============================================================================
-- 3. OPME - CIRURGIAS
-- ============================================================================

ALTER TABLE public.cirurgias ENABLE ROW LEVEL SECURITY;

-- SELECT: Multi-tenant
DROP POLICY IF EXISTS "cirurgias_select" ON public.cirurgias;
CREATE POLICY "cirurgias_select"
ON public.cirurgias
FOR SELECT
USING (empresa_id = current_empresa_id());

-- INSERT: Admin, Gerente, Coordenador
DROP POLICY IF EXISTS "cirurgias_insert" ON public.cirurgias;
CREATE POLICY "cirurgias_insert"
ON public.cirurgias
FOR INSERT
WITH CHECK (
  empresa_id = current_empresa_id() AND
  current_user_role() IN ('Admin', 'Super Admin', 'Gerente', 'Coordenador')
);

-- UPDATE: Admin, Gerente ou Coordenador (se não finalizada)
DROP POLICY IF EXISTS "cirurgias_update" ON public.cirurgias;
CREATE POLICY "cirurgias_update"
ON public.cirurgias
FOR UPDATE
USING (
  empresa_id = current_empresa_id() AND
  (
    current_user_role() IN ('Admin', 'Super Admin', 'Gerente') OR
    (current_user_role() = 'Coordenador' AND status != 'FINALIZADA')
  )
);

-- DELETE: Apenas Admin
DROP POLICY IF EXISTS "cirurgias_delete" ON public.cirurgias;
CREATE POLICY "cirurgias_delete"
ON public.cirurgias
FOR DELETE
USING (
  empresa_id = current_empresa_id() AND
  is_admin()
);


-- ============================================================================
-- 4. OPME - ESTOQUE
-- ============================================================================

ALTER TABLE public.estoque ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "estoque_select" ON public.estoque;
CREATE POLICY "estoque_select"
ON public.estoque
FOR SELECT
USING (empresa_id = current_empresa_id());

DROP POLICY IF EXISTS "estoque_insert" ON public.estoque;
CREATE POLICY "estoque_insert"
ON public.estoque
FOR INSERT
WITH CHECK (
  empresa_id = current_empresa_id() AND
  current_user_role() IN ('Admin', 'Super Admin', 'Gerente')
);

DROP POLICY IF EXISTS "estoque_update" ON public.estoque;
CREATE POLICY "estoque_update"
ON public.estoque
FOR UPDATE
USING (
  empresa_id = current_empresa_id() AND
  current_user_role() IN ('Admin', 'Super Admin', 'Gerente')
);

DROP POLICY IF EXISTS "estoque_delete" ON public.estoque;
CREATE POLICY "estoque_delete"
ON public.estoque
FOR DELETE
USING (
  empresa_id = current_empresa_id() AND
  is_admin()
);


-- ============================================================================
-- 5. OPME - CONSIGNACAO_MATERIAIS
-- ============================================================================

ALTER TABLE public.consignacao_materiais ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "consignacao_select" ON public.consignacao_materiais;
CREATE POLICY "consignacao_select"
ON public.consignacao_materiais
FOR SELECT
USING (empresa_id = current_empresa_id());

DROP POLICY IF EXISTS "consignacao_insert" ON public.consignacao_materiais;
CREATE POLICY "consignacao_insert"
ON public.consignacao_materiais
FOR INSERT
WITH CHECK (
  empresa_id = current_empresa_id() AND
  current_user_role() IN ('Admin', 'Super Admin', 'Gerente', 'Coordenador')
);

DROP POLICY IF EXISTS "consignacao_update" ON public.consignacao_materiais;
CREATE POLICY "consignacao_update"
ON public.consignacao_materiais
FOR UPDATE
USING (
  empresa_id = current_empresa_id() AND
  (
    current_user_role() IN ('Admin', 'Super Admin', 'Gerente') OR
    (current_user_role() = 'Operador' AND status = 'PENDENTE')
  )
);

DROP POLICY IF EXISTS "consignacao_delete" ON public.consignacao_materiais;
CREATE POLICY "consignacao_delete"
ON public.consignacao_materiais
FOR DELETE
USING (
  empresa_id = current_empresa_id() AND
  is_admin()
);


-- ============================================================================
-- 6. OPME - PRODUTOS_OPME
-- ============================================================================

ALTER TABLE public.produtos_opme ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "produtos_opme_select" ON public.produtos_opme;
CREATE POLICY "produtos_opme_select"
ON public.produtos_opme
FOR SELECT
USING (empresa_id = current_empresa_id());

DROP POLICY IF EXISTS "produtos_opme_modify" ON public.produtos_opme;
CREATE POLICY "produtos_opme_modify"
ON public.produtos_opme
FOR ALL
USING (
  empresa_id = current_empresa_id() AND
  current_user_role() IN ('Admin', 'Super Admin', 'Gerente')
);


-- ============================================================================
-- 7. OPME - RASTREABILIDADE_OPME
-- ============================================================================

ALTER TABLE public.rastreabilidade_opme ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rastreabilidade_select" ON public.rastreabilidade_opme;
CREATE POLICY "rastreabilidade_select"
ON public.rastreabilidade_opme
FOR SELECT
USING (empresa_id = current_empresa_id());

DROP POLICY IF EXISTS "rastreabilidade_modify" ON public.rastreabilidade_opme;
CREATE POLICY "rastreabilidade_modify"
ON public.rastreabilidade_opme
FOR ALL
USING (
  empresa_id = current_empresa_id() AND
  current_user_role() IN ('Admin', 'Super Admin', 'Gerente')
);


-- ============================================================================
-- 8. COMPLIANCE - COMPLIANCE_REQUISITOS_ABBOTT
-- ============================================================================

ALTER TABLE public.compliance_requisitos_abbott ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "compliance_select" ON public.compliance_requisitos_abbott;
CREATE POLICY "compliance_select"
ON public.compliance_requisitos_abbott
FOR SELECT
USING (empresa_id = current_empresa_id());

DROP POLICY IF EXISTS "compliance_modify" ON public.compliance_requisitos_abbott;
CREATE POLICY "compliance_modify"
ON public.compliance_requisitos_abbott
FOR ALL
USING (
  empresa_id = current_empresa_id() AND
  current_user_role() IN ('Admin', 'Super Admin', 'Gerente')
);


-- ============================================================================
-- 9-11. FINANCIAL - CONTAS_RECEBER, CONTAS_PAGAR, FLUXO_CAIXA
-- ============================================================================

-- CONTAS_RECEBER
ALTER TABLE public.contas_receber ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contas_receber_select" ON public.contas_receber;
CREATE POLICY "contas_receber_select"
ON public.contas_receber
FOR SELECT
USING (empresa_id = current_empresa_id());

DROP POLICY IF EXISTS "contas_receber_insert" ON public.contas_receber;
CREATE POLICY "contas_receber_insert"
ON public.contas_receber
FOR INSERT
WITH CHECK (
  empresa_id = current_empresa_id() AND
  current_user_role() IN ('Admin', 'Super Admin', 'Gerente Financeiro', 'Gerente')
);

DROP POLICY IF EXISTS "contas_receber_update" ON public.contas_receber;
CREATE POLICY "contas_receber_update"
ON public.contas_receber
FOR UPDATE
USING (
  empresa_id = current_empresa_id() AND
  current_user_role() IN ('Admin', 'Super Admin', 'Gerente Financeiro', 'Gerente')
);

DROP POLICY IF EXISTS "contas_receber_delete" ON public.contas_receber;
CREATE POLICY "contas_receber_delete"
ON public.contas_receber
FOR DELETE
USING (
  empresa_id = current_empresa_id() AND
  is_admin()
);

-- CONTAS_PAGAR (mesmas policies)
ALTER TABLE public.contas_pagar ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contas_pagar_select" ON public.contas_pagar;
CREATE POLICY "contas_pagar_select"
ON public.contas_pagar
FOR SELECT
USING (empresa_id = current_empresa_id());

DROP POLICY IF EXISTS "contas_pagar_insert" ON public.contas_pagar;
CREATE POLICY "contas_pagar_insert"
ON public.contas_pagar
FOR INSERT
WITH CHECK (
  empresa_id = current_empresa_id() AND
  current_user_role() IN ('Admin', 'Super Admin', 'Gerente Financeiro', 'Gerente')
);

DROP POLICY IF EXISTS "contas_pagar_update" ON public.contas_pagar;
CREATE POLICY "contas_pagar_update"
ON public.contas_pagar
FOR UPDATE
USING (
  empresa_id = current_empresa_id() AND
  current_user_role() IN ('Admin', 'Super Admin', 'Gerente Financeiro', 'Gerente')
);

DROP POLICY IF EXISTS "contas_pagar_delete" ON public.contas_pagar;
CREATE POLICY "contas_pagar_delete"
ON public.contas_pagar
FOR DELETE
USING (
  empresa_id = current_empresa_id() AND
  is_admin()
);

-- FLUXO_CAIXA (apenas leitura para roles não-financeiras)
ALTER TABLE public.fluxo_caixa ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "fluxo_caixa_select" ON public.fluxo_caixa;
CREATE POLICY "fluxo_caixa_select"
ON public.fluxo_caixa
FOR SELECT
USING (empresa_id = current_empresa_id());

DROP POLICY IF EXISTS "fluxo_caixa_modify" ON public.fluxo_caixa;
CREATE POLICY "fluxo_caixa_modify"
ON public.fluxo_caixa
FOR ALL
USING (
  empresa_id = current_empresa_id() AND
  current_user_role() IN ('Admin', 'Super Admin', 'Gerente Financeiro', 'Gerente')
);


-- ============================================================================
-- FIM DA MIGRATION - RLS POLICIES IMPLEMENTADAS
-- ============================================================================

-- Resumo:
-- ✅ 3 Funções auxiliares criadas
-- ✅ 2 Core tables (profiles, empresas)
-- ✅ 6 OPME tables (cirurgias, estoque, consignacao, produtos_opme, rastreabilidade, compliance)
-- ✅ 3 Financial tables (contas_receber, contas_pagar, fluxo_caixa)
-- ✅ Total: 11 tabelas com RLS habilitado

-- ⚠️ IMPORTANTE:
-- 1. Testar exaustivamente em staging antes de produção
-- 2. Validar com diferentes roles (Admin, Gerente, Coordenador, Operador)
-- 3. Monitorar performance após aplicação
-- 4. Considerar índices adicionais se necessário




-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Migração: 20251026_agent_orchestration_system.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================================================
-- ICARUS v5.0 - AGENT ORCHESTRATION SYSTEM
-- Sistema de orquestração de agentes para análise e relatórios OPME
-- Data: 2025-10-26
-- ============================================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Busca fuzzy
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- Índices GIN para JSONB

-- ============================================================================
-- 1. AGENT_TASKS - Tarefas de Agentes
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_tasks (
  task_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Hierarquia e contexto
  parent_task_id UUID REFERENCES agent_tasks(task_id) ON DELETE CASCADE,
  session_id UUID, -- Pode referenciar edr_research_sessions se necessário
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Consulta e descrição
  query_text TEXT NOT NULL,
  task_description TEXT,
  task_type VARCHAR(100) CHECK (task_type IN (
    'master_planning', 
    'data_internal', 
    'data_external', 
    'benchmark', 
    'compliance', 
    'synthesis', 
    'visualization',
    'notification'
  )),
  
  -- Status e prioridade
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 
    'in_progress', 
    'completed', 
    'failed', 
    'cancelled',
    'waiting_approval'
  )),
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  
  -- Configuração
  assigned_agent VARCHAR(100), -- Nome do agente que executará
  parameters JSONB DEFAULT '{}'::jsonb, -- Parâmetros específicos da tarefa
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  
  -- Metadados e plano
  metadata JSONB DEFAULT '{}'::jsonb,
  master_plan JSONB, -- Plano gerado pelo orquestrador
  subtasks JSONB DEFAULT '[]'::jsonb, -- Array de IDs de subtarefas
  
  -- Resultados
  result_data JSONB,
  error_message TEXT,
  execution_time_ms INTEGER,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Auditoria
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id)
);

-- Índices para performance
CREATE INDEX idx_agent_tasks_status ON agent_tasks(status) WHERE status != 'completed';
CREATE INDEX idx_agent_tasks_priority ON agent_tasks(priority DESC, created_at ASC);
CREATE INDEX idx_agent_tasks_parent ON agent_tasks(parent_task_id) WHERE parent_task_id IS NOT NULL;
CREATE INDEX idx_agent_tasks_org ON agent_tasks(organization_id);
CREATE INDEX idx_agent_tasks_type ON agent_tasks(task_type);
CREATE INDEX idx_agent_tasks_created ON agent_tasks(created_at DESC);
CREATE INDEX idx_agent_tasks_session ON agent_tasks(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX idx_agent_tasks_metadata ON agent_tasks USING GIN(metadata);

-- Comentários
COMMENT ON TABLE agent_tasks IS 'Tarefas de agentes para orquestração e análise OPME';
COMMENT ON COLUMN agent_tasks.master_plan IS 'Plano de execução gerado pelo orquestrador master';
COMMENT ON COLUMN agent_tasks.subtasks IS 'Array de UUIDs de subtarefas relacionadas';

-- ============================================================================
-- 2. AGENT_LOGS - Logs de Execução de Agentes
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_logs (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES agent_tasks(task_id) ON DELETE CASCADE,
  
  -- Informações do agente
  agent_name TEXT NOT NULL,
  agent_type VARCHAR(100),
  agent_version VARCHAR(50),
  
  -- Evento
  event_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  event_type VARCHAR(100) CHECK (event_type IN (
    'task_started',
    'task_progress',
    'task_completed',
    'task_failed',
    'data_fetched',
    'api_called',
    'error_occurred',
    'warning_issued',
    'human_intervention_required',
    'steering_applied'
  )),
  action TEXT NOT NULL,
  
  -- Detalhes
  details JSONB DEFAULT '{}'::jsonb,
  log_level VARCHAR(20) DEFAULT 'info' CHECK (log_level IN ('debug', 'info', 'warning', 'error', 'critical')),
  
  -- Contexto de execução
  execution_context JSONB,
  stack_trace TEXT,
  
  -- Métricas
  duration_ms INTEGER,
  memory_usage_mb DECIMAL(10,2),
  tokens_used INTEGER,
  api_calls_made INTEGER DEFAULT 0,
  
  -- Metadados
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Rastreabilidade
  correlation_id UUID, -- Para rastrear fluxos relacionados
  parent_log_id UUID REFERENCES agent_logs(log_id) ON DELETE SET NULL
);

-- Índices para performance
CREATE INDEX idx_agent_logs_task ON agent_logs(task_id, event_time DESC);
CREATE INDEX idx_agent_logs_event_type ON agent_logs(event_type);
CREATE INDEX idx_agent_logs_level ON agent_logs(log_level) WHERE log_level IN ('error', 'critical');
CREATE INDEX idx_agent_logs_time ON agent_logs(event_time DESC);
CREATE INDEX idx_agent_logs_agent ON agent_logs(agent_name);
CREATE INDEX idx_agent_logs_correlation ON agent_logs(correlation_id) WHERE correlation_id IS NOT NULL;
CREATE INDEX idx_agent_logs_details ON agent_logs USING GIN(details);

-- Particionamento por data para performance (opcional, pode ser implementado depois)
-- CREATE INDEX idx_agent_logs_time_brin ON agent_logs USING BRIN(event_time);

COMMENT ON TABLE agent_logs IS 'Logs detalhados de execução dos agentes para auditoria e debugging';
COMMENT ON COLUMN agent_logs.correlation_id IS 'ID para rastrear múltiplos logs relacionados a um fluxo';

-- ============================================================================
-- 3. AGENT_REPORTS - Relatórios Gerados
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_reports (
  report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES agent_tasks(task_id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Tipo e categoria
  report_type TEXT NOT NULL CHECK (report_type IN (
    'consumo_opme',
    'compliance_summary',
    'previsao_demanda',
    'analise_custo',
    'benchmark_fornecedores',
    'auditoria_rastreabilidade',
    'desempenho_cirurgias',
    'glosas_detectadas',
    'custom'
  )),
  category VARCHAR(100),
  
  -- Conteúdo
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT, -- Markdown ou HTML
  content_format VARCHAR(20) DEFAULT 'markdown' CHECK (content_format IN ('markdown', 'html', 'json', 'pdf')),
  
  -- Dados estruturados
  data_snapshot JSONB, -- Snapshot dos dados usados no relatório
  visualizations JSONB DEFAULT '[]'::jsonb, -- Array de configurações de gráficos
  metrics JSONB, -- KPIs e métricas calculadas
  
  -- Arquivos gerados
  pdf_url TEXT,
  excel_url TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  
  -- Status e workflow
  status TEXT DEFAULT 'draft' CHECK (status IN (
    'draft',
    'pending_review',
    'reviewed',
    'approved',
    'published',
    'archived',
    'rejected'
  )),
  
  -- Controle de versão
  version INTEGER DEFAULT 1,
  previous_version_id UUID REFERENCES agent_reports(report_id) ON DELETE SET NULL,
  
  -- Revisão humana
  reviewer_user_id UUID REFERENCES profiles(id),
  review_notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  -- Aprovação
  approver_user_id UUID REFERENCES profiles(id),
  approval_notes TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  
  -- Publicação
  published_at TIMESTAMP WITH TIME ZONE,
  published_by UUID REFERENCES profiles(id),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  archived_at TIMESTAMP WITH TIME ZONE,
  
  -- Auditoria
  created_by UUID REFERENCES profiles(id),
  
  -- Metadados
  metadata JSONB DEFAULT '{}'::jsonb,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Controle de acesso
  is_confidential BOOLEAN DEFAULT false,
  access_level VARCHAR(50) DEFAULT 'internal' CHECK (access_level IN ('public', 'internal', 'confidential', 'restricted'))
);

-- Índices para performance
CREATE INDEX idx_agent_reports_task ON agent_reports(task_id);
CREATE INDEX idx_agent_reports_org ON agent_reports(organization_id);
CREATE INDEX idx_agent_reports_type ON agent_reports(report_type);
CREATE INDEX idx_agent_reports_status ON agent_reports(status);
CREATE INDEX idx_agent_reports_created ON agent_reports(created_at DESC);
CREATE INDEX idx_agent_reports_published ON agent_reports(published_at DESC) WHERE published_at IS NOT NULL;
CREATE INDEX idx_agent_reports_reviewer ON agent_reports(reviewer_user_id) WHERE reviewer_user_id IS NOT NULL;
CREATE INDEX idx_agent_reports_tags ON agent_reports USING GIN(tags);
CREATE INDEX idx_agent_reports_metadata ON agent_reports USING GIN(metadata);
CREATE INDEX idx_agent_reports_version ON agent_reports(version);
CREATE INDEX idx_agent_reports_confidential ON agent_reports(is_confidential, access_level);

-- Full-text search
CREATE INDEX idx_agent_reports_search ON agent_reports USING GIN(
  to_tsvector('portuguese', COALESCE(title, '') || ' ' || COALESCE(summary, '') || ' ' || COALESCE(content, ''))
);

COMMENT ON TABLE agent_reports IS 'Relatórios gerados pelos agentes com controle de workflow e versionamento';
COMMENT ON COLUMN agent_reports.data_snapshot IS 'Snapshot dos dados usados para garantir reprodutibilidade';

-- ============================================================================
-- 4. AGENT_SOURCES - Fontes de Dados Utilizadas
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_sources (
  source_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES agent_tasks(task_id) ON DELETE CASCADE,
  report_id UUID REFERENCES agent_reports(report_id) ON DELETE SET NULL,
  
  -- Tipo de fonte
  source_type VARCHAR(100) CHECK (source_type IN (
    'database_internal',
    'api_external',
    'iot_sensor',
    'rfid_reader',
    'blockchain_ledger',
    'anvisa_registry',
    'supplier_api',
    'web_scraping',
    'document_upload',
    'manual_input'
  )),
  
  -- Identificação da fonte
  source_name TEXT NOT NULL,
  source_url TEXT,
  source_identifier TEXT, -- ID ou hash único
  
  -- Dados
  data_excerpt JSONB, -- Pequeno trecho dos dados
  data_hash TEXT, -- Hash SHA256 dos dados para verificação
  record_count INTEGER,
  
  -- Qualidade e confiabilidade
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  reliability_score DECIMAL(3,2) CHECK (reliability_score >= 0 AND reliability_score <= 1),
  freshness_minutes INTEGER, -- Quão recente são os dados
  
  -- Timestamps
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_timestamp TIMESTAMP WITH TIME ZONE, -- Timestamp dos dados originais
  
  -- Metadados
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Rastreabilidade
  correlation_id UUID
);

-- Índices
CREATE INDEX idx_agent_sources_task ON agent_sources(task_id);
CREATE INDEX idx_agent_sources_report ON agent_sources(report_id) WHERE report_id IS NOT NULL;
CREATE INDEX idx_agent_sources_type ON agent_sources(source_type);
CREATE INDEX idx_agent_sources_accessed ON agent_sources(accessed_at DESC);
CREATE INDEX idx_agent_sources_hash ON agent_sources(data_hash) WHERE data_hash IS NOT NULL;

COMMENT ON TABLE agent_sources IS 'Rastreamento de todas as fontes de dados utilizadas pelos agentes';

-- ============================================================================
-- 5. AGENT_METRICS - Métricas de Performance
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_metrics (
  metric_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES agent_tasks(task_id) ON DELETE CASCADE,
  
  -- Identificação
  agent_name TEXT NOT NULL,
  metric_name VARCHAR(100) NOT NULL,
  metric_category VARCHAR(50) CHECK (metric_category IN ('performance', 'quality', 'cost', 'reliability', 'custom')),
  
  -- Valor
  metric_value DECIMAL(20,4),
  metric_unit VARCHAR(50),
  
  -- Contexto
  measurement_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  measurement_window_minutes INTEGER,
  
  -- Comparação
  baseline_value DECIMAL(20,4),
  threshold_min DECIMAL(20,4),
  threshold_max DECIMAL(20,4),
  is_within_threshold BOOLEAN,
  
  -- Metadados
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Agregação
  aggregation_type VARCHAR(20) CHECK (aggregation_type IN ('sum', 'avg', 'min', 'max', 'count', 'p50', 'p95', 'p99'))
);

-- Índices
CREATE INDEX idx_agent_metrics_task ON agent_metrics(task_id);
CREATE INDEX idx_agent_metrics_agent ON agent_metrics(agent_name);
CREATE INDEX idx_agent_metrics_name ON agent_metrics(metric_name);
CREATE INDEX idx_agent_metrics_time ON agent_metrics(measurement_time DESC);
CREATE INDEX idx_agent_metrics_category ON agent_metrics(metric_category);
CREATE INDEX idx_agent_metrics_threshold ON agent_metrics(is_within_threshold) WHERE is_within_threshold = false;

COMMENT ON TABLE agent_metrics IS 'Métricas de performance e qualidade dos agentes';

-- ============================================================================
-- 6. TRIGGERS E FUNÇÕES
-- ============================================================================

-- Atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_agent_tasks_updated_at
  BEFORE UPDATE ON agent_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_reports_updated_at
  BEFORE UPDATE ON agent_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Validar transições de status
CREATE OR REPLACE FUNCTION validate_agent_task_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  -- Não pode voltar de completed/failed para pending sem reset explícito
  IF OLD.status IN ('completed', 'failed', 'cancelled') AND NEW.status = 'pending' THEN
    RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status;
  END IF;
  
  -- Registrar timestamps
  IF NEW.status = 'in_progress' AND OLD.status = 'pending' THEN
    NEW.started_at = NOW();
  END IF;
  
  IF NEW.status IN ('completed', 'failed', 'cancelled') AND OLD.status NOT IN ('completed', 'failed', 'cancelled') THEN
    NEW.completed_at = NOW();
    NEW.execution_time_ms = EXTRACT(EPOCH FROM (NOW() - NEW.started_at)) * 1000;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_agent_task_status
  BEFORE UPDATE OF status ON agent_tasks
  FOR EACH ROW
  EXECUTE FUNCTION validate_agent_task_status_transition();

-- Auto-incrementar versão de relatórios
CREATE OR REPLACE FUNCTION increment_report_version()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status = 'published' AND OLD.status != 'published' THEN
    NEW.version = OLD.version + 1;
    NEW.published_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_increment_report_version
  BEFORE UPDATE ON agent_reports
  FOR EACH ROW
  EXECUTE FUNCTION increment_report_version();

-- ============================================================================
-- 7. FUNÇÕES DE UTILIDADE
-- ============================================================================

-- Obter métricas agregadas de uma tarefa
CREATE OR REPLACE FUNCTION get_agent_task_metrics(p_task_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_metrics JSONB;
BEGIN
  SELECT jsonb_build_object(
    'task_id', t.task_id,
    'status', t.status,
    'execution_time_ms', t.execution_time_ms,
    'retry_count', t.retry_count,
    'logs_count', (SELECT COUNT(*) FROM agent_logs WHERE task_id = p_task_id),
    'error_logs_count', (SELECT COUNT(*) FROM agent_logs WHERE task_id = p_task_id AND log_level IN ('error', 'critical')),
    'sources_count', (SELECT COUNT(*) FROM agent_sources WHERE task_id = p_task_id),
    'avg_confidence', (SELECT AVG(confidence_score) FROM agent_sources WHERE task_id = p_task_id),
    'subtasks_count', jsonb_array_length(COALESCE(t.subtasks, '[]'::jsonb)),
    'created_at', t.created_at,
    'started_at', t.started_at,
    'completed_at', t.completed_at
  ) INTO v_metrics
  FROM agent_tasks t
  WHERE t.task_id = p_task_id;
  
  RETURN v_metrics;
END;
$$ LANGUAGE plpgsql;

-- Obter status consolidado de um relatório
CREATE OR REPLACE FUNCTION get_agent_report_status(p_report_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_status JSONB;
BEGIN
  SELECT jsonb_build_object(
    'report_id', r.report_id,
    'status', r.status,
    'version', r.version,
    'created_at', r.created_at,
    'reviewed', r.reviewed_at IS NOT NULL,
    'approved', r.approved_at IS NOT NULL,
    'published', r.published_at IS NOT NULL,
    'task_status', t.status,
    'sources_count', (SELECT COUNT(*) FROM agent_sources WHERE report_id = p_report_id),
    'visualizations_count', jsonb_array_length(COALESCE(r.visualizations, '[]'::jsonb))
  ) INTO v_status
  FROM agent_reports r
  LEFT JOIN agent_tasks t ON t.task_id = r.task_id
  WHERE r.report_id = p_report_id;
  
  RETURN v_status;
END;
$$ LANGUAGE plpgsql;

-- Criar tarefa de agente com validação
CREATE OR REPLACE FUNCTION create_agent_task(
  p_query_text TEXT,
  p_task_type VARCHAR(100),
  p_organization_id UUID,
  p_priority INTEGER DEFAULT 5,
  p_parameters JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_task_id UUID;
  v_user_id UUID;
BEGIN
  -- Obter usuário atual
  v_user_id := auth.uid();
  
  -- Validar organização
  IF NOT EXISTS (
    SELECT 1 FROM user_organizations 
    WHERE user_id = v_user_id AND organization_id = p_organization_id
  ) THEN
    RAISE EXCEPTION 'User does not have access to organization';
  END IF;
  
  -- Criar tarefa
  INSERT INTO agent_tasks (
    query_text,
    task_type,
    organization_id,
    priority,
    parameters,
    created_by,
    status
  ) VALUES (
    p_query_text,
    p_task_type,
    p_organization_id,
    p_priority,
    p_parameters,
    v_user_id,
    'pending'
  )
  RETURNING task_id INTO v_task_id;
  
  -- Registrar log inicial
  INSERT INTO agent_logs (task_id, agent_name, event_type, action, log_level)
  VALUES (v_task_id, 'system', 'task_started', 'Task created by user', 'info');
  
  RETURN v_task_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 8. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS
ALTER TABLE agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_metrics ENABLE ROW LEVEL SECURITY;

-- Policies para agent_tasks
CREATE POLICY "Users can view tasks from their organizations"
  ON agent_tasks FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create tasks for their organizations"
  ON agent_tasks FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update tasks they created"
  ON agent_tasks FOR UPDATE
  USING (created_by = auth.uid() OR updated_by = auth.uid());

-- Policies para agent_logs
CREATE POLICY "Users can view logs of their organization's tasks"
  ON agent_logs FOR SELECT
  USING (
    task_id IN (
      SELECT task_id FROM agent_tasks WHERE organization_id IN (
        SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "System can insert logs"
  ON agent_logs FOR INSERT
  WITH CHECK (true);

-- Policies para agent_reports
CREATE POLICY "Users can view reports from their organizations"
  ON agent_reports FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create reports"
  ON agent_reports FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update reports they created or are reviewers"
  ON agent_reports FOR UPDATE
  USING (
    created_by = auth.uid() OR 
    reviewer_user_id = auth.uid() OR 
    approver_user_id = auth.uid()
  );

-- Policies para agent_sources
CREATE POLICY "Users can view sources of their organization's tasks"
  ON agent_sources FOR SELECT
  USING (
    task_id IN (
      SELECT task_id FROM agent_tasks WHERE organization_id IN (
        SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "System can manage sources"
  ON agent_sources FOR ALL
  USING (true);

-- Policies para agent_metrics
CREATE POLICY "Users can view metrics of their organization's tasks"
  ON agent_metrics FOR SELECT
  USING (
    task_id IN (
      SELECT task_id FROM agent_tasks WHERE organization_id IN (
        SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "System can insert metrics"
  ON agent_metrics FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- 9. REALTIME
-- ============================================================================

-- Habilitar Realtime para tabelas relevantes
ALTER PUBLICATION supabase_realtime ADD TABLE agent_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE agent_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE agent_reports;

-- ============================================================================
-- 10. VIEWS
-- ============================================================================

-- View de tarefas ativas com métricas
CREATE OR REPLACE VIEW agent_tasks_active AS
SELECT 
  t.task_id,
  t.query_text,
  t.task_type,
  t.status,
  t.priority,
  t.created_at,
  t.started_at,
  t.organization_id,
  COUNT(DISTINCT l.log_id) as logs_count,
  COUNT(DISTINCT CASE WHEN l.log_level = 'error' THEN l.log_id END) as error_count,
  COUNT(DISTINCT s.source_id) as sources_count,
  AVG(s.confidence_score) as avg_confidence
FROM agent_tasks t
LEFT JOIN agent_logs l ON l.task_id = t.task_id
LEFT JOIN agent_sources s ON s.task_id = t.task_id
WHERE t.status NOT IN ('completed', 'cancelled', 'failed')
GROUP BY t.task_id;

-- View de relatórios publicados recentes
CREATE OR REPLACE VIEW agent_reports_published AS
SELECT 
  r.report_id,
  r.title,
  r.report_type,
  r.summary,
  r.status,
  r.version,
  r.published_at,
  r.organization_id,
  t.task_type,
  t.execution_time_ms,
  COUNT(DISTINCT s.source_id) as sources_used
FROM agent_reports r
LEFT JOIN agent_tasks t ON t.task_id = r.task_id
LEFT JOIN agent_sources s ON s.report_id = r.report_id
WHERE r.status = 'published'
GROUP BY r.report_id, t.task_id;

-- View de performance de agentes
CREATE OR REPLACE VIEW agent_performance_summary AS
SELECT 
  t.task_type,
  t.assigned_agent,
  COUNT(*) as total_tasks,
  COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_count,
  COUNT(CASE WHEN t.status = 'failed' THEN 1 END) as failed_count,
  AVG(t.execution_time_ms) as avg_execution_time_ms,
  AVG(s.confidence_score) as avg_confidence_score,
  COUNT(DISTINCT r.report_id) as reports_generated
FROM agent_tasks t
LEFT JOIN agent_sources s ON s.task_id = t.task_id
LEFT JOIN agent_reports r ON r.task_id = t.task_id
GROUP BY t.task_type, t.assigned_agent;

-- ============================================================================
-- 11. GRANTS
-- ============================================================================

-- Grant para usuários autenticados
GRANT SELECT, INSERT, UPDATE ON agent_tasks TO authenticated;
GRANT SELECT ON agent_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON agent_reports TO authenticated;
GRANT SELECT ON agent_sources TO authenticated;
GRANT SELECT ON agent_metrics TO authenticated;

-- Grant para views
GRANT SELECT ON agent_tasks_active TO authenticated;
GRANT SELECT ON agent_reports_published TO authenticated;
GRANT SELECT ON agent_performance_summary TO authenticated;

-- Grant para funções
GRANT EXECUTE ON FUNCTION get_agent_task_metrics TO authenticated;
GRANT EXECUTE ON FUNCTION get_agent_report_status TO authenticated;
GRANT EXECUTE ON FUNCTION create_agent_task TO authenticated;

-- ============================================================================
-- FIM DA MIGRAÇÃO
-- ============================================================================




-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Migração: 20251026_external_integrations.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================================================
-- ICARUS v5.0 - INTEGRAÇÕES EXTERNAS
-- IoT/RFID/Blockchain + Fornecedores + Regulatório
-- Data: 2025-10-26
-- ============================================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- Para hashing e criptografia

-- ============================================================================
-- 1. IOT_DEVICES - Dispositivos IoT/RFID
-- ============================================================================

CREATE TABLE IF NOT EXISTS iot_devices (
  device_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Identificação do dispositivo
  device_uid TEXT NOT NULL UNIQUE, -- UID físico do dispositivo
  device_type VARCHAR(100) CHECK (device_type IN (
    'rfid_reader',
    'rfid_tag',
    'temperature_sensor',
    'humidity_sensor',
    'location_tracker',
    'barcode_scanner',
    'weighing_scale',
    'gateway',
    'beacon',
    'other'
  )),
  
  -- Informações do dispositivo
  manufacturer TEXT,
  model TEXT,
  firmware_version TEXT,
  serial_number TEXT,
  
  -- Localização
  location_name TEXT, -- Ex: "Centro Cirúrgico A", "Almoxarifado B"
  location_coordinates JSONB, -- {lat, lng}
  installation_site VARCHAR(200),
  
  -- Status
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN (
    'active',
    'inactive',
    'maintenance',
    'calibration',
    'offline',
    'decommissioned'
  )),
  
  -- Conectividade
  ip_address INET,
  mac_address MACADDR,
  connection_type VARCHAR(50) CHECK (connection_type IN ('wifi', 'ethernet', 'lora', 'zigbee', 'bluetooth', 'cellular')),
  last_seen_at TIMESTAMP WITH TIME ZONE,
  
  -- Configuração
  config JSONB DEFAULT '{}'::jsonb,
  read_interval_seconds INTEGER DEFAULT 60,
  battery_level DECIMAL(5,2), -- Porcentagem
  signal_strength INTEGER, -- dBm
  
  -- Timestamps
  installed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadados
  metadata JSONB DEFAULT '{}'::jsonb,
  notes TEXT
);

-- Índices
CREATE INDEX idx_iot_devices_org ON iot_devices(organization_id);
CREATE INDEX idx_iot_devices_type ON iot_devices(device_type);
CREATE INDEX idx_iot_devices_status ON iot_devices(status);
CREATE INDEX idx_iot_devices_location ON iot_devices(location_name);
CREATE INDEX idx_iot_devices_last_seen ON iot_devices(last_seen_at DESC);
CREATE INDEX idx_iot_devices_uid ON iot_devices(device_uid);

COMMENT ON TABLE iot_devices IS 'Cadastro de dispositivos IoT e leitores RFID';

-- ============================================================================
-- 2. IOT_READINGS - Leituras de Dispositivos IoT
-- ============================================================================

CREATE TABLE IF NOT EXISTS iot_readings (
  reading_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID REFERENCES iot_devices(device_id) ON DELETE CASCADE,
  
  -- Identificação da leitura
  reading_type VARCHAR(100) CHECK (reading_type IN (
    'rfid_tag_read',
    'temperature',
    'humidity',
    'location_update',
    'barcode_scan',
    'weight_measurement',
    'movement_detected',
    'battery_status',
    'alert_triggered',
    'other'
  )),
  
  -- Dados da leitura
  tag_uid TEXT, -- Para RFID
  value DECIMAL(20,4),
  unit VARCHAR(50),
  raw_data JSONB,
  
  -- Contexto
  location_coordinates JSONB,
  temperature_celsius DECIMAL(5,2),
  humidity_percent DECIMAL(5,2),
  
  -- Qualidade do sinal
  signal_strength INTEGER,
  read_confidence DECIMAL(3,2) CHECK (read_confidence >= 0 AND read_confidence <= 1),
  
  -- Associação com OPME (se aplicável)
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  lote_id UUID REFERENCES lotes(id) ON DELETE SET NULL,
  material_id UUID, -- Pode referenciar consignacao_materiais ou similar
  
  -- Timestamps
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Processamento
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP WITH TIME ZONE,
  processing_notes TEXT,
  
  -- Metadados
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Blockchain reference (se aplicável)
  blockchain_tx_hash TEXT,
  blockchain_block_number BIGINT
);

-- Índices
CREATE INDEX idx_iot_readings_device ON iot_readings(device_id);
CREATE INDEX idx_iot_readings_type ON iot_readings(reading_type);
CREATE INDEX idx_iot_readings_tag ON iot_readings(tag_uid) WHERE tag_uid IS NOT NULL;
CREATE INDEX idx_iot_readings_read_at ON iot_readings(read_at DESC);
CREATE INDEX idx_iot_readings_product ON iot_readings(product_id) WHERE product_id IS NOT NULL;
CREATE INDEX idx_iot_readings_processed ON iot_readings(processed, read_at) WHERE processed = false;
CREATE INDEX idx_iot_readings_blockchain ON iot_readings(blockchain_tx_hash) WHERE blockchain_tx_hash IS NOT NULL;

-- Particionamento por data (para grande volume)
-- CREATE INDEX idx_iot_readings_read_at_brin ON iot_readings USING BRIN(read_at);

COMMENT ON TABLE iot_readings IS 'Leituras de dispositivos IoT e tags RFID para rastreabilidade';

-- ============================================================================
-- 3. BLOCKCHAIN_TRANSACTIONS - Registro Blockchain
-- ============================================================================

CREATE TABLE IF NOT EXISTS blockchain_transactions (
  tx_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Identificação blockchain
  tx_hash TEXT NOT NULL UNIQUE,
  block_number BIGINT,
  block_hash TEXT,
  chain_name VARCHAR(100) DEFAULT 'hyperledger-fabric' CHECK (chain_name IN (
    'hyperledger-fabric',
    'ethereum',
    'polygon',
    'binance-smart-chain',
    'private-chain'
  )),
  
  -- Tipo de transação
  tx_type VARCHAR(100) CHECK (tx_type IN (
    'material_registration',
    'material_transfer',
    'material_usage',
    'material_disposal',
    'quality_certification',
    'audit_record',
    'compliance_validation',
    'ownership_change',
    'batch_creation',
    'other'
  )),
  
  -- Dados da transação
  from_address TEXT,
  to_address TEXT,
  contract_address TEXT,
  
  -- Payload
  tx_data JSONB NOT NULL,
  tx_metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Vinculação com sistema interno
  related_entity_type VARCHAR(100), -- 'product', 'lote', 'material', 'cirurgia'
  related_entity_id UUID,
  
  -- Status
  status VARCHAR(50) DEFAULT 'confirmed' CHECK (status IN (
    'pending',
    'confirmed',
    'failed',
    'rolled_back'
  )),
  confirmations INTEGER DEFAULT 0,
  
  -- Custos (se aplicável)
  gas_used BIGINT,
  gas_price TEXT, -- Wei
  transaction_fee TEXT,
  
  -- Timestamps
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  
  -- Assinaturas
  signature TEXT,
  signer_address TEXT,
  
  -- Metadados
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices
CREATE INDEX idx_blockchain_tx_org ON blockchain_transactions(organization_id);
CREATE INDEX idx_blockchain_tx_hash ON blockchain_transactions(tx_hash);
CREATE INDEX idx_blockchain_tx_type ON blockchain_transactions(tx_type);
CREATE INDEX idx_blockchain_tx_status ON blockchain_transactions(status);
CREATE INDEX idx_blockchain_tx_confirmed ON blockchain_transactions(confirmed_at DESC);
CREATE INDEX idx_blockchain_tx_entity ON blockchain_transactions(related_entity_type, related_entity_id);
CREATE INDEX idx_blockchain_tx_block ON blockchain_transactions(block_number DESC);

COMMENT ON TABLE blockchain_transactions IS 'Registro de transações blockchain para rastreabilidade imutável';

-- ============================================================================
-- 4. SUPPLIER_INTEGRATIONS - Integrações com Fornecedores
-- ============================================================================

CREATE TABLE IF NOT EXISTS supplier_integrations (
  integration_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Configuração da integração
  integration_type VARCHAR(100) CHECK (integration_type IN (
    'api_rest',
    'api_graphql',
    'soap',
    'edi',
    'ftp',
    'sftp',
    'webhook',
    'email',
    'manual'
  )),
  
  -- Endpoint/Conexão
  base_url TEXT,
  api_version VARCHAR(50),
  
  -- Autenticação
  auth_type VARCHAR(50) CHECK (auth_type IN ('none', 'basic', 'bearer', 'oauth2', 'api_key', 'mtls')),
  auth_config JSONB, -- Armazena configurações de autenticação (criptografadas)
  api_key_encrypted TEXT,
  
  -- Capacidades
  capabilities JSONB DEFAULT '[]'::jsonb, -- ['catalog', 'pricing', 'availability', 'orders', 'tracking']
  data_format VARCHAR(50) CHECK (data_format IN ('json', 'xml', 'csv', 'edi', 'custom')),
  
  -- Status
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN (
    'active',
    'inactive',
    'testing',
    'error',
    'deprecated'
  )),
  
  -- Rate limiting
  rate_limit_per_minute INTEGER,
  rate_limit_per_hour INTEGER,
  rate_limit_per_day INTEGER,
  
  -- Sincronização
  sync_enabled BOOLEAN DEFAULT true,
  sync_frequency_minutes INTEGER DEFAULT 60,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  last_sync_status VARCHAR(50),
  last_sync_error TEXT,
  next_sync_at TIMESTAMP WITH TIME ZONE,
  
  -- Health check
  health_check_enabled BOOLEAN DEFAULT true,
  health_check_url TEXT,
  last_health_check_at TIMESTAMP WITH TIME ZONE,
  health_status VARCHAR(50),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  activated_at TIMESTAMP WITH TIME ZONE,
  deactivated_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadados
  metadata JSONB DEFAULT '{}'::jsonb,
  notes TEXT
);

-- Índices
CREATE INDEX idx_supplier_integrations_supplier ON supplier_integrations(supplier_id);
CREATE INDEX idx_supplier_integrations_org ON supplier_integrations(organization_id);
CREATE INDEX idx_supplier_integrations_status ON supplier_integrations(status);
CREATE INDEX idx_supplier_integrations_type ON supplier_integrations(integration_type);
CREATE INDEX idx_supplier_integrations_sync ON supplier_integrations(next_sync_at) WHERE sync_enabled = true;

COMMENT ON TABLE supplier_integrations IS 'Configuração de integrações com APIs de fornecedores OPME';

-- ============================================================================
-- 5. SUPPLIER_API_LOGS - Logs de Chamadas API
-- ============================================================================

CREATE TABLE IF NOT EXISTS supplier_api_logs (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID REFERENCES supplier_integrations(integration_id) ON DELETE CASCADE,
  
  -- Request
  request_method VARCHAR(10) CHECK (request_method IN ('GET', 'POST', 'PUT', 'PATCH', 'DELETE')),
  request_url TEXT NOT NULL,
  request_headers JSONB,
  request_body JSONB,
  
  -- Response
  response_status INTEGER,
  response_headers JSONB,
  response_body JSONB,
  response_time_ms INTEGER,
  
  -- Status
  success BOOLEAN,
  error_message TEXT,
  error_code VARCHAR(100),
  
  -- Rate limiting
  rate_limit_remaining INTEGER,
  rate_limit_reset_at TIMESTAMP WITH TIME ZONE,
  
  -- Retry
  retry_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadados
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices
CREATE INDEX idx_supplier_api_logs_integration ON supplier_api_logs(integration_id);
CREATE INDEX idx_supplier_api_logs_created ON supplier_api_logs(created_at DESC);
CREATE INDEX idx_supplier_api_logs_success ON supplier_api_logs(success) WHERE success = false;
CREATE INDEX idx_supplier_api_logs_status ON supplier_api_logs(response_status);

COMMENT ON TABLE supplier_api_logs IS 'Logs de chamadas a APIs de fornecedores para debug e auditoria';

-- ============================================================================
-- 6. EXTERNAL_PRODUCT_CATALOG - Catálogo Externo de Produtos
-- ============================================================================

CREATE TABLE IF NOT EXISTS external_product_catalog (
  external_product_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
  integration_id UUID REFERENCES supplier_integrations(integration_id) ON DELETE SET NULL,
  
  -- Identificação externa
  external_id TEXT NOT NULL,
  external_sku TEXT,
  
  -- Mapeamento interno
  internal_product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  mapping_status VARCHAR(50) DEFAULT 'pending' CHECK (mapping_status IN (
    'pending',
    'mapped',
    'conflict',
    'ignored',
    'archived'
  )),
  mapping_confidence DECIMAL(3,2),
  
  -- Informações do produto
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  manufacturer TEXT,
  brand TEXT,
  
  -- Códigos
  gtin TEXT,
  upc TEXT,
  ean TEXT,
  anvisa_registration TEXT,
  
  -- Preço e disponibilidade
  price DECIMAL(15,2),
  currency VARCHAR(3) DEFAULT 'BRL',
  availability VARCHAR(50),
  stock_quantity INTEGER,
  lead_time_days INTEGER,
  
  -- Dados brutos do fornecedor
  raw_data JSONB,
  
  -- Sincronização
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sync_hash TEXT, -- Hash dos dados para detectar mudanças
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadados
  metadata JSONB DEFAULT '{}'::jsonb,
  
  UNIQUE(supplier_id, external_id)
);

-- Índices
CREATE INDEX idx_external_catalog_supplier ON external_product_catalog(supplier_id);
CREATE INDEX idx_external_catalog_integration ON external_product_catalog(integration_id);
CREATE INDEX idx_external_catalog_internal ON external_product_catalog(internal_product_id);
CREATE INDEX idx_external_catalog_mapping ON external_product_catalog(mapping_status);
CREATE INDEX idx_external_catalog_synced ON external_product_catalog(last_synced_at DESC);
CREATE INDEX idx_external_catalog_active ON external_product_catalog(is_active) WHERE is_active = true;
CREATE INDEX idx_external_catalog_gtin ON external_product_catalog(gtin) WHERE gtin IS NOT NULL;

COMMENT ON TABLE external_product_catalog IS 'Catálogo de produtos sincronizado de fornecedores externos';

-- ============================================================================
-- 7. ANVISA_VALIDATIONS - Validações ANVISA
-- ============================================================================

CREATE TABLE IF NOT EXISTS anvisa_validations (
  validation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Entidade validada
  entity_type VARCHAR(100) CHECK (entity_type IN (
    'product',
    'batch',
    'supplier',
    'manufacturer',
    'medical_device',
    'implant'
  )),
  entity_id UUID,
  
  -- Tipo de validação
  validation_type VARCHAR(100) CHECK (validation_type IN (
    'registration_number',
    'udi_validation',
    'rdc_925_compliance',
    'recall_check',
    'expiration_check',
    'batch_verification',
    'manufacturer_validation'
  )),
  
  -- Dados ANVISA
  registration_number TEXT,
  udi_di TEXT, -- Device Identifier
  udi_pi TEXT, -- Production Identifier
  process_number TEXT,
  
  -- Resultado da validação
  validation_status VARCHAR(50) CHECK (validation_status IN (
    'valid',
    'invalid',
    'expired',
    'recalled',
    'suspended',
    'pending',
    'error'
  )),
  
  -- Detalhes
  validation_details JSONB,
  anvisa_response JSONB,
  error_message TEXT,
  
  -- Datas
  validated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expiration_date DATE,
  recall_date DATE,
  
  -- Cache
  cache_expires_at TIMESTAMP WITH TIME ZONE,
  revalidate BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadados
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices
CREATE INDEX idx_anvisa_validations_org ON anvisa_validations(organization_id);
CREATE INDEX idx_anvisa_validations_entity ON anvisa_validations(entity_type, entity_id);
CREATE INDEX idx_anvisa_validations_type ON anvisa_validations(validation_type);
CREATE INDEX idx_anvisa_validations_status ON anvisa_validations(validation_status);
CREATE INDEX idx_anvisa_validations_registration ON anvisa_validations(registration_number);
CREATE INDEX idx_anvisa_validations_udi ON anvisa_validations(udi_di);
CREATE INDEX idx_anvisa_validations_cache ON anvisa_validations(cache_expires_at) WHERE revalidate = true;

COMMENT ON TABLE anvisa_validations IS 'Validações e consultas à ANVISA para compliance regulatório';

-- ============================================================================
-- 8. TRIGGERS E FUNÇÕES
-- ============================================================================

-- Atualizar updated_at
CREATE TRIGGER update_iot_devices_updated_at
  BEFORE UPDATE ON iot_devices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supplier_integrations_updated_at
  BEFORE UPDATE ON supplier_integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_external_product_catalog_updated_at
  BEFORE UPDATE ON external_product_catalog
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_anvisa_validations_updated_at
  BEFORE UPDATE ON anvisa_validations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Atualizar last_seen_at quando device envia leitura
CREATE OR REPLACE FUNCTION update_device_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE iot_devices
  SET last_seen_at = NEW.read_at
  WHERE device_id = NEW.device_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_device_last_seen_trigger
  AFTER INSERT ON iot_readings
  FOR EACH ROW
  EXECUTE FUNCTION update_device_last_seen();

-- Validar hash de sincronização
CREATE OR REPLACE FUNCTION calculate_sync_hash(p_data JSONB)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(digest(p_data::text, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- 9. FUNÇÕES DE UTILIDADE
-- ============================================================================

-- Registrar leitura IoT
CREATE OR REPLACE FUNCTION register_iot_reading(
  p_device_uid TEXT,
  p_reading_type VARCHAR(100),
  p_tag_uid TEXT DEFAULT NULL,
  p_value DECIMAL DEFAULT NULL,
  p_raw_data JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_device_id UUID;
  v_reading_id UUID;
BEGIN
  -- Encontrar device
  SELECT device_id INTO v_device_id
  FROM iot_devices
  WHERE device_uid = p_device_uid AND status = 'active';
  
  IF v_device_id IS NULL THEN
    RAISE EXCEPTION 'Device not found or inactive: %', p_device_uid;
  END IF;
  
  -- Inserir leitura
  INSERT INTO iot_readings (
    device_id,
    reading_type,
    tag_uid,
    value,
    raw_data,
    read_at
  ) VALUES (
    v_device_id,
    p_reading_type,
    p_tag_uid,
    p_value,
    p_raw_data,
    NOW()
  )
  RETURNING reading_id INTO v_reading_id;
  
  RETURN v_reading_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Validar registro ANVISA
CREATE OR REPLACE FUNCTION validate_anvisa_registration(
  p_registration_number TEXT,
  p_entity_type VARCHAR(100),
  p_entity_id UUID,
  p_organization_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_validation_id UUID;
  v_cached_validation UUID;
BEGIN
  -- Verificar se já existe validação em cache válida
  SELECT validation_id INTO v_cached_validation
  FROM anvisa_validations
  WHERE registration_number = p_registration_number
    AND cache_expires_at > NOW()
    AND validation_status = 'valid'
  LIMIT 1;
  
  IF v_cached_validation IS NOT NULL THEN
    RETURN v_cached_validation;
  END IF;
  
  -- Criar nova validação (será processada por job assíncrono)
  INSERT INTO anvisa_validations (
    organization_id,
    entity_type,
    entity_id,
    validation_type,
    registration_number,
    validation_status,
    cache_expires_at
  ) VALUES (
    p_organization_id,
    p_entity_type,
    p_entity_id,
    'registration_number',
    p_registration_number,
    'pending',
    NOW() + INTERVAL '7 days'
  )
  RETURNING validation_id INTO v_validation_id;
  
  RETURN v_validation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 10. ROW LEVEL SECURITY
-- ============================================================================

-- Habilitar RLS
ALTER TABLE iot_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE iot_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE blockchain_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_api_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_product_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE anvisa_validations ENABLE ROW LEVEL SECURITY;

-- Policies (exemplo para iot_devices, replicar para outras tabelas)
CREATE POLICY "Users can view devices from their organizations"
  ON iot_devices FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  );

-- Policies para iot_readings
CREATE POLICY "Users can view readings from their organization's devices"
  ON iot_readings FOR SELECT
  USING (
    device_id IN (
      SELECT device_id FROM iot_devices WHERE organization_id IN (
        SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- 11. GRANTS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE ON iot_devices TO authenticated;
GRANT SELECT, INSERT ON iot_readings TO authenticated;
GRANT SELECT ON blockchain_transactions TO authenticated;
GRANT SELECT ON supplier_integrations TO authenticated;
GRANT SELECT ON supplier_api_logs TO authenticated;
GRANT SELECT ON external_product_catalog TO authenticated;
GRANT SELECT ON anvisa_validations TO authenticated;

GRANT EXECUTE ON FUNCTION register_iot_reading TO authenticated;
GRANT EXECUTE ON FUNCTION validate_anvisa_registration TO authenticated;

-- ============================================================================
-- FIM DA MIGRAÇÃO
-- ============================================================================




-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Migração: 20251026_webhook_system.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================================================
-- ICARUS v5.0 - SISTEMA DE WEBHOOKS
-- Notificações em tempo real via webhooks
-- Data: 2025-10-26
-- ============================================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. WEBHOOK_ENDPOINTS - Endpoints Cadastrados
-- ============================================================================

CREATE TABLE IF NOT EXISTS webhook_endpoints (
  endpoint_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Identificação
  name TEXT NOT NULL,
  description TEXT,
  
  -- Configuração
  url TEXT NOT NULL,
  method VARCHAR(10) DEFAULT 'POST' CHECK (method IN ('POST', 'PUT', 'PATCH')),
  
  -- Autenticação
  auth_type VARCHAR(50) CHECK (auth_type IN ('none', 'basic', 'bearer', 'api_key', 'hmac')),
  auth_config JSONB DEFAULT '{}'::jsonb,
  secret_key TEXT, -- Para HMAC signature
  
  -- Headers customizados
  custom_headers JSONB DEFAULT '{}'::jsonb,
  
  -- Eventos que este webhook deve receber
  events TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  
  -- Rate limiting
  rate_limit_per_minute INTEGER DEFAULT 60,
  rate_limit_per_hour INTEGER DEFAULT 1000,
  
  -- Retry configuration
  max_retries INTEGER DEFAULT 3,
  retry_delay_seconds INTEGER DEFAULT 60,
  timeout_seconds INTEGER DEFAULT 30,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  verified_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadados
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Constraints
  CONSTRAINT valid_url CHECK (url ~ '^https?://'),
  CONSTRAINT valid_events CHECK (array_length(events, 1) > 0)
);

-- Índices
CREATE INDEX idx_webhook_endpoints_org ON webhook_endpoints(organization_id);
CREATE INDEX idx_webhook_endpoints_active ON webhook_endpoints(is_active) WHERE is_active = true;
CREATE INDEX idx_webhook_endpoints_events ON webhook_endpoints USING GIN(events);
CREATE INDEX idx_webhook_endpoints_last_triggered ON webhook_endpoints(last_triggered_at DESC);

COMMENT ON TABLE webhook_endpoints IS 'Endpoints de webhooks cadastrados para notificações em tempo real';

-- ============================================================================
-- 2. WEBHOOK_DELIVERIES - Entregas de Webhooks
-- ============================================================================

CREATE TABLE IF NOT EXISTS webhook_deliveries (
  delivery_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint_id UUID REFERENCES webhook_endpoints(endpoint_id) ON DELETE CASCADE,
  
  -- Evento
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB NOT NULL,
  
  -- Request
  request_url TEXT NOT NULL,
  request_method VARCHAR(10) NOT NULL,
  request_headers JSONB,
  request_body JSONB,
  request_signature TEXT,
  
  -- Response
  response_status INTEGER,
  response_headers JSONB,
  response_body TEXT,
  response_time_ms INTEGER,
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
    'pending',
    'sending',
    'success',
    'failed',
    'retrying',
    'cancelled'
  )),
  
  -- Retry
  retry_count INTEGER DEFAULT 0,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  
  -- Error
  error_message TEXT,
  error_code VARCHAR(100),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadados
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices
CREATE INDEX idx_webhook_deliveries_endpoint ON webhook_deliveries(endpoint_id);
CREATE INDEX idx_webhook_deliveries_status ON webhook_deliveries(status) WHERE status != 'success';
CREATE INDEX idx_webhook_deliveries_event ON webhook_deliveries(event_type);
CREATE INDEX idx_webhook_deliveries_created ON webhook_deliveries(created_at DESC);
CREATE INDEX idx_webhook_deliveries_retry ON webhook_deliveries(next_retry_at) 
  WHERE status = 'retrying' AND next_retry_at IS NOT NULL;

-- Particionamento por data (opcional, para grande volume)
-- CREATE INDEX idx_webhook_deliveries_created_brin ON webhook_deliveries USING BRIN(created_at);

COMMENT ON TABLE webhook_deliveries IS 'Histórico de entregas de webhooks com status e retry';

-- ============================================================================
-- 3. WEBHOOK_EVENTS - Tipos de Eventos
-- ============================================================================

CREATE TABLE IF NOT EXISTS webhook_events (
  event_type VARCHAR(100) PRIMARY KEY,
  
  -- Descrição
  name TEXT NOT NULL,
  description TEXT,
  
  -- Schema do payload (JSON Schema)
  payload_schema JSONB,
  
  -- Categoria
  category VARCHAR(100),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadados
  metadata JSONB DEFAULT '{}'::jsonb
);

COMMENT ON TABLE webhook_events IS 'Catálogo de tipos de eventos disponíveis para webhooks';

-- Inserir eventos padrão
INSERT INTO webhook_events (event_type, name, description, category) VALUES
  ('task.created', 'Tarefa Criada', 'Disparado quando uma nova tarefa de agente é criada', 'agent'),
  ('task.started', 'Tarefa Iniciada', 'Disparado quando uma tarefa inicia execução', 'agent'),
  ('task.completed', 'Tarefa Concluída', 'Disparado quando uma tarefa é concluída com sucesso', 'agent'),
  ('task.failed', 'Tarefa Falhou', 'Disparado quando uma tarefa falha', 'agent'),
  ('report.draft', 'Relatório em Rascunho', 'Disparado quando um relatório é criado em rascunho', 'report'),
  ('report.pending_review', 'Relatório Pendente Revisão', 'Disparado quando relatório está aguardando revisão', 'report'),
  ('report.approved', 'Relatório Aprovado', 'Disparado quando relatório é aprovado', 'report'),
  ('report.published', 'Relatório Publicado', 'Disparado quando relatório é publicado', 'report'),
  ('compliance.low_score', 'Score de Compliance Baixo', 'Disparado quando score de compliance < 80%', 'compliance'),
  ('compliance.validation_failed', 'Validação Falhou', 'Disparado quando validação ANVISA falha', 'compliance'),
  ('iot.device_offline', 'Dispositivo Offline', 'Disparado quando dispositivo IoT fica offline', 'iot'),
  ('iot.alert_triggered', 'Alerta IoT Disparado', 'Disparado quando um alerta IoT é acionado', 'iot'),
  ('integration.sync_completed', 'Sincronização Completa', 'Disparado quando sincronização com fornecedor completa', 'integration'),
  ('integration.sync_failed', 'Sincronização Falhou', 'Disparado quando sincronização falha', 'integration')
ON CONFLICT (event_type) DO NOTHING;

-- ============================================================================
-- 4. TRIGGERS E FUNÇÕES
-- ============================================================================

-- Atualizar updated_at
CREATE TRIGGER update_webhook_endpoints_updated_at
  BEFORE UPDATE ON webhook_endpoints
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Disparar webhook quando tarefa completa
CREATE OR REPLACE FUNCTION trigger_webhook_on_task_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    PERFORM dispatch_webhook(
      'task.completed',
      jsonb_build_object(
        'task_id', NEW.task_id,
        'query_text', NEW.query_text,
        'execution_time_ms', NEW.execution_time_ms,
        'completed_at', NEW.completed_at,
        'result_data', NEW.result_data
      ),
      NEW.organization_id
    );
  ELSIF NEW.status = 'failed' AND OLD.status != 'failed' THEN
    PERFORM dispatch_webhook(
      'task.failed',
      jsonb_build_object(
        'task_id', NEW.task_id,
        'query_text', NEW.query_text,
        'error_message', NEW.error_message,
        'completed_at', NEW.completed_at
      ),
      NEW.organization_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER webhook_task_completion
  AFTER UPDATE ON agent_tasks
  FOR EACH ROW
  EXECUTE FUNCTION trigger_webhook_on_task_completion();

-- Disparar webhook quando relatório é publicado
CREATE OR REPLACE FUNCTION trigger_webhook_on_report_published()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'published' AND OLD.status != 'published' THEN
    PERFORM dispatch_webhook(
      'report.published',
      jsonb_build_object(
        'report_id', NEW.report_id,
        'title', NEW.title,
        'report_type', NEW.report_type,
        'published_at', NEW.published_at,
        'pdf_url', NEW.pdf_url
      ),
      NEW.organization_id
    );
  ELSIF NEW.status = 'pending_review' AND OLD.status = 'draft' THEN
    PERFORM dispatch_webhook(
      'report.pending_review',
      jsonb_build_object(
        'report_id', NEW.report_id,
        'title', NEW.title,
        'report_type', NEW.report_type
      ),
      NEW.organization_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER webhook_report_published
  AFTER UPDATE ON agent_reports
  FOR EACH ROW
  EXECUTE FUNCTION trigger_webhook_on_report_published();

-- ============================================================================
-- 5. FUNÇÃO PARA DESPACHAR WEBHOOK
-- ============================================================================

CREATE OR REPLACE FUNCTION dispatch_webhook(
  p_event_type VARCHAR(100),
  p_event_data JSONB,
  p_organization_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_endpoint RECORD;
BEGIN
  -- Buscar todos webhooks ativos que escutam este evento
  FOR v_endpoint IN
    SELECT *
    FROM webhook_endpoints
    WHERE organization_id = p_organization_id
      AND is_active = true
      AND p_event_type = ANY(events)
  LOOP
    -- Criar delivery pendente
    INSERT INTO webhook_deliveries (
      endpoint_id,
      event_type,
      event_data,
      request_url,
      request_method,
      status
    ) VALUES (
      v_endpoint.endpoint_id,
      p_event_type,
      p_event_data,
      v_endpoint.url,
      v_endpoint.method,
      'pending'
    );
    
    -- Atualizar last_triggered_at
    UPDATE webhook_endpoints
    SET last_triggered_at = NOW()
    WHERE endpoint_id = v_endpoint.endpoint_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION dispatch_webhook IS 'Despacha webhook para todos endpoints que escutam o evento';

-- ============================================================================
-- 6. FUNÇÃO PARA PROCESSAR FILA DE WEBHOOKS
-- ============================================================================

CREATE OR REPLACE FUNCTION process_webhook_queue(p_batch_size INTEGER DEFAULT 10)
RETURNS TABLE (
  delivery_id UUID,
  endpoint_id UUID,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.delivery_id,
    d.endpoint_id,
    d.status::TEXT
  FROM webhook_deliveries d
  WHERE d.status IN ('pending', 'retrying')
    AND (d.next_retry_at IS NULL OR d.next_retry_at <= NOW())
  ORDER BY d.created_at ASC
  LIMIT p_batch_size;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 7. ROW LEVEL SECURITY
-- ============================================================================

-- Habilitar RLS
ALTER TABLE webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Policies para webhook_endpoints
CREATE POLICY "Users can view their organization's webhooks"
  ON webhook_endpoints FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create webhooks"
  ON webhook_endpoints FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their organization's webhooks"
  ON webhook_endpoints FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  );

-- Policies para webhook_deliveries
CREATE POLICY "Users can view deliveries of their webhooks"
  ON webhook_deliveries FOR SELECT
  USING (
    endpoint_id IN (
      SELECT endpoint_id FROM webhook_endpoints WHERE organization_id IN (
        SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
      )
    )
  );

-- Policies para webhook_events (todos podem ver)
CREATE POLICY "Anyone can view webhook events"
  ON webhook_events FOR SELECT
  USING (true);

-- ============================================================================
-- 8. VIEWS ÚTEIS
-- ============================================================================

-- View de estatísticas de webhooks
CREATE OR REPLACE VIEW webhook_statistics AS
SELECT 
  e.endpoint_id,
  e.name,
  e.url,
  e.is_active,
  COUNT(d.delivery_id) as total_deliveries,
  COUNT(CASE WHEN d.status = 'success' THEN 1 END) as successful_deliveries,
  COUNT(CASE WHEN d.status = 'failed' THEN 1 END) as failed_deliveries,
  COUNT(CASE WHEN d.status = 'pending' THEN 1 END) as pending_deliveries,
  AVG(d.response_time_ms) as avg_response_time_ms,
  MAX(d.created_at) as last_delivery_at,
  CASE 
    WHEN COUNT(d.delivery_id) > 0 
    THEN (COUNT(CASE WHEN d.status = 'success' THEN 1 END)::FLOAT / COUNT(d.delivery_id) * 100)
    ELSE 0
  END as success_rate
FROM webhook_endpoints e
LEFT JOIN webhook_deliveries d ON d.endpoint_id = e.endpoint_id
GROUP BY e.endpoint_id;

-- View de deliveries recentes com falha
CREATE OR REPLACE VIEW webhook_failed_deliveries AS
SELECT 
  d.delivery_id,
  d.endpoint_id,
  e.name as endpoint_name,
  e.url,
  d.event_type,
  d.status,
  d.retry_count,
  d.error_message,
  d.created_at,
  d.next_retry_at
FROM webhook_deliveries d
JOIN webhook_endpoints e ON e.endpoint_id = d.endpoint_id
WHERE d.status IN ('failed', 'retrying')
ORDER BY d.created_at DESC;

-- ============================================================================
-- 9. GRANTS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE ON webhook_endpoints TO authenticated;
GRANT SELECT ON webhook_deliveries TO authenticated;
GRANT SELECT ON webhook_events TO authenticated;
GRANT SELECT ON webhook_statistics TO authenticated;
GRANT SELECT ON webhook_failed_deliveries TO authenticated;

GRANT EXECUTE ON FUNCTION dispatch_webhook TO authenticated;
GRANT EXECUTE ON FUNCTION process_webhook_queue TO authenticated;

-- ============================================================================
-- FIM DA MIGRAÇÃO
-- ============================================================================




-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Migração: 20251027013614_enable_rls_critical_tables.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Migração automática: Habilitar RLS em tabelas críticas
-- Gerado em: 2025-10-27T01:36:14.701Z
-- Total de tabelas: 20

-- Habilitar RLS para usuarios
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Política: Usuários autenticados podem ler suas próprias linhas
CREATE POLICY "usuarios_select_policy"
  ON public.usuarios
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Política: Usuários autenticados podem inserir
CREATE POLICY "usuarios_insert_policy"
  ON public.usuarios
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Usuários podem atualizar suas próprias linhas
CREATE POLICY "usuarios_update_policy"
  ON public.usuarios
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Apenas admins podem deletar
CREATE POLICY "usuarios_delete_policy"
  ON public.usuarios
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Habilitar RLS para medicos
ALTER TABLE public.medicos ENABLE ROW LEVEL SECURITY;

-- Política: Usuários autenticados podem ler suas próprias linhas
CREATE POLICY "medicos_select_policy"
  ON public.medicos
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Política: Usuários autenticados podem inserir
CREATE POLICY "medicos_insert_policy"
  ON public.medicos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Usuários podem atualizar suas próprias linhas
CREATE POLICY "medicos_update_policy"
  ON public.medicos
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Apenas admins podem deletar
CREATE POLICY "medicos_delete_policy"
  ON public.medicos
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Habilitar RLS para hospitais
ALTER TABLE public.hospitais ENABLE ROW LEVEL SECURITY;

-- Política: Usuários autenticados podem ler suas próprias linhas
CREATE POLICY "hospitais_select_policy"
  ON public.hospitais
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Política: Usuários autenticados podem inserir
CREATE POLICY "hospitais_insert_policy"
  ON public.hospitais
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Usuários podem atualizar suas próprias linhas
CREATE POLICY "hospitais_update_policy"
  ON public.hospitais
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Apenas admins podem deletar
CREATE POLICY "hospitais_delete_policy"
  ON public.hospitais
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Habilitar RLS para cirurgias
ALTER TABLE public.cirurgias ENABLE ROW LEVEL SECURITY;

-- Política: Usuários autenticados podem ler suas próprias linhas
CREATE POLICY "cirurgias_select_policy"
  ON public.cirurgias
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Política: Usuários autenticados podem inserir
CREATE POLICY "cirurgias_insert_policy"
  ON public.cirurgias
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Usuários podem atualizar suas próprias linhas
CREATE POLICY "cirurgias_update_policy"
  ON public.cirurgias
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Apenas admins podem deletar
CREATE POLICY "cirurgias_delete_policy"
  ON public.cirurgias
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Habilitar RLS para leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Política: Usuários autenticados podem ler suas próprias linhas
CREATE POLICY "leads_select_policy"
  ON public.leads
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Política: Usuários autenticados podem inserir
CREATE POLICY "leads_insert_policy"
  ON public.leads
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Usuários podem atualizar suas próprias linhas
CREATE POLICY "leads_update_policy"
  ON public.leads
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Apenas admins podem deletar
CREATE POLICY "leads_delete_policy"
  ON public.leads
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Habilitar RLS para transacoes
ALTER TABLE public.transacoes ENABLE ROW LEVEL SECURITY;

-- Política: Usuários autenticados podem ler suas próprias linhas
CREATE POLICY "transacoes_select_policy"
  ON public.transacoes
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Política: Usuários autenticados podem inserir
CREATE POLICY "transacoes_insert_policy"
  ON public.transacoes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Usuários podem atualizar suas próprias linhas
CREATE POLICY "transacoes_update_policy"
  ON public.transacoes
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Apenas admins podem deletar
CREATE POLICY "transacoes_delete_policy"
  ON public.transacoes
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Habilitar RLS para fornecedores
ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;

-- Política: Usuários autenticados podem ler suas próprias linhas
CREATE POLICY "fornecedores_select_policy"
  ON public.fornecedores
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Política: Usuários autenticados podem inserir
CREATE POLICY "fornecedores_insert_policy"
  ON public.fornecedores
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Usuários podem atualizar suas próprias linhas
CREATE POLICY "fornecedores_update_policy"
  ON public.fornecedores
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Apenas admins podem deletar
CREATE POLICY "fornecedores_delete_policy"
  ON public.fornecedores
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Habilitar RLS para pedidos_compra
ALTER TABLE public.pedidos_compra ENABLE ROW LEVEL SECURITY;

-- Política: Usuários autenticados podem ler suas próprias linhas
CREATE POLICY "pedidos_compra_select_policy"
  ON public.pedidos_compra
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Política: Usuários autenticados podem inserir
CREATE POLICY "pedidos_compra_insert_policy"
  ON public.pedidos_compra
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Usuários podem atualizar suas próprias linhas
CREATE POLICY "pedidos_compra_update_policy"
  ON public.pedidos_compra
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Apenas admins podem deletar
CREATE POLICY "pedidos_compra_delete_policy"
  ON public.pedidos_compra
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Habilitar RLS para faturas
ALTER TABLE public.faturas ENABLE ROW LEVEL SECURITY;

-- Política: Usuários autenticados podem ler suas próprias linhas
CREATE POLICY "faturas_select_policy"
  ON public.faturas
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Política: Usuários autenticados podem inserir
CREATE POLICY "faturas_insert_policy"
  ON public.faturas
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Usuários podem atualizar suas próprias linhas
CREATE POLICY "faturas_update_policy"
  ON public.faturas
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Apenas admins podem deletar
CREATE POLICY "faturas_delete_policy"
  ON public.faturas
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Habilitar RLS para audit_log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Política: Usuários autenticados podem ler suas próprias linhas
CREATE POLICY "audit_log_select_policy"
  ON public.audit_log
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Política: Usuários autenticados podem inserir
CREATE POLICY "audit_log_insert_policy"
  ON public.audit_log
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Usuários podem atualizar suas próprias linhas
CREATE POLICY "audit_log_update_policy"
  ON public.audit_log
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Apenas admins podem deletar
CREATE POLICY "audit_log_delete_policy"
  ON public.audit_log
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Habilitar RLS para pacientes
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;

-- Política: Usuários autenticados podem ler suas próprias linhas
CREATE POLICY "pacientes_select_policy"
  ON public.pacientes
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Política: Usuários autenticados podem inserir
CREATE POLICY "pacientes_insert_policy"
  ON public.pacientes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Usuários podem atualizar suas próprias linhas
CREATE POLICY "pacientes_update_policy"
  ON public.pacientes
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Apenas admins podem deletar
CREATE POLICY "pacientes_delete_policy"
  ON public.pacientes
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Habilitar RLS para faturas
ALTER TABLE public.faturas ENABLE ROW LEVEL SECURITY;

-- Política: Usuários autenticados podem ler suas próprias linhas
CREATE POLICY "faturas_select_policy"
  ON public.faturas
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Política: Usuários autenticados podem inserir
CREATE POLICY "faturas_insert_policy"
  ON public.faturas
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Usuários podem atualizar suas próprias linhas
CREATE POLICY "faturas_update_policy"
  ON public.faturas
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Apenas admins podem deletar
CREATE POLICY "faturas_delete_policy"
  ON public.faturas
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Habilitar RLS para profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política: Usuários autenticados podem ler suas próprias linhas
CREATE POLICY "profiles_select_policy"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Política: Usuários autenticados podem inserir
CREATE POLICY "profiles_insert_policy"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Usuários podem atualizar suas próprias linhas
CREATE POLICY "profiles_update_policy"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Apenas admins podem deletar
CREATE POLICY "profiles_delete_policy"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Habilitar RLS para medicos
ALTER TABLE public.medicos ENABLE ROW LEVEL SECURITY;

-- Política: Usuários autenticados podem ler suas próprias linhas
CREATE POLICY "medicos_select_policy"
  ON public.medicos
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Política: Usuários autenticados podem inserir
CREATE POLICY "medicos_insert_policy"
  ON public.medicos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Usuários podem atualizar suas próprias linhas
CREATE POLICY "medicos_update_policy"
  ON public.medicos
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Apenas admins podem deletar
CREATE POLICY "medicos_delete_policy"
  ON public.medicos
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Habilitar RLS para hospitais
ALTER TABLE public.hospitais ENABLE ROW LEVEL SECURITY;

-- Política: Usuários autenticados podem ler suas próprias linhas
CREATE POLICY "hospitais_select_policy"
  ON public.hospitais
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Política: Usuários autenticados podem inserir
CREATE POLICY "hospitais_insert_policy"
  ON public.hospitais
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Usuários podem atualizar suas próprias linhas
CREATE POLICY "hospitais_update_policy"
  ON public.hospitais
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Apenas admins podem deletar
CREATE POLICY "hospitais_delete_policy"
  ON public.hospitais
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Habilitar RLS para cirurgias
ALTER TABLE public.cirurgias ENABLE ROW LEVEL SECURITY;

-- Política: Usuários autenticados podem ler suas próprias linhas
CREATE POLICY "cirurgias_select_policy"
  ON public.cirurgias
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Política: Usuários autenticados podem inserir
CREATE POLICY "cirurgias_insert_policy"
  ON public.cirurgias
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Usuários podem atualizar suas próprias linhas
CREATE POLICY "cirurgias_update_policy"
  ON public.cirurgias
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Apenas admins podem deletar
CREATE POLICY "cirurgias_delete_policy"
  ON public.cirurgias
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Habilitar RLS para materiais_opme
ALTER TABLE public.materiais_opme ENABLE ROW LEVEL SECURITY;

-- Política: Usuários autenticados podem ler suas próprias linhas
CREATE POLICY "materiais_opme_select_policy"
  ON public.materiais_opme
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Política: Usuários autenticados podem inserir
CREATE POLICY "materiais_opme_insert_policy"
  ON public.materiais_opme
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Usuários podem atualizar suas próprias linhas
CREATE POLICY "materiais_opme_update_policy"
  ON public.materiais_opme
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Apenas admins podem deletar
CREATE POLICY "materiais_opme_delete_policy"
  ON public.materiais_opme
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Habilitar RLS para leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Política: Usuários autenticados podem ler suas próprias linhas
CREATE POLICY "leads_select_policy"
  ON public.leads
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Política: Usuários autenticados podem inserir
CREATE POLICY "leads_insert_policy"
  ON public.leads
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Usuários podem atualizar suas próprias linhas
CREATE POLICY "leads_update_policy"
  ON public.leads
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Apenas admins podem deletar
CREATE POLICY "leads_delete_policy"
  ON public.leads
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Habilitar RLS para transacoes
ALTER TABLE public.transacoes ENABLE ROW LEVEL SECURITY;

-- Política: Usuários autenticados podem ler suas próprias linhas
CREATE POLICY "transacoes_select_policy"
  ON public.transacoes
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Política: Usuários autenticados podem inserir
CREATE POLICY "transacoes_insert_policy"
  ON public.transacoes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Usuários podem atualizar suas próprias linhas
CREATE POLICY "transacoes_update_policy"
  ON public.transacoes
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Apenas admins podem deletar
CREATE POLICY "transacoes_delete_policy"
  ON public.transacoes
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Habilitar RLS para fornecedores
ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;

-- Política: Usuários autenticados podem ler suas próprias linhas
CREATE POLICY "fornecedores_select_policy"
  ON public.fornecedores
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Política: Usuários autenticados podem inserir
CREATE POLICY "fornecedores_insert_policy"
  ON public.fornecedores
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Usuários podem atualizar suas próprias linhas
CREATE POLICY "fornecedores_update_policy"
  ON public.fornecedores
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Apenas admins podem deletar
CREATE POLICY "fornecedores_delete_policy"
  ON public.fornecedores
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );


-- Índices para melhorar performance das políticas RLS

CREATE INDEX IF NOT EXISTS idx_usuarios_user_id ON public.usuarios(user_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_created_by ON public.usuarios(created_by);

CREATE INDEX IF NOT EXISTS idx_medicos_user_id ON public.medicos(user_id);
CREATE INDEX IF NOT EXISTS idx_medicos_created_by ON public.medicos(created_by);

CREATE INDEX IF NOT EXISTS idx_hospitais_user_id ON public.hospitais(user_id);
CREATE INDEX IF NOT EXISTS idx_hospitais_created_by ON public.hospitais(created_by);

CREATE INDEX IF NOT EXISTS idx_cirurgias_user_id ON public.cirurgias(user_id);
CREATE INDEX IF NOT EXISTS idx_cirurgias_created_by ON public.cirurgias(created_by);

CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_created_by ON public.leads(created_by);

CREATE INDEX IF NOT EXISTS idx_transacoes_user_id ON public.transacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_created_by ON public.transacoes(created_by);

CREATE INDEX IF NOT EXISTS idx_fornecedores_user_id ON public.fornecedores(user_id);
CREATE INDEX IF NOT EXISTS idx_fornecedores_created_by ON public.fornecedores(created_by);

CREATE INDEX IF NOT EXISTS idx_pedidos_compra_user_id ON public.pedidos_compra(user_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_compra_created_by ON public.pedidos_compra(created_by);

CREATE INDEX IF NOT EXISTS idx_faturas_user_id ON public.faturas(user_id);
CREATE INDEX IF NOT EXISTS idx_faturas_created_by ON public.faturas(created_by);

CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_by ON public.audit_log(created_by);

CREATE INDEX IF NOT EXISTS idx_pacientes_user_id ON public.pacientes(user_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_created_by ON public.pacientes(created_by);

CREATE INDEX IF NOT EXISTS idx_faturas_user_id ON public.faturas(user_id);
CREATE INDEX IF NOT EXISTS idx_faturas_created_by ON public.faturas(created_by);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_created_by ON public.profiles(created_by);

CREATE INDEX IF NOT EXISTS idx_medicos_user_id ON public.medicos(user_id);
CREATE INDEX IF NOT EXISTS idx_medicos_created_by ON public.medicos(created_by);

CREATE INDEX IF NOT EXISTS idx_hospitais_user_id ON public.hospitais(user_id);
CREATE INDEX IF NOT EXISTS idx_hospitais_created_by ON public.hospitais(created_by);

CREATE INDEX IF NOT EXISTS idx_cirurgias_user_id ON public.cirurgias(user_id);
CREATE INDEX IF NOT EXISTS idx_cirurgias_created_by ON public.cirurgias(created_by);

CREATE INDEX IF NOT EXISTS idx_materiais_opme_user_id ON public.materiais_opme(user_id);
CREATE INDEX IF NOT EXISTS idx_materiais_opme_created_by ON public.materiais_opme(created_by);

CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_created_by ON public.leads(created_by);

CREATE INDEX IF NOT EXISTS idx_transacoes_user_id ON public.transacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_created_by ON public.transacoes(created_by);

CREATE INDEX IF NOT EXISTS idx_fornecedores_user_id ON public.fornecedores(user_id);
CREATE INDEX IF NOT EXISTS idx_fornecedores_created_by ON public.fornecedores(created_by);


-- Comentários
COMMENT ON TABLE public.usuarios IS 'Tabela com RLS habilitado para segurança';



-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Migração: 20251117210505_create_storage_buckets.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================================================
-- CRIAR STORAGE BUCKETS - ICARUS
-- ============================================================================
-- Projeto: gvbkviozlhxorjoavmky
-- Data: 2025-11-17
-- ============================================================================
-- 
-- INSTRUÇÕES:
-- 1. Acesse: https://supabase.com/dashboard/project/gvbkviozlhxorjoavmky/sql
-- 2. Copie e cole este SQL
-- 3. Execute
-- 4. Verifique em: Storage → Buckets
-- ============================================================================

-- ============================================
-- BUCKET 1: documentos_cirurgias
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documentos_cirurgias',
  'documentos_cirurgias',
  FALSE, -- Privado
  10485760, -- 10MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================
-- BUCKET 2: documentos_fiscais
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documentos_fiscais',
  'documentos_fiscais',
  FALSE, -- Privado
  52428800, -- 50MB
  ARRAY['application/pdf', 'application/xml', 'text/xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================
-- BUCKET 3: anexos_produtos
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'anexos_produtos',
  'anexos_produtos',
  FALSE, -- Privado
  5242880, -- 5MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================
-- BUCKET 4: avatares
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatares',
  'avatares',
  TRUE, -- Público
  1048576, -- 1MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================
-- BUCKET 5: icarus_new
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'icarus_new',
  'icarus_new',
  FALSE, -- Privado
  52428800, -- 50MB
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
-- VALIDAR CRIAÇÃO
-- ============================================
SELECT 
  id,
  name,
  public,
  file_size_limit,
  array_length(allowed_mime_types, 1) as mime_types_count,
  created_at
FROM storage.buckets
ORDER BY created_at DESC;

-- ============================================
-- RESULTADO ESPERADO: 5 buckets
-- ============================================
-- documentos_cirurgias | FALSE | 10MB
-- documentos_fiscais   | FALSE | 50MB
-- anexos_produtos      | FALSE | 5MB
-- avatares             | TRUE  | 1MB
-- icarus_new           | FALSE | 50MB
-- ============================================




-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Migração: 20251117_backend_multitenant_fix.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Migration: 20251117_backend_multitenant_fix.sql
-- Descrição: Correções multi-tenant para módulo de estoque + funções KPIs/compliance
-- Autor: Auditor ICARUS v5.0
-- Data: 2025-11-17

BEGIN;

-- =====================================================================
-- 1) Ajustes Multi-tenant (empresa_id) em tabelas de Estoque
-- =====================================================================

-- 1.1 Estoque Armazéns -------------------------------------------------
ALTER TABLE public.estoque_armazens
  ADD COLUMN IF NOT EXISTS empresa_id UUID;

UPDATE public.estoque_armazens ea
SET empresa_id = COALESCE(
  ea.empresa_id,
  fallback.id
)
FROM (
  SELECT id FROM public.empresas ORDER BY criado_em NULLS LAST LIMIT 1
) AS fallback
WHERE ea.empresa_id IS NULL;

ALTER TABLE public.estoque_armazens
  ALTER COLUMN empresa_id SET NOT NULL;

ALTER TABLE public.estoque_armazens
  DROP CONSTRAINT IF EXISTS estoque_armazens_empresa_id_fkey;
ALTER TABLE public.estoque_armazens
  ADD CONSTRAINT estoque_armazens_empresa_id_fkey
  FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_estoque_armazens_empresa
  ON public.estoque_armazens(empresa_id);

-- 1.2 Estoque Localizações ---------------------------------------------
ALTER TABLE public.estoque_localizacoes
  ADD COLUMN IF NOT EXISTS empresa_id UUID;

UPDATE public.estoque_localizacoes loc
SET empresa_id = COALESCE(loc.empresa_id, ea.empresa_id)
FROM public.estoque_armazens ea
WHERE loc.armazem_id = ea.id;

UPDATE public.estoque_localizacoes loc
SET empresa_id = COALESCE(
  loc.empresa_id,
  fallback.id
)
FROM (
  SELECT id FROM public.empresas ORDER BY criado_em NULLS LAST LIMIT 1
) AS fallback
WHERE loc.empresa_id IS NULL;

ALTER TABLE public.estoque_localizacoes
  ALTER COLUMN empresa_id SET NOT NULL;

ALTER TABLE public.estoque_localizacoes
  DROP CONSTRAINT IF EXISTS estoque_localizacoes_empresa_id_fkey;
ALTER TABLE public.estoque_localizacoes
  ADD CONSTRAINT estoque_localizacoes_empresa_id_fkey
  FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_estoque_localizacoes_empresa
  ON public.estoque_localizacoes(empresa_id);

-- 1.3 Estoque ----------------------------------------------------------
ALTER TABLE public.estoque
  ADD COLUMN IF NOT EXISTS empresa_id UUID;

UPDATE public.estoque e
SET empresa_id = COALESCE(e.empresa_id, p.empresa_id)
FROM public.produtos_opme p
WHERE e.produto_id = p.id;

UPDATE public.estoque e
SET empresa_id = COALESCE(
  e.empresa_id,
  fallback.id
)
FROM (
  SELECT id FROM public.empresas ORDER BY criado_em NULLS LAST LIMIT 1
) AS fallback
WHERE e.empresa_id IS NULL;

ALTER TABLE public.estoque
  ALTER COLUMN empresa_id SET NOT NULL;

ALTER TABLE public.estoque
  DROP CONSTRAINT IF EXISTS estoque_empresa_id_fkey;
ALTER TABLE public.estoque
  ADD CONSTRAINT estoque_empresa_id_fkey
  FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_estoque_empresa
  ON public.estoque(empresa_id);

-- 1.4 Estoque Movimentações --------------------------------------------
ALTER TABLE public.estoque_movimentacoes
  ADD COLUMN IF NOT EXISTS empresa_id UUID;

UPDATE public.estoque_movimentacoes em
SET empresa_id = COALESCE(em.empresa_id, p.empresa_id)
FROM public.produtos_opme p
WHERE em.produto_id = p.id;

UPDATE public.estoque_movimentacoes em
SET empresa_id = COALESCE(
  em.empresa_id,
  fallback.id
)
FROM (
  SELECT id FROM public.empresas ORDER BY criado_em NULLS LAST LIMIT 1
) AS fallback
WHERE em.empresa_id IS NULL;

ALTER TABLE public.estoque_movimentacoes
  ALTER COLUMN empresa_id SET NOT NULL;

ALTER TABLE public.estoque_movimentacoes
  DROP CONSTRAINT IF EXISTS estoque_movimentacoes_empresa_id_fkey;
ALTER TABLE public.estoque_movimentacoes
  ADD CONSTRAINT estoque_movimentacoes_empresa_id_fkey
  FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_estoque_movimentacoes_empresa
  ON public.estoque_movimentacoes(empresa_id);

-- 1.5 Estoque Reservas -------------------------------------------------
ALTER TABLE public.estoque_reservas
  ADD COLUMN IF NOT EXISTS empresa_id UUID;

UPDATE public.estoque_reservas er
SET empresa_id = COALESCE(er.empresa_id, e.empresa_id)
FROM public.estoque e
WHERE er.estoque_id = e.id;

UPDATE public.estoque_reservas er
SET empresa_id = COALESCE(er.empresa_id, p.empresa_id)
FROM public.produtos_opme p
WHERE er.produto_id = p.id AND er.empresa_id IS NULL;

UPDATE public.estoque_reservas er
SET empresa_id = COALESCE(
  er.empresa_id,
  fallback.id
)
FROM (
  SELECT id FROM public.empresas ORDER BY criado_em NULLS LAST LIMIT 1
) AS fallback
WHERE er.empresa_id IS NULL;

ALTER TABLE public.estoque_reservas
  ALTER COLUMN empresa_id SET NOT NULL;

ALTER TABLE public.estoque_reservas
  DROP CONSTRAINT IF EXISTS estoque_reservas_empresa_id_fkey;
ALTER TABLE public.estoque_reservas
  ADD CONSTRAINT estoque_reservas_empresa_id_fkey
  FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_estoque_reservas_empresa
  ON public.estoque_reservas(empresa_id);

-- 1.6 Estoque Lotes ----------------------------------------------------
ALTER TABLE public.estoque_lotes
  ADD COLUMN IF NOT EXISTS empresa_id UUID;

UPDATE public.estoque_lotes el
SET empresa_id = COALESCE(el.empresa_id, p.empresa_id)
FROM public.produtos_opme p
WHERE el.produto_id = p.id;

UPDATE public.estoque_lotes el
SET empresa_id = COALESCE(
  el.empresa_id,
  fallback.id
)
FROM (
  SELECT id FROM public.empresas ORDER BY criado_em NULLS LAST LIMIT 1
) AS fallback
WHERE el.empresa_id IS NULL;

ALTER TABLE public.estoque_lotes
  ALTER COLUMN empresa_id SET NOT NULL;

ALTER TABLE public.estoque_lotes
  DROP CONSTRAINT IF EXISTS estoque_lotes_empresa_id_fkey;
ALTER TABLE public.estoque_lotes
  ADD CONSTRAINT estoque_lotes_empresa_id_fkey
  FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_estoque_lotes_empresa
  ON public.estoque_lotes(empresa_id);

-- 1.7 Estoque Inventários ----------------------------------------------
ALTER TABLE public.estoque_inventarios
  ADD COLUMN IF NOT EXISTS empresa_id UUID;

UPDATE public.estoque_inventarios ei
SET empresa_id = COALESCE(ei.empresa_id, ea.empresa_id)
FROM public.estoque_armazens ea
WHERE ei.armazem_id = ea.id;

UPDATE public.estoque_inventarios ei
SET empresa_id = COALESCE(
  ei.empresa_id,
  fallback.id
)
FROM (
  SELECT id FROM public.empresas ORDER BY criado_em NULLS LAST LIMIT 1
) AS fallback
WHERE ei.empresa_id IS NULL;

ALTER TABLE public.estoque_inventarios
  ALTER COLUMN empresa_id SET NOT NULL;

ALTER TABLE public.estoque_inventarios
  DROP CONSTRAINT IF EXISTS estoque_inventarios_empresa_id_fkey;
ALTER TABLE public.estoque_inventarios
  ADD CONSTRAINT estoque_inventarios_empresa_id_fkey
  FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_estoque_inventarios_empresa
  ON public.estoque_inventarios(empresa_id);

-- 1.8 Estoque Inventários Itens ----------------------------------------
ALTER TABLE public.estoque_inventarios_itens
  ADD COLUMN IF NOT EXISTS empresa_id UUID;

UPDATE public.estoque_inventarios_itens eii
SET empresa_id = COALESCE(eii.empresa_id, ei.empresa_id)
FROM public.estoque_inventarios ei
WHERE eii.inventario_id = ei.id;

UPDATE public.estoque_inventarios_itens eii
SET empresa_id = COALESCE(
  eii.empresa_id,
  fallback.id
)
FROM (
  SELECT id FROM public.empresas ORDER BY criado_em NULLS LAST LIMIT 1
) AS fallback
WHERE eii.empresa_id IS NULL;

ALTER TABLE public.estoque_inventarios_itens
  ALTER COLUMN empresa_id SET NOT NULL;

ALTER TABLE public.estoque_inventarios_itens
  DROP CONSTRAINT IF EXISTS estoque_inventarios_itens_empresa_id_fkey;
ALTER TABLE public.estoque_inventarios_itens
  ADD CONSTRAINT estoque_inventarios_itens_empresa_id_fkey
  FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_estoque_inventarios_itens_empresa
  ON public.estoque_inventarios_itens(empresa_id);

-- 1.9 Estoque Alertas --------------------------------------------------
ALTER TABLE public.estoque_alertas
  ADD COLUMN IF NOT EXISTS empresa_id UUID;

UPDATE public.estoque_alertas ea
SET empresa_id = COALESCE(ea.empresa_id, p.empresa_id)
FROM public.produtos_opme p
WHERE ea.produto_id = p.id;

UPDATE public.estoque_alertas ea
SET empresa_id = COALESCE(
  ea.empresa_id,
  fallback.id
)
FROM (
  SELECT id FROM public.empresas ORDER BY criado_em NULLS LAST LIMIT 1
) AS fallback
WHERE ea.empresa_id IS NULL;

ALTER TABLE public.estoque_alertas
  ALTER COLUMN empresa_id SET NOT NULL;

ALTER TABLE public.estoque_alertas
  DROP CONSTRAINT IF EXISTS estoque_alertas_empresa_id_fkey;
ALTER TABLE public.estoque_alertas
  ADD CONSTRAINT estoque_alertas_empresa_id_fkey
  FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_estoque_alertas_empresa
  ON public.estoque_alertas(empresa_id);

-- =====================================================================
-- 2) Atualização das Policies RLS (estoque + derivados)
-- =====================================================================

-- 2.1 Estoque Armazéns -------------------------------------------------
ALTER TABLE public.estoque_armazens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS estoque_armazens_select ON public.estoque_armazens;
CREATE POLICY estoque_armazens_select
ON public.estoque_armazens
FOR SELECT
USING (empresa_id = public.current_empresa_id());

DROP POLICY IF EXISTS estoque_armazens_insert ON public.estoque_armazens;
CREATE POLICY estoque_armazens_insert
ON public.estoque_armazens
FOR INSERT
WITH CHECK (
  empresa_id = public.current_empresa_id()
  AND public.current_user_role() IN ('Admin','Super Admin','Gerente')
);

DROP POLICY IF EXISTS estoque_armazens_update ON public.estoque_armazens;
CREATE POLICY estoque_armazens_update
ON public.estoque_armazens
FOR UPDATE
USING (empresa_id = public.current_empresa_id())
WITH CHECK (
  empresa_id = public.current_empresa_id()
  AND public.current_user_role() IN ('Admin','Super Admin','Gerente')
);

DROP POLICY IF EXISTS estoque_armazens_delete ON public.estoque_armazens;
CREATE POLICY estoque_armazens_delete
ON public.estoque_armazens
FOR DELETE
USING (
  empresa_id = public.current_empresa_id()
  AND public.is_admin()
);

-- 2.2 Estoque Localizações ---------------------------------------------
ALTER TABLE public.estoque_localizacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS estoque_localizacoes_select ON public.estoque_localizacoes;
CREATE POLICY estoque_localizacoes_select
ON public.estoque_localizacoes
FOR SELECT
USING (empresa_id = public.current_empresa_id());

DROP POLICY IF EXISTS estoque_localizacoes_insert ON public.estoque_localizacoes;
CREATE POLICY estoque_localizacoes_insert
ON public.estoque_localizacoes
FOR INSERT
WITH CHECK (
  empresa_id = public.current_empresa_id()
  AND public.current_user_role() IN ('Admin','Super Admin','Gerente')
);

DROP POLICY IF EXISTS estoque_localizacoes_update ON public.estoque_localizacoes;
CREATE POLICY estoque_localizacoes_update
ON public.estoque_localizacoes
FOR UPDATE
USING (empresa_id = public.current_empresa_id())
WITH CHECK (
  empresa_id = public.current_empresa_id()
  AND public.current_user_role() IN ('Admin','Super Admin','Gerente')
);

DROP POLICY IF EXISTS estoque_localizacoes_delete ON public.estoque_localizacoes;
CREATE POLICY estoque_localizacoes_delete
ON public.estoque_localizacoes
FOR DELETE
USING (
  empresa_id = public.current_empresa_id()
  AND public.is_admin()
);

-- 2.3 Estoque ----------------------------------------------------------
ALTER TABLE public.estoque ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS estoque_select ON public.estoque;
CREATE POLICY estoque_select
ON public.estoque
FOR SELECT
USING (empresa_id = public.current_empresa_id());

DROP POLICY IF EXISTS estoque_insert ON public.estoque;
CREATE POLICY estoque_insert
ON public.estoque
FOR INSERT
WITH CHECK (
  empresa_id = public.current_empresa_id()
  AND public.current_user_role() IN ('Admin','Super Admin','Gerente')
);

DROP POLICY IF EXISTS estoque_update ON public.estoque;
CREATE POLICY estoque_update
ON public.estoque
FOR UPDATE
USING (empresa_id = public.current_empresa_id())
WITH CHECK (
  empresa_id = public.current_empresa_id()
  AND public.current_user_role() IN ('Admin','Super Admin','Gerente')
);

DROP POLICY IF EXISTS estoque_delete ON public.estoque;
CREATE POLICY estoque_delete
ON public.estoque
FOR DELETE
USING (
  empresa_id = public.current_empresa_id()
  AND public.is_admin()
);

-- 2.4 Estoque Movimentações --------------------------------------------
ALTER TABLE public.estoque_movimentacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS estoque_movimentacoes_select ON public.estoque_movimentacoes;
CREATE POLICY estoque_movimentacoes_select
ON public.estoque_movimentacoes
FOR SELECT
USING (empresa_id = public.current_empresa_id());

DROP POLICY IF EXISTS estoque_movimentacoes_insert ON public.estoque_movimentacoes;
CREATE POLICY estoque_movimentacoes_insert
ON public.estoque_movimentacoes
FOR INSERT
WITH CHECK (
  empresa_id = public.current_empresa_id()
  AND public.current_user_role() IN ('Admin','Super Admin','Gerente')
);

DROP POLICY IF EXISTS estoque_movimentacoes_update ON public.estoque_movimentacoes;
CREATE POLICY estoque_movimentacoes_update
ON public.estoque_movimentacoes
FOR UPDATE
USING (empresa_id = public.current_empresa_id())
WITH CHECK (
  empresa_id = public.current_empresa_id()
  AND public.current_user_role() IN ('Admin','Super Admin','Gerente')
);

DROP POLICY IF EXISTS estoque_movimentacoes_delete ON public.estoque_movimentacoes;
CREATE POLICY estoque_movimentacoes_delete
ON public.estoque_movimentacoes
FOR DELETE
USING (
  empresa_id = public.current_empresa_id()
  AND public.is_admin()
);

-- 2.5 Estoque Reservas -------------------------------------------------
ALTER TABLE public.estoque_reservas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS estoque_reservas_select ON public.estoque_reservas;
CREATE POLICY estoque_reservas_select
ON public.estoque_reservas
FOR SELECT
USING (empresa_id = public.current_empresa_id());

DROP POLICY IF EXISTS estoque_reservas_insert ON public.estoque_reservas;
CREATE POLICY estoque_reservas_insert
ON public.estoque_reservas
FOR INSERT
WITH CHECK (
  empresa_id = public.current_empresa_id()
  AND public.current_user_role() IN ('Admin','Super Admin','Gerente','Coordenador')
);

DROP POLICY IF EXISTS estoque_reservas_update ON public.estoque_reservas;
CREATE POLICY estoque_reservas_update
ON public.estoque_reservas
FOR UPDATE
USING (empresa_id = public.current_empresa_id())
WITH CHECK (
  empresa_id = public.current_empresa_id()
  AND public.current_user_role() IN ('Admin','Super Admin','Gerente','Coordenador')
);

DROP POLICY IF EXISTS estoque_reservas_delete ON public.estoque_reservas;
CREATE POLICY estoque_reservas_delete
ON public.estoque_reservas
FOR DELETE
USING (
  empresa_id = public.current_empresa_id()
  AND public.is_admin()
);

-- 2.6 Estoque Lotes ----------------------------------------------------
ALTER TABLE public.estoque_lotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS estoque_lotes_select ON public.estoque_lotes;
CREATE POLICY estoque_lotes_select
ON public.estoque_lotes
FOR SELECT
USING (empresa_id = public.current_empresa_id());

DROP POLICY IF EXISTS estoque_lotes_insert ON public.estoque_lotes;
CREATE POLICY estoque_lotes_insert
ON public.estoque_lotes
FOR INSERT
WITH CHECK (
  empresa_id = public.current_empresa_id()
  AND public.current_user_role() IN ('Admin','Super Admin','Gerente')
);

DROP POLICY IF EXISTS estoque_lotes_update ON public.estoque_lotes;
CREATE POLICY estoque_lotes_update
ON public.estoque_lotes
FOR UPDATE
USING (empresa_id = public.current_empresa_id())
WITH CHECK (
  empresa_id = public.current_empresa_id()
  AND public.current_user_role() IN ('Admin','Super Admin','Gerente')
);

DROP POLICY IF EXISTS estoque_lotes_delete ON public.estoque_lotes;
CREATE POLICY estoque_lotes_delete
ON public.estoque_lotes
FOR DELETE
USING (
  empresa_id = public.current_empresa_id()
  AND public.is_admin()
);

-- 2.7 Estoque Inventários ----------------------------------------------
ALTER TABLE public.estoque_inventarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS estoque_inventarios_select ON public.estoque_inventarios;
CREATE POLICY estoque_inventarios_select
ON public.estoque_inventarios
FOR SELECT
USING (empresa_id = public.current_empresa_id());

DROP POLICY IF EXISTS estoque_inventarios_insert ON public.estoque_inventarios;
CREATE POLICY estoque_inventarios_insert
ON public.estoque_inventarios
FOR INSERT
WITH CHECK (
  empresa_id = public.current_empresa_id()
  AND public.current_user_role() IN ('Admin','Super Admin','Gerente','Coordenador')
);

DROP POLICY IF EXISTS estoque_inventarios_update ON public.estoque_inventarios;
CREATE POLICY estoque_inventarios_update
ON public.estoque_inventarios
FOR UPDATE
USING (empresa_id = public.current_empresa_id())
WITH CHECK (
  empresa_id = public.current_empresa_id()
  AND public.current_user_role() IN ('Admin','Super Admin','Gerente','Coordenador')
);

DROP POLICY IF EXISTS estoque_inventarios_delete ON public.estoque_inventarios;
CREATE POLICY estoque_inventarios_delete
ON public.estoque_inventarios
FOR DELETE
USING (
  empresa_id = public.current_empresa_id()
  AND public.is_admin()
);

-- 2.8 Estoque Inventários Itens ----------------------------------------
ALTER TABLE public.estoque_inventarios_itens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS estoque_inventarios_itens_select ON public.estoque_inventarios_itens;
CREATE POLICY estoque_inventarios_itens_select
ON public.estoque_inventarios_itens
FOR SELECT
USING (empresa_id = public.current_empresa_id());

DROP POLICY IF EXISTS estoque_inventarios_itens_insert ON public.estoque_inventarios_itens;
CREATE POLICY estoque_inventarios_itens_insert
ON public.estoque_inventarios_itens
FOR INSERT
WITH CHECK (empresa_id = public.current_empresa_id());

DROP POLICY IF EXISTS estoque_inventarios_itens_update ON public.estoque_inventarios_itens;
CREATE POLICY estoque_inventarios_itens_update
ON public.estoque_inventarios_itens
FOR UPDATE
USING (empresa_id = public.current_empresa_id())
WITH CHECK (empresa_id = public.current_empresa_id());

DROP POLICY IF EXISTS estoque_inventarios_itens_delete ON public.estoque_inventarios_itens;
CREATE POLICY estoque_inventarios_itens_delete
ON public.estoque_inventarios_itens
FOR DELETE
USING (empresa_id = public.current_empresa_id());

-- 2.9 Estoque Alertas --------------------------------------------------
ALTER TABLE public.estoque_alertas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS estoque_alertas_select ON public.estoque_alertas;
CREATE POLICY estoque_alertas_select
ON public.estoque_alertas
FOR SELECT
USING (empresa_id = public.current_empresa_id());

DROP POLICY IF EXISTS estoque_alertas_insert ON public.estoque_alertas;
CREATE POLICY estoque_alertas_insert
ON public.estoque_alertas
FOR INSERT
WITH CHECK (empresa_id = public.current_empresa_id());

DROP POLICY IF EXISTS estoque_alertas_update ON public.estoque_alertas;
CREATE POLICY estoque_alertas_update
ON public.estoque_alertas
FOR UPDATE
USING (empresa_id = public.current_empresa_id())
WITH CHECK (empresa_id = public.current_empresa_id());

DROP POLICY IF EXISTS estoque_alertas_delete ON public.estoque_alertas;
CREATE POLICY estoque_alertas_delete
ON public.estoque_alertas
FOR DELETE
USING (
  empresa_id = public.current_empresa_id()
  AND public.is_admin()
);

-- =====================================================================
-- 3) Função get_dashboard_kpis() - ajustar coluna m.status
-- =====================================================================
CREATE OR REPLACE FUNCTION public.get_dashboard_kpis()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  v_sistema_status := 98.0;

  SELECT COUNT(DISTINCT m.id)
  INTO v_medicos_ativos
  FROM public.medicos m
  INNER JOIN public.cirurgias c ON c.medico_id = m.id
  WHERE c.data_cirurgia >= CURRENT_DATE - INTERVAL '30 days'
    AND m.status = 'ativo';

  SELECT COUNT(*)
  INTO v_produtos_opme
  FROM public.produtos_opme
  WHERE ativo = true;

  SELECT COUNT(*)
  INTO v_pedidos_urgentes
  FROM public.cirurgias c
  WHERE c.data_cirurgia BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '48 hours'
    AND c.status IN ('pendente', 'confirmada')
    AND NOT EXISTS (
      SELECT 1 FROM public.cirurgia_materiais cm
      WHERE cm.cirurgia_id = c.id
        AND cm.status = 'separado'
    );

  SELECT COALESCE(SUM(valor_total), 0)
  INTO v_faturamento_mensal
  FROM public.faturas
  WHERE status IN ('emitida', 'autorizada', 'paga')
    AND EXTRACT(MONTH FROM data_emissao) = EXTRACT(MONTH FROM CURRENT_DATE)
    AND EXTRACT(YEAR FROM data_emissao) = EXTRACT(YEAR FROM CURRENT_DATE);

  v_faturamento_media_diaria := NULLIF(EXTRACT(DAY FROM CURRENT_DATE), 0);
  IF v_faturamento_media_diaria IS NULL THEN
    v_faturamento_media_diaria := v_faturamento_mensal;
  ELSE
    v_faturamento_media_diaria := v_faturamento_mensal / v_faturamento_media_diaria;
  END IF;

  SELECT COUNT(DISTINCT h.id), COUNT(DISTINCT h.cidade)
  INTO v_hospitais_ativos, v_cidades
  FROM public.hospitais h
  INNER JOIN public.cirurgias c ON c.hospital_id = h.id
  WHERE c.data_cirurgia >= CURRENT_DATE - INTERVAL '90 days'
    AND h.status = 'ativo';

  SELECT COUNT(*)
  INTO v_estoque_critico
  FROM public.estoque e
  INNER JOIN public.produtos_opme p ON p.id = e.produto_id
  WHERE e.quantidade_disponivel < COALESCE(p.ponto_reposicao, 10)
    AND e.status = 'disponivel';

  SELECT COALESCE(
    (COUNT(*) FILTER (WHERE data_entrega <= data_prevista_entrega) * 100.0 /
    NULLIF(COUNT(*), 0)),
    0
  )
  INTO v_logistica_percentual
  FROM public.entregas
  WHERE data_entrega >= CURRENT_DATE - INTERVAL '30 days'
    AND status = 'entregue';

  v_performance_ia := 97.3;

  v_result := json_build_object(
    'kpis', json_build_array(
      json_build_object('id', 'sistema-status', 'label', 'Sistema Status', 'value', v_sistema_status || '%', 'trend', 2.3, 'unit', '%'),
      json_build_object('id', 'medicos-ativos', 'label', 'Médicos Ativos', 'value', v_medicos_ativos, 'trend', 12.5, 'unit', 'médicos'),
      json_build_object('id', 'produtos-opme', 'label', 'Produtos OPME', 'value', CASE WHEN v_produtos_opme >= 1000 THEN ROUND(v_produtos_opme / 1000.0, 1) || 'K' ELSE v_produtos_opme::text END, 'trend', 5.2, 'unit', 'produtos'),
      json_build_object('id', 'pedidos-urgentes', 'label', 'Pedidos Urgentes', 'value', v_pedidos_urgentes, 'trend', -8.1, 'unit', 'pedidos'),
      json_build_object('id', 'faturamento-mensal', 'label', 'Faturamento Mensal',
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
      json_build_object('id', 'distribuicao-geografica', 'label', 'Distribuição Geográfica', 'value', v_hospitais_ativos, 'trend', 8.7, 'unit', 'hospitais', 'metadata', json_build_object('cities', v_cidades)),
      json_build_object('id', 'estoque-critico', 'label', 'Estoque Crítico', 'value', v_estoque_critico, 'trend', -42.3, 'unit', 'produtos'),
      json_build_object('id', 'logistica', 'label', 'Logística', 'value', ROUND(v_logistica_percentual, 1) || '%', 'trend', 3.8, 'unit', '%', 'metadata', json_build_object('subtitle', 'entregas no prazo')),
      json_build_object('id', 'performance-ia', 'label', 'Performance IA', 'value', v_performance_ia || '%', 'trend', 1.2, 'unit', '%', 'metadata', json_build_object('subtitle', 'precisão do sistema'))
    ),
    'lastUpdate', CURRENT_TIMESTAMP
  );

  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION public.get_dashboard_kpis() IS 'Retorna KPIs do dashboard principal com dados consistentes de médicos ativos.';

-- =====================================================================
-- 4) Função calcular_score_global_abbott()
-- =====================================================================
CREATE OR REPLACE FUNCTION public.calcular_score_global_abbott()
RETURNS TABLE (
  empresa_id UUID,
  score NUMERIC,
  nivel TEXT,
  detalhes JSONB,
  atualizado_em TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    COALESCE((abbott ->> 'score')::NUMERIC, 0) AS score,
    COALESCE(abbott ->> 'nivel', 'N/D') AS nivel,
    abbott,
    NOW() AS atualizado_em
  FROM public.empresas e
  CROSS JOIN LATERAL public.calcular_abbott_score(e.id) AS abbott;
END;
$$;

COMMENT ON FUNCTION public.calcular_score_global_abbott IS 'Consolida o score Abbott de todas as empresas utilizando calcular_abbott_score().';

COMMIT;




-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Migração: 20251118000229_enable_api_credentials_rls.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Enable RLS and policies for api_credentials & audit trail
-- Keeps client-side access via policies scoped to empresa_id

-- 1) Função para garantir empresa/perfil ao inserir/atualizar -----------------
CREATE OR REPLACE FUNCTION public.set_api_credentials_tenant()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_empresa UUID;
BEGIN
  v_empresa := public.current_empresa_id();

  IF v_empresa IS NULL THEN
    RAISE EXCEPTION 'Usuário autenticado sem empresa vinculada';
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.empresa_id IS NULL THEN
      NEW.empresa_id := v_empresa;
    ELSIF NEW.empresa_id <> v_empresa THEN
      RAISE EXCEPTION 'Não é permitido gravar credenciais de outra empresa';
    END IF;

    IF NEW.criado_por IS NULL THEN
      NEW.criado_por := auth.uid();
    END IF;
  ELSE
    IF NEW.empresa_id <> OLD.empresa_id THEN
      RAISE EXCEPTION 'empresa_id não pode ser alterado';
    END IF;
  END IF;

  NEW.atualizado_por := auth.uid();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_api_credentials_tenant ON public.api_credentials;
CREATE TRIGGER set_api_credentials_tenant
BEFORE INSERT OR UPDATE ON public.api_credentials
FOR EACH ROW
EXECUTE FUNCTION public.set_api_credentials_tenant();

-- 2) Ativar RLS ---------------------------------------------------------------
ALTER TABLE public.api_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_credentials_audit ENABLE ROW LEVEL SECURITY;

-- 3) Policies para api_credentials --------------------------------------------
DROP POLICY IF EXISTS api_credentials_service_role ON public.api_credentials;
CREATE POLICY api_credentials_service_role
ON public.api_credentials
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role')
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

DROP POLICY IF EXISTS api_credentials_select ON public.api_credentials;
CREATE POLICY api_credentials_select
ON public.api_credentials
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND empresa_id = public.current_empresa_id()
);

DROP POLICY IF EXISTS api_credentials_insert ON public.api_credentials;
CREATE POLICY api_credentials_insert
ON public.api_credentials
FOR INSERT
WITH CHECK (
  empresa_id = public.current_empresa_id()
  AND upper(public.current_user_role()) IN ('ADMIN', 'SUPER ADMIN', 'FINANCEIRO', 'FINANCE MANAGER')
);

DROP POLICY IF EXISTS api_credentials_update ON public.api_credentials;
CREATE POLICY api_credentials_update
ON public.api_credentials
FOR UPDATE
USING (empresa_id = public.current_empresa_id())
WITH CHECK (
  empresa_id = public.current_empresa_id()
  AND upper(public.current_user_role()) IN ('ADMIN', 'SUPER ADMIN', 'FINANCEIRO', 'FINANCE MANAGER')
);

DROP POLICY IF EXISTS api_credentials_delete ON public.api_credentials;
CREATE POLICY api_credentials_delete
ON public.api_credentials
FOR DELETE
USING (
  empresa_id = public.current_empresa_id()
  AND public.is_admin()
);

-- 4) Policies para api_credentials_audit (somente service role) ---------------
DROP POLICY IF EXISTS api_credentials_audit_service_role ON public.api_credentials_audit;
CREATE POLICY api_credentials_audit_service_role
ON public.api_credentials_audit
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role')
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

COMMENT ON FUNCTION public.set_api_credentials_tenant IS
  'Garante empresa_id/criado_por/atualizado_por com base no usuário autenticado';




-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Migração: CREATE_STORAGE_BUCKETS.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================================================
-- CRIAR STORAGE BUCKETS - ICARUS
-- ============================================================================
-- Projeto: gvbkviozlhxorjoavmky
-- Data: 2025-11-17
-- ============================================================================
-- 
-- INSTRUÇÕES:
-- 1. Acesse: https://supabase.com/dashboard/project/gvbkviozlhxorjoavmky/sql
-- 2. Copie e cole este SQL
-- 3. Execute
-- 4. Verifique em: Storage → Buckets
-- ============================================================================

-- ============================================
-- BUCKET 1: documentos_cirurgias
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documentos_cirurgias',
  'documentos_cirurgias',
  FALSE, -- Privado
  10485760, -- 10MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================
-- BUCKET 2: documentos_fiscais
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documentos_fiscais',
  'documentos_fiscais',
  FALSE, -- Privado
  52428800, -- 50MB
  ARRAY['application/pdf', 'application/xml', 'text/xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================
-- BUCKET 3: anexos_produtos
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'anexos_produtos',
  'anexos_produtos',
  FALSE, -- Privado
  5242880, -- 5MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================
-- BUCKET 4: avatares
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatares',
  'avatares',
  TRUE, -- Público
  1048576, -- 1MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================
-- BUCKET 5: icarus_new
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'icarus_new',
  'icarus_new',
  FALSE, -- Privado
  52428800, -- 50MB
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
-- VALIDAR CRIAÇÃO
-- ============================================
SELECT 
  id,
  name,
  public,
  file_size_limit,
  array_length(allowed_mime_types, 1) as mime_types_count,
  created_at
FROM storage.buckets
ORDER BY created_at DESC;

-- ============================================
-- RESULTADO ESPERADO: 5 buckets
-- ============================================
-- documentos_cirurgias | FALSE | 10MB
-- documentos_fiscais   | FALSE | 50MB
-- anexos_produtos      | FALSE | 5MB
-- avatares             | TRUE  | 1MB
-- icarus_new           | FALSE | 50MB
-- ============================================




