# 🚀 GUIA RÁPIDO DE DEPLOY - ICARUS v5.0

**Data**: 18 de Novembro de 2025  
**Status**: ✅ Vercel e Supabase Configurados  
**Tempo Estimado**: 15 minutos  

---

## ✅ PRÉ-REQUISITOS CONFIRMADOS

- [x] **Vercel**: Configurado e pronto
- [x] **Supabase**: Projeto criado (gvbkviozlhxorjoavmky)
- [x] **Build**: Testado e funcionando (970KB, 21.32s)
- [x] **Variáveis**: Template criado

---

## 🎯 PASSO 1: Configurar Variáveis no Vercel (5 min)

### Acessar Vercel Dashboard
```bash
# Abrir no navegador
https://vercel.com/dashboard
```

### Adicionar Variáveis de Ambiente

**Projeto > Settings > Environment Variables**

#### Variáveis Obrigatórias:

```bash
# Supabase
VITE_SUPABASE_URL=https://gvbkviozlhxorjoavmky.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2Ymt2aW96bGh4b3Jqb2F2bWt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTQ3NjUsImV4cCI6MjA3ODk5MDc2NX0.RtCGqdZ8KE-sbqG1w4E9dg2tqSEdusO4vbbr-3456c8
```

#### Variáveis Recomendadas (APIs Públicas):

```bash
# APIs Públicas (sem autenticação necessária)
VITE_VIA_CEP_API_URL=https://viacep.com.br/ws
VITE_RECEITA_FEDERAL_API_URL=https://www.receitaws.com.br/v1
VITE_CFM_API_URL=https://portal.cfm.org.br/api

# Environment
NODE_ENV=production
VITE_APP_ENV=production
```

---

## 🗄️ PASSO 2: Aplicar Migrations no Supabase (5 min)

### Opção A: Via CLI (Recomendado)

```bash
# 1. Link ao projeto Supabase
npx supabase link --project-ref gvbkviozlhxorjoavmky

# 2. Aplicar migrations (90 arquivos)
npx supabase db push

# 3. Verificar status
npx supabase db diff
```

### Opção B: Via SQL Editor (Manual)

1. Acessar: https://supabase.com/dashboard/project/gvbkviozlhxorjoavmky
2. SQL Editor > New Query
3. Copiar conteúdo de cada migration em `supabase/migrations/*.sql`
4. Executar em ordem cronológica

**⚠️ IMPORTANTE**: Executar migrations na ordem correta!

---

## 🚀 PASSO 3: Deploy para Produção (2 min)

### Via CLI (Mais Rápido)

```bash
# 1. Login no Vercel (se necessário)
npx vercel login

# 2. Deploy produção
npx vercel --prod

# 3. Aguardar build e deploy
# URL será exibida no final
```

### Via Git Push (Automático)

```bash
# 1. Commit e push para main/master
git add .
git commit -m "feat: deploy produção v5.0"
git push origin main

# 2. Vercel vai detectar e deployar automaticamente
```

---

## ✅ PASSO 4: Validação Pós-Deploy (3 min)

### Smoke Tests

Acessar a URL fornecida pelo Vercel e testar:

- [ ] **Homepage carrega** sem erros
- [ ] **Login funciona** (criar conta teste)
- [ ] **Dashboard principal** renderiza
- [ ] **Navegação** entre módulos OK
- [ ] **Console do navegador** sem erros críticos

### Verificar Conexão Supabase

Abrir DevTools (F12) > Network > Filtrar "supabase"

- [ ] Requisições retornam 200 OK
- [ ] Autenticação funciona
- [ ] Dados carregam corretamente

---

## 🔧 TROUBLESHOOTING

### Erro: "Failed to fetch"

**Causa**: Variáveis de ambiente não configuradas  
**Solução**: Verificar VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no Vercel

### Erro: "Invalid API key"

**Causa**: Chave Supabase incorreta  
**Solução**: Copiar novamente do Supabase Dashboard > Settings > API

### Erro: Build falhou

**Causa**: Dependências ou código com erro  
**Solução**: Executar `npm run build` localmente e corrigir erros

### Erro: Migrations falharam

**Causa**: Ordem de execução ou dependências  
**Solução**: Verificar logs do Supabase e executar migrations manualmente

---

## 📊 CHECKLIST FINAL

### Antes do Deploy
- [x] Build local funcionando
- [x] Testes passando (93.5%)
- [x] Variáveis de ambiente prontas
- [x] Migrations SQL validadas

### Durante o Deploy
- [ ] Variáveis configuradas no Vercel
- [ ] Migrations aplicadas no Supabase
- [ ] Deploy executado com sucesso
- [ ] URL de produção acessível

### Após o Deploy
- [ ] Smoke tests realizados
- [ ] Conexão Supabase OK
- [ ] Sem erros no console
- [ ] Navegação funcionando

---

## 📞 SUPORTE RÁPIDO

### Links Úteis

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://supabase.com/dashboard/project/gvbkviozlhxorjoavmky
- **Logs Vercel**: `vercel logs --follow`
- **Logs Supabase**: Dashboard > Logs

### Comandos Úteis

```bash
# Ver logs do Vercel
vercel logs --follow

# Redeployar última versão
vercel --prod --force

# Rollback (se necessário)
# Acessar Vercel Dashboard > Deployments > Redeploy versão anterior

# Verificar status do projeto
vercel whoami
vercel list
```

---

## 🎉 CONCLUSÃO

Com o Vercel e Supabase já configurados, o deploy deve ser muito rápido!

```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║  ✅ CONFIGURAÇÃO COMPLETA!                               ║
║                                                           ║
║  🗄️  Supabase: gvbkviozlhxorjoavmky                      ║
║  🚀 Vercel:    Configurado                               ║
║  📦 Build:     Pronto (970KB, 21.32s)                    ║
║                                                           ║
║  ⏱️  Tempo estimado: 15 minutos                          ║
║                                                           ║
║  🎯 Próximo passo: Adicionar variáveis no Vercel        ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

**Comando rápido para deploy**:
```bash
npx vercel --prod
```

**Boa sorte com o lançamento do ICARUS v5.0!** 🚀🇧🇷

---

**Criado em**: 18 de Novembro de 2025  
**Versão**: 1.0.0  
**Para mais detalhes**: Ver `CHECKLIST_PRODUCAO_COMPLETO.md`

