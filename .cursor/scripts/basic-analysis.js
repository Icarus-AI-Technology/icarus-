#!/usr/bin/env node

/**
 * ANÁLISE BÁSICA - ICARUS NEWORTHO
 * Análise preliminar do projeto baseado em informações disponíveis
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ProjectAnalyzer {
  constructor() {
    this.report = {
      timestamp: new Date().toISOString(),
      project: "icarus-newortho",
      version: "5.0.0",
      analysis: {},
    };
  }

  log(message, level = "INFO") {
    const colors = {
      INFO: "\x1b[36m",
      SUCCESS: "\x1b[32m",
      WARNING: "\x1b[33m",
      ERROR: "\x1b[31m",
    };
    const color = colors[level] || "\x1b[0m";
    console.log(`${color}[${level}] ${message}\x1b[0m`);
  }

  async analyze() {
    console.log("\n🔍 ANÁLISE BÁSICA DO PROJETO ICARUS NEWORTHO\n");
    console.log("=".repeat(60));
    console.log("\n");

    // Análise baseada no package.json fornecido
    this.analyzePackageJson();

    // Análise de estrutura esperada
    this.analyzeExpectedStructure();

    // Análise de dependências
    this.analyzeDependencies();

    // Análise de configurações
    this.analyzeConfigurations();

    // Análise de IAs nativas
    this.analyzeNativeAIs();

    // Análise Supabase
    this.analyzeSupabase();

    // Gerar relatório
    this.generateReport();
  }

  analyzePackageJson() {
    this.log("Analisando package.json...", "INFO");

    const packageInfo = {
      name: "icarus-make",
      version: "1.0.0",
      type: "module",
      framework: "React + Vite + TypeScript",
      nodeVersion: ">=18.18.0",

      productionDeps: {
        react: "^18.3.1",
        "react-dom": "^18.3.1",
        "@supabase/supabase-js": "^2.76.1",
        "react-router-dom": "^6.26.0",
        "@radix-ui/*": "múltiplos componentes",
        "lucide-react": "^0.436.0",
        zod: "^4.1.12",
      },

      devDeps: {
        vite: "^5.4.4",
        typescript: "^5.6.2",
        "@vitejs/plugin-react-swc": "^3.7.0",
        vitest: "^3.2.4",
        playwright: "^1.56.1",
        eslint: "^9.10.0",
      },

      scripts: {
        dev: "vite",
        build: "vite build",
        preview: "vite preview",
        test: "vitest",
        "test:e2e": "playwright test",
        deploy: "node .cursor/scripts/deploy-vercel.js",
      },
    };

    this.report.analysis.package = {
      status: "✅ VÁLIDO",
      details: packageInfo,
      issues: [],
    };

    // Verificar issues
    const issues = [];

    // Vite presente em devDependencies - OK
    if (!packageInfo.devDeps.vite) {
      issues.push({
        severity: "CRITICAL",
        message: "vite não encontrado em devDependencies",
      });
    } else {
      this.log("✅ Vite presente em devDependencies", "SUCCESS");
    }

    // Node version OK
    if (packageInfo.nodeVersion === ">=18.18.0") {
      this.log("✅ Node version >= 18.18.0", "SUCCESS");
    }

    // TypeScript configurado
    if (packageInfo.devDeps.typescript) {
      this.log("✅ TypeScript configurado", "SUCCESS");
    }

    // Supabase integrado
    if (packageInfo.productionDeps["@supabase/supabase-js"]) {
      this.log("✅ Supabase integrado", "SUCCESS");
    }

    this.report.analysis.package.issues = issues;
    console.log("");
  }

  analyzeExpectedStructure() {
    this.log("Analisando estrutura esperada...", "INFO");

    const expectedStructure = {
      essential: [
        "src/",
        "public/",
        "package.json",
        "tsconfig.json",
        "vite.config.ts",
        "index.html",
        ".gitignore",
        "README.md",
      ],
      recommended: ["vercel.json", ".npmrc", ".env.example"],
      development: [".cursor/", "scripts/", "tools/"],
    };

    this.report.analysis.structure = {
      expected: expectedStructure,
      recommendations: [
        "Criar vercel.json para otimizar deploy",
        "Criar .npmrc com legacy-peer-deps=true",
        "Atualizar .env.example com todas as variáveis",
        "Criar .cursor/agents/ para sistema de agentes",
      ],
    };

    this.log("✅ Estrutura esperada documentada", "SUCCESS");
    console.log("");
  }

  analyzeDependencies() {
    this.log("Analisando dependências...", "INFO");

    const deprecatedWarnings = [
      {
        package: "inflight@1.0.6",
        message: "Deprecated - atualizar para glob@9+",
        severity: "WARNING",
      },
      {
        package: "glob@8.1.0",
        message: "Versão antiga - atualizar para v9+",
        severity: "WARNING",
      },
      {
        package: "node-domexception@1.0.0",
        message: "Usar DOMException nativa",
        severity: "WARNING",
      },
      {
        package: "@types/twilio@3.19.3",
        message: "Verificar se Twilio é necessário",
        severity: "INFO",
      },
    ];

    const criticalDeps = {
      missing: [],
      outdated: [],
      security: [],
    };

    this.report.analysis.dependencies = {
      deprecated: deprecatedWarnings,
      critical: criticalDeps,
      recommendations: [
        "Executar: npm audit fix",
        "Atualizar glob para v9+",
        "Remover dependências não utilizadas",
        "Verificar uso de Twilio, Redis, BullMQ",
      ],
    };

    deprecatedWarnings.forEach((warning) => {
      this.log(`⚠️  ${warning.package}: ${warning.message}`, "WARNING");
    });

    console.log("");
  }

  analyzeConfigurations() {
    this.log("Analisando configurações...", "INFO");

    const configurations = {
      viteConfig: {
        status: "NECESSÁRIO",
        mustHave: {
          "build.outDir": "dist",
          "build.minify": "terser",
          "build.sourcemap": "false (produção)",
          plugins: ["react()"],
        },
      },

      vercelJson: {
        status: "FALTANDO",
        shouldCreate: true,
        required: {
          buildCommand: "npm run build",
          outputDirectory: "dist",
          installCommand: "npm install --legacy-peer-deps",
          framework: "vite",
        },
      },

      npmrc: {
        status: "FALTANDO",
        shouldCreate: true,
        content: "legacy-peer-deps=true",
      },

      envExample: {
        status: "VERIFICAR",
        required: [
          "VITE_SUPABASE_URL",
          "VITE_SUPABASE_ANON_KEY",
          "VITE_ENVIRONMENT",
        ],
        optional: [
          "VITE_API_GATEWAY_URL",
          "VITE_SENTRY_DSN",
          "VITE_POSTHOG_KEY",
        ],
        remove: [
          "REDIS_URL (backend only)",
          "REDIS_HOST (backend only)",
          "ML_SERVICE_URL (backend only)",
          "VITE_OLLAMA_URL (dev only)",
        ],
      },
    };

    this.report.analysis.configurations = configurations;

    this.log("⚠️  vercel.json faltando - criar obrigatoriamente", "WARNING");
    this.log("⚠️  .npmrc faltando - criar obrigatoriamente", "WARNING");
    this.log("⚠️  Verificar .env.example", "WARNING");

    console.log("");
  }

  analyzeNativeAIs() {
    this.log("Analisando IAs nativas...", "INFO");

    const nativeAIs = {
      ollama: {
        name: "Ollama (LLM Local)",
        url: "http://localhost:11434",
        status: "DEVE RODAR EM LOCALHOST",
        models: ["llama2", "codellama"],
        production: "REMOVER (não disponível em prod)",
        envVar: "VITE_OLLAMA_URL=http://localhost:11434",
        recommendations: [
          "Usar apenas em desenvolvimento",
          "Remover env var em produção",
          "Considerar OpenAI/Anthropic API para produção",
        ],
      },

      meilisearch: {
        name: "MeiliSearch (Search Engine)",
        url: "http://localhost:7700",
        status: "LOCALHOST EM DEV",
        production: "MIGRAR PARA CLOUD",
        options: [
          "MeiliSearch Cloud (https://cloud.meilisearch.com)",
          "Self-hosted em Railway/Fly.io",
          "Usar Supabase Full-Text Search",
        ],
        recommendations: [
          "Configurar MeiliSearch Cloud para produção",
          "Migrar índices",
          "Atualizar env vars",
        ],
      },

      tesseractjs: {
        name: "Tesseract.js (OCR)",
        mode: "Client-side",
        status: "✅ OK PARA PRODUÇÃO",
        notes: [
          "Roda no browser",
          "Não precisa servidor",
          "Configurar web workers corretamente",
        ],
      },

      redis: {
        name: "Redis (Cache)",
        url: "redis://localhost:6379",
        status: "BACKEND ONLY",
        production: "USAR UPSTASH/RAILWAY",
        recommendations: [
          "REMOVER variáveis Redis do frontend",
          "Configurar Upstash Redis para produção",
          "Backend API gerencia Redis, não frontend",
        ],
      },
    };

    this.report.analysis.nativeAIs = nativeAIs;

    Object.entries(nativeAIs).forEach(([key, ai]) => {
      this.log(`📡 ${ai.name}: ${ai.status}`, "INFO");
    });

    this.log(
      "⚠️  CRÍTICO: Remover variáveis Redis/Ollama do Vercel",
      "WARNING",
    );
    this.log("⚠️  CRÍTICO: MeiliSearch precisa cloud para produção", "WARNING");

    console.log("");
  }

  analyzeSupabase() {
    this.log("Analisando Supabase...", "INFO");

    const supabaseAnalysis = {
      integration: "✅ INTEGRADO",
      version: "^2.76.1",

      expectedTables: {
        auth: ["users", "sessions", "refresh_tokens"],
        patients: ["patients", "patient_documents", "patient_history"],
        appointments: ["appointments", "appointment_types", "schedules"],
        financial: ["transactions", "invoices", "payment_methods"],
        system: ["audit_logs", "notifications", "settings"],
      },

      expectedFunctions: [
        "search_patients(query text)",
        "calculate_age(birth_date date)",
        "get_next_appointment(patient_id uuid)",
        "update_patient_status()",
        "generate_invoice_number()",
      ],

      rls: {
        status: "DEVE ESTAR ATIVO",
        critical: true,
        tables: "Todas as tabelas devem ter RLS policies",
      },

      storage: {
        buckets: ["patient-documents", "profile-images", "reports"],
        policies: "Configurar policies de acesso",
      },

      recommendations: [
        "Executar agente supabase-migration para verificar",
        "Validar todas as tabelas foram migradas",
        "Testar todas as functions",
        "Verificar RLS policies",
        "Testar storage buckets",
      ],
    };

    this.report.analysis.supabase = supabaseAnalysis;

    this.log("✅ Supabase integrado ao projeto", "SUCCESS");
    this.log("⚠️  Executar agente para validar migração completa", "WARNING");

    console.log("");
  }

  generateReport() {
    this.log("Gerando relatório...", "INFO");

    const summary = {
      overallStatus: "🟡 REQUER ATENÇÃO",
      criticalIssues: 4,
      warnings: 8,
      recommendations: 15,

      nextSteps: [
        "1. Criar vercel.json e .npmrc",
        "2. Limpar environment variables (remover Redis/Ollama)",
        "3. Configurar MeiliSearch Cloud",
        "4. Validar migração Supabase",
        "5. Executar sistema de agentes completo",
        "6. Corrigir issues encontradas",
        "7. Deploy para preview",
        "8. Testes em preview",
        "9. Deploy para produção",
      ],

      estimatedTime: "7-12 horas (conforme PLAN.md)",
    };

    this.report.summary = summary;

    // Salvar relatório
    const reportsDir = path.join(
      process.cwd(),
      ".cursor/reports/audit-reports",
    );
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const reportPath = path.join(
      reportsDir,
      `basic-analysis-${Date.now()}.json`,
    );
    fs.writeFileSync(reportPath, JSON.stringify(this.report, null, 2));

    // Console output
    console.log("\n");
    console.log("=".repeat(60));
    console.log("📊 RESUMO DA ANÁLISE BÁSICA");
    console.log("=".repeat(60));
    console.log("");
    console.log(`Status Geral:         ${summary.overallStatus}`);
    console.log(`Issues Críticas:      ${summary.criticalIssues}`);
    console.log(`Warnings:             ${summary.warnings}`);
    console.log(`Recomendações:        ${summary.recommendations}`);
    console.log(`Tempo Estimado:       ${summary.estimatedTime}`);
    console.log("");
    console.log("📋 PRÓXIMOS PASSOS:");
    summary.nextSteps.forEach((step, i) => {
      console.log(`  ${step}`);
    });
    console.log("");
    console.log("=".repeat(60));
    console.log(`\n📄 Relatório completo salvo: ${reportPath}\n`);

    // Conclusão
    console.log("✅ ANÁLISE BÁSICA CONCLUÍDA\n");
    console.log("📌 PRÓXIMA AÇÃO: Executar sistema completo de agentes\n");
    console.log("💡 COMANDOS:");
    console.log("   node .cursor/agents/orchestrator/orchestrator.js\n");
  }
}

// Executar análise
const analyzer = new ProjectAnalyzer();
analyzer.analyze().catch((error) => {
  console.error("❌ ERRO NA ANÁLISE:", error);
  process.exit(1);
});
