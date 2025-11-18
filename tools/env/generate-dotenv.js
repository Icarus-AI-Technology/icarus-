import fs from 'node:fs';
import path from 'node:path';

const modeArg = process.argv.find(arg => arg.startsWith('--mode=')) || '--mode=development';
const mode = modeArg.split('=')[1] || 'development';

const base = {
  VITE_ENVIRONMENT: mode,
  VITE_MEILISEARCH_URL: 'http://localhost:7700',
  VITE_OLLAMA_URL: 'http://localhost:11434'
};

const prod = {
  VITE_SUPABASE_URL: 'https://<prod>.supabase.co',
  VITE_SUPABASE_ANON_KEY: '<anon>'
};

const payload = mode === 'production' ? { ...base, ...prod } : base;
const body = Object.entries(payload)
  .map(([k, v]) => `${k}=${v}`)
  .join('\n');

const filename = mode === 'production' ? '.env.prod' : '.env.local';
const outPath = path.resolve(process.cwd(), filename);

fs.writeFileSync(outPath, body);
console.log(`Arquivo ${filename} gerado para o modo ${mode}.`);

