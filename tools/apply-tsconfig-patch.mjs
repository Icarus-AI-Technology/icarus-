#!/usr/bin/env node
// ESM script to deep-merge a patch into a tsconfig.json with backup and comment support
// Usage: node tools/apply-tsconfig-patch.mjs --in tsconfig.json --patch tsconfig.patch.json --out tsconfig.json

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
  return out;
}

function stripJsonCommentsAndTrailingCommasSafe(input) {
  let out = '';
  let inString = false;
  let stringChar = '"';
  let inLineComment = false;
  let inBlockComment = false;
  let prev = '';
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    const next = i + 1 < input.length ? input[i + 1] : '';

    if (inLineComment) {
      if (ch === '\n') {
        inLineComment = false;
        out += ch;
      }
      continue;
    }

    if (inBlockComment) {
      if (prev === '*' && ch === '/') {
        inBlockComment = false;
      }
      prev = ch;
      continue;
    }

    if (!inString) {
      if (ch === '/' && next === '/') {
        inLineComment = true;
        i++;
        prev = '';
        continue;
      }
      if (ch === '/' && next === '*') {
        inBlockComment = true;
        i++;
        prev = '';
        continue;
      }
      if (ch === '"' || ch === "'") {
        inString = true;
        stringChar = ch;
        out += ch;
        prev = ch;
        continue;
      }
    } else {
      if (ch === stringChar && prev !== '\\') {
        inString = false;
      }
      out += ch;
      prev = ch;
      continue;
    }

    out += ch;
    prev = ch;
  }

  // Remove trailing commas (outside strings)
  let cleaned = '';
  inString = false;
  stringChar = '"';
  prev = '';
  for (let i = 0; i < out.length; i++) {
    const ch = out[i];

    if (inString) {
      if (ch === stringChar && prev !== '\\') inString = false;
      cleaned += ch;
      prev = ch;
      continue;
    }

    if (ch === '"' || ch === "'") {
      inString = true;
      stringChar = ch;
      cleaned += ch;
      prev = ch;
      continue;
    }

    if ((ch === '}' || ch === ']') && cleaned.trimEnd().endsWith(',')) {
      // Drop last comma before pushing the closing bracket/brace
      const idx = cleaned.lastIndexOf(',');
      cleaned = cleaned.slice(0, idx) + cleaned.slice(idx + 1);
    }

    cleaned += ch;
    prev = ch;
  }

  return cleaned;
}

function readJson(filePath) {
  const raw = readFileSync(filePath, 'utf8');
  try {
    return JSON.parse(raw);
  } catch {
    const cleaned = stripJsonCommentsAndTrailingCommasSafe(raw);
    return JSON.parse(cleaned);
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
  return patch; // primitives or differing types -> override
}

function printSuccess(paths, backupPath) {
  const { input, patch, output } = paths;
  console.log('✅ tsconfig merged successfully');
  console.log(`   Input : ${resolve(input)}`);
  console.log(`   Patch : ${resolve(patch)}`);
  console.log(`   Output: ${resolve(output)}`);
  console.log(`   Backup: ${backupPath}`);
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.input || !args.patch || !args.output) {
    console.error('Usage: node tools/apply-tsconfig-patch.mjs --in tsconfig.json --patch tsconfig.patch.json --out tsconfig.json');
    process.exit(1);
  }

  const inputPath = resolve(args.input);
  const patchPath = resolve(args.patch);
  const outputPath = resolve(args.output);

  const tsconfig = readJson(inputPath);
  const patch = readJson(patchPath);

  const merged = deepMerge(tsconfig, patch);

  // Backup original
  const backupPath = `${outputPath}.bak.${Date.now()}`;
  if (existsSync(outputPath)) {
    renameSync(outputPath, backupPath);
  }

  // Write merged
  writeFileSync(outputPath, JSON.stringify(merged, null, 2) + '\n', 'utf8');

  printSuccess({ input: inputPath, patch: patchPath, output: outputPath }, backupPath);
}

main().catch((err) => {
  console.error('❌ Failed to merge tsconfig:', err?.message || err);
  process.exit(1);
});


