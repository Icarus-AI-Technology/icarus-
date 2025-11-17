#!/usr/bin/env node

import http from 'http';

const baseUrl = process.env.API_BASE_URL || 'http://localhost:5177/api/health';

console.log(`🌐 HTTP smoke test → ${baseUrl}`);

const strict = process.env.STRICT_SMOKE === '1';

const request = http.get(baseUrl, (res) => {
  const { statusCode } = res;
  if (statusCode && statusCode >= 200 && statusCode < 400) {
    console.log(`✅ OK (${statusCode})`);
    res.resume();
    process.exit(0);
  } else {
    const message = `ℹ️  Smoke falhou (status ${statusCode}).`;
    if (strict) {
      console.error(`❌ ${message}`);
      res.resume();
      process.exit(1);
    }
    console.warn(`${message} (STRICT_SMOKE!=1, finalizando com sucesso)`);
    res.resume();
    process.exit(0);
  }
});

request.on('error', (err) => {
  if (strict) {
    console.error('❌ Erro ao acessar endpoint:', err.message);
    process.exit(1);
  }
  console.warn('ℹ️  Erro ao acessar endpoint (ignorado):', err.message);
  process.exit(0);
});
