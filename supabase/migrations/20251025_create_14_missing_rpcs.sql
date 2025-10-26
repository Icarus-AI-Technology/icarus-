-- Migration: Implementar 14 RPCs Ausentes
-- Gerado por: Agente 03 - Passo 2
-- Data: 2025-10-25
-- Descrição: Cria 14 RPC functions críticas identificadas como ausentes na auditoria

-- ============================================================================
-- RPC 1: get_cirurgias_mes
-- Descrição: Retorna cirurgias de um determinado mês/ano para uma empresa
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_cirurgias_mes(
  p_empresa_id UUID,
  p_mes INTEGER,
  p_ano INTEGER
)
RETURNS TABLE (
  id UUID,
  numero_cirurgia VARCHAR,
  paciente_nome VARCHAR,
  medico_nome VARCHAR,
  hospital_nome VARCHAR,
  data_cirurgia TIMESTAMP,
  status VARCHAR,
  valor_total DECIMAL
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
    c.valor_total
  FROM public.cirurgias c
  LEFT JOIN public.pacientes p ON c.paciente_id = p.id
  LEFT JOIN public.medicos m ON c.medico_id = m.id
  LEFT JOIN public.hospitais h ON c.hospital_id = h.id
  WHERE c.empresa_id = p_empresa_id
    AND EXTRACT(MONTH FROM c.data_cirurgia) = p_mes
    AND EXTRACT(YEAR FROM c.data_cirurgia) = p_ano
  ORDER BY c.data_cirurgia DESC;
END;
$$;

COMMENT ON FUNCTION public.get_cirurgias_mes IS 'Retorna todas as cirurgias de um mês/ano específico';


-- ============================================================================
-- RPC 2: calcular_comissao
-- Descrição: Calcula comissão de uma cirurgia baseada em regras de negócio
-- ============================================================================
CREATE OR REPLACE FUNCTION public.calcular_comissao(
  p_cirurgia_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cirurgia RECORD;
  v_comissao DECIMAL(10,2);
  v_percentual DECIMAL(5,2);
  v_resultado JSONB;
BEGIN
  -- Buscar dados da cirurgia
  SELECT 
    c.valor_total,
    c.status,
    m.percentual_comissao
  INTO v_cirurgia
  FROM public.cirurgias c
  LEFT JOIN public.medicos m ON c.medico_id = m.id
  WHERE c.id = p_cirurgia_id;

  -- Validações
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'sucesso', false,
      'erro', 'Cirurgia não encontrada'
    );
  END IF;

  IF v_cirurgia.status != 'FINALIZADA' THEN
    RETURN jsonb_build_object(
      'sucesso', false,
      'erro', 'Cirurgia não finalizada'
    );
  END IF;

  -- Calcular comissão (default 5% se não definido)
  v_percentual := COALESCE(v_cirurgia.percentual_comissao, 5.00);
  v_comissao := (v_cirurgia.valor_total * v_percentual) / 100;

  -- Retornar resultado
  v_resultado := jsonb_build_object(
    'sucesso', true,
    'cirurgia_id', p_cirurgia_id,
    'valor_cirurgia', v_cirurgia.valor_total,
    'percentual', v_percentual,
    'comissao', v_comissao
  );

  RETURN v_resultado;
END;
$$;

COMMENT ON FUNCTION public.calcular_comissao IS 'Calcula comissão de médico para uma cirurgia';


-- ============================================================================
-- RPC 3: get_estoque_baixo
-- Descrição: Retorna produtos com estoque abaixo do mínimo
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_estoque_baixo(
  p_empresa_id UUID
)
RETURNS TABLE (
  produto_id UUID,
  codigo VARCHAR,
  nome VARCHAR,
  estoque_atual INTEGER,
  estoque_minimo INTEGER,
  diferenca INTEGER,
  criticidade VARCHAR
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as produto_id,
    p.codigo,
    p.nome,
    COALESCE(e.quantidade, 0)::INTEGER as estoque_atual,
    p.estoque_minimo,
    (p.estoque_minimo - COALESCE(e.quantidade, 0))::INTEGER as diferenca,
    CASE 
      WHEN COALESCE(e.quantidade, 0) = 0 THEN 'CRÍTICO'
      WHEN COALESCE(e.quantidade, 0) < (p.estoque_minimo * 0.5) THEN 'ALTO'
      ELSE 'MÉDIO'
    END as criticidade
  FROM public.produtos p
  LEFT JOIN public.estoque e ON p.id = e.produto_id AND e.empresa_id = p_empresa_id
  WHERE p.empresa_id = p_empresa_id
    AND p.ativo = true
    AND COALESCE(e.quantidade, 0) < p.estoque_minimo
  ORDER BY criticidade DESC, diferenca DESC;
END;
$$;

COMMENT ON FUNCTION public.get_estoque_baixo IS 'Lista produtos com estoque abaixo do mínimo';


-- ============================================================================
-- RPC 4: atualizar_status_cirurgia
-- Descrição: Atualiza status de uma cirurgia com validações
-- ============================================================================
CREATE OR REPLACE FUNCTION public.atualizar_status_cirurgia(
  p_cirurgia_id UUID,
  p_novo_status VARCHAR
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_status_atual VARCHAR;
  v_empresa_id UUID;
BEGIN
  -- Buscar status atual
  SELECT status, empresa_id 
  INTO v_status_atual, v_empresa_id
  FROM public.cirurgias
  WHERE id = p_cirurgia_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'sucesso', false,
      'erro', 'Cirurgia não encontrada'
    );
  END IF;

  -- Validar transição de status
  IF v_status_atual = 'CANCELADA' THEN
    RETURN jsonb_build_object(
      'sucesso', false,
      'erro', 'Não é possível alterar status de cirurgia cancelada'
    );
  END IF;

  IF v_status_atual = 'FINALIZADA' AND p_novo_status != 'CANCELADA' THEN
    RETURN jsonb_build_object(
      'sucesso', false,
      'erro', 'Cirurgia finalizada só pode ser cancelada'
    );
  END IF;

  -- Atualizar status
  UPDATE public.cirurgias
  SET 
    status = p_novo_status,
    atualizado_em = NOW()
  WHERE id = p_cirurgia_id;

  RETURN jsonb_build_object(
    'sucesso', true,
    'cirurgia_id', p_cirurgia_id,
    'status_anterior', v_status_atual,
    'status_novo', p_novo_status
  );
END;
$$;

COMMENT ON FUNCTION public.atualizar_status_cirurgia IS 'Atualiza status de cirurgia com validações de negócio';


-- ============================================================================
-- RPC 5: get_fluxo_caixa_projecao
-- Descrição: Projeta fluxo de caixa para os próximos N dias
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_fluxo_caixa_projecao(
  p_empresa_id UUID,
  p_dias INTEGER DEFAULT 30
)
RETURNS TABLE (
  data DATE,
  entradas DECIMAL,
  saidas DECIMAL,
  saldo_dia DECIMAL,
  saldo_acumulado DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_saldo_inicial DECIMAL;
BEGIN
  -- Buscar saldo atual
  SELECT COALESCE(SUM(valor), 0)
  INTO v_saldo_inicial
  FROM public.fluxo_caixa
  WHERE empresa_id = p_empresa_id
    AND data < CURRENT_DATE;

  RETURN QUERY
  WITH datas AS (
    SELECT generate_series(
      CURRENT_DATE,
      CURRENT_DATE + p_dias,
      '1 day'::interval
    )::DATE as dia
  ),
  movimentos AS (
    SELECT 
      fc.data::DATE as dia,
      SUM(CASE WHEN fc.tipo = 'ENTRADA' THEN fc.valor ELSE 0 END) as entradas,
      SUM(CASE WHEN fc.tipo = 'SAIDA' THEN fc.valor ELSE 0 END) as saidas
    FROM public.fluxo_caixa fc
    WHERE fc.empresa_id = p_empresa_id
      AND fc.data >= CURRENT_DATE
      AND fc.data <= CURRENT_DATE + p_dias
    GROUP BY fc.data::DATE
  )
  SELECT 
    d.dia as data,
    COALESCE(m.entradas, 0) as entradas,
    COALESCE(m.saidas, 0) as saidas,
    COALESCE(m.entradas, 0) - COALESCE(m.saidas, 0) as saldo_dia,
    v_saldo_inicial + SUM(COALESCE(m.entradas, 0) - COALESCE(m.saidas, 0)) 
      OVER (ORDER BY d.dia ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) as saldo_acumulado
  FROM datas d
  LEFT JOIN movimentos m ON d.dia = m.dia
  ORDER BY d.dia;
END;
$$;

COMMENT ON FUNCTION public.get_fluxo_caixa_projecao IS 'Projeta fluxo de caixa para os próximos N dias';


-- ============================================================================
-- RPC 6: get_top_produtos
-- Descrição: Retorna produtos mais vendidos/utilizados
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_top_produtos(
  p_empresa_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  produto_id UUID,
  codigo VARCHAR,
  nome VARCHAR,
  quantidade_total DECIMAL,
  valor_total DECIMAL,
  numero_cirurgias BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as produto_id,
    p.codigo,
    p.nome,
    SUM(ic.quantidade) as quantidade_total,
    SUM(ic.quantidade * ic.valor_unitario) as valor_total,
    COUNT(DISTINCT ic.cirurgia_id) as numero_cirurgias
  FROM public.produtos p
  INNER JOIN public.itens_cirurgia ic ON p.id = ic.produto_id
  INNER JOIN public.cirurgias c ON ic.cirurgia_id = c.id
  WHERE c.empresa_id = p_empresa_id
    AND c.status = 'FINALIZADA'
    AND c.data_cirurgia >= CURRENT_DATE - INTERVAL '90 days'
  GROUP BY p.id, p.codigo, p.nome
  ORDER BY quantidade_total DESC
  LIMIT p_limit;
END;
$$;

COMMENT ON FUNCTION public.get_top_produtos IS 'Retorna top N produtos mais utilizados nos últimos 90 dias';


-- ============================================================================
-- RPC 7: validar_consignacao
-- Descrição: Valida se uma consignação pode ser aprovada
-- ============================================================================
CREATE OR REPLACE FUNCTION public.validar_consignacao(
  p_consignacao_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_consignacao RECORD;
  v_estoque_disponivel INTEGER;
  v_erros TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Buscar dados da consignação
  SELECT *
  INTO v_consignacao
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

