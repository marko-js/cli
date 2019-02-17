<h1 align="center">
  <!-- Logo -->
  <br/>
  @marko/build
	<br/>

  <!-- Stability -->
  <a href="https://nodejs.org/api/documentation.html#documentation_stability_index">
    <img src="https://img.shields.io/badge/stability-stable-green.svg" alt="API Stability"/>
  </a>
  <!-- NPM Version -->
  <a href="https://npmjs.org/package/@marko/build">
    <img src="https://img.shields.io/npm/v/@marko/build.svg" alt="NPM Version"/>
  </a>
  <!-- Downloads -->
  <a href="https://npmjs.org/package/@marko/build">
    <img src="https://img.shields.io/npm/dm/@marko/build.svg" alt="Downloads"/>
  </a>
</h1>

Utility to build a node server from a marko file

# CLI

## Installation

```terminal
npm install marko-cli
```

## Example

```terminal
marko build ./my-page.marko
marko build ./components/my-component.marko
```

## Options

- `--file -f *`: The marko file to build.
- `--output -o`: Where to write the build.

# API

## Installation

```terminal
npm install @marko/build
```

## Example

```javascript
import build from "@marko/build";

build({
  file: "./component.marko"
}).run(() => {
  console.log("Build complete");
});
```

The object returned from the `build` function is a [webpack compiler instance](https://webpack.js.org/api/node/#compiler-instance).

## Options

- `file` - the marko file to build
- `output` - where to write the build
- `serverPlugins` - additional webpack plugins to run on the server build
- `clientPlugins` - additional webpack plugins to run on the client build
- `production` - whether to build in production mode
