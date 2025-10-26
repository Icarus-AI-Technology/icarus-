// Run a specific agent by id (supports "01" or "01-design-system")
import { promises as fs } from 'fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { log } from './utils/logger.js';
import { updateStatus } from './utils/status-updater.js';
import { resolveAgentDirName, agentsRoot } from './utils/agents.js';

export async function runAgent(agentId) {
  const dirName = await resolveAgentDirName(agentId);
  if (!dirName) {
    await log('Agente não encontrado: ' + agentId, { level: 'error' });
    return;
  }
  const agentDir = path.resolve(agentsRoot, dirName);
  await updateStatus(dirName, { status: 'running' });
  await log('[' + dirName + '] Início');
  await new Promise((r) => setTimeout(r, 50));
  await updateStatus(dirName, { status: 'done', progress: 100 });
  await log('[' + dirName + '] Concluído');
}

// CLI guard: run only when invoked directly
const mainModuleHref = pathToFileURL(process.argv[1] || '').href;
if (import.meta.url === mainModuleHref) {
  const agentId = process.argv[2];
  if (!agentId) {
    console.error('Uso: node .cursor/scripts/run-agent.js <agent-id>');
    process.exit(1);
  }
  runAgent(agentId).catch(async (e) => {
    await log('Falha ao executar agente: ' + (e?.message || e), { level: 'error' });
    process.exitCode = 1;
  });
}
