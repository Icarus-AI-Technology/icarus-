# 🚀 ICARUS - Guia Completo de Deploy

Este guia fornece instruções detalhadas para fazer o deploy do ICARUS v5.0 na Vercel.

---

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Configuração do Vercel](#configuração-do-vercel)
3. [Variáveis de Ambiente](#variáveis-de-ambiente)
4. [Processo de Deploy](#processo-de-deploy)
5. [Troubleshooting](#troubleshooting)
6. [FAQ](#faq)

---

## 🔧 Pré-requisitos

### Requisitos de Sistema

- **Node.js**: 20.x ou superior
- **pnpm**: 8.x ou superior
- **Git**: Configurado e autenticado
- **Conta Vercel**: Com acesso ao projeto

### Requisitos do Projeto

- **Supabase**: Projeto configurado com URL e Anon Key
- **GitHub**: Repositório conectado à Vercel

### URLs do Projeto

- **Repositório**: https://github.com/Icarus-AI-Technology/icarus-oficial
- **Domain Vercel**: icarus-oficial.vercel.app
- **Deploy URL**: icarus-oficial-4kas3hr3g-daxs-projects-5db3d203.vercel.app

---

## ⚙️ Configuração do Vercel

### Framework Settings

**IMPORTANTE**: Este é um projeto **Vite + React**, NÃO Next.js.

#### Configurações Recomendadas na Vercel:

```
Framework Preset: Vite (ou deixe em branco para auto-detect)
Build Command: pnpm type-check && pnpm build
Output Directory: dist
Install Command: pnpm install
Node Version: 20.x
```

#### Configuração via `vercel.json`

O arquivo `vercel.json` já está configurado corretamente:

```json
{
  "buildCommand": "pnpm type-check && pnpm build",
  "installCommand": "pnpm install",
  "outputDirectory": "dist",
  "env": {
    "NODE_ENV": "production",
    "ENABLE_IA_VALIDATION": "true",
    "VITE_ENABLE_AGENTS": "true"
  }
}
```

**⚠️ NÃO configure como Next.js!** Isso causará erro de build.

---

## 🔐 Variáveis de Ambiente

### Variáveis Obrigatórias

Configure estas variáveis no Dashboard da Vercel:

#### Supabase (CRÍTICO)

```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

#### App Configuration

```bash
VITE_APP_URL=https://icarus-oficial.vercel.app
NODE_ENV=production
VITE_APP_ENV=production
```

### Variáveis Opcionais (Features Adicionais)

#### IA Services

```bash
VITE_OPENAI_API_KEY=sk-...
VITE_ANTHROPIC_API_KEY=sk-ant-...
VITE_OLLAMA_URL=http://localhost:11434
```

#### Email & SMS

```bash
SENDGRID_API_KEY=SG...
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
```

#### Analytics

```bash
VERCEL_ANALYTICS_ID=...
```

### Como Adicionar Variáveis na Vercel

1. Acesse: https://vercel.com/daxs-projects-5db3d203/icarus-oficial/settings/environment-variables
2. Clique em "Add New"
3. Adicione Nome e Valor
4. Selecione ambientes: Production, Preview, Development
5. Clique em "Save"

**Nota**: Prefixo `VITE_` é obrigatório para variáveis expostas ao frontend.

---

## 🚀 Processo de Deploy

### Deploy via Git Push (Recomendado)

```bash
# 1. Certifique-se de estar na branch main
git checkout main

# 2. Faça suas alterações
git add .
git commit -m "feat: suas alterações"

# 3. Push para o GitHub
git push origin main

# 4. Vercel detecta automaticamente e inicia o deploy
```

### Deploy via Vercel CLI

```bash
# 1. Instale Vercel CLI globalmente
npm i -g vercel

# 2. Login na Vercel
vercel login

# 3. Link ao projeto (primeira vez)
vercel link

# 4. Deploy para preview
vercel

# 5. Deploy para produção
vercel --prod
```

### Deploy via Dashboard Vercel

1. Acesse: https://vercel.com/daxs-projects-5db3d203/icarus-oficial
2. Vá em "Deployments"
3. Clique em "Redeploy" no deployment mais recente
4. Ou faça commit no GitHub para trigger automático

---

## 🐛 Troubleshooting

### Erro: "Could not load Textarea"

**Causa**: Import com case incorreto em filesystem case-sensitive (Linux).

**Solução**:

- Verifique que todos os imports usam lowercase após `/ui/`:

  ```typescript
  // ✅ CORRETO
  import { Textarea } from "@/components/ui/textarea";

  // ❌ ERRADO
  import { Textarea } from "@/components/ui/Textarea";
  ```

### Erro: "Framework nextjs not supported"

**Causa**: `vercel.json` configurado para Next.js.

**Solução**:

- Remova `"framework": "nextjs"` do `vercel.json`
- Ou defina como `null` / deixe em branco

### Erro de Build: Type Check Failed

**Causa**: Erros TypeScript não resolvidos.

**Solução**:

```bash
# Rode localmente para ver os erros
pnpm type-check

# Corrija os erros apontados
# Depois faça commit e push
```

### Erro: Environment Variables Not Found

**Causa**: Variáveis não configuradas na Vercel.

**Solução**:

1. Vá em: Settings → Environment Variables
2. Adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
3. Redeploy o projeto

### Build Timeout

**Causa**: Build demorando muito ou travando.

**Solução**:

- Verifique se não há loop infinito em componentes
- Reduza `chunkSizeWarningLimit` no `vite.config.ts`
- Contate suporte Vercel se persistir

### "More Recent Deployment" Message

**Causa**: Tentativa de redeploy de versão antiga.

**Solução**:

- Não é um erro, apenas informação
- Sempre faça novo commit/push para novo deployment
- Ou redeploy a versão MAIS RECENTE

---

## 📊 Validação Pós-Deploy

### Checklist Pós-Deploy

```bash
✅ Build concluído sem erros
✅ Type check passou (0 erros)
✅ Lint passou (0 erros críticos)
✅ URL de produção acessível
✅ Dashboard carrega corretamente
✅ Autenticação funciona
✅ API Supabase conectada
✅ Rotas principais funcionando:
   - / (Home)
   - /dashboard
   - /login
   - /contact
```

### Testes Manuais Rápidos

1. **Acesse a URL de produção**:
   - https://icarus-oficial.vercel.app

2. **Teste autenticação**:
   - Tente fazer login
   - Verifique redirect

3. **Teste dashboard**:
   - Verifique se KPIs carregam
   - Teste navegação entre módulos

4. **Teste formulário de contato**:
   - Vá em /contact
   - Envie mensagem de teste

5. **Verifique console do browser**:
   - Não deve haver erros críticos
   - Avisos são aceitáveis

---

## ❓ FAQ

### Q: Posso usar npm ao invés de pnpm?

**A**: Não recomendado. O projeto usa `pnpm-lock.yaml`. Se precisar usar npm:

```bash
# Delete pnpm-lock.yaml
rm pnpm-lock.yaml

# Gere package-lock.json
npm install

# Atualize vercel.json para usar npm
# Mas pode haver incompatibilidades
```

### Q: Como fazer rollback de um deploy?

**A**:

1. Vá em: Deployments
2. Encontre o deployment anterior funcional
3. Clique nos "..." → "Promote to Production"

### Q: Como ver logs de build?

**A**:

1. Acesse o deployment específico na Vercel
2. Vá na aba "Build Logs"
3. Veja logs detalhados do processo

### Q: Como configurar domínio customizado?

**A**:

1. Vá em: Settings → Domains
2. Adicione seu domínio
3. Configure DNS conforme instruções Vercel
4. Aguarde propagação (até 48h)

### Q: O que são as variáveis VITE\_\*?

**A**: Vite expõe apenas variáveis com prefixo `VITE_` ao código do frontend. Variáveis sem esse prefixo ficam disponíveis apenas no build server.

### Q: Como adicionar mais integrações?

**A**:

1. Adicione variáveis de ambiente necessárias
2. Implemente no código
3. Deploy normalmente
4. Configure Vercel Edge Functions se precisar de serverless

### Q: Posso usar Vercel Functions?

**A**: Sim! Crie arquivos em `/api` e a Vercel auto-detecta. Exemplo já configurado: `/api/contact`

---

## 🔗 Links Úteis

- **Vercel Dashboard**: https://vercel.com/daxs-projects-5db3d203/icarus-oficial
- **Documentação Vercel**: https://vercel.com/docs
- **Documentação Vite**: https://vitejs.dev
- **Supabase Dashboard**: https://app.supabase.com
- **GitHub Repository**: https://github.com/Icarus-AI-Technology/icarus-oficial

---

## 📞 Suporte

### Em caso de problemas:

1. **Verifique logs de build** na Vercel
2. **Rode localmente**: `pnpm dev` e teste
3. **Valide tipo**: `pnpm type-check`
4. **Valide lint**: `pnpm lint`
5. **Consulte este guia**: seção Troubleshooting

### Comandos de Debug Local

```bash
# Limpar cache e reinstalar
rm -rf node_modules dist .vite
pnpm install

# Build de produção local
pnpm build

# Preview de produção local
pnpm preview

# Testar exatamente como na Vercel
pnpm type-check && pnpm build
```

---

**Última Atualização**: Novembro 2024  
**Versão do Guia**: 1.0.0  
**Projeto**: ICARUS v5.0 - Sistema de Gestão OPME
