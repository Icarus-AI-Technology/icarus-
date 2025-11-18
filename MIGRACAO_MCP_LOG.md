# 🚀 Aplicação de Migrações via MCP Supabase

**Data**: 2025-11-18T11:31:57.078Z
**Projeto**: gvbkviozlhxorjoavmky
**Total**: 88 migrações

---

## 1. 0002_rls_policies.sql

```typescript
mcp_supabase_apply_migration({
  name: "0002_rls_policies",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE OR REPLACE FUNCTION public.current_empresa()
RETURNS UUID
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT NULLIF(
    current_setting('request.jwt.claims', true)::jsonb->>'empresa_id',
    ''
  )::uuid;
$$;


CREATE OR REPLACE FUNCTION public.current_perfil()
RETURNS TEXT
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::jsonb->>'perfil',
    'operador'
  );
$$;


CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS UUID
LANGUAGE SQL
IMMUTABLE
A
... (11007 caracteres total)
`
});
```

---

## 2. 0003_indexes_perf.sql

```typescript
mcp_supabase_apply_migration({
  name: "0003_indexes_perf",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE INDEX IF NOT EXISTS idx_empresas_cnpj ON empresas(cnpj) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_empresas_status ON empresas(status) WHERE excluido_em IS NULL;





CREATE INDEX IF NOT EXISTS idx_usuarios_empresa_perfil ON usuarios(empresa_id, perfil) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_usuarios_empresa_criado ON usuarios(empresa_id, criado_em DESC) WHERE excl
... (9320 caracteres total)
`
});
```

---

## 3. 0004_functions_triggers.sql

```typescript
mcp_supabase_apply_migration({
  name: "0004_functions_triggers",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE OR REPLACE FUNCTION compute_audit_hash(
  p_empresa_id UUID,
  p_usuario_id UUID,
  p_tabela TEXT,
  p_registro_id UUID,
  p_acao TEXT,
  p_dados_antes JSONB,
  p_dados_depois JSONB,
  p_hash_anterior TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_payload TEXT;
BEGIN
  
  v_payload := CONCAT(
    COALESCE(p_empresa_id::text, ''),
    '|',
    COALESCE(p_usuario_id::text, ''),
    '|',
    p_tabela,
    '|',
    p_registro_id::text,
    '|',
    p_acao,
    '|',
    COALE
... (11478 caracteres total)
`
});
```

---

## 4. 0005_storage_policies.sql

```typescript
mcp_supabase_apply_migration({
  name: "0005_storage_policies",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documentos_cirurgias',
  'documentos_cirurgias',
  FALSE, 
  10485760, 
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/xml']
)
ON CONFLICT (id) DO NOTHING;




INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documentos_fiscais',
  'documentos_fiscais',
  FALSE,
  52428800, 
  ARRAY['application/pdf', 'application/xml', 'text/xml']
)
O
... (6579 caracteres total)
`
});
```

---

## 5. 0006_seed_minimo.sql

```typescript
mcp_supabase_apply_migration({
  name: "0006_seed_minimo",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
INSERT INTO empresas (
  id,
  nome,
  razao_social,
  cnpj,
  inscricao_estadual,
  licenca_anvisa,
  email,
  telefone,
  cidade,
  estado,
  status
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'ICARUS Distribuidora OPME',
  'ICARUS Distribuidora de Materiais OPME Ltda',
  '12.345.678/0001-90',
  '123.456.789.123',
  'ANV-123456',
  'contato@icarus-opme.com.br',
  '(11) 3456-7890',
  'São Paulo',
  'SP',
  'ativa'
)
ON CONFLICT (id) DO NOTHING;




INSERT INTO produtos (id, empresa_i
... (7109 caracteres total)
`
});
```

---

## 6. 0007_dpo_encarregado.sql

```typescript
mcp_supabase_apply_migration({
  name: "0007_dpo_encarregado",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
ALTER TABLE empresas 
ADD COLUMN IF NOT EXISTS dpo_nome TEXT,
ADD COLUMN IF NOT EXISTS dpo_email TEXT,
ADD COLUMN IF NOT EXISTS dpo_telefone TEXT,
ADD COLUMN IF NOT EXISTS dpo_cpf TEXT,
ADD COLUMN IF NOT EXISTS dpo_nomeado_em TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS dpo_tipo TEXT CHECK (dpo_tipo IN ('interno', 'externo')) DEFAULT 'interno';


COMMENT ON COLUMN empresas.dpo_nome IS 'Nome completo do Encarregado de Proteção de Dados (LGPD Art. 41)';
COMMENT ON COLUMN empresas.dpo_email IS 'E-mail púb
... (3519 caracteres total)
`
});
```

---

## 7. 0008_storage_icarus_new.sql

```typescript
mcp_supabase_apply_migration({
  name: "0008_storage_icarus_new",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'icarus_new',
  'icarus_new',
  false, 
  52428800, 
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
O
... (2040 caracteres total)
`
});
```

---

## 8. 0009_tutores_economia_corrigido.sql

```typescript
mcp_supabase_apply_migration({
  name: "0009_tutores_economia_corrigido",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE EXTENSION IF NOT EXISTS vector;





CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT false,
  rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  user_segments TEXT[],
  description TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE feature_flags IS 'Sistema de feature flags para A/B te
... (5815 caracteres total)
`
});
```

---

## 9. 0010_fulltext_search.sql

```typescript
mcp_supabase_apply_migration({
  name: "0010_fulltext_search",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE EXTENSION IF NOT EXISTS pg_trgm;  
CREATE EXTENSION IF NOT EXISTS unaccent; 






CREATE INDEX IF NOT EXISTS idx_conhecimento_fts 
ON conhecimento_base 
USING GIN (to_tsvector('portuguese', conteudo_texto));


CREATE INDEX IF NOT EXISTS idx_conhecimento_trgm 
ON conhecimento_base 
USING GIN (conteudo_texto gin_trgm_ops);


CREATE INDEX IF NOT EXISTS idx_legislacao_fts 
ON legislacao_updates 
USING GIN (to_tsvector('portuguese', 
  COALESCE(titulo, '') || ' ' || COALESCE(descricao, '')));
... (5033 caracteres total)
`
});
```

---

## 10. 0011_cadastros_completo.sql

```typescript
mcp_supabase_apply_migration({
  name: "0011_cadastros_completo",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE TABLE IF NOT EXISTS pacientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  
  
  nome_completo TEXT NOT NULL,
  cpf TEXT,
  rg TEXT,
  data_nascimento DATE NOT NULL,
  sexo TEXT CHECK (sexo IN ('M', 'F', 'Outro')),
  estado_civil TEXT CHECK (estado_civil IN ('solteiro', 'casado', 'divorciado', 'viuvo', 'uniao_estavel')),
  
  
  nome_mae TEXT NOT NULL,
  nome_pai TEXT,
  
  
  telefone TEXT,
  celular TEXT,
  em
... (8958 caracteres total)
`
});
```

---

## 11. 0011_seed_conhecimento.sql

```typescript
mcp_supabase_apply_migration({
  name: "0011_seed_conhecimento",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
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
  'Checklist ANVISA - Antes de cada cirurgia, 
... (5575 caracteres total)
`
});
```

---

## 12. 0012_compras_completo.sql

```typescript
mcp_supabase_apply_migration({
  name: "0012_compras_completo",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE TABLE IF NOT EXISTS solicitacoes_compra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  numero TEXT NOT NULL,
  
  
  solicitante_id UUID NOT NULL REFERENCES usuarios(id),
  departamento TEXT,
  justificativa TEXT,
  urgencia TEXT CHECK (urgencia IN ('normal', 'urgente', 'emergencia')) DEFAULT 'normal',
  
  
  status TEXT CHECK (status IN ('rascunho', 'aguardando_aprovacao', 'aprovada', 'rejeitada', 'cancelada')) 
... (14021 caracteres total)
`
});
```

---

## 13. 0012_seed_opme_especializado.sql

```typescript
mcp_supabase_apply_migration({
  name: "0012_seed_opme_especializado",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
INSERT INTO conhecimento_base (documento_id, conteudo_texto, categoria, modulo, tags)
VALUES 
(
  'opme-001',
  'OPME - Órteses, Próteses e Materiais Especiais. São dispositivos médicos implantáveis ou de uso único utilizados em procedimentos cirúrgicos. Incluem: placas, parafusos, pinos, stents, válvulas cardíacas, próteses articulares, malhas cirúrgicas, entre outros. A ANS regula o fornecimento de OPME através do Rol de Procedimentos.',
  'documentacao',
  'opme',
  ARRAY['conceito', 'ans', '
... (14964 caracteres total)
`
});
```

---

## 14. 0013_observabilidade_comportamental.sql

```typescript
mcp_supabase_apply_migration({
  name: "0013_observabilidade_comportamental",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE EXTENSION IF NOT EXISTS pgcrypto;





CREATE TABLE IF NOT EXISTS user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  acao TEXT NOT NULL,
  modulo TEXT NOT NULL,
  sub_modulo TEXT,
  rota TEXT,
  metodo TEXT CHECK (metodo IN ('CREATE', 'READ', 'UPDATE', 'DELETE', 'NAVIGATE', 'SEARCH', 'EXPORT', 'IMPORT')),
  dados_entrada JSONB,
  dados_saida JSONB,
  tempo_execucao INTEGER,
  sucesso BOOLEAN DEFAULT true,
  e
... (13880 caracteres total)
`
});
```

---

## 15. 20251018_entregas.sql

```typescript
mcp_supabase_apply_migration({
  name: "20251018_entregas",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE TABLE IF NOT EXISTS entregas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_rastreio VARCHAR(50) UNIQUE NOT NULL,
  
  
  origem_tipo VARCHAR(20) CHECK (origem_tipo IN ('deposito', 'fornecedor', 'hospital')),
  origem_id UUID,
  origem_nome VARCHAR(255) NOT NULL,
  origem_endereco TEXT NOT NULL,
  origem_cidade VARCHAR(100),
  origem_estado VARCHAR(2),
  origem_cep VARCHAR(10),
  
  
  destino_tipo VARCHAR(20) CHECK (destino_tipo IN ('hospital', 'medico', 'clinica', 'deposito
... (4816 caracteres total)
`
});
```

---

## 16. 20251018_faturas.sql

```typescript
mcp_supabase_apply_migration({
  name: "20251018_faturas",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE TABLE IF NOT EXISTS faturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_nfe VARCHAR(20) UNIQUE NOT NULL,
  serie VARCHAR(10) NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('nfe', 'nfse', 'cte', 'mdfe')),
  
  
  cliente_tipo VARCHAR(10) CHECK (cliente_tipo IN ('medico', 'hospital', 'outro')),
  cliente_id UUID,
  cliente_nome VARCHAR(255) NOT NULL,
  cliente_cpf_cnpj VARCHAR(18) NOT NULL,
  
  
  data_emissao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_vencimento
... (3198 caracteres total)
`
});
```

---

## 17. 20251018_initial_schema.sql

```typescript
mcp_supabase_apply_migration({
  name: "20251018_initial_schema",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";




CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('admin', 'medico', 'financeiro', 'estoque', 'vendas')) DEFAULT 'medico',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


CREATE INDEX IF NOT EXISTS idx_profiles_email ON profile
... (10917 caracteres total)
`
});
```

---

## 18. 20251018_rls_policies.sql

```typescript
mcp_supabase_apply_migration({
  name: "20251018_rls_policies",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitais ENABLE ROW LEVEL SECURITY;
ALTER TABLE cirurgias ENABLE ROW LEVEL SECURITY;
ALTER TABLE materiais_opme ENABLE ROW LEVEL SECURITY;
ALTER TABLE cirurgia_materiais ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos_compra ENABLE ROW LEVEL SECU
... (6897 caracteres total)
`
});
```

---

## 19. 20251019_chatbot_navegacao_ptbr.sql

```typescript
mcp_supabase_apply_migration({
  name: "20251019_chatbot_navegacao_ptbr",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE TABLE IF NOT EXISTS chatbot_conversas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  
  data_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_fim TIMESTAMP WITH TIME ZONE,
  
  status VARCHAR(20) DEFAULT 'ativa' CHECK (status IN ('ativa', 'finalizada', 'abandonada')),
  
  total_mensagens INTEGER DEFAULT 0,
  satisfacao_usuario INTEGER CHECK (satisfacao_usuario BETWEEN 1 AND 5),
  
  metadata JSONB DEFAULT '{}',
  
  
... (12982 caracteres total)
`
});
```

---

## 20. 20251019_compliance_auditoria_completo.sql

```typescript
mcp_supabase_apply_migration({
  name: "20251019_compliance_auditoria_completo",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE TABLE IF NOT EXISTS compliance_requisitos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  
  codigo VARCHAR(20) UNIQUE NOT NULL, 
  categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('qualidade', 'rastreabilidade', 'armazenamento', 'transporte', 'documentacao', 'treinamento', 'etica')),
  
  
  fabricante VARCHAR(50) CHECK (fabricante IN ('abbott', 'medtronic', 'jnj', 'stryker', 'boston_scientific', 'anvisa', 'iso', 'todos')),
  
  
  titulo VARCHAR(255) NOT NULL,
  descricao TEX
... (18521 caracteres total)
`
});
```

---

## 21. 20251019_consignacao_avancada_completo.sql

```typescript
mcp_supabase_apply_migration({
  name: "20251019_consignacao_avancada_completo",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE TABLE IF NOT EXISTS contratos_consignacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  
  numero_contrato VARCHAR(50) UNIQUE NOT NULL,
  
  
  hospital_id UUID REFERENCES hospitais(id),
  hospital_nome VARCHAR(255) NOT NULL,
  hospital_cnpj VARCHAR(18) NOT NULL,
  hospital_endereco TEXT,
  responsavel_hospital VARCHAR(255),
  
  
  data_inicio DATE NOT NULL,
  data_fim DATE,
  prazo_vencimento DATE,
  
  
  percentual_comissao DECIMAL(5,2) DEFAULT 15.0, 
  condicoes_pagamento V
... (14135 caracteres total)
`
});
```

---

## 22. 20251019_contracts_crm.sql

```typescript
mcp_supabase_apply_migration({
  name: "20251019_contracts_crm",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
BEGIN;





CREATE TABLE IF NOT EXISTS contratos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE RESTRICT,
  numero_contrato TEXT NOT NULL,
  titulo TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN (
    'fornecimento_produtos',
    'prestacao_servicos',
    'opme_hospital',
    'locacao',
    'parceria',
    'seguro',
    'outro'
  )),
  status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN (
    'rascunho',
    'em_aprovacao'
... (13573 caracteres total)
`
});
```

---

## 23. 20251019_dashboard_kpis_function.sql

```typescript
mcp_supabase_apply_migration({
  name: "20251019_dashboard_kpis_function",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
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
  
  v_sistema_status := 98.0;
  
  
  SELECT COUNT(DISTINCT m.id)
  INTO v_m
... (5802 caracteres total)
`
});
```

---

## 24. 20251019_estoque_inteligente_completo.sql

```typescript
mcp_supabase_apply_migration({
  name: "20251019_estoque_inteligente_completo",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE TABLE IF NOT EXISTS estoque_armazens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  codigo VARCHAR(20) UNIQUE NOT NULL,
  nome VARCHAR(100) NOT NULL,
  tipo VARCHAR(50) NOT NULL, 
  
  
  endereco TEXT,
  cidade VARCHAR(100),
  uf VARCHAR(2),
  cep VARCHAR(10),
  
  
  capacidade_m3 DECIMAL(10, 2),
  capacidade_utilizada_m3 DECIMAL(10, 2),
  
  
  ativo BOOLEAN DEFAULT TRUE,
  responsavel_id UUID REFERENCES usuarios(id),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMES
... (13409 caracteres total)
`
});
```

---

## 25. 20251019_portais_opme.sql

```typescript
mcp_supabase_apply_migration({
  name: "20251019_portais_opme",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE TABLE IF NOT EXISTS portais_opme_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  
  portal VARCHAR(50) NOT NULL UNIQUE,
  nome_exibicao VARCHAR(100) NOT NULL,
  url_base VARCHAR(255) NOT NULL,
  
  
  tipo_integracao VARCHAR(50) NOT NULL CHECK (tipo_integracao IN ('api_rest', 'api_graphql', 'scraping', 'hibrida')),
  api_endpoint VARCHAR(255),
  api_key TEXT,
  api_secret TEXT,
  
  
  scraping_enabled BOOLEAN DEFAULT FALSE,
  user_agent TEXT,
  proxy_enabled BOOLEAN DEFAUL
... (9541 caracteres total)
`
});
```

---

## 26. 20251019_validacoes_cache.sql

```typescript
mcp_supabase_apply_migration({
  name: "20251019_validacoes_cache",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE TABLE IF NOT EXISTS validacoes_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('cep', 'cnpj', 'cpf', 'crm', 'veiculo', 'anvisa')),
  
  
  chave VARCHAR(50) NOT NULL,
  
  
  dados JSONB NOT NULL,
  
  
  fonte VARCHAR(50) NOT NULL, 
  sucesso BOOLEAN NOT NULL DEFAULT true,
  
  
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  accessed_at TIMESTAMP DEFAULT NOW(),
  access_count INTEGER DEFAULT 1,
  
  
  C
... (5168 caracteres total)
`
});
```

---

## 27. 202510201244_01_cirurgias_tabelas.sql

```typescript
mcp_supabase_apply_migration({
  name: "202510201244_01_cirurgias_tabelas",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
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






CREATE TABLE IF NOT EXISTS public.cirurgias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE RES
... (4182 caracteres total)
`
});
```

---

## 28. 202510201244_02_cirurgias_rls.sql

```typescript
mcp_supabase_apply_migration({
  name: "202510201244_02_cirurgias_rls",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
ALTER TABLE public.cirurgias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cirurgia_materiais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cirurgia_eventos ENABLE ROW LEVEL SECURITY;






CREATE POLICY cirurgias_select_policy ON public.cirurgias
  FOR SELECT
  USING (
    empresa_id IN (
      SELECT empresa_id FROM public.profiles WHERE id = auth.uid()
    )
  );


CREATE POLICY cirurgias_insert_policy ON public.cirurgias
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pro
... (3322 caracteres total)
`
});
```

---

## 29. 202510201244_03_dashboard_views.sql

```typescript
mcp_supabase_apply_migration({
  name: "202510201244_03_dashboard_views",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE MATERIALIZED VIEW IF NOT EXISTS public.vw_dashboard_kpis AS
SELECT
  c.empresa_id,
  DATE_TRUNC('month', c.data_agendada) AS periodo,
  
  
  COUNT(DISTINCT c.id) AS total_cirurgias,
  COUNT(DISTINCT CASE WHEN c.status_cirurgia = 'concluida' THEN c.id END) AS cirurgias_concluidas,
  COUNT(DISTINCT CASE WHEN c.status_cirurgia = 'cancelada' THEN c.id END) AS cirurgias_canceladas,
  COUNT(DISTINCT c.medico_id) AS medicos_ativos,
  COUNT(DISTINCT c.hospital_id) AS hospitais_ativos,
  
  
  CO
... (3402 caracteres total)
`
});
```

---

## 30. 202510201244_04_dashboard_functions.sql

```typescript
mcp_supabase_apply_migration({
  name: "202510201244_04_dashboard_functions",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE OR REPLACE FUNCTION public.get_dashboard_kpis(
  p_empresa_id UUID,
  p_periodo TEXT DEFAULT 'month' 
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_result JSON;
  v_data_inicio TIMESTAMP WITH TIME ZONE;
BEGIN
  
  CASE p_periodo
    WHEN 'day' THEN
      v_data_inicio := DATE_TRUNC('day', NOW());
    WHEN 'week' THEN
      v_data_inicio := DATE_TRUNC('week', NOW());
    WHEN 'year' THEN
      v_data_inicio := DATE_TRUNC('year', NOW());
    ELSE 
      v_data_inicio :=
... (3558 caracteres total)
`
});
```

---

## 31. 202510201245_05_indices_performance.sql

```typescript
mcp_supabase_apply_migration({
  name: "202510201245_05_indices_performance",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE INDEX IF NOT EXISTS cirurgias_empresa_id_data_idx 
  ON public.cirurgias(empresa_id, data_agendada DESC);

CREATE INDEX IF NOT EXISTS cirurgias_status_idx 
  ON public.cirurgias(status_cirurgia) WHERE status_cirurgia IN ('agendada', 'confirmada', 'em_andamento');

CREATE INDEX IF NOT EXISTS cirurgias_data_agendada_idx 
  ON public.cirurgias(data_agendada) WHERE data_agendada >= CURRENT_DATE;

CREATE INDEX IF NOT EXISTS cirurgias_medico_id_idx 
  ON public.cirurgias(medico_id);

CREATE IND
... (3512 caracteres total)
`
});
```

---

## 32. 202510201246_06_seeds_demo.sql

```typescript
mcp_supabase_apply_migration({
  name: "202510201246_06_seeds_demo",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
INSERT INTO public.empresas (id, nome, cnpj, ativo) VALUES
  ('11111111-1111-1111-1111-111111111111', 'OPME Sul Ltda', '11.111.111/0001-11', true),
  ('22222222-2222-2222-2222-222222222222', 'Saúde Total Distribuidora', '22.222.222/0001-22', true),
  ('33333333-3333-3333-3333-333333333333', 'Cirurgia Plus S.A.', '33.333.333/0001-33', true),
  ('44444444-4444-4444-4444-444444444444', 'MediCorp Brasil', '44.444.444/0001-44', true),
  ('55555555-5555-5555-5555-555555555555', 'Hospital Express', '55
... (8991 caracteres total)
`
});
```

---

## 33. 202510201247_07_storage_config.sql

```typescript
mcp_supabase_apply_migration({
  name: "202510201247_07_storage_config",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cirurgias',
  'cirurgias',
  false,
  10485760, 
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;


INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'faturamento',
  'faturamento',
  false,
  52428800, 
  ARRAY['application/pdf', 'application/xml', 'text/xml']
)
ON CONFLICT (id) DO NOTHING;


INSERT INTO st
... (5613 caracteres total)
`
});
```

---

## 34. 202510201300_fase1_10tabelas_criticas.sql

```typescript
mcp_supabase_apply_migration({
  name: "202510201300_fase1_10tabelas_criticas",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE TABLE IF NOT EXISTS public.pacientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  
  nome_completo TEXT NOT NULL,
  cpf TEXT,
  rg TEXT,
  data_nascimento DATE,
  sexo TEXT CHECK (sexo IN ('M', 'F', 'outro', 'nao_informado')),
  
  
  telefone TEXT,
  celular TEXT,
  email TEXT,
  
  
  cep TEXT,
  endereco TEXT,
  numero TEXT,
  complemento TEXT,
  bairro TEXT,
  cidade TEXT,
  estado TEXT CHECK (LENG
... (17152 caracteres total)
`
});
```

---

## 35. 202510201310_fase2_parte1_compras.sql

```typescript
mcp_supabase_apply_migration({
  name: "202510201310_fase2_parte1_compras",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE TABLE IF NOT EXISTS public.solicitacoes_compra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  
  numero TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT CHECK (tipo IN ('normal', 'urgente', 'programada', 'consignacao')) DEFAULT 'normal',
  
  
  solicitante_id UUID NOT NULL REFERENCES public.usuarios(id),
  departamento TEXT,
  centro_custo TEXT,
  
  
  justificativa TEXT NOT NULL,
  observacoes TEXT,
  
  
... (9713 caracteres total)
`
});
```

---

## 36. 202510201311_fase2_parte2_vendas_crm.sql

```typescript
mcp_supabase_apply_migration({
  name: "202510201311_fase2_parte2_vendas_crm",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE TABLE IF NOT EXISTS public.oportunidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  
  numero TEXT NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  
  
  lead_id UUID REFERENCES public.leads(id),
  cliente_nome TEXT NOT NULL,
  cliente_cnpj TEXT,
  cliente_email TEXT,
  cliente_telefone TEXT,
  
  
  vendedor_id UUID NOT NULL REFERENCES public.usuarios(id),
  
  
  origem TEXT CHECK (origem IN ('i
... (10067 caracteres total)
`
});
```

---

## 37. 202510201312_fase2_parte3_financeiro.sql

```typescript
mcp_supabase_apply_migration({
  name: "202510201312_fase2_parte3_financeiro",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE TABLE IF NOT EXISTS public.contas_pagar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  
  numero TEXT NOT NULL,
  descricao TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('fornecedor', 'folha', 'tributo', 'servico', 'aluguel', 'financiamento', 'outro')) DEFAULT 'fornecedor',
  
  
  fornecedor_id UUID REFERENCES public.fornecedores(id),
  fornecedor_nome TEXT,
  fornecedor_cnpj TEXT,
  
  
  nota_fiscal_id U
... (12312 caracteres total)
`
});
```

---

## 38. 202510201313_fase2_parte4_consignacao.sql

```typescript
mcp_supabase_apply_migration({
  name: "202510201313_fase2_parte4_consignacao",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE TABLE IF NOT EXISTS public.remessas_consignacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  
  numero TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('envio', 'reposicao', 'transferencia')) DEFAULT 'envio',
  
  
  contrato_consignacao_id UUID NOT NULL REFERENCES public.contratos_consignacao(id) ON DELETE RESTRICT,
  fornecedor_id UUID NOT NULL REFERENCES public.fornecedores(id) ON DELETE RESTRICT,
  
  
 
... (10201 caracteres total)
`
});
```

---

## 39. 202510201320_fase3_parte1_compliance.sql

```typescript
mcp_supabase_apply_migration({
  name: "202510201320_fase3_parte1_compliance",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE TABLE IF NOT EXISTS public.compliance_requisitos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  
  codigo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  
  
  tipo TEXT CHECK (tipo IN (
    'anvisa', 'rdc', 'iso', 'lgpd', 'trabalhista', 
    'ambiental', 'qualidade', 'seguranca', 'outro'
  )) NOT NULL,
  categoria TEXT,
  
  
  norma_base TEXT, 
  artigo_clausula TEXT,
  versao TEXT,
... (14020 caracteres total)
`
});
```

---

## 40. 202510201321_fase3_parte2_portais_opme.sql

```typescript
mcp_supabase_apply_migration({
  name: "202510201321_fase3_parte2_portais_opme",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE TABLE IF NOT EXISTS public.portais_opme_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  
  nome TEXT NOT NULL,
  codigo TEXT NOT NULL, 
  tipo TEXT CHECK (tipo IN ('hospital', 'convenio', 'operadora', 'marketplace')) NOT NULL,
  
  
  hospital_id UUID REFERENCES public.hospitais(id),
  convenio_id UUID REFERENCES public.convenios(id),
  entidade_nome TEXT NOT NULL,
  entidade_cnpj TEXT,
  
  
  url
... (9894 caracteres total)
`
});
```

---

## 41. 202510201322_fase3_parte3_licitacoes.sql

```typescript
mcp_supabase_apply_migration({
  name: "202510201322_fase3_parte3_licitacoes",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE TABLE IF NOT EXISTS public.licitacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  
  numero_processo TEXT NOT NULL,
  numero_edital TEXT,
  objeto TEXT NOT NULL,
  descricao TEXT,
  
  
  modalidade TEXT CHECK (modalidade IN (
    'pregao_eletronico', 'pregao_presencial', 'concorrencia', 
    'tomada_precos', 'convite', 'leilao', 'dispensa', 
    'inexigibilidade', 'rdc', 'dialogo_competitivo'
  )) NO
... (10263 caracteres total)
`
});
```

---

## 42. 202510201323_fase3_parte4_entregas.sql

```typescript
mcp_supabase_apply_migration({
  name: "202510201323_fase3_parte4_entregas",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE TABLE IF NOT EXISTS public.entregas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  
  numero TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN (
    'venda', 'consignacao', 'devolucao', 'transferencia', 
    'demonstracao', 'garantia', 'outro'
  )) NOT NULL,
  
  
  documento_origem_tipo TEXT, 
  documento_origem_id UUID,
  documento_numero TEXT,
  
  
  remessa_consignacao_id UUID REFERENCES public.remessas_con
... (5324 caracteres total)
`
});
```

---

## 43. 202510201330_fase4_parte1_chatbot_gpt.sql

```typescript
mcp_supabase_apply_migration({
  name: "202510201330_fase4_parte1_chatbot_gpt",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE TABLE IF NOT EXISTS public.chatbot_sessoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  
  
  titulo TEXT,
  descricao TEXT,
  
  
  contexto_tipo TEXT CHECK (contexto_tipo IN (
    'geral', 'cirurgia', 'compras', 'vendas', 
    'estoque', 'financeiro', 'compliance', 'outro'
  )) DEFAULT 'geral',
  contexto_id UUID, 
  
  
  mode
... (7626 caracteres total)
`
});
```

---

## 44. 202510201331_fase4_parte2_workflows.sql

```typescript
mcp_supabase_apply_migration({
  name: "202510201331_fase4_parte2_workflows",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE TABLE IF NOT EXISTS public.workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  
  codigo TEXT NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT CHECK (categoria IN (
    'aprovacao', 'notificacao', 'automacao', 
    'integracao', 'agendamento', 'validacao', 'outro'
  )),
  
  
  trigger_tipo TEXT CHECK (trigger_tipo IN (
    'manual', 'evento', 'agendado', 'webhook', 'condicional'
 
... (8299 caracteres total)
`
});
```

---

## 45. 202510201332_fase4_parte3_api_gateway.sql

```typescript
mcp_supabase_apply_migration({
  name: "202510201332_fase4_parte3_api_gateway",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE TABLE IF NOT EXISTS public.api_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  
  codigo TEXT NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  versao TEXT DEFAULT 'v1',
  
  
  metodo TEXT CHECK (metodo IN ('GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS')) NOT NULL,
  path TEXT NOT NULL, 
  path_parametros TEXT[], 
  
  
  categoria TEXT CHECK (categoria IN (
    'publico', 'privad
... (8287 caracteres total)
`
});
```

---

## 46. 202510201333_fase4_parte4_bi_analytics.sql

```typescript
mcp_supabase_apply_migration({
  name: "202510201333_fase4_parte4_bi_analytics",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE TABLE IF NOT EXISTS public.bi_dimensao_tempo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data DATE NOT NULL UNIQUE,
  ano INTEGER NOT NULL,
  trimestre INTEGER CHECK (trimestre BETWEEN 1 AND 4),
  mes INTEGER CHECK (mes BETWEEN 1 AND 12),
  semana INTEGER CHECK (semana BETWEEN 1 AND 53),
  dia INTEGER CHECK (dia BETWEEN 1 AND 31),
  dia_semana INTEGER CHECK (dia_semana BETWEEN 0 AND 6),
  dia_ano INTEGER CHECK (dia_ano BETWEEN 1 AND 366),
  nome_mes TEXT,
  nome_dia_semana TEXT,

... (4542 caracteres total)
`
});
```

---

## 47. 202510201334_fase4_parte5_kpis.sql

```typescript
mcp_supabase_apply_migration({
  name: "202510201334_fase4_parte5_kpis",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE TABLE IF NOT EXISTS public.kpi_metas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  codigo TEXT NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT CHECK (categoria IN ('financeiro', 'operacional', 'qualidade', 'vendas', 'estoque', 'compliance')),
  tipo_metrica TEXT CHECK (tipo_metrica IN ('percentual', 'valor', 'quantidade', 'tempo', 'taxa')),
  unidade TEXT,
  periodicidade TEXT CHECK (per
... (2464 caracteres total)
`
});
```

---

## 48. 202510201340_fase5_parte1_rbac.sql

```typescript
mcp_supabase_apply_migration({
  name: "202510201340_fase5_parte1_rbac",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  codigo TEXT NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  nivel INTEGER DEFAULT 1,
  sistema BOOLEAN DEFAULT FALSE,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, codigo)
);

CREATE INDEX IF NOT EXISTS idx_roles_empresa ON public.roles(em
... (3604 caracteres total)
`
});
```

---

## 49. 202510201341_fase5_parte2_health.sql

```typescript
mcp_supabase_apply_migration({
  name: "202510201341_fase5_parte2_health",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE TABLE IF NOT EXISTS public.system_health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metrica TEXT NOT NULL,
  categoria TEXT CHECK (categoria IN ('performance', 'disponibilidade', 'seguranca', 'recursos', 'negocio')) NOT NULL,
  valor DECIMAL(15, 2) NOT NULL,
  unidade TEXT,
  status TEXT CHECK (status IN ('ok', 'warning', 'critical', 'unknown')) DEFAULT 'ok',
  threshold_warning DECIMAL(15, 2),
  threshold_critical DECIMAL(15, 2),
  detalhes_json JSONB,
  coletado_em TIM
... (3338 caracteres total)
`
});
```

---

## 50. 202510201342_fase5_parte3_relatorios.sql

```typescript
mcp_supabase_apply_migration({
  name: "202510201342_fase5_parte3_relatorios",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE TABLE IF NOT EXISTS public.relatorios_regulatorios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  template_id UUID,
  codigo TEXT NOT NULL,
  nome TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('anvisa', 'ans', 'receita_federal', 'vigilancia', 'trabalho', 'ambiental', 'outro')) NOT NULL,
  periodicidade TEXT CHECK (periodicidade IN ('mensal', 'trimestral', 'semestral', 'anual', 'sob_demanda')),
  periodo_inicio
... (3783 caracteres total)
`
});
```

---

## 51. 202510201343_fase5_parte4_pluggy.sql

```typescript
mcp_supabase_apply_migration({
  name: "202510201343_fase5_parte4_pluggy",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE TABLE IF NOT EXISTS public.pluggy_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  banco_id UUID REFERENCES public.bancos(id),
  pluggy_item_id TEXT NOT NULL UNIQUE,
  instituicao_nome TEXT NOT NULL,
  instituicao_tipo TEXT,
  status TEXT CHECK (status IN ('ativa', 'atualizando', 'erro', 'desconectada', 'expirada')) DEFAULT 'ativa',
  ultima_sincronizacao TIMESTAMPTZ,
  proxima_sincronizacao TIMES
... (3446 caracteres total)
`
});
```

---

## 52. 202510201344_fase5_parte5_auxiliares.sql

```typescript
mcp_supabase_apply_migration({
  name: "202510201344_fase5_parte5_auxiliares",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE TABLE IF NOT EXISTS public.comentarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  entidade_tipo TEXT NOT NULL,
  entidade_id UUID NOT NULL,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  comentario TEXT NOT NULL,
  comentario_pai_id UUID REFERENCES public.comentarios(id),
  mencoes_ids UUID[],
  anexos_urls TEXT[],
  editado BOOLEAN DEFAULT FALSE,
  editado_em TIMESTAMPTZ
... (3046 caracteres total)
`
});
```

---

## 53. 202510201350_sistema_autenticacao_customizado.sql

```typescript
mcp_supabase_apply_migration({
  name: "202510201350_sistema_autenticacao_customizado",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
DO $$ 
BEGIN
  
  BEGIN
    ALTER TABLE public.usuarios DROP CONSTRAINT IF EXISTS usuarios_id_fkey;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  
  
  BEGIN
    ALTER TABLE public.usuarios ALTER COLUMN id DROP DEFAULT;
    ALTER TABLE public.usuarios ALTER COLUMN id SET DEFAULT gen_random_uuid();
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'usuarios' AND column_name = 'email_verificado') THE
... (10990 caracteres total)
`
});
```

---

## 54. 202510201400_correcao_tabelas_faltantes.sql

```typescript
mcp_supabase_apply_migration({
  name: "202510201400_correcao_tabelas_faltantes",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE TABLE IF NOT EXISTS public.materiais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE RESTRICT,
  codigo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  fabricante TEXT,
  registro_anvisa TEXT,
  categoria TEXT,
  subcategoria TEXT,
  unidade_medida TEXT DEFAULT 'UN',
  valor_unitario DECIMAL(12, 2),
  consignado BOOLEAN DEFAULT FALSE,
  controlado_anvisa BOOLEAN DEFAULT FALSE,
  lote_obrigatorio BOOLEAN DEFAULT TRUE,
  val
... (8486 caracteres total)
`
});
```

---

## 55. 202510201400_tabelas_precos_opme.sql

```typescript
mcp_supabase_apply_migration({
  name: "202510201400_tabelas_precos_opme",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE TABLE IF NOT EXISTS tabelas_precos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE RESTRICT,
  
  
  nome TEXT NOT NULL,
  codigo TEXT, 
  descricao TEXT,
  
  
  tipo TEXT CHECK (tipo IN (
    'fabricante',        
    'distribuidor',      
    'hospital',          
    'convenio',          
    'contrato',          
    'promocional',       
    'licitacao'          
  )) NOT NULL DEFAULT 'distribuidor',
  
  
  hospital_id
... (11943 caracteres total)
`
});
```

---

## 56. 202510201410_modulo_bi_completo.sql

```typescript
mcp_supabase_apply_migration({
  name: "202510201410_modulo_bi_completo",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE TABLE IF NOT EXISTS public.bi_dimensoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('tempo', 'produto', 'cliente', 'fornecedor', 'regiao', 'equipe', 'custom')) NOT NULL,
  tabela_origem TEXT,
  campos_mapeados JSONB,
  hierarquia TEXT[],
  descricao TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAUL
... (7202 caracteres total)
`
});
```

---

## 57. 202510201500_integracoes_comunicacao_opme.sql

```typescript
mcp_supabase_apply_migration({
  name: "202510201500_integracoes_comunicacao_opme",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE TABLE IF NOT EXISTS api_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  descricao TEXT,
  servico TEXT NOT NULL,
  metodo TEXT NOT NULL CHECK (metodo IN ('GET', 'POST', 'PUT', 'PATCH', 'DELETE')),
  url_base TEXT NOT NULL,
  url_path TEXT NOT NULL,
  auth_tipo TEXT CHECK (auth_tipo IN ('none', 'basic', 'bearer', 'api_key', 'oauth2')),
  auth_config JSONB DEFAULT '{}'::jsonb,
  rate_limit_requests INTEGER DEFAULT 100,
  rate_limit_window INTEGER 
... (8029 caracteres total)
`
});
```

---

## 58. 202510201600_api_credentials.sql

```typescript
mcp_supabase_apply_migration({
  name: "202510201600_api_credentials",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE TABLE IF NOT EXISTS api_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL, 
  servico TEXT NOT NULL, 
  valor TEXT, 
  categoria TEXT CHECK (categoria IN ('comunicacao', 'opme', 'apis', 'outros')) DEFAULT 'outros',
  tipo TEXT CHECK (tipo IN ('text', 'password', 'api_key', 'oauth2')) DEFAULT 'password',
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAM
... (7088 caracteres total)
`
});
```

---

## 59. 20251020_advanced_features.sql

```typescript
mcp_supabase_apply_migration({
  name: "20251020_advanced_features",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE TABLE IF NOT EXISTS system_health_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  
  cpu_usage_percent DECIMAL(5,2),
  memory_usage_percent DECIMAL(5,2),
  disk_usage_percent DECIMAL(5,2),
  
  
  db_connections_active INTEGER,
  db_connections_idle INTEGER,
  db_size_mb DECIMAL(15,2),
  db_query_avg_time_ms DECIMAL(10,2),
  
  
  api_sefaz_status VARCHAR(20), 
  api_anvisa_status VARCHAR(20),
  api_sefaz_response_
... (9692 caracteres total)
`
});
```

---

## 60. 20251020_api_gateway.sql

```typescript
mcp_supabase_apply_migration({
  name: "20251020_api_gateway",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE TABLE IF NOT EXISTS api_endpoints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  
  nome VARCHAR(100) NOT NULL UNIQUE, 
  descricao TEXT,
  
  
  servico VARCHAR(50) NOT NULL, 
  metodo VARCHAR(10) NOT NULL CHECK (metodo IN ('GET', 'POST', 'PUT', 'DELETE', 'PATCH')),
  url_base TEXT NOT NULL,
  url_path TEXT NOT NULL,
  
  
  headers_default JSONB DEFAULT '{}',
  
  
  auth_tipo VARCHAR(20) CHECK (auth_tipo IN ('none', 'api_key', 'bearer', 'basic', 'oauth2', 'certificate')),
  a
... (16927 caracteres total)
`
});
```

---

## 61. 20251020_bi_analytics.sql

```typescript
mcp_supabase_apply_migration({
  name: "20251020_bi_analytics",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE TABLE IF NOT EXISTS bi_dimensao_tempo (
  data_id SERIAL PRIMARY KEY,
  data_completa DATE NOT NULL UNIQUE,
  
  
  ano INTEGER NOT NULL,
  trimestre INTEGER NOT NULL CHECK (trimestre BETWEEN 1 AND 4),
  mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
  semana INTEGER NOT NULL CHECK (semana BETWEEN 1 AND 53),
  dia INTEGER NOT NULL CHECK (dia BETWEEN 1 AND 31),
  dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6), 
  dia_ano INTEGER NOT NULL CHECK (dia_ano BETWEEN 1 AND 366
... (16141 caracteres total)
`
});
```

---

## 62. 20251020_correcoes_lgpd_paciente_iniciais.sql

```typescript
mcp_supabase_apply_migration({
  name: "20251020_correcoes_lgpd_paciente_iniciais",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'cirurgias'
      AND column_name = 'paciente_iniciais'
  ) THEN
    ALTER TABLE public.cirurgias
      ADD COLUMN paciente_iniciais TEXT;
    
    COMMENT ON COLUMN public.cirurgias.paciente_iniciais IS 'Iniciais do paciente (LGPD minimização) ex: "J.S."';
    
    RAISE NOTICE '✅ Coluna paciente_iniciais adicionada';
  ELSE
    RAISE NOTICE '⚠️  Coluna pacient
... (3753 caracteres total)
`
});
```

---

## 63. 20251020_gestao_contabil.sql

```typescript
mcp_supabase_apply_migration({
  name: "20251020_gestao_contabil",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE TABLE IF NOT EXISTS plano_contas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  
  codigo VARCHAR(20) NOT NULL UNIQUE, 
  nome VARCHAR(200) NOT NULL,
  descricao TEXT,
  
  
  tipo VARCHAR(20) NOT NULL, 
  natureza VARCHAR(10) NOT NULL, 
  grau INTEGER NOT NULL, 
  conta_pai_id UUID REFERENCES plano_contas(id),
  
  
  aceita_lancamento BOOLEAN DEFAULT TRUE, 
  is_sintetica BOOLEAN DEFAULT FALSE, 
  
  
  exige_centro_custo BOOLEAN DEFAULT FALSE,
  
  
  integracao_tipo VARCHAR(
... (15958 caracteres total)
`
});
```

---

## 64. 20251020_kpi_dashboard_consolidado.sql

```typescript
mcp_supabase_apply_migration({
  name: "20251020_kpi_dashboard_consolidado",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE TABLE IF NOT EXISTS kpi_metas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  
  nome VARCHAR(100) NOT NULL UNIQUE, 
  descricao TEXT,
  categoria VARCHAR(50) NOT NULL, 
  
  
  valor_meta DECIMAL(15,2) NOT NULL,
  unidade VARCHAR(20) NOT NULL, 
  
  
  threshold_critico DECIMAL(15,2), 
  threshold_alerta DECIMAL(15,2), 
  threshold_ok DECIMAL(15,2), 
  threshold_excelente DECIMAL(15,2), 
  
  
  periodo VARCHAR(20) NOT NULL, 
  
  
  responsavel_role_id UUID REFERENCES roles(id)
... (13156 caracteres total)
`
});
```

---

## 65. 20251020_licitacoes_propostas.sql

```typescript
mcp_supabase_apply_migration({
  name: "20251020_licitacoes_propostas",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE TABLE IF NOT EXISTS licitacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  
  numero_edital VARCHAR(100) NOT NULL,
  titulo VARCHAR(300) NOT NULL,
  descricao TEXT,
  
  
  tipo VARCHAR(30) NOT NULL, 
  modalidade VARCHAR(30) NOT NULL, 
  
  
  orgao_comprador_tipo VARCHAR(30) NOT NULL, 
  orgao_comprador_nome VARCHAR(200) NOT NULL,
  orgao_comprador_cnpj VARCHAR(14),
  orgao_comprador_uf VARCHAR(2),
  orgao_comprador_cidade VARCHAR(100),
  
  
  portal VARCHAR(50), 
  url_po
... (10567 caracteres total)
`
});
```

---

## 66. 20251020_microsoft365_integration.sql

```typescript
mcp_supabase_apply_migration({
  name: "20251020_microsoft365_integration",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE TABLE IF NOT EXISTS microsoft_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  id_token TEXT,
  
  
  account_email VARCHAR(200) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  scopes TEXT[], 
  
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  
  
  UNIQUE(user_id)
);


CREATE TABL
... (7781 caracteres total)
`
});
```

---

## 67. 20251020_mv_kpis_dashboard.sql

```typescript
mcp_supabase_apply_migration({
  name: "20251020_mv_kpis_dashboard",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_kpis_empresa AS
SELECT
  e.id AS empresa_id,
  e.nome AS empresa_nome,
  
  
  COALESCE((
    SELECT SUM(f.valor_total)
    FROM faturas f
    WHERE f.empresa_id = e.id
      AND f.data_emissao >= date_trunc('month', CURRENT_DATE)
      AND f.status IN ('autorizada', 'paga')
      AND f.excluido_em IS NULL
  ), 0) AS faturamento_mensal,
  
  
  COALESCE((
    SELECT COUNT(*)
    FROM cirurgias c
    WHERE c.empresa_id = e.id
      AND c.status = '
... (6240 caracteres total)
`
});
```

---

## 68. 20251020_nfes_distribuidoras_opme.sql

```typescript
mcp_supabase_apply_migration({
  name: "20251020_nfes_distribuidoras_opme",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE TABLE IF NOT EXISTS nfes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  
  numero INTEGER NOT NULL,
  serie INTEGER NOT NULL DEFAULT 1,
  data_emissao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  data_saida TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('rascunho', 'processando', 'autorizada', 'rejeitada', 'cancelada', 'denegada')),
  
  
  chave_acesso VARCHAR(44), 
  protocolo_autorizacao VARCHAR(50),
  data_autorizacao TIMESTAMP WITH TIME ZONE
... (9618 caracteres total)
`
});
```

---

## 69. 20251020_notifications_workflows.sql

```typescript
mcp_supabase_apply_migration({
  name: "20251020_notifications_workflows",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'IN_APP',
  subject TEXT,
  message TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium', 
  metadata JSONB,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  
  INDEX idx_notifications_user (user_id),
  INDEX idx_notifications_read (read),
  INDEX idx_notifications_priority (pri
... (8332 caracteres total)
`
});
```

---

## 70. 20251020_pluggy_tables.sql

```typescript
mcp_supabase_apply_migration({
  name: "20251020_pluggy_tables",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE TABLE IF NOT EXISTS pluggy_connect_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  
  INDEX idx_pluggy_tokens_user (user_id),
  INDEX idx_pluggy_tokens_expires (expires_at)
);

COMMENT ON TABLE pluggy_connect_tokens IS 'Tokens de conexão do Pluggy Connect Widget';




CREATE TABLE IF NOT EXISTS pluggy_items (
  id UUID PRIMARY KEY DEFAU
... (9448 caracteres total)
`
});
```

---

## 71. 20251020_rbac_usuarios_permissoes.sql

```typescript
mcp_supabase_apply_migration({
  name: "20251020_rbac_usuarios_permissoes",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  
  nome VARCHAR(100) NOT NULL UNIQUE,
  descricao TEXT,
  
  
  nivel_hierarquia INTEGER DEFAULT 0, 
  role_pai_id UUID REFERENCES roles(id) ON DELETE SET NULL,
  
  
  tipo_role VARCHAR(50) CHECK (tipo_role IN ('system', 'comercial', 'financeiro', 'logistica', 'compliance', 'ti', 'custom')),
  
  
  is_system BOOLEAN DEFAULT FALSE, 
  is_active BOOLEAN DEFAULT TRUE,
  
  
  created_at TIMESTAMP WITH TIME Z
... (19027 caracteres total)
`
});
```

---

## 72. 20251020_relatorios_regulatorios.sql

```typescript
mcp_supabase_apply_migration({
  name: "20251020_relatorios_regulatorios",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE TABLE IF NOT EXISTS relatorios_regulatorios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  
  tipo VARCHAR(50) NOT NULL, 
  titulo VARCHAR(200) NOT NULL,
  descricao TEXT,
  
  
  orgao VARCHAR(50) NOT NULL, 
  obrigatoriedade VARCHAR(20) NOT NULL, 
  
  
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  periodo_referencia VARCHAR(50), 
  
  
  status VARCHAR(20) NOT NULL DEFAULT 'gerando', 
  
  
  formato VARCHAR(10) NOT NULL, 
  arquivo_url TEXT,
  arquivo_tamanho_byte
... (11606 caracteres total)
`
});
```

---

## 73. 20251020_workflow_builder.sql

```typescript
mcp_supabase_apply_migration({
  name: "20251020_workflow_builder",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  
  nome VARCHAR(200) NOT NULL,
  descricao TEXT,
  
  
  trigger_tipo VARCHAR(50) NOT NULL,
  
  trigger_config JSONB,
  
  
  
  
  steps JSONB NOT NULL,
  
  
  
  is_ativo BOOLEAN DEFAULT TRUE,
  is_template BOOLEAN DEFAULT FALSE, 
  
  
  total_execucoes INTEGER DEFAULT 0,
  ultima_execucao TIMESTAMP WITH TIME ZONE,
  proxima_execucao TIMESTAMP WITH TIME ZONE, 
  
  
  categoria VARCHAR(50), 
  
  

... (9081 caracteres total)
`
});
```

---

## 74. 20251023140YYY_create_ml_vectors_table.sql

```typescript
mcp_supabase_apply_migration({
  name: "20251023140YYY_create_ml_vectors_table",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "vector";


create or replace function public.set_current_timestamp_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;


create table if not exists public.ml_vectors (
  id uuid primary key default gen_random_uuid(),
  external_id text not null,
  module text not null,
  metadata jsonb default '{}'::jsonb,
 
... (1020 caracteres total)
`
});
```

---

## 75. 20251023143707_create_ml_vectors_table.sql

```typescript
mcp_supabase_apply_migration({
  name: "20251023143707_create_ml_vectors_table",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
`
});
```

---

## 76. 20251025_create_12_missing_triggers.sql

```typescript
mcp_supabase_apply_migration({
  name: "20251025_create_12_missing_triggers",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE OR REPLACE FUNCTION trg_update_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$;


CREATE OR REPLACE FUNCTION trg_audit_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.audit_log (
    tabela,
    operacao,
    registro_id,
    dados_novos,
    usuario_id,
    criado_em
  ) VALUES (
    TG_TABLE_NAME,
    'INSERT',
    NEW.id,
    row_to_json(NEW),
    COALESCE(current_setting('app.current_user_id', true)
... (12191 caracteres total)
`
});
```

---

## 77. 20251025_create_14_missing_rpcs.sql

```typescript
mcp_supabase_apply_migration({
  name: "20251025_create_14_missing_rpcs",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
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
    c
... (22241 caracteres total)
`
});
```

---

## 78. 20251025_create_materialized_views.sql

```typescript
mcp_supabase_apply_migration({
  name: "20251025_create_materialized_views",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
DROP MATERIALIZED VIEW IF EXISTS public.mv_dashboard_kpis CASCADE;
CREATE MATERIALIZED VIEW public.mv_dashboard_kpis AS
SELECT 
  e.id as empresa_id,
  e.nome as empresa_nome,
  
  
  COUNT(DISTINCT c.id) FILTER (WHERE c.data_cirurgia >= CURRENT_DATE - INTERVAL '30 days') as cirurgias_mes,
  COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'FINALIZADA' AND c.data_cirurgia >= CURRENT_DATE - INTERVAL '30 days') as cirurgias_finalizadas_mes,
  COALESCE(SUM(c.valor_total) FILTER (WHERE c.status = 'FINA
... (15416 caracteres total)
`
});
```

---

## 79. 20251025_create_missing_critical_tables.sql

```typescript
mcp_supabase_apply_migration({
  name: "20251025_create_missing_critical_tables",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE TABLE IF NOT EXISTS public.consignacao_materiais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  
  numero_consignacao VARCHAR(50) NOT NULL,
  tipo_consignacao VARCHAR(20) NOT NULL CHECK (tipo_consignacao IN ('ENTRADA', 'SAIDA', 'DEVOLUCAO')),
  status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'APROVADA', 'REJEITADA', 'FINALIZADA', 'CANCELADA')),
  
  
  cirurgia_id UUID REFERE
... (14930 caracteres total)
`
});
```

---

## 80. 20251025_implement_rls_policies.sql

```typescript
mcp_supabase_apply_migration({
  name: "20251025_implement_rls_policies",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
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



CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = publi
... (9378 caracteres total)
`
});
```

---

## 81. 20251026_agent_orchestration_system.sql

```typescript
mcp_supabase_apply_migration({
  name: "20251026_agent_orchestration_system",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; 
CREATE EXTENSION IF NOT EXISTS "btree_gin"; 





CREATE TABLE IF NOT EXISTS agent_tasks (
  task_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  
  parent_task_id UUID REFERENCES agent_tasks(task_id) ON DELETE CASCADE,
  session_id UUID, 
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  
  query_text TEXT NOT NULL,
  task_description TEXT,
  task_type VARCHAR(100) CHECK (task_ty
... (20082 caracteres total)
`
});
```

---

## 82. 20251026_external_integrations.sql

```typescript
mcp_supabase_apply_migration({
  name: "20251026_external_integrations",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; 





CREATE TABLE IF NOT EXISTS iot_devices (
  device_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  
  device_uid TEXT NOT NULL UNIQUE, 
  device_type VARCHAR(100) CHECK (device_type IN (
    'rfid_reader',
    'rfid_tag',
    'temperature_sensor',
    'humidity_sensor',
    'location_tracker',
    'barcode_scanner',
    'weighing_s
... (17991 caracteres total)
`
});
```

---

## 83. 20251026_webhook_system.sql

```typescript
mcp_supabase_apply_migration({
  name: "20251026_webhook_system",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";





CREATE TABLE IF NOT EXISTS webhook_endpoints (
  endpoint_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  
  name TEXT NOT NULL,
  description TEXT,
  
  
  url TEXT NOT NULL,
  method VARCHAR(10) DEFAULT 'POST' CHECK (method IN ('POST', 'PUT', 'PATCH')),
  
  
  auth_type VARCHAR(50) CHECK (auth_type IN ('none', 'basic', 'bearer',
... (11778 caracteres total)
`
});
```

---

## 84. 20251027013614_enable_rls_critical_tables.sql

```typescript
mcp_supabase_apply_migration({
  name: "20251027013614_enable_rls_critical_tables",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;


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


CREATE POLICY "usuarios_insert_policy"
  ON public.usuarios
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR au
... (26543 caracteres total)
`
});
```

---

## 85. 20251117210505_create_storage_buckets.sql

```typescript
mcp_supabase_apply_migration({
  name: "20251117210505_create_storage_buckets",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documentos_cirurgias',
  'documentos_cirurgias',
  FALSE, 
  10485760, 
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;




INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  '
... (2346 caracteres total)
`
});
```

---

## 86. 20251117_backend_multitenant_fix.sql

```typescript
mcp_supabase_apply_migration({
  name: "20251117_backend_multitenant_fix",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
BEGIN;






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
ALTER TABLE pub
... (23581 caracteres total)
`
});
```

---

## 87. 20251117_backend_multitenant_fix_v2.sql

```typescript
mcp_supabase_apply_migration({
  name: "20251117_backend_multitenant_fix_v2",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
BEGIN;




DO $$
BEGIN
  RAISE NOTICE '🔍 Validando pré-requisitos da migration 20251117_v2...';

  
  IF NOT EXISTS (SELECT 1 FROM public.empresas LIMIT 1) THEN
    RAISE EXCEPTION '❌ CRITICAL: Tabela empresas está vazia. Insira ao menos 1 empresa antes de aplicar migration.';
  END IF;
  RAISE NOTICE '✅ Empresas: % encontradas', (SELECT COUNT(*) FROM public.empresas);

  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'pr
... (27545 caracteres total)
`
});
```

---

## 88. 20251118000229_enable_api_credentials_rls.sql

```typescript
mcp_supabase_apply_migration({
  name: "20251118000229_enable_api_credentials_rls",
  project_id: "gvbkviozlhxorjoavmky",
  query: `
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
      RAISE EXCEPTION 'Não é permit
... (2995 caracteres total)
`
});
```

---


## ✅ Status

- [ ] Fase 1: Init Schema (0001-0006) - 6 migrações
- [ ] Fase 2: Cadastros (0007-0013) - 7 migrações
- [ ] Fase 3: Módulos Core (20251018-20251020) - ~30 migrações
- [ ] Fase 4: Features Avançadas (202510201244+) - ~20 migrações
- [ ] Fase 5: Correções e Ajustes (20251023+) - ~20 migrações
- [ ] Fase 6: Storage Buckets (CREATE_STORAGE_BUCKETS.sql) - 1 migração

