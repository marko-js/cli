<h1 align="center">
  <!-- Logo -->
  <br/>
  @marko/prebuild
	<br/>

  <!-- Stability -->
  <a href="https://nodejs.org/api/documentation.html#documentation_stability_index">
    <img src="https://img.shields.io/badge/stability-experimental-orange.svg" alt="API Stability"/>
  </a>
  <!-- NPM Version -->
  <a href="https://npmjs.org/package/@marko/prebuild">
    <img src="https://img.shields.io/npm/v/@marko/prebuild.svg" alt="NPM Version"/>
  </a>
  <!-- Downloads -->
  <a href="https://npmjs.org/package/@marko/prebuild">
    <img src="https://img.shields.io/npm/dm/@marko/prebuild.svg" alt="Downloads"/>
  </a>
</h1>

Utility to precompile Marko templates using [lasso prebuilds](https://github.com/lasso-js/lasso).

# CLI

_This package does not yet expose a CLI_

# API

## Installation

```terminal
npm install @marko/prebuild
```

## Example

```javascript
import prebuild from "@marko/prebuild";

prebuild({
  config: "./lasso-config.json", // Either a lasso config object, or a path to one.
  flags: ["skin-ds6"], // Lasso flags to use when building the pages.
  pages: [
    // A list of paths to marko templates to prebuild.
    "src/routes/index/index.marko"
  ]
}).then(() => {
  // All templates have their prebuild.json files written to disk.
  console.log("Prebuild completed");
});
```
