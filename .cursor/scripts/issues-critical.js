// Show critical issues from consolidated or agent reports (heuristic)
import { promises as fs } from 'fs';
import path from 'node:path';

async function readFileSafe(file) {
  try {
    return await fs.readFile(file, 'utf8');
  } catch {
    return '';
  }
}

async function main() {
  const final = await readFileSafe(path.resolve(process.cwd(), '.cursor/reports/FINAL-REPORT.md'));
  let found = [];
  if (final) {
    const lines = final.split(/\r?\n/);
    for (const line of lines) {
      if (/\*\*Issues Críticos\*\*/.test(line) || /\bCRITICAL\b/i.test(line)) {
        found.push(line.trim());
      }
    }
  }
  if (found.length === 0) {
    console.log('Nenhum crítico encontrado no relatório consolidado.');
    return;
  }
  console.log('Críticos detectados:');
  for (const l of found) console.log('-', l);
}

main();


