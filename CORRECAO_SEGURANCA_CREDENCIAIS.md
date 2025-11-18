# 🔒 CORREÇÃO DE SEGURANÇA - Credenciais Expostas

**Data**: 18/11/2025 10:45 BRT  
**Severidade**: 🔴 **CRÍTICA**  
**Status**: ✅ **CORRIGIDO**

---

## ⚠️ VULNERABILIDADE CRÍTICA IDENTIFICADA

### Bug de Segurança
**Credenciais Supabase (JWT tokens) estavam hardcoded nos workflows GitHub Actions**

### Arquivos Afetados
1. ❌ `.github/workflows/ci.yml`
2. ❌ `.github/workflows/deploy.yml`
3. ❌ `.github/workflows/validate-ia-topology.yml`

### Risco
- ✅ Credenciais expostas no histórico do Git
- ✅ Tokens visíveis nos logs do GitHub Actions
- ✅ Acesso público ao repositório expõe as keys
- ✅ Violação de segurança OWASP A07:2021

---

## ✅ CORREÇÃO APLICADA

### Antes (INSEGURO ❌)
```yaml
env:
  VITE_SUPABASE_URL: https://gvbkviozlhxorjoavmky.supabase.co
  VITE_SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Depois (SEGURO ✅)
```yaml
env:
  VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
  VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
```

---

## 🔧 CONFIGURAÇÃO NECESSÁRIA

### Passo 1: Acessar GitHub Secrets

1. Acesse: https://github.com/Icarus-AI-Technology/icarus-/settings/secrets/actions

2. Clique em **"New repository secret"**

### Passo 2: Adicionar Secrets

#### Secret 1: VITE_SUPABASE_URL
```
Name: VITE_SUPABASE_URL
Value: https://gvbkviozlhxorjoavmky.supabase.co
```

#### Secret 2: VITE_SUPABASE_ANON_KEY
```
Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2Ymt2aW96bGh4b3Jqb2F2bWt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTQ3NjUsImV4cCI6MjA3ODk5MDc2NX0.RtCGqdZ8KE-sbqG1w4E9dg2tqSEdusO4vbbr-3456c8
```

### Passo 3: Salvar

Clique em **"Add secret"** para cada uma.

---

## 🔐 SEGURANÇA ADICIONAL (RECOMENDADO)

### Rotacionar Credenciais Supabase

Como as credenciais foram expostas, é **altamente recomendado** rotacioná-las:

1. Acesse: https://gvbkviozlhxorjoavmky.supabase.co/project/gvbkviozlhxorjoavmky/settings/api

2. Clique em **"Reset anon key"**

3. Copie a nova key

4. Atualize o secret no GitHub:
   - https://github.com/Icarus-AI-Technology/icarus-/settings/secrets/actions
   - Edit `VITE_SUPABASE_ANON_KEY`
   - Cole a nova key

5. Atualize também na Vercel:
   - https://vercel.com/daxs-projects-5db3d203/icarus-oficial/settings/environment-variables
   - Edit `VITE_SUPABASE_ANON_KEY`
   - Cole a nova key

---

## 📝 MUDANÇAS APLICADAS

### Workflows Corrigidos (3 arquivos)

#### 1. `.github/workflows/ci.yml`
```diff
- VITE_SUPABASE_URL: https://gvbkviozlhxorjoavmky.supabase.co
- VITE_SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
+ VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
+ VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
```

#### 2. `.github/workflows/deploy.yml`
```diff
- VITE_SUPABASE_URL: https://gvbkviozlhxorjoavmky.supabase.co
- VITE_SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
+ VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
+ VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
```

#### 3. `.github/workflows/validate-ia-topology.yml`
```diff
- VITE_SUPABASE_URL: https://gvbkviozlhxorjoavmky.supabase.co
- VITE_SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
+ VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
+ VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
```

---

## ✅ VERIFICAÇÃO

### Como Verificar se Funcionou

1. **Configurar os secrets** (Passo 1-3 acima)

2. **Fazer novo commit e push**
   ```bash
   git add .github/workflows/*.yml
   git commit -m "security: remove hardcoded credentials from workflows"
   git push
   ```

3. **Verificar GitHub Actions**
   - Acesse: https://github.com/Icarus-AI-Technology/icarus-/actions
   - Os workflows devem usar secrets (não aparecerão nos logs)
   - Build deve passar normalmente

4. **Verificar Logs**
   ```
   ✅ Correto: env.VITE_SUPABASE_URL = ***
   ❌ Errado: env.VITE_SUPABASE_URL = https://...
   ```

---

## 📊 IMPACTO

### Antes (Vulnerável)
- ❌ Credenciais em texto puro no código
- ❌ Expostas no histórico do Git
- ❌ Visíveis em logs públicos
- ❌ Risco de acesso não autorizado

### Depois (Seguro)
- ✅ Credenciais em GitHub Secrets
- ✅ Não expostas no código
- ✅ Logs mostram apenas `***`
- ✅ Acesso restrito a admins do repo

---

## 🎯 CHECKLIST DE SEGURANÇA

### Imediato (CRÍTICO)
- [x] Remover credenciais hardcoded dos workflows
- [x] Usar GitHub Secrets
- [ ] Configurar secrets no GitHub (VOCÊ DEVE FAZER)
- [ ] Rotacionar anon key no Supabase (RECOMENDADO)
- [ ] Atualizar key na Vercel (se rotacionar)

### Próximos Passos (IMPORTANTE)
- [ ] Auditar histórico Git para outras exposições
- [ ] Implementar `.env.example` sem valores reais
- [ ] Documentar variáveis de ambiente necessárias
- [ ] Configurar branch protection rules
- [ ] Implementar code scanning (Dependabot)

---

## 🔗 Links Úteis

### GitHub Secrets
- **Configure aqui**: https://github.com/Icarus-AI-Technology/icarus-/settings/secrets/actions
- **Documentação**: https://docs.github.com/en/actions/security-guides/encrypted-secrets

### Supabase
- **Dashboard**: https://gvbkviozlhxorjoavmky.supabase.co
- **API Settings**: https://gvbkviozlhxorjoavmky.supabase.co/project/gvbkviozlhxorjoavmky/settings/api

### Vercel
- **Environment Variables**: https://vercel.com/daxs-projects-5db3d203/icarus-oficial/settings/environment-variables

---

## 📚 Referências de Segurança

### OWASP Top 10
- **A07:2021** – Identification and Authentication Failures
- https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/

### GitHub Security Best Practices
- Never commit secrets to your repository
- Use encrypted secrets for sensitive data
- Rotate secrets regularly
- Use short-lived tokens when possible

---

## ✅ CONCLUSÃO

### Status: CORREÇÃO APLICADA ✅

**Vulnerabilidade**: Credenciais Supabase expostas  
**Severidade**: 🔴 Crítica  
**Correção**: ✅ Aplicada (usando GitHub Secrets)  
**Ação necessária**: Configure os secrets no GitHub (5 minutos)

---

**Gerado em**: 18/11/2025 10:45 BRT  
**Prioridade**: 🔴 CRÍTICA - CONFIGURE OS SECRETS IMEDIATAMENTE  
**Tempo estimado**: 5 minutos para configurar secrets

