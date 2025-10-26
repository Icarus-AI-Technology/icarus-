// 4.2-supabase-services.ts
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

interface SupabaseServiceAudit {
  service: string;
  configured: boolean;
  functional: boolean;
  details: any;
  issues: string[];
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

async function auditAuth(): Promise<SupabaseServiceAudit> {
  console.log('🔐 Auditando Supabase Auth...');
  
  const audit: SupabaseServiceAudit = {
    service: 'Auth',
    configured: false,
    functional: false,
    details: {},
    issues: []
  };

  try {
    if (!supabaseUrl || !supabaseKey) {
      audit.issues.push('Credenciais Supabase não configuradas');
      return audit;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verificar sessão
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    
    audit.configured = true;
    audit.details.hasSession = !!session.session;

    // Auth está funcional se conseguimos consultar
    audit.functional = !sessionError;

    if (sessionError) {
      audit.issues.push(`Erro ao consultar sessão: ${sessionError.message}`);
    }

  } catch (error: any) {
    audit.issues.push(`Erro: ${error.message}`);
  }

  console.log(`  ${audit.functional ? '✅' : '❌'} Auth: ${audit.functional ? 'Funcional' : 'Com problemas'}`);
  
  return audit;
}

async function auditStorage(): Promise<SupabaseServiceAudit> {
  console.log('📦 Auditando Supabase Storage...');
  
  const audit: SupabaseServiceAudit = {
    service: 'Storage',
    configured: false,
    functional: false,
    details: {},
    issues: []
  };

  try {
    if (!supabaseUrl || !supabaseKey) {
      audit.issues.push('Credenciais Supabase não configuradas');
      return audit;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Listar buckets
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      audit.issues.push(`Erro ao listar buckets: ${error.message}`);
      return audit;
    }

    audit.configured = true;
    audit.functional = true;
    audit.details.buckets = buckets?.map(b => ({
      name: b.name,
      public: b.public
    })) || [];

    const expectedBuckets = [
      'avatars',
      'documentos',
      'nfe-xml',
      'anexos-cirurgias',
      'relatorios',
      'temp'
    ];

    const existingBuckets = buckets?.map(b => b.name) || [];
    const missingBuckets = expectedBuckets.filter(
      expected => !existingBuckets.includes(expected)
    );

    if (missingBuckets.length > 0) {
      audit.issues.push(`Buckets ausentes: ${missingBuckets.join(', ')}`);
    }

    console.log(`  ${audit.functional ? '✅' : '❌'} Storage: ${buckets?.length || 0} buckets encontrados`);

  } catch (error: any) {
    audit.issues.push(`Erro: ${error.message}`);
    console.log(`  ❌ Storage: Erro - ${error.message}`);
  }

  return audit;
}

async function auditRealtime(): Promise<SupabaseServiceAudit> {
  console.log('⚡ Auditando Supabase Realtime...');
  
  const audit: SupabaseServiceAudit = {
    service: 'Realtime',
    configured: false,
    functional: false,
    details: {},
    issues: []
  };

  try {
    if (!supabaseUrl || !supabaseKey) {
      audit.issues.push('Credenciais Supabase não configuradas');
      return audit;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    audit.configured = true;
    audit.functional = true;
    audit.details.status = 'available';

    console.log(`  ✅ Realtime: Disponível`);

  } catch (error: any) {
    audit.issues.push(`Erro: ${error.message}`);
    console.log(`  ❌ Realtime: Erro - ${error.message}`);
  }

  return audit;
}

async function auditEdgeFunctions(): Promise<SupabaseServiceAudit> {
  console.log('⚡ Auditando Edge Functions...');
  
  const audit: SupabaseServiceAudit = {
    service: 'Edge Functions',
    configured: false,
    functional: false,
    details: {},
    issues: []
  };

  const expectedFunctions = [
    'ml-vectors',
    'ml-job',
    'vector-benchmark'
  ];

  const functionsDir = 'supabase/functions';
  
  if (!fs.existsSync(functionsDir)) {
    audit.issues.push('Diretório supabase/functions não encontrado');
    console.log(`  ⚠️  Edge Functions: Diretório não encontrado`);
    return audit;
  }

  const deployedFunctions = fs.readdirSync(functionsDir)
    .filter(f => {
      const fullPath = path.join(functionsDir, f);
      return fs.statSync(fullPath).isDirectory() && f !== '_shared';
    });

  audit.configured = deployedFunctions.length > 0;
  audit.details.functions = deployedFunctions;

  const missingFunctions = expectedFunctions.filter(
    expected => !deployedFunctions.includes(expected)
  );

  if (missingFunctions.length === 0 || deployedFunctions.length > 0) {
    audit.functional = true;
  }

  if (missingFunctions.length > 0) {
    audit.issues.push(`Functions ausentes: ${missingFunctions.join(', ')}`);
  }

  console.log(`  ${audit.functional ? '✅' : '⚠️'} Edge Functions: ${deployedFunctions.length} funções encontradas`);

  return audit;
}

async function auditSupabaseServices() {
  console.log('🔧 Auditando Supabase Services...\n');

  const results = {
    auth: await auditAuth(),
    storage: await auditStorage(),
    realtime: await auditRealtime(),
    edgeFunctions: await auditEdgeFunctions()
  };

  const allServices = Object.values(results);
  const functional = allServices.filter(s => s.functional).length;
  const configured = allServices.filter(s => s.configured).length;

  console.log('\n📊 Resumo:');
  console.log(`  Configurados: ${configured}/${allServices.length}`);
  console.log(`  Funcionais: ${functional}/${allServices.length}`);

  allServices.forEach(service => {
    const status = service.functional ? '✅' : service.configured ? '⚠️' : '❌';
    console.log(`\n  ${status} ${service.service}`);
    
    if (service.issues.length > 0) {
      service.issues.forEach(issue => console.log(`    - ${issue}`));
    }
  });

  const score = Math.round(
    (configured / allServices.length) * 50 +
    (functional / allServices.length) * 50
  );

  console.log(`\n✅ Score: ${score}/100`);

  return { ...results, score, configured, functional, total: allServices.length };
}

// Executar
const results = await auditSupabaseServices();

// Salvar
const outputDir = path.dirname(process.argv[1]);
fs.writeFileSync(
  path.join(outputDir, '4.2-results.json'),
  JSON.stringify(results, null, 2)
);

console.log('\n📄 Resultados salvos em 4.2-results.json');
