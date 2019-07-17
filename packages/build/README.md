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

## Getting Started

```terminal
npm install @marko/build
marko-build .
```

or

```terminal
npx @marko/build .
```

## Example

```terminal
marko-build .
marko-build ./my-page.marko
```

## Options

- `--output -o`: Where to write the build
- `--static`: Build static HTML files instead of a node server

# Config overrides

While `@marko/build` works out-of-the box without any config, it does allow customizing and extending the default config for unique use-cases.

## Webpack

> **NOTE:** `@marko/build` currently uses webpack to build projects, however, this may change in the future so it's recommended to avoid using a custom webpack config if possible.

In the most extreme case, you can use a custom `webpack.config.js`. This config file is discovered based on the entry that is passed to the cli command, but given that it's a standalone config file, you can use `webpack` directly to build your project as well.

To help configure webpack, `@marko/build` exports a `configBuilder` function that allows you to use the base config, while adding your own customizations.

### Example

**webpack.config.js**

```js
import path from "path";
import { configBuilder } from "@marko/build";
import MyPlugin from "my-plugin";

const { getServerConfig, getBrowserConfigs } = configBuilder({
  entry: path.join(__dirname, "target.marko"),
  production: process.env.NODE_ENV === "production"
});

module.exports = [
  ...getBrowserConfigs(config => {
    config.plugins.push(new MyPlugin());
    return config;
  }),
  getServerConfig(config => {
    config.plugins.push(new MyPlugin());
    return config;
  })
];
```

# API

## Installation

```terminal
npm install @marko/build
```

## `configBuilder`

Returns 3 functions: `getServerConfig`, `getBrowserConfig`, and `getBrowserConfigs`.

### Options

- `entry` - the marko file to build
- `output` - where to write the build
- `production` - whether to build in production mode

## `loadWebpackConfig`

Loads a custom `webpack.config.js` or creates a default array of compiler configs.

### Options

- `entry` - the marko file to build
- `output` - where to write the build
- `production` - whether to build in production mode
