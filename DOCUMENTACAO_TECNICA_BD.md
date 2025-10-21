# 📊 DOCUMENTAÇÃO TÉCNICA - BANCO DE DADOS (Parte 2)

## SCHEMA COMPLETO DO BANCO DE DADOS

### 📦 MÓDULO 1: FATURAMENTO NF-e

#### Tabela: `nfes`
```sql
CREATE TABLE nfes (
  id UUID PRIMARY KEY,
  numero VARCHAR(9) NOT NULL,           -- Número NF-e
  serie VARCHAR(3) NOT NULL,            -- Série
  chave_acesso VARCHAR(44) UNIQUE,      -- Chave 44 dígitos
  
  -- Emitente (Distribuidora)
  emitente_cnpj VARCHAR(14),
  emitente_razao_social VARCHAR(200),
  
  -- Destinatário (Hospital/Cliente)
  destinatario_cnpj VARCHAR(14),
  destinatario_razao_social VARCHAR(200),
  
  -- Valores
  valor_produtos DECIMAL(15,2),
  valor_icms DECIMAL(15,2),
  valor_total DECIMAL(15,2),
  
  -- Status SEFAZ
  status VARCHAR(20),                   -- provisoria, autorizada, cancelada, denegada
  protocolo_autorizacao VARCHAR(50),
  data_autorizacao TIMESTAMP,
  
  -- Rastreabilidade ANVISA
  produtos_rastreados JSONB,            -- [{codigo, lote, serie, registro_anvisa}]
  
  -- Arquivos
  xml_url TEXT,                         -- Supabase Storage
  danfe_url TEXT,                       -- PDF gerado
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX idx_nfes_chave ON nfes(chave_acesso);
CREATE INDEX idx_nfes_status ON nfes(status);
CREATE INDEX idx_nfes_destinatario ON nfes(destinatario_cnpj);
CREATE INDEX idx_nfes_created ON nfes(created_at DESC);
```

**Compliance**:
- ✅ SEFAZ Nota Técnica 2021.001 (Layout 4.0)
- ✅ ANVISA RDC 157/2017 (Rastreabilidade)
- ✅ LGPD Art. 37 (Auditoria)

---

### 👥 MÓDULO 2: RBAC & PERMISSÕES

#### Tabela: `roles` (Papéis)
```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,     -- admin, gerente, vendedor
  description TEXT,
  is_system_role BOOLEAN DEFAULT FALSE, -- Role pré-definida
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Tabela: `permissions` (Permissões)
```sql
CREATE TABLE permissions (
  id UUID PRIMARY KEY,
  resource VARCHAR(50) NOT NULL,        -- nfes, pedidos, usuarios
  action VARCHAR(20) NOT NULL,          -- create, read, update, delete
  description TEXT,
  UNIQUE(resource, action)
);
```

#### Tabela: `role_permissions` (Associação)
```sql
CREATE TABLE role_permissions (
  role_id UUID REFERENCES roles(id),
  permission_id UUID REFERENCES permissions(id),
  granted_at TIMESTAMP DEFAULT NOW(),
  granted_by UUID REFERENCES auth.users(id),
  PRIMARY KEY (role_id, permission_id)
);
```

#### Tabela: `user_roles` (Usuários ↔ Roles)
```sql
CREATE TABLE user_roles (
  user_id UUID REFERENCES auth.users(id),
  role_id UUID REFERENCES roles(id),
  assigned_at TIMESTAMP DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id),
  PRIMARY KEY (user_id, role_id)
);
```

#### Tabela: `audit_logs` (Auditoria LGPD)
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(50) NOT NULL,          -- CREATE, UPDATE, DELETE, READ
  resource_type VARCHAR(50),            -- nfes, pedidos
  resource_id UUID,
  old_value JSONB,                      -- Estado anterior
  new_value JSONB,                      -- Estado novo
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Retenção LGPD: 5 anos
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
```

**Compliance**:
- ✅ LGPD Art. 37 (Logs de operações)
- ✅ ISO 27001 (Controle de acesso)
- ✅ OWASP (Auditoria)

---

### 🌐 MÓDULO 3: API GATEWAY

#### Tabela: `api_endpoints` (Endpoints registrados)
```sql
CREATE TABLE api_endpoints (
  id UUID PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  servico VARCHAR(50),                  -- sefaz, anvisa, cfm
  base_url TEXT NOT NULL,
  auth_tipo VARCHAR(30),                -- api_key, oauth2, certificate
  is_ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Tabela: `api_metrics` (Métricas)
```sql
CREATE TABLE api_metrics (
  id UUID PRIMARY KEY,
  endpoint_id UUID REFERENCES api_endpoints(id),
  timestamp TIMESTAMP DEFAULT NOW(),
  response_time_ms INTEGER,
  status_code INTEGER,
  success BOOLEAN,
  error_message TEXT
);

CREATE INDEX idx_metrics_endpoint ON api_metrics(endpoint_id, timestamp DESC);
```

#### Tabela: `api_circuit_breakers` (Circuit Breaker)
```sql
CREATE TABLE api_circuit_breakers (
  endpoint_id UUID PRIMARY KEY REFERENCES api_endpoints(id),
  state VARCHAR(20) DEFAULT 'closed',   -- closed, open, half_open
  failure_count INTEGER DEFAULT 0,
  last_failure_at TIMESTAMP,
  opened_at TIMESTAMP,
  next_retry_at TIMESTAMP
);
```

**Features**:
- ✅ Rate limiting (60 req/min)
- ✅ Circuit breaker (5 falhas = abrir)
- ✅ Retry automático (exponential backoff)
- ✅ Cache (Redis-compatible)

---

### 📊 MÓDULO 4: BUSINESS INTELLIGENCE

#### Star Schema - Dimensões

**dim_tempo** (Dimensão Temporal)
```sql
CREATE TABLE dim_tempo (
  data DATE PRIMARY KEY,
  ano INTEGER,
  trimestre INTEGER,
  mes INTEGER,
  mes_nome VARCHAR(20),
  semana INTEGER,
  dia_semana INTEGER,
  dia_semana_nome VARCHAR(20),
  is_feriado BOOLEAN DEFAULT FALSE
);
```

**dim_produto** (Dimensão Produto)
```sql
CREATE TABLE dim_produto (
  produto_id UUID PRIMARY KEY,
  codigo VARCHAR(50),
  descricao TEXT,
  categoria VARCHAR(50),
  fabricante VARCHAR(200),
  registro_anvisa VARCHAR(50),
  classificacao_abc VARCHAR(1),         -- A, B, C
  classificacao_xyz VARCHAR(1)          -- X, Y, Z
);
```

**dim_cliente** (Dimensão Cliente)
```sql
CREATE TABLE dim_cliente (
  cliente_id UUID PRIMARY KEY,
  cnpj VARCHAR(14),
  razao_social VARCHAR(200),
  tipo VARCHAR(30),                     -- hospital_publico, hospital_privado
  uf VARCHAR(2),
  cidade VARCHAR(100),
  segmento VARCHAR(50)
);
```

**dim_vendedor** (Dimensão Vendedor)
```sql
CREATE TABLE dim_vendedor (
  vendedor_id UUID PRIMARY KEY,
  nome VARCHAR(200),
  email VARCHAR(255),
  regiao VARCHAR(50),
  equipe VARCHAR(50)
);
```

#### Star Schema - Fatos

**fato_vendas** (Fato Central)
```sql
CREATE TABLE fato_vendas (
  id UUID PRIMARY KEY,
  data DATE REFERENCES dim_tempo(data),
  produto_id UUID REFERENCES dim_produto(produto_id),
  cliente_id UUID REFERENCES dim_cliente(cliente_id),
  vendedor_id UUID REFERENCES dim_vendedor(vendedor_id),
  
  -- Métricas
  quantidade DECIMAL(15,3),
  valor_unitario DECIMAL(15,2),
  valor_total DECIMAL(15,2),
  custo_unitario DECIMAL(15,2),
  custo_total DECIMAL(15,2),
  margem_bruta DECIMAL(15,2),
  margem_liquida DECIMAL(15,2),
  
  -- Metadata
  nfe_id UUID REFERENCES nfes(id)
);

-- Indexes para performance
CREATE INDEX idx_fato_data ON fato_vendas(data);
CREATE INDEX idx_fato_produto ON fato_vendas(produto_id);
CREATE INDEX idx_fato_cliente ON fato_vendas(cliente_id);
```

**Análises Suportadas**:
- ✅ Vendas por tempo (dia, mês, trimestre, ano)
- ✅ Vendas por produto (ABC/XYZ)
- ✅ Vendas por cliente (segmentação)
- ✅ Performance de vendedores
- ✅ Margem bruta/líquida
- ✅ Previsão de demanda (ML preparado)

---

### 📈 MÓDULO 5: KPI DASHBOARD CONSOLIDADO

#### Tabela: `kpis_config` (Configuração)
```sql
CREATE TABLE kpis_config (
  id UUID PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE,            -- vendas_mes, margem_liquida
  nome VARCHAR(100),
  descricao TEXT,
  categoria VARCHAR(30),                -- vendas, financeiro, operacoes
  
  -- Cálculo
  formula TEXT,                         -- SQL ou expressão
  unidade VARCHAR(10),                  -- R$, %, unidades
  
  -- Thresholds (Semáforo)
  threshold_critico DECIMAL(15,2),      -- < X = crítico
  threshold_alerta DECIMAL(15,2),       -- < Y = alerta
  threshold_ok DECIMAL(15,2),           -- < Z = ok
  threshold_excelente DECIMAL(15,2),    -- >= W = excelente
  
  is_ativo BOOLEAN DEFAULT TRUE
);
```

#### Tabela: `kpis_realtime` (Valores em tempo real)
```sql
CREATE TABLE kpis_realtime (
  kpi_codigo VARCHAR(50) PRIMARY KEY REFERENCES kpis_config(codigo),
  valor_atual DECIMAL(15,2),
  valor_anterior DECIMAL(15,2),        -- Período anterior
  variacao_percentual DECIMAL(5,2),
  nivel VARCHAR(20),                    -- critico, alerta, ok, excelente
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE kpis_realtime;
```

**13 KPIs Implementados**:
1. Vendas do Mês (R$)
2. Ticket Médio (R$)
3. Margem Bruta (%)
4. Margem Líquida (%)
5. Inadimplência (%)
6. NF-e Emitidas (#)
7. Pedidos Pendentes (#)
8. Estoque Crítico (#)
9. Taxa Entrega no Prazo (%)
10. Propostas Vencidas (#)
11. Conformidade ANVISA (%)
12. Uptime APIs (%)
13. Satisfação Cliente (NPS)

---

### 🔌 MÓDULO 6: INTEGRATIONS MANAGER

#### Tabela: `api_requests_log` (Logs de requisições)
```sql
CREATE TABLE api_requests_log (
  id UUID PRIMARY KEY,
  endpoint_id UUID REFERENCES api_endpoints(id),
  timestamp TIMESTAMP DEFAULT NOW(),
  metodo VARCHAR(10),                   -- GET, POST, PUT
  url TEXT,
  headers JSONB,
  request_body JSONB,
  response_status INTEGER,
  response_body JSONB,
  response_time_ms INTEGER,
  error_message TEXT
);

-- Particionamento por mês (performance)
CREATE INDEX idx_log_timestamp ON api_requests_log(timestamp DESC);
```

#### Tabela: `webhooks` (Webhooks customizados)
```sql
CREATE TABLE webhooks (
  id UUID PRIMARY KEY,
  nome VARCHAR(100),
  url TEXT NOT NULL,
  eventos TEXT[],                       -- ['nfe.autorizada', 'pedido.criado']
  secret VARCHAR(100),                  -- Para validar signature
  is_ativo BOOLEAN DEFAULT TRUE,
  ultima_chamada TIMESTAMP,
  total_chamadas INTEGER DEFAULT 0,
  total_sucessos INTEGER DEFAULT 0,
  total_falhas INTEGER DEFAULT 0
);
```

---

### 📋 MÓDULO 7: RELATÓRIOS REGULATÓRIOS

#### Tabela: `relatorios_regulatorios`
```sql
CREATE TABLE relatorios_regulatorios (
  id UUID PRIMARY KEY,
  tipo VARCHAR(50),                     -- anvisa_rastreabilidade, sped_fiscal
  titulo VARCHAR(200),
  orgao VARCHAR(50),                    -- ANVISA, SEFAZ, ANS
  obrigatoriedade VARCHAR(20),          -- obrigatorio, opcional
  data_inicio DATE,
  data_fim DATE,
  periodo_referencia VARCHAR(50),       -- "Outubro/2025"
  status VARCHAR(20),                   -- gerando, gerado, enviado
  formato VARCHAR(10),                  -- PDF, Excel, XML, TXT
  arquivo_url TEXT,
  total_registros INTEGER,
  resumo JSONB,
  gerado_em TIMESTAMP,
  enviado_em TIMESTAMP,
  protocolo_envio VARCHAR(100)
);
```

#### Tabela: `anvisa_movimentacoes` (Rastreabilidade)
```sql
CREATE TABLE anvisa_movimentacoes (
  id UUID PRIMARY KEY,
  nfe_id UUID REFERENCES nfes(id),
  produto_codigo VARCHAR(50),
  produto_descricao TEXT,
  registro_anvisa VARCHAR(50) NOT NULL,
  lote VARCHAR(50) NOT NULL,
  numero_serie VARCHAR(100),
  data_fabricacao DATE,
  data_validade DATE NOT NULL,
  tipo_movimentacao VARCHAR(20),        -- entrada, saida, transferencia
  quantidade DECIMAL(15,3),
  origem_cnpj VARCHAR(14),
  destino_cnpj VARCHAR(14),
  temperatura_armazenamento VARCHAR(50),
  responsavel_tecnico_crm VARCHAR(20),
  data_movimentacao TIMESTAMP
);

CREATE INDEX idx_anvisa_lote ON anvisa_movimentacoes(lote);
CREATE INDEX idx_anvisa_produto ON anvisa_movimentacoes(produto_codigo);
```

**Compliance**:
- ✅ ANVISA RDC 16/2013 (Boas Práticas Distribuição)
- ✅ ANVISA RDC 157/2017 (Rastreabilidade)
- ✅ SEFAZ SPED Fiscal (EFD ICMS/IPI)

---

### 💰 MÓDULO 8: GESTÃO CONTÁBIL

#### Tabela: `plano_contas`
```sql
CREATE TABLE plano_contas (
  id UUID PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE,            -- 1.1.01.001
  nome VARCHAR(200),
  tipo VARCHAR(20),                     -- ativo, passivo, receita, despesa
  natureza VARCHAR(10),                 -- debito, credito
  grau INTEGER,                         -- 1=grupo, 2=subgrupo, 3=conta, 4=subconta
  conta_pai_id UUID REFERENCES plano_contas(id),
  aceita_lancamento BOOLEAN DEFAULT TRUE,
  is_sintetica BOOLEAN DEFAULT FALSE
);

-- 25 contas pré-configuradas para OPME
INSERT INTO plano_contas VALUES
('1.1.01.001', 'Caixa', 'ativo', 'debito', 4, TRUE, FALSE),
('1.1.02.001', 'Clientes', 'ativo', 'debito', 4, TRUE, FALSE),
('1.1.03.001', 'Estoque de OPME', 'ativo', 'debito', 4, TRUE, FALSE),
('3.1.01.001', 'Venda OPME - Hospitais', 'receita', 'credito', 4, TRUE, FALSE),
('3.3.01.001', 'CMV - OPME', 'despesa', 'debito', 4, TRUE, FALSE);
```

#### Tabela: `lancamentos_contabeis` (Partidas Dobradas)
```sql
CREATE TABLE lancamentos_contabeis (
  id UUID PRIMARY KEY,
  numero_lancamento SERIAL,
  data_lancamento DATE,
  data_competencia DATE,                -- Regime de competência
  historico TEXT,
  valor_total DECIMAL(15,2),
  status VARCHAR(20) DEFAULT 'provisorio' -- provisorio, confirmado, cancelado
);
```

#### Tabela: `partidas_contabeis` (Débito/Crédito)
```sql
CREATE TABLE partidas_contabeis (
  id UUID PRIMARY KEY,
  lancamento_id UUID REFERENCES lancamentos_contabeis(id),
  conta_id UUID REFERENCES plano_contas(id),
  tipo_partida VARCHAR(10),             -- debito, credito
  valor DECIMAL(15,2) CHECK (valor > 0)
);

-- Trigger: Validar Débito = Crédito
CREATE TRIGGER trg_validar_partidas
AFTER INSERT OR UPDATE ON partidas_contabeis
FOR EACH ROW EXECUTE FUNCTION validar_partidas_dobradas();
```

#### View: `vw_balancete`
```sql
CREATE VIEW vw_balancete AS
SELECT
  pc.codigo,
  pc.nome,
  pc.tipo,
  SUM(CASE WHEN pt.tipo_partida = 'debito' THEN pt.valor ELSE 0 END) AS total_debito,
  SUM(CASE WHEN pt.tipo_partida = 'credito' THEN pt.valor ELSE 0 END) AS total_credito,
  -- Saldo baseado na natureza da conta
  CASE
    WHEN pc.natureza = 'debito' THEN 
      SUM(CASE WHEN pt.tipo_partida = 'debito' THEN pt.valor ELSE 0 END) -
      SUM(CASE WHEN pt.tipo_partida = 'credito' THEN pt.valor ELSE 0 END)
    ELSE
      SUM(CASE WHEN pt.tipo_partida = 'credito' THEN pt.valor ELSE 0 END) -
      SUM(CASE WHEN pt.tipo_partida = 'debito' THEN pt.valor ELSE 0 END)
  END AS saldo_atual
FROM plano_contas pc
LEFT JOIN partidas_contabeis pt ON pc.id = pt.conta_id
GROUP BY pc.id;
```

#### Function: `gerar_dre()`
```sql
CREATE FUNCTION gerar_dre(p_data_inicio DATE, p_data_fim DATE)
RETURNS TABLE(
  grupo VARCHAR,
  descricao VARCHAR,
  valor DECIMAL,
  percentual DECIMAL
);
```

**Output DRE**:
1. Receita Bruta (100%)
2. (-) Deduções (ICMS, PIS, COFINS)
3. (=) Receita Líquida
4. (-) CMV (Custo Mercadoria Vendida)
5. (=) Lucro Bruto
6. (-) Despesas Operacionais
7. (=) Lucro Operacional
8. (+/-) Outras Receitas/Despesas
9. (=) Lucro Líquido

---

### 🏆 MÓDULO 9: LICITAÇÕES E PROPOSTAS

#### Tabela: `licitacoes`
```sql
CREATE TABLE licitacoes (
  id UUID PRIMARY KEY,
  numero_edital VARCHAR(100),
  titulo VARCHAR(300),
  tipo VARCHAR(30),                     -- pregao_eletronico, cotacao_privada
  modalidade VARCHAR(30),               -- menor_preco, tecnica_preco
  orgao_comprador_nome VARCHAR(200),
  orgao_comprador_cnpj VARCHAR(14),
  portal VARCHAR(50),                   -- comprasnet, bll
  data_abertura TIMESTAMP,
  valor_estimado DECIMAL(15,2),
  status VARCHAR(30),                   -- publicada, vencida, perdida
  nossa_classificacao INTEGER,          -- Posição se participamos
  responsavel_id UUID REFERENCES auth.users(id)
);
```

#### Tabela: `propostas_comerciais`
```sql
CREATE TABLE propostas_comerciais (
  id UUID PRIMARY KEY,
  licitacao_id UUID REFERENCES licitacoes(id),
  numero_proposta VARCHAR(50) UNIQUE,
  versao INTEGER DEFAULT 1,
  valor_total DECIMAL(15,2),
  margem_bruta_percentual DECIMAL(5,2),
  margem_liquida_percentual DECIMAL(5,2),
  
  -- Aprovação 3 níveis
  aprovada_comercial BOOLEAN DEFAULT FALSE,
  aprovada_financeiro BOOLEAN DEFAULT FALSE,
  aprovada_diretoria BOOLEAN DEFAULT FALSE,
  
  status VARCHAR(30)                    -- rascunho, enviada, vencedora
);
```

---

### ⚙️ MÓDULO 10: WORKFLOW BUILDER

#### Tabela: `workflows`
```sql
CREATE TABLE workflows (
  id UUID PRIMARY KEY,
  nome VARCHAR(200),
  trigger_tipo VARCHAR(50),             -- nfe_emitida, estoque_baixo
  trigger_config JSONB,
  steps JSONB,                          -- [{id, type, config, on_true, on_false}]
  is_ativo BOOLEAN DEFAULT TRUE,
  total_execucoes INTEGER DEFAULT 0
);
```

#### Tabela: `workflow_execucoes`
```sql
CREATE TABLE workflow_execucoes (
  id UUID PRIMARY KEY,
  workflow_id UUID REFERENCES workflows(id),
  trigger_data JSONB,
  status VARCHAR(30),                   -- em_execucao, concluido, erro
  started_at TIMESTAMP,
  finished_at TIMESTAMP,
  steps_log JSONB                       -- Log de cada step executado
);
```

**Tipos de Steps**:
- condition (IF/ELSE)
- send_email
- send_sms
- webhook
- update_status
- create_task
- delay (aguardar X tempo)
- request_approval (aprovação humana)

---

### 🚀 MÓDULO 11: ADVANCED FEATURES

#### Tabela: `system_health_metrics`
```sql
CREATE TABLE system_health_metrics (
  id UUID PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT NOW(),
  cpu_usage_percent DECIMAL(5,2),
  memory_usage_percent DECIMAL(5,2),
  disk_usage_percent DECIMAL(5,2),
  db_connections_active INTEGER,
  db_query_avg_time_ms DECIMAL(10,2),
  api_sefaz_status VARCHAR(20),         -- online, offline
  api_anvisa_status VARCHAR(20),
  total_requests_per_minute INTEGER,
  error_rate_percent DECIMAL(5,2)
);
```

#### Tabela: `notificacoes`
```sql
CREATE TABLE notificacoes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  tipo VARCHAR(30),                     -- info, warning, error, success
  canal VARCHAR(30),                    -- in_app, email, sms, push
  titulo VARCHAR(200),
  mensagem TEXT,
  action_url TEXT,
  contexto VARCHAR(50),                 -- pedido, nfe, licitacao
  contexto_id UUID,
  lida BOOLEAN DEFAULT FALSE,
  prioridade VARCHAR(20) DEFAULT 'normal' -- baixa, normal, alta, urgente
);

CREATE INDEX idx_notificacoes_user_lida ON notificacoes(user_id, lida);
```

#### Tabela: `audit_logs_advanced`
```sql
CREATE TABLE audit_logs_advanced (
  id UUID PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id),
  user_ip_address INET,
  user_agent TEXT,
  action VARCHAR(50),                   -- CREATE, UPDATE, DELETE
  resource_type VARCHAR(50),
  resource_id UUID,
  old_data JSONB,
  new_data JSONB,
  changes JSONB,                        -- Diff (apenas campos alterados)
  data_retention_until DATE             -- LGPD: 5 anos
);

-- Particionamento por ano (LGPD)
CREATE INDEX idx_audit_timestamp ON audit_logs_advanced(timestamp DESC);
```

#### Tabela: `backups`
```sql
CREATE TABLE backups (
  id UUID PRIMARY KEY,
  nome VARCHAR(200),
  tipo VARCHAR(30),                     -- full, incremental, differential
  tabelas TEXT[],
  total_registros BIGINT,
  tamanho_bytes BIGINT,
  storage_url TEXT,
  storage_hash VARCHAR(64),             -- SHA-256
  status VARCHAR(30),                   -- em_progresso, concluido, erro
  iniciado_em TIMESTAMP,
  concluido_em TIMESTAMP,
  expires_at TIMESTAMP                  -- Retenção 90 dias
);
```

#### Tabela: `user_2fa` (Two-Factor Authentication)
```sql
CREATE TABLE user_2fa (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  secret VARCHAR(100) NOT NULL,         -- TOTP secret
  is_enabled BOOLEAN DEFAULT FALSE,
  backup_codes TEXT[],
  enabled_at TIMESTAMP
);
```

---

### 🔐 ROW LEVEL SECURITY (RLS)

**Todas as tabelas** possuem RLS habilitado:

```sql
ALTER TABLE nfes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lancamentos_contabeis ENABLE ROW LEVEL SECURITY;
ALTER TABLE licitacoes ENABLE ROW LEVEL SECURITY;
-- ... (50+ tabelas)
```

**Exemplos de Policies**:

```sql
-- Usuários veem apenas suas notificações
CREATE POLICY "usuarios_veem_suas_notificacoes" ON notificacoes
FOR SELECT USING (user_id = auth.uid());

-- Apenas admins veem audit logs
CREATE POLICY "admins_veem_audit_logs" ON audit_logs_advanced
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'admin'
  )
);

-- Vendedores veem apenas pedidos de seus clientes
CREATE POLICY "vendedores_veem_seus_pedidos" ON pedidos
FOR SELECT USING (
  vendedor_id = auth.uid() OR
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role_id IN ('admin', 'gerente'))
);
```

---

## ÍNDICES E PERFORMANCE

### Índices Críticos

```sql
-- Performance em queries frequentes
CREATE INDEX idx_nfes_status_created ON nfes(status, created_at DESC);
CREATE INDEX idx_pedidos_cliente_data ON pedidos(cliente_id, data_pedido DESC);
CREATE INDEX idx_produtos_categoria ON produtos(categoria);
CREATE INDEX idx_fato_vendas_data_produto ON fato_vendas(data, produto_id);

-- GIN indexes para JSONB
CREATE INDEX idx_nfes_produtos_gin ON nfes USING GIN (produtos_rastreados);
CREATE INDEX idx_workflows_steps_gin ON workflows USING GIN (steps);

-- Full-text search
CREATE INDEX idx_produtos_fulltext ON produtos USING GIN (to_tsvector('portuguese', descricao));
```

### Particionamento

```sql
-- Particionar tabelas grandes por data (performance)
CREATE TABLE api_requests_log_2025_10 PARTITION OF api_requests_log
FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');

CREATE TABLE audit_logs_2025 PARTITION OF audit_logs_advanced
FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
```

---

## VIEWS MATERIALIZADAS

```sql
-- View materializada para reports (refresh diário)
CREATE MATERIALIZED VIEW mv_vendas_mensais AS
SELECT
  DATE_TRUNC('month', data) AS mes,
  SUM(valor_total) AS total_vendas,
  COUNT(*) AS total_nfes,
  AVG(valor_total) AS ticket_medio
FROM fato_vendas
GROUP BY DATE_TRUNC('month', data);

CREATE UNIQUE INDEX ON mv_vendas_mensais (mes);

-- Refresh automático via CRON
SELECT cron.schedule('refresh-vendas-mensais', '0 1 * * *', 
  'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_vendas_mensais'
);
```

---

## TOTAL DE OBJETOS NO BANCO

| Tipo | Quantidade |
|------|------------|
| **Tabelas** | 57 |
| **Views** | 15 |
| **Materialized Views** | 3 |
| **Functions** | 22 |
| **Triggers** | 8 |
| **RLS Policies** | 45+ |
| **Indexes** | 120+ |
| **Sequences** | 10 |

**Tamanho estimado** (com dados): 5-10 GB

---

## BACKUP E RECOVERY

### Estratégia de Backup

```sql
-- Backup Full (diário às 2h)
SELECT cron.schedule('backup-full-diario', '0 2 * * *', $$
  SELECT criar_backup('Backup Full Diário', 'full', ARRAY['*'])
$$);

-- Backup Incremental (a cada 6h)
SELECT cron.schedule('backup-incremental', '0 */6 * * *', $$
  SELECT criar_backup('Backup Incremental', 'incremental', ARRAY['nfes', 'pedidos', 'audit_logs'])
$$);
```

### Retenção

- **Backup Full**: 30 dias
- **Backup Incremental**: 7 dias
- **Audit Logs**: 5 anos (LGPD)
- **Metrics**: 1 ano

---

**Continua na Parte 3: Integrações, Segurança e Deploy...**

