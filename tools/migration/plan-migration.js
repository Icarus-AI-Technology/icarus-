import fs from 'node:fs';
import path from 'node:path';

const ALLOW = [
  'src',
  'public',
  'supabase',
  'types',
  'tools',
  'scripts',
  'package.json',
  'pnpm-lock.yaml',
  'vite.config.ts',
  'tsconfig.json',
  'tsconfig.app.json',
  'tsconfig.node.json',
  'tsconfig.paths.json',
  'tsconfig.typecheck.json',
  'tsconfig.patch.json',
  'playwright.config.ts'
];

const plan = { copy: [], ignore: [] };

for (const item of ALLOW) {
  const itemPath = path.resolve(process.cwd(), item);
  if (fs.existsSync(itemPath)) {
    plan.copy.push(item);
  } else {
    plan.ignore.push(item);
  }
}

fs.writeFileSync('migration-plan.json', JSON.stringify(plan, null, 2));
console.log('Plano gerado: migration-plan.json');

