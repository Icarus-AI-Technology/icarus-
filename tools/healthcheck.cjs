#!/usr/bin/env node
/* Simple local healthcheck: Node version, files existence, quick imports */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

function ok(msg) { console.log(`✅ ${msg}`); }
function warn(msg) { console.log(`⚠️  ${msg}`); }
function fail(msg) { console.error(`❌ ${msg}`); process.exitCode = 1; }

try {
  const nodeVer = process.versions.node;
  ok(`Node ${nodeVer}`);

  const tsconfigPath = resolve('tsconfig.json');
  if (existsSync(tsconfigPath)) {
    ok(`Found tsconfig.json at ${tsconfigPath}`);
  } else {
    fail('Missing tsconfig.json');
  }

  const typesDir = resolve('types');
  if (existsSync(resolve(typesDir, 'global.d.ts'))) ok('types/global.d.ts OK'); else warn('types/global.d.ts missing');
  if (existsSync(resolve(typesDir, 'types.d.ts'))) ok('types/types.d.ts OK'); else warn('types/types.d.ts missing');

  const supabaseFn = resolve('supabase/functions/create-admin/index.ts');
  if (existsSync(supabaseFn)) ok('Edge Function create-admin OK'); else warn('Edge Function create-admin missing');

  ok('Healthcheck completed');
} catch (e) {
  const err = e instanceof Error ? e : new Error(String(e));
  fail(err.message);
}


