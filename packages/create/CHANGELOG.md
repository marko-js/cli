# Change Log

## 6.3.0

### Minor Changes

- [#241](https://github.com/marko-js/cli/pull/241) [`325ad23`](https://github.com/marko-js/cli/commit/325ad238b95e8f5acbdcc44a1d3eeeb132a3a885) Thanks [@DylanPiercey](https://github.com/DylanPiercey)! - CLI improvements: validate the project name and derive a valid npm package name from it (e.g. `My App` → `my-app`); add `--no-install` and `--no-git`; hide the legacy `*-marko-5` examples from the interactive list (still usable via `--template`); authenticate GitHub requests with `GITHUB_TOKEN`/`GH_TOKEN` when set (higher rate limits and private templates), with clearer rate-limit errors; use plain step output instead of an animated spinner under CI/agents/piped output; and fail clearly on a missing template (and surface the underlying cause) instead of scaffolding an empty project.

### Patch Changes

- [#239](https://github.com/marko-js/cli/pull/239) [`0a7d8f9`](https://github.com/marko-js/cli/commit/0a7d8f90bd58949cded324764b7134c49b91d333) Thanks [@DylanPiercey](https://github.com/DylanPiercey)! - Remove the duplicated "Project created" line at the end of the scaffold — the spinner's final message and the closing message both said it. The spinner now ends with "Project created" and the closing line starts the "Next steps".

## 6.2.2

### Patch Changes

- [#237](https://github.com/marko-js/cli/pull/237) [`0297054`](https://github.com/marko-js/cli/commit/02970542e11029d6c98bd4a90e32919085f7a91e) Thanks [@DylanPiercey](https://github.com/DylanPiercey)! - Run the scaffold's install and git steps quietly behind the progress spinner. The noisy internals — pnpm's ignored-builds notice, esbuild's postinstall, the confirmation re-install, husky's `.git can't be found`, and git probes like `fatal: not a git repository` — are no longer printed. Install output is surfaced only when it genuinely fails.

## 6.2.1

### Patch Changes

- [#235](https://github.com/marko-js/cli/pull/235) [`8e6cbbc`](https://github.com/marko-js/cli/commit/8e6cbbc28d074254ffe7084203b0a08bf94e413d) Thanks [@DylanPiercey](https://github.com/DylanPiercey)! - When scaffolding with pnpm, approve esbuild's build script (only if esbuild is actually installed) so vite-based templates install cleanly instead of erroring with `ERR_PNPM_IGNORED_BUILDS`. The "next steps" run command now uses the package manager you ran with (e.g. `pnpm run dev`) instead of always printing `npm`.

## 6.2.0

### Minor Changes

- [#231](https://github.com/marko-js/cli/pull/231) [`0774571`](https://github.com/marko-js/cli/commit/0774571b0ad5dc6a0d6ecb78cff9cac2d6bd90c9) Thanks [@DylanPiercey](https://github.com/DylanPiercey)! - Rewrite in TypeScript with a modern dependency set (`@clack/prompts`, `giget`, native `fetch`). Adds agent/CI-friendly non-interactive behavior (`--yes`, plus CI/agent/no-TTY detection) and no longer aborts the scaffold when the package manager's install step exits non-zero (e.g. pnpm's ignored-build-scripts warning). The existing CLI flags are unchanged.

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [6.1.0](https://github.com/marko-js/cli/compare/@marko/create@6.0.2...@marko/create@6.1.0) (2021-05-04)

### Bug Fixes

- **create:** use a fallback git author if missing ([#189](https://github.com/marko-js/cli/issues/189)) ([083e035](https://github.com/marko-js/cli/commit/083e03532fec048764b02d71490bbc34e0abd555))

### Features

- **create:** add support for package managers besides npm ([#188](https://github.com/marko-js/cli/issues/188)) ([fc18bd2](https://github.com/marko-js/cli/commit/fc18bd2053cae196f4fb97d6858b1c17714b19a1))

## [6.0.2](https://github.com/marko-js/cli/compare/@marko/create@6.0.1...@marko/create@6.0.2) (2021-03-29)

**Note:** Version bump only for package @marko/create

## [6.0.1](https://github.com/marko-js/cli/compare/@marko/create@6.0.0...@marko/create@6.0.1) (2021-02-04)

**Note:** Version bump only for package @marko/create

# [6.0.0](https://github.com/marko-js/cli/compare/@marko/create@5.0.4...@marko/create@6.0.0) (2021-01-22)

### Features

- update deps, support Marko 5 ([c5d34ff](https://github.com/marko-js/cli/commit/c5d34ff58fa34ef545330dfe1231ebac37282895))

### BREAKING CHANGES

- Marko 4 support dropped in serve/build
- Upgraded webdriver version for test

## [5.0.4](https://github.com/marko-js/cli/compare/@marko/create@5.0.3...@marko/create@5.0.4) (2020-08-07)

**Note:** Version bump only for package @marko/create

## [5.0.3](https://github.com/marko-js/cli/compare/@marko/create@5.0.2...@marko/create@5.0.3) (2020-05-12)

### Bug Fixes

- include version flag for all commands ([802de9d](https://github.com/marko-js/cli/commit/802de9daa9e70b2912b5a718352f667d7bc2eb03))

## [5.0.2](https://github.com/marko-js/cli/compare/@marko/create@5.0.1...@marko/create@5.0.2) (2020-05-12)

### Bug Fixes

- **create:** improve windows support, prevent writing to node_modules ([3e15a5f](https://github.com/marko-js/cli/commit/3e15a5f81c5c9e275db6a1445bad2c4c5db17cc2))

## [5.0.1](https://github.com/marko-js/cli/compare/@marko/create@5.0.0...@marko/create@5.0.1) (2020-05-12)

### Bug Fixes

- **create:** support spaces in directory ([2c4ed54](https://github.com/marko-js/cli/commit/2c4ed547cb963cfd57cf8d94f9c01d750873fde1))

# [5.0.0](https://github.com/marko-js/cli/compare/@marko/create@4.2.0...@marko/create@5.0.0) (2020-05-12)

### Features

- create now uses marko-js/examples ([#160](https://github.com/marko-js/cli/issues/160)) ([265acdb](https://github.com/marko-js/cli/commit/265acdbdf5f1ebf6e2eaacd861d24bd9c4e24261))

### BREAKING CHANGES

- --template flag replaces old template:name convention

# [4.2.0](https://github.com/marko-js/cli/compare/@marko/create@4.1.1...@marko/create@4.2.0) (2020-05-07)

### Features

- allow commands to run apart from marko-cli ([#152](https://github.com/marko-js/cli/issues/152)) ([4226988](https://github.com/marko-js/cli/commit/42269889bdf89e3811e465852ad0061e8e06cd03))

## [4.1.1](https://github.com/marko-js/cli/compare/@marko/create@4.1.0...@marko/create@4.1.1) (2019-07-12)

**Note:** Version bump only for package @marko/create

# [4.1.0](https://github.com/marko-js/cli/compare/@marko/create@4.0.0...@marko/create@4.1.0) (2019-07-12)

### Features

- **test:** upgrade wdio ([#130](https://github.com/marko-js/cli/issues/130)) ([ffbdefd](https://github.com/marko-js/cli/commit/ffbdefd))

<a name="4.0.0"></a>

# [4.0.0](https://github.com/marko-js/cli/compare/@marko/create@3.3.0...@marko/create@4.0.0) (2019-01-17)

### Features

- **migrate:** Expose dependent path migration ([#110](https://github.com/marko-js/cli/issues/110)) ([9000add](https://github.com/marko-js/cli/commit/9000add))
- **prettyprint:** support for modern tag params ([#114](https://github.com/marko-js/cli/issues/114)) ([6900fa5](https://github.com/marko-js/cli/commit/6900fa5))

### BREAKING CHANGES

- **migrate:** rename result properties, default path migrations

# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [3.3.0](https://github.com/marko-js/cli/compare/@marko/create@3.2.1...@marko/create@3.3.0) (2018-12-12)

### Features

- **migrate:** expose optional migration api in migrate command ([#100](https://github.com/marko-js/cli/issues/100)) ([4c9febc](https://github.com/marko-js/cli/commit/4c9febc))

## [3.2.1](https://github.com/marko-js/cli/compare/@marko/create@3.2.0...@marko/create@3.2.1) (2018-12-07)

**Note:** Version bump only for package @marko/create

# [3.2.0](https://github.com/marko-js/cli/compare/@marko/create@3.1.7...@marko/create@3.2.0) (2018-12-05)

### Features

- add prettyprint package ([158ec29](https://github.com/marko-js/cli/commit/158ec29))

## 3.1.7 (2018-12-05)

## 3.1.6 (2018-06-21)

# 3.1.0 (2018-05-01)

## 3.0.1 (2018-04-27)

# 3.0.0 (2018-04-27)

**Note:** Version bump only for package @marko/create
