import { execSync } from 'node:child_process';

const COMMANDS = [
  { label: 'node', command: 'node -v' },
  { label: 'pnpm', command: 'pnpm -v' },
  { label: 'deno', command: 'deno -V' },
  { label: 'playwright', command: 'playwright --version' },
  { label: 'k6', command: 'k6 version' }
];

for (const { label, command } of COMMANDS) {
  try {
    const output = execSync(command, { stdio: 'pipe' }).toString().trim();
    console.log(`${label}: ${output}`);
  } catch (err) {
    console.error(`[FALTA] ${label} (${command})`);
  }
}

