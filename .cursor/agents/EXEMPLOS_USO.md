# 🎯 Exemplos de Uso - Agentes ICARUS

## 📋 Casos de Uso Práticos

### 1. Validação Completa de IA (DEV)

```bash
# Configurar variáveis de desenvolvimento
export NODE_ENV=development
export VITE_OLLAMA_URL=http://localhost:11434
export VITE_MEILISEARCH_URL=http://localhost:7700
export VITE_POSTHOG_HOST=http://localhost:8000
export VITE_SUPABASE_URL=http://localhost:54321
export SUPABASE_FUNCTIONS_URL=http://localhost:54321/functions/v1

# Executar validação
node tools/ia/ia-validator.js
```

**Resultado Esperado:**

```
🤖 IA-VALIDATOR - Validando Topologia de IA
📍 Ambiente: development

✅ OLLAMA: ok
✅ MEILISEARCH: ok
✅ POSTHOG: ok
✅ SUPABASE: ok
✅ TESSERACT: ok

✅ Topologia de IA em conformidade!
```

---

### 2. Validação em Produção (Bloqueio de Localhost)

```bash
# Configurar variáveis de produção
export NODE_ENV=production
export VITE_SUPABASE_URL=https://xyzproject.supabase.co
export VITE_SUPABASE_ANON_KEY=eyJhbGc...
export SUPABASE_FUNCTIONS_URL=https://xyzproject.supabase.co/functions/v1
export VITE_MEILISEARCH_URL=https://meili-prod.example.com
export VITE_POSTHOG_HOST=https://app.posthog.com
export VITE_POSTHOG_KEY=phc_...

# Executar validação
node tools/ia/ia-validator.js
```

**Comportamento:**

- ✅ Bloqueia localhost automaticamente
- ✅ Valida URLs de produção
- ❌ Falha se encontrar localhost
- ✅ Gera relatório em `.cursor/agents/ia-validator/`

---

### 3. Auditoria Fiscal Completa

```bash
# 1. Verificar conformidade
node tools/compliance/fiscal/check-erp-fiscal.js

# 2. Listar obrigações
node tools/compliance/fiscal/list-obrigacoes.js

# 3. Simular tributação
node tools/finance/simulador-lucro-real.js

# 4. Gerar alertas
node tools/compliance/fiscal/generate-alerts.js
```

**Output:**

```
📊 CONTADOR - Verificação Fiscal do ERP

✅ Lucro Real - Configuração
📋 Integração SPED: pending
📋 Integração EFD: pending
⚠️  Cálculo de Impostos: Requer validação

💡 Recomendação: Implementar integrações com SPED/EFD prioritariamente.
```

---

### 4. Auditoria Legal Completa

```bash
# 1. Verificar compliance
node tools/compliance/legal/check-erp-legal.js

# 2. Monitor ANVISA/ANS
node tools/compliance/legal/monitor-regulatorio.js

# 3. Auditar contratos
node tools/legal/contracts-audit.js
```

**Output:**

```
⚖️  ADVOGADO - Verificação Legal do ERP

✅ LGPD - Lei Geral de Proteção de Dados
⚠️  ANVISA - Regularização Produtos
📋 ANS - Padrão TISS: pending
📋 ISO 13485: pending

💡 Ações necessárias: 3 itens requerem atenção.
```

---

### 5. Análise Executiva Completa

```bash
# 1. KPIs executivos
node tools/analytics/map-kpis-executivos.js

# 2. Auditar módulos
node tools/audit/auditar-modulos.js

# 3. Diagnóstico completo
node tools/tutor/diagnosticar-sistema.js

# 4. Sumário executivo
node tools/tutor/sumario-executivo.js
```

**Output:**

```
📊 Score Geral: 82/100 - BOA

✅ FRONTEND: 90/100 - excelente
✅ BACKEND: 85/100 - bom
⚠️  INTEGRAÇÃO: 70/100 - necessita_atencao
✅ IA: 75/100 - bom
✅ COMPLIANCE: 78/100 - bom

🎯 Recomendações Prioritárias:
1. Completar integração TISS 4.1
2. Implementar rastreabilidade ANVISA completa
3. Adicionar tutores IA por módulo
4. Certificação ISO 13485
```

---

### 6. Classificação de Gaps

```bash
node tools/tutor/classificar-gaps.js
```

**Output:**

```
🔴 GAPS CRÍTICOS (Ação Imediata):

GAP-001 - Integração TISS
   Descrição: Migração para TISS 4.1 incompleta
   Impacto: Impossibilita faturamento com planos após prazo ANS
   Esforço: medio | Prazo: 30 dias

GAP-002 - Rastreabilidade ANVISA
   Descrição: Sistema de rastreamento parcial
   Impacto: Não conformidade com RDC 786/2023, risco de multas
   Esforço: alto | Prazo: 45 dias

🟡 GAPS MÉDIOS (Planejar Sprint):

GAP-003 - Tutores IA
   Descrição: Assistentes IA por módulo não implementados
   Impacto: Aumento do tempo de treinamento e suporte
   Esforço: medio | Prazo: 60 dias

📊 RESUMO:
   Total de Gaps: 7
   🔴 Críticos: 2
   🟡 Médios: 3
   🟢 Baixos: 2
```

---

### 7. Parecer de Compliance Consolidado

```bash
node tools/tutor/parecer-compliance.js
```

**Output:**

```
⚖️  TUTOR - Parecer de Compliance

📋 PARECER GERAL: FAVORÁVEL COM RESSALVAS
📊 Score de Compliance: 78/100

🔍 ÁREAS AVALIADAS:

✅ LGPD: 90/100 - CONFORME
   Políticas implementadas, DPO designado, registros em ordem

⚠️  ANVISA: 75/100 - PARCIALMENTE CONFORME
   Rastreabilidade em implementação, registro de produtos OK

⚠️  ANS_TISS: 70/100 - EM ADEQUAÇÃO
   TISS 4.0 funcional, migração para 4.1 em andamento

✅ FISCAL: 82/100 - CONFORME
   Lucro Real configurado, integrações SPED planejadas

🚨 RISCOS IDENTIFICADOS:

🟡 [MEDIO] ANVISA
   Descrição: Rastreabilidade incompleta pode gerar multas
   Mitigação: Implementar sistema completo em 45 dias
```

---

### 8. Playbook: Conformidade Total de IA

```bash
#!/bin/bash
# playbook-ia-conformidade.sh

echo "🤖 Executando Playbook: IA Conformidade Total"

# Passo 1: Validar topologia
echo "\n📍 Passo 1: Validar Topologia"
node tools/ia/ia-validator.js

# Passo 2: Auditar Edge Functions
echo "\n📍 Passo 2: Auditar Edge Functions"
node tools/ia/check-edge-functions.js

# Passo 3: Sumário executivo
echo "\n📍 Passo 3: Sumário Executivo"
node tools/tutor/sumario-executivo.js

echo "\n✅ Playbook concluído!"
echo "📄 Relatórios salvos em .cursor/agents/"
```

---

### 9. Playbook: Benchmark ERP OPME

```bash
#!/bin/bash
# playbook-benchmark-erp.sh

echo "📊 Executando Playbook: Benchmark ERP OPME"

# KPIs
echo "\n📍 Passo 1: Mapear KPIs"
node tools/analytics/map-kpis-executivos.js

# Compliance Legal
echo "\n📍 Passo 2: Compliance Legal"
node tools/compliance/legal/check-erp-legal.js

# Compliance Fiscal
echo "\n📍 Passo 3: Compliance Fiscal"
node tools/compliance/fiscal/check-erp-fiscal.js

# Parecer Final
echo "\n📍 Passo 4: Parecer de Compliance"
node tools/tutor/parecer-compliance.js

echo "\n✅ Benchmark concluído!"
```

---

### 10. Playbook: Priorizar Funcionalidades

```bash
#!/bin/bash
# playbook-priorizar.sh

echo "🎯 Executando Playbook: Priorizar Funcionalidades"

# Auditar módulos
echo "\n📍 Passo 1: Auditar Módulos"
node tools/audit/auditar-modulos.js

# Requisitos legais
echo "\n📍 Passo 2: Requisitos Legais"
node tools/compliance/legal/check-erp-legal.js

# Requisitos fiscais
echo "\n📍 Passo 3: Requisitos Fiscais"
node tools/compliance/fiscal/check-erp-fiscal.js

# Classificar gaps
echo "\n📍 Passo 4: Classificar Gaps"
node tools/tutor/classificar-gaps.js

# Sugestões
echo "\n📍 Passo 5: Sugerir Melhorias"
node tools/audit/sugerir-melhorias.js

echo "\n✅ Priorização concluída!"
echo "📄 Ver relatório completo em .cursor/agents/tutor/gaps-classificados-*.json"
```

---

## 🔄 Automação com Package.json

Adicionar ao `package.json`:

```json
{
  "scripts": {
    "agents:validate-ia": "node tools/ia/ia-validator.js",
    "agents:check-fiscal": "node tools/compliance/fiscal/check-erp-fiscal.js",
    "agents:check-legal": "node tools/compliance/legal/check-erp-legal.js",
    "agents:diagnostico": "node tools/tutor/diagnosticar-sistema.js",
    "agents:gaps": "node tools/tutor/classificar-gaps.js",
    "agents:compliance": "node tools/tutor/parecer-compliance.js",
    "agents:full-audit": "npm run agents:validate-ia && npm run agents:diagnostico && npm run agents:compliance"
  }
}
```

**Uso:**

```bash
pnpm agents:validate-ia
pnpm agents:diagnostico
pnpm agents:full-audit
```

---

## 🎓 Integração com CI/CD

### GitHub Actions

```yaml
# .github/workflows/agents-audit.yml
name: Agents Audit

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  validate-ia-topology:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Validar Topologia IA
        env:
          NODE_ENV: production
          SUPABASE_FUNCTIONS_URL: ${{ secrets.SUPABASE_FUNCTIONS_URL }}
        run: node tools/ia/ia-validator.js

      - name: Upload Relatório
        uses: actions/upload-artifact@v3
        with:
          name: ia-validation-report
          path: .cursor/agents/ia-validator/*.json
```

---

## 📊 Dashboard de Monitoramento

```bash
# Criar dashboard de status
cat > agents-status.sh << 'EOF'
#!/bin/bash

echo "🎯 ICARUS Agents - Dashboard de Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# IA Topology
echo "\n🤖 IA TOPOLOGY"
NODE_ENV=production node tools/ia/ia-validator.js 2>&1 | grep -E "✅|❌|⚠️"

# Compliance
echo "\n⚖️  COMPLIANCE"
node tools/tutor/parecer-compliance.js 2>&1 | grep -E "Score|PARECER"

# Gaps
echo "\n🎯 GAPS"
node tools/tutor/classificar-gaps.js 2>&1 | grep -E "RESUMO" -A 4

echo "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📄 Relatórios completos em: .cursor/agents/"
EOF

chmod +x agents-status.sh
./agents-status.sh
```

---

## 🔔 Alertas Automáticos

```bash
# Criar script de alertas
cat > agents-alerts.sh << 'EOF'
#!/bin/bash

# Executar classificação de gaps
GAPS=$(node tools/tutor/classificar-gaps.js 2>&1)

# Verificar gaps críticos
CRITICOS=$(echo "$GAPS" | grep "🔴 Críticos:" | awk '{print $3}')

if [ "$CRITICOS" -gt 0 ]; then
  echo "🚨 ALERTA: $CRITICOS gaps críticos detectados!"
  echo "$GAPS" | grep -A 10 "🔴 GAPS CRÍTICOS"

  # Enviar notificação (exemplo Slack)
  # curl -X POST -H 'Content-type: application/json' \
  #   --data '{"text":"🚨 Gaps Críticos: '"$CRITICOS"'"}' \
  #   $SLACK_WEBHOOK_URL
fi
EOF

chmod +x agents-alerts.sh
```

---

**Sistema ICARUS v5.0** | Agentes Inteligentes
