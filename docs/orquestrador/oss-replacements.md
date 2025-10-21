# 🔄 SUBSTITUIÇÕES OSS - PLANO DE MIGRAÇÃO

**Agente:** Orquestrador Sênior  
**Data:** 20 de outubro de 2025  
**Objetivo:** Roadmap de substituições por alternativas OSS/baixo custo

---

## 🎯 VISÃO GERAL

Este documento detalha o plano de migração de serviços comerciais/pagos para alternativas Open Source ou de baixo custo, com estimativa de esforço, riscos e ROI.

---

## 📋 SUMÁRIO DE SUBSTITUIÇÕES

| # | Serviço Atual | Alternativa OSS | Economia Anual | Esforço | Prioridade |
|---|---------------|-----------------|----------------|---------|------------|
| 1 | OpenAI GPT-4 (80%) | Ollama (Llama 3.1) | $1,920-4,800 | 16h | **P0** |
| 2 | Anthropic Claude (parcial) | Ollama (Mistral) | $1,200-3,600 | 8h | **P0** |
| 3 | Sentry (pago) | GlitchTip | $312-948 | 4h | **P0** |
| 4 | Algolia/ElasticSearch | Meilisearch | $348-1,200 | 12h | **P1** |
| 5 | AWS SQS/Lambda | BullMQ + Redis | $240-960 | 16h | **P1** |
| 6 | SendGrid/Mailgun | Resend (free tier) | $180-600 | 2h | **P0** |
| 7 | Google Analytics | PostHog CE | $0 | 8h | **P1** |
| 8 | Google Vision OCR | Tesseract.js | $180-720 | 12h | **P2** |
| 9 | Vercel Pro | Self-hosted/Netlify | $240-600 | 8h | **P2** |
| 10 | Algolia Insights | PostHog CE | $120-480 | incluído | **P1** |

### 💰 **Economia Total Estimada:** $4,740-13,908/ano
### ⏱️ **Esforço Total:** ~86 horas (~2-3 semanas)
### 📊 **ROI:** Payback em 2-4 semanas de trabalho

---

## 1️⃣ SUBSTITUIÇÃO #1: OpenAI GPT-4 → Ollama (Llama 3.1)

### Status Atual
- **Uso:** Chatbot, análises, sugestões de IA
- **Custo:** ~$200-500/mês (~$2,400-6,000/ano)
- **Volume:** ~20-50M tokens/mês

### Alternativa: Ollama + Llama 3.1 8B
- **Site:** https://ollama.com
- **Modelo:** Llama 3.1 8B (Meta, open source)
- **Hardware:** 8GB RAM, GPU opcional
- **Custo:** $0 (self-hosted)

### Plano de Migração

#### Fase 1: Setup Local (4h)
```bash
# Instalar Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Baixar modelos
ollama pull llama3.1:8b      # Geral (4.7GB)
ollama pull codellama:13b    # Código (7.4GB)
ollama pull mistral:7b       # Análises (4.1GB)
```

#### Fase 2: Criar Service Adapter (4h)
```typescript
// src/lib/llm/ollama.service.ts
export class OllamaService {
  private baseURL = 'http://localhost:11434/api';

  async chat(messages: Message[], model = 'llama3.1:8b') {
    const response = await fetch(`${this.baseURL}/chat`, {
      method: 'POST',
      body: JSON.stringify({ model, messages, stream: false }),
    });
    return await response.json();
  }
}
```

#### Fase 3: Implementar Estratégia Híbrida (6h)
```typescript
// src/lib/llm/hybrid.service.ts
export class HybridLLMService {
  async processQuery(
    prompt: string,
    complexity: 'simple' | 'complex' = 'simple'
  ) {
    if (complexity === 'simple') {
      // 80% dos casos: Ollama (grátis)
      return await ollamaService.chat([{role: 'user', content: prompt}]);
    } else {
      // 20% dos casos: GPT-4 (pago)
      return await openaiService.chat([{role: 'user', content: prompt}]);
    }
  }
}
```

#### Fase 4: Testes & Validação (2h)
- Comparar qualidade de respostas (Ollama vs GPT-4)
- Medir latência (target: < 5s)
- Validar casos de uso críticos

### Critérios de Sucesso
- ✅ 80% dos prompts via Ollama
- ✅ Qualidade aceitável (≥ 85% da qualidade GPT-4)
- ✅ Latência < 5s (resposta)
- ✅ Redução de custos > 70%

### Riscos & Mitigações
| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Qualidade inferior | Média | Alto | Manter GPT-4 para casos críticos |
| Latência alta (CPU) | Alta | Médio | GPU opcional ($0.10/hora cloud) |
| RAM insuficiente | Baixa | Alto | Upgrade servidor ou modelo menor |

### ROI
- **Investimento:** 16h dev ($1,600-2,400)
- **Economia anual:** $1,680-4,200 (70% redução)
- **Payback:** 2-5 semanas

---

## 2️⃣ SUBSTITUIÇÃO #2: Anthropic Claude → Ollama (Mistral)

### Status Atual
- **Uso:** Análises profundas, compliance
- **Custo:** ~$100-300/mês (~$1,200-3,600/ano)
- **Volume:** ~10-30M tokens/mês

### Alternativa: Mistral 7B
- **Modelo:** Mistral 7B Instruct
- **Características:** Análises, raciocínio, multilíngue (PT-BR)
- **Custo:** $0 (via Ollama)

### Plano de Migração
```bash
# Baixar modelo
ollama pull mistral:7b-instruct
```

```typescript
// Adapter
const analysisService = {
  async analyze(context: string) {
    return await ollamaService.chat([
      { role: 'system', content: 'Você é um analista de compliance.' },
      { role: 'user', content: context }
    ], 'mistral:7b-instruct');
  }
};
```

### Esforço: 8h
### Economia: $1,200-3,600/ano

---

## 3️⃣ SUBSTITUIÇÃO #3: Sentry (Pago) → GlitchTip (OSS)

### Status Atual
- **Uso:** Error tracking, performance monitoring
- **Custo:** $26-79/mês (~$312-948/ano)
- **Eventos:** 5k-50k/mês

### Alternativa: GlitchTip
- **Site:** https://glitchtip.com
- **API:** Compatível com Sentry (drop-in replacement)
- **Self-hosted:** Docker
- **Custo:** $0

### Plano de Migração

#### Fase 1: Deploy GlitchTip (2h)
```yaml
# docker-compose.yml
version: '3.8'
services:
  glitchtip:
    image: glitchtip/glitchtip:latest
    ports:
      - "8080:8080"
    environment:
      DATABASE_URL: ${DATABASE_URL}
      SECRET_KEY: ${SECRET_KEY}
      EMAIL_URL: ${EMAIL_URL}
    volumes:
      - ./uploads:/code/uploads

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: glitchtip
      POSTGRES_USER: glitchtip
      POSTGRES_PASSWORD: ${PG_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine

volumes:
  pgdata:
```

#### Fase 2: Migrar SDK (1h)
```typescript
// Antes (Sentry)
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://xxx@sentry.io/yyy",
});

// Depois (GlitchTip) - MESMA API
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://glitchtip.seudominio.com/zzz",
});
```

#### Fase 3: Configurar Alertas (1h)
- Slack/Discord webhooks
- E-mail notifications
- Thresholds

### Esforço: 4h
### Economia: $312-948/ano

---

## 4️⃣ SUBSTITUIÇÃO #4: Busca Comercial → Meilisearch

### Status Atual
- **Uso:** Busca de produtos, médicos, hospitais
- **Potencial:** Algolia ($29-100/mo) ou ElasticSearch Cloud ($50/mo)
- **Custo evitado:** $348-1,200/ano

### Alternativa: Meilisearch
- **Site:** https://meilisearch.dev
- **Self-hosted:** Docker
- **Custo:** $0

### Plano de Migração

#### Fase 1: Deploy Meilisearch (2h)
```bash
docker run -d --name meilisearch \
  -p 7700:7700 \
  -v $(pwd)/meili_data:/meili_data \
  getmeili/meilisearch:v1.5
```

#### Fase 2: Indexar Dados (4h)
```typescript
// src/lib/search/meilisearch.service.ts
import { MeiliSearch } from 'meilisearch';

const client = new MeiliSearch({
  host: 'http://localhost:7700',
  apiKey: process.env.MEILI_MASTER_KEY,
});

// Indexar produtos OPME
await client.index('produtos').addDocuments([
  { id: 1, nome: 'Stent Coronário', registro: '80123', categoria: 'Cardiologia' },
  // ...
]);

// Buscar
const results = await client.index('produtos').search('stent', {
  limit: 10,
  attributesToHighlight: ['nome'],
});
```

#### Fase 3: UI de Busca (4h)
```typescript
// Componente React
export function SearchProdutos() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    const { hits } = await meilisearchService.search('produtos', query);
    setResults(hits);
  };

  return (
    <SearchContainer onSearch={handleSearch}>
      {results.map(r => <ProdutoCard key={r.id} {...r} />)}
    </SearchContainer>
  );
}
```

#### Fase 4: Configurar Filtros & Facets (2h)
- Filtros por categoria, preço, registro
- Ordenação (relevância, alfabética, preço)
- Paginação

### Esforço: 12h
### Economia: $348-1,200/ano

---

## 5️⃣ SUBSTITUIÇÃO #5: AWS SQS/Lambda → BullMQ + Redis

### Status Atual
- **Uso:** Jobs assíncronos (futuro)
- **Potencial:** AWS SQS + Lambda ($20-80/mo)
- **Custo evitado:** $240-960/ano

### Alternativa: BullMQ + Redis
- **Site:** https://docs.bullmq.io
- **Self-hosted:** Redis + Node.js workers
- **Custo:** $0-10/mo (Redis Cloud free tier ou self-hosted)

### Plano de Migração

#### Fase 1: Setup Redis (1h)
```bash
# Docker
docker run -d --name redis -p 6379:6379 redis:7-alpine
```

#### Fase 2: Criar Filas (8h)
```typescript
// src/lib/queues/nfe.queue.ts
import { Queue, Worker } from 'bullmq';

// Fila de NFe
export const nfeQueue = new Queue('nfe-processing', {
  connection: { host: 'localhost', port: 6379 },
});

// Worker
const worker = new Worker('nfe-processing', async (job) => {
  const { nfeData } = job.data;
  console.log(`Processando NFe ${nfeData.numero}...`);
  
  await sefazService.enviarNFe(nfeData);
  
  return { status: 'sucesso', protocolo: '...' };
}, {
  connection: { host: 'localhost', port: 6379 },
});

// Adicionar job
await nfeQueue.add('enviar-nfe', { nfeData: { numero: '123' } });
```

#### Fase 3: Dashboard (4h)
```bash
# Bull Board (UI)
npm install @bull-board/express
```

```typescript
// src/lib/queues/board.ts
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';

const serverAdapter = new ExpressAdapter();
createBullBoard({
  queues: [new BullMQAdapter(nfeQueue)],
  serverAdapter,
});

// Mount em /admin/queues
app.use('/admin/queues', serverAdapter.getRouter());
```

#### Fase 4: Casos de Uso (3h)
- NFe: Envio assíncrono SEFAZ
- Relatórios: Geração em background
- E-mails: Envio em lote
- OCR: Processamento de DANFE

### Esforço: 16h
### Economia: $240-960/ano

---

## 6️⃣ SUBSTITUIÇÃO #6: SendGrid/Mailgun → Resend

### Status Atual
- **Uso:** E-mails transacionais
- **Potencial:** SendGrid ($15-50/mo)
- **Custo evitado:** $180-600/ano

### Alternativa: Resend
- **Site:** https://resend.com
- **Free tier:** 3,000 emails/mês
- **Pago:** $20/mo (50k emails)
- **Templates:** React components

### Plano de Migração

#### Fase 1: Setup Resend (0.5h)
```bash
npm install resend
```

```typescript
// src/lib/email/resend.service.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendTransactionalEmail(
  to: string,
  subject: string,
  html: string
) {
  await resend.emails.send({
    from: 'ICARUS <noreply@icarus.com.br>',
    to,
    subject,
    html,
  });
}
```

#### Fase 2: Templates React (1h)
```tsx
// src/lib/email/templates/CirurgiaConfirmada.tsx
export function CirurgiaConfirmadaEmail({ cirurgia }) {
  return (
    <Html>
      <Head />
      <Preview>Sua cirurgia foi confirmada</Preview>
      <Body>
        <Container>
          <Heading>Cirurgia Confirmada ✅</Heading>
          <Text>Procedimento: {cirurgia.procedimento}</Text>
          <Text>Data: {cirurgia.data}</Text>
          <Button href={`${BASE_URL}/cirurgias/${cirurgia.id}`}>
            Ver Detalhes
          </Button>
        </Container>
      </Body>
    </Html>
  );
}
```

#### Fase 3: Migrar Envios (0.5h)
```typescript
// Antes (SendGrid)
await sgMail.send({ to, from, subject, html });

// Depois (Resend)
await resendService.sendTransactionalEmail(to, subject, html);
```

### Esforço: 2h
### Economia: $180-600/ano (se ultrapassar free tier, $20/mo)

---

## 7️⃣ SUBSTITUIÇÃO #7: Google Analytics → PostHog CE

### Status Atual
- **Uso:** Analytics de usuários
- **Potencial:** GA4 (grátis, mas privacidade questionável)
- **Alternativa paga evitada:** Amplitude ($49/mo), Mixpanel ($25/mo)

### Alternativa: PostHog Community Edition
- **Site:** https://posthog.com
- **Self-hosted:** Docker
- **Custo:** $0

### Plano de Migração

#### Fase 1: Deploy PostHog (3h)
```bash
# Docker Compose
curl -sL https://raw.githubusercontent.com/PostHog/posthog/main/docker-compose.yml > docker-compose.yml
docker-compose up -d
```

#### Fase 2: Integrar Frontend (2h)
```typescript
// src/lib/analytics/posthog.ts
import posthog from 'posthog-js';

posthog.init('<API_KEY>', {
  api_host: 'https://posthog.seudominio.com',
});

// Track events
posthog.capture('cirurgia_criada', { procedimento: 'Angioplastia' });

// Identify users
posthog.identify(user.id, { email: user.email, role: user.role });
```

#### Fase 3: Dashboards (3h)
- Funis de conversão (Lead → Oportunidade → Venda)
- Heatmaps de cirurgias (fluxo Kanban)
- Session recordings (debugging UX)
- Feature flags (A/B testing)

### Esforço: 8h
### Economia: $0 (evita custos futuros de ~$600/ano)

---

## 8️⃣ SUBSTITUIÇÃO #8: Google Vision → Tesseract.js

### Status Atual
- **Uso:** OCR DANFE (futuro)
- **Potencial:** Google Vision ($1.50/1k imagens)
- **Custo evitado:** $180-720/ano (assumindo 10-40k imagens/ano)

### Alternativa: Tesseract.js
- **Site:** https://tesseract.projectnaptha.com
- **Local:** Node.js ou Browser
- **Custo:** $0

### Plano de Migração

#### Fase 1: Setup Tesseract (1h)
```bash
npm install tesseract.js
```

#### Fase 2: Criar Service OCR (4h)
```typescript
// src/lib/ocr/danfe.ocr.ts
import Tesseract from 'tesseract.js';

export async function extractDANFE(imageBuffer: Buffer) {
  const { data: { text } } = await Tesseract.recognize(
    imageBuffer,
    'por',
    { logger: (m) => console.log(m) }
  );

  // Regex para extrair campos
  const nfeKey = text.match(/(\d{44})/)?.[1];
  const valor = text.match(/R\$\s*([\d.,]+)/)?.[1];
  const cnpj = text.match(/(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})/)?.[1];
  const data = text.match(/(\d{2}\/\d{2}\/\d{4})/)?.[1];

  return { nfeKey, valor, cnpj, data, rawText: text };
}
```

#### Fase 3: UI Upload DANFE (5h)
```typescript
// Componente
export function DANFEUpload() {
  const handleUpload = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const result = await extractDANFE(Buffer.from(buffer));
    console.log('Extraído:', result);
  };

  return (
    <DocumentosUpload
      accept="image/*,application/pdf"
      onUpload={handleUpload}
    />
  );
}
```

#### Fase 4: Validação & Qualidade (2h)
- Comparar precisão (target: ≥90%)
- Fallback manual se confiança < 80%

### Esforço: 12h
### Economia: $180-720/ano

---

## 9️⃣ SUBSTITUIÇÃO #9: Vercel Pro → Self-hosted/Netlify

### Status Atual
- **Uso:** Deploy do frontend
- **Potencial:** Vercel Pro ($20-50/mo)
- **Custo evitado:** $240-600/ano

### Alternativas

| Solução | Custo | Esforço | Recomendação |
|---------|-------|---------|---------------|
| Netlify Free | $0 | 1h | ✅ Simplest |
| Cloudflare Pages | $0 | 2h | ✅ Global CDN |
| Self-hosted (Nginx) | $0 | 8h | 🟡 Full control |
| Railway | $5/mo | 1h | 🟢 Balance |

### Plano de Migração (Netlify)

#### Fase 1: Configurar Netlify (0.5h)
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Fase 2: Deploy (0.5h)
```bash
# CLI
npm install -g netlify-cli
netlify deploy --prod
```

#### Fase 3: Domain & SSL (1h)
- Configurar domínio customizado
- SSL automático (Let's Encrypt)

### Esforço: 2h (Netlify) ou 8h (self-hosted)
### Economia: $240-600/ano

---

## 🔟 SUBSTITUIÇÃO #10: Algolia Insights → PostHog

Incluído na substituição #7 (PostHog CE).

---

## 📊 CRONOGRAMA DE IMPLEMENTAÇÃO

### Semana 1 (40h)
- [x] ✅ Inventário completo
- [x] ✅ Pesquisa Context7
- [ ] 🔄 Substituição #1: Ollama (16h)
- [ ] 🔄 Substituição #3: GlitchTip (4h)
- [ ] 🔄 Substituição #6: Resend (2h)
- [ ] 🔄 Conformidade Visual (10h)
- [ ] 🔄 Testsprite (8h)

### Semana 2 (40h)
- [ ] Substituição #2: Mistral (8h)
- [ ] Substituição #4: Meilisearch (12h)
- [ ] Substituição #5: BullMQ (16h)
- [ ] Documentação (4h)

### Semana 3 (32h)
- [ ] Substituição #7: PostHog CE (8h)
- [ ] Substituição #8: Tesseract (12h)
- [ ] Substituição #9: Netlify (2h)
- [ ] Testes de integração (8h)
- [ ] Relatório final (2h)

**Total:** 112 horas (~3 semanas)

---

## ✅ CRITÉRIOS DE ACEITAÇÃO

### Por Substituição
- ✅ Feature parity (100% das funcionalidades mantidas)
- ✅ Performance equivalente ou superior
- ✅ Sem regressões funcionais
- ✅ Documentação atualizada
- ✅ Rollback plan testado

### Global
- ✅ Economia ≥ 70% dos custos atuais
- ✅ Zero downtime na migração
- ✅ Conformidade mantida (WCAG, LGPD, etc)
- ✅ Aprovação stakeholders

---

## 🚨 RISCOS & CONTINGÊNCIAS

| Risco | Impacto | Probabilidade | Mitigação | Contingência |
|-------|---------|---------------|-----------|--------------|
| Qualidade LLM inferior | Alto | Média | Testes A/B, métricas | Manter GPT-4 híbrido |
| Performance degradada | Médio | Baixa | Load testing prévio | Escalar recursos |
| Complexidade operacional | Médio | Alta | Automação (Docker, CI/CD) | Managed alternatives |
| Resistência da equipe | Baixo | Baixa | Treinamento, docs | Gradual rollout |
| Bugs em produção | Alto | Baixa | Testes extensivos, staging | Feature flags, rollback |

---

## 📈 MÉTRICAS DE SUCESSO

### Financeiras
- ✅ Redução de custos: **≥70%** ($350 → $100/mês)
- ✅ ROI: Payback em **≤3 semanas**
- ✅ TCO (Total Cost of Ownership) reduzido

### Técnicas
- ✅ Performance: Latência média ≤ atual + 20%
- ✅ Disponibilidade: Uptime ≥99.9%
- ✅ Qualidade LLM: Avaliação humana ≥85% satisfação

### Operacionais
- ✅ Deploy time: ≤5 min (CI/CD)
- ✅ Manutenção: ≤2h/semana (updates, monitoring)
- ✅ Incidentes: ≤1/mês (P0/P1)

---

**Conclusão:** ✅ PLANO DE SUBSTITUIÇÕES OSS COMPLETO

**Próxima Etapa:** Aprovação e início das implementações P0

---

© 2025 ICARUS v5.0 - Orquestrador Sênior  
**OSS Replacements Plan Complete. Ready for Migration.**

