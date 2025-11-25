-- ============================================================================
-- 2025-11-23 - Extensões para customização do frontend (multi-dispositivo, seeds e observabilidade)
-- ============================================================================

SET search_path = public;

-- Sentinel usado para módulos globais (disponíveis para todas as empresas)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_settings WHERE name = 'app.configuracoes_uuid_nil') THEN
    PERFORM set_config('app.configuracoes_uuid_nil', '00000000-0000-0000-0000-000000000000', false);
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Ajuste: coluna dispositivo em configuracoes_usuarios
-- ---------------------------------------------------------------------------
ALTER TABLE public.configuracoes_usuarios
  ADD COLUMN IF NOT EXISTS dispositivo text NOT NULL DEFAULT 'desktop'
    CHECK (dispositivo IN ('desktop', 'mobile', 'tablet'));

ALTER TABLE public.configuracoes_usuarios
  DROP CONSTRAINT IF EXISTS configuracoes_usuarios_user_id_empresa_id_modulo_chave_submodulo_chave_norm_key;

ALTER TABLE public.configuracoes_usuarios
  ADD CONSTRAINT configuracoes_usuarios_preferencias_unicas
  UNIQUE (user_id, empresa_id, modulo_chave, submodulo_chave_norm, dispositivo);

-- ---------------------------------------------------------------------------
-- Observabilidade: tabela de eventos
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.configuracoes_eventos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL,
  user_id uuid,
  modulo_chave text NOT NULL,
  submodulo_chave text,
  dispositivo text NOT NULL DEFAULT 'desktop' CHECK (dispositivo IN ('desktop','mobile','tablet')),
  acao text NOT NULL,
  detalhes jsonb NOT NULL DEFAULT '{}'::jsonb,
  criado_em timestamptz NOT NULL DEFAULT NOW(),
  criado_por uuid
);

CREATE INDEX IF NOT EXISTS configuracoes_eventos_empresa_idx
  ON public.configuracoes_eventos (empresa_id, criado_em DESC);

CREATE TRIGGER configuracoes_eventos_audit_trg
BEFORE INSERT OR UPDATE ON public.configuracoes_eventos
FOR EACH ROW EXECUTE FUNCTION public.aplicar_auditoria_configuracoes();

ALTER TABLE public.configuracoes_eventos ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'configuracoes_eventos' AND policyname = 'configuracoes_eventos_usuario'
  ) THEN
    CREATE POLICY configuracoes_eventos_usuario
      ON public.configuracoes_eventos
      FOR SELECT
      USING (user_id = auth.uid() AND empresa_id = public.current_empresa());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'configuracoes_eventos' AND policyname = 'configuracoes_eventos_usuario_write'
  ) THEN
    CREATE POLICY configuracoes_eventos_usuario_write
      ON public.configuracoes_eventos
      FOR INSERT
      WITH CHECK (user_id = auth.uid() AND empresa_id = public.current_empresa());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'configuracoes_eventos' AND policyname = 'configuracoes_eventos_service_role'
  ) THEN
    CREATE POLICY configuracoes_eventos_service_role
      ON public.configuracoes_eventos
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Atualização das policies para módulos/submódulos/ferramentas (suporte global)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS configuracoes_modulos_empresa ON public.configuracoes_modulos;
CREATE POLICY configuracoes_modulos_empresa
  ON public.configuracoes_modulos
  FOR ALL
  USING (empresa_id = public.current_empresa() OR empresa_id = '00000000-0000-0000-0000-000000000000'::uuid)
  WITH CHECK (empresa_id = public.current_empresa() OR empresa_id = '00000000-0000-0000-0000-000000000000'::uuid);

DROP POLICY IF EXISTS configuracoes_submodulos_empresa ON public.configuracoes_submodulos;
CREATE POLICY configuracoes_submodulos_empresa
  ON public.configuracoes_submodulos
  FOR ALL
  USING (empresa_id = public.current_empresa() OR empresa_id = '00000000-0000-0000-0000-000000000000'::uuid)
  WITH CHECK (empresa_id = public.current_empresa() OR empresa_id = '00000000-0000-0000-0000-000000000000'::uuid);

DROP POLICY IF EXISTS configuracoes_ferramentas_empresa ON public.configuracoes_ferramentas;
CREATE POLICY configuracoes_ferramentas_empresa
  ON public.configuracoes_ferramentas
  FOR ALL
  USING (empresa_id = public.current_empresa() OR empresa_id = '00000000-0000-0000-0000-000000000000'::uuid)
  WITH CHECK (empresa_id = public.current_empresa() OR empresa_id = '00000000-0000-0000-0000-000000000000'::uuid);

-- ---------------------------------------------------------------------------
-- Seeds globais (empresa_id = uuid_nil)
-- ---------------------------------------------------------------------------
WITH uuid_nil AS (SELECT '00000000-0000-0000-0000-000000000000'::uuid AS id)
INSERT INTO public.configuracoes_modulos (empresa_id, chave, nome, descricao, icone, metadados, ativo, ordem)
SELECT uuid_nil.id, chave, nome, descricao, icone, metadados::jsonb, ativo, ordem
FROM (
  VALUES
    ('relatorios', 'Relatórios', 'Painéis e dashboards operacionais', 'chart-bar', '{}'::json, true, 1),
    ('estoque', 'Estoque', 'Controle de movimentações e alertas', 'boxes', '{}'::json, true, 2),
    ('financeiro', 'Financeiro', 'Fluxo de caixa, contas e KPIs', 'bank', '{}'::json, true, 3)
) AS seed(chave, nome, descricao, icone, metadados, ativo, ordem),
uuid_nil
ON CONFLICT (empresa_id, chave_normalizada) DO NOTHING;

WITH uuid_nil AS (SELECT '00000000-0000-0000-0000-000000000000'::uuid AS empresa),
modulos AS (
  SELECT chave_normalizada, id
  FROM public.configuracoes_modulos
  WHERE empresa_id = '00000000-0000-0000-0000-000000000000'::uuid
),
seed AS (
  SELECT *
  FROM (
    VALUES
      ('relatorios', 'visao_gerencial', 'Visão Gerencial', 'KPIs consolidados', 1),
      ('relatorios', 'auditoria', 'Auditoria', 'Alertas de conformidade', 2),
      ('estoque', 'movimentacoes', 'Movimentações', 'Entradas e saídas', 1),
      ('estoque', 'alertas', 'Alertas', 'Estoque crítico e vencimentos', 2),
      ('financeiro', 'fluxo_caixa', 'Fluxo de Caixa', 'Entradas/saídas diárias', 1),
      ('financeiro', 'contas', 'Contas', 'Payables & Receivables', 2)
  ) AS t(modulo_chave, chave, nome, descricao, ordem)
)
INSERT INTO public.configuracoes_submodulos (empresa_id, modulo_id, chave, nome, descricao, ordem, ativo)
SELECT uuid_nil.empresa, modulos.id, seed.chave, seed.nome, seed.descricao, seed.ordem, true
FROM uuid_nil
JOIN seed ON true
JOIN modulos ON modulos.chave_normalizada = seed.modulo_chave
ON CONFLICT (empresa_id, modulo_id, chave_normalizada) DO NOTHING;

WITH uuid_nil AS (SELECT '00000000-0000-0000-0000-000000000000'::uuid AS empresa),
modulos AS (
  SELECT chave_normalizada, id
  FROM public.configuracoes_modulos
  WHERE empresa_id = '00000000-0000-0000-0000-000000000000'::uuid
),
submodulos AS (
  SELECT s.id, s.chave_normalizada, s.modulo_id, m.chave_normalizada AS modulo_chave
  FROM public.configuracoes_submodulos s
  JOIN modulos m ON m.id = s.modulo_id
  WHERE s.empresa_id = '00000000-0000-0000-0000-000000000000'::uuid
),
seed AS (
  SELECT *
  FROM (
    VALUES
      ('relatorios', 'visao_gerencial', 'exportar_csv', 'Exportar CSV', 'download', 'acao', '{"requires":"admin"}'),
      ('relatorios', 'auditoria', 'filtro_avancado', 'Filtro Avançado', 'filter', 'filtro', '{"preset":"risco"}'),
      ('estoque', 'movimentacoes', 'iniciar_inventario', 'Iniciar Inventário', 'clipboard', 'acao', '{"workflow":"inventario"}'),
      ('financeiro', 'fluxo_caixa', 'comparar_periodos', 'Comparar Períodos', 'arrows-left-right', 'analise', '{"default":"mensal"}')
  ) AS t(modulo_chave, submodulo_chave, chave, nome, icone, tipo, parametros)
)
INSERT INTO public.configuracoes_ferramentas (
  empresa_id, modulo_id, submodulo_id, chave, nome, icone, tipo, parametros, ativo
)
SELECT
  uuid_nil.empresa,
  modulos.id,
  submodulos.id,
  seed.chave,
  seed.nome,
  seed.icone,
  seed.tipo,
  seed.parametros::jsonb,
  true
FROM uuid_nil
JOIN seed ON true
JOIN modulos ON modulos.chave_normalizada = seed.modulo_chave
LEFT JOIN submodulos
  ON submodulos.chave_normalizada = COALESCE(seed.submodulo_chave, '')
  AND submodulos.modulo_chave = seed.modulo_chave
ON CONFLICT (empresa_id, chave_normalizada) DO NOTHING;

