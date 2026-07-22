---
"@marko/create": patch
"create-marko": patch
---

Run the scaffold's install and git steps quietly behind the progress spinner. The noisy internals — pnpm's ignored-builds notice, esbuild's postinstall, the confirmation re-install, husky's `.git can't be found`, and git probes like `fatal: not a git repository` — are no longer printed. Install output is surfaced only when it genuinely fails.
