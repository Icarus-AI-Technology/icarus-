# 🚀 GUIA DE DEPLOYMENT - PRÓXIMOS PASSOS

**Data:** 20 de outubro de 2025  
**Status:** 📋 Checklist de Implementação

---

## 📋 CHECKLIST DE DEPLOYMENT

### ✅ Fase 1 - Preparação (Código - COMPLETO)
- [x] Services TypeScript criados (8 services)
- [x] Documentação técnica completa
- [x] Build limpo (zero erros)
- [x] Types 100% strict mode

### 🔧 Fase 2 - Setup de Infraestrutura (Requer instalação)

#### 1️⃣ Ollama (LLM Local) - AGUARDANDO INSTALAÇÃO
**Status:** ⏳ Não instalado localmente  
**Comando de instalação:**
```bash
# macOS
curl -fsSL https://ollama.com/install.sh | sh

# Verificar instalação
ollama --version

# Pull modelos
ollama pull llama3.1:8b    # 4.7GB
ollama pull mistral:7b      # 4.1GB

# Testar
ollama run llama3.1:8b "O que é OPME?"
```

**Configuração no projeto:**
```bash
# .env.local
VITE_OLLAMA_URL=http://localhost:11434
VITE_OLLAMA_DEFAULT_MODEL=llama3.1:8b
```

**Alternativa Cloud (GPU):**
- **RunPod:** https://runpod.io ($0.20-0.50/hora)
- **Modal Labs:** https://modal.com (serverless, pay-per-use)

---

#### 2️⃣ Docker (Para Redis, Meilisearch, GlitchTip) - AGUARDANDO INSTALAÇÃO
**Status:** ⏳ Não instalado localmente  
**Comando de instalação:**
```bash
# macOS
brew install docker
# Ou baixar Docker Desktop: https://www.docker.com/products/docker-desktop

# Verificar instalação
docker --version
docker-compose --version
```

---

#### 3️⃣ Resend (Email) - CONFIGURAÇÃO MANUAL
**Status:** ⏳ Requer conta + API key  
**Passos:**

1. Criar conta: https://resend.com
2. Verificar domínio (ou usar sandbox)
3. Gerar API key em Settings > API Keys
4. Configurar no projeto:

```bash
# .env.local
VITE_RESEND_API_KEY=re_xxxxxxxxxxxxx
```

**Teste rápido:**
```typescript
import { resendService } from '@/lib/email/resend.service';

// Testar em console do navegador
await resendService.sendEmail({
  to: 'seu-email@example.com',
  subject: 'Teste ICARUS',
  html: '<h1>Email funcionando!</h1>'
});
```

---

#### 4️⃣ Redis + BullMQ - AGUARDANDO DOCKER
**Status:** ⏳ Aguardando Docker  
**Setup após Docker instalado:**

```bash
# Redis local
docker run -d --name redis \
  -p 6379:6379 \
  redis:7-alpine

# Verificar
docker ps | grep redis
redis-cli ping  # Deve retornar "PONG"
```

**Alternativa Cloud (Free):**
- **Redis Cloud:** https://redis.com/try-free (30MB grátis)
- Criar database
- Copiar connection string

```bash
# .env.local
VITE_REDIS_URL=redis://default:password@redis-xxxxx.redislabs.com:16379
```

---

#### 5️⃣ Meilisearch - AGUARDANDO DOCKER
**Status:** ⏳ Aguardando Docker  
**Setup após Docker instalado:**

```bash
# Meilisearch local
docker run -d --name meilisearch \
  -p 7700:7700 \
  -e MEILI_MASTER_KEY=your-master-key-here \
  -v meilisearch_data:/meili_data \
  getmeili/meilisearch:latest

# Verificar
curl http://localhost:7700/health
```

**Alternativa Cloud:**
- **Meilisearch Cloud:** https://cloud.meilisearch.com (14 dias trial)

```bash
# .env.local
VITE_MEILISEARCH_URL=http://localhost:7700
VITE_MEILISEARCH_API_KEY=your-master-key-here
```

---

#### 6️⃣ PostHog (Analytics) - CONFIGURAÇÃO MANUAL
**Status:** ⏳ Requer conta + API key  
**Passos:**

1. Criar conta: https://posthog.com (1M events/mês grátis)
2. Criar projeto
3. Copiar API key (Project Settings > API keys)

```bash
# .env.local
VITE_POSTHOG_API_KEY=phc_xxxxxxxxxxxxx
VITE_POSTHOG_HOST=https://app.posthog.com
```

---

#### 7️⃣ GlitchTip (Error Tracking) - AGUARDANDO DOCKER
**Status:** ⏳ Aguardando Docker  
**Setup após Docker instalado:**

```bash
# Criar docker-compose.yml
cat > docker-compose.glitchtip.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: glitchtip
      POSTGRES_USER: glitchtip
      POSTGRES_PASSWORD: glitchtip
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine

  web:
    image: glitchtip/glitchtip:latest
    depends_on:
      - postgres
      - redis
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgres://glitchtip:glitchtip@postgres:5432/glitchtip
      REDIS_URL: redis://redis:6379/0
      SECRET_KEY: change-this-secret-key
      GLITCHTIP_DOMAIN: http://localhost:8000
    volumes:
      - uploads:/code/uploads

  worker:
    image: glitchtip/glitchtip:latest
    command: celery -A glitchtip worker -l info
    depends_on:
      - postgres
      - redis
    environment:
      DATABASE_URL: postgres://glitchtip:glitchtip@postgres:5432/glitchtip
      REDIS_URL: redis://redis:6379/0
      SECRET_KEY: change-this-secret-key

volumes:
  postgres_data:
  uploads:
EOF

# Iniciar
docker-compose -f docker-compose.glitchtip.yml up -d

# Acessar: http://localhost:8000
# Criar conta e projeto
# Copiar DSN
```

```bash
# .env.local
VITE_GLITCHTIP_DSN=http://xxxxx@localhost:8000/1
VITE_ENVIRONMENT=production
VITE_RELEASE=v5.0.0
```

---

### 🔄 Fase 3 - Integrações de Código (PODEMOS FAZER AGORA!)

Estas integrações não dependem de serviços externos e podem ser implementadas imediatamente:

#### ✅ 1. Integrar BrasilAPI em Formulários
- Auto-fill CEP → Endereço
- Validação CNPJ em tempo real
- Busca de bancos

#### ✅ 2. Migrar BullMQ de Mock para Real
- Implementar BullMQ real (quando Redis disponível)
- Criar workers backend
- Configurar retries

#### ✅ 3. Integrar PostHog no Router
- Page views automáticos
- Event tracking em ações críticas
- User identification no login

#### ✅ 4. Feature Flags
- Criar hook useFeatureFlag
- Implementar rollout gradual
- A/B testing UI

#### ✅ 5. Dashboard de Monitoramento
- Status dos services
- Métricas em tempo real
- Health checks

---

## 🎯 PRIORIZAÇÃO RECOMENDADA

### Opção A - Máximo Local (Requer instalações)
1. Instalar Docker
2. Setup Redis local
3. Setup Meilisearch local
4. Implementar integrações de código
5. Setup Ollama (opcional, pode usar GPU cloud)
6. Setup GlitchTip local

### Opção B - Cloud First (Mais rápido, alguns custos)
1. ✅ Criar conta Resend (grátis: 3k emails/mês)
2. ✅ Criar conta PostHog (grátis: 1M events/mês)
3. ✅ Redis Cloud (grátis: 30MB)
4. ✅ Meilisearch Cloud (trial 14 dias)
5. ✅ Ollama em RunPod/Modal (GPU cloud)
6. ✅ Implementar todas as integrações de código

### Opção C - Híbrido (RECOMENDADO) ⭐
1. ✅ **Agora:** Implementar integrações de código (BrasilAPI, PostHog, feature flags)
2. ✅ **Agora:** Criar contas cloud (Resend, PostHog) - 100% grátis
3. ⏳ **Depois:** Instalar Docker quando conveniente
4. ⏳ **Depois:** Setup serviços locais (Redis, Meilisearch)
5. ⏳ **Depois:** Avaliar Ollama (local vs cloud)

---

## 📝 TEMPLATE .env.local

```bash
# ==============================================
# ICARUS v5.0 - Environment Variables
# ==============================================

# App
VITE_APP_URL=http://localhost:3000
VITE_ENVIRONMENT=development
VITE_RELEASE=v5.0.0

# Supabase (já configurado)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-key

# Ollama (LLM Local) - Opcional
VITE_OLLAMA_URL=http://localhost:11434
VITE_OLLAMA_DEFAULT_MODEL=llama3.1:8b

# Resend (Email) - Criar conta: https://resend.com
VITE_RESEND_API_KEY=re_xxxxxxxxxxxxx

# GlitchTip (Error Tracking) - Depois de Docker
VITE_GLITCHTIP_DSN=http://xxxxx@localhost:8000/1

# Redis (Queue) - Depois de Docker ou Redis Cloud
VITE_REDIS_URL=redis://localhost:6379

# Meilisearch (Search) - Depois de Docker ou Cloud
VITE_MEILISEARCH_URL=http://localhost:7700
VITE_MEILISEARCH_API_KEY=your-master-key

# PostHog (Analytics) - Criar conta: https://posthog.com
VITE_POSTHOG_API_KEY=phc_xxxxxxxxxxxxx
VITE_POSTHOG_HOST=https://app.posthog.com

# BrasilAPI - Nenhuma configuração necessária (API pública)
```

---

## ✅ PRÓXIMAS AÇÕES IMEDIATAS

Vou implementar agora as integrações de código que não dependem de instalações:

1. ✅ Integrar BrasilAPI em formulários de cadastro
2. ✅ Criar hook useFeatureFlag (PostHog)
3. ✅ Integrar analytics no router (page views)
4. ✅ Criar dashboard de status de services
5. ✅ Implementar real BullMQ (preparado para quando Redis estiver disponível)

**Começando implementações agora...**

---

© 2025 ICARUS v5.0

