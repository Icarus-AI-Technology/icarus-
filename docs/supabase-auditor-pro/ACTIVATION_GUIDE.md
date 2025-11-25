# 🚀 Guia de Ativação - Supabase Auditor Pro

## 📋 Pré-requisitos

### 1. Configuração do Cursor MCP

O Cursor deve ter acesso ao MCP (Model Context Protocol) do Supabase. Verifique se o MCP Supabase está configurado:

1. Abra as configurações do Cursor
2. Vá em **Settings** → **Features** → **MCP**
3. Verifique se `supabase` está listado nos servidores ativos
4. Se não estiver, adicione manualmente

### 2. Credenciais do Supabase

Você precisará de:

- **Project ID** - ID do seu projeto Supabase
- **Service Role Key** (opcional, mas recomendado para auditoria completa)
- **Database URL** (opcional, para conexão direta)

### 3. Instalação de Dependências

```bash
cd supabase-auditor-pro
npm install
```

## 🔧 Instalação das Funções SQL

### Método 1: Via Cursor (Recomendado)

1. Abra o Cursor no diretório do projeto
2. Execute o comando:

```
Execute o setup SQL no meu projeto Supabase usando o arquivo sql/setup.sql
```

O Cursor usará o MCP para aplicar automaticamente as funções RPC necessárias.

### Método 2: Via Supabase Dashboard

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Copie e cole o conteúdo de `sql/setup.sql`
5. Execute o script

### Método 3: Via CLI

```bash
supabase db push --file sql/setup.sql
```

## 🎯 Como Usar

### 1. Auditoria Completa de Banco de Dados

No Cursor, digite:

```
Audite meu projeto Supabase
```

O agente irá:
1. Detectar automaticamente o project ID via MCP
2. Executar todas as 6 categorias de auditoria
3. Gerar relatório completo em Markdown e JSON
4. Salvar em `reports/audit-{timestamp}.md`

### 2. Auditoria Específica

```
Audite apenas as RLS policies do meu projeto Supabase
```

ou

```
Audite os índices do meu projeto Supabase --severity=CRÍTICO
```

### 3. Auditoria com Correções Automáticas

```
Audite meu projeto Supabase --mode=fix
```

O agente irá:
1. Executar auditoria completa
2. Listar todas as correções possíveis
3. Solicitar confirmação para cada item crítico
4. Executar as correções aprovadas
5. Gerar relatório com ações executadas

### 4. Auditoria de Edge Functions

```
Audite as Edge Functions do Supabase
```

ou para uma função específica:

```
Audite a Edge Function handle-payment do Supabase --deep
```

## 🛡️ Fluxo de Segurança (Modo Fix)

Quando você usa `--mode=fix`, o agente segue este fluxo:

1. **Análise** - Identifica todos os problemas
2. **Classificação** - Agrupa por severidade
3. **Backup** - Cria backup automático antes de qualquer alteração
4. **Confirmação** - Solicita aprovação para cada ação CRÍTICA ou ALTA
5. **Execução** - Executa as correções aprovadas
6. **Validação** - Verifica se as correções foram bem-sucedidas
7. **Rollback** - Se algo falhar, reverte automaticamente

## 📊 Entendendo os Relatórios

### Severidades

- **🔴 CRÍTICO** - Requer ação imediata (vulnerabilidade de segurança, perda de dados)
- **🟠 ALTO** - Requer ação em breve (performance degradada, risco de escalação)
- **🟡 MÉDIO** - Recomendado corrigir (otimização, boas práticas)
- **🔵 BAIXO** - Sugestão de melhoria (code smell, convenções)
- **⚪ INFO** - Informativo apenas

### Estrutura do Relatório

```markdown
# 🔍 Auditoria Supabase - [Project Name]
**Data:** 2025-11-23 14:30:00
**Projeto ID:** abc123xyz

## 📊 Resumo Executivo
- Total de problemas: 47
- Críticos: 3
- Altos: 12
- Médios: 18
- Baixos: 14

## 🔴 Problemas Críticos
### 1. Tabela `users` sem RLS habilitado
**Severidade:** CRÍTICO
**Categoria:** Segurança
**Descrição:** A tabela `users` está acessível publicamente...
**Impacto:** Dados sensíveis expostos
**Solução:**
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only see their own data"
  ON users FOR SELECT
  USING (auth.uid() = id);
```
```

## 🔍 Verificação de Instalação

Para verificar se tudo está funcionando:

```
Verifique a instalação do Supabase Auditor Pro
```

O agente irá:
1. Verificar se as funções SQL foram instaladas
2. Testar conectividade com o projeto Supabase
3. Validar permissões
4. Executar auditoria de teste em uma tabela

## ⚙️ Configuração Avançada

### Arquivo de Configuração (Opcional)

Crie `supabase-auditor.config.json` na raiz do projeto:

```json
{
  "projectId": "seu-project-id",
  "defaultMode": "safe",
  "excludeTables": ["_prisma_migrations", "supabase_migrations"],
  "excludeSchemas": ["extensions", "graphql"],
  "severityFilters": ["CRÍTICO", "ALTO", "MÉDIO"],
  "reportFormat": "markdown",
  "autoBackup": true,
  "notifications": {
    "email": "admin@exemplo.com",
    "slack": "webhook-url"
  },
  "schedules": {
    "daily": true,
    "time": "03:00"
  }
}
```

### Variáveis de Ambiente

```bash
# .env
SUPABASE_PROJECT_ID=abc123xyz
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_DB_URL=postgresql://...
AUDIT_MODE=safe
AUDIT_OUTPUT_DIR=./reports
```

## 🤖 Integração com CI/CD

### GitHub Actions

```yaml
name: Supabase Audit
on:
  schedule:
    - cron: '0 3 * * *'  # Diariamente às 3h
  workflow_dispatch:

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm run audit
        env:
          SUPABASE_PROJECT_ID: ${{ secrets.SUPABASE_PROJECT_ID }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
      - uses: actions/upload-artifact@v3
        with:
          name: audit-report
          path: reports/
```

## 🆘 Troubleshooting

### "Erro ao conectar com Supabase MCP"

**Solução:**
1. Verifique se o MCP Supabase está ativo no Cursor
2. Tente listar seus projetos: `Liste meus projetos Supabase`
3. Se não funcionar, reinicie o Cursor

### "Funções SQL não encontradas"

**Solução:**
1. Execute novamente `sql/setup.sql`
2. Verifique permissões no banco (precisa de EXECUTE em funções)
3. Confirme que está usando o project ID correto

### "Permissão negada"

**Solução:**
1. Use Service Role Key em vez de Anon Key
2. Verifique se o usuário tem permissões suficientes
3. Algumas auditorias precisam de role `postgres`

## 📞 Suporte

Para problemas ou sugestões:
- Abra uma issue no GitHub
- Consulte a documentação completa em `/docs`
- Entre em contato via Discord da comunidade Supabase

