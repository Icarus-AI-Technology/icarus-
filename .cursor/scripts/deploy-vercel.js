// Minimal deploy hook: validates preconditions then prints instructions
import { promises as fs } from 'fs';
import path from 'node:path';

async function readFinal() {
  const file = path.resolve(process.cwd(), '.cursor/reports/FINAL-REPORT.md');
  try {
    return await fs.readFile(file, 'utf8');
  } catch {
    return '';
  }
}

async function main() {
  const report = await readFinal();
  if (!report.includes('Score Global') || report.includes('Issues Críticos:') && /Issues Críticos:\s*(\d+)/.test(report) && Number(RegExp.$1) > 0) {
    console.error('Pré-condições não atendidas: gere o relatório consolidado e garanta 0 críticos.');
    process.exit(1);
  }
  console.log('Iniciando deploy (simulado). Configure seu Vercel CLI se necessário.');
  console.log('Sugestão: vercel --prod');
}

main();


