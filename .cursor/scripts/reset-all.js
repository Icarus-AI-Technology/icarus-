// Reset statuses for all agents to idle/0%
import { promises as fs } from 'fs';
import path from 'node:path';

const agentsRoot = path.resolve(process.cwd(), '.cursor/agents');

async function resetStatus(file) {
  const now = new Date().toISOString();
  const next = { status: 'idle', progress: 0, updatedAt: now, notes: [] };
  await fs.writeFile(file, JSON.stringify(next, null, 2) + '\n');
}

async function main() {
  const items = await fs.readdir(agentsRoot, { withFileTypes: true });
  const dirs = items.filter((d) => d.isDirectory());
  for (const d of dirs) {
    const f = path.join(agentsRoot, d.name, 'STATUS.json');
    try {
      await resetStatus(f);
      console.log('Reset', d.name);
    } catch {
      // ignore
    }
  }
}

main();


