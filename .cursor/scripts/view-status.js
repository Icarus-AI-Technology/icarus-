// Pretty-print status of all agents
import { promises as fs } from 'fs';
import path from 'node:path';

const agentsRoot = path.resolve(process.cwd(), '.cursor/agents');

function pad(str, len) {
  str = String(str ?? '');
  return str + ' '.repeat(Math.max(0, len - str.length));
}

async function loadStatus(agentDir) {
  const statusFile = path.join(agentDir, 'STATUS.json');
  try {
    const raw = await fs.readFile(statusFile, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { status: 'idle', progress: 0 };
  }
}

async function main() {
  const items = await fs.readdir(agentsRoot, { withFileTypes: true });
  const agentDirs = items.filter((d) => d.isDirectory());
  const rows = [];
  for (const dirent of agentDirs) {
    const id = dirent.name.match(/^\d+/)?.[0] || dirent.name;
    const status = await loadStatus(path.join(agentsRoot, dirent.name));
    rows.push({ id, name: dirent.name, status: status.status ?? 'idle', progress: String(status.progress ?? 0) + '%' });
  }
  rows.sort((a, b) => a.id.localeCompare(b.id));

  console.log('');
  console.log('ICARUS v5.0 - Status dos Agentes');
  console.log('');
  console.log(pad('ID', 4) + pad('Agente', 24) + pad('Status', 10) + pad('Progresso', 10));
  console.log('-'.repeat(48));
  for (const r of rows) {
    console.log(pad(r.id, 4) + pad(r.name, 24) + pad(r.status, 10) + pad(r.progress, 10));
  }
}

main().catch((e) => {
  console.error('Falha ao listar status:', e?.message || e);
  process.exit(1);
});


