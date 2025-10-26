// Check Ollama or mock at /api/tags
const port = process.env.OLLAMA_PORT || '11434';
const base = process.env.VITE_OLLAMA_URL || `http://localhost:${port}`;
const url = `${base.replace(/\/$/, '')}/api/tags`;

(async () => {
  try {
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data?.models && Array.isArray(data.models)) {
      console.log(`[QA][Ollama] OK: ${base}`);
      process.exit(0);
    }
    console.log('[QA][Ollama] FAIL: unexpected payload');
    process.exit(1);
  } catch (err) {
    console.log('[QA][Ollama] FAIL:', err?.message || err);
    process.exit(1);
  }
})();
