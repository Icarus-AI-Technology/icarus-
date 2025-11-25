#!/usr/bin/env node
/**
 * Hard Gates Validator
 * - Flags:
 *   - Tailwind-like typography classes: text-*, font-*
 *   - Hex colors in code/css
 *   - Inline box-shadow
 */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const globby = require('globby');
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
const GLOB = 'src/**/*.{tsx,ts,css}';

const rules = [
  { id: 'typography.text', regex: /(^|\s)text-[A-Za-z0-9_\[\]\-:\./]+/g, desc: 'text-* classes' },
  { id: 'typography.font', regex: /(^|\s)font-[A-Za-z0-9_-]+/g, desc: 'font-* classes' },
  { id: 'colors.hex', regex: /#[0-9a-fA-F]{3,6}\b/g, desc: 'Hex colors' },
  { id: 'shadows.inline', regex: /box-shadow:\s*[^;]+;/g, desc: 'Inline box-shadow' },
];

// CSS properties que NÃO são classes Tailwind
const CSS_PROPERTIES = [
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'font-variant',
  'font-stretch',
  'font-feature-settings',
  'font-kerning',
  'font-language-override',
  'font-optical-sizing',
  'font-variation-settings',
];

function analyzeFile(path) {
  const content = readFileSync(path, 'utf8');
  const findings = [];

  // ============================================
  // SKIP FILES - Contextos onde classes são legítimas
  // ============================================

  // Arquivos CSS (definem as próprias classes)
  if (path.endsWith('.css')) {
    return findings;
  }

  // Serviços de e-mail (usam classes inline em templates HTML)
  if (
    path.includes('/email/') ||
    path.includes('/microsoft365/') ||
    path.includes('SendGridService') ||
    path.includes('resend.service')
  ) {
    return findings;
  }

  for (const rule of rules) {
    let matches = content.match(rule.regex) || [];

    // ============================================
    // WHITELIST INTELIGENTE (Opção D - Híbrida)
    // ============================================

    if (rule.id === 'typography.text') {
      // Permitir classes de LAYOUT (não são tipografia)
      const layoutClasses = [
        'text-left',
        'text-center',
        'text-right',
        'text-justify',
        'text-start',
        'text-end',
      ];

      // Permitir classes SEMÂNTICAS do shadcn/ui (cores mapeadas para CSS vars)
      const semanticClasses = [
        'text-foreground',
        'text-muted-foreground',
        'text-primary',
        'text-secondary',
        'text-destructive',
        'text-card-foreground',
        'text-popover-foreground',
        'text-accent-foreground',
      ];

      // Permitir classes do OraclusX DS
      const oracluxClasses = [
        'text-body-',
        'text-heading',
        'text-[var(--',
        'text-success',
        'text-warning',
        'text-error',
        'text-accent',
        'text-display',
        'text-body',
      ];

      // Permitir cores do Tailwind (text-gray-*, text-red-*, etc)
      const colorClasses = [
        'text-white',
        'text-black',
        'text-gray-',
        'text-slate-',
        'text-zinc-',
        'text-neutral-',
        'text-stone-',
        'text-red-',
        'text-orange-',
        'text-amber-',
        'text-yellow-',
        'text-lime-',
        'text-green-',
        'text-emerald-',
        'text-teal-',
        'text-cyan-',
        'text-sky-',
        'text-blue-',
        'text-indigo-',
        'text-violet-',
        'text-purple-',
        'text-fuchsia-',
        'text-pink-',
        'text-rose-',
      ];

      // Permitir classes de opacity e outras utilitárias
      const utilityClasses = [
        'text-opacity-',
        'text-ellipsis',
        'text-clip',
        'text-wrap',
        'text-nowrap',
        'text-balance',
        'text-pretty',
        'text-muted',
      ];

      const allowedClasses = [
        ...layoutClasses,
        ...semanticClasses,
        ...oracluxClasses,
        ...colorClasses,
        ...utilityClasses,
      ];

      // Filtrar apenas violações REAIS (tamanhos de fonte)
      matches = matches.filter((match) => {
        const cleanMatch = match.trim();
        // Permitir se está na whitelist
        if (allowedClasses.some((allowed) => cleanMatch.includes(allowed))) {
          return false;
        }
        return true;
      });
    }

    if (rule.id === 'typography.font') {
      // Permitir classes do OraclusX DS
      const oracluxFonts = ['font-display', 'font-heading', 'font-body'];
      // Permitir classes de font-family do Tailwind
      const fontFamilies = ['font-sans', 'font-serif', 'font-mono'];
      // Permitir classes de variant
      const fontVariants = [
        'font-italic',
        'font-not-italic',
        'font-antialiased',
        'font-subpixel-antialiased',
      ];

      const allowed = [...oracluxFonts, ...fontFamilies, ...fontVariants, ...CSS_PROPERTIES];
      matches = matches.filter((m) => !allowed.some((a) => m.includes(a)));
    }

    if (rule.id === 'colors.hex') {
      // Allow CSS variables usage; this regex already targets hex only
    }

    if (matches.length) {
      findings.push({ rule: rule.id, desc: rule.desc, count: matches.length });
    }
  }
  return findings;
}

async function run() {
  const files = await globby.globby(GLOB, { gitignore: true });
  const results = [];
  const totals = Object.fromEntries(rules.map((r) => [r.id, 0]));

  for (const file of files) {
    const f = analyzeFile(file);
    if (f.length) {
      results.push({ file, findings: f });
      for (const item of f) totals[item.rule] += item.count;
    }
  }

  const summary = {
    timestamp: new Date().toISOString(),
    filesScanned: files.length,
    totals,
    violations: results.length,
  };

  const docsDir = join(ROOT, 'docs', 'revisor');
  if (!existsSync(docsDir)) mkdirSync(docsDir, { recursive: true });
  writeFileSync(
    join(docsDir, 'hard-gates-report.json'),
    JSON.stringify({ summary, results }, null, 2)
  );

  let md = `# Hard Gates Report\n\n`;
  md += `**Files scanned:** ${files.length}  \n`;
  md += `**Violations files:** ${results.length}  \n`;
  md += `\n## Totals\n`;
  for (const r of rules) {
    md += `- ${r.desc}: ${totals[r.id]}\n`;
  }
  md += `\n## Top files (up to 20)\n`;
  results.slice(0, 20).forEach((r) => {
    const counts = r.findings.map((f) => `${f.desc}:${f.count}`).join(', ');
    md += `- ${r.file} — ${counts}\n`;
  });
  writeFileSync(join(docsDir, 'hard-gates-report.md'), md);
  console.log('Hard Gates report written to docs/revisor/hard-gates-report.{json,md}');
}

run().catch((err) => {
  console.error('Hard Gates validator failed:', err);
  process.exit(1);
});
