// Show tail of orchestrator/agents logs, or agent-specific
import { promises as fs } from 'fs';
import path from 'node:path';

const logsDir = path.resolve(process.cwd(), '.cursor/logs');

async function main() {
  const agentId = process.argv[2];
  let file = path.join(logsDir, 'agents.log');
  if (agentId) {
    // optional: extend to per-agent logs in future; for now reuse single log
  }
  try {
    const raw = await fs.readFile(file, 'utf8');
    const lines = raw.trim().split(/\r?\n/);
    const last = lines.slice(-200).join('\n');
    console.log(last);
  } catch (e) {
    console.error('Sem logs ainda.');
  }
}

main();


