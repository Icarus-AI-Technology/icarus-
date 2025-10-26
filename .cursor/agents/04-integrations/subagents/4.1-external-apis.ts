// 4.1-external-apis.ts
import axios from 'axios';
import fs from 'fs';
import path from 'path';

interface APIAudit {
  name: string;
  category: string;
  endpoint: string;
  status: 'ok' | 'error' | 'timeout' | 'not_configured';
  response_time_ms?: number;
  error?: string;
  has_credentials: boolean;
  has_error_handling: boolean;
  has_retry_logic: boolean;
}

const APIS_TO_TEST = [
  // Governo/Receita
  { name: 'BrasilAPI CNPJ', category: 'Governo', endpoint: 'https://brasilapi.com.br/api/cnpj/v1/00000000000191', service: 'BrasilAPIService' },
  { name: 'ReceitaWS', category: 'Governo', endpoint: 'https://receitaws.com.br/v1/cnpj/00000000000191', service: 'ReceitaWSService' },
  { name: 'ViaCEP', category: 'Governo', endpoint: 'https://viacep.com.br/ws/01310100/json/', service: 'ViaCEPService' },
  { name: 'SEFAZ', category: 'Governo', endpoint: 'https://www.sefaz.ba.gov.br', service: 'SEFAZService' },
  { name: 'ANVISA', category: 'Governo', endpoint: 'https://consultas.anvisa.gov.br', service: 'ANVISAService' },
  
  // Saúde
  { name: 'TISS/ANS', category: 'Saúde', endpoint: 'https://www.ans.gov.br/prestadores/tiss', service: 'TISSService' },
  { name: 'CFM', category: 'Saúde', endpoint: 'https://portal.cfm.org.br/api/medicos', service: 'CFMService' },
  { name: 'ANVISA Produtos', category: 'Saúde', endpoint: 'https://consultas.anvisa.gov.br/api/produtos', service: 'ANVISAProdutosService' },
  
  // Transportadoras Nacionais
  { name: 'Correios', category: 'Transportadora', endpoint: 'https://api.correios.com.br/sro/v1', service: 'CorreiosService' },
  { name: 'Jadlog', category: 'Transportadora', endpoint: 'https://jadlog.com.br/api/rastreamento', service: 'JadlogService' },
  { name: 'TNT', category: 'Transportadora', endpoint: 'https://www.tnt.com/api/track', service: 'TNTService' },
  { name: 'Total Express', category: 'Transportadora', endpoint: 'https://www.totalexpress.com.br/api/track', service: 'TotalExpressService' },
  { name: 'Azul Cargo', category: 'Transportadora', endpoint: 'https://www.azulcargo.com.br/api/track', service: 'AzulCargoService' },
  { name: 'Latam Cargo', category: 'Transportadora', endpoint: 'https://www.latamcargo.com/api/track', service: 'LatamCargoService' },
  { name: 'Rapidão Cometa', category: 'Transportadora', endpoint: 'https://www.rapidaocometa.com.br/api/track', service: 'RapidaoService' },
  { name: 'Sequoia', category: 'Transportadora', endpoint: 'https://www.sequoialog.com.br/api/track', service: 'SequoiaService' },
  { name: 'Braspress', category: 'Transportadora', endpoint: 'https://www.braspress.com.br/api/track', service: 'BraspressService' },
  { name: 'Jamef', category: 'Transportadora', endpoint: 'https://www.jamef.com.br/api/track', service: 'JamefService' },
  { name: 'Rodonaves', category: 'Transportadora', endpoint: 'https://www.rodonaves.com.br/api/track', service: 'RodonavesService' },
  { name: 'Direct', category: 'Transportadora', endpoint: 'https://www.directlog.com.br/api/track', service: 'DirectService' },
  { name: 'Patrus', category: 'Transportadora', endpoint: 'https://www.patrus.com.br/api/track', service: 'PatrusService' },
  { name: 'Loggi', category: 'Transportadora', endpoint: 'https://www.loggi.com/api/track', service: 'LoggiService' },
  
  // Internacionais
  { name: 'DHL', category: 'Transportadora Int', endpoint: 'https://api.dhl.com/track', service: 'DHLService' },
  { name: 'UPS', category: 'Transportadora Int', endpoint: 'https://onlinetools.ups.com/track/v1', service: 'UPSService' },
  { name: 'FedEx', category: 'Transportadora Int', endpoint: 'https://api.fedex.com/track/v1', service: 'FedExService' },
  { name: 'DB Schenker', category: 'Transportadora Int', endpoint: 'https://api.dbschenker.com/track', service: 'DBSchenkerService' },
  
  // Financeiro
  { name: 'Pluggy', category: 'Financeiro', endpoint: 'https://api.pluggy.ai', service: 'PluggyService' },
  { name: 'Banco do Brasil', category: 'Financeiro', endpoint: 'https://api.bb.com.br', service: 'BBService' },
  
  // Comunicação
  { name: 'Twilio', category: 'Comunicação', endpoint: 'https://api.twilio.com', service: 'TwilioService' },
  { name: 'SendGrid', category: 'Comunicação', endpoint: 'https://api.sendgrid.com', service: 'SendGridService' }
];

async function testAPI(api: typeof APIS_TO_TEST[0]): Promise<APIAudit> {
  const audit: APIAudit = {
    name: api.name,
    category: api.category,
    endpoint: api.endpoint,
    status: 'not_configured',
    has_credentials: false,
    has_error_handling: false,
    has_retry_logic: false
  };

  try {
    // Verificar se service existe
    const possiblePaths = [
      `src/services/integrations/${api.service}.ts`,
      `src/services/${api.service}.ts`,
      `src/lib/services/${api.service}.ts`
    ];

    let servicePath: string | null = null;
    let serviceContent: string | null = null;

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        servicePath = p;
        serviceContent = fs.readFileSync(p, 'utf8');
        break;
      }
    }
    
    if (!servicePath || !serviceContent) {
      audit.status = 'not_configured';
      audit.error = 'Service file não encontrado';
      return audit;
    }

    // Verificar credenciais
    if (serviceContent.includes('API_KEY') || 
        serviceContent.includes('api_key') ||
        serviceContent.includes('apiKey') ||
        serviceContent.includes('token')) {
      audit.has_credentials = true;
    }

    // Verificar error handling
    if (serviceContent.includes('try') && serviceContent.includes('catch')) {
      audit.has_error_handling = true;
    }

    // Verificar retry logic
    if (serviceContent.includes('retry') || 
        serviceContent.includes('Retry') ||
        serviceContent.includes('attempt')) {
      audit.has_retry_logic = true;
    }

    // Tentar ping no endpoint (apenas para APIs públicas)
    if (api.category === 'Governo' && api.name.includes('BrasilAPI' || 'ViaCEP')) {
      const startTime = Date.now();
      
      try {
        const response = await axios.get(api.endpoint, { timeout: 5000 });
        const endTime = Date.now();
        
        audit.response_time_ms = endTime - startTime;
        audit.status = response.status === 200 ? 'ok' : 'error';
      } catch (error: any) {
        if (error.code === 'ECONNABORTED') {
          audit.status = 'timeout';
        } else {
          audit.status = 'error';
          audit.error = error.message;
        }
      }
    } else {
      // Para APIs que requerem auth, apenas verificar se service existe
      audit.status = 'ok';
    }

  } catch (error: any) {
    audit.status = 'error';
    audit.error = error.message;
  }

  return audit;
}

async function auditAllAPIs() {
  console.log('🌐 Auditando APIs Externas...\n');

  const results: APIAudit[] = [];

  for (const api of APIS_TO_TEST) {
    console.log(`Testando: ${api.name} (${api.category})...`);
    const audit = await testAPI(api);
    results.push(audit);
    
    const statusEmoji = 
      audit.status === 'ok' ? '✅' :
      audit.status === 'error' ? '❌' :
      audit.status === 'timeout' ? '⏱️' : '⚠️';
    
    console.log(`  ${statusEmoji} Status: ${audit.status}`);
    
    if (audit.response_time_ms) {
      console.log(`  ⚡ Response time: ${audit.response_time_ms}ms`);
    }
    
    if (audit.error) {
      console.log(`  ⚠️  ${audit.error}`);
    }
  }

  // Estatísticas por categoria
  const byCategory: Record<string, any> = {};
  
  results.forEach(r => {
    if (!byCategory[r.category]) {
      byCategory[r.category] = { total: 0, ok: 0, error: 0, not_configured: 0 };
    }
    byCategory[r.category].total++;
    if (r.status === 'ok') byCategory[r.category].ok++;
    if (r.status === 'error' || r.status === 'timeout') byCategory[r.category].error++;
    if (r.status === 'not_configured') byCategory[r.category].not_configured++;
  });

  console.log('\n📊 Resumo por Categoria:');
  Object.entries(byCategory).forEach(([cat, stats]) => {
    console.log(`\n  ${cat}:`);
    console.log(`    Total: ${stats.total}`);
    console.log(`    OK: ${stats.ok}`);
    console.log(`    Erro: ${stats.error}`);
    console.log(`    Não configurado: ${stats.not_configured}`);
  });

  const totalOk = results.filter(r => r.status === 'ok').length;
  const totalConfigured = results.filter(r => r.status !== 'not_configured').length;
  
  const score = Math.round(
    (totalConfigured / results.length) * 50 +
    (totalOk / results.length) * 50
  );

  console.log(`\n✅ Score: ${score}/100`);
  console.log(`📊 Total de APIs: ${results.length}`);
  console.log(`✅ APIs OK: ${totalOk}`);
  console.log(`⚙️  APIs Configuradas: ${totalConfigured}`);

  return {
    apis: results,
    byCategory,
    totalOk,
    totalConfigured,
    totalApis: results.length,
    score
  };
}

// Executar
const results = await auditAllAPIs();

// Salvar
const outputDir = path.dirname(process.argv[1]);
fs.writeFileSync(
  path.join(outputDir, '4.1-results.json'),
  JSON.stringify(results, null, 2)
);

console.log('\n📄 Resultados salvos em 4.1-results.json');
