<h1 align="center">🔨 CLI 🔧</h1>
<p align="center">
  <!-- Structure -->
  <a href="https://github.com/lerna/lerna">
    <img src="https://img.shields.io/badge/monorepo-lerna-531099.svg" alt="Lerna"/>
  </a>
  <!-- Format -->
  <a href="https://github.com/prettier/prettier">
    <img src="https://img.shields.io/badge/styled_with-prettier-ff69b4.svg" alt="Styled with prettier"/>
  </a>
  <!-- License -->
  <a href="./LICENSE">
    <img src="https://img.shields.io/github/license/marko-js/cli.svg" alt="MIT"/>
  </a>
  <!-- CI -->
  <a href="https://travis-ci.com/marko-js/cli">
    <img src="https://travis-ci.com/marko-js/cli.svg?branch=master" alt="Build status"/>
  </a>
</p>

## CLI Tool

Each command in this repository has a programmatic API that is distributed as an independent package.
To use any of the commands below as a CLI you must install the [marko-cli](https://github.com/marko-js/cli/blob/master/packages/cli/README.md) package.

## Commands

- [compile](https://github.com/marko-js/cli/blob/master/packages/compile/README.md) -
  compiles a Marko template and writes the output to disk
- [create](https://github.com/marko-js/cli/blob/master/packages/create/README.md) -
  generates a Marko app boilerplate with marko-starter
- [migrate](https://github.com/marko-js/cli/blob/master/packages/migrate/README.md) -
  Migrates Marko templates.
- [prebuild](https://github.com/marko-js/cli/blob/master/packages/prebuild/README.md) -
  precompile Marko templates using [lasso's prebuild functionality](https://github.com/lasso-js/lasso).
- [prettyprint](https://github.com/marko-js/cli/blob/master/packages/prettyprint/README.md) -
  Pretty prints Marko templates.
- [test](https://github.com/marko-js/cli/blob/master/packages/test/README.md) -
  Server side and client sides tests for Marko components using Mocha

## Contributing

This repo provides a consistent build, test, & development environment for all of Marko's CLI commands.

### [npm](https://twitter.com/chriscoyier/status/896051713378992130) scripts

- `test` Run the tests for all packages
- `publish` Runs build and begins publishing any changed packages
- `build` Runs babel on the `src` folder for every package _(runs on publish)_
- `format` Formats the files in the repo _(runs on precommit)_
- `lint` Lints the files in the repo _(runs on precommit)_

## Code of Conduct

This project adheres to the [eBay Code of Conduct](./.github/CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.
