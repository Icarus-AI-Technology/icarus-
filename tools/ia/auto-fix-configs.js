#!/usr/bin/env node
// tools/ia/auto-fix-configs.js
// Auto-corrige configurações de IA para conformidade prod

import fs from "fs";
import path from "path";

console.log("\n🔧 IA-VALIDATOR - Auto-Correção de Configs\n");

const ENV_MODE = process.env.NODE_ENV || "development";

function autoFixConfigs() {
  console.log(`📍 Modo: ${ENV_MODE.toUpperCase()}\n`);

  const fixes = [];

  // 1. Corrige .env.production (se existir)
  const envProdPath = path.join(process.cwd(), ".env.production");
  if (fs.existsSync(envProdPath)) {
    let content = fs.readFileSync(envProdPath, "utf8");
    let modified = false;

    // Remove qualquer referência a localhost
    if (content.includes("localhost")) {
      console.log("🔧 Corrigindo .env.production...");
      content = content.replace(/localhost:11434/g, "OLLAMA_DISABLED_IN_PROD");
      content = content.replace(/localhost:7700/g, "MEILISEARCH_CLOUD_URL");
      content = content.replace(/localhost:8000/g, "POSTHOG_CLOUD_URL");
      content = content.replace(/localhost:54321/g, "SUPABASE_PROJECT_URL");
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(envProdPath, content);
      fixes.push({
        file: ".env.production",
        action: "Removidas referências localhost",
        status: "fixed",
      });
      console.log("   ✅ .env.production corrigido\n");
    }
  } else {
    console.log("💡 Criar .env.production com configurações cloud:");
    const prodEnv = `# Produção - ZERO localhost
VITE_OLLAMA_ENABLED=false
VITE_MEILISEARCH_URL=https://your-project.meilisearch.io
VITE_POSTHOG_URL=https://app.posthog.com
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Edge Functions (IA Nativa)
VITE_EDGE_FUNCTIONS_URL=https://your-project.supabase.co/functions/v1

# Flags de Feature
VITE_ENABLE_LOCAL_AI=false
VITE_ENABLE_OLLAMA=false
`;

    fs.writeFileSync(envProdPath, prodEnv);
    fixes.push({
      file: ".env.production",
      action: "Arquivo criado com configurações seguras",
      status: "created",
    });
    console.log("   ✅ .env.production criado\n");
  }

  // 2. Verifica src/lib/config.ts
  const configPath = path.join(process.cwd(), "src/lib/config.ts");
  if (fs.existsSync(configPath)) {
    let content = fs.readFileSync(configPath, "utf8");

    // Verifica se tem guard para produção
    if (!content.includes("NODE_ENV") || !content.includes("production")) {
      console.log("⚠️  config.ts não tem guard de produção!");
      fixes.push({
        file: "src/lib/config.ts",
        action:
          "MANUAL: Adicionar guard NODE_ENV para bloquear localhost em prod",
        status: "needs_manual",
      });
    } else {
      console.log("✅ config.ts tem guard de produção\n");
    }
  }

  // 3. Cria arquivo de validação CI/CD
  const ciValidationScript = `#!/bin/bash
# CI/CD Validation - Bloqueia deploy se detectar localhost em produção

set -e

echo "🔍 Validando configurações de IA para produção..."

if [ "$NODE_ENV" = "production" ]; then
  echo "📍 Modo PRODUÇÃO - Validando endpoints..."
  
  # Verifica .env.production
  if grep -q "localhost" .env.production 2>/dev/null; then
    echo "🚨 ERRO: localhost detectado em .env.production"
    echo "   Ação: Substituir por endpoints cloud"
    exit 1
  fi
  
  # Verifica arquivos de config
  if grep -r "localhost:11434" src/ 2>/dev/null; then
    echo "🚨 ERRO: Ollama local detectado em src/"
    echo "   Ação: Usar Edge Functions em produção"
    exit 1
  fi
  
  echo "✅ Validação passou - Nenhum endpoint local em produção"
else
  echo "📍 Modo DEV - Localhost permitido"
fi

exit 0
`;

  const ciScriptPath = path.join(
    process.cwd(),
    "scripts/ci-validate-ia-topology.sh",
  );
  fs.mkdirSync(path.dirname(ciScriptPath), { recursive: true });
  fs.writeFileSync(ciScriptPath, ciValidationScript);
  fs.chmodSync(ciScriptPath, "755");

  fixes.push({
    file: "scripts/ci-validate-ia-topology.sh",
    action: "Script CI/CD criado",
    status: "created",
  });
  console.log("✅ Script CI/CD de validação criado\n");

  // Relatório
  console.log("=".repeat(70));
  console.log("📊 RESUMO DE CORREÇÕES:\n");

  fixes.forEach((fix, idx) => {
    const icon =
      fix.status === "fixed" ? "🔧" : fix.status === "created" ? "✨" : "⚠️";
    console.log(`${icon} ${idx + 1}. ${fix.file}`);
    console.log(`   ${fix.action}`);
    console.log("");
  });

  console.log("=".repeat(70));
  console.log("\n💡 PRÓXIMOS PASSOS:\n");
  console.log("1. Revisar .env.production manualmente");
  console.log("2. Adicionar scripts/ci-validate-ia-topology.sh ao seu CI/CD");
  console.log("3. Testar build de produção: NODE_ENV=production npm run build");
  console.log("4. Garantir que todas as IAs usem Edge Functions em prod\n");

  const report = {
    timestamp: new Date().toISOString(),
    mode: ENV_MODE,
    fixes_applied: fixes.length,
    fixes,
    status: "completed",
  };

  // Salva relatório
  const outDir = path.join(".cursor", "agents", "ia-validator");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `auto-fix-report-${Date.now()}.json`);
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2));

  console.log(`📄 Relatório salvo: ${outFile}\n`);

  return report;
}

const result = autoFixConfigs();

export default result;
export { autoFixConfigs };
