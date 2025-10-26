// Orchestrator: runs agents based on parallel groups and sequential phase
import { promises as fs } from 'fs';
import path from 'node:path';
import { log } from './utils/logger.js';

async function readPlan() {
  const file = path.resolve(process.cwd(), '.cursor/config/execution-plan.json');
  const raw = await fs.readFile(file, 'utf8');
  return JSON.parse(raw);
}

async function readStatus(agentId) {
  // Resolve full dir name if short id given (e.g. "01" -> "01-design-system")
  const { resolveAgentDirName, agentsRoot } = await import('./utils/agents.js');
  const dirName = await resolveAgentDirName(agentId) || agentId;
  const statusFile = path.join(agentsRoot, dirName, 'STATUS.json');
  try {
    const raw = await fs.readFile(statusFile, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { status: 'pending', progress: 0 };
  }
}

function isCompleted(status) {
  return status === 'done' || status === 'completed' || status === 'success';
}

async function canStart(agentId, dependencies) {
  if (!dependencies || dependencies.length === 0) return true;
  for (const dep of dependencies) {
    const s = await readStatus(dep);
    if (!isCompleted(s.status)) return false;
  }
  return true;
}

async function runAgentsParallel(agentIds) {
  const { runAgent } = await import('./run-agent.js');
  await Promise.all(agentIds.map(async (id) => {
    try {
      await runAgent(id);
    } catch (err) {
      await log('Falha no agente ' + id + ': ' + (err?.message || err), { level: 'error' });
    }
  }));
}

async function waitForDependencies(depIds, tickMs = 500) {
  if (!depIds || depIds.length === 0) return;
  // Simple polling; agents are short-running by design here
  // In a real system we would use FS watchers or IPC
  while (true) {
    const statuses = await Promise.all(depIds.map((d) => readStatus(d)));
    const allDone = statuses.every((s) => isCompleted(s.status));
    if (allDone) return;
    await new Promise((r) => setTimeout(r, tickMs));
  }
}

async function main() {
  const plan = await readPlan();
  await log('Iniciando Orquestração (ICARUS v5.0)...');

  // Grupo 1
  const g1 = plan.parallel_groups?.find((g) => g.group_id === 1);
  if (g1) {
    await log('Executando Grupo 1 em paralelo: ' + g1.agents.join(', '));
    await runAgentsParallel(g1.agents);
  }

  // Grupo 2
  const g2 = plan.parallel_groups?.find((g) => g.group_id === 2);
  if (g2) {
    await log('Executando Grupo 2 em paralelo: ' + g2.agents.join(', '));
    await runAgentsParallel(g2.agents);
  }

  // Grupo 3 (aguarda dependências do plano)
  const g3 = plan.parallel_groups?.find((g) => g.group_id === 3);
  if (g3) {
    const deps = Array.isArray(g3.dependencies) ? g3.dependencies : [];
    await log('Aguardando dependências do Grupo 3: ' + (deps.join(', ') || 'nenhuma'));
    await waitForDependencies(deps);
    await log('Executando Grupo 3 em paralelo: ' + g3.agents.join(', '));
    await runAgentsParallel(g3.agents);
  }

  // Sequencial (08 -> 09 -> 10)
  if (plan.sequential?.agents?.length) {
    const seqDeps = Array.isArray(plan.sequential.dependencies) ? plan.sequential.dependencies : [];
    if (seqDeps.length) {
      await log('Aguardando dependências da fase sequencial: ' + seqDeps.join(', '));
      await waitForDependencies(seqDeps);
    }
    const { runAgent } = await import('./run-agent.js');
    for (const id of plan.sequential.agents) {
      await log('Executando sequencial: ' + id);
      await runAgent(id);
    }
  }

  await log('Orquestração concluída.');
}

main().catch(async (e) => {
  await log('Falha crítica: ' + (e?.message || e), { level: 'error' });
  process.exitCode = 1;
});
