// Generate consolidated report from agent reports
import { promises as fs } from 'fs';
import path from 'node:path';
import { log } from './utils/logger.js';

async function main() {
  const agentsDir = path.resolve(process.cwd(), '.cursor/agents');
  const outDir = path.resolve(process.cwd(), '.cursor/reports');
  await fs.mkdir(outDir, { recursive: true });
  const files = await fs.readdir(agentsDir, { withFileTypes: true });
  const agentDirs = files.filter((d) => d.isDirectory());
  let final = '# Relatório Final\n\n';
  for (const dirent of agentDirs) {
    const reportFile = path.join(agentsDir, dirent.name, 'REPORT.md');
    try {
      const content = await fs.readFile(reportFile, 'utf8');
      final += '\n## ' + dirent.name + '\n\n' + content + '\n';
    } catch { /* ignore missing */ }
  }
  await fs.writeFile(path.join(outDir, 'FINAL-REPORT.md'), final);
  await log('Relatório final gerado.');
}

main().catch(async (e) => {
  await log('Falha ao gerar relatório: ' + (e?.message || e), { level: 'error' });
  process.exitCode = 1;
});
