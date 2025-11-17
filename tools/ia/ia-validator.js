#!/usr/bin/env node
// tools/ia/ia-validator.js
// Valida topologia de IA (dev/prod) - ZERO tolerância para localhost em produção

import fs from "fs";
import path from "path";

console.log("\n🤖 IA-VALIDATOR - Validação de Topologia IA\n");

const HARD_FAILS_PROD = [
  "http://localhost",
  "http://127.0.0.1",
  "ws://localhost",
  "localhost:11434", // Ollama local
  "localhost:7700", // Meilisearch local
  "localhost:8000", // PostHog local
];

const ENV_MODE = process.env.NODE_ENV || "development";

function validateTopology() {
  console.log(`📍 Modo: ${ENV_MODE.toUpperCase()}\n`);

  const violations = [];
  const warnings = [];

  // Verifica arquivos de configuração
  const configFiles = [
    ".env",
    ".env.production",
    "src/lib/config.ts",
    "src/lib/integrations/ollama-client.ts",
    "supabase/functions/_shared/config.ts",
  ];

  configFiles.forEach((file) => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf8");

      // Em PRODUÇÃO, falha hard se encontrar localhost
      if (ENV_MODE === "production") {
        HARD_FAILS_PROD.forEach((forbidden) => {
          if (content.includes(forbidden)) {
            violations.push({
              severity: "CRITICO",
              file,
              issue: `Endpoint local "${forbidden}" detectado em PRODUÇÃO`,
              action: "BLOQUEAR DEPLOY - Substituir por endpoint cloud",
            });
          }
        });
      }

      // Verifica Ollama em produção (sempre proibido)
      if (content.includes("ollama") && content.includes("localhost")) {
        const severity = ENV_MODE === "production" ? "CRITICO" : "warning";
        const item = {
          severity,
          file,
          issue: "Ollama local detectado",
          action:
            "Em prod: usar Supabase Edge Functions; em dev: OK para testes",
        };

        if (ENV_MODE === "production") {
          violations.push(item);
        } else {
          warnings.push(item);
        }
      }
    }
  });

  // Verifica Edge Functions (devem estar em /supabase/functions/)
  const edgeFunctionsDir = path.join(process.cwd(), "supabase/functions");
  if (fs.existsSync(edgeFunctionsDir)) {
    const functions = fs.readdirSync(edgeFunctionsDir);
    const iaFunctions = functions.filter(
      (f) =>
        f.includes("ai-") ||
        f.includes("ml-") ||
        f.includes("tutor-") ||
        f.includes("assistente-"),
    );

    console.log(`✅ Edge Functions IA detectadas: ${iaFunctions.length}`);
    iaFunctions.forEach((fn) => console.log(`   - ${fn}`));
  } else {
    warnings.push({
      severity: "medio",
      file: "supabase/functions/",
      issue: "Diretório de Edge Functions não encontrado",
      action: "Criar estrutura de Edge Functions para IAs nativas",
    });
  }

  // Relatório
  console.log("\n" + "=".repeat(70));

  if (violations.length === 0) {
    console.log("✅ TOPOLOGIA IA VÁLIDA\n");
    console.log("✓ Nenhuma violação crítica detectada");
    console.log(`✓ Modo ${ENV_MODE}: Conforme política`);

    if (ENV_MODE === "production") {
      console.log("✓ PRODUÇÃO: Zero endpoints locais ✓");
    } else {
      console.log("✓ DEV: Localhost permitido para testes");
    }
  } else {
    console.log("🔴 VIOLAÇÕES CRÍTICAS DETECTADAS\n");
    violations.forEach((v, i) => {
      console.log(`${i + 1}. [${v.severity}] ${v.file}`);
      console.log(`   Issue: ${v.issue}`);
      console.log(`   Ação: ${v.action}\n`);
    });

    if (ENV_MODE === "production") {
      console.log(
        "🚨 DEPLOY BLOQUEADO - Corrigir violações antes de prosseguir!",
      );
      process.exit(1);
    }
  }

  if (warnings.length > 0) {
    console.log("\n⚠️  AVISOS:\n");
    warnings.forEach((w, i) => {
      console.log(`${i + 1}. [${w.severity}] ${w.file}`);
      console.log(`   Issue: ${w.issue}`);
      console.log(`   Ação: ${w.action}\n`);
    });
  }

  // Recomendações
  console.log("\n💡 TOPOLOGIA RECOMENDADA:");
  console.log("─".repeat(70));
  console.log("DEV:");
  console.log("  • Ollama: http://localhost:11434 (OK)");
  console.log("  • Meilisearch: http://localhost:7700 (OK)");
  console.log("  • Supabase: http://localhost:54321 (OK)");
  console.log("\nPROD:");
  console.log("  • Ollama: DISABLED (usar Edge Functions)");
  console.log("  • Meilisearch: Cloud apenas");
  console.log("  • Supabase: https://<project>.supabase.co");
  console.log("─".repeat(70));

  const report = {
    timestamp: new Date().toISOString(),
    mode: ENV_MODE,
    violations: violations.length,
    warnings: warnings.length,
    status: violations.length === 0 ? "PASS" : "FAIL",
    details: { violations, warnings },
  };

  // Salva relatório
  const outDir = path.join(".cursor", "agents", "ia-validator");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `topology-validation-${Date.now()}.json`);
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2));

  console.log(`\n📄 Relatório salvo: ${outFile}\n`);

  return report;
}

// Executa validação
const result = validateTopology();

export default result;
export { validateTopology };
