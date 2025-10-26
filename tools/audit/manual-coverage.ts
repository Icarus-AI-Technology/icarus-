#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const MANUAL_PATH = path.join(ROOT, 'docs', 'MANUAL_COMPLETO_58_MODULOS.md');
const SRC_PAGES = path.join(ROOT, 'src', 'pages');
const SRC_MODULES = path.join(ROOT, 'src', 'components', 'modules');

function readManual(): string[] {
  const md = fs.readFileSync(MANUAL_PATH, 'utf8');
  const lines = md.split(/\r?\n/);
  const modules: string[] = [];
  for (const line of lines) {
    const m = line.match(/^###\s+\d+\.?\s*(.+)$/);
    if (m) modules.push(m[1].trim());
  }
  return modules;
}

function listFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const fp = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...listFiles(fp));
    else out.push(fp);
  }
  return out;
}

function normalizeName(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function findMatches(modName: string, files: string[]): string[] {
  const n = normalizeName(modName);
  const hits: string[] = [];
  for (const fp of files) {
    const base = path.basename(fp);
    const content = base + ' ' + fp;
    const norm = normalizeName(content);
    // loose match by tokens
    const tokens = n.split(' ').filter(Boolean);
    const score = tokens.reduce((acc, t) => (norm.includes(t) ? acc + 1 : acc), 0);
    if (score >= Math.max(1, Math.ceil(tokens.length * 0.5))) {
      hits.push(path.relative(ROOT, fp));
    }
  }
  return hits.slice(0, 5);
}

function main() {
  const modules = readManual();
  const pageFiles = listFiles(SRC_PAGES).filter((f) => /\.(tsx?|mdx?)$/.test(f));
  const moduleFiles = listFiles(SRC_MODULES).filter((f) => /\.(tsx?)$/.test(f));
  const codeFiles = [...pageFiles, ...moduleFiles];

  const report = modules.map((name, idx) => {
    const matches = findMatches(name, codeFiles);
    return { index: idx + 1, name, matches, covered: matches.length > 0 };
  });

  const total = report.length;
  const covered = report.filter((r) => r.covered).length;

  const summary = { total, covered, coverage: total ? covered / total : 0 };
  const outJson = { summary, report };

  fs.mkdirSync(path.join(ROOT, 'docs', 'qa'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'docs', 'qa', 'manual-coverage.json'), JSON.stringify(outJson, null, 2));

  const md = [
    `# Manual Coverage`,
    `Total: ${total} | Cobertos: ${covered} | Cobertura: ${(summary.coverage * 100).toFixed(1)}%`,
    '',
    '| # | Módulo | Coberto | Correspondências |',
    '|---|--------|---------|------------------|',
    ...report.map((r) => `| ${r.index} | ${r.name} | ${r.covered ? '✅' : '❌'} | ${r.matches.join('<br>')} |`),
    '',
  ].join('\n');
  fs.writeFileSync(path.join(ROOT, 'docs', 'qa', 'manual-coverage.md'), md);

  console.log(JSON.stringify(summary));
}

main();
