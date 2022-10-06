<h1 align="center">
  <!-- Logo -->
  <br/>
  @marko/create
	<br/>

  <!-- Stability -->
  <a href="https://nodejs.org/api/documentation.html#documentation_stability_index">
    <img src="https://img.shields.io/badge/stability-stable-green.svg" alt="API Stability"/>
  </a>
  <!-- NPM Version -->
  <a href="https://npmjs.org/package/@marko/create">
    <img src="https://img.shields.io/npm/v/@marko/create.svg" alt="NPM Version"/>
  </a>
  <!-- Downloads -->
  <a href="https://npmjs.org/package/@marko/create">
    <img src="https://img.shields.io/npm/dm/@marko/create.svg" alt="Downloads"/>
  </a>
</h1>

Used to create a template Marko project in a specific directory.

# CLI

## Example

### npm

```bash
# Creates a Marko project
npm init marko
# Creates a project called "myapp" from the "webpack" example template
npm init marko myapp -- --template webpack
```

### yarn

```bash
yarn create marko
```

### pnpm

```
pnpx @marko/create
```

## Options

- `--dir`: Provide a different directory to setup the project in (default to `pwd`).
- `--template`: The name of an example from [marko-js/examples](https://github.com/marko-js/examples/tree/master/examples).
  - An example name
    ```bash
    webpack
    rollup
    ```
  - A tag/branch/commit other than `master` is supported
    ```bash
    basic#next     # example branch
    webpack#v1.2.3 # repo release tag
    rollup#62e9fb1 # repo commit hash
    ```
- `--installer`: Override the package manager used to install dependencies. By default will determine from create command and fallback to `npm`.
  - ```bash
    marko-create --installer pnpm
    ```

# API

## Installation

```bash
npm install @marko/create
```

## Example

```javascript
import { join } from "path";
import create from "@marko/create";

create({
  dir: join(__dirname, "myapp")
}).then(() => {
  // Project as been created and dependencies installed.
  console.log("Project created");
});
```

## Options

Options are the same as the CLI options.
