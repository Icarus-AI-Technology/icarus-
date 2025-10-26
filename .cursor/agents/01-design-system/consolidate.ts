import { promises as fs } from 'node:fs';
import path from 'node:path';
import { updateStatus } from '../../scripts/utils/status-updater.js';

interface SubagentResult {
  subagent: string;
  name: string;
  status: string;
  score: number;
  issues: string[];
}

async function readJson<T>(p: string): Promise<T> {
  const raw = await fs.readFile(p, 'utf8');
  return JSON.parse(raw) as T;
}

function weightFor(subagent: string) {
  if (subagent === '1.1') return 0.35;
  if (subagent === '1.2') return 0.25;
  if (subagent === '1.3') return 0.20;
  return 0.0;
}

async function main() {
  await updateStatus('01-design-system', {
    status: 'running',
    progress: 90,
    current_task: 'Consolidando resultados do Agente 01',
  });

  const base = path.resolve(process.cwd(), '.cursor/agents/01-design-system/subagents');
  const r11 = await readJson<SubagentResult>(path.join(base, '1.1-results.json'));
  const r12 = await readJson<SubagentResult>(path.join(base, '1.2-results.json'));
  const r13 = await readJson<SubagentResult>(path.join(base, '1.3-results.json'));

  const results = [r11, r12, r13];
  const overallScore = Math.round(
    results.reduce((acc, r) => acc + (r.score * weightFor(r.subagent)), 0)
  );

  const criticalIssues: string[] = [];
  const importantIssues: string[] = [];
  const suggestions: string[] = [];

  results.forEach((r) => {
    r.issues?.forEach((issue) => {
      const text = issue.toLowerCase();
      if (text.includes('não encontrado') || text.includes('props não tipadas')) {
        criticalIssues.push(issue);
      } else if (text.includes('dark mode') || text.includes('inline styles')) {
        importantIssues.push(issue);
      } else {
        suggestions.push(issue);
      }
    });
  });

  const consolidated = {
    overallScore,
    criticalIssues,
    importantIssues,
    suggestions,
  };

  const outPath = path.resolve(process.cwd(), '.cursor/agents/01-design-system/CONSOLIDATED.json');
  await fs.writeFile(outPath, JSON.stringify(consolidated, null, 2));

  console.log('\n📊 Consolidação - Agente 01: Design System\n');
  console.log(`Score Global: ${overallScore}/100`);
  console.log(`Issues Críticos: ${criticalIssues.length}`);
  console.log(`Issues Importantes: ${importantIssues.length}`);
  console.log(`Sugestões: ${suggestions.length}`);

  await updateStatus('01-design-system', {
    status: 'completed',
    progress: 100,
    current_task: 'Consolidado',
    end_time: new Date().toISOString(),
    metadata: {
      critical_issues: criticalIssues.length,
      important_issues: importantIssues.length,
      suggestions: suggestions.length,
    },
  });
}

main().catch((err) => { console.error(err); process.exitCode = 1; });


