import { promises as fs } from 'node:fs';
import path from 'node:path';
import { updateStatus } from '../../../scripts/utils/status-updater.js';

interface ThemeAudit {
  component: string;
  usesCSSVariables: boolean;
  usesDarkClasses: boolean;
  hasTransition: boolean;
  issues: string[];
}

const COMPONENTS = [
  'Button', 'Input', 'Card', 'Badge', 'Tooltip',
  'Modal', 'Dialog', 'Dropdown', 'Tabs', 'Accordion',
  'Progress', 'RadialProgress', 'Slider', 'Switch', 'Radio',
  'Checkbox', 'Select', 'Textarea', 'SearchField', 'InputContainer',
  'DatePicker', 'Avatar', 'Toast', 'NavigationBar', 'SubModulesNavigation',
  'IconButtonNeu', 'TopbarIconButton', 'SearchContainer'
];

async function readFileSafe(p: string) {
  try { return await fs.readFile(p, 'utf8'); } catch { return null; }
}

async function auditThemes(): Promise<ThemeAudit[]> {
  const results: ThemeAudit[] = [];
  const base = path.resolve(process.cwd(), 'src/components/oraclusx-ds');

  for (const c of COMPONENTS) {
    const file = path.join(base, `${c}.tsx`);
    const content = await readFileSafe(file);
    if (!content) {
      results.push({ component: c, usesCSSVariables: false, usesDarkClasses: false, hasTransition: false, issues: ['Arquivo não encontrado'] });
      continue;
    }

    const usesCSSVariables = content.includes('var(--');
    const usesDarkClasses = content.includes('dark:') || content.includes('.dark ');
    const hasTransition = content.includes('transition') || content.includes('duration-');
    const issues: string[] = [];
    if (!usesCSSVariables) issues.push('Não usa CSS variables');
    if (!usesDarkClasses) issues.push('Não tem classes dark:');
    if (!hasTransition) issues.push('Sem transição de tema');

    results.push({ component: c, usesCSSVariables, usesDarkClasses, hasTransition, issues });
  }
  return results;
}

async function auditThemeContext() {
  const contextPath = path.resolve(process.cwd(), 'src/contexts/ThemeContext.tsx');
  const content = await readFileSafe(contextPath);
  const issues: string[] = [];
  if (!content) return { exists: false, issues: ['ThemeContext.tsx não encontrado'] };
  if (!content.includes('localStorage')) issues.push('Não persiste tema em localStorage');
  if (!content.includes('data-theme') && !content.includes('classList.add("dark")')) issues.push('Não aplica data-theme/classe ao document');
  if (!content.includes('toggleTheme')) issues.push('Função toggleTheme ausente');
  return { exists: true, issues };
}

async function main() {
  await updateStatus('01-design-system', {
    status: 'running',
    progress: 72,
    current_task: 'Subagente 1.3: Temas (Dark/Light)',
  });

  const componentsAudit = await auditThemes();
  const contextAudit = await auditThemeContext();

  const passed = componentsAudit.filter((c) => c.issues.length === 0).length;
  const total = componentsAudit.length;
  const score = Math.round(((passed / total) * 70) + (contextAudit.issues.length === 0 ? 30 : 0));

  console.log('🌓 Auditando Dark/Light Mode...');
  console.log(`Componentes com tema: ${passed}/${total}`);
  console.log(`ThemeContext: ${contextAudit.exists ? '✅' : '❌'}`);

  const outPath = path.resolve(process.cwd(), '.cursor/agents/01-design-system/subagents/1.3-results.json');
  await fs.writeFile(outPath, JSON.stringify({
    subagent: '1.3',
    name: 'Temas (Dark/Light)',
    status: 'completed',
    componentsAudit,
    contextAudit,
    score,
    issues: [
      ...componentsAudit.flatMap((c) => c.issues.map((i) => `${c.component}.tsx: ${i}`)),
      ...(!contextAudit.exists ? ['ThemeContext.tsx não encontrado'] : contextAudit.issues)
    ],
  }, null, 2));

  await updateStatus('01-design-system', {
    progress: 85,
    current_task: 'Subagente 1.3 concluído',
    metadata: { completed_subagents: 3 },
  });
}

main().catch((err) => { console.error(err); process.exitCode = 1; });


