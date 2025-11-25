# 🔌 Integração com MCP (Model Context Protocol)

Este documento detalha como integrar o Supabase Auditor Pro com o MCP do Cursor para auditoria automatizada.

## 📋 O que é MCP?

O Model Context Protocol (MCP) é um protocolo que permite ao Cursor AI acessar recursos externos como bancos de dados, APIs e serviços de forma estruturada e segura.

## 🚀 Configuração do MCP Supabase no Cursor

### 1. Verificar se MCP está disponível

1. Abra o Cursor
2. Vá em **Settings** → **Features** → **MCP**
3. Verifique se `supabase` está listado nos servidores disponíveis

Se não estiver listado, você precisará habilitar o MCP Supabase.

### 2. Conectar ao Projeto Supabase

O MCP do Supabase fornece as seguintes funcionalidades principais:

```typescript
// Ferramentas MCP disponíveis para Supabase

// Listar projetos
mcp_supabase_list_projects()

// Obter detalhes do projeto
mcp_supabase_get_project({ id: "project-id" })

// Executar SQL
mcp_supabase_execute_sql({ 
  project_id: "project-id",
  query: "SELECT * FROM users LIMIT 10"
})

// Aplicar migração
mcp_supabase_apply_migration({
  project_id: "project-id",
  name: "add_audit_functions",
  query: "CREATE FUNCTION..."
})

// Listar Edge Functions
mcp_supabase_list_edge_functions({ project_id: "project-id" })

// Ler código de Edge Function
mcp_supabase_get_edge_function({ 
  project_id: "project-id",
  function_slug: "handle-payment"
})

// Obter logs
mcp_supabase_get_logs({
  project_id: "project-id",
  service: "postgres"
})

// Obter advisors (problemas detectados pelo Supabase)
mcp_supabase_get_advisors({
  project_id: "project-id",
  type: "security"
})
```

## 🤖 Como o Supabase Auditor Pro Usa o MCP

### Fluxo de Auditoria Completo

```mermaid
graph TD
    A[Usuário: "Audite meu projeto Supabase"] --> B[Cursor AI recebe comando]
    B --> C[MCP: Listar projetos]
    C --> D[Detectar Project ID]
    D --> E[MCP: Aplicar funções SQL de auditoria]
    E --> F[Executar auditorias via RPC]
    F --> G[MCP: Obter advisors do Supabase]
    G --> H[Consolidar resultados]
    H --> I[Gerar relatório MD + JSON]
    I --> J[Apresentar ao usuário]
```

### Exemplo de Uso via Cursor

**Passo 1: Ativar o agente**

Digite no Cursor:

```
Audite meu projeto Supabase
```

**Passo 2: O Cursor executa automaticamente**

```javascript
// 1. Listar projetos disponíveis
const projects = await mcp_supabase_list_projects()

// 2. Selecionar projeto (pode pedir confirmação ao usuário)
const projectId = projects[0].id

// 3. Instalar funções de auditoria
await mcp_supabase_apply_migration({
  project_id: projectId,
  name: "setup_auditor_functions",
  query: fs.readFileSync("sql/setup.sql", "utf-8")
})

// 4. Executar auditorias
const orphanTables = await mcp_supabase_execute_sql({
  project_id: projectId,
  query: "SELECT * FROM auditor.detectar_tabelas_orfas(90)"
})

const noRlsTables = await mcp_supabase_execute_sql({
  project_id: projectId,
  query: "SELECT * FROM auditor.detectar_tabelas_sem_rls()"
})

// 5. Obter advisors nativos do Supabase
const securityAdvisors = await mcp_supabase_get_advisors({
  project_id: projectId,
  type: "security"
})

const perfAdvisors = await mcp_supabase_get_advisors({
  project_id: projectId,
  type: "performance"
})

// 6. Consolidar tudo em um relatório
const report = {
  customAudits: { orphanTables, noRlsTables, ... },
  supabaseAdvisors: { security: securityAdvisors, perf: perfAdvisors }
}

// 7. Gerar Markdown
generateReport(report)
```

## 🔐 Autenticação e Permissões

### Método 1: Via Cursor (Automático)

Se você já está autenticado no Supabase via Cursor, o MCP usa suas credenciais automaticamente.

### Método 2: Via Variáveis de Ambiente

```bash
# .env
SUPABASE_ACCESS_TOKEN=sbp_your_personal_access_token
SUPABASE_PROJECT_ID=xyzabc123
```

### Método 3: Via Service Role Key (Mais Permissões)

```bash
# .env
SUPABASE_URL=https://xyzabc123.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **Atenção**: Service Role Key tem permissões de superusuário. Use com cuidado.

## 📝 Comandos Disponíveis no Cursor

### Auditoria Completa

```
Audite meu projeto Supabase
```

### Auditoria Específica

```
Audite apenas as RLS policies do meu projeto Supabase
```

```
Audite os índices não usados do Supabase
```

### Auditoria com Filtro de Severidade

```
Audite meu projeto Supabase mostrando apenas problemas críticos e altos
```

### Instalar Funções de Auditoria

```
Instale as funções de auditoria no meu projeto Supabase
```

### Verificar Instalação

```
Verifique se as funções de auditoria estão instaladas no Supabase
```

### Auditoria de Edge Functions

```
Audite as Edge Functions do meu projeto Supabase
```

```
Audite a Edge Function handle-payment do Supabase
```

### Modo Fix (Correções Automáticas)

```
Audite meu projeto Supabase e corrija problemas críticos
```

⚠️ **Atenção**: O modo fix executará alterações no banco. Use com cuidado.

## 🔄 Fluxo de Correção Automática (Modo Fix)

Quando você usa o modo fix:

1. **Análise**: Identifica todos os problemas
2. **Classificação**: Agrupa por severidade
3. **Backup**: Cria backup antes de alterações críticas
4. **Confirmação**: Pede aprovação para cada correção crítica/alta
5. **Execução**: Aplica correções via `mcp_supabase_apply_migration`
6. **Validação**: Verifica se correções funcionaram
7. **Relatório**: Documenta o que foi feito

Exemplo de interação:

```
Cursor: Encontrei 3 problemas críticos. Deseja corrigi-los?

1. [CRÍTICO] Tabela users sem RLS
   Solução: ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   
2. [CRÍTICO] Índice inválido: idx_products_category
   Solução: REINDEX INDEX CONCURRENTLY...
   
3. [CRÍTICO] Credenciais hard-coded em handle-payment
   Solução: Mover para variáveis de ambiente

Deseja executar as correções? (s/N)
```

## 🧪 Testando a Integração

### Teste 1: Verificar Conexão

```
Liste meus projetos Supabase
```

Deve retornar lista de projetos.

### Teste 2: Executar Query Simples

```
Execute: SELECT COUNT(*) FROM users no meu projeto Supabase
```

### Teste 3: Verificar Funções Instaladas

```
Verifique se a função auditor.detectar_tabelas_orfas existe no meu projeto Supabase
```

### Teste 4: Auditoria Rápida

```
Liste todas as tabelas sem RLS no meu projeto Supabase
```

## 🛠️ Troubleshooting

### Erro: "MCP Supabase não encontrado"

**Solução**: Verifique se o MCP está habilitado nas configurações do Cursor.

### Erro: "Permissão negada"

**Solução**: Você precisa de Service Role Key ou ser owner do projeto.

### Erro: "Função auditor.* não existe"

**Solução**: Execute a instalação das funções:

```
Instale as funções de auditoria no Supabase usando sql/setup.sql
```

### Erro: "Projeto não encontrado"

**Solução**: Especifique o project ID:

```
Audite o projeto xyzabc123 do Supabase
```

## 📚 Recursos Adicionais

- [Documentação do MCP](https://modelcontextprotocol.io)
- [Supabase Management API](https://supabase.com/docs/reference/api)
- [Cursor AI Docs](https://cursor.sh/docs)

## 🎯 Próximos Passos

1. ✅ Configure o MCP no Cursor
2. ✅ Conecte ao seu projeto Supabase
3. ✅ Execute auditoria de teste
4. ✅ Instale funções de auditoria
5. ✅ Execute auditoria completa
6. ✅ Analise relatórios
7. ✅ (Opcional) Use modo fix para correções

