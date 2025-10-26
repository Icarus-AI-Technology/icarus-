import { promises as fs } from 'node:fs';
import path from 'node:path';
import { updateStatus } from '../../../scripts/utils/status-updater.js';

interface ComponentAudit {
  name: string;
  exists: boolean;
  propsTyped: boolean;
  variants: string[];
  darkModeSupport: boolean;
  usesPrimaryToken: boolean;
  inlineStylesFound: boolean;
  errors: string[];
}

const COMPONENTS = [
  'Button', 'Input', 'Card', 'Badge', 'Tooltip',
  'Modal', 'Dialog', 'Dropdown', 'Tabs', 'Accordion',
  'Progress', 'RadialProgress', 'Slider', 'Switch', 'Radio',
  'Checkbox', 'Select', 'Textarea', 'SearchField', 'InputContainer',
  'DatePicker', 'Avatar', 'Toast', 'NavigationBar', 'SubModulesNavigation',
  'IconButtonNeu', 'TopbarIconButton', 'SearchContainer'
];

async function readFileSafe(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch {
    return null;
  }
}

function detectTypedProps(content: string): boolean {
  // Heuristics: interface ...Props, type ...Props, or function Component(props: Props)
  const hasInterface = /interface\s+\w*Props\s*\{[\s\S]*?\}/m.test(content);
  const hasType = /type\s+\w*Props\s*=\s*\{[\s\S]*?\}/m.test(content);
  const hasAnnotation = /\(\s*props\s*:\s*\w*Props\s*\)/.test(content);
  return hasInterface || hasType || hasAnnotation;
}

function detectVariants(content: string): string[] {
  const matches = content.match(/variant\s*[:=]\s*['"`](.*?)['"`]/g) || [];
  return matches.map((m) => (m.match(/['"`](.*?)['"`]/)?.[1] ?? '')).filter(Boolean);
}

function detectDarkMode(content: string): boolean {
  return content.includes('dark:') || content.includes('dark ') || content.includes('dark\n') || content.includes('.dark ');
}

function detectPrimaryToken(content: string): boolean {
  return content.includes('var(--orx-primary)') || /#6366f1/i.test(content) || content.includes('text-primary') || content.includes('bg-primary');
}

function detectInlineStyles(content: string): boolean {
  return content.includes('style={{') || content.includes('style={');
}

async function auditComponents(): Promise<ComponentAudit[]> {
  const results: ComponentAudit[] = [];
  const dsPath = path.resolve(process.cwd(), 'src/components/oraclusx-ds');

  for (const component of COMPONENTS) {
    const filePath = path.join(dsPath, `${component}.tsx`);
    const content = await readFileSafe(filePath);
    const audit: ComponentAudit = {
      name: component,
      exists: Boolean(content),
      propsTyped: false,
      variants: [],
      darkModeSupport: false,
      usesPrimaryToken: false,
      inlineStylesFound: false,
      errors: []
    };

    if (!content) {
      audit.errors.push(`Arquivo ${component}.tsx não encontrado`);
      results.push(audit);
      continue;
    }

    audit.propsTyped = detectTypedProps(content);
    if (!audit.propsTyped) audit.errors.push('Props não tipadas ou ausentes');

    audit.variants = detectVariants(content);

    audit.darkModeSupport = detectDarkMode(content);
    if (!audit.darkModeSupport) audit.errors.push('Dark mode não implementado');

    audit.usesPrimaryToken = detectPrimaryToken(content);
    if (!audit.usesPrimaryToken) audit.errors.push('Não usa token primário (#6366F1 / var(--orx-primary))');

    audit.inlineStylesFound = detectInlineStyles(content);
    if (audit.inlineStylesFound) audit.errors.push('Inline styles encontrados (não permitido)');

    results.push(audit);
  }

  return results;
}

function summarize(results: ComponentAudit[]) {
  const total = results.length;
  const passed = results.filter((r) => r.errors.length === 0).length;
  const failed = total - passed;

  // Simple scoring: start 100, -3 per error item across all components (bounded to 0)
  const totalErrors = results.reduce((acc, r) => acc + r.errors.length, 0);
  const score = Math.max(0, 100 - totalErrors * 3);

  const issues: string[] = [];
  results.forEach((r) => {
    r.errors.forEach((e) => issues.push(`${r.name}.tsx: ${e}`));
  });

  return { total, passed, failed, score, issues };
}

async function main() {
  await updateStatus('01-design-system', {
    status: 'running',
    progress: 10,
    current_task: 'Subagente 1.1: Auditando componentes do Design System',
    start_time: new Date().toISOString(),
  });

  const results = await auditComponents();
  const summary = summarize(results);

  console.log(`\n🎨 Subagente 1.1: Componentes`);
  console.log(`✅ Conformes: ${summary.passed}/${summary.total}`);
  console.log(`❌ Com issues: ${summary.failed}`);
  console.log(`Score: ${summary.score}/100\n`);

  const outPath = path.resolve(
    process.cwd(),
    '.cursor/agents/01-design-system/subagents/1.1-results.json'
  );
  await fs.writeFile(outPath, JSON.stringify({
    subagent: '1.1',
    name: 'Componentes',
    status: 'completed',
    items_audited: summary.total,
    items_passed: summary.passed,
    items_failed: summary.failed,
    score: summary.score,
    issues: summary.issues,
    results
  }, null, 2));

  await updateStatus('01-design-system', {
    progress: 40,
    current_task: 'Subagente 1.1 concluído',
    metadata: {
      completed_subagents: 1,
    },
  });
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});


