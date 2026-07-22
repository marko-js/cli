# Change Log

## 6.2.2

### Patch Changes

- [#237](https://github.com/marko-js/cli/pull/237) [`0297054`](https://github.com/marko-js/cli/commit/02970542e11029d6c98bd4a90e32919085f7a91e) Thanks [@DylanPiercey](https://github.com/DylanPiercey)! - Run the scaffold's install and git steps quietly behind the progress spinner. The noisy internals — pnpm's ignored-builds notice, esbuild's postinstall, the confirmation re-install, husky's `.git can't be found`, and git probes like `fatal: not a git repository` — are no longer printed. Install output is surfaced only when it genuinely fails.

- Updated dependencies [[`0297054`](https://github.com/marko-js/cli/commit/02970542e11029d6c98bd4a90e32919085f7a91e)]:
  - @marko/create@6.2.2

## 6.2.1

### Patch Changes

- [#235](https://github.com/marko-js/cli/pull/235) [`8e6cbbc`](https://github.com/marko-js/cli/commit/8e6cbbc28d074254ffe7084203b0a08bf94e413d) Thanks [@DylanPiercey](https://github.com/DylanPiercey)! - When scaffolding with pnpm, approve esbuild's build script (only if esbuild is actually installed) so vite-based templates install cleanly instead of erroring with `ERR_PNPM_IGNORED_BUILDS`. The "next steps" run command now uses the package manager you ran with (e.g. `pnpm run dev`) instead of always printing `npm`.

- Updated dependencies [[`8e6cbbc`](https://github.com/marko-js/cli/commit/8e6cbbc28d074254ffe7084203b0a08bf94e413d)]:
  - @marko/create@6.2.1

## 6.2.0

### Minor Changes

- [#231](https://github.com/marko-js/cli/pull/231) [`0774571`](https://github.com/marko-js/cli/commit/0774571b0ad5dc6a0d6ecb78cff9cac2d6bd90c9) Thanks [@DylanPiercey](https://github.com/DylanPiercey)! - Rewrite in TypeScript with a modern dependency set (`@clack/prompts`, `giget`, native `fetch`). Adds agent/CI-friendly non-interactive behavior (`--yes`, plus CI/agent/no-TTY detection) and no longer aborts the scaffold when the package manager's install step exits non-zero (e.g. pnpm's ignored-build-scripts warning). The existing CLI flags are unchanged.

### Patch Changes

- Updated dependencies [[`0774571`](https://github.com/marko-js/cli/commit/0774571b0ad5dc6a0d6ecb78cff9cac2d6bd90c9)]:
  - @marko/create@6.2.0

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [6.1.1](https://github.com/marko-js/cli/compare/create-marko@6.1.0...create-marko@6.1.1) (2021-05-04)

### Bug Fixes

- **create-marko:** bin name for yarn create ([21cec4e](https://github.com/marko-js/cli/commit/21cec4ec8c2cbc518de17d9c313ff494984f7f83))

# 6.1.0 (2021-05-04)

### Features

- **create:** add support for package managers besides npm ([#188](https://github.com/marko-js/cli/issues/188)) ([fc18bd2](https://github.com/marko-js/cli/commit/fc18bd2053cae196f4fb97d6858b1c17714b19a1))
