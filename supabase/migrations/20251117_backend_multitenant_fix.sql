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

