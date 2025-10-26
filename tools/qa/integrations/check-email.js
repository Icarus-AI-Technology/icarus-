// Check Email mock /health or validate SMTP envs
const base = process.env.EMAIL_HTTP_BASE || `http://localhost:${process.env.EMAIL_HTTP_PORT || '8025'}`;
const healthUrl = `${base.replace(/\/$/, '')}/health`;

(async () => {
  try {
    const res = await fetch(healthUrl);
    if (res.ok) {
      console.log(`[QA][Email] OK: ${base}`);
      process.exit(0);
    }
  } catch {}

  // Fallback: check SMTP envs exist
  const required = ['SMTP_HOST', 'SMTP_PORT'];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length === 0) {
    console.log('[QA][Email] OK: SMTP env present');
    process.exit(0);
  }
  console.log('[QA][Email] FAIL: missing', missing.join(','));
  process.exit(1);
})();
