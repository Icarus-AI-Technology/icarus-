# 🤖 Sistema de Agentes ICARUS

> Coordenação inteligente de IA, Compliance e Gestão para ERP OPME

## 🚀 Quick Start

```bash
# 1. Validar topologia de IA
NODE_ENV=development node tools/ia/ia-validator.js

# 2. Diagnóstico completo
node tools/tutor/diagnosticar-sistema.js

# 3. Classificar gaps
node tools/tutor/classificar-gaps.js
```

## 📋 Agentes Disponíveis

| Agente                  | Papel             | Comandos Principais                       |
| ----------------------- | ----------------- | ----------------------------------------- |
| **Orquestrador-ICARUS** | Coordenação e IA  | Entry point, playbooks                    |
| **Contador**            | Fiscal/Tributário | check-fiscal-erp, list-obrigacoes         |
| **Advogado**            | Legal/Compliance  | check-compliance-erp, monitor-regulatorio |
| **Gestão-Empresarial**  | Estratégia/KPIs   | map-kpis-executivos, auditar-modulos      |
| **Tutor-Conselheiro**   | Decisões/IA       | diagnosticar, classificar-gaps            |
| **IA-Validator**        | Topologia IA      | validar-topologia, auditar-edge-functions |

## 🎯 Comandos Rápidos

### Validação de IA

```bash
# Desenvolvimento (permite localhost)
NODE_ENV=development node tools/ia/ia-validator.js

# Produção (bloqueia localhost)
NODE_ENV=production \
  SUPABASE_FUNCTIONS_URL=https://<project>.supabase.co/functions/v1 \
  node tools/ia/ia-validator.js
```

### Compliance

```bash
# Fiscal
node tools/compliance/fiscal/check-erp-fiscal.js

# Legal
node tools/compliance/legal/check-erp-legal.js

# Parecer consolidado
node tools/tutor/parecer-compliance.js
```

### Gestão

```bash
# KPIs executivos
node tools/analytics/map-kpis-executivos.js

# Auditar módulos
node tools/audit/auditar-modulos.js

# Sugestões de melhoria
node tools/audit/sugerir-melhorias.js
```

## 🏗️ Estrutura

```
.cursor/
└── agents.json              # Configuração dos agentes

tools/
├── ia/                      # IA-Validator
│   ├── ia-validator.js
│   ├── check-edge-functions.js
│   └── auto-fix-configs.js
├── compliance/
│   ├── fiscal/              # Contador
│   │   ├── check-erp-fiscal.js
│   │   ├── list-obrigacoes.js
│   │   └── generate-alerts.js
│   └── legal/               # Advogado
│       ├── check-erp-legal.js
│       └── monitor-regulatorio.js
├── analytics/               # Gestão
│   └── map-kpis-executivos.js
├── audit/                   # Gestão
│   ├── auditar-modulos.js
│   └── sugerir-melhorias.js
└── tutor/                   # Tutor-Conselheiro
    ├── diagnosticar-sistema.js
    ├── sumario-executivo.js
    ├── parecer-compliance.js
    ├── classificar-gaps.js
    └── gerar-tutores-por-modulo.js
```

## 📊 Políticas de IA

### DEV vs PROD

| Serviço        | DEV                | PROD         |
| -------------- | ------------------ | ------------ |
| Ollama         | ✅ localhost:11434 | ❌ Bloqueado |
| Meilisearch    | ✅ localhost:7700  | ☁️ Cloud     |
| PostHog        | ✅ localhost:8000  | ☁️ Cloud     |
| Edge Functions | ✅ Local           | ☁️ Supabase  |

### Hard Fails em Produção

- ❌ `http://localhost`
- ❌ `127.0.0.1`
- ❌ `ws://localhost`
- ❌ Ollama local

## 🎭 Playbooks

### 1. Conformidade Total de IA

```bash
node tools/ia/ia-validator.js
node tools/ia/check-edge-functions.js
node tools/tutor/sumario-executivo.js
```

### 2. Benchmark ERP OPME

```bash
node tools/analytics/map-kpis-executivos.js
node tools/compliance/legal/check-erp-legal.js
node tools/compliance/fiscal/check-erp-fiscal.js
node tools/tutor/parecer-compliance.js
```

### 3. Priorizar Funcionalidades

```bash
node tools/audit/auditar-modulos.js
node tools/compliance/legal/check-erp-legal.js
node tools/compliance/fiscal/check-erp-fiscal.js
node tools/tutor/classificar-gaps.js
```

## 📈 Priorização

| Nível          | Prazo      | Exemplos                          |
| -------------- | ---------- | --------------------------------- |
| 🔴 **CRÍTICO** | 30-45 dias | TISS 4.1, Rastreabilidade ANVISA  |
| 🟡 **MÉDIO**   | 60-90 dias | ISO 13485, SPED                   |
| 🟢 **BAIXO**   | 90+ dias   | ML Preditivo, Dashboard Executivo |

## 📄 Relatórios

Salvos em `.cursor/agents/<agente>/`:

```
.cursor/agents/
├── ia-validator/validation-<timestamp>.json
├── contador/alertas-<timestamp>.json
├── gestao/auditoria-modulos-<timestamp>.json
└── tutor/diagnostico-<timestamp>.json
```

## 🔧 Próximos Passos

1. ✅ Estrutura de agentes implementada
2. ✅ Scripts de validação funcionais
3. 🔄 Integração com chatbot (em desenvolvimento)
4. 🔄 Tutores IA por módulo (planejado)
5. 🔄 Edge Functions em produção (em implantação)

## 📚 Documentação Completa

Ver: [`docs/GUIA_AGENTES_ICARUS.md`](docs/GUIA_AGENTES_ICARUS.md)

## 🤝 Contribuir

Adicionar novos comandos:

1. Criar em `tools/<categoria>/`
2. `chmod +x tools/<categoria>/script.js`
3. Adicionar em `.cursor/agents.json`
4. Documentar aqui

---

**Sistema ICARUS v5.0** | Desenvolvido com ❤️ e IA
