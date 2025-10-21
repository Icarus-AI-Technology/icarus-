#!/usr/bin/env node

/**
 * 📋 AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3 - Planejamento de Migrations
 * 
 * Gera plano de execução baseado na auditoria para corrigir lacunas:
 * - Migrations SQL para tabelas, views, indexes, RLS
 * - Scripts de Edge Functions
 * - Configuração de Storage Buckets
 * - Documentação de implementação
 * 
 * @version 3.0.0
 * @date 2025-10-20
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.join(__dirname, '../..');
const MIGRATIONS_DIR = path.join(PROJECT_ROOT, 'supabase/migrations');
const DOCS_INFRA_DIR = path.join(PROJECT_ROOT, 'docs/infra');
const EDGE_FUNCTIONS_DIR = path.join(PROJECT_ROOT, 'supabase/functions');

// ======================================
// 🧬 TEMPLATES DE MIGRATIONS
// ======================================

const MIGRATION_TEMPLATES = {
  cirurgias_table: `-- Migration: Domínio Cirurgias - Tabelas Principais
-- Gerado por: AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3
-- Data: ${new Date().toISOString()}

-- ======================================
-- ENUMS
-- ======================================

CREATE TYPE status_cirurgia AS ENUM (
  'agendada',
  'confirmada',
  'em_andamento',
  'concluida',
  'cancelada'
);

CREATE TYPE status_item_cirurgia AS ENUM (
  'pendente',
  'separado',
  'entregue',
  'utilizado',
  'devolvido',
  'perdido'
);

-- ======================================
-- TABELAS PRINCIPAIS
-- ======================================

-- Tabela: cirurgias
CREATE TABLE IF NOT EXISTS public.cirurgias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE RESTRICT,
  medico_id UUID NOT NULL REFERENCES public.medicos(id) ON DELETE RESTRICT,
  hospital_id UUID NOT NULL REFERENCES public.hospitais(id) ON DELETE RESTRICT,
  convenio_id UUID REFERENCES public.convenios(id) ON DELETE SET NULL,
  
  -- Dados da cirurgia
  data_agendada TIMESTAMP WITH TIME ZONE NOT NULL,
  duracao_estimada_min INTEGER DEFAULT 60,
  status_cirurgia status_cirurgia NOT NULL DEFAULT 'agendada',
  sala VARCHAR(50),
  observacoes TEXT,
  
  -- Auditoria
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

COMMENT ON TABLE public.cirurgias IS 'Gestão de cirurgias e procedimentos OPME';

-- Tabela: cirurgia_materiais
CREATE TABLE IF NOT EXISTS public.cirurgia_materiais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cirurgia_id UUID NOT NULL REFERENCES public.cirurgias(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES public.materiais(id) ON DELETE RESTRICT,
  
  -- Dados do item
  quantidade DECIMAL(10,2) NOT NULL DEFAULT 1,
  lote VARCHAR(100),
  validade DATE,
  rastreamento_anvisa VARCHAR(200),
  status_item status_item_cirurgia NOT NULL DEFAULT 'pendente',
  
  -- Auditoria
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.cirurgia_materiais IS 'Materiais OPME vinculados a cada cirurgia';

-- Tabela: cirurgia_eventos (timeline)
CREATE TABLE IF NOT EXISTS public.cirurgia_eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cirurgia_id UUID NOT NULL REFERENCES public.cirurgias(id) ON DELETE CASCADE,
  
  -- Evento
  tipo_evento VARCHAR(50) NOT NULL, -- 'criado', 'confirmado', 'kit_separado', 'entregue', 'iniciado', 'finalizado', 'faturado'
  descricao TEXT,
  data_hora TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  usuario_id UUID REFERENCES auth.users(id),
  
  -- Metadados
  metadados JSONB
);

COMMENT ON TABLE public.cirurgia_eventos IS 'Timeline de eventos de cada cirurgia';

-- ======================================
-- ÍNDICES
-- ======================================

CREATE INDEX IF NOT EXISTS cirurgias_empresa_id_data_idx ON public.cirurgias(empresa_id, data_agendada DESC);
CREATE INDEX IF NOT EXISTS cirurgias_status_idx ON public.cirurgias(status_cirurgia);
CREATE INDEX IF NOT EXISTS cirurgias_data_agendada_idx ON public.cirurgias(data_agendada);
CREATE INDEX IF NOT EXISTS cirurgias_medico_id_idx ON public.cirurgias(medico_id);
CREATE INDEX IF NOT EXISTS cirurgias_hospital_id_idx ON public.cirurgias(hospital_id);

CREATE INDEX IF NOT EXISTS cirurgia_materiais_cirurgia_id_idx ON public.cirurgia_materiais(cirurgia_id);
CREATE INDEX IF NOT EXISTS cirurgia_materiais_material_id_idx ON public.cirurgia_materiais(material_id);
CREATE INDEX IF NOT EXISTS cirurgia_materiais_status_idx ON public.cirurgia_materiais(status_item);

CREATE INDEX IF NOT EXISTS cirurgia_eventos_cirurgia_id_idx ON public.cirurgia_eventos(cirurgia_id);
CREATE INDEX IF NOT EXISTS cirurgia_eventos_data_hora_idx ON public.cirurgia_eventos(data_hora DESC);

-- ======================================
-- TRIGGERS
-- ======================================

-- Trigger: updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cirurgias_updated_at BEFORE UPDATE ON public.cirurgias
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cirurgia_materiais_updated_at BEFORE UPDATE ON public.cirurgia_materiais
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger: registrar evento automático ao criar cirurgia
CREATE OR REPLACE FUNCTION create_cirurgia_evento()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.cirurgia_eventos (cirurgia_id, tipo_evento, descricao, usuario_id)
  VALUES (NEW.id, 'criado', 'Cirurgia criada no sistema', NEW.created_by);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_create_cirurgia_evento AFTER INSERT ON public.cirurgias
  FOR EACH ROW EXECUTE FUNCTION create_cirurgia_evento();
`,

  cirurgias_rls: `-- Migration: RLS Policies - Domínio Cirurgias
-- Gerado por: AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3
-- Multi-tenant por empresa_id

-- ======================================
-- HABILITAR RLS
-- ======================================

ALTER TABLE public.cirurgias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cirurgia_materiais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cirurgia_eventos ENABLE ROW LEVEL SECURITY;

-- ======================================
-- POLICIES: cirurgias
-- ======================================

-- SELECT: usuários veem apenas cirurgias da sua empresa
CREATE POLICY cirurgias_select_policy ON public.cirurgias
  FOR SELECT
  USING (
    empresa_id IN (
      SELECT empresa_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- INSERT: apenas coordenadores, gerentes e admins
CREATE POLICY cirurgias_insert_policy ON public.cirurgias
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.empresa_id = cirurgias.empresa_id
        AND p.role IN ('coordenador', 'gerente', 'admin', 'super_admin')
    )
  );

-- UPDATE: mesmo controle do INSERT
CREATE POLICY cirurgias_update_policy ON public.cirurgias
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.empresa_id = cirurgias.empresa_id
        AND p.role IN ('coordenador', 'gerente', 'admin', 'super_admin')
    )
  );

-- DELETE: apenas admins
CREATE POLICY cirurgias_delete_policy ON public.cirurgias
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.empresa_id = cirurgias.empresa_id
        AND p.role IN ('admin', 'super_admin')
    )
  );

-- ======================================
-- POLICIES: cirurgia_materiais
-- ======================================

-- SELECT: via join com cirurgias
CREATE POLICY cirurgia_materiais_select_policy ON public.cirurgia_materiais
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cirurgias c
      WHERE c.id = cirurgia_materiais.cirurgia_id
        AND c.empresa_id IN (
          SELECT empresa_id FROM public.profiles WHERE id = auth.uid()
        )
    )
  );

-- INSERT/UPDATE/DELETE: herdar controle da cirurgia
CREATE POLICY cirurgia_materiais_insert_policy ON public.cirurgia_materiais
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cirurgias c
      INNER JOIN public.profiles p ON p.empresa_id = c.empresa_id
      WHERE c.id = cirurgia_materiais.cirurgia_id
        AND p.id = auth.uid()
        AND p.role IN ('coordenador', 'gerente', 'admin', 'super_admin')
    )
  );

CREATE POLICY cirurgia_materiais_update_policy ON public.cirurgia_materiais
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.cirurgias c
      INNER JOIN public.profiles p ON p.empresa_id = c.empresa_id
      WHERE c.id = cirurgia_materiais.cirurgia_id
        AND p.id = auth.uid()
        AND p.role IN ('coordenador', 'gerente', 'admin', 'super_admin')
    )
  );

CREATE POLICY cirurgia_materiais_delete_policy ON public.cirurgia_materiais
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.cirurgias c
      INNER JOIN public.profiles p ON p.empresa_id = c.empresa_id
      WHERE c.id = cirurgia_materiais.cirurgia_id
        AND p.id = auth.uid()
        AND p.role IN ('admin', 'super_admin')
    )
  );

-- ======================================
-- POLICIES: cirurgia_eventos
-- ======================================

-- SELECT: ler eventos da cirurgia (mesma empresa)
CREATE POLICY cirurgia_eventos_select_policy ON public.cirurgia_eventos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cirurgias c
      WHERE c.id = cirurgia_eventos.cirurgia_id
        AND c.empresa_id IN (
          SELECT empresa_id FROM public.profiles WHERE id = auth.uid()
        )
    )
  );

-- INSERT: qualquer usuário autenticado da empresa pode criar eventos
CREATE POLICY cirurgia_eventos_insert_policy ON public.cirurgia_eventos
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cirurgias c
      INNER JOIN public.profiles p ON p.empresa_id = c.empresa_id
      WHERE c.id = cirurgia_eventos.cirurgia_id
        AND p.id = auth.uid()
    )
  );
`,

  dashboard_views: `-- Migration: Views Dashboard KPIs - Domínio Cirurgias
-- Gerado por: AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3

-- ======================================
-- VIEW MATERIALIZADA: Dashboard KPIs
-- ======================================

CREATE MATERIALIZED VIEW IF NOT EXISTS public.vw_dashboard_kpis AS
SELECT
  c.empresa_id,
  DATE_TRUNC('month', c.data_agendada) AS periodo,
  
  -- Contadores
  COUNT(DISTINCT c.id) AS total_cirurgias,
  COUNT(DISTINCT CASE WHEN c.status_cirurgia = 'concluida' THEN c.id END) AS cirurgias_concluidas,
  COUNT(DISTINCT CASE WHEN c.status_cirurgia = 'cancelada' THEN c.id END) AS cirurgias_canceladas,
  COUNT(DISTINCT c.medico_id) AS medicos_ativos,
  COUNT(DISTINCT c.hospital_id) AS hospitais_ativos,
  
  -- Materiais
  COUNT(DISTINCT cm.material_id) AS materiais_distintos,
  SUM(cm.quantidade) AS total_itens_utilizados,
  
  -- Valores (estimativa)
  SUM(m.custo * cm.quantidade) AS custo_total_estimado,
  SUM(m.preco * cm.quantidade) AS receita_total_estimada,
  SUM((m.preco - m.custo) * cm.quantidade) AS margem_total_estimada,
  
  -- Tempos
  AVG(c.duracao_estimada_min) AS duracao_media_min,
  
  -- Metadados
  NOW() AS refreshed_at
FROM public.cirurgias c
LEFT JOIN public.cirurgia_materiais cm ON cm.cirurgia_id = c.id
LEFT JOIN public.materiais m ON m.id = cm.material_id
GROUP BY c.empresa_id, DATE_TRUNC('month', c.data_agendada);

CREATE UNIQUE INDEX IF NOT EXISTS vw_dashboard_kpis_pkey ON public.vw_dashboard_kpis(empresa_id, periodo);
CREATE INDEX IF NOT EXISTS vw_dashboard_kpis_periodo_idx ON public.vw_dashboard_kpis(periodo DESC);

COMMENT ON MATERIALIZED VIEW public.vw_dashboard_kpis IS 'KPIs agregados por empresa e período (refreshar a cada 15min)';

-- ======================================
-- VIEW: Cirurgias Próximas (7 dias)
-- ======================================

CREATE OR REPLACE VIEW public.vw_cirurgias_proximas AS
SELECT
  c.id,
  c.empresa_id,
  c.data_agendada,
  c.status_cirurgia,
  c.sala,
  c.observacoes,
  
  -- Paciente
  p.nome AS paciente_nome,
  p.cpf AS paciente_cpf,
  
  -- Médico
  m.nome AS medico_nome,
  m.crm AS medico_crm,
  m.especialidade AS medico_especialidade,
  
  -- Hospital
  h.nome AS hospital_nome,
  h.cidade AS hospital_cidade,
  
  -- Convênio
  cv.nome AS convenio_nome,
  
  -- Materiais
  (
    SELECT COUNT(*)
    FROM public.cirurgia_materiais cm
    WHERE cm.cirurgia_id = c.id
  ) AS total_materiais,
  
  (
    SELECT COUNT(*)
    FROM public.cirurgia_materiais cm
    WHERE cm.cirurgia_id = c.id AND cm.status_item = 'separado'
  ) AS materiais_separados
FROM public.cirurgias c
INNER JOIN public.pacientes p ON p.id = c.paciente_id
INNER JOIN public.medicos m ON m.id = c.medico_id
INNER JOIN public.hospitais h ON h.id = c.hospital_id
LEFT JOIN public.convenios cv ON cv.id = c.convenio_id
WHERE c.data_agendada BETWEEN NOW() AND NOW() + INTERVAL '7 days'
  AND c.status_cirurgia NOT IN ('cancelada', 'concluida')
ORDER BY c.data_agendada ASC;

COMMENT ON VIEW public.vw_cirurgias_proximas IS 'Cirurgias agendadas nos próximos 7 dias';

-- ======================================
-- VIEW: Kit Detalhado por Cirurgia
-- ======================================

CREATE OR REPLACE VIEW public.vw_cirurgia_kit_detalhado AS
SELECT
  c.id AS cirurgia_id,
  c.empresa_id,
  c.data_agendada,
  c.status_cirurgia,
  
  -- Material
  cm.id AS item_id,
  cm.quantidade,
  cm.lote,
  cm.validade,
  cm.status_item,
  
  m.codigo_interno AS material_codigo,
  m.descricao AS material_descricao,
  m.registro_anvisa,
  m.fabricante,
  m.custo AS material_custo,
  m.preco AS material_preco,
  
  -- Valores
  (m.custo * cm.quantidade) AS custo_total,
  (m.preco * cm.quantidade) AS preco_total,
  ((m.preco - m.custo) * cm.quantidade) AS margem_total
FROM public.cirurgias c
INNER JOIN public.cirurgia_materiais cm ON cm.cirurgia_id = c.id
INNER JOIN public.materiais m ON m.id = cm.material_id;

COMMENT ON VIEW public.vw_cirurgia_kit_detalhado IS 'Detalhamento completo do kit de materiais por cirurgia';
`,

  dashboard_functions: `-- Migration: Functions RPC - Dashboard KPIs
-- Gerado por: AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3

-- ======================================
-- FUNCTION: get_dashboard_kpis
-- ======================================

CREATE OR REPLACE FUNCTION public.get_dashboard_kpis(
  p_empresa_id UUID,
  p_periodo TEXT DEFAULT 'month' -- 'day', 'week', 'month', 'year'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_result JSON;
  v_data_inicio TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Definir período
  CASE p_periodo
    WHEN 'day' THEN
      v_data_inicio := DATE_TRUNC('day', NOW());
    WHEN 'week' THEN
      v_data_inicio := DATE_TRUNC('week', NOW());
    WHEN 'year' THEN
      v_data_inicio := DATE_TRUNC('year', NOW());
    ELSE -- 'month'
      v_data_inicio := DATE_TRUNC('month', NOW());
  END CASE;

  -- Buscar KPIs
  SELECT json_build_object(
    'periodo', p_periodo,
    'data_inicio', v_data_inicio,
    'data_fim', NOW(),
    'kpis', json_build_object(
      'total_cirurgias', COUNT(DISTINCT c.id),
      'cirurgias_concluidas', COUNT(DISTINCT CASE WHEN c.status_cirurgia = 'concluida' THEN c.id END),
      'cirurgias_em_andamento', COUNT(DISTINCT CASE WHEN c.status_cirurgia = 'em_andamento' THEN c.id END),
      'cirurgias_agendadas', COUNT(DISTINCT CASE WHEN c.status_cirurgia = 'agendada' THEN c.id END),
      'cirurgias_canceladas', COUNT(DISTINCT CASE WHEN c.status_cirurgia = 'cancelada' THEN c.id END),
      'taxa_conclusao', ROUND(
        (COUNT(DISTINCT CASE WHEN c.status_cirurgia = 'concluida' THEN c.id END)::NUMERIC /
        NULLIF(COUNT(DISTINCT c.id), 0) * 100), 2
      ),
      'medicos_ativos', COUNT(DISTINCT c.medico_id),
      'hospitais_ativos', COUNT(DISTINCT c.hospital_id),
      'duracao_media_min', ROUND(AVG(c.duracao_estimada_min), 0)
    )
  ) INTO v_result
  FROM public.cirurgias c
  WHERE c.empresa_id = p_empresa_id
    AND c.data_agendada >= v_data_inicio
    AND c.data_agendada <= NOW();

  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION public.get_dashboard_kpis IS 'Retorna KPIs do dashboard para uma empresa em um período';

-- ======================================
-- FUNCTION: get_agenda_cirurgias
-- ======================================

CREATE OR REPLACE FUNCTION public.get_agenda_cirurgias(
  p_empresa_id UUID,
  p_data_inicio DATE DEFAULT CURRENT_DATE,
  p_data_fim DATE DEFAULT CURRENT_DATE + 7
)
RETURNS TABLE(
  id UUID,
  data_agendada TIMESTAMP WITH TIME ZONE,
  status_cirurgia VARCHAR,
  sala VARCHAR,
  paciente_nome VARCHAR,
  medico_nome VARCHAR,
  medico_crm VARCHAR,
  hospital_nome VARCHAR,
  total_materiais BIGINT,
  materiais_separados BIGINT
)
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.data_agendada,
    c.status_cirurgia::VARCHAR,
    c.sala,
    p.nome AS paciente_nome,
    m.nome AS medico_nome,
    m.crm AS medico_crm,
    h.nome AS hospital_nome,
    (
      SELECT COUNT(*)::BIGINT
      FROM public.cirurgia_materiais cm
      WHERE cm.cirurgia_id = c.id
    ) AS total_materiais,
    (
      SELECT COUNT(*)::BIGINT
      FROM public.cirurgia_materiais cm
      WHERE cm.cirurgia_id = c.id AND cm.status_item = 'separado'
    ) AS materiais_separados
  FROM public.cirurgias c
  INNER JOIN public.pacientes p ON p.id = c.paciente_id
  INNER JOIN public.medicos m ON m.id = c.medico_id
  INNER JOIN public.hospitais h ON h.id = c.hospital_id
  WHERE c.empresa_id = p_empresa_id
    AND c.data_agendada::DATE BETWEEN p_data_inicio AND p_data_fim
  ORDER BY c.data_agendada ASC;
END;
$$;

COMMENT ON FUNCTION public.get_agenda_cirurgias IS 'Retorna agenda de cirurgias para um período';

-- ======================================
-- FUNCTION: refresh_dashboard_kpis (cron)
-- ======================================

CREATE OR REPLACE FUNCTION public.refresh_dashboard_kpis()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.vw_dashboard_kpis;
END;
$$;

COMMENT ON FUNCTION public.refresh_dashboard_kpis IS 'Atualiza view materializada de KPIs (executar via cron a cada 15min)';
`
};

// ======================================
// 🧩 FUNÇÕES AUXILIARES
// ======================================

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function generateTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  return `${year}${month}${day}${hour}${minute}`;
}

// ======================================
// 📝 GERAÇÃO DO PLANO
// ======================================

function generateMigrationPlan() {
  console.log('\n📋 GERANDO PLANO DE MIGRATIONS...\n');
  
  const timestamp = generateTimestamp();
  const migrations = [];
  
  // Migration 1: Tabelas
  migrations.push({
    filename: `${timestamp}_01_cirurgias_tabelas.sql`,
    content: MIGRATION_TEMPLATES.cirurgias_table,
    description: 'Criar tabelas do domínio Cirurgias (cirurgias, cirurgia_materiais, cirurgia_eventos)'
  });
  
  // Migration 2: RLS
  migrations.push({
    filename: `${timestamp}_02_cirurgias_rls.sql`,
    content: MIGRATION_TEMPLATES.cirurgias_rls,
    description: 'Configurar políticas RLS multi-tenant para Cirurgias'
  });
  
  // Migration 3: Views
  migrations.push({
    filename: `${timestamp}_03_dashboard_views.sql`,
    content: MIGRATION_TEMPLATES.dashboard_views,
    description: 'Criar views materializadas e queries otimizadas para Dashboard'
  });
  
  // Migration 4: Functions
  migrations.push({
    filename: `${timestamp}_04_dashboard_functions.sql`,
    content: MIGRATION_TEMPLATES.dashboard_functions,
    description: 'Criar functions RPC para KPIs e agenda'
  });
  
  return migrations;
}

function writeMigrations(migrations) {
  console.log('\n✍️  ESCREVENDO MIGRATIONS...\n');
  
  ensureDir(MIGRATIONS_DIR);
  
  migrations.forEach(m => {
    const filePath = path.join(MIGRATIONS_DIR, m.filename);
    fs.writeFileSync(filePath, m.content, 'utf-8');
    console.log(`  ✅ ${m.filename}`);
    console.log(`     ${m.description}`);
  });
}

function generateMarkdownPlan(migrations) {
  console.log('\n📝 GERANDO PLANO EM MARKDOWN...\n');
  
  const timestamp = new Date().toISOString();
  let md = `# 📋 Plano de Migrations - ICARUS v5.0\n\n`;
  md += `**AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3**\n\n`;
  md += `📅 Data: ${timestamp}\n\n`;
  md += `---\n\n`;
  
  md += `## 🎯 Objetivo\n\n`;
  md += `Implementar infraestrutura completa do domínio **Cirurgias** (core do sistema ICARUS):\n\n`;
  md += `- ✅ Tabelas principais com auditoria\n`;
  md += `- ✅ Políticas RLS multi-tenant\n`;
  md += `- ✅ Índices de performance\n`;
  md += `- ✅ Views materializadas para KPIs\n`;
  md += `- ✅ Functions RPC para consultas otimizadas\n`;
  md += `- ✅ Triggers automáticos\n\n`;
  
  md += `---\n\n`;
  md += `## 📦 Migrations Geradas\n\n`;
  
  migrations.forEach((m, idx) => {
    md += `### ${idx + 1}. \`${m.filename}\`\n\n`;
    md += `**Descrição:** ${m.description}\n\n`;
    md += `**Caminho:** \`supabase/migrations/${m.filename}\`\n\n`;
  });
  
  md += `---\n\n`;
  md += `## 🚀 Execução\n\n`;
  md += `### Opção 1: Supabase CLI (recomendado)\n\n`;
  md += `\`\`\`bash\n`;
  md += `# Aplicar migrations localmente\n`;
  md += `supabase db reset\n\n`;
  md += `# Ou aplicar apenas as novas migrations\n`;
  md += `supabase migration up\n`;
  md += `\`\`\`\n\n`;
  
  md += `### Opção 2: Script npm\n\n`;
  md += `\`\`\`bash\n`;
  md += `npm run db:migrate\n`;
  md += `\`\`\`\n\n`;
  
  md += `### Opção 3: Dashboard Supabase\n\n`;
  md += `1. Acessar: https://app.supabase.com/project/[PROJECT_ID]/editor\n`;
  md += `2. Executar manualmente cada migration na aba **SQL Editor**\n\n`;
  
  md += `---\n\n`;
  md += `## ✅ Validação\n\n`;
  md += `Após aplicar as migrations, execute:\n\n`;
  md += `\`\`\`bash\n`;
  md += `# Reaudidar infraestrutura\n`;
  md += `npm run infra:audit\n\n`;
  md += `# Healthcheck completo\n`;
  md += `npm run infra:health\n`;
  md += `\`\`\`\n\n`;
  
  md += `---\n\n`;
  md += `## 📚 Próximos Passos\n\n`;
  md += `1. ✅ Aplicar migrations\n`;
  md += `2. ⚙️ Configurar Storage Buckets (ver plano separado)\n`;
  md += `3. 🌐 Implementar Edge Functions (ver plano separado)\n`;
  md += `4. 🔄 Configurar Realtime channels\n`;
  md += `5. 🧪 Popular dados de demonstração (seeds)\n`;
  md += `6. 🧪 Executar testes de RLS\n\n`;
  
  md += `---\n\n`;
  md += `*Plano gerado automaticamente por AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3*\n`;
  
  return md;
}

// ======================================
// 🎬 MAIN
// ======================================

function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  📋 AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3              ║');
  console.log('║  Planejamento de Migrations - ICARUS v5.0                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  // Gerar plano
  const migrations = generateMigrationPlan();
  
  // Escrever migrations
  writeMigrations(migrations);
  
  // Gerar documentação
  ensureDir(DOCS_INFRA_DIR);
  const markdown = generateMarkdownPlan(migrations);
  const planPath = path.join(DOCS_INFRA_DIR, 'plano-migrations.md');
  fs.writeFileSync(planPath, markdown, 'utf-8');
  
  console.log(`\n✅ Plano salvo em: ${planPath}\n`);
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log(`║  ✅ ${migrations.length} migrations geradas                                  ║`);
  console.log('║  📝 Documentação completa em docs/infra/                  ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  console.log('🚀 Próximo passo: npm run infra:apply (ou revisar migrations manualmente)\n');
}

main();

