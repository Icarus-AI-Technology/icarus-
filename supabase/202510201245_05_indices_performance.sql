-- Migration: Índices de Performance - Domínio Completo
-- Gerado por: AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3
-- Data: 2025-10-20
-- Descrição: Índices estratégicos para otimização de queries

-- ======================================
-- ÍNDICES: cirurgias
-- ======================================

CREATE INDEX IF NOT EXISTS cirurgias_empresa_id_data_idx 
  ON public.cirurgias(empresa_id, data_agendada DESC);

CREATE INDEX IF NOT EXISTS cirurgias_status_idx 
  ON public.cirurgias(status_cirurgia) WHERE status_cirurgia IN ('agendada', 'confirmada', 'em_andamento');

CREATE INDEX IF NOT EXISTS cirurgias_data_agendada_idx 
  ON public.cirurgias(data_agendada) WHERE data_agendada >= CURRENT_DATE;

CREATE INDEX IF NOT EXISTS cirurgias_medico_id_idx 
  ON public.cirurgias(medico_id);

CREATE INDEX IF NOT EXISTS cirurgias_hospital_id_idx 
  ON public.cirurgias(hospital_id);

CREATE INDEX IF NOT EXISTS cirurgias_paciente_id_idx 
  ON public.cirurgias(paciente_id);

COMMENT ON INDEX cirurgias_empresa_id_data_idx IS 'Filtro multi-tenant + ordenação por data';
COMMENT ON INDEX cirurgias_status_idx IS 'Filtro parcial para status ativos';
COMMENT ON INDEX cirurgias_data_agendada_idx IS 'Filtro parcial para cirurgias futuras';

-- ======================================
-- ÍNDICES: cirurgia_materiais
-- ======================================

CREATE INDEX IF NOT EXISTS cirurgia_materiais_cirurgia_id_idx 
  ON public.cirurgia_materiais(cirurgia_id);

CREATE INDEX IF NOT EXISTS cirurgia_materiais_material_id_idx 
  ON public.cirurgia_materiais(material_id);

CREATE INDEX IF NOT EXISTS cirurgia_materiais_status_idx 
  ON public.cirurgia_materiais(status_item);

CREATE INDEX IF NOT EXISTS cirurgia_materiais_validade_idx 
  ON public.cirurgia_materiais(validade) WHERE validade IS NOT NULL;

-- ======================================
-- ÍNDICES: materiais
-- ======================================

CREATE INDEX IF NOT EXISTS materiais_codigo_interno_idx 
  ON public.materiais(codigo_interno);

CREATE INDEX IF NOT EXISTS materiais_registro_anvisa_idx 
  ON public.materiais(registro_anvisa) WHERE registro_anvisa IS NOT NULL;

CREATE INDEX IF NOT EXISTS materiais_empresa_id_idx 
  ON public.materiais(empresa_id);

CREATE INDEX IF NOT EXISTS materiais_descricao_trgm_idx 
  ON public.materiais USING gin(descricao gin_trgm_ops);

COMMENT ON INDEX materiais_descricao_trgm_idx IS 'Busca fuzzy por descrição (requer extension pg_trgm)';

-- ======================================
-- ÍNDICES: medicos
-- ======================================

CREATE INDEX IF NOT EXISTS medicos_crm_idx 
  ON public.medicos(crm);

CREATE INDEX IF NOT EXISTS medicos_empresa_id_idx 
  ON public.medicos(empresa_id);

CREATE INDEX IF NOT EXISTS medicos_especialidade_idx 
  ON public.medicos(especialidade);

-- ======================================
-- ÍNDICES: pacientes
-- ======================================

CREATE INDEX IF NOT EXISTS pacientes_cpf_idx 
  ON public.pacientes(cpf);

CREATE INDEX IF NOT EXISTS pacientes_empresa_id_idx 
  ON public.pacientes(empresa_id);

CREATE INDEX IF NOT EXISTS pacientes_nome_trgm_idx 
  ON public.pacientes USING gin(nome gin_trgm_ops);

-- ======================================
-- ÍNDICES: hospitais
-- ======================================

CREATE INDEX IF NOT EXISTS hospitais_cnpj_idx 
  ON public.hospitais(cnpj);

CREATE INDEX IF NOT EXISTS hospitais_empresa_id_idx 
  ON public.hospitais(empresa_id);

CREATE INDEX IF NOT EXISTS hospitais_cidade_idx 
  ON public.hospitais(cidade);

-- ======================================
-- ÍNDICES: convenios
-- ======================================

CREATE INDEX IF NOT EXISTS convenios_codigo_idx 
  ON public.convenios(codigo);

CREATE INDEX IF NOT EXISTS convenios_empresa_id_idx 
  ON public.convenios(empresa_id);

-- ======================================
-- ÍNDICES: cirurgia_eventos
-- ======================================

CREATE INDEX IF NOT EXISTS cirurgia_eventos_cirurgia_id_idx 
  ON public.cirurgia_eventos(cirurgia_id);

CREATE INDEX IF NOT EXISTS cirurgia_eventos_data_hora_idx 
  ON public.cirurgia_eventos(data_hora DESC);

CREATE INDEX IF NOT EXISTS cirurgia_eventos_tipo_idx 
  ON public.cirurgia_eventos(tipo_evento);

-- ======================================
-- EXTENSÕES NECESSÁRIAS
-- ======================================

-- Habilitar pg_trgm para busca fuzzy
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Habilitar btree_gin para índices compostos GIN
CREATE EXTENSION IF NOT EXISTS btree_gin;

-- ======================================
-- ANÁLISE E ESTATÍSTICAS
-- ======================================

-- Forçar análise das tabelas para atualizar estatísticas
ANALYZE public.cirurgias;
ANALYZE public.cirurgia_materiais;
ANALYZE public.materiais;
ANALYZE public.medicos;
ANALYZE public.pacientes;
ANALYZE public.hospitais;
ANALYZE public.convenios;
ANALYZE public.cirurgia_eventos;

-- ======================================
-- NOTAS DE PERFORMANCE
-- ======================================

-- 1. Índices parciais (WHERE) economizam espaço e melhoram performance
-- 2. GIN trigram para busca fuzzy em strings (LIKE '%termo%')
-- 3. Índices compostos (empresa_id, data) otimizam filtros multi-tenant
-- 4. ANALYZE após criar índices atualiza estatísticas do planner
-- 5. Monitorar pg_stat_user_indexes para identificar índices não utilizados

