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

## Installation

```terminal
npm install marko-cli
```

## Example

```terminal
# Creates a Marko project in a folder called "myapp" in the current directory.
marko create myapp
```

## Options
* `--dir`: Provide a different directory to setup the project in (default to `pwd`).

# API

## Installation

```terminal
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
