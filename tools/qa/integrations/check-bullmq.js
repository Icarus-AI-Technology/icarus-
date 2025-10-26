// Check BullMQ mock /queue/ping
const base = process.env.BULL_HTTP_URL || `http://localhost:${process.env.BULL_HTTP_PORT || '9900'}`;
const url = `${base.replace(/\/$/, '')}/queue/ping`;

(async () => {
  try {
    const res = await fetch(url);
    if (res.ok) {
      console.log(`[QA][BullMQ] OK: ${base}`);
      process.exit(0);
    }
    console.log('[QA][BullMQ] FAIL: HTTP', res.status);
    process.exit(1);
  } catch (err) {
    console.log('[QA][BullMQ] FAIL:', err?.message || err);
    process.exit(1);
  }
})();
