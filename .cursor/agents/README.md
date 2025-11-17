# 🤖 ICARUS Agents System

> Sistema coordenado de agentes especializados para ERP OPME

## 📚 Documentação

- **[README_AGENTES.md](../../README_AGENTES.md)** - Quick start e visão geral
- **[GUIA_AGENTES_ICARUS.md](../../docs/GUIA_AGENTES_ICARUS.md)** - Documentação completa
- **[EXEMPLOS_USO.md](EXEMPLOS_USO.md)** - Casos de uso práticos

## 🎯 Quick Start

```bash
# Validar IA
node tools/ia/ia-validator.js

# Diagnóstico
node tools/tutor/diagnosticar-sistema.js

# Gaps
node tools/tutor/classificar-gaps.js
```

## 📂 Estrutura

```
.cursor/agents/
├── README.md                 # Este arquivo
├── EXEMPLOS_USO.md          # Casos de uso práticos
├── ia-validator/            # Relatórios de validação
├── contador/                # Relatórios fiscais
├── gestao/                  # Relatórios de gestão
└── tutor/                   # Relatórios executivos

tools/
├── ia/                      # IA-Validator
├── compliance/              # Contador + Advogado
│   ├── fiscal/
│   └── legal/
├── analytics/               # Gestão
├── audit/                   # Gestão
└── tutor/                   # Tutor-Conselheiro
```

## 🔧 Configuração

### agents.json

Localizado em `.cursor/agents.json`, define:

- 5 agentes especializados
- Comandos e ferramentas
- Políticas de IA (dev/prod)
- Playbooks de execução

### Variáveis de Ambiente

**Desenvolvimento:**

```bash
NODE_ENV=development
VITE_OLLAMA_URL=http://localhost:11434
VITE_MEILISEARCH_URL=http://localhost:7700
VITE_POSTHOG_HOST=http://localhost:8000
SUPABASE_FUNCTIONS_URL=http://localhost:54321/functions/v1
```

**Produção:**

```bash
NODE_ENV=production
SUPABASE_FUNCTIONS_URL=https://<project>.supabase.co/functions/v1
VITE_MEILISEARCH_URL=https://<meili-cloud>
VITE_POSTHOG_HOST=https://app.posthog.com
```

## 🎭 Agentes

| Agente           | Foco         | Scripts     |
| ---------------- | ------------ | ----------- |
| **Orquestrador** | Coordenação  | Entry point |
| **IA-Validator** | Topologia IA | 3 scripts   |
| **Contador**     | Fiscal       | 4 scripts   |
| **Advogado**     | Legal        | 3 scripts   |
| **Gestão**       | Estratégia   | 3 scripts   |
| **Tutor**        | Decisões     | 5 scripts   |

**Total: 18 scripts executáveis**

## 📊 Relatórios

Todos salvos em `.cursor/agents/<agente>/`:

- `validation-*.json` - Validação de IA
- `edge-functions-*.json` - Edge Functions
- `alertas-*.json` - Alertas fiscais
- `auditoria-modulos-*.json` - Auditoria de módulos
- `diagnostico-*.json` - Diagnóstico completo
- `gaps-classificados-*.json` - Gaps priorizados

## 🚀 Próximos Passos

1. ✅ Estrutura implementada
2. ✅ Scripts funcionais
3. ✅ Documentação completa
4. 🔄 Integração com chatbot (em desenvolvimento)
5. 🔄 Tutores IA por módulo (planejado)
6. 🔄 Deploy Edge Functions (em produção)

## 📖 Versão

**v1.0** - 27/10/2025

- Estrutura completa de agentes
- IA-Validator operacional
- Scripts para todos os agentes
- Documentação e exemplos
- Playbooks de execução

---

**Sistema ICARUS** | Desenvolvido com ❤️ e IA
