// Reset status for a specific agent
import { promises as fs } from 'fs';
import path from 'node:path';
import { resolveAgentDirName, agentsRoot } from './utils/agents.js';

async function main() {
  const id = process.argv[2];
  if (!id) {
    console.error('Uso: node .cursor/scripts/reset-agent.js <agentId>');
    process.exit(1);
  }
  const dirName = await resolveAgentDirName(id);
  if (!dirName) {
    console.error('Agente não encontrado:', id);
    process.exit(1);
  }
  const file = path.join(agentsRoot, dirName, 'STATUS.json');
  const now = new Date().toISOString();
  const next = { status: 'idle', progress: 0, updatedAt: now, notes: [] };
  await fs.writeFile(file, JSON.stringify(next, null, 2) + '\n');
  console.log('Reset', dirName);
}

main();


