#!/usr/bin/env node
// Run Lighthouse in headful mode under Xvfb for CI
const { spawnSync } = require('child_process');
const { existsSync, mkdirSync, writeFileSync } = require('fs');
const { join } = require('path');

const url = process.env.LH_URL || 'http://localhost:4174';
const outJson = join(process.cwd(), 'docs', 'perf-report.json');
if (!existsSync('docs')) mkdirSync('docs');

const xvfb = spawnSync(
  'xvfb-run',
  [
    '--auto-servernum',
    '--server-args=-screen 0 1280x800x24',
    'npx',
    'lighthouse',
    url,
    '--output=json',
    '--only-categories=performance,accessibility,best-practices,seo',
    '--quiet',
  ],
  { stdio: 'pipe' }
);

if (xvfb.status !== 0) {
  const stderr = xvfb.stderr ? xvfb.stderr.toString() : 'no-stderr';
  console.error('Lighthouse (xvfb) failed:', stderr);
  writeFileSync(
    outJson,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        url,
        status: 'failed',
        note: 'Lighthouse under Xvfb failed',
        stderr,
      },
      null,
      2
    )
  );
  process.exit(1);
}

// Attempt to parse last JSON block from stdout
const stdout = xvfb.stdout.toString();
const lastBrace = stdout.lastIndexOf('{');
if (lastBrace !== -1) {
  try {
    const data = JSON.parse(stdout.slice(lastBrace));
    writeFileSync(outJson, JSON.stringify(data, null, 2));
    console.log('Lighthouse report saved to', outJson);
    process.exit(0);
  } catch (_) {}
}

writeFileSync(
  outJson,
  JSON.stringify(
    {
      timestamp: new Date().toISOString(),
      url,
      status: 'ok',
      note: 'Lighthouse ran but JSON could not be parsed from stdout. Save stdout manually.',
    },
    null,
    2
  )
);
console.log('Lighthouse report (fallback) saved to', outJson);
