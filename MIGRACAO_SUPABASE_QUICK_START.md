# 🚀 Migração Supabase - Acesso Rápido

## 📋 Checklist de Execução

- [ ] 1. Ler `docs/GUIA_MIGRACAO_SUPABASE.md`
- [ ] 2. Escolher método de aplicação (Dashboard, CLI ou psql)
- [ ] 3. Aplicar migrações (consolidado ou blocos)
- [ ] 4. Executar queries de validação
- [ ] 5. Testar conexão da aplicação
- [ ] 6. Configurar .env com credenciais
- [ ] 7. (Opcional) Seed de dados demo

## 🎯 Links Diretos

### Dashboard Supabase
- **SQL Editor**: https://supabase.com/dashboard/project/gvbkviozlhxorjoavmky/sql
- **Database**: https://supabase.com/dashboard/project/gvbkviozlhxorjoavmky/database/tables
- **Logs**: https://supabase.com/dashboard/project/gvbkviozlhxorjoavmky/logs

### Arquivos Locais

| Arquivo | Caminho | Tamanho |
|---------|---------|---------|
| **Consolidado** | `supabase/migrations_consolidated.sql` | 2.12 MB |
| **Bloco 01** | `supabase/migrations_blocks/block_01.sql` | ~210 KB |
| **Bloco 02** | `supabase/migrations_blocks/block_02.sql` | ~210 KB |
| **Bloco 03** | `supabase/migrations_blocks/block_03.sql` | ~210 KB |
| **Bloco 04** | `supabase/migrations_blocks/block_04.sql` | ~210 KB |
| **Bloco 05** | `supabase/migrations_blocks/block_05.sql` | ~210 KB |
| **Bloco 06** | `supabase/migrations_blocks/block_06.sql` | ~210 KB |
| **Bloco 07** | `supabase/migrations_blocks/block_07.sql` | ~210 KB |
| **Bloco 08** | `supabase/migrations_blocks/block_08.sql` | ~210 KB |
| **Bloco 09** | `supabase/migrations_blocks/block_09.sql` | ~210 KB |
| **Bloco 10** | `supabase/migrations_blocks/block_10.sql` | ~210 KB |

## ⚡ Comandos Rápidos

### Via Dashboard (Copy & Paste)

```bash
# 1. Abrir arquivo consolidado
cat supabase/migrations_consolidated.sql | pbcopy

# 2. Ir para SQL Editor e colar (Cmd+V)
open https://supabase.com/dashboard/project/gvbkviozlhxorjoavmky/sql
```

### Via CLI

```bash
cd /Users/daxmeneghel/icarus-make
npx supabase login
npx supabase link --project-ref gvbkviozlhxorjoavmky
npx supabase db push
```

### Via Blocos Sequenciais

```bash
# Copiar bloco 1 para clipboard
cat supabase/migrations_blocks/block_01.sql | pbcopy

# Depois de aplicar bloco 1, repetir para 2-10:
cat supabase/migrations_blocks/block_02.sql | pbcopy
# ... etc
```

## 📊 Queries de Validação

### Query 1: Contar Tabelas
```sql
SELECT COUNT(*) as total FROM information_schema.tables WHERE table_schema = 'public';
-- Esperado: ~100
```

### Query 2: Listar Tabelas
```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
```

### Query 3: Verificar RLS
```sql
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true;
```

## 🔑 Credenciais

```bash
# Para .env ou .env.local
VITE_SUPABASE_URL=https://gvbkviozlhxorjoavmky.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2Ymt2aW96bGh4b3Jqb2F2bWt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTQ3NjUsImV4cCI6MjA3ODk5MDc2NX0.RtCGqdZ8KE-sbqG1w4E9dg2tqSEdusO4vbbr-3456c8
```

## 📚 Documentação Completa

1. **Guia de Migração**: `docs/GUIA_MIGRACAO_SUPABASE.md`
2. **Relatório Executivo**: `docs/RELATORIO_MIGRACAO_SUPABASE.md`

---

**Última atualização**: 18/11/2025 01:10  
**Status**: ✅ Pronto para aplicação

