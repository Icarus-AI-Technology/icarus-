import fs from 'fs';

const mode = (
  process.argv.find(a => a.startsWith('--mode=')) || '--mode=development'
).split('=')[1];

console.log(`🔧 Gerando arquivo .env para modo: ${mode}`);

const base = {
  VITE_ENVIRONMENT: mode,
  VITE_MEILISEARCH_URL: 'http://localhost:7700',
  VITE_OLLAMA_URL: 'http://localhost:11434',
  VITE_SMTP_HOST: 'localhost',
  VITE_SMTP_PORT: '8025'
};

const prod = {
  VITE_SUPABASE_URL: 'https://<your-project>.supabase.co',
  VITE_SUPABASE_ANON_KEY: '<your-anon-key>',
  VITE_MEILISEARCH_URL: 'https://search.your-domain.com',
  VITE_OLLAMA_URL: 'https://ollama.your-domain.com'
};

const dev = {
  VITE_SUPABASE_URL: 'http://localhost:54321',
  VITE_SUPABASE_ANON_KEY: '<local-anon-key>'
};

const obj = mode === 'production' ? { ...base, ...prod } : { ...base, ...dev };
const body = Object.entries(obj).map(([k, v]) => `${k}=${v}`).join('\n');
const filename = mode === 'production' ? '.env.prod' : '.env.local';

fs.writeFileSync(filename, body);

console.log(`✅ Arquivo ${filename} gerado com sucesso!`);
console.log(`\n📝 Conteúdo:\n${body}\n`);
console.log(`⚠️  ATENÇÃO: Substitua os valores placeholder (<...>) pelos valores reais.`);

