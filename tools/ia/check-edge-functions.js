#!/usr/bin/env node
// tools/ia/check-edge-functions.js
// Audita Edge Functions de IA no Supabase

import fs from "fs";
import path from "path";

console.log("\n🔍 IA-VALIDATOR - Auditoria Edge Functions\n");

const FUNCTIONS_DIR = path.join(process.cwd(), "supabase/functions");

function auditEdgeFunctions() {
  if (!fs.existsSync(FUNCTIONS_DIR)) {
    console.log("❌ Diretório supabase/functions/ não encontrado\n");
    console.log("💡 Ação: Criar estrutura de Edge Functions:");
    console.log("   supabase functions new ai-tutor-financeiro");
    console.log("   supabase functions new ai-assistente-opme");
    console.log("   supabase functions new ml-predicao-demanda\n");
    return { status: "error", functions: [] };
  }

  const allFunctions = fs.readdirSync(FUNCTIONS_DIR);
  const aiFunctions = allFunctions.filter((fn) => {
    const indexPath = path.join(FUNCTIONS_DIR, fn, "index.ts");
    if (!fs.existsSync(indexPath)) return false;

    const content = fs.readFileSync(indexPath, "utf8");
    return (
      content.includes("ai-") ||
      content.includes("ml-") ||
      content.includes("tutor") ||
      content.includes("assistente") ||
      content.includes("openai") ||
      content.includes("ollama")
    );
  });

  console.log(`📊 Funções Edge totais: ${allFunctions.length}`);
  console.log(`🤖 Funções IA detectadas: ${aiFunctions.length}\n`);

  if (aiFunctions.length === 0) {
    console.log("⚠️  Nenhuma Edge Function de IA encontrada!\n");
    console.log("💡 Ações recomendadas:");
    console.log("   1. Criar Edge Function para Tutor Financeiro");
    console.log("   2. Criar Edge Function para Assistente OPME");
    console.log("   3. Criar Edge Function para Análise Preditiva");
    console.log("   4. Migrar qualquer IA local para Edge Functions\n");
  } else {
    console.log("✅ Edge Functions IA encontradas:\n");
    aiFunctions.forEach((fn, idx) => {
      const indexPath = path.join(FUNCTIONS_DIR, fn, "index.ts");
      const content = fs.readFileSync(indexPath, "utf8");

      // Detecta tipo de IA
      let type = "unknown";
      if (content.includes("openai")) type = "OpenAI";
      else if (content.includes("ollama")) type = "Ollama (local)";
      else if (content.includes("claude")) type = "Anthropic";
      else if (content.includes("gemini")) type = "Google";

      // Verifica se usa localhost (PROIBIDO em prod)
      const hasLocalhost = content.includes("localhost");
      const icon = hasLocalhost ? "⚠️" : "✅";

      console.log(`${icon} ${idx + 1}. ${fn}`);
      console.log(`   Tipo: ${type}`);
      if (hasLocalhost) {
        console.log(`   🚨 ATENÇÃO: Usa localhost - BLOQUEAR em produção!`);
      }
      console.log("");
    });
  }

  // Verifica estrutura recomendada
  console.log("\n📋 Estrutura Recomendada de Edge Functions IA:");
  console.log("─".repeat(70));

  const recommended = [
    { name: "ai-tutor-financeiro", desc: "Tutor IA para módulo financeiro" },
    { name: "ai-tutor-opme", desc: "Assistente IA para gestão OPME" },
    {
      name: "ai-tutor-compliance",
      desc: "Tutor IA para compliance ANVISA/ANS",
    },
    { name: "ml-predicao-demanda", desc: "ML para previsão de demanda" },
    { name: "ml-analise-risco", desc: "ML para análise de risco financeiro" },
    { name: "ai-chatbot-icarus", desc: "Chatbot geral do Icarus" },
  ];

  recommended.forEach((rec, idx) => {
    const exists = aiFunctions.includes(rec.name);
    const icon = exists ? "✅" : "📋";
    console.log(`${icon} ${rec.name}: ${rec.desc}`);
  });

  console.log("─".repeat(70));

  const report = {
    timestamp: new Date().toISOString(),
    total_functions: allFunctions.length,
    ai_functions: aiFunctions.length,
    functions: aiFunctions,
    recommendations: recommended.filter((r) => !aiFunctions.includes(r.name)),
    status: aiFunctions.length >= 3 ? "good" : "needs_improvement",
  };

  // Salva relatório
  const outDir = path.join(".cursor", "agents", "ia-validator");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `edge-functions-audit-${Date.now()}.json`);
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2));

  console.log(`\n📄 Relatório salvo: ${outFile}\n`);

  return report;
}

const result = auditEdgeFunctions();

export default result;
export { auditEdgeFunctions };
