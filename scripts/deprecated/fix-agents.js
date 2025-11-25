/* ICARUS HOTFIX AGENT

   Target: .cursor/agents.json

   Issue: Missing 'entry: true' point.

*/

import fs from "fs";
import path from "path";

const configPath = path.join(process.cwd(), ".cursor/agents.json");

console.log("🚑 Icarus Hotfix: Diagnosticando agentes...");

if (!fs.existsSync(configPath)) {
  console.error("❌ Erro: Arquivo .cursor/agents.json não encontrado.");
  process.exit(1);
}

try {
  // 1. Ler o Arquivo
  const rawData = fs.readFileSync(configPath, "utf8");
  const config = JSON.parse(rawData);

  if (!config.agents || !Array.isArray(config.agents)) {
    throw new Error("Estrutura do JSON inválida (array 'agents' ausente).");
  }

  // 2. Verificar se existe entry point
  const currentEntry = config.agents.find((a) => a.entry === true);

  if (currentEntry) {
    console.log(`✅ Sistema saudável. Entry point atual: ${currentEntry.name}`);
  } else {
    console.log(
      "⚠️ ALERTA CRÍTICO: Nenhum entry point definido. Sistema de Agentes quebrado.",
    );

    // 3. Aplicar Correção (Define o primeiro agente como Entry)
    // Geralmente o primeiro da lista é o Orquestrador/Principal
    if (config.agents.length > 0) {
      config.agents[0].entry = true;
      console.log(
        `🛠️ CORRIGIDO: Agente '${config.agents[0].name}' definido como entry: true.`,
      );

      // Salvar arquivo
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      console.log("💾 Arquivo .cursor/agents.json atualizado com sucesso.");
    } else {
      console.error("❌ Erro: A lista de agentes está vazia.");
    }
  }
} catch (error) {
  console.error("❌ Falha na execução do Hotfix:", error.message);
}

