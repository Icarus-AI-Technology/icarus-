# ⚡ Quick Start - Supabase Auditor Pro

Comece a auditar seu projeto Supabase em **menos de 5 minutos**!

## 🚀 Início Rápido (3 passos)

### 1️⃣ Passo 1: Verifique o MCP

No Cursor, digite:

```
Liste meus projetos Supabase
```

✅ Se funcionar, você já tem MCP configurado!
❌ Se não funcionar, veja [MCP_INTEGRATION.md](./MCP_INTEGRATION.md)

### 2️⃣ Passo 2: Instale as Funções

No Cursor, digite:

```
Instale as funções de auditoria no meu projeto Supabase usando o arquivo sql/setup.sql
```

Aguarde a confirmação de que as funções foram criadas.

### 3️⃣ Passo 3: Execute a Auditoria

No Cursor, digite:

```
Audite meu projeto Supabase
```

Pronto! 🎉 Em alguns segundos você terá um relatório completo em `reports/`.

## 📊 O que você acabou de fazer?

A auditoria verificou:

- ✅ 12+ aspectos de Schema & Tabelas
- ✅ Índices duplicados, não usados ou inválidos
- ✅ RLS e políticas de segurança
- ✅ Storage buckets e arquivos
- ✅ Performance e queries lentas
- ✅ Funções e triggers problemáticos

## 🎯 Próximos Passos

### Ver Relatório

```bash
cd reports
ls -la
```

Abra o arquivo `.md` mais recente em qualquer editor.

### Corrigir Problemas Críticos

No Cursor:

```
Mostre apenas problemas críticos da última auditoria
```

Depois:

```
Como posso corrigir o problema X?
```

### Auditar Edge Functions

No Cursor:

```
Audite as Edge Functions do Supabase
```

## 💡 Comandos Úteis

| O que você quer | Digite no Cursor |
|-----------------|------------------|
| Auditoria completa | `Audite meu projeto Supabase` |
| Só segurança | `Audite segurança do Supabase` |
| Só performance | `Audite performance do Supabase` |
| Edge Functions | `Audite Edge Functions do Supabase` |
| Problemas críticos | `Mostre problemas críticos do Supabase` |
| Corrigir | `Corrija problema X no Supabase` |

## ⚠️ Modo Fix (Correções Automáticas)

Para executar correções automaticamente:

```
Audite meu Supabase e corrija problemas críticos
```

⚠️ **ATENÇÃO**: Isso executará alterações no banco!

**Recomendação**: 
1. Sempre revise o que será feito
2. Faça backup antes
3. Use primeiro no staging, não em produção

## 🆘 Problemas?

### "Funções não encontradas"

Repita o Passo 2:

```
Instale as funções de auditoria no meu projeto Supabase usando sql/setup.sql
```

### "Permissão negada"

Você precisa ser **owner** do projeto ou usar **Service Role Key**.

Configure no `.env`:

```bash
SUPABASE_SERVICE_ROLE_KEY=seu-service-role-key
```

### "MCP não encontrado"

Veja [MCP_INTEGRATION.md](./MCP_INTEGRATION.md) para configurar.

## 📚 Documentação Completa

- [README.md](./README.md) - Visão geral
- [ACTIVATION_GUIDE.md](./ACTIVATION_GUIDE.md) - Guia detalhado
- [MCP_INTEGRATION.md](./MCP_INTEGRATION.md) - Integração com MCP
- [PROMPTS.md](./PROMPTS.md) - Todos os comandos disponíveis

## 🎉 Pronto!

Você agora tem auditoria automatizada de Supabase no Cursor!

Execute auditorias regularmente para manter seu banco seguro e performático.

**Dica**: Configure auditoria diária com:

```
Configure auditoria automática diária do meu Supabase às 3h da manhã
```

