# Change Log

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
