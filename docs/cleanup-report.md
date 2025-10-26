# Production Cleanup Report

## Overview
- Goal: Prepare `/icarus-make` for production deploy (Vercel + Supabase)
- Actions: scan, prune, ignore, fix type errors, validate build

## Removed Artifacts
- Test/QA outputs:
  - `playwright-report/`
  - `test-results/`
  - `playwright-results.json`
- Logs and temps:
  - `build-output.log`
  - `hard-gate-progress.log`
  - `package.json.tmp`
- Backup duplicates:
  - `package.json.bak.*`
  - `tsconfig.json.bak.*`

Rationale: Not needed in production deploy; reduce size and noise.

## Deployment Ignores
Created `.vercelignore` to exclude during deploy:
```
node_modules
playwright-report
playwright-results.json
test-results
backups
logs
*.log
*.tmp
*.bak.*
.gpt-researcher-env
.playwright/**
**/*.map
```

## Codebase Fixes
- `src/hooks/useCadastrosKPIs.ts`: reordered callback declarations before effects to satisfy TypeScript (avoids "used before declaration").

## Validation
- Type-check: PASS
- Build: PASS (Vite) → output in `dist/`

## Next Steps (Deploy)
- Ensure envs in Vercel:
  - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
  - (optional) `VITE_VERCEL_ANALYTICS_ID`, `VITE_VERCEL_SPEED_INSIGHTS_ID`
- Deploy via `npx vercel@latest` (preview) and `npx vercel@latest --prod`.

## Final State
- Directory clean, compact, and production-ready.
- SPA rewrites configured via `vercel.json`.
- QA-only UI remains gated by `?qa=1` and does not affect production.
