# 🤖 Sistema de Agentes Icarus V5.0

## Estrutura

```
.cursor/
├── agents/          # Agentes especializados
│   ├── orchestrator/       # Orquestrador principal
│   ├── code-auditor/       # Auditoria de código
│   ├── ia-validator/       # Validação de IAs (✅ COMPLETO)
│   ├── supabase-migration/ # Migrações Supabase
│   ├── environment-checker/# Validação de ambiente
│   ├── dependency-manager/ # Gestão de dependências
│   ├── test-runner/        # Execução de testes
│   ├── production-prep/    # Preparação para produção
│   └── documentation/      # Geração de docs
├── scripts/         # Scripts de automação
├── config/          # Configurações
└── results/         # Resultados de execuções
```

## Agentes Disponíveis

### ✅ IA Validator (COMPLETO)

Valida configuração de todas as IAs nativas:

```bash
node .cursor/agents/ia-validator/validate-ia.js
bash .cursor/agents/ia-validator/quick-start.sh
```

### 🔄 Orchestrator

Executa todos os agentes em sequência:

```bash
node .cursor/agents/orchestrator/orchestrator.js
```

### 🔍 Code Auditor

Audita qualidade do código:

```bash
node .cursor/agents/code-auditor/run.js
```

## Executar

### Todos os Agentes (Recomendado)

```bash
node .cursor/agents/orchestrator/orchestrator.js
```

### Agente Individual

```bash
# IA Validator
bash .cursor/agents/ia-validator/quick-start.sh

# Code Auditor
node .cursor/agents/code-auditor/run.js

# Environment Checker
node .cursor/agents/environment-checker/run.js
```

## Configuração

Edite `.cursor/config/agents-config.json` para customizar comportamento dos agentes.

## Status dos Agentes

| Agente              | Status      | Descrição                            |
| ------------------- | ----------- | ------------------------------------ |
| IA Validator        | ✅ COMPLETO | Valida IAs nativas (60% operacional) |
| Orchestrator        | 🔄 Pendente | Orquestrador principal               |
| Code Auditor        | 🔄 Pendente | Auditoria de código                  |
| Supabase Migration  | 🔄 Pendente | Migrações database                   |
| Environment Checker | 🔄 Pendente | Validação ambiente                   |
| Dependency Manager  | 🔄 Pendente | Gestão dependências                  |
| Test Runner         | 🔄 Pendente | Execução testes                      |
| Production Prep     | 🔄 Pendente | Preparação produção                  |
| Documentation       | 🔄 Pendente | Geração docs                         |

## Resultados

Os resultados das execuções são salvos em:

```
.cursor/results/
├── validation-reports/
├── audit-reports/
├── test-reports/
└── migration-reports/
```
