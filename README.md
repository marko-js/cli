<h1 align="center">Marko CLI</h1>

<p align="center">
  <!-- Stability -->
  <a href="https://nodejs.org/api/documentation.html#documentation_stability_index">
    <img src="https://img.shields.io/badge/stability-stable-green.svg" alt="API Stability"/>
  </a>
  <!-- NPM Version -->
  <a href="https://npmjs.org/package/marko-cli">
    <img src="https://img.shields.io/npm/v/marko-cli.svg" alt="NPM Version"/>
  </a>
  <!-- Downloads -->
  <a href="https://npmjs.org/package/marko-cli">
    <img src="https://img.shields.io/npm/dm/marko-cli.svg" alt="Downloads"/>
  </a>
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

<p align="center">
  <img src="https://user-images.githubusercontent.com/1958812/55680381-a6b60f00-58cd-11e9-8b9b-2d54fa31a501.png" alt="npm install -g marko-cli"/>
</p>

## Commands

| Command                                                                                   | Description                                                                           | Version                                                                                                                                       |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| [serve](https://github.com/marko-js/cli/blob/master/packages/serve/README.md)             | 🚀 Quickly serve a Marko application or individual component for local development    | <a href="https://npmjs.org/package/@marko/serve"><img src="https://img.shields.io/npm/v/@marko/serve.svg" alt="NPM Version"/></a>             |
| [build](https://github.com/marko-js/cli/blob/master/packages/build/README.md)             | 📦 Build an optimized Marko application (the production-ready counterpart to `serve`) | <a href="https://npmjs.org/package/@marko/build"><img src="https://img.shields.io/npm/v/@marko/build.svg" alt="NPM Version"/></a>             |
| [compile](https://github.com/marko-js/cli/blob/master/packages/compile/README.md)         | 🛠 Compile components for both node and browsers                                       | <a href="https://npmjs.org/package/@marko/compile"><img src="https://img.shields.io/npm/v/@marko/compile.svg" alt="NPM Version"/></a>         |
| [migrate](https://github.com/marko-js/cli/blob/master/packages/migrate/README.md)         | ✨ Update Marko components to remove usage of deprecated apis                         | <a href="https://npmjs.org/package/@marko/migrate"><img src="https://img.shields.io/npm/v/@marko/migrate.svg" alt="NPM Version"/></a>         |
| [prettyprint](https://github.com/marko-js/cli/blob/master/packages/prettyprint/README.md) | 💅 Reformat Marko source files for consistency and beauty                             | <a href="https://npmjs.org/package/@marko/prettyprint"><img src="https://img.shields.io/npm/v/@marko/prettyprint.svg" alt="NPM Version"/></a> |
| [test](https://github.com/marko-js/cli/blob/master/packages/test/README.md)               | ✅ Test marko components in both node and browsers                                    | <a href="https://npmjs.org/package/@marko/test"><img src="https://img.shields.io/npm/v/@marko/test.svg" alt="NPM Version"/></a>               |

Each command is also distrubuted as a separate npm package (`@marko/<command>`) which provides a programmatic API that can be used from node.

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
