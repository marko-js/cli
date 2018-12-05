<h1 align="center">
  <!-- Logo -->
  <br/>
  @marko/migrate
	<br/>

  <!-- Stability -->
  <a href="https://nodejs.org/api/documentation.html#documentation_stability_index">
    <img src="https://img.shields.io/badge/stability-stable-green.svg" alt="API Stability"/>
  </a>
  <!-- NPM Version -->
  <a href="https://npmjs.org/package/@marko/migrate">
    <img src="https://img.shields.io/npm/v/@marko/migrate.svg" alt="NPM Version"/>
  </a>
  <!-- Downloads -->
  <a href="https://npmjs.org/package/@marko/migrate">
    <img src="https://img.shields.io/npm/dm/@marko/migrate.svg" alt="Downloads"/>
  </a>
</h1>

Utility to migrate Marko templates to avoid using deprecated features.

# CLI

## Installation

```terminal
npm install marko-cli
```

## Example

```terminal
marko migrate ./components/my-component.marko
```

## Options

* `--indent`: The indent string to use when printing the migrated source (defaults to a `String` with four spaces)
* `--noSemi`: If set, will format JS without semicolons when printing the migrated source.
* `--singleQuote`: If set, will prefer single quotes when printing the migrated source.
* `--maxLen`: The max line length to use when printing the migrated source (defaults to `80`, set to `-1` to disable)
* `--syntax`: The syntax to use when printing the migrated source. Can either be `"html"` or `"concise"` (defaults to `"html"`)

# API

## Installation

```terminal
npm install @marko/migrate
```

## Example

```javascript
import migrate from "@marko/migrate"

migrate({
  files: "./components/**/*.marko"
}).then(() => {
  // All files are written to disk.
  console.log("migrated all files");
});
```

## Options

Options are the same as the CLI options.

