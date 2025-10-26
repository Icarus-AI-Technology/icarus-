// Update STATUS.json for an agent
import { promises as fs } from 'fs';
import path from 'node:path';

export async function updateStatus(agentId, patch) {
  const statusFile = path.resolve(process.cwd(), '.cursor/agents', agentId, 'STATUS.json');
  const now = new Date().toISOString();
  let current = { status: 'pending', progress: 0, updatedAt: now, notes: [] };
  try {
    const raw = await fs.readFile(statusFile, 'utf8');
    current = JSON.parse(raw);
  } catch { /* ignore */ }
  const next = { ...current, ...patch, updatedAt: now };
  await fs.writeFile(statusFile, JSON.stringify(next, null, 2) + '\n');
  return next;
}
