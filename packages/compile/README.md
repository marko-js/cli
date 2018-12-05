<h1 align="center">
  <!-- Logo -->
  <br/>
  @marko/compile
	<br/>

  <!-- Stability -->
  <a href="https://nodejs.org/api/documentation.html#documentation_stability_index">
    <img src="https://img.shields.io/badge/stability-stable-green.svg" alt="API Stability"/>
  </a>
  <!-- NPM Version -->
  <a href="https://npmjs.org/package/@marko/compile">
    <img src="https://img.shields.io/npm/v/@marko/compile.svg" alt="NPM Version"/>
  </a>
  <!-- Downloads -->
  <a href="https://npmjs.org/package/@marko/compile">
    <img src="https://img.shields.io/npm/dm/@marko/compile.svg" alt="Downloads"/>
  </a>
</h1>

Utility to compile Marko templates to JavaScript.

# CLI

## Installation

```terminal
npm install marko-cli
```

## Example

```terminal
marko compile --server ./components/my-component.marko
marko compile --browser ./components/my-component.marko
```

## Options
* `--server`: Compiles a Marko file to render html.
* `--browser`: Compiles a Marko file to render vdom.
* `--files --file -f *`: Provide a pattern to match marko file(s).
* `--ignore`: Provide a pattern to exclude files from being compiled.
* `--clean`: Deletes any compiled `.marko.js` files.

# API

## Installation

```terminal
npm install @marko/compile
```

## Example

```javascript
import compile from "@marko/compile"

compile({
  files: "./components/**/*.marko"
}).then(() => {
  // All files are written to disk.
  console.log("Compiled all files");
});
```

## Options

Options are the same as the CLI options.

