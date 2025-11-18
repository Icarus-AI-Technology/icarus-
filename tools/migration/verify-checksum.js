import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

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
  return ARG_ALIAS[value] || value;
};

const unique = arr => [...new Set(arr.filter(Boolean))];

const targetCandidates = unique([
  expandPath(readArg('root')),
  expandPath(process.env.ICARUS_PROD_ROOT),
  '/Users/daxmeneghel/icarus-v5.0/',
  '/users/daxmenghel/icarus-v5.0/'
]);

const ROOT = (() => {
  for (const candidate of targetCandidates) {
    const resolved = path.resolve(candidate);
    if (fs.existsSync(resolved)) {
      return resolved;
    }
  }
  throw new Error('Não foi possível localizar o diretório alvo para o checksum.');
})();

const IGNORE = ['node_modules', '.git', '.next', '.turbo'];

const shouldIgnore = filePath => IGNORE.some(part => filePath.includes(`/${part}/`));

const hash = crypto.createHash('sha256');

const walk = dir => {
  for (const entry of fs.readdirSync(dir)) {
    const absolute = path.join(dir, entry);
    const stat = fs.statSync(absolute);
    if (stat.isDirectory()) {
      if (!shouldIgnore(absolute)) {
        walk(absolute);
      }
      continue;
    }
    if (shouldIgnore(path.dirname(absolute))) {
      continue;
    }
    hash.update(path.relative(ROOT, absolute));
    hash.update(fs.readFileSync(absolute));
  }
};

walk(ROOT);

console.log('SHA256:', hash.digest('hex'));

