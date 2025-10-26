import { promises as fs } from 'fs';
import path from 'node:path';

const agentsRoot = path.resolve(process.cwd(), '.cursor/agents');

export async function listAgentDirs() {
  const entries = await fs.readdir(agentsRoot, { withFileTypes: true });
  return entries.filter((e) => e.isDirectory()).map((e) => e.name);
}

export async function resolveAgentDirName(agentIdOrName) {
  // If full name provided and exists, return it
  const fullPath = path.join(agentsRoot, agentIdOrName);
  const exists = await fs.stat(fullPath).then(() => true).catch(() => false);
  if (exists) return agentIdOrName;
  // Otherwise, find by prefix like "01-"
  const dirs = await listAgentDirs();
  const match = dirs.find((d) => d.startsWith(agentIdOrName + '-'));
  return match || null;
}

export async function getStatusFilePath(agentIdOrName) {
  const dirName = await resolveAgentDirName(agentIdOrName);
  if (!dirName) return null;
  return path.join(agentsRoot, dirName, 'STATUS.json');
}

export async function getReportFilePath(agentIdOrName) {
  const dirName = await resolveAgentDirName(agentIdOrName);
  if (!dirName) return null;
  return path.join(agentsRoot, dirName, 'REPORT.md');
}

export { agentsRoot };


