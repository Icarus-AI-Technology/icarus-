#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const DATA_DIR = path.join(ROOT, 'docs/qa/assets/danfe');
const EXPECTED_PATH = path.join(DATA_DIR, 'expected_strict.json');

async function recognize(imagePath) {
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker();
  const lang = process.env.TESS_LANG || 'eng';
  const { data } = await worker.recognize(imagePath, lang);
  return data?.text || '';
}

function matchRegexMap(text, regexMap) {
  for (const [field, pattern] of Object.entries(regexMap)) {
    const re = new RegExp(pattern, 'i');
    if (!re.test(text)) {
      return { ok: false, miss: field };
    }
  }
  return { ok: true };
}

async function main() {
  if (!fs.existsSync(EXPECTED_PATH)) {
    console.log('ℹ️  expected_strict.json não encontrado, pulando.');
    process.exit(0);
  }

  const expected = JSON.parse(await fs.promises.readFile(EXPECTED_PATH, 'utf8'));
  const images = (await fs.promises.readdir(DATA_DIR)).filter((f) => /\.(png|jpg|jpeg)$/i.test(f));
  let failures = 0;

  for (const file of images) {
    if (!expected[file]) continue;
    const text = await recognize(path.join(DATA_DIR, file));
    const res = matchRegexMap(text, expected[file]);
    if (res.ok) {
      console.log(`    ${file} → OK`);
    } else {
      failures += 1;
      console.log(`    ${file} → Falhou campo: ${res.miss}`);
    }
  }

  if (failures > 0) {
    console.error(`❌  OCR strict falhou em ${failures} arquivo(s).`);
    process.exit(1);
  }
  console.log('✅  OCR strict passou.');
}

main().catch((err) => {
  console.error('❌  Erro:', err);
  process.exit(1);
});
