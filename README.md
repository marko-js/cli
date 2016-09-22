Marko DevTools
==============

Developer tools for Marko.

# Installation

Global installation:

```bash
npm install marko-devtools --global
```

Local installation:

```bash
npm install marko-devtools --save-dev
```

# Usage

```bash
marko <command> arg0 arg1 ... argn
```

Example:

```bash
marko test src/components/app-foo
```

# Command line interface (CLI)

## Core commands

### test

Used to run unit tests for UI components. See [Component Testing](#ComponentTesting) below for more details on how to write unit tests for UI components.

Usage:

Run all of the tests in a project/directory:

```bash
marko test
```

Run all of the unit tests for a single UI component:

```bash
marko test src/components/app-foo
```

Run all of the unit tests for all UI components:

```bash
marko test src/components/
```

Run only server tests:

```bash
marko test src/components/ --server
```

Glob patterns

```bash
marko test **/test/test.js
```

# Component testing

Marko DevTools includes a testing framework (built on top of [mocha](https://mochajs.org/)) that targets UI components built using Marko or Marko Widgets. Each UI component is expected to have a `test/` directory that consists of one or more JavaScript test files with a name in any of the following formats:

- `test.js` - runs only in the browser
- `test.server.js` _or_ `test-server.js` - runs only on the server
- `test.browser.js` _or_ `test-browser.js` - runs only in the browser

An optional prefix can also be provided for grouping tests:

- `foo.test.js` _or_ `foo-test.js`
- `foo.test.server.js` _or_ `foo-test-server.js`
- `foo.test.browser.js` _or_ `foo-test-browser.js`

Below is a sample set of tests:

```javascript
/* globals test */

var expect = require('chai').expect;


test('variant-danger', function(context) {
    var output = context.render({ variant: 'danger' });
    expect(output.html).to.contain('app-button-danger');
});

// A similar test can be done using jQuery selectors (powered by cheerio):
test('variant-info', function(context) {
    var output = context.render({ variant: 'info' });
    expect(output.$('button').attr('class')).to.equal('app-button app-button-info');
});

// Async test:
test('my async test', function(context, done) {
    setTimeout(function() {
        done();
    }, 100);
});

// Use test.only to only run a single test:
test.only('foo', function(context) {
    // ...
});
```

## Snapshots

When a component is rendered, a snapshot will automatically be saved into the `test/snapshots/` directory. This directory should be excluded from source control. For example:

_.gitignore_

```text
**/test/snapshots/
```

# Plugins

Marko DevTools supports plugins as JavaScript functions:

```javascript
module.exports = function(markoDevTools) {
    // Run any initialization code:
    require('app-module-path').addPath(__dirname);

    // Register new commands...
    //
    // Add support for: `marko my-command arg0 arg1 ... argn`
    markoDevTools.addCommand('my-command', {
        run(options) {
            return new Promise((resolve, reject) => {
                // Run the command
            });
        },

        parse(args) {
            var options = {};
            return options;
        }
    });

    markoDevTools.plugin(require('marko-devtools-my-plugin'));
}
```

You can provide a package-specific plugin by creating a `.marko-devtools.js` file at the root of your project:

_my-app/.marko-devtools.js:_

```javascript
module.exports = function(markoDevTools) {
    // ...
}
```

A package-specific plugin will automatically be loaded when `marko` is launched.