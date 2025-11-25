# 🚨 AÇÕES IMEDIATAS - ICARUS V5.0

**Data:** 26 de Outubro de 2025  
**Prioridade:** 🔴 URGENTE

---

## 🔴 ANTES DE FAZER DEPLOY

### 1. Remover Variáveis de Backend do .env

**Problema:** 4 variáveis de backend estão expostas no frontend

**Solução:**

```bash
# Editar .env
nano .env

# Remover estas linhas:
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
ML_SERVICE_URL=http://localhost:8765
```

**Por que?** Estas variáveis não devem estar no frontend porque:

- São credenciais de backend
- Expõem infraestrutura interna
- Não são necessárias no cliente React/Vite

---

### 2. Verificar .env.example

```bash
# Garantir que não há credenciais reais
cat .env.example | grep "ttswvavcisdnonytslom"

# Se encontrar, substituir por placeholders
nano .env.example
```

**Substituir:**

```env
# ANTES (ERRADO):
VITE_SUPABASE_URL=https://ttswvavcisdnonytslom.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# DEPOIS (CORRETO):
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

---

### 3. Rotacionar Chaves Supabase (Recomendado)

**Por que?** As chaves podem ter sido expostas em commits/logs

**Como:**

1. Acessar: https://app.supabase.com/project/ttswvavcisdnonytslom/settings/api
2. Clicar em "Regenerate" na seção "Project API keys"
3. Copiar nova `anon key`
4. Atualizar `.env`:

```env
VITE_SUPABASE_ANON_KEY=nova-chave-aqui
```

5. **NÃO** rotacionar a `service_role` key (usada apenas no backend)

---

### 4. Rebuild e Testar

```bash
# Rebuild
pnpm build

# Validar novamente
node .cursor/agents/environment-checker/check-env.cjs

# Deve mostrar:
# ✅ Variáveis Proibidas: 0
```

---

## ✅ CHECKLIST

- [ ] Removi `REDIS_URL` do .env
- [ ] Removi `REDIS_HOST` do .env
- [ ] Removi `REDIS_PORT` do .env
- [ ] Removi `ML_SERVICE_URL` do .env
- [ ] Verifiquei que .env.example não tem credenciais reais
- [ ] Rotacionei chave Supabase (opcional mas recomendado)
- [ ] Executei `pnpm build` com sucesso
- [ ] Executei validação de ambiente e passou
- [ ] Li a documentação de deploy (`MIGRATION_PLAN.md`)

---

## 🚀 PRÓXIMO PASSO

Após completar este checklist:

```bash
# Deploy para preview
pnpm deploy:vercel:preview

# Testar em preview
# Se tudo OK, deploy para produção
pnpm deploy:vercel:prod
```

---

## 📞 DÚVIDAS?

Ver documentação completa:

- `RELATORIO_ORQUESTRADOR_FINAL.md`
- `MIGRATION_PLAN.md`
- `ORQUESTRADOR_RELATORIO.md`

---

**⏱️ Tempo Estimado:** 5-10 minutos  
**🔴 Prioridade:** CRÍTICA (segurança)
