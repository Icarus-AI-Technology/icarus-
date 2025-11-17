# 📑 Índice - Sistema de Agentes ICARUS

## 🚀 Quick Start

```bash
# Verificar instalação
./QUICK_CHECK_AGENTES.sh

# Validar IA
node tools/ia/ia-validator.js

# Diagnóstico completo
node tools/tutor/diagnosticar-sistema.js
```

## 📚 Documentação Principal

| Arquivo                                                        | Descrição                 | Tamanho |
| -------------------------------------------------------------- | ------------------------- | ------- |
| **[README_AGENTES.md](README_AGENTES.md)**                     | Quick start e visão geral | 4.7KB   |
| **[GUIA_AGENTES_ICARUS.md](docs/GUIA_AGENTES_ICARUS.md)**      | Documentação completa     | 11KB    |
| **[EXEMPLOS_USO.md](.cursor/agents/EXEMPLOS_USO.md)**          | Casos de uso práticos     | -       |
| **[RELATORIO_AGENTES_ICARUS.md](RELATORIO_AGENTES_ICARUS.md)** | Relatório técnico         | -       |
| **[SUMARIO_AGENTES_ICARUS.md](SUMARIO_AGENTES_ICARUS.md)**     | Sumário executivo         | -       |

## 🤖 Agentes (6 total)

### 1. Orquestrador-ICARUS ⭐

- **Arquivo:** `.cursor/agents.json`
- **Papel:** Entry point e coordenação
- **Subagentes:** 5

### 2. IA-Validator

- **Scripts:** 3
- **Localização:** `tools/ia/`
- **Comandos:**
  - `ia-validator.js` - Validação de topologia
  - `check-edge-functions.js` - Auditoria Edge Functions
  - `auto-fix-configs.js` - Correção automática

### 3. Contador

- **Scripts:** 4
- **Localização:** `tools/compliance/fiscal/` + `tools/finance/`
- **Comandos:**
  - `check-erp-fiscal.js` - Conformidade fiscal
  - `list-obrigacoes.js` - Obrigações acessórias
  - `simulador-lucro-real.js` - Simulação tributária
  - `generate-alerts.js` - Alertas fiscais

### 4. Advogado

- **Scripts:** 3
- **Localização:** `tools/compliance/legal/` + `tools/legal/`
- **Comandos:**
  - `check-erp-legal.js` - Conformidade legal
  - `monitor-regulatorio.js` - Monitor ANVISA/ANS
  - `contracts-audit.js` - Auditoria de contratos

### 5. Gestão-Empresarial

- **Scripts:** 3
- **Localização:** `tools/analytics/` + `tools/audit/`
- **Comandos:**
  - `map-kpis-executivos.js` - KPIs executivos
  - `auditar-modulos.js` - Auditoria de módulos
  - `sugerir-melhorias.js` - Sugestões de melhoria

### 6. Tutor-Conselheiro

- **Scripts:** 5
- **Localização:** `tools/tutor/`
- **Comandos:**
  - `diagnosticar-sistema.js` - Diagnóstico completo
  - `sumario-executivo.js` - Sumário executivo
  - `parecer-compliance.js` - Parecer consolidado
  - `classificar-gaps.js` - Classificação de gaps
  - `gerar-tutores-por-modulo.js` - Planejamento tutores IA

## 📂 Estrutura Completa

```
icarus-make/
│
├── 📄 INDICE_AGENTES.md              ← Você está aqui
├── 📄 README_AGENTES.md              ← Comece aqui
├── 📄 SUMARIO_AGENTES_ICARUS.md      ← Resumo executivo
├── 📄 RELATORIO_AGENTES_ICARUS.md    ← Relatório técnico
├── 🔧 QUICK_CHECK_AGENTES.sh         ← Verificação rápida
│
├── .cursor/
│   ├── agents.json                   ← Configuração principal
│   └── agents/
│       ├── README.md
│       ├── EXEMPLOS_USO.md           ← Casos de uso
│       ├── ia-validator/             ← Relatórios de validação
│       ├── contador/                 ← Relatórios fiscais
│       ├── gestao/                   ← Relatórios de gestão
│       └── tutor/                    ← Relatórios executivos
│
├── docs/
│   └── GUIA_AGENTES_ICARUS.md        ← Documentação completa
│
└── tools/
    ├── ia/                           ← 3 scripts
    │   ├── ia-validator.js
    │   ├── check-edge-functions.js
    │   └── auto-fix-configs.js
    │
    ├── compliance/
    │   ├── fiscal/                   ← 3 scripts
    │   │   ├── check-erp-fiscal.js
    │   │   ├── list-obrigacoes.js
    │   │   └── generate-alerts.js
    │   └── legal/                    ← 2 scripts
    │       ├── check-erp-legal.js
    │       └── monitor-regulatorio.js
    │
    ├── finance/                      ← 1 script
    │   └── simulador-lucro-real.js
    │
    ├── legal/                        ← 1 script
    │   └── contracts-audit.js
    │
    ├── analytics/                    ← 1 script
    │   └── map-kpis-executivos.js
    │
    ├── audit/                        ← 2 scripts
    │   ├── auditar-modulos.js
    │   └── sugerir-melhorias.js
    │
    └── tutor/                        ← 5 scripts
        ├── diagnosticar-sistema.js
        ├── sumario-executivo.js
        ├── parecer-compliance.js
        ├── classificar-gaps.js
        └── gerar-tutores-por-modulo.js
```

## 🎯 Fluxos de Trabalho

### Fluxo 1: Validação Inicial

```bash
./QUICK_CHECK_AGENTES.sh          # 1. Verificar instalação
node tools/ia/ia-validator.js     # 2. Validar IA
```

### Fluxo 2: Auditoria Completa

```bash
node tools/compliance/fiscal/check-erp-fiscal.js   # 1. Fiscal
node tools/compliance/legal/check-erp-legal.js     # 2. Legal
node tools/tutor/parecer-compliance.js             # 3. Consolidar
```

### Fluxo 3: Análise Executiva

```bash
node tools/tutor/diagnosticar-sistema.js    # 1. Diagnóstico
node tools/tutor/classificar-gaps.js        # 2. Gaps
node tools/tutor/sumario-executivo.js       # 3. Sumário
```

### Fluxo 4: Gestão Estratégica

```bash
node tools/analytics/map-kpis-executivos.js   # 1. KPIs
node tools/audit/auditar-modulos.js           # 2. Módulos
node tools/audit/sugerir-melhorias.js         # 3. Melhorias
```

## 📊 Estatísticas

| Item                 | Quantidade |
| -------------------- | ---------- |
| **Agentes**          | 6          |
| **Scripts**          | 18         |
| **Documentação**     | 5 arquivos |
| **Playbooks**        | 3          |
| **Linhas de Código** | 1,463      |
| **Status**           | ✅ 100%    |

## 🔗 Links Rápidos

### Documentação

- [Quick Start](README_AGENTES.md)
- [Guia Completo](docs/GUIA_AGENTES_ICARUS.md)
- [Exemplos de Uso](.cursor/agents/EXEMPLOS_USO.md)

### Relatórios

- [Sumário Executivo](SUMARIO_AGENTES_ICARUS.md)
- [Relatório Técnico](RELATORIO_AGENTES_ICARUS.md)

### Configuração

- [agents.json](.cursor/agents.json)
- [Verificação Rápida](QUICK_CHECK_AGENTES.sh)

## 🎓 Como Usar Este Índice

1. **Novo no sistema?** → Comece em [`README_AGENTES.md`](README_AGENTES.md)
2. **Quer ver casos de uso?** → Veja [`EXEMPLOS_USO.md`](.cursor/agents/EXEMPLOS_USO.md)
3. **Precisa de detalhes técnicos?** → Consulte [`GUIA_AGENTES_ICARUS.md`](docs/GUIA_AGENTES_ICARUS.md)
4. **Quer resultados?** → Execute `./QUICK_CHECK_AGENTES.sh`

## 📝 Versão

**v1.0** - 27/10/2025

- ✅ Sistema completo implementado
- ✅ 18 scripts funcionais
- ✅ Documentação completa
- ✅ Testes aprovados

---

**Sistema ICARUS v5.0** | Agentes Inteligentes 🤖
