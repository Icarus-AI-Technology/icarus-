// Simple logger that writes to .cursor/logs and console
import { promises as fs } from 'fs';
import path from 'node:path';

export async function log(message, options = {}) {
  const { level = 'info' } = options;
  const line = [new Date().toISOString(), level, message].join(' ') + '\n';
  const logsDir = path.resolve(process.cwd(), '.cursor/logs');
  await fs.mkdir(logsDir, { recursive: true });
  const logFile = path.join(logsDir, 'agents.log');
  await fs.appendFile(logFile, line);
  console.log(line.trim());
}
