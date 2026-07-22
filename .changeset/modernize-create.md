---
"@marko/create": minor
"create-marko": minor
---

Rewrite in TypeScript with a modern dependency set (`@clack/prompts`, `giget`, native `fetch`). Adds agent/CI-friendly non-interactive behavior (`--yes`, plus CI/agent/no-TTY detection) and no longer aborts the scaffold when the package manager's install step exits non-zero (e.g. pnpm's ignored-build-scripts warning). The existing CLI flags are unchanged.
