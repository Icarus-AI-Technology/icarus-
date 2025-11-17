# 🤖 Guia Completo de Agentes ICARUS

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Estrutura de Agentes](#estrutura-de-agentes)
3. [Como Usar](#como-usar)
4. [Agentes Disponíveis](#agentes-disponíveis)
5. [Comandos e Ferramentas](#comandos-e-ferramentas)
6. [Validação de IA](#validação-de-ia)
7. [Playbooks](#playbooks)
8. [Referências](#referências)

---

## 🎯 Visão Geral

O sistema ICARUS conta com **5 agentes especializados** que trabalham de forma coordenada para garantir:

- ✅ **Conformidade Legal e Fiscal** (ANVISA, ANS, LGPD, Tributário)
- ✅ **Gestão Estratégica** (KPIs, Análise de Módulos, ROI)
- ✅ **Inteligência Artificial Nativa** (Edge Functions, Tutores IA)
- ✅ **Auditoria e Compliance** (Automatizada e Contínua)
- ✅ **Tutoria Executiva** (Decisões Baseadas em Dados)

### 🏗️ Arquitetura

```
Orquestrador-ICARUS (Entry Point)
    ├── Contador (Fiscal/Tributário)
    ├── Advogado (Legal/Compliance)
    ├── Gestão-Empresarial (Estratégia/KPIs)
    ├── Tutor-Conselheiro (Decisões/IA)
    └── IA-Validator (Topologia/Validação)
```

---

## 🤖 Estrutura de Agentes

### 1️⃣ **Orquestrador-ICARUS** (Entry Point)

**Papel:** Coordenador principal e especialista em IA aplicada a ERPs OPME.

**Responsabilidades:**

- Garantir IAs nativas em produção via Supabase Edge Functions
- Coordenar subagentes para análise completa
- Manter Icarus à frente tecnologicamente
- Implementar tutores IA por módulo

**Políticas:**

#### Topologia de IA

| Serviço        | DEV                                   | PROD                                         |
| -------------- | ------------------------------------- | -------------------------------------------- |
| Ollama         | `http://localhost:11434`              | ❌ Desabilitado                              |
| Meilisearch    | `http://localhost:7700`               | ☁️ Cloud Only                                |
| PostHog        | `http://localhost:8000`               | ☁️ Cloud Only                                |
| Edge Functions | `http://localhost:54321/functions/v1` | `https://<project>.supabase.co/functions/v1` |

#### Hard Fails em Produção

- ❌ `http://localhost`
- ❌ `127.0.0.1`
- ❌ `ws://localhost`
- ❌ Ollama local

---

### 2️⃣ **Contador**

**Papel:** Especialista tributário (Lucro Real/Presumido) e automação fiscal.

**Comandos:**

```bash
# Verificar conformidade fiscal do ERP
node tools/compliance/fiscal/check-erp-fiscal.js

# Mapear obrigações acessórias
node tools/compliance/fiscal/list-obrigacoes.js

# Simular tributação Lucro Real
node tools/finance/simulador-lucro-real.js

# Gerar alertas fiscais
node tools/compliance/fiscal/generate-alerts.js
```

**Expertise:**

- Lucro Real / Presumido
- SPED / EFD / NF-e
- Obrigações acessórias
- IA para automação fiscal

---

### 3️⃣ **Advogado**

**Papel:** Compliance legal (ANVISA/ANS/LGPD/ISO 13485).

**Comandos:**

```bash
# Verificar conformidade legal
node tools/compliance/legal/check-erp-legal.js

# Auditar contratos
node tools/legal/contracts-audit.js

# Monitor regulatório ANVISA/ANS
node tools/compliance/legal/monitor-regulatorio.js
```

**Expertise:**

- ANVISA (RDC, rastreabilidade)
- ANS (TISS, padrões)
- LGPD / ISO 13485
- Contratos e auditoria

---

### 4️⃣ **Gestão-Empresarial**

**Papel:** Análise estratégica e KPIs executivos.

**Comandos:**

```bash
# Mapear KPIs executivos
node tools/analytics/map-kpis-executivos.js

# Auditar módulos do sistema
node tools/audit/auditar-modulos.js

# Sugerir melhorias
node tools/audit/sugerir-melhorias.js
```

**Expertise:**

- KPIs financeiros/operacionais
- Análise dos 58+ módulos
- ROI e margens
- Relatórios estratégicos

---

### 5️⃣ **Tutor-Conselheiro**

**Papel:** Decisões estratégicas com IA e recomendações executivas.

**Comandos:**

```bash
# Diagnóstico completo do sistema
node tools/tutor/diagnosticar-sistema.js

# Sumário executivo
node tools/tutor/sumario-executivo.js

# Parecer de compliance
node tools/tutor/parecer-compliance.js

# Classificar gaps (critico/medio/baixo)
node tools/tutor/classificar-gaps.js

# Gerar tutores IA por módulo
node tools/tutor/gerar-tutores-por-modulo.js
```

**Expertise:**

- Análise de cenários
- Priorização (critico/medio/baixo)
- Tutores IA acionáveis
- Pareceres executivos

---

### 6️⃣ **IA-Validator**

**Papel:** Validar topologia de IA e garantir conformidade dev/prod.

**Comandos:**

```bash
# Validar topologia completa
node tools/ia/ia-validator.js

# Auditar Edge Functions
node tools/ia/check-edge-functions.js

# Auto-corrigir configurações
node tools/ia/auto-fix-configs.js
```

**Expertise:**

- Validação de endpoints
- Edge Functions (Supabase)
- Bloqueio de localhost em prod
- Relatórios de conformidade

---

## 🚀 Como Usar

### Instalação

```bash
cd /Users/daxmeneghel/icarus-make

# Verificar estrutura
ls .cursor/agents.json
ls -R tools/
```

### Execução de Comandos

#### 1. Validação de IA (Recomendado começar aqui)

```bash
# Desenvolvimento
NODE_ENV=development node tools/ia/ia-validator.js

# Produção (bloqueia localhost)
NODE_ENV=production \
  VITE_SUPABASE_URL=https://<project>.supabase.co \
  VITE_SUPABASE_ANON_KEY=<key> \
  SUPABASE_FUNCTIONS_URL=https://<project>.supabase.co/functions/v1 \
  node tools/ia/ia-validator.js
```

#### 2. Auditoria Fiscal

```bash
# Verificar conformidade fiscal
node tools/compliance/fiscal/check-erp-fiscal.js

# Listar obrigações acessórias
node tools/compliance/fiscal/list-obrigacoes.js

# Simular Lucro Real
node tools/finance/simulador-lucro-real.js
```

#### 3. Auditoria Legal

```bash
# Compliance ANVISA/ANS/LGPD
node tools/compliance/legal/check-erp-legal.js

# Monitor regulatório
node tools/compliance/legal/monitor-regulatorio.js
```

#### 4. Análise Executiva

```bash
# KPIs executivos
node tools/analytics/map-kpis-executivos.js

# Auditar módulos
node tools/audit/auditar-modulos.js

# Diagnóstico completo
node tools/tutor/diagnosticar-sistema.js
```

#### 5. Priorização de Gaps

```bash
# Classificar gaps (critico/medio/baixo)
node tools/tutor/classificar-gaps.js

# Sugestões de melhoria
node tools/audit/sugerir-melhorias.js
```

---

## 📚 Playbooks

### 1. IA Conformidade Total

**Objetivo:** Auditar toda topologia de IA.

```bash
# Passo 1: Validar topologia
node tools/ia/ia-validator.js

# Passo 2: Auditar Edge Functions
node tools/ia/check-edge-functions.js

# Passo 3: Sumário executivo
node tools/tutor/sumario-executivo.js
```

**Deliverable:** `docs/relatorio_ia_conformidade.md`

---

### 2. Benchmark ERP OPME

**Objetivo:** Comparar Icarus com 3 melhores ERPs OPME.

```bash
# Passo 1: KPIs executivos
node tools/analytics/map-kpis-executivos.js

# Passo 2: Compliance legal
node tools/compliance/legal/check-erp-legal.js

# Passo 3: Compliance fiscal
node tools/compliance/fiscal/check-erp-fiscal.js

# Passo 4: Parecer final
node tools/tutor/parecer-compliance.js
```

---

### 3. Priorizar Funcionalidades

**Objetivo:** Identificar gaps e ranquear por prioridade.

```bash
# Passo 1: Auditar módulos
node tools/audit/auditar-modulos.js

# Passo 2: Requisitos legais
node tools/compliance/legal/check-erp-legal.js

# Passo 3: Requisitos fiscais
node tools/compliance/fiscal/check-erp-fiscal.js

# Passo 4: Classificar gaps
node tools/tutor/classificar-gaps.js
```

---

## 🔒 Validação de IA

### Checagens Realizadas

| Serviço            | DEV                  | PROD                      | Ação em Falha                  |
| ------------------ | -------------------- | ------------------------- | ------------------------------ |
| **Ollama**         | ✅ Permitido         | ❌ Bloqueado              | Warning (dev) / OK (prod)      |
| **Meilisearch**    | ✅ localhost:7700    | ☁️ Cloud Only             | Error se localhost em prod     |
| **PostHog**        | ✅ localhost:8000    | ☁️ Cloud Only             | Error se localhost em prod     |
| **Supabase**       | ✅ localhost:54321   | ☁️ Cloud Only             | Error se localhost em prod     |
| **Edge Functions** | ✅ Local             | ☁️ https://\*.supabase.co | Hard fail se localhost em prod |
| **Tesseract**      | ✅ /public/tesseract | ✅ /public/tesseract      | Warning se ausente             |

### Exemplo de Relatório

```json
{
  "timestamp": "2025-10-27T13:47:40.378Z",
  "environment": "development",
  "summary": {
    "total": 5,
    "passed": 2,
    "warnings": 2,
    "failed": 0
  },
  "checks": [
    {
      "service": "ollama",
      "status": "ok",
      "endpoint": "http://localhost:11434",
      "models": ["llama3.1:8b"]
    },
    {
      "service": "supabase",
      "status": "ok",
      "url": "https://project.supabase.co",
      "edge_functions": "https://project.supabase.co/functions/v1"
    }
  ]
}
```

---

## 📊 Relatórios Gerados

Todos os relatórios são salvos em `.cursor/agents/<agente>/`:

```
.cursor/agents/
├── ia-validator/
│   ├── validation-<timestamp>.json
│   ├── edge-functions-<timestamp>.json
│   └── auto-fix-<timestamp>.json
├── contador/
│   └── alertas-<timestamp>.json
├── gestao/
│   └── auditoria-modulos-<timestamp>.json
└── tutor/
    ├── diagnostico-<timestamp>.json
    └── gaps-classificados-<timestamp>.json
```

---

## 🎯 Priorização

Todos os agentes seguem a mesma classificação:

| Nível          | Descrição                         | Prazo Típico |
| -------------- | --------------------------------- | ------------ |
| 🔴 **CRÍTICO** | Bloqueia operação ou conformidade | 30-45 dias   |
| 🟡 **MÉDIO**   | Importante mas não urgente        | 60-90 dias   |
| 🟢 **BAIXO**   | Melhoria incremental              | 90+ dias     |

---

## 🛠️ Desenvolvimento

### Adicionar Novo Comando

1. Criar script em `tools/<categoria>/`
2. Tornar executável: `chmod +x tools/<categoria>/script.js`
3. Adicionar em `.cursor/agents.json` no agente correspondente
4. Documentar aqui

### Exemplo

```javascript
#!/usr/bin/env node
// tools/<categoria>/<nome>.js

console.log("Executando...");

const resultado = {
  timestamp: new Date().toISOString(),
  // ... dados
};

export default resultado;
```

---

## 📞 Suporte

### Issues Comuns

**1. "Erro: localhost bloqueado em produção"**

```bash
# Verificar NODE_ENV
echo $NODE_ENV

# Deve ser 'production'
export NODE_ENV=production

# Configurar variáveis de produção
export SUPABASE_FUNCTIONS_URL=https://<project>.supabase.co/functions/v1
```

**2. "Modelos Ollama não encontrados"**

```bash
# Em dev, verificar Ollama
curl http://localhost:11434/api/tags

# Instalar modelo se necessário
ollama pull llama3.1:8b
```

**3. "Edge Functions não encontradas"**

```bash
# Verificar diretório
ls supabase/functions/

# Criar função de exemplo
supabase functions new exemplo
```

---

## 🎓 Tutores IA (Roadmap)

### Tutores Planejados

1. **Assistente Cirúrgico** → Gestão de Cirurgias
2. **Assistente de Estoque** → Estoque/Consignação
3. **Assistente de Faturamento** → OPME/TISS
4. **Auditor Virtual** → Compliance
5. **Assistente de Vendas** → CRM
6. **Consultor Financeiro** → Financeiro

Cada tutor será implementado via:

- 🔹 Supabase Edge Function
- 🔹 Modelo GPT-4 / Claude Sonnet
- 🔹 Interface de chat integrada
- 🔹 Contexto específico do módulo

---

## 📚 Referências

- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [ANVISA - RDC 786/2023](https://www.gov.br/anvisa)
- [ANS - TISS 4.1](https://www.gov.br/ans)
- [Receita Federal - Lucro Real](https://www.gov.br/receitafederal)

---

## 📝 Changelog

### v1.0 - 27/10/2025

- ✅ Estrutura completa de 5 agentes
- ✅ IA-Validator com validação dev/prod
- ✅ Scripts para todos os agentes
- ✅ Playbooks de conformidade
- ✅ Documentação completa

---

**Desenvolvido com ❤️ para o Sistema ICARUS**
