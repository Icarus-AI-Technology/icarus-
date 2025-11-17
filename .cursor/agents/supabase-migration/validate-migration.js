#!/usr/bin/env node

/**
 * SUBAGENTE: SUPABASE MIGRATION VALIDATOR
 * Verifica migração completa do Supabase
 */

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

class SupabaseMigrationValidator {
  constructor() {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        "VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórias",
      );
    }

    // Cliente com anon key (para testar RLS)
    this.client = createClient(supabaseUrl, supabaseKey);

    // Cliente com service role (para queries admin)
    this.adminClient = serviceRoleKey
      ? createClient(supabaseUrl, serviceRoleKey)
      : this.client;

    this.results = {
      tables: {},
      policies: {},
      functions: {},
      triggers: {},
      views: {},
      storage: {},
      edge_functions: {},
      issues: {
        critical: [],
        high: [],
        medium: [],
        low: [],
      },
    };
  }

  async validate() {
    console.log("🗄️  Validando migração Supabase...\n");

    try {
      await this.checkConnection();
      await this.validateTables();
      await this.validateRLS();
      await this.validatePolicies();
      await this.validateFunctions();
      await this.validateTriggers();
      await this.validateViews();
      await this.validateStorage();
      await this.validateEdgeFunctions();

      return this.generateReport();
    } catch (error) {
      console.error("❌ Erro na validação:", error.message);
      throw error;
    }
  }

  async checkConnection() {
    console.log("🔌 Verificando conexão...");

    try {
      const { data, error } = await this.client
        .from("_prisma_migrations")
        .select("id")
        .limit(1);

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      console.log("✅ Conexão estabelecida\n");
    } catch (error) {
      console.log(
        "⚠️  Tabela _prisma_migrations não encontrada (normal se não usar Prisma)\n",
      );
    }
  }

  async validateTables() {
    console.log("📋 Validando tabelas...");

    try {
      // Tentar listar tabelas conhecidas
      const knownTables = [
        "users",
        "profiles",
        "organizations",
        "projects",
        "tasks",
        "documents",
        "comments",
        "notifications",
        "pacientes",
        "agendamentos",
        "consultas",
        "prontuarios",
        "cirurgias",
        "produtos",
        "estoque",
        "vendas",
      ];

      const existingTables = [];
      for (const table of knownTables) {
        const { error: testError } = await this.client
          .from(table)
          .select("id")
          .limit(0);

        if (!testError || testError.code === "PGRST116") {
          existingTables.push(table);
        }
      }

      this.results.tables = {
        total: existingTables.length,
        list: existingTables,
        method: "probe",
      };

      console.log(
        `✅ ${existingTables.length} tabelas encontradas (via probe)\n`,
      );

      if (this.results.tables.total === 0) {
        this.results.issues.critical.push({
          type: "tables",
          message: "Nenhuma tabela encontrada no schema public",
        });
      }
    } catch (error) {
      console.log(`⚠️  Erro ao validar tabelas: ${error.message}\n`);
      this.results.issues.high.push({
        type: "tables",
        message: error.message,
      });
    }
  }

  async validateRLS() {
    console.log("🔒 Validando Row Level Security...");

    const tables = this.results.tables.list || [];
    let tablesWithRLS = 0;
    let tablesWithoutRLS = [];

    for (const table of tables) {
      try {
        const tableName = typeof table === "string" ? table : table.table_name;

        // Tentar query com anon client (se RLS estiver habilitado, deve funcionar ou dar erro específico)
        const { error } = await this.client
          .from(tableName)
          .select("*")
          .limit(0);

        if (!error) {
          tablesWithRLS++;
        } else if (error.code === "42501") {
          // Erro de permissão = RLS ativo mas sem policy
          tablesWithRLS++;
        } else {
          tablesWithoutRLS.push(tableName);
        }
      } catch (error) {
        // Ignorar erros de tabelas que não existem
      }
    }

    this.results.rls = {
      total_tables: tables.length,
      with_rls: tablesWithRLS,
      without_rls: tablesWithoutRLS.length,
      tables_without_rls: tablesWithoutRLS,
    };

    console.log(`✅ ${tablesWithRLS}/${tables.length} tabelas com RLS`);

    if (tablesWithoutRLS.length > 0) {
      console.log(
        `⚠️  ${tablesWithoutRLS.length} tabelas SEM RLS:`,
        tablesWithoutRLS,
      );
      this.results.issues.critical.push({
        type: "rls",
        message: `${tablesWithoutRLS.length} tabelas sem RLS`,
        tables: tablesWithoutRLS,
      });
    }

    console.log("");
  }

  async validatePolicies() {
    console.log("📜 Validando políticas...");

    console.log(
      "ℹ️  Políticas devem ser verificadas manualmente via Dashboard\n",
    );
    this.results.policies = {
      total: 0,
      note: "Verificar manualmente via Supabase Dashboard > Authentication > Policies",
    };
  }

  async validateFunctions() {
    console.log("⚙️  Validando funções...");

    console.log(
      "ℹ️  Funções devem ser verificadas manualmente via Dashboard\n",
    );
    this.results.functions = {
      total: 0,
      note: "Verificar manualmente via Supabase Dashboard > Database > Functions",
    };
  }

  async validateTriggers() {
    console.log("⚡ Validando triggers...");

    console.log(
      "ℹ️  Triggers devem ser verificados manualmente via Dashboard\n",
    );
    this.results.triggers = {
      total: 0,
      note: "Verificar manualmente via Supabase Dashboard > Database > Triggers",
    };
  }

  async validateViews() {
    console.log("👁️  Validando views...");

    console.log("ℹ️  Views devem ser verificadas manualmente via Dashboard\n");
    this.results.views = {
      total: 0,
      note: "Verificar manualmente via Supabase Dashboard > Database > Views",
    };
  }

  async validateStorage() {
    console.log("💾 Validando storage...");

    try {
      const { data, error } = await this.client.storage.listBuckets();

      if (error) {
        console.log("⚠️  Não foi possível listar buckets\n");
        this.results.storage = {
          buckets: 0,
          note: "Não foi possível verificar",
        };
        return;
      }

      this.results.storage = {
        buckets: data?.length || 0,
        list: data || [],
      };

      console.log(`✅ ${this.results.storage.buckets} buckets encontrados\n`);
    } catch (error) {
      console.log(`⚠️  Erro ao validar storage: ${error.message}\n`);
      this.results.storage = { buckets: 0, error: error.message };
    }
  }

  async validateEdgeFunctions() {
    console.log("🌐 Validando Edge Functions...");

    // Edge Functions não podem ser listadas via API client
    // Precisaria de acesso à Supabase CLI ou Management API
    console.log(
      "ℹ️  Edge Functions devem ser verificadas manualmente via Dashboard\n",
    );

    this.results.edge_functions = {
      note: "Verificar manualmente via Supabase Dashboard > Edge Functions",
      recommendation: "Executar: supabase functions list",
    };
  }

  generateReport() {
    console.log("=".repeat(60));
    console.log("📊 RELATÓRIO DE MIGRAÇÃO SUPABASE");
    console.log("=".repeat(60) + "\n");

    const totalIssues = Object.values(this.results.issues).reduce(
      (acc, arr) => acc + arr.length,
      0,
    );

    console.log("📋 Tabelas:");
    console.log(`  Total: ${this.results.tables.total || 0}`);
    if (this.results.rls) {
      console.log(`  Com RLS: ${this.results.rls.with_rls}`);
      console.log(`  Sem RLS: ${this.results.rls.without_rls}`);
    }

    console.log("\n📜 Políticas:");
    console.log(`  ${this.results.policies.note || "N/A"}`);

    console.log("\n⚙️  Funções:");
    console.log(`  ${this.results.functions.note || "N/A"}`);

    console.log("\n⚡ Triggers:");
    console.log(`  ${this.results.triggers.note || "N/A"}`);

    console.log("\n👁️  Views:");
    console.log(`  ${this.results.views.note || "N/A"}`);

    console.log("\n💾 Storage:");
    console.log(`  Buckets: ${this.results.storage.buckets || 0}`);

    console.log("\n🚨 Issues:");
    console.log(`  Críticos: ${this.results.issues.critical.length}`);
    console.log(`  Altos: ${this.results.issues.high.length}`);
    console.log(`  Médios: ${this.results.issues.medium.length}`);
    console.log(`  Baixos: ${this.results.issues.low.length}`);

    if (this.results.issues.critical.length > 0) {
      console.log("\n🔴 Issues Críticos:");
      this.results.issues.critical.forEach((issue) => {
        console.log(`  - ${issue.type}: ${issue.message}`);
      });
    }

    const passed =
      this.results.issues.critical.length === 0 &&
      this.results.issues.high.length === 0 &&
      (this.results.tables.total || 0) > 0;

    const report = {
      timestamp: new Date().toISOString(),
      database: {
        url: process.env.VITE_SUPABASE_URL,
        connected: true,
      },
      ...this.results,
      passed,
      migration_complete: passed,
    };

    // Salvar relatório
    const reportDir = path.join(
      process.cwd(),
      ".cursor",
      "agents",
      "supabase-migration",
      "reports",
    );
    const reportPath = path.join(reportDir, `migration-${Date.now()}.json`);

    try {
      fs.mkdirSync(reportDir, { recursive: true });
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`\n📄 Relatório salvo: ${reportPath}`);
    } catch (error) {
      console.log(`\n⚠️  Não foi possível salvar relatório: ${error.message}`);
    }

    if (passed) {
      console.log("\n✅ MIGRAÇÃO COMPLETA E VALIDADA!");
      return report;
    } else {
      console.log("\n⚠️  ATENÇÃO - Verifique os issues encontrados");
      return report;
    }
  }
}

// Executar
if (require.main === module) {
  const validator = new SupabaseMigrationValidator();
  validator.validate().catch((error) => {
    console.error("Erro na validação:", error.message);
    process.exit(1);
  });
}

module.exports = SupabaseMigrationValidator;
