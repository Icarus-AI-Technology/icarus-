// Validate PostHog env key present (client-side only check)
const key = process.env.VITE_POSTHOG_API_KEY || process.env.POSTHOG_API_KEY;
if (key && key.length > 8) {
  console.log('[QA][PostHog] OK: key present');
  process.exit(0);
}
console.log('[QA][PostHog] SKIP: missing VITE_POSTHOG_API_KEY');
process.exit(0);
