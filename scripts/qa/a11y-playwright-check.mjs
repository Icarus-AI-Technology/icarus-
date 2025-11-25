#!/usr/bin/env node
/**
 * Playwright A11y Checks (lightweight)
 * - Headings order (no level jumps)
 * - Labels on form controls
 * - Presence of main landmark
 * - Images have alt (or role none/presentation)
 */
import { chromium } from 'playwright';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const BASE_URL = process.env.A11Y_BASE_URL || 'http://localhost:4174';
const ROUTES = (process.env.A11Y_ROUTES || '/,/dashboard,/cirurgias').split(',');

function headingViolations() {
  const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'));
  const violations = [];
  let prev = 0;
  headings.forEach((h, i) => {
    const lvl = parseInt(h.tagName[1]);
    if (prev !== 0 && lvl - prev > 1) {
      violations.push({ index: i, tag: h.tagName.toLowerCase(), html: h.outerHTML.slice(0, 180) });
    }
    prev = lvl;
  });
  const hasH1 = headings.some((h) => h.tagName.toLowerCase() === 'h1');
  return { hasH1, count: violations.length, examples: violations.slice(0, 3) };
}

function labelViolations() {
  const nodes = Array.from(document.querySelectorAll('input,select,textarea')).filter((el) => {
    const type = (el.getAttribute('type') || '').toLowerCase();
    if (type === 'hidden') return false;
    if (el.getAttribute('aria-hidden') === 'true') return false;
    return true;
  });
  const v = [];
  nodes.forEach((el) => {
    const id = el.id;
    const ariaLabel = el.getAttribute('aria-label');
    const ariaLabelledBy = el.getAttribute('aria-labelledby');
    const hasLabel = id && document.querySelector(`label[for="${id}"]`);
    if (!hasLabel && !ariaLabel && !ariaLabelledBy) {
      v.push({ tag: el.tagName.toLowerCase(), html: el.outerHTML.slice(0, 180) });
    }
  });
  return { count: v.length, examples: v.slice(0, 5) };
}

function mainLandmark() {
  const hasMain = !!document.querySelector('main,[role="main"],#main-content');
  return { present: hasMain };
}

function imageAltViolations() {
  const images = Array.from(document.querySelectorAll('img'));
  const v = images
    .filter(
      (img) =>
        !img.hasAttribute('alt') &&
        !['presentation', 'none'].includes((img.getAttribute('role') || '').toLowerCase())
    )
    .map((img) => ({ html: img.outerHTML.slice(0, 180) }));
  return { count: v.length, examples: v.slice(0, 5) };
}

async function run() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  const results = [];
  const start = Date.now();

  for (const route of ROUTES) {
    const url = `${BASE_URL}${route}`;
    const entry = { route, url };
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
      // Aguarda landmark principal quando presente; não falha se ausente
      try {
        await page.waitForSelector('main, [role="main"], #main-content', { timeout: 2000 });
      } catch (_) {}
      const res = await page.evaluate(() => ({
        headings: (function () {
          return (function () {
            return undefined;
          })();
        })(), // placeholder to keep scope clean
      }));
      // Run checks individually to keep readable
      const headings = await page.evaluate(headingViolations);
      const labels = await page.evaluate(labelViolations);
      const landmark = await page.evaluate(mainLandmark);
      const images = await page.evaluate(imageAltViolations);
      entry.checks = { headings, labels, landmark, images };
      entry.passed = landmark.present && labels.count === 0;
    } catch (err) {
      entry.error = err instanceof Error ? err.message : String(err);
      entry.passed = false;
    }
    results.push(entry);
  }

  await browser.close();

  const summary = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    durationMs: Date.now() - start,
    routes: results.length,
    passed: results.every((r) => r.passed),
    totals: {
      headingsJumps: results.reduce((a, r) => a + (r.checks?.headings?.count || 0), 0),
      missingLabels: results.reduce((a, r) => a + (r.checks?.labels?.count || 0), 0),
      missingMain: results.filter((r) => r.checks && !r.checks.landmark.present).length,
      missingImgAlt: results.reduce((a, r) => a + (r.checks?.images?.count || 0), 0),
    },
  };

  const docsDir = join(process.cwd(), 'docs');
  if (!existsSync(docsDir)) mkdirSync(docsDir, { recursive: true });
  writeFileSync(
    join(docsDir, 'qa-a11y-playwright.json'),
    JSON.stringify({ summary, results }, null, 2)
  );

  let md = `# ♿ A11y Report (Playwright)
**Base:** ${BASE_URL}  
**Routes:** ${results.length}  
**Passed:** ${summary.passed ? '✅' : '❌'}  

| Check | Total |
|---|---:|
| Heading jumps | ${summary.totals.headingsJumps} |
| Missing labels | ${summary.totals.missingLabels} |
| Missing main landmark | ${summary.totals.missingMain} |
| Images without alt | ${summary.totals.missingImgAlt} |

## By Route
`;
  for (const r of results) {
    md += `\n### ${r.route} (${r.passed ? '✅' : '❌'})\n`;
    if (r.error) {
      md += `Error: ${r.error}\n`;
      continue;
    }
    md += `- main present: ${r.checks.landmark.present ? 'yes' : 'no'}\n`;
    md += `- heading jumps: ${r.checks.headings.count}\n`;
    md += `- missing labels: ${r.checks.labels.count}\n`;
    md += `- images without alt: ${r.checks.images.count}\n`;
  }
  writeFileSync(join(docsDir, 'qa-a11y-playwright.md'), md);

  console.log('A11y (Playwright) report written to docs/qa-a11y-playwright.{json,md}');
}

run().catch((err) => {
  console.error('A11y run failed:', err);
  process.exit(1);
});
