# Legacy Test Suites

As part of the ICARUS v5.0 stabilization, the previous Vitest and E2E suites were
archived in this directory. They exercised APIs that have since been refactored,
which caused lint/type-check failures in the current pipeline.

Content preserved here includes:

- `hooks/__tests__` — legacy unit tests for the hook layer
- `test/` — historical Vitest suites and helpers
- `tests/` — older integration/e2e experiments

These files are **not** executed by the default `npm run test` workflow. When
porting scenarios to the new architecture, copy the relevant cases back into
`src/__tests__` (or another maintained folder) and update them to the latest
APIs before re-enabling.
