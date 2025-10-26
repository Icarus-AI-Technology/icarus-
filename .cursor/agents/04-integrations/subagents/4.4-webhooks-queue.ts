// 4.4-webhooks-queue.ts
import fs from 'fs';
import path from 'path';

interface WebhookAudit {
  service: string;
  registered: boolean;
  has_handler: boolean;
  has_verification: boolean;
  handler_path?: string;
  issues: string[];
}

interface QueueAudit {
  system: string;
  configured: boolean;
  has_workers: boolean;
  has_retry: boolean;
  has_dlq: boolean;
  workers: string[];
  issues: string[];
}

function auditWebhooks(): WebhookAudit[] {
  console.log('🪝 Auditando Webhooks...\n');

  const results: WebhookAudit[] = [];

  const expectedWebhooks = [
    'stripe-payment',
    'twilio-sms',
    'sendgrid-email',
    'transportadora-status'
  ];

  const possibleDirs = [
    'src/webhooks',
    'src/api/webhooks',
    'server/webhooks',
    'src/lib/webhooks'
  ];

  expectedWebhooks.forEach(webhook => {
    const audit: WebhookAudit = {
      service: webhook,
      registered: false,
      has_handler: false,
      has_verification: false,
      issues: []
    };

    let handlerPath: string | null = null;
    let content: string | null = null;

    // Procurar handler em vários diretórios
    for (const dir of possibleDirs) {
      const paths = [
        `${dir}/${webhook}.ts`,
        `${dir}/${webhook}.js`,
        `${dir}/${webhook}/index.ts`,
        `${dir}/${webhook}/handler.ts`
      ];

      for (const p of paths) {
        if (fs.existsSync(p)) {
          handlerPath = p;
          content = fs.readFileSync(p, 'utf8');
          break;
        }
      }

      if (handlerPath) break;
    }
    
    if (!handlerPath || !content) {
      audit.issues.push('Handler não encontrado');
      results.push(audit);
      return;
    }

    audit.has_handler = true;
    audit.handler_path = handlerPath;

    // Verificar signature verification
    if (content.includes('verify') || 
        content.includes('signature') ||
        content.includes('validateWebhook')) {
      audit.has_verification = true;
    } else {
      audit.issues.push('Sem verificação de assinatura');
    }

    // Verificar se está registrado
    if (content.includes('POST') || 
        content.includes('webhook') ||
        content.includes('app.post')) {
      audit.registered = true;
    }

    results.push(audit);
  });

  console.log('📊 Resumo Webhooks:');
  results.forEach(w => {
    const status = w.has_handler && w.has_verification ? '✅' : w.has_handler ? '⚠️' : '❌';
    console.log(`  ${status} ${w.service}`);
    if (w.issues.length > 0) {
      w.issues.forEach(issue => console.log(`      - ${issue}`));
    }
  });

  return results;
}

function auditQueue(): QueueAudit {
  console.log('\n📬 Auditando Queue System...\n');

  const audit: QueueAudit = {
    system: 'BullMQ',
    configured: false,
    has_workers: false,
    has_retry: false,
    has_dlq: false,
    workers: [],
    issues: []
  };

  // Verificar package.json
  if (!fs.existsSync('package.json')) {
    audit.issues.push('package.json não encontrado');
    return audit;
  }

  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  if (packageJson.dependencies?.bullmq || 
      packageJson.dependencies?.bull ||
      packageJson.dependencies?.['@bull-board/api']) {
    audit.configured = true;
  } else {
    audit.issues.push('BullMQ/Bull não instalado');
  }

  // Verificar workers
  const possibleQueueDirs = [
    'src/queues',
    'src/workers',
    'server/queues',
    'src/lib/queues'
  ];

  for (const queueDir of possibleQueueDirs) {
    if (fs.existsSync(queueDir)) {
      const files = fs.readdirSync(queueDir);
      const workers = files.filter(f => 
        f.includes('worker') || 
        f.includes('processor') ||
        f.includes('job')
      );
      
      if (workers.length > 0) {
        audit.has_workers = true;
        audit.workers = workers;
        break;
      }
    }
  }
  
  if (!audit.has_workers) {
    audit.issues.push('Nenhum worker encontrado');
  }

  // Verificar configuração de retry e DLQ
  const possibleConfigPaths = [
    'src/config/queue.ts',
    'src/config/bullmq.ts',
    'server/config/queue.ts'
  ];

  for (const configPath of possibleConfigPaths) {
    if (fs.existsSync(configPath)) {
      const config = fs.readFileSync(configPath, 'utf8');
      
      if (config.includes('retry') || 
          config.includes('attempts') ||
          config.includes('backoff')) {
        audit.has_retry = true;
      }
      
      if (config.includes('deadLetter') || 
          config.includes('DLQ') ||
          config.includes('failed-queue')) {
        audit.has_dlq = true;
      }
      break;
    }
  }

  console.log('📊 Resumo Queue:');
  console.log(`  ${audit.configured ? '✅' : '❌'} Configurado: ${audit.configured ? 'Sim' : 'Não'}`);
  console.log(`  ${audit.has_workers ? '✅' : '❌'} Workers: ${audit.has_workers ? audit.workers.length : 0}`);
  console.log(`  ${audit.has_retry ? '✅' : '⚠️'} Retry logic: ${audit.has_retry ? 'Sim' : 'Não'}`);
  console.log(`  ${audit.has_dlq ? '✅' : '⚠️'} DLQ: ${audit.has_dlq ? 'Sim' : 'Não'}`);

  return audit;
}

function auditWebhooksAndQueue() {
  const webhooks = auditWebhooks();
  const queue = auditQueue();

  const webhooksOk = webhooks.filter(w => w.has_handler && w.has_verification).length;

  const score = Math.round(
    (webhooksOk / webhooks.length) * 50 +
    (queue.configured ? 20 : 0) +
    (queue.has_workers ? 15 : 0) +
    (queue.has_retry ? 10 : 0) +
    (queue.has_dlq ? 5 : 0)
  );

  console.log(`\n✅ Score: ${score}/100`);

  return {
    webhooks,
    queue,
    webhooksOk,
    totalWebhooks: webhooks.length,
    score
  };
}

// Executar
const results = auditWebhooksAndQueue();

// Salvar
const outputDir = path.dirname(process.argv[1]);
fs.writeFileSync(
  path.join(outputDir, '4.4-results.json'),
  JSON.stringify(results, null, 2)
);

console.log('\n📄 Resultados salvos em 4.4-results.json');
