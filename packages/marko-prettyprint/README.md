marko-prettyprint
=================

Prettyprint Marko template files in the syntax of your choice.

# Usage

## JavaScript API

First install the `marko-prettyprint` module:

```bash
npm install marko-prettyprint --save
```

```javascript
var markoPrettyprint = require('marko-prettyprint');

var templatePath = require('path').join(__dirname, 'template.marko');

var src = fs.readFileSync(templatePath, { encoding: 'utf8' });
var prettySrc = markoPrettyprint(src, {
    filename: templatePath,
    syntax: 'html' // 'html' or 'concise' (default is 'html')
});
```

## Command Line

First install the `marko-prettyprint` module:

```bash
npm install marko-prettyprint --global
```

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
