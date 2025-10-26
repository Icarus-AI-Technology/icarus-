# 🚀 GUIA DE DEPLOY - ICARUS V5.0 IA

**Data:** 26 de Outubro de 2025  
**Sistema:** ICARUS v5.0 com Dashboard de IA  
**Status:** ✅ Pronto para produção

---

## 📋 ÍNDICE

1. [Deploy Vercel (Recomendado)](#deploy-vercel)
2. [Deploy Docker](#deploy-docker)
3. [Variáveis de Ambiente](#variáveis-de-ambiente)
4. [Monitoramento](#monitoramento)
5. [Troubleshooting](#troubleshooting)

---

## 🎯 DEPLOY VERCEL (Recomendado)

### Pré-requisitos

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Login
vercel login
```

### Deploy em 3 Passos

```bash
# 1. Build local para validar
pnpm run build

# 2. Deploy para preview
vercel

# 3. Deploy para produção
vercel --prod
```

###  Configuração no Vercel Dashboard

1. Acesse [vercel.com](https://vercel.com) → Seu projeto
2. **Settings** → **Environment Variables**
3. Adicione as variáveis (veja seção abaixo)
4. **Redeploy** para aplicar as mudanças

### Configuração Otimizada (vercel.json)

```json
{
  "buildCommand": "pnpm run build",
  "outputDirectory": "dist",
  "devCommand": "pnpm run dev",
  "installCommand": "pnpm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

### Deploy Automático com GitHub

1. Conecte seu repositório GitHub ao Vercel
2. Cada push em `main` → deploy automático
3. Pull Requests → preview automático

---

## 🐳 DEPLOY DOCKER

### Dockerfile Otimizado

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar package files
COPY package.json pnpm-lock.yaml ./

# Instalar dependências
RUN pnpm install --frozen-lockfile

# Copiar código
COPY . .

# Build
ENV NODE_ENV=production
RUN pnpm run build

# Stage 2: Runtime
FROM nginx:alpine

# Copiar build
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Expor porta
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;

    server {
        listen 80;
        server_name _;
        root /usr/share/nginx/html;
        index index.html;

        # Security headers
        add_header X-Frame-Options "DENY" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;

        # SPA routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Health check
        location /health {
            access_log off;
            return 200 "OK\n";
            add_header Content-Type text/plain;
        }
    }
}
```

### Docker Compose

```yaml
version: '3.8'

services:
  icarus-web:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - '80:80'
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'wget', '--quiet', '--tries=1', '--spider', 'http://localhost/health']
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### Deploy com Docker

```bash
# 1. Build da imagem
docker build -t icarus-v5:latest .

# 2. Testar localmente
docker run -p 3000:80 icarus-v5:latest

# 3. Push para registry
docker tag icarus-v5:latest your-registry/icarus-v5:latest
docker push your-registry/icarus-v5:latest

# 4. Deploy em servidor
docker-compose up -d
```

---

## 🔐 VARIÁVEIS DE AMBIENTE

### Essenciais (Produção)

```bash
# Supabase (OBRIGATÓRIO)
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui

# Ambiente
VITE_APP_ENV=production
NODE_ENV=production
```

### IA e LLM (Opcional, mas recomendado)

```bash
# Ollama (Local - se disponível)
VITE_OLLAMA_URL=http://localhost:11434
VITE_OLLAMA_DEFAULT_MODEL=llama3.1:8b

# OpenAI (GPT-4 Turbo)
VITE_OPENAI_API_KEY=sk-...
VITE_OPENAI_MODEL=gpt-4-turbo-preview

# Anthropic (Claude 3.5 Sonnet)
VITE_ANTHROPIC_API_KEY=sk-ant-...
VITE_ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

### Integrações (Opcional)

```bash
# Pluggy (Open Finance)
PLUGGY_CLIENT_ID=
PLUGGY_CLIENT_SECRET=

# Email (SendGrid)
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=noreply@icarus.com.br

# SMS (Twilio)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

### Como Configurar no Vercel

```bash
# Via CLI
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
vercel env add VITE_OPENAI_API_KEY production

# Ou via dashboard: Settings → Environment Variables
```

---

## 📊 MONITORAMENTO

### 1. Vercel Analytics (Incluso)

Já está configurado via `@vercel/analytics/react`

```typescript
// src/App.tsx (já incluso)
import { Analytics } from '@vercel/analytics/react';

<Analytics />
```

### 2. Grafana + Prometheus (Self-hosted)

Já configurado em `/monitoring/MONITORING_SETUP.md`

```bash
# Iniciar stack de monitoring
docker-compose -f monitoring/docker-compose.yml up -d

# Acessar
# Grafana: http://localhost:3001 (admin/icarus2025)
# Prometheus: http://localhost:9090
```

### 3. Error Tracking (Opcional)

**Sentry:**
```bash
npm install @sentry/react @sentry/vite-plugin

# Adicione no vite.config.ts
import { sentryVitePlugin } from "@sentry/vite-plugin";
```

---

## 🔧 OTIMIZAÇÕES DE PRODUÇÃO

### 1. Build Otimizado

```json
// package.json
{
  "scripts": {
    "build": "vite build --mode production",
    "build:analyze": "vite build --mode production && vite-bundle-visualizer"
  }
}
```

### 2. Code Splitting

Já implementado via lazy loading:
```typescript
const DashboardIA = lazy(() => import('./pages/DashboardIA'));
```

### 3. Compressão

- Gzip habilitado (nginx.conf)
- Brotli (adicione se necessário)

### 4. CDN

Vercel inclui CDN global automático

### 5. Cache Strategy

```
Assets estáticos: 1 ano (immutable)
HTML: sem cache (always fresh)
API calls: validar no servidor
```

---

## 🚨 TROUBLESHOOTING

### Build falha

```bash
# Limpar cache
rm -rf node_modules dist .vite
pnpm install
pnpm run build
```

### Variáveis de ambiente não funcionam

- Verifique prefixo `VITE_` (obrigatório para Vite)
- Redeploy após adicionar variáveis
- Veja logs: `vercel logs --follow`

### Rotas 404

- Verifique `vercel.json` rewrites
- Nginx: location / try_files

### Performance lenta

- Ative Gzip/Brotli
- Code splitting lazy loading
- Analise bundle: `pnpm run build:analyze`

---

## ✅ CHECKLIST PRÉ-DEPLOY

- [ ] `.env` configurado com Supabase
- [ ] Build local funciona: `pnpm run build`
- [ ] TypeScript sem erros: `pnpm run type-check`
- [ ] Testes passam (se houver)
- [ ] API keys configuradas (OpenAI/Claude opcional)
- [ ] Domínio configurado (se custom)
- [ ] SSL/HTTPS habilitado
- [ ] Monitoring configurado
- [ ] Backups Supabase ativos
- [ ] Documentação atualizada

---

## 🎯 URLS PÓS-DEPLOY

Após deploy, acesse:

- **Dashboard Principal:** https://seu-dominio.com/
- **Dashboard IA:** https://seu-dominio.com/dashboard-ia
- **Estoque IA:** https://seu-dominio.com/estoque
- **Cirurgias:** https://seu-dominio.com/cirurgias
- **Financeiro:** https://seu-dominio.com/financeiro

---

## 📈 MÉTRICAS DE SUCESSO

| Métrica | Meta | Como Medir |
|---------|------|------------|
| **Lighthouse Score** | >90 | Chrome DevTools |
| **Time to Interactive** | <3s | Vercel Analytics |
| **Bundle Size** | <500KB | Build output |
| **Uptime** | >99.5% | Vercel Dashboard |
| **Error Rate** | <1% | Sentry/Logs |

---

## 🎉 DEPLOY COMPLETO!

Após seguir este guia, seu sistema ICARUS v5.0 com Dashboard de IA estará:

✅ Rodando em produção  
✅ Otimizado para performance  
✅ Monitorado 24/7  
✅ Escalável automaticamente  
✅ Seguro (HTTPS + Headers)  

**Suporte:** contato@icarus.com.br  
**Documentação:** README.md

---

**Guia criado por:** Agente 05 - Inteligência Artificial  
**Data:** 26 de Outubro de 2025  
**Versão:** 1.0

