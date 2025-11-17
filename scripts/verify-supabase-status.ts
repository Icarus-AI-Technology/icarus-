#!/usr/bin/env tsx

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, "..");

console.log("🔍 Verificando status do Supabase...\n");

// Ler variáveis de ambiente
const envPath = path.join(projectRoot, ".env.local");
let supabaseUrl = process.env.VITE_SUPABASE_URL;
let supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl && fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.+)/);
  const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/);

  if (urlMatch) supabaseUrl = urlMatch[1].trim();
  if (keyMatch) supabaseKey = keyMatch[1].trim();
}

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "❌ Variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não configuradas!",
  );
  console.error("   Configure no arquivo .env.local");
  process.exit(1);
}

console.log(`📡 Supabase URL: ${supabaseUrl}`);

const supabase = createClient(supabaseUrl, supabaseKey);

const report: any = {
  timestamp: new Date().toISOString(),
  url: supabaseUrl,
  checks: {},
};

// 1. Verificar conexão básica
try {
  console.log("1️⃣  Testando conexão básica...");
  const { data, error } = await supabase
    .from("usuarios")
    .select("count")
    .limit(1);

  if (error && error.code !== "PGRST116") {
    // PGRST116 = tabela não existe, mas conexão funcionou
    if (error.code !== "42P01") {
      // 42P01 = relation does not exist
      throw error;
    }
  }

  report.checks.connection = { status: "OK", message: "Conexão estabelecida" };
  console.log("   ✅ Conexão estabelecida");
} catch (error: any) {
  report.checks.connection = { status: "ERROR", message: error.message };
  console.error("   ❌ Erro na conexão:", error.message);
}

// 2. Verificar migrações aplicadas
try {
  console.log("2️⃣  Verificando migrações...");
  const migrationsDir = path.join(projectRoot, "supabase", "migrations");

  if (fs.existsSync(migrationsDir)) {
    const migrations = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    report.checks.migrations = {
      status: "OK",
      total: migrations.length,
      files: migrations,
    };

    console.log(
      `   ✅ ${migrations.length} arquivo(s) de migração encontrado(s)`,
    );
  } else {
    report.checks.migrations = {
      status: "WARN",
      message: "Diretório de migrações não encontrado",
    };
    console.log("   ⚠️  Diretório de migrações não encontrado");
  }
} catch (error: any) {
  report.checks.migrations = { status: "ERROR", message: error.message };
  console.error("   ❌ Erro ao verificar migrações:", error.message);
}

// 3. Verificar Edge Functions
try {
  console.log("3️⃣  Verificando Edge Functions...");
  const functionsDir = path.join(projectRoot, "supabase", "functions");

  if (fs.existsSync(functionsDir)) {
    const functions = fs.readdirSync(functionsDir).filter((item) => {
      const itemPath = path.join(functionsDir, item);
      return fs.statSync(itemPath).isDirectory();
    });

    report.checks.edgeFunctions = {
      status: "OK",
      total: functions.length,
      functions,
    };

    console.log(`   ✅ ${functions.length} Edge Function(s) encontrada(s)`);
  } else {
    report.checks.edgeFunctions = {
      status: "WARN",
      message: "Diretório de Edge Functions não encontrado",
    };
    console.log("   ⚠️  Diretório de Edge Functions não encontrado");
  }
} catch (error: any) {
  report.checks.edgeFunctions = { status: "ERROR", message: error.message };
  console.error("   ❌ Erro ao verificar Edge Functions:", error.message);
}

// 4. Verificar Storage
try {
  console.log("4️⃣  Verificando Storage...");
  const { data: buckets, error } = await supabase.storage.listBuckets();

  if (error) throw error;

  report.checks.storage = {
    status: "OK",
    buckets: buckets?.map((b) => b.name) || [],
  };

  console.log(`   ✅ ${buckets?.length || 0} bucket(s) configurado(s)`);
} catch (error: any) {
  report.checks.storage = { status: "ERROR", message: error.message };
  console.error("   ❌ Erro ao verificar Storage:", error.message);
}

// Salvar relatório
const reportPath = path.join(projectRoot, "supabase-status-report.json");
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log(`\n📊 Relatório salvo: ${reportPath}`);

// Determinar status geral
const hasErrors = Object.values(report.checks).some(
  (check: any) => check.status === "ERROR",
);

if (hasErrors) {
  console.error("\n❌ Verificação do Supabase concluída com erros!");
  process.exit(1);
}

console.log("\n✅ Verificação do Supabase concluída com sucesso!");
process.exit(0);
