#!/usr/bin/env node
// ESM script to deep-merge a package.patch.json into package.json with backup
// Usage:
//  node tools/merge-package.mjs
//  node tools/merge-package.mjs --in package.json --patch package.patch.json --out package.json

import { readFileSync, writeFileSync, renameSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--in') out.input = argv[++i];
    else if (a === '--patch') out.patch = argv[++i];
    else if (a === '--out') out.output = argv[++i];
  }
  // defaults
  out.input = out.input || 'package.json';
  out.patch = out.patch || 'package.patch.json';
  out.output = out.output || out.input;
  return out;
}

function stripBlockComments(jsonWithComments) {
  return jsonWithComments.replace(/\/\*[\s\S]*?\*\//g, '');
}

function stripTrailingCommas(jsonLike) {
  return jsonLike.replace(/,\s*(\]|\})/g, '$1');
}

function readJson(filePath) {
  const raw = readFileSync(filePath, 'utf8');
  try {
    return JSON.parse(raw);
  } catch {
    const noComments = stripBlockComments(raw);
    const noTrailing = stripTrailingCommas(noComments);
    return JSON.parse(noTrailing);
  }
}

function isPlainObject(v) {
  return v && typeof v === 'object' && !Array.isArray(v);
}

function mergeArrays(base, patch) {
  const seen = new Set();
  const result = [];
  for (const x of [...base, ...patch]) {
    const key = typeof x === 'string' ? x : JSON.stringify(x);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(x);
    }
  }
  return result;
}

function deepMerge(base, patch) {
  if (Array.isArray(base) && Array.isArray(patch)) {
    return mergeArrays(base, patch);
  }
  if (isPlainObject(base) && isPlainObject(patch)) {
    const out = { ...base };
    for (const k of Object.keys(patch)) {
      if (k in base) out[k] = deepMerge(base[k], patch[k]);
      else out[k] = patch[k];
    }
    return out;
  }
  return patch;
}

function printSuccess(paths, backupPath) {
  const { input, patch, output } = paths;
  console.log('✅ package.json merged successfully');
  console.log(`   Input : ${resolve(input)}`);
  console.log(`   Patch : ${resolve(patch)}`);
  console.log(`   Output: ${resolve(output)}`);
  console.log(`   Backup: ${backupPath}`);
}

async function main() {
  const args = parseArgs(process.argv);

  const inputPath = resolve(args.input);
  const patchPath = resolve(args.patch);
  const outputPath = resolve(args.output);

  const pkg = readJson(inputPath);
  const patch = readJson(patchPath);

  const merged = deepMerge(pkg, patch);

  // Backup original
  const backupPath = `${outputPath}.bak.${Date.now()}`;
  if (existsSync(outputPath)) {
    renameSync(outputPath, backupPath);
  }

  writeFileSync(outputPath, JSON.stringify(merged, null, 2) + '\n', 'utf8');

  printSuccess({ input: inputPath, patch: patchPath, output: outputPath }, backupPath);
}

main().catch((err) => {
  console.error('❌ Failed to merge package.json:', err?.message || err);
  process.exit(1);
});
