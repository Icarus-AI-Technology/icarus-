/**
 * tools/add-package-merge-script.mjs
 * Injects the "package:merge" npm script into package.json (creates backup).
 * Usage:
 *   node tools/add-package-merge-script.mjs
 *   node tools/add-package-merge-script.mjs --name package:merge --cmd "node tools/merge-package.mjs"
 */
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const getArg = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i+1] : def;
};

const pkgPath = 'package.json';
const scriptName = getArg('--name', 'package:merge');
const scriptCmd  = getArg('--cmd', 'node tools/merge-package.mjs');

const exists = p => {
  try { fs.accessSync(p, fs.constants.F_OK); return true; } catch { return false; }
};

if (!exists(pkgPath)) {
  console.error('❌ package.json not found in current directory');
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};

// No-op if already set with the same command
if (pkg.scripts[scriptName] === scriptCmd) {
  console.log(`ℹ️  Script "${scriptName}" já existe e está correto.`);
  process.exit(0);
}

// Backup
const backup = `${pkgPath}.bak.${Date.now()}`;
fs.copyFileSync(pkgPath, backup);

// Inject/Update
pkg.scripts[scriptName] = scriptCmd;

// Write back
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf8");

console.log('✅ Script adicionado com sucesso');
console.log('   package.json:', path.resolve(pkgPath));
console.log('   backup       :', path.resolve(backup));
console.log(`   scripts["${scriptName}"] = "${scriptCmd}"`);
