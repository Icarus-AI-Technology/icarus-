import fs from 'node:fs';
import path from 'node:path';

const REQUIRED = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_ENVIRONMENT',
  'VITE_MEILISEARCH_URL',
  'VITE_OLLAMA_URL'
];

const targetArg = process.argv[2];
const targetPath = path.resolve(process.cwd(), targetArg || '.env.local');
const exists = fs.existsSync(targetPath);
const txt = exists ? fs.readFileSync(targetPath, 'utf8') : '';

const lines = Object.fromEntries(
  txt
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))
    .map(line => {
      const [key, ...rest] = line.split('=');
      return [key, rest.join('=').trim()];
    })
    .filter(([key]) => key)
);

let ok = true;

for (const key of REQUIRED) {
  if (!lines[key]) {
    console.error(`Falta ${key}`);
    ok = false;
  }
}

if (!ok) {
  process.exit(1);
}

console.log(`Ambiente válido: ${targetPath}`);
process.exit(0);

