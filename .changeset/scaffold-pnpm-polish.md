---
"@marko/create": patch
"create-marko": patch
---

When scaffolding with pnpm, approve esbuild's build script (only if esbuild is actually installed) so vite-based templates install cleanly instead of erroring with `ERR_PNPM_IGNORED_BUILDS`. The "next steps" run command now uses the package manager you ran with (e.g. `pnpm run dev`) instead of always printing `npm`.
