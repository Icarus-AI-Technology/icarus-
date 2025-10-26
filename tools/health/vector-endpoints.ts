#!/usr/bin/env tsx
// Quick health check for FAISS & vector-search endpoints

const ML_API_URL = process.env.ML_API_URL;
const VECTOR_SEARCH_URL = process.env.ML_VECTOR_SEARCH_URL;
const VECTOR_TOKEN = process.env.ML_VECTOR_TOKEN;

function invariant(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

async function checkFaiss() {
  invariant(ML_API_URL, 'ML_API_URL não definida');
  const url = `${ML_API_URL.replace(/\/$/, '')}/vector/faiss/search`;
  const start = performance.now();
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: [0.1, 0.2], top_k: 2 }),
  });
  const ms = performance.now() - start;
  if (!res.ok) throw new Error(`FAISS ${res.status} ${res.statusText}`);
  return { ok: true, ms };
}

async function checkVectorSearch() {
  invariant(VECTOR_SEARCH_URL, 'ML_VECTOR_SEARCH_URL não definida');
  const start = performance.now();
  const res = await fetch(VECTOR_SEARCH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(VECTOR_TOKEN ? { Authorization: VECTOR_TOKEN } : {}),
    },
    body: JSON.stringify({ query: [0.1, 0.2], topK: 2, module: 'cirurgias' }),
  });
  const ms = performance.now() - start;
  if (!res.ok) throw new Error(`vector-search ${res.status} ${res.statusText}`);
  return { ok: true, ms };
}

(async () => {
  try {
    const faiss = await checkFaiss();
    const search = await checkVectorSearch();
    console.log(JSON.stringify({ faiss, vectorSearch: search }, null, 2));
    process.exit(0);
  } catch (e) {
    console.error('Healthcheck falhou:', (e as Error).message);
    process.exit(1);
  }
})();
