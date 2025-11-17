import fs from 'fs';

const REQUIRED = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_ENVIRONMENT',
  'VITE_MEILISEARCH_URL',
  'VITE_OLLAMA_URL'
];

const path = process.argv[2] || '.env.local';

console.log(`🔍 Validando arquivo: ${path}`);

if (!fs.existsSync(path)) {
  console.error(`❌ Arquivo ${path} não encontrado`);
  process.exit(1);
}

const txt = fs.readFileSync(path, 'utf8');
const lines = Object.fromEntries(
  txt
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#'))
    .map(l => l.split('='))
    .filter(a => a.length >= 2)
    .map(a => [a[0], a.slice(1).join('=')])
);

let ok = true;
const missing = [];

for (const k of REQUIRED) {
  if (!lines[k] || lines[k].trim() === '') {
    console.error(`❌ Variável obrigatória ausente ou vazia: ${k}`);
    missing.push(k);
    ok = false;
  } else {
    console.log(`✅ ${k}`);
  }
}

if (!ok) {
  console.error(`\n❌ Validação falhou. ${missing.length} variável(is) ausente(s).`);
  console.error(`\nVariáveis ausentes: ${missing.join(', ')}`);
  process.exit(1);
}

console.log(`\n✅ Todas as variáveis obrigatórias estão presentes!`);
process.exit(0);

