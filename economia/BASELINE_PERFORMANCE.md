# 📊 BASELINE DE PERFORMANCE — ICARUS v5.0

**Data:** 2025-10-20  
**Equipe:** AGENTE_EQUIPE_ECONOMIA_AI_TUTORES  
**Versão:** 1.0.0

---

## 🎯 OBJETIVO

Estabelecer **métricas de baseline** de performance para:
- Comparar antes/depois de otimizações
- Detectar regressões
- Validar economia de custos
- Garantir SLOs (Service Level Objectives)

---

## 📊 RESUMO EXECUTIVO

| Categoria | Status Atual | Meta | Gap |
|-----------|--------------|------|-----|
| **Frontend Performance** | ⚠️ A medir | Lighthouse 98+ | TBD |
| **Backend Performance** | ⚠️ A medir | p95 < 200ms | TBD |
| **Bundle Size** | ~250KB (estimado) | <220KB | -30KB |
| **Custos Mensais** | US$ 0-50 (não monitorado) | <US$ 50 | TBD |
| **Uptime** | 99%+ (estimado) | 99.9% | TBD |

⚠️ **CRÍTICO**: Muitas métricas ainda **não são monitoradas** — prioridade para implementar!

---

## 🌐 FRONTEND PERFORMANCE

### **Lighthouse Scores (Meta: 98+)**

| Página | Performance | Accessibility | Best Practices | SEO | PWA |
|--------|-------------|---------------|----------------|-----|-----|
| Dashboard Principal | TBD | TBD | TBD | TBD | TBD |
| Cirurgias (Kanban) | TBD | TBD | TBD | TBD | TBD |
| Estoque | TBD | TBD | TBD | TBD | TBD |
| Financeiro | TBD | TBD | TBD | TBD | TBD |
| CRM | TBD | TBD | TBD | TBD | TBD |

**Como medir:**
```bash
npm run qa:perf
# Gera relatório em docs/lh-root.json
```

### **Core Web Vitals**

| Métrica | Atual | Meta | Status |
|---------|-------|------|--------|
| **FCP** (First Contentful Paint) | TBD | <1.8s | ⏳ |
| **LCP** (Largest Contentful Paint) | TBD | <2.5s | ⏳ |
| **FID** (First Input Delay) | TBD | <100ms | ⏳ |
| **CLS** (Cumulative Layout Shift) | TBD | <0.1 | ⏳ |
| **TTI** (Time to Interactive) | TBD | <2s | ⏳ |

**Meta de acordo com README existente**: TTI <2s, Lighthouse 98+

### **Bundle Size**

| Arquivo | Tamanho (estimado) | Meta |
|---------|------------|------|
| `index.js` | ~180KB (gzipped) | <160KB |
| `vendor.js` | ~70KB (gzipped) | <60KB |
| **Total** | **~250KB** | **<220KB** |

**Como medir:**
```bash
npm run build
du -sh dist/assets/*.js
```

**Oportunidades de redução:**
- Remover `axios` → `fetch` (-50KB)
- Remover `node-fetch` (-40KB)
- Lazy load Microsoft Graph (-80KB)
- Lazy load Recharts (-60KB)
- **Total economia**: -230KB raw (~70KB gzipped)

---

## 🐘 BACKEND PERFORMANCE

### **Latência de Queries (p50/p95/p99)**

| Query Tipo | p50 | p95 | p99 | Meta p95 |
|------------|-----|-----|-----|----------|
| SELECT simples | TBD | TBD | TBD | <50ms |
| JOIN 2-3 tabelas | TBD | TBD | TBD | <100ms |
| Queries complexas | TBD | TBD | TBD | <200ms |
| Dashboard KPIs | TBD | TBD | TBD | <150ms |

**Como medir:**
```bash
npm run db:sql-top
# Analisa pg_stat_statements
```

### **Cache Hit Ratio**

| Métrica | Atual | Meta |
|---------|-------|------|
| **Cache Hit Ratio** | TBD | >99% |
| **Buffer Cache** | TBD | >95% |

**Como medir:**
```sql
SELECT 
  ROUND((SUM(heap_blks_hit) / NULLIF(SUM(heap_blks_hit + heap_blks_read), 0) * 100)::numeric, 2) as cache_hit_pct
FROM pg_statio_user_tables;
```

### **Índices**

| Métrica | Atual | Meta |
|---------|-------|------|
| **Índices criados** | 35+ (conforme README) | 35+ (manter) |
| **Índices não usados** | TBD | 0 |
| **Seq scans > 1000** | TBD | <5 tabelas |

### **Conexões**

| Métrica | Atual | Meta |
|---------|-------|------|
| **Conexões ativas** | TBD | <20 |
| **Conexões max** | TBD | 100 (Supabase Free) |
| **Deadlocks** | TBD | 0/dia |

---

## 💰 CUSTOS

### **Supabase**

| Recurso | Uso Atual | Limite Free | Status |
|---------|-----------|-------------|--------|
| **Storage** | TBD | 500MB | ⏳ A monitorar |
| **Egress** | TBD | 5GB/mês | ⏳ A monitorar |
| **Auth Users (MAU)** | TBD | 50k | ⏳ A monitorar |

**Comando:**
```bash
npm run db:check-storage
```

### **APIs Externas (Estimado)**

| Serviço | Uso Estimado | Custo/mês |
|---------|--------------|-----------|
| OpenAI (GPT-4) | TBD | US$ 0-500+ |
| Anthropic (Claude) | TBD | US$ 0-200+ |
| Hotjar | TBD | US$ 0-39+ |
| Mixpanel | TBD | US$ 0-25+ |
| **Total** | **TBD** | **US$ 0-764+** |

⚠️ **CRÍTICO**: Implementar monitoramento de tokens/requisições!

---

## 📡 UPTIME & DISPONIBILIDADE

| Métrica | Atual | Meta |
|---------|-------|------|
| **Uptime** | TBD | 99.9% |
| **MTBF** (Mean Time Between Failures) | TBD | >720h (30 dias) |
| **MTTR** (Mean Time To Recovery) | TBD | <15min |

**Como monitorar:**
- UptimeRobot (Free: 50 monitors)
- Pingdom
- Status page interno

---

## 🧪 TESTES

### **Cobertura (Atual: 85%+)**

| Tipo | Cobertura Atual | Meta |
|------|-----------------|------|
| **Unitários** | 85%+ (README) | 90% |
| **Integração** | TBD | 70% |
| **E2E** | TBD | 50% (fluxos críticos) |

### **Tempo de Execução**

| Suite | Tempo | Meta |
|-------|-------|------|
| Unitários | TBD | <30s |
| E2E | TBD | <5min |
| Build | ~2.5s (README) | <3s |

---

## 🎯 PROCEDIMENTO DE MEDIÇÃO

### **1. Frontend Performance**

```bash
# 1. Build produção
npm run build

# 2. Iniciar preview
npm run preview:start

# 3. Executar Lighthouse (em outra janela)
npm run qa:perf

# 4. Analisar resultados
cat docs/lh-root.json | jq '.categories'
```

### **2. Backend Performance**

```bash
# 1. Configurar variáveis
export SUPABASE_DB_URL="postgresql://..."

# 2. Executar análise SQL
npm run db:sql-top

# 3. Ver relatório
cat docs/economia/SQL_PERFORMANCE_REPORT.md
```

### **3. Bundle Size**

```bash
# 1. Build
npm run build

# 2. Analisar tamanhos
du -sh dist/assets/*.js | sort -h

# 3. Análise detalhada (opcional)
npx vite-bundle-visualizer
```

### **4. Custos**

```bash
# 1. Gerar relatório
npm run cost:report

# 2. Ver análise
cat docs/economia/COST_REPORT.md
```

---

## 📅 CRONOGRAMA DE MEDIÇÃO

| Métrica | Frequência | Responsável |
|---------|------------|-------------|
| Lighthouse | Semanal (automatizado) | PM2 (ecosystem) |
| SQL Performance | Semanal (automatizado) | PM2 (ecosystem) |
| Bundle Size | A cada build | CI/CD |
| Custos | Semanal (segunda 9h) | PM2 (ecosystem) |
| Uptime | Contínuo (1min) | UptimeRobot |

---

## 🚦 SLOs (Service Level Objectives)

### **Performance**

| Métrica | SLO |
|---------|-----|
| **Lighthouse Score** | ≥98/100 em 95% das medições |
| **LCP** | <2.5s em 75% das visitas |
| **FID** | <100ms em 95% das interações |
| **p95 SQL** | <200ms em 95% das queries |

### **Disponibilidade**

| Métrica | SLO |
|---------|-----|
| **Uptime** | 99.9% (43min downtime/mês) |
| **Error Rate** | <1% das requisições |

### **Custos**

| Métrica | SLO |
|---------|-----|
| **Custo Total** | <US$ 50/mês (baseline) |
| **Custo por Usuário** | <US$ 2/mês |

---

## ✅ PRÓXIMOS PASSOS

### **Imediato (Esta Semana)**

- [ ] Executar primeira medição completa de Lighthouse
- [ ] Executar análise SQL Top
- [ ] Medir bundle size atual
- [ ] Configurar UptimeRobot (monitoramento gratuito)

### **Curto Prazo (2 Semanas)**

- [ ] Implementar monitoramento de custos de APIs
- [ ] Configurar alertas automáticos (Sentry)
- [ ] Criar dashboard de métricas (Grafana/PostHog)
- [ ] Estabelecer baselines definitivos

### **Médio Prazo (1 Mês)**

- [ ] Comparar métricas pós-otimizações
- [ ] Validar economia real vs estimada
- [ ] Ajustar SLOs baseado em dados reais
- [ ] Publicar relatório executivo

---

## 📈 TEMPLATE DE COMPARAÇÃO

Use este template após cada otimização:

```markdown
## Comparação: [Nome da Otimização]

| Métrica | Antes | Depois | Δ | Status |
|---------|-------|--------|---|--------|
| Lighthouse | X | Y | +Z | ✅/❌ |
| LCP | X | Y | -Z | ✅/❌ |
| Bundle Size | X | Y | -Z | ✅/❌ |
| p95 SQL | X | Y | -Z | ✅/❌ |
| Custo/mês | X | Y | -Z | ✅/❌ |

**Impacto**: [Positivo/Negativo/Neutro]
**Regressões**: [Nenhuma / Listar]
**Recomendação**: [Manter / Rollback]
```

---

**© 2025 ICARUS v5.0 - AGENTE_EQUIPE_ECONOMIA_AI_TUTORES**

