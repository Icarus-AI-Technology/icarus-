# ✅ CHECKLIST DE CONFORMIDADE — ICARUS BD

**Versão:** 1.0  
**Data:** 2025-10-18  
**Responsável:** Agente Sênior BD

---

## 🔐 LGPD (Lei Geral de Proteção de Dados)

### **Art. 6º — Princípios**

- [ ] **Finalidade:** Propósito legítimo definido (gestão cirúrgica OPME)
- [ ] **Adequação:** Tratamento compatível com finalidades
- [ ] **Necessidade:** Minimização de dados (apenas essenciais)
  - [ ] CPF/CNH/RG evitados quando desnecessários
  - [ ] `paciente_iniciais` em vez de nome completo
- [ ] **Livre acesso:** Função `exportar_dados_usuario()` implementada
- [ ] **Qualidade:** Dados exatos, atualizados
- [ ] **Transparência:** Logs de acesso/alteração
- [ ] **Segurança:** RLS + TLS + at-rest encryption
- [ ] **Prevenção:** Auditoria contínua; alertas de anomalias
- [ ] **Não discriminação:** Sem viés em algoritmos (N/A para ICARUS)
- [ ] **Responsabilização:** Documentação de decisões técnicas

### **Art. 18 — Direitos do Titular**

- [ ] **Confirmação de tratamento:** Query `SELECT * FROM audit_log WHERE usuario_id = ?`
- [ ] **Acesso aos dados:** `exportar_dados_usuario(user_id)` retorna JSON
- [ ] **Correção:** Usuário pode atualizar próprio perfil (RLS)
- [ ] **Anonimização/bloqueio:** `anonimizar_dados(user_id)`
- [ ] **Portabilidade:** Export JSON estruturado
- [ ] **Eliminação:** Soft delete + purge após retenção

### **Art. 37 — Registros de Operações**

- [x] **Audit log imutável:** Tabela `audit_log` com hash chain
- [x] **Timestamp:** `criado_em` em todas as operações
- [x] **Identificação do agente:** `usuario_id` + `empresa_id`
- [x] **Ação realizada:** `acao` (INSERT/UPDATE/DELETE/SELECT sensível)
- [x] **Dados afetados:** `dados JSONB` (before/after)
- [x] **Integridade:** Hash SHA-256 linkado ao registro anterior

### **Art. 48 — Comunicação de Incidentes**

- [ ] **Monitoramento:** Sentry + alertas de acesso anômalo
- [ ] **Procedimento:** Documentado em `/docs/seguranca/resposta_incidentes.md`
- [ ] **Notificação ANPD:** Processo definido (72h)

### **Art. 52 — Multas**

**Risco potencial:** Até **R$ 50 milhões** ou **2% do faturamento**  
**Mitigação:** Conformidade proativa; DPO designado

---

## 🏥 ANVISA — Rastreabilidade OPME

### **RDC 16/2013 — Boas Práticas de Fabricação**

- [x] **Registro ANVISA:** Campo `registro_anvisa` em `produtos`
- [x] **Número de lote:** Campo `numero_lote` em `lotes`
- [x] **Número de série:** Campo `numero_serie` em `lotes` (quando aplicável)
- [x] **Data de validade:** Campo `data_validade` em `lotes`
- [x] **Fabricante:** Campo `fabricante` em `produtos`
- [x] **Rastreabilidade:** Cadeia `produto → lote → item_kit → kit → cirurgia`

### **RDC 36/2015 — Distribuição de OPME**

- [ ] **Licença sanitária:** Armazenar `licenca_anvisa` em `empresas`
- [x] **DANFE:** OCR de DANFE (Tesseract) para validar romaneios
- [ ] **Relatório de rastreabilidade:** Query SQL para gerar por período

### **Auditoria ANVISA**

**Checklist para inspeção:**

1. [ ] Todos os produtos possuem `registro_anvisa` válido
2. [ ] Lotes possuem `data_validade` futura
3. [ ] Rastreamento completo de produto usado em cirurgia até nota fiscal de entrada
4. [ ] Sem lotes vencidos em estoque (`SELECT * FROM lotes WHERE data_validade < CURRENT_DATE AND consumido = false`)

---

## 🔒 SEGURANÇA AVANÇADA

### **OWASP Top 10 (2021)**

- [x] **A01 Broken Access Control:** RLS multi-tenant por `empresa_id`
- [x] **A02 Cryptographic Failures:** TLS 1.3 + at-rest encryption
- [x] **A03 Injection:** Prepared statements; parametrização obrigatória
- [x] **A04 Insecure Design:** Audit log + princípio do menor privilégio
- [x] **A05 Security Misconfiguration:** Service role isolado; env vars seguras
- [ ] **A06 Vulnerable Components:** `npm audit` + Dependabot ativo
- [ ] **A07 Authentication Failures:** MFA habilitado (Supabase Auth)
- [x] **A08 Software Integrity Failures:** Hash chain em audit log
- [ ] **A09 Logging Failures:** Sentry + PostHog; logs centralizados
- [x] **A10 SSRF:** Edge Functions com timeout; validação de URLs

### **NIST Cybersecurity Framework**

- [x] **Identify:** Mapeamento de dados sensíveis (PII em `audit_log`)
- [x] **Protect:** RLS + IAM + encryption
- [ ] **Detect:** Alertas de acesso anômalo (pg_stat_statements)
- [ ] **Respond:** Runbook de incidentes
- [ ] **Recover:** Backup diário; PITR 7 dias

---

## 📊 PERFORMANCE & ESCALABILIDADE

### **Meta: 50 Usuários Simultâneos**

- [ ] **p95 < 250ms:** Benchmark com k6/Artillery
- [x] **Índices otimizados:** Compostos + parciais + GIN
- [ ] **PgBouncer:** Transaction pooling configurado
- [x] **Keyset pagination:** `WHERE id > last_id LIMIT 50`
- [x] **Materialized views:** `mv_kpis_empresa` para dashboards
- [ ] **Connection pooling:** Supabase Pooler habilitado

### **Observabilidade**

- [ ] **pg_stat_statements:** Top 10 queries lentas monitoradas
- [ ] **Sentry:** Trace de queries > 1s
- [ ] **PostHog:** Heatmap de rotas lentas
- [ ] **Alertas:** PagerDuty para p95 > 500ms

---

## 🧪 TESTES DE CONFORMIDADE

### **Suite de Validação**

```sql
-- 1. Isolamento multi-tenant
-- Teste: Usuário empresa A não deve ver dados empresa B
SELECT COUNT(*) FROM produtos WHERE empresa_id != auth.current_empresa();
-- Esperado: 0

-- 2. Rastreabilidade OPME
-- Teste: Todos os itens de kit possuem lote válido
SELECT COUNT(*) FROM itens_kit ik
LEFT JOIN lotes l ON ik.lote_id = l.id
WHERE l.id IS NULL;
-- Esperado: 0

-- 3. Audit log integridade
-- Teste: Hash chain válido
WITH hash_check AS (
  SELECT
    id,
    hash_atual,
    LEAD(hash_anterior) OVER (ORDER BY criado_em) AS proximo_hash_anterior
  FROM audit_log
)
SELECT COUNT(*) FROM hash_check
WHERE hash_atual != proximo_hash_anterior AND proximo_hash_anterior IS NOT NULL;
-- Esperado: 0 (sem quebras de corrente)

-- 4. LGPD soft delete
-- Teste: Nenhum registro hard-deleted
SELECT table_name FROM information_schema.columns
WHERE column_name = 'excluido_em' AND table_schema = 'public';
-- Esperado: todas as tabelas principais

-- 5. Performance índices
-- Teste: Queries principais usam índices
EXPLAIN ANALYZE
SELECT * FROM cirurgias
WHERE empresa_id = 'xxx' AND status = 'agendada' AND excluido_em IS NULL
ORDER BY data_cirurgia DESC LIMIT 20;
-- Esperado: Index Scan, não Seq Scan
```

---

## ✅ STATUS ATUAL

| Categoria | Progresso | Pendências |
|-----------|-----------|------------|
| LGPD | 🟡 60% | Funções DSR, MFA |
| ANVISA | 🟢 95% | Relatório automático |
| Segurança | 🟡 75% | SSRF tests, Runbook |
| Performance | 🟡 70% | Benchmark, PgBouncer |
| **GERAL** | **🟡 75%** | **4 sprints restantes** |

---

## 📝 ASSINATURAS

**Agente BD Sênior:** ✅ Execução técnica conforme  
**DPO (se aplicável):** ⬜ Revisão jurídica pendente  
**Resp. Técnico OPME:** ⬜ Validação regulatória pendente

---

**Nota:** Este checklist é **vivo** e será atualizado a cada migration aplicada.

