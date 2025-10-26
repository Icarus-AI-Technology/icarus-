// 4.3-transportadoras.ts
import fs from 'fs';
import path from 'path';

interface TransportadoraAudit {
  name: string;
  type: 'nacional' | 'internacional';
  has_service: boolean;
  has_tracking: boolean;
  has_quote: boolean;
  has_webhook: boolean;
  service_path?: string;
  issues: string[];
}

const TRANSPORTADORAS = {
  nacionais: [
    'Correios', 'Jadlog', 'TNT', 'TotalExpress',
    'AzulCargo', 'LatamCargo', 'RapidaoCometa',
    'Sequoia', 'Braspress', 'Jamef', 'Rodonaves',
    'Direct', 'Patrus', 'Loggi'
  ],
  internacionais: [
    'DHL', 'UPS', 'FedEx', 'DBSchenker'
  ]
};

function auditTransportadora(name: string, type: 'nacional' | 'internacional'): TransportadoraAudit {
  const audit: TransportadoraAudit = {
    name,
    type,
    has_service: false,
    has_tracking: false,
    has_quote: false,
    has_webhook: false,
    issues: []
  };

  const serviceName = name.replace(/\s+/g, '') + 'Service.ts';
  
  // Verificar em vários diretórios possíveis
  const possiblePaths = [
    `src/services/integrations/${serviceName}`,
    `src/services/shipping/${serviceName}`,
    `src/lib/services/${serviceName}`,
    `src/integrations/${serviceName}`
  ];

  let servicePath: string | null = null;
  let content: string | null = null;

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      servicePath = p;
      content = fs.readFileSync(p, 'utf8');
      break;
    }
  }

  if (!servicePath || !content) {
    audit.issues.push('Service não encontrado');
    return audit;
  }

  audit.has_service = true;
  audit.service_path = servicePath;

  // Verificar rastreamento
  if (content.includes('track') || 
      content.includes('rastreamento') ||
      content.includes('tracking')) {
    audit.has_tracking = true;
  } else {
    audit.issues.push('Rastreamento não implementado');
  }

  // Verificar cotação
  if (content.includes('quote') || 
      content.includes('cotacao') ||
      content.includes('calcular') ||
      content.includes('frete')) {
    audit.has_quote = true;
  } else {
    audit.issues.push('Cotação não implementada');
  }

  // Verificar webhook
  if (content.includes('webhook')) {
    audit.has_webhook = true;
  }

  return audit;
}

function auditAllTransportadoras() {
  console.log('🚚 Auditando Transportadoras...\n');

  const results: TransportadoraAudit[] = [];

  console.log('📦 Nacionais:');
  TRANSPORTADORAS.nacionais.forEach(name => {
    console.log(`  Auditando ${name}...`);
    const audit = auditTransportadora(name, 'nacional');
    results.push(audit);
    
    const status = audit.has_service && audit.has_tracking ? '✅' : audit.has_service ? '⚠️' : '❌';
    console.log(`    ${status} Service: ${audit.has_service ? 'Sim' : 'Não'}, Tracking: ${audit.has_tracking ? 'Sim' : 'Não'}, Quote: ${audit.has_quote ? 'Sim' : 'Não'}`);
  });

  console.log('\n🌍 Internacionais:');
  TRANSPORTADORAS.internacionais.forEach(name => {
    console.log(`  Auditando ${name}...`);
    const audit = auditTransportadora(name, 'internacional');
    results.push(audit);
    
    const status = audit.has_service && audit.has_tracking ? '✅' : audit.has_service ? '⚠️' : '❌';
    console.log(`    ${status} Service: ${audit.has_service ? 'Sim' : 'Não'}, Tracking: ${audit.has_tracking ? 'Sim' : 'Não'}, Quote: ${audit.has_quote ? 'Sim' : 'Não'}`);
  });

  const withService = results.filter(r => r.has_service).length;
  const withTracking = results.filter(r => r.has_tracking).length;
  const withQuote = results.filter(r => r.has_quote).length;
  const withWebhook = results.filter(r => r.has_webhook).length;

  console.log('\n📊 Resumo:');
  console.log(`  Total: ${results.length}`);
  console.log(`  Com service: ${withService}/${results.length}`);
  console.log(`  Com tracking: ${withTracking}/${results.length}`);
  console.log(`  Com cotação: ${withQuote}/${results.length}`);
  console.log(`  Com webhook: ${withWebhook}/${results.length}`);

  const score = Math.round(
    (withService / results.length) * 40 +
    (withTracking / results.length) * 40 +
    (withQuote / results.length) * 20
  );

  console.log(`\n✅ Score: ${score}/100`);

  return {
    transportadoras: results,
    withService,
    withTracking,
    withQuote,
    withWebhook,
    total: results.length,
    score
  };
}

// Executar
const results = auditAllTransportadoras();

// Salvar
const outputDir = path.dirname(process.argv[1]);
fs.writeFileSync(
  path.join(outputDir, '4.3-results.json'),
  JSON.stringify(results, null, 2)
);

console.log('\n📄 Resultados salvos em 4.3-results.json');
