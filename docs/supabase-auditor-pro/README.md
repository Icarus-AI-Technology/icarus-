# 🔍 Supabase Auditor Pro

Sistema completo de auditoria automatizada para projetos Supabase com integração MCP (Model Context Protocol) no Cursor.

## 📋 Visão Geral

Este projeto contém dois agentes especializados:

1. **Supabase Auditor Pro** - Auditoria completa de banco de dados PostgreSQL
2. **Supabase Edge Functions Auditor Pro** - Auditoria de segurança e performance de Edge Functions

## 🚀 Prompt de Ativação

### Para Auditoria de Banco de Dados:

```
Audite meu projeto Supabase
```

ou com opções específicas:

```
Audite meu projeto Supabase --mode=safe --project-id=xyzabc123
```

```
Audite meu projeto Supabase --mode=fix --severity=CRÍTICO,ALTO
```

### Para Auditoria de Edge Functions:

```
Audite as Edge Functions do Supabase
```

ou com opções:

```
Audite as Edge Functions do Supabase --function=handle-payment --deep
```

## 🎯 Modos de Operação

### Modo Safe (Padrão)
- Apenas gera relatórios
- Não executa alterações
- Recomendações com SQL pronto

### Modo Fix
- Executa correções automáticas
- Solicita confirmação antes de cada ação
- Backup automático antes de alterações críticas

## 📊 Tipos de Auditoria

### Banco de Dados
- ✅ Schema & Tabelas (órfãs, sem PK, bloat)
- ✅ Índices (duplicados, não usados, inválidos)
- ✅ RLS & Segurança (policies permissivas, tabelas sem RLS)
- ✅ Storage & Buckets (arquivos órfãos, duplicados)
- ✅ Performance (queries lentas, locks, dead tuples)
- ✅ Funções & Triggers (não usadas, SECURITY DEFINER)

### Edge Functions
- ✅ Segurança (vulnerabilidades, credenciais expostas)
- ✅ Performance (cold start, memória, imports)
- ✅ Conformidade (autenticação, rate limiting)
- ✅ Logs & Erros (taxa de erro, stack traces)
- ✅ Dependências (versões não fixadas, libs vulneráveis)

## 📦 Estrutura do Projeto

```
supabase-auditor-pro/
├── README.md                          # Este arquivo
├── ACTIVATION_GUIDE.md                # Guia de ativação no Cursor
├── sql/
│   ├── setup.sql                     # Script de instalação das funções
│   ├── audit_schema.sql              # Auditoria de schema
│   ├── audit_indexes.sql             # Auditoria de índices
│   ├── audit_rls.sql                 # Auditoria de RLS
│   ├── audit_storage.sql             # Auditoria de storage
│   ├── audit_performance.sql         # Auditoria de performance
│   └── audit_functions.sql           # Auditoria de funções
├── agents/
│   ├── db-auditor.ts                 # Agente principal de DB
│   ├── edge-functions-auditor.ts     # Agente de Edge Functions
│   ├── types.ts                      # Tipos TypeScript
│   └── utils.ts                      # Utilitários
├── examples/
│   ├── report-database.md            # Exemplo de relatório DB
│   ├── report-edge-functions.md      # Exemplo de relatório EF
│   ├── report-database.json          # Exemplo JSON DB
│   └── report-edge-functions.json    # Exemplo JSON EF
└── package.json                       # Dependências
```

## 🔧 Requisitos

- Node.js 20+
- Acesso a projeto Supabase via MCP
- Cursor IDE com MCP habilitado
- Permissões de leitura no banco de dados
- (Opcional) Service Role Key para auditoria completa

## 📝 Próximos Passos

Veja [ACTIVATION_GUIDE.md](./ACTIVATION_GUIDE.md) para instruções detalhadas de instalação e uso.

