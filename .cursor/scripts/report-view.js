// View agent report or final consolidated report
import { promises as fs } from 'fs';
import path from 'node:path';
import { resolveAgentDirName, agentsRoot } from './utils/agents.js';

async function main() {
  const id = process.argv[2];
  if (!id) {
    const final = path.resolve(process.cwd(), '.cursor/reports/FINAL-REPORT.md');
    try {
      const raw = await fs.readFile(final, 'utf8');
      console.log(raw);
    } catch {
      console.error('Relatório final não encontrado. Rode: npm run report:generate');
      process.exit(1);
    }
    return;
  }
  const dirName = await resolveAgentDirName(id);
  if (!dirName) {
    console.error('Agente não encontrado:', id);
    process.exit(1);
  }
  const file = path.join(agentsRoot, dirName, 'REPORT.md');
  try {
    const raw = await fs.readFile(file, 'utf8');
    console.log(raw);
  } catch {
    console.error('Relatório não encontrado para agente', dirName);
    process.exit(1);
  }
}

main();


