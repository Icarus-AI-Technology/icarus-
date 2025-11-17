#!/usr/bin/env node

/**
 * Audit Modules
 * Audita todos os 58+ módulos do Icarus v5.0
 */

const fs = require('fs');
const path = require('path');

class ModulesAuditor {
  constructor() {
    this.modules = [];
    this.coverage = {
      frontend: 0,
      backend: 0,
      database: 0,
      tests: 0
    };
  }

  async auditModules() {
    console.log('🔍 Auditando Módulos do Icarus v5.0...\n');

    // Lista dos 58+ módulos conforme inventário
    const modulesList = [
      // Dashboard e Navegação
      { id: 1, name: 'Dashboard Principal', category: 'core', priority: 'critico' },
      { id: 2, name: 'Sidebar/Topbar', category: 'core', priority: 'critico' },
      
      // Cadastros
      { id: 3, name: 'Clientes/Hospitais', category: 'cadastros', priority: 'critico' },
      { id: 4, name: 'Fornecedores', category: 'cadastros', priority: 'critico' },
      { id: 5, name: 'Produtos OPME', category: 'cadastros', priority: 'critico' },
      { id: 6, name: 'Usuários/Colaboradores', category: 'cadastros', priority: 'critico' },
      { id: 7, name: 'Médicos/Cirurgiões', category: 'cadastros', priority: 'critico' },
      { id: 8, name: 'Representantes', category: 'cadastros', priority: 'medio' },
      
      // Estoque e Consignação
      { id: 9, name: 'Estoque Central', category: 'estoque', priority: 'critico' },
      { id: 10, name: 'Consignação', category: 'estoque', priority: 'critico' },
      { id: 11, name: 'Movimentações Estoque', category: 'estoque', priority: 'critico' },
      { id: 12, name: 'Inventário', category: 'estoque', priority: 'medio' },
      { id: 13, name: 'Lote e Validade', category: 'estoque', priority: 'critico' },
      
      // Compras
      { id: 14, name: 'Pedidos de Compra', category: 'compras', priority: 'critico' },
      { id: 15, name: 'Cotações', category: 'compras', priority: 'medio' },
      { id: 16, name: 'Entrada de Produtos', category: 'compras', priority: 'critico' },
      
      // Cirurgias
      { id: 17, name: 'Agendamento Cirurgias', category: 'cirurgias', priority: 'critico' },
      { id: 18, name: 'Mapa Cirúrgico', category: 'cirurgias', priority: 'critico' },
      { id: 19, name: 'Checklist Cirúrgico', category: 'cirurgias', priority: 'medio' },
      { id: 20, name: 'Rastreabilidade Cirúrgica', category: 'cirurgias', priority: 'critico' },
      
      // Faturamento
      { id: 21, name: 'Faturamento OPME', category: 'faturamento', priority: 'critico' },
      { id: 22, name: 'Guias TISS', category: 'faturamento', priority: 'critico' },
      { id: 23, name: 'Remessas Faturamento', category: 'faturamento', priority: 'critico' },
      { id: 24, name: 'Glosas', category: 'faturamento', priority: 'medio' },
      { id: 25, name: 'Recebimentos', category: 'faturamento', priority: 'critico' },
      
      // Financeiro
      { id: 26, name: 'Contas a Pagar', category: 'financeiro', priority: 'critico' },
      { id: 27, name: 'Contas a Receber', category: 'financeiro', priority: 'critico' },
      { id: 28, name: 'Fluxo de Caixa', category: 'financeiro', priority: 'medio' },
      { id: 29, name: 'Conciliação Bancária', category: 'financeiro', priority: 'medio' },
      
      // Fiscal
      { id: 30, name: 'Emissão NF-e', category: 'fiscal', priority: 'critico' },
      { id: 31, name: 'Integração SEFAZ', category: 'fiscal', priority: 'critico' },
      { id: 32, name: 'Impostos', category: 'fiscal', priority: 'critico' },
      { id: 33, name: 'SPED', category: 'fiscal', priority: 'medio' },
      
      // CRM e Vendas
      { id: 34, name: 'Oportunidades', category: 'crm', priority: 'medio' },
      { id: 35, name: 'Propostas Comerciais', category: 'crm', priority: 'medio' },
      { id: 36, name: 'Contratos', category: 'crm', priority: 'critico' },
      { id: 37, name: 'Comissões', category: 'crm', priority: 'medio' },
      
      // Compliance
      { id: 38, name: 'Rastreabilidade ANVISA', category: 'compliance', priority: 'critico' },
      { id: 39, name: 'Auditoria', category: 'compliance', priority: 'medio' },
      { id: 40, name: 'Documentação Qualidade', category: 'compliance', priority: 'medio' },
      
      // Relatórios
      { id: 41, name: 'Relatórios Financeiros', category: 'relatorios', priority: 'medio' },
      { id: 42, name: 'Relatórios Estoque', category: 'relatorios', priority: 'medio' },
      { id: 43, name: 'Relatórios Cirurgias', category: 'relatorios', priority: 'medio' },
      { id: 44, name: 'Analytics', category: 'relatorios', priority: 'baixo' },
      
      // Integrations
      { id: 45, name: 'API Externa', category: 'integracoes', priority: 'critico' },
      { id: 46, name: 'Webhooks', category: 'integracoes', priority: 'medio' },
      { id: 47, name: 'EDI', category: 'integracoes', priority: 'baixo' },
      
      // IA e Automação
      { id: 48, name: 'Chatbot Icarus', category: 'ia', priority: 'medio' },
      { id: 49, name: 'Tutores IA', category: 'ia', priority: 'medio' },
      { id: 50, name: 'Análise Preditiva', category: 'ia', priority: 'baixo' },
      
      // Configurações
      { id: 51, name: 'Configurações Gerais', category: 'config', priority: 'critico' },
      { id: 52, name: 'Permissões e Roles', category: 'config', priority: 'critico' },
      { id: 53, name: 'Parâmetros Sistema', category: 'config', priority: 'critico' },
      
      // Notificações
      { id: 54, name: 'Notificações Email', category: 'notificacoes', priority: 'medio' },
      { id: 55, name: 'Notificações Push', category: 'notificacoes', priority: 'baixo' },
      { id: 56, name: 'Alertas Sistema', category: 'notificacoes', priority: 'medio' },
      
      // Mobile
      { id: 57, name: 'App Mobile', category: 'mobile', priority: 'baixo' },
      { id: 58, name: 'PWA', category: 'mobile', priority: 'medio' }
    ];

    for (const module of modulesList) {
      const audit = await this.auditModule(module);
      this.modules.push(audit);
    }

    this.calculateCoverage();
    this.generateReport();
  }

  async auditModule(module) {
    // Verifica presença de arquivos frontend
    const frontendPath = `src/pages/${module.category}/${this.slugify(module.name)}.tsx`;
    const hasFrontend = fs.existsSync(path.join(process.cwd(), frontendPath));

    // Verifica edge functions
    const edgeFunctionPath = `supabase/functions/${this.slugify(module.name)}/index.ts`;
    const hasBackend = fs.existsSync(path.join(process.cwd(), edgeFunctionPath));

    // Verifica migração de banco (aproximado)
    const migrationsDir = path.join(process.cwd(), 'supabase/migrations');
    let hasDatabase = false;
    if (fs.existsSync(migrationsDir)) {
      const migrations = fs.readdirSync(migrationsDir);
      hasDatabase = migrations.some(m => m.toLowerCase().includes(module.category));
    }

    // Verifica testes
    const testPath = `src/pages/${module.category}/__tests__/${this.slugify(module.name)}.test.tsx`;
    const hasTests = fs.existsSync(path.join(process.cwd(), testPath));

    const completeness = [hasFrontend, hasBackend, hasDatabase, hasTests].filter(Boolean).length / 4 * 100;

    return {
      ...module,
      implementation: {
        frontend: hasFrontend,
        backend: hasBackend,
        database: hasDatabase,
        tests: hasTests
      },
      completeness: Math.round(completeness),
      status: completeness >= 75 ? 'completo' : completeness >= 50 ? 'parcial' : 'pendente'
    };
  }

  slugify(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  calculateCoverage() {
    const total = this.modules.length;
    this.coverage.frontend = Math.round((this.modules.filter(m => m.implementation.frontend).length / total) * 100);
    this.coverage.backend = Math.round((this.modules.filter(m => m.implementation.backend).length / total) * 100);
    this.coverage.database = Math.round((this.modules.filter(m => m.implementation.database).length / total) * 100);
    this.coverage.tests = Math.round((this.modules.filter(m => m.implementation.tests).length / total) * 100);
  }

  generateReport() {
    console.log('\n📊 Relatório de Auditoria de Módulos - Icarus v5.0');
    console.log('='.repeat(70));
    console.log(`Total de Módulos: ${this.modules.length}\n`);

    // Coverage geral
    console.log('📈 COBERTURA GERAL');
    console.log('-'.repeat(70));
    console.log(`Frontend:  ${this.coverage.frontend}%`);
    console.log(`Backend:   ${this.coverage.backend}%`);
    console.log(`Database:  ${this.coverage.database}%`);
    console.log(`Tests:     ${this.coverage.tests}%`);

    // Módulos por status
    const completos = this.modules.filter(m => m.status === 'completo');
    const parciais = this.modules.filter(m => m.status === 'parcial');
    const pendentes = this.modules.filter(m => m.status === 'pendente');

    console.log('\n\n📋 STATUS DOS MÓDULOS');
    console.log('-'.repeat(70));
    console.log(`🟢 Completos: ${completos.length}`);
    console.log(`🟡 Parciais:  ${parciais.length}`);
    console.log(`🔴 Pendentes: ${pendentes.length}`);

    // Prioridades pendentes
    const criticosPendentes = pendentes.filter(m => m.priority === 'critico');
    if (criticosPendentes.length > 0) {
      console.log('\n\n🚨 MÓDULOS CRÍTICOS PENDENTES');
      console.log('-'.repeat(70));
      criticosPendentes.forEach((m, i) => {
        console.log(`${i + 1}. ${m.name} (${m.category})`);
      });
    }

    this.saveReport();
  }

  saveReport() {
    const outputDir = path.join(process.cwd(), 'docs', 'audit');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const report = {
      timestamp: new Date().toISOString(),
      total_modules: this.modules.length,
      coverage: this.coverage,
      modules: this.modules,
      summary: {
        complete: this.modules.filter(m => m.status === 'completo').length,
        partial: this.modules.filter(m => m.status === 'parcial').length,
        pending: this.modules.filter(m => m.status === 'pendente').length
      }
    };

    const outputFile = path.join(outputDir, 'modules-audit-report.json');
    fs.writeFileSync(outputFile, JSON.stringify(report, null, 2));
    
    console.log(`\n💾 Relatório salvo em: ${outputFile}`);
  }

  async run() {
    console.log('🎯 Auditor de Módulos - Icarus v5.0\n');
    await this.auditModules();
    return this.modules;
  }
}

if (require.main === module) {
  const auditor = new ModulesAuditor();
  auditor.run().catch(console.error);
}

module.exports = ModulesAuditor;

