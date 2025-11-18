import fs from 'node:fs';
import path from 'node:path';

const ARG_ALIAS = {
  dev: '/Users/daxmeneghel/icarus-make/',
  prod: '/Users/daxmeneghel/icarus-v5.0/',
  '/users/daxmenghel/icarus-make/': '/Users/daxmeneghel/icarus-make/',
  '/users/daxmenghel/icarus-v5.0/': '/Users/daxmeneghel/icarus-v5.0/'
};

const readArg = name => {
  const raw = process.argv.find(arg => arg.startsWith(`--${name}=`));
  if (!raw) return undefined;
  const [, value] = raw.split('=');
  return value;
};

const expandPath = value => {
  if (!value) return undefined;
  const alias = ARG_ALIAS[value];
  return alias || value;
};

const unique = arr => [...new Set(arr.filter(Boolean))];

const resolveRoot = (candidates, label, { create } = {}) => {
  for (const candidate of candidates) {
    const resolved = path.resolve(candidate);
    if (fs.existsSync(resolved)) {
      return resolved;
    }
    if (create) {
      fs.mkdirSync(resolved, { recursive: true });
      return resolved;
    }
  }
  throw new Error(`Não foi possível resolver o caminho ${label}.`);
};

const fromCandidates = unique([
  expandPath(readArg('from')),
  expandPath(process.env.ICARUS_DEV_ROOT),
  '/Users/daxmeneghel/icarus-make/',
  '/users/daxmenghel/icarus-make/'
]);

const toCandidates = unique([
  expandPath(readArg('to')),
  expandPath(process.env.ICARUS_PROD_ROOT),
  '/Users/daxmeneghel/icarus-v5.0/',
  '/users/daxmenghel/icarus-v5.0/'
]);

const FROM = resolveRoot(fromCandidates, 'DEV');
const TO = resolveRoot(toCandidates, 'PROD', { create: true });

const planPath = path.resolve(process.cwd(), 'migration-plan.json');

if (!fs.existsSync(planPath)) {
  throw new Error('Arquivo migration-plan.json não encontrado. Execute plan-migration primeiro.');
}

const plan = JSON.parse(fs.readFileSync(planPath, 'utf8'));

const copyPath = (src, dst) => {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dst, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyPath(path.join(src, entry), path.join(dst, entry));
    }
    return;
  }

  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
};

for (const relPath of plan.copy || []) {
  const source = path.join(FROM, relPath);
  if (!fs.existsSync(source)) {
    console.warn(`[AVISO] ${relPath} não encontrado em ${FROM}`);
    continue;
  }
  const target = path.join(TO, relPath);
  copyPath(source, target);
  console.log(`Copiado: ${relPath}`);
}

console.log('Migração seletiva concluída.');

