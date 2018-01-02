marko-prettyprint
=================

Prettyprint Marko template files in the syntax and with the options of your choice.

# Installation

Global install of the command line utility:

```bash
npm install marko-prettyprint --global
```

Local project install:

```bash
npm install marko-prettyprint --save
```

# Usage

## Pretty print a single file from the command line


```bash
marko-prettyprint template.marko --syntax html
```

## Pretty print a directory tree from the command line


```bash
marko-prettyprint . --syntax html
```

## Pretty print a file in a Node.js app

```javascript
var prettyPrintFile = require('marko-prettyprint').prettyPrintFile;

var templatePath = require('path').join(__dirname, 'template.marko');
var options = {
    syntax: 'html'
};

var prettySrc = prettyPrintFile(templatePath, options);
```

# Options

- `eol` - The EOL sequence (defaults to `require('os').EOL`)
- `filename` - The path to the template being pretty printed (required unless `prettyPrintFile(filename, options)` is used)
- `indent` - The indent string (defaults to a `String` with four spaces)
- `noSemi` - If set, will format JS without semicolons.
- `singleQuote` - If set, will prefer single quotes.
- `maxLen` - The max line length (defaults to `80`, set to `-1` to disable)
- `configFiles` - Should search for `.marko-prettyprint`/`.editorconfig` files? (defaults to `true`)
- `syntax` - The syntax to use. Can either be `"html"` or `"concise"` (defaults to `"html"`)

# Configuration files

## `.marko-prettyprint` config file

When pretty printing a Marko template, `marko-prettyprint` will search up the directory tree looking for a `.marko-prettyprint` file. This file should be in the JSON format. For example:

_my-project/.marko-prettyprint:_

```json
{
    "indent": "\t",
    "syntax": "concise"
}
```

## `.editorconfig` file

`marko-prettyprint` also supports [EditorConfig](https://github.com/editorconfig/editorconfig/wiki/EditorConfig-Properties) files for configuring `maxLen`, `indent` and `eol`. For example:

_my-project/.editorconfig:_

```
root = true

[*.marko]
indent_style = space
indent_size = 8
end_of_line = lf
```

# API

## JavaScript API

### `require('marko-prettyprint')`

#### `prettyPrintSource(src, options)`

#### `prettyPrintFile(filename, options)`

#### `prettyPrintAST(ast, options)`


## Command Line

To recursively prettyprint all Marko v3 templates in a directory to use the HTML syntax:

```
marko-prettyprint . --syntax html
```

To recursively prettyprint all Marko v3 templates in a directory to use the HTML syntax:

```
marko-prettyprint . --syntax concise
```

Individual files and directories can also be prettyprinted:

```
marko-prettyprint src/ foo/
marko-prettyprint template1.marko template2.marko
```

The maximum line length (defaults to `80`) can be also be set:

```
marko-prettyprint . --syntax html --max-len 120
```
