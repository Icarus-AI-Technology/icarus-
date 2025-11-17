#!/usr/bin/env node

/**
 * SUBAGENTE: ENVIRONMENT CHECKER
 * Valida environment variables
 */

const fs = require('fs');
const path = require('path');

// Carregar variáveis do .env
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      line = line.trim();
      if (!line || line.startsWith('#')) return;
      
      const [key, ...values] = line.split('=');
      if (key && values.length > 0) {
        const value = values.join('=').trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
    
    console.log('✅ Arquivo .env carregado\n');
  } else {
    console.log('⚠️  Arquivo .env não encontrado\n');
  }
}

// Carregar antes de iniciar
loadEnv();

class EnvironmentChecker {
  constructor() {
    this.env = process.env.NODE_ENV || 'development';
    
    this.required = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY'
    ];
    
    this.optional = [
      'VITE_OPENAI_API_KEY',
      'VITE_ANTHROPIC_API_KEY',
      'VITE_SENDGRID_API_KEY',
      'VITE_TWILIO_ACCOUNT_SID',
      'VITE_TWILIO_AUTH_TOKEN',
      'VITE_POSTHOG_KEY',
      'VITE_SENTRY_DSN',
      'VITE_MEILISEARCH_URL',
      'VITE_MEILISEARCH_KEY',
      'VITE_APP_URL',
      'VITE_ENVIRONMENT'
    ];
    
    this.devOnly = [
      'VITE_OLLAMA_URL'
    ];
    
    this.forbidden = [
      'REDIS_URL',
      'REDIS_HOST',
      'REDIS_PORT',
      'ML_SERVICE_URL',
      'DATABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];
    
    this.results = {
      required: { found: [], missing: [], invalid: [] },
      optional: { found: [], missing: [] },
      forbidden: { found: [] },
      validation: {},
      issues: {
        critical: [],
        high: [],
        medium: [],
        low: []
      }
    };
  }
  
  async check() {
    console.log(`🌍 Verificando environment variables (${this.env})...\n`);
    
    this.checkRequired();
    this.checkOptional();
    this.checkDevOnly();
    this.checkForbidden();
    await this.validateFormats();
    await this.testAccess();
    
    return this.generateReport();
  }
  
  checkRequired() {
    console.log('📋 Verificando variáveis obrigatórias...');
    
    this.required.forEach(name => {
      const value = process.env[name];
      
      if (!value) {
        console.log(`  ❌ ${name}: FALTANDO`);
        this.results.required.missing.push(name);
        this.results.issues.critical.push({
          type: 'missing_required',
          variable: name,
          message: 'Variável obrigatória faltando'
        });
      } else if (this.isPlaceholder(value)) {
        console.log(`  ⚠️  ${name}: PLACEHOLDER`);
        this.results.required.invalid.push(name);
        this.results.issues.critical.push({
          type: 'placeholder',
          variable: name,
          message: 'Variável contém placeholder'
        });
      } else {
        console.log(`  ✅ ${name}: OK`);
        this.results.required.found.push(name);
      }
    });
    
    console.log('');
  }
  
  checkOptional() {
    console.log('📝 Verificando variáveis opcionais...');
    
    this.optional.forEach(name => {
      const value = process.env[name];
      
      if (value && !this.isPlaceholder(value)) {
        console.log(`  ✅ ${name}: OK`);
        this.results.optional.found.push(name);
      } else {
        console.log(`  ⏭️  ${name}: não configurado`);
        this.results.optional.missing.push(name);
      }
    });
    
    console.log('');
  }
  
  checkDevOnly() {
    console.log('🔧 Verificando variáveis de desenvolvimento...');
    
    this.devOnly.forEach(name => {
      const value = process.env[name];
      
      if (value) {
        if (this.env === 'production') {
          console.log(`  ⚠️  ${name}: Presente em PRODUÇÃO (remover!)`);
          this.results.issues.high.push({
            type: 'dev_only_in_prod',
            variable: name,
            message: 'Variável de desenvolvimento em produção'
          });
        } else {
          console.log(`  ✅ ${name}: OK (dev only)`);
        }
      } else {
        if (this.env === 'development') {
          console.log(`  ℹ️  ${name}: Não configurado (opcional em dev)`);
        } else {
          console.log(`  ✅ ${name}: Não presente (correto para prod)`);
        }
      }
    });
    
    console.log('');
  }
  
  checkForbidden() {
    console.log('🚫 Verificando variáveis proibidas...');
    
    this.forbidden.forEach(name => {
      const value = process.env[name];
      
      if (value) {
        console.log(`  ❌ ${name}: PRESENTE (deve ser removido!)`);
        this.results.forbidden.found.push(name);
        this.results.issues.critical.push({
          type: 'forbidden_variable',
          variable: name,
          message: 'Variável de backend não deve estar no frontend'
        });
      } else {
        console.log(`  ✅ ${name}: Não presente (correto)`);
      }
    });
    
    console.log('');
  }
  
  isPlaceholder(value) {
    const placeholders = [
      'your-',
      'your_',
      'placeholder',
      'example',
      'xxx',
      '...',
      'todo',
      'changeme',
      'replace',
      'insert'
    ];
    
    const lowerValue = value.toLowerCase();
    return placeholders.some(ph => lowerValue.includes(ph));
  }
  
  async validateFormats() {
    console.log('✅ Validando formatos...');
    
    // Validar URLs
    const urlVars = [
      'VITE_SUPABASE_URL',
      'VITE_MEILISEARCH_URL',
      'VITE_OLLAMA_URL',
      'VITE_POSTHOG_HOST',
      'VITE_SENTRY_DSN',
      'VITE_APP_URL'
    ];
    
    urlVars.forEach(name => {
      const value = process.env[name];
      if (value && !this.isPlaceholder(value)) {
        const isValid = this.isValidUrl(value);
        if (!isValid) {
          console.log(`  ⚠️  ${name}: URL inválida`);
          this.results.issues.high.push({
            type: 'invalid_format',
            variable: name,
            message: 'URL inválida'
          });
        } else {
          console.log(`  ✅ ${name}: URL válida`);
        }
      }
    });
    
    // Validar formato de keys
    const keyVars = [
      { name: 'VITE_SUPABASE_ANON_KEY', pattern: /^eyJ/ },
      { name: 'VITE_OPENAI_API_KEY', pattern: /^sk-/ },
      { name: 'VITE_ANTHROPIC_API_KEY', pattern: /^sk-ant-/ },
      { name: 'VITE_SENDGRID_API_KEY', pattern: /^SG\./ },
      { name: 'VITE_POSTHOG_KEY', pattern: /^phc_/ }
    ];
    
    keyVars.forEach(({ name, pattern }) => {
      const value = process.env[name];
      if (value && !this.isPlaceholder(value)) {
        const isValid = pattern.test(value);
        if (!isValid) {
          console.log(`  ⚠️  ${name}: Formato inválido`);
          this.results.issues.medium.push({
            type: 'invalid_format',
            variable: name,
            message: 'Formato de key inválido'
          });
        } else {
          console.log(`  ✅ ${name}: Formato válido`);
        }
      }
    });
    
    console.log('');
  }
  
  isValidUrl(string) {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }
  
  async testAccess() {
    console.log('🔌 Testando acesso...');
    
    this.results.validation.access_tested = {};
    
    // Testar Supabase
    if (process.env.VITE_SUPABASE_URL) {
      try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/`, {
          headers: {
            'apikey': process.env.VITE_SUPABASE_ANON_KEY || '',
            'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY || ''}`
          }
        });
        
        if (response.ok || response.status === 401) {
          console.log('  ✅ Supabase: Acessível');
          this.results.validation.access_tested.supabase = 'ok';
        } else {
          console.log('  ❌ Supabase: Não acessível');
          this.results.validation.access_tested.supabase = 'error';
          this.results.issues.high.push({
            type: 'access',
            service: 'supabase',
            message: 'Supabase não acessível'
          });
        }
      } catch (error) {
        console.log(`  ⚠️  Supabase: Erro ao testar (${error.message})`);
        this.results.validation.access_tested.supabase = 'error';
      }
    }
    
    console.log('');
  }
  
  generateReport() {
    console.log('='.repeat(60));
    console.log('📊 RELATÓRIO DE ENVIRONMENT VARIABLES');
    console.log('='.repeat(60) + '\n');
    
    console.log('📋 Variáveis Obrigatórias:');
    console.log(`  Encontradas: ${this.results.required.found.length}/${this.required.length}`);
    console.log(`  Faltando: ${this.results.required.missing.length}`);
    console.log(`  Inválidas: ${this.results.required.invalid.length}`);
    
    console.log('\n📝 Variáveis Opcionais:');
    console.log(`  Configuradas: ${this.results.optional.found.length}/${this.optional.length}`);
    
    console.log('\n🚫 Variáveis Proibidas:');
    console.log(`  Encontradas: ${this.results.forbidden.found.length}`);
    
    if (this.results.forbidden.found.length > 0) {
      console.log('  ⚠️  Remover:', this.results.forbidden.found.join(', '));
    }
    
    console.log('\n🚨 Issues:');
    console.log(`  Críticos: ${this.results.issues.critical.length}`);
    console.log(`  Altos: ${this.results.issues.high.length}`);
    console.log(`  Médios: ${this.results.issues.medium.length}`);
    console.log(`  Baixos: ${this.results.issues.low.length}`);
    
    if (this.results.issues.critical.length > 0) {
      console.log('\n🔴 Issues Críticos:');
      this.results.issues.critical.forEach(issue => {
        console.log(`  - ${issue.variable || issue.service}: ${issue.message}`);
      });
    }
    
    const passed = this.results.required.missing.length === 0 &&
                   this.results.required.invalid.length === 0 &&
                   this.results.forbidden.found.length === 0;
    
    const report = {
      timestamp: new Date().toISOString(),
      environment: this.env,
      variables: {
        required: {
          total: this.required.length,
          found: this.results.required.found.length,
          missing: this.results.required.missing,
          invalid: this.results.required.invalid
        },
        optional: {
          total: this.optional.length,
          found: this.results.optional.found.length,
          missing: this.results.optional.missing
        },
        forbidden: {
          found: this.results.forbidden.found,
          should_remove: this.results.forbidden.found
        }
      },
      validation: this.results.validation,
      issues: this.results.issues,
      passed
    };
    
    // Salvar relatório
    const reportDir = path.join(process.cwd(), '.cursor', 'agents', 'environment-checker', 'reports');
    const reportPath = path.join(reportDir, `env-check-${Date.now()}.json`);
    
    try {
      fs.mkdirSync(reportDir, { recursive: true });
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`\n📄 Relatório salvo: ${reportPath}`);
    } catch (error) {
      console.log(`\n⚠️  Não foi possível salvar relatório: ${error.message}`);
    }
    
    if (passed) {
      console.log('\n✅ ENVIRONMENT VARIABLES VALIDADAS!');
      return report;
    } else {
      console.log('\n⚠️  ATENÇÃO - Corrija as variáveis antes de deploy em produção');
      return report;
    }
  }
}

// Executar
if (require.main === module) {
  const checker = new EnvironmentChecker();
  checker.check().catch(error => {
    console.error('Erro na verificação:', error.message);
    process.exit(1);
  });
}

module.exports = EnvironmentChecker;

