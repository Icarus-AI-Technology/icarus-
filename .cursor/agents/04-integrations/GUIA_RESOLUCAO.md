# 🔧 AGENTE 04: GUIA DE RESOLUÇÃO RÁPIDA

## 🎯 Objetivo
Elevar o score de 15/100 para 85/100 em 3 sprints

---

## 🚀 Sprint 1: Configuração Base (2 dias - Meta: 35/100)

### 1️⃣ Configurar Supabase (2h) - CRÍTICO

```bash
# 1. Criar arquivo .env na raiz do projeto
touch .env

# 2. Adicionar as credenciais (pegue no painel Supabase)
cat >> .env << 'EOF'
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_key_aqui
VITE_SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
EOF

# 3. Testar conexão
npx tsx -e "
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);
const { data, error } = await supabase.auth.getSession();
console.log(error ? '❌ Erro:' + error.message : '✅ Supabase conectado!');
"
```

**Impacto:** +10 pontos (Auth, Storage, Database, Realtime funcionando)

---

### 2️⃣ Implementar Correios API (3h)

```typescript
// src/services/integrations/CorreiosService.ts
import axios from 'axios';

export class CorreiosService {
  private baseUrl = 'https://api.correios.com.br/sro/v1';
  private apiKey = process.env.CORREIOS_API_KEY;

  async rastrear(codigoRastreio: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/objetos/${codigoRastreio}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao rastrear Correios:', error);
      throw error;
    }
  }

  async calcularFrete(cepOrigem: string, cepDestino: string, peso: number) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/preco`,
        {
          cepOrigem,
          cepDestino,
          peso
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao calcular frete Correios:', error);
      throw error;
    }
  }
}
```

**Adicionar no .env:**
```bash
CORREIOS_API_KEY=sua_chave_api_correios
```

**Impacto:** +3 pontos

---

### 3️⃣ Implementar Twilio (2h)

```bash
# Instalar SDK
pnpm add twilio

# Adicionar no .env
cat >> .env << 'EOF'
TWILIO_ACCOUNT_SID=seu_account_sid
TWILIO_AUTH_TOKEN=seu_auth_token
TWILIO_PHONE_NUMBER=+55...
EOF
```

```typescript
// src/services/integrations/TwilioService.ts
import twilio from 'twilio';

export class TwilioService {
  private client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  async enviarSMS(para: string, mensagem: string) {
    try {
      const message = await this.client.messages.create({
        body: mensagem,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: para
      });
      return message;
    } catch (error) {
      console.error('Erro ao enviar SMS:', error);
      throw error;
    }
  }

  async enviarWhatsApp(para: string, mensagem: string) {
    try {
      const message = await this.client.messages.create({
        body: mensagem,
        from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
        to: `whatsapp:${para}`
      });
      return message;
    } catch (error) {
      console.error('Erro ao enviar WhatsApp:', error);
      throw error;
    }
  }
}
```

**Impacto:** +3 pontos

---

### 4️⃣ Implementar SendGrid (2h)

```bash
# Instalar SDK
pnpm add @sendgrid/mail

# Adicionar no .env
echo "SENDGRID_API_KEY=sua_chave_api_sendgrid" >> .env
```

```typescript
// src/services/integrations/SendGridService.ts
import sgMail from '@sendgrid/mail';

export class SendGridService {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
  }

  async enviarEmail(params: {
    para: string;
    assunto: string;
    html: string;
    texto?: string;
  }) {
    try {
      const msg = {
        to: params.para,
        from: 'noreply@icarus.com.br',
        subject: params.assunto,
        text: params.texto || '',
        html: params.html
      };
      
      const result = await sgMail.send(msg);
      return result;
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      throw error;
    }
  }

  async enviarEmailTemplate(params: {
    para: string;
    templateId: string;
    dynamicData: any;
  }) {
    try {
      const msg = {
        to: params.para,
        from: 'noreply@icarus.com.br',
        templateId: params.templateId,
        dynamicTemplateData: params.dynamicData
      };
      
      const result = await sgMail.send(msg);
      return result;
    } catch (error) {
      console.error('Erro ao enviar email template:', error);
      throw error;
    }
  }
}
```

**Impacto:** +3 pontos

---

### ✅ Sprint 1 Checklist

- [ ] Configurar .env Supabase
- [ ] Testar Auth, Storage, Database
- [ ] Implementar CorreiosService
- [ ] Implementar TwilioService
- [ ] Implementar SendGridService
- [ ] Adicionar todas as credenciais no .env
- [ ] Testar cada serviço individualmente

**Score Esperado após Sprint 1:** 35/100 (+20 pontos)

---

## 🚀 Sprint 2: Transportadoras e Queue (1 semana - Meta: 60/100)

### 5️⃣ Implementar Jadlog (3h)

```typescript
// src/services/integrations/JadlogService.ts
import axios from 'axios';

export class JadlogService {
  private baseUrl = 'https://www.jadlog.com.br/api';
  private apiKey = process.env.JADLOG_API_KEY;

  async rastrear(codigoRastreio: string) {
    const response = await axios.get(
      `${this.baseUrl}/tracking/${codigoRastreio}`,
      { headers: { 'Authorization': `Bearer ${this.apiKey}` } }
    );
    return response.data;
  }

  async cotarFrete(params: {
    cepOrigem: string;
    cepDestino: string;
    peso: number;
    valor: number;
  }) {
    const response = await axios.post(
      `${this.baseUrl}/cotacao`,
      params,
      { headers: { 'Authorization': `Bearer ${this.apiKey}` } }
    );
    return response.data;
  }
}
```

---

### 6️⃣ Configurar BullMQ + Redis (4h)

```bash
# Instalar dependências
pnpm add bullmq ioredis @bull-board/express @bull-board/api

# Adicionar no .env
echo "REDIS_URL=redis://localhost:6379" >> .env

# Subir Redis com Docker
docker run -d --name redis -p 6379:6379 redis:alpine
```

```typescript
// src/config/queue.ts
import { Queue, Worker, QueueScheduler } from 'bullmq';
import Redis from 'ioredis';

const connection = new Redis(process.env.REDIS_URL!);

export const emailQueue = new Queue('email', { connection });
export const smsQueue = new Queue('sms', { connection });
export const rastreioQueue = new Queue('rastreio', { connection });

// Workers
const emailWorker = new Worker('email', async (job) => {
  const sendGridService = new SendGridService();
  await sendGridService.enviarEmail(job.data);
}, { connection });

const smsWorker = new Worker('sms', async (job) => {
  const twilioService = new TwilioService();
  await twilioService.enviarSMS(job.data.para, job.data.mensagem);
}, { connection });

// Retry configuration
emailQueue.setOptions({
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: true,
    removeOnFail: false
  }
});
```

```typescript
// src/queues/workers/email.worker.ts
import { Worker } from 'bullmq';
import { SendGridService } from '../../services/integrations/SendGridService';

const emailWorker = new Worker(
  'email',
  async (job) => {
    console.log(`📧 Processando email job ${job.id}`);
    const sendGrid = new SendGridService();
    
    try {
      await sendGrid.enviarEmail(job.data);
      console.log(`✅ Email enviado com sucesso`);
    } catch (error) {
      console.error(`❌ Erro ao enviar email:`, error);
      throw error; // Will trigger retry
    }
  },
  {
    connection: {
      host: 'localhost',
      port: 6379
    },
    limiter: {
      max: 10,
      duration: 1000 // 10 jobs por segundo
    }
  }
);

emailWorker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completado`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} falhou:`, err);
});

export default emailWorker;
```

**Impacto:** +15 pontos

---

### 7️⃣ Criar Webhooks Básicos (4h)

```typescript
// src/webhooks/stripe-payment.ts
import { Request, Response } from 'express';
import crypto from 'crypto';

export async function stripeWebhook(req: Request, res: Response) {
  const signature = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    // Verificar assinatura
    const event = verifyStripeSignature(req.body, signature, webhookSecret);
    
    // Processar evento
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      case 'payment_intent.failed':
        await handlePaymentFailed(event.data.object);
        break;
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send('Webhook Error');
  }
}

function verifyStripeSignature(payload: any, signature: string, secret: string) {
  const timestamp = signature.split(',')[0].split('=')[1];
  const sig = signature.split(',')[1].split('=')[1];
  
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${JSON.stringify(payload)}`)
    .digest('hex');
  
  if (expectedSig !== sig) {
    throw new Error('Invalid signature');
  }
  
  return payload;
}
```

```typescript
// server/routes/webhooks.ts
import express from 'express';
import { stripeWebhook } from '../webhooks/stripe-payment';
import { twilioWebhook } from '../webhooks/twilio-sms';

const router = express.Router();

router.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhook);
router.post('/twilio', express.urlencoded({ extended: true }), twilioWebhook);

export default router;
```

**Impacto:** +10 pontos

---

### ✅ Sprint 2 Checklist

- [ ] Implementar Jadlog, TNT, Total Express
- [ ] Implementar DHL, UPS
- [ ] Instalar e configurar Redis
- [ ] Configurar BullMQ com queues
- [ ] Criar 3 workers (email, sms, rastreio)
- [ ] Implementar retry logic
- [ ] Criar webhooks stripe, twilio, sendgrid
- [ ] Testar todos os componentes

**Score Esperado após Sprint 2:** 60/100 (+25 pontos)

---

## 🚀 Sprint 3: Completar Integrações (2 semanas - Meta: 85/100)

### 8️⃣ Completar Transportadoras (3 dias)

Template para cada transportadora:

```typescript
// src/services/integrations/{Transportadora}Service.ts
export class {Transportadora}Service {
  private baseUrl = '';
  private apiKey = process.env.{TRANSPORTADORA}_API_KEY;

  async rastrear(codigo: string) { }
  async cotarFrete(params: any) { }
  async criarEnvio(params: any) { }
}
```

Implementar:
- [ ] Braspress
- [ ] Jamef
- [ ] Rodonaves
- [ ] Direct
- [ ] Patrus
- [ ] Loggi
- [ ] Azul Cargo
- [ ] Latam Cargo
- [ ] Rapidão Cometa
- [ ] Sequoia
- [ ] FedEx
- [ ] DB Schenker

---

### 9️⃣ Completar Webhooks + DLQ (2 dias)

```typescript
// src/config/queue.ts - Adicionar DLQ
export const deadLetterQueue = new Queue('dead-letter', { connection });

emailQueue.setOptions({
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: true,
    removeOnFail: {
      count: 1000 // Keep last 1000 failed jobs
    }
  }
});

// Worker com DLQ
const emailWorker = new Worker('email', async (job) => {
  try {
    await processEmail(job.data);
  } catch (error) {
    if (job.attemptsMade >= 3) {
      await deadLetterQueue.add('failed-email', {
        originalJob: job.data,
        error: error.message,
        timestamp: new Date()
      });
    }
    throw error;
  }
}, { connection });
```

---

### 🔟 Implementar APIs Faltantes (2 dias)

- [ ] TISS/ANS Service
- [ ] CFM Service
- [ ] Banco do Brasil API
- [ ] Itaú API

---

### ✅ Sprint 3 Checklist

- [ ] Completar 18 transportadoras
- [ ] Implementar 6 webhooks
- [ ] Configurar DLQ
- [ ] Implementar APIs saúde e financeiras
- [ ] Documentar todas as APIs
- [ ] Criar testes unitários
- [ ] Executar Agente 04 novamente

**Score Esperado após Sprint 3:** 85/100 (+25 pontos)

---

## 📊 Checklist de Validação Final

Execute novamente o Agente 04 para validar:

```bash
npx tsx .cursor/agents/04-integrations/subagents/4.1-external-apis.ts
npx tsx .cursor/agents/04-integrations/subagents/4.2-supabase-services.ts
npx tsx .cursor/agents/04-integrations/subagents/4.3-transportadoras.ts
npx tsx .cursor/agents/04-integrations/subagents/4.4-webhooks-queue.ts
npx tsx .cursor/agents/04-integrations/consolidate.ts
```

**Meta Final:** Score 85/100 ✅

---

## 📞 Troubleshooting Comum

### Erro: Supabase não conecta
```bash
# Verificar credenciais
cat .env | grep SUPABASE

# Testar manualmente
curl https://seu-projeto.supabase.co/rest/v1/ \
  -H "apikey: sua_chave"
```

### Erro: Redis não conecta
```bash
# Verificar se Redis está rodando
redis-cli ping
# Deve retornar: PONG

# Reiniciar Redis
docker restart redis
```

### Erro: Webhook signature inválida
- Verificar se o webhook secret está correto
- Verificar se está usando raw body parser
- Usar ferramenta de teste (ex: Stripe CLI)

---

**Criado por:** AGENTE 04  
**Última atualização:** 25/10/2025  
**Próxima revisão:** Após Sprint 3

