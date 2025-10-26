// Show unmet dependencies for a given agent according to the execution plan
import { promises as fs } from 'fs';
import path from 'node:path';

async function readJson(file) {
  const raw = await fs.readFile(file, 'utf8');
  return JSON.parse(raw);
}

async function readStatus(id) {
  // Resolve full dir name from short id
  const { resolveAgentDirName, agentsRoot } = await import('./utils/agents.js');
  const dirName = await resolveAgentDirName(id) || id;
  const file = path.resolve(agentsRoot, dirName, 'STATUS.json');
  try {
    const raw = await fs.readFile(file, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { status: 'idle', progress: 0 };
  }
}

function findDependencies(plan, targetId) {
  // Build dependency map per the matrix in spec
  const matrix = new Map();
  const seqDeps = plan.sequential?.dependencies || [];
  // Base known dependencies from the spec
  matrix.set('05', ['03']);
  matrix.set('06', ['03']);
  matrix.set('08', ['01', '02', '03', '04', '05', '06', '07']);
  matrix.set('09', ['01', '02', '03', '04', '05', '06', '07', '08']);
  matrix.set('10', ['01', '02', '03', '04', '05', '06', '07', '08', '09']);
  // Ensure group 3 deps are respected
  const g3 = plan.parallel_groups?.find((g) => g.group_id === 3);
  if (g3?.dependencies?.length) {
    for (const id of g3.agents) {
      matrix.set(id, [...new Set([...(matrix.get(id) || []), ...g3.dependencies])]);
    }
  }
  // Sequential deps
  if (seqDeps?.length) {
    for (const id of plan.sequential.agents || []) {
      matrix.set(id, [...new Set([...(matrix.get(id) || []), ...seqDeps])]);
    }
  }
  return matrix.get(targetId) || [];
}

async function main() {
  const target = process.argv[2];
  if (!target) {
    console.error('Uso: node .cursor/scripts/check-dependencies.js <agentId>');
    process.exit(1);
  }
  const plan = await readJson(path.resolve(process.cwd(), '.cursor/config/execution-plan.json'));
  const deps = findDependencies(plan, target);
  if (!deps.length) {
    console.log(`Agente ${target} não possui dependências.`);
    return;
  }
  const statuses = await Promise.all(deps.map(async (id) => ({ id, s: await readStatus(id) })));
  const unmet = statuses.filter(({ s }) => !['done', 'completed', 'success'].includes(s.status));
  if (!unmet.length) {
    console.log(`Agente ${target} pronto. Todas dependências satisfeitas.`);
  } else {
    console.log(`Agente ${target} bloqueado por:`);
    for (const { id, s } of unmet) {
      console.log(` ❌ Agente ${id} - status: ${s.status} (${s.progress ?? 0}%)`);
    }
  }
}

main();


