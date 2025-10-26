// Lightweight health check for Meilisearch or mock service
// Uses global fetch (Node >=18)

const port = process.env.MEILI_PORT || '7700';
const base = process.env.VITE_MEILISEARCH_URL || `http://localhost:${port}`;
const healthUrl = `${base.replace(/\/$/, '')}/health`;

(async () => {
  try {
    const res = await fetch(healthUrl, { method: 'GET' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json().catch(() => ({}));
    if (data && (data.status === 'ok' || data.status === 'available' || data.ok === true)) {
      console.log(`[QA][Meili] OK: ${base}`);
      process.exit(0);
    }
    console.log(`[QA][Meili] FAIL: unexpected payload`);
    process.exit(1);
  } catch (err) {
    console.log(`[QA][Meili] FAIL: ${healthUrl} ->`, err?.message || err);
    process.exit(1);
  }
})();
