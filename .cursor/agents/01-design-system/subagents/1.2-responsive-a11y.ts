import { promises as fs } from 'node:fs';
import path from 'node:path';
import { exec as execCb } from 'node:child_process';
import { promisify } from 'node:util';
import { updateStatus } from '../../../scripts/utils/status-updater.js';

const exec = promisify(execCb);

async function readTailwindConfigScreens(): Promise<string[]> {
  // Tailwind config usa require, então vamos parsear manualmente
  try {
    const configPath = path.resolve(process.cwd(), 'tailwind.config.js');
    const content = await fs.readFile(configPath, 'utf8');
    // Extrair screens do extend.screens ou retornar defaults
    const screensMatch = content.match(/screens:\s*{([^}]+)}/);
    if (screensMatch) {
      const entries = screensMatch[1].match(/'([^']+)':\s*'[^']+'/g) || [];
      return entries.map(e => e.match(/'([^']+)'/)?.[1] || '').filter(Boolean);
    }
    return ['sm', 'md', 'lg', 'xl', '2xl'];
  } catch {
    return ['sm', 'md', 'lg', 'xl', '2xl'];
  }
}

async function countResponsiveClasses(): Promise<number> {
  try {
    const { stdout } = await exec(`rg -n "(sm:|md:|lg:|xl:|2xl:)" src/components/oraclusx-ds/*.tsx | wc -l`);
    return parseInt(stdout.trim() || '0', 10);
  } catch {
    return 0;
  }
}

type AxeResult = { violations: number; ok: boolean; details?: unknown };

async function runAxeAgainstPreview(): Promise<AxeResult>{
  try {
    const { stdout } = await exec(`npx -y @axe-core/cli http://localhost:4174/ --tags wcag2a,wcag2aa --json`);
    const json = JSON.parse(stdout);
    return { violations: json.violations.length, ok: true, details: json };
  } catch (_err) {
    return { violations: -1, ok: false };
  }
}

async function main() {
  await updateStatus('01-design-system', {
    status: 'running',
    progress: 45,
    current_task: 'Subagente 1.2: Responsividade & A11y',
  });

  console.log('📱 Auditando responsividade...');
  const breakpoints = await readTailwindConfigScreens();
  const responsiveClasses = await countResponsiveClasses();

  console.log('Breakpoints:', breakpoints);
  console.log('Classes responsivas encontradas:', responsiveClasses);

  console.log('\n♿ Auditando acessibilidade...');
  const a11y = await runAxeAgainstPreview();
  if (a11y.ok) {
    console.log('Violações WCAG encontradas:', a11y.violations);
  } else {
    console.log('⚠️ Não foi possível executar axe-core (preview offline?)');
  }

  const responsivePass = responsiveClasses > 50; // heuristic
  const a11yPass = a11y.ok ? a11y.violations === 0 : false;
  const score = (responsivePass ? 50 : 0) + (a11yPass ? 50 : 0);

  const outPath = path.resolve(process.cwd(), '.cursor/agents/01-design-system/subagents/1.2-results.json');
  await fs.writeFile(outPath, JSON.stringify({
    subagent: '1.2',
    name: 'Responsividade & A11y',
    status: 'completed',
    responsive: { breakpoints, responsiveClasses, pass: responsivePass },
    a11y: { violations: a11y.violations, pass: a11yPass },
    score,
    issues: [],
  }, null, 2));

  await updateStatus('01-design-system', {
    progress: 70,
    current_task: 'Subagente 1.2 concluído',
    metadata: { completed_subagents: 2 },
  });
}

main().catch((err) => { console.error(err); process.exitCode = 1; });


