<h1 align="center">
  <!-- Logo -->
  <br/>
  @marko/prettyprint
	<br/>

  <!-- Stability -->
  <a href="https://nodejs.org/api/documentation.html#documentation_stability_index">
    <img src="https://img.shields.io/badge/stability-stable-green.svg" alt="API Stability"/>
  </a>
  <!-- NPM Version -->
  <a href="https://npmjs.org/package/@marko/prettyprint">
    <img src="https://img.shields.io/npm/v/@marko/prettyprint.svg" alt="NPM Version"/>
  </a>
  <!-- Downloads -->
  <a href="https://npmjs.org/package/@marko/prettyprint">
    <img src="https://img.shields.io/npm/dm/@marko/prettyprint.svg" alt="Downloads"/>
  </a>
</h1>

Prettyprint Marko template files in the syntax of your choice.

# CLI

## Getting Started

```terminal
npm install @marko/prettyprint
marko-prettyprint template.marko
```

or

```terminal
npx @marko/prettyprint template.marko
```

## Example

```terminal
# Pretty print a single file.
marko-prettyprint template.marko --syntax html

# Pretty print all Marko files in a directory.
marko-prettyprint . --syntax html
```

## Options

- `--eol`: The EOL sequence (defaults to `require('os').EOL`)
- `--filename`: The path to the template being pretty printed (required unless `prettyPrintFile(filename, options)` is used)
- `--indent`: The indent string (defaults to a `String` with four spaces)
- `--noSemi`: If set, will format JS without semicolons.
- `--singleQuote`: If set, will prefer single quotes.
- `--maxLen`: The max line length (defaults to `80`, set to `-1` to disable)
- `--configFiles`: Should search for `.marko-prettyprint`/`.editorconfig` files? (defaults to `true`)
- `--syntax`: The syntax to use. Can either be `"html"` or `"concise"` (defaults to `"html"`)

# API

## Installation

```terminal
npm install @marko/prettyprint
```

## Example

```javascript
import {
    prettyPrintFile,
    prettyPrintSource,
    prettyPrintAST
} from "@marko/prettyprint";

prettyPrintFile("./path-to-marko-file", options) // -> Output Marko file string.

prettyPrintSource("<div x=1/>", options) // -> Output Marko file string.

const ast = compiler.parseRaw(...);
prettyPrintAST(ast, options) // -> Output Marko file string.
```

# Configuration files

## `.marko-prettyprint` config file

When pretty printing a Marko template, `marko-cli` will search up the directory tree looking for a `.marko-prettyprint` file. This file should be in the JSON format. For example:

_my-project/.marko-prettyprint:_

```json
{
  "indent": "\t",
  "syntax": "concise"
}
```

## `.editorconfig` file

`@marko/prettyprint` also supports [EditorConfig](https://github.com/editorconfig/editorconfig/wiki/EditorConfig-Properties) files for configuring `maxLen`, `indent` and `eol`. For example:

_my-project/.editorconfig:_

```
root = true

[*.marko]
indent_style = space
indent_size = 8
end_of_line = lf
```
