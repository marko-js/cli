Marko CLI
==============

Developer tools for Marko.

# Installation

Global installation:

```bash
npm install marko-cli --global
```

Local installation:

```bash
npm install marko-cli --save-dev
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

### create

Used to create a template Marko project in a specific directory.

Usage:

Create a Marko project in the current directory:

```bash
marko create myapp
```

Create a Marko project in a specific directory:

```bash
marko create myapp --dir /Users/me/Desktop
```

### test

Used to run unit tests for UI components. `marko test` supports glob patterns
for locating and running test files. See [Component Testing](#component-testing) below for more
details on how to write unit tests for UI components.

Usage:

Run all of the tests in a project/directory:

```bash
marko test
```

Run all of the unit tests for a single UI component:

```bash
marko test ./src/components/app-foo/**/test*.js
```

Run all of the unit tests for all UI components:

```bash
marko test ./src/components/**/test*.js
```

Run only server tests:

```bash
marko test ./src/components/**/test*server.js --server
```

# Component testing

Marko CLI includes a testing framework (built on top of [mocha](https://mochajs.org/)) that targets UI components built using Marko or Marko Widgets. Each UI
component may include test files alongside components or in a `test/` directory that consists of one or more JavaScript test files with a name in any of the
following formats:

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

// Use test.skip to skip tests
test.skip('bar', function(context) {
    // ...
});
```

## Component testing API

### Globals

#### `it(desc, [done])`

#### `test(desc, context[, done])`

#### `test.only(desc, context[, done])`

#### `test.skip(desc, context[, done])`

### `Context`

#### `render(data) : RenderResult`

### `RenderResult`

#### `$(selector)`

Returns a jQuery-compatible object for querying the rendered DOM. Utilizes [cheerio](https://github.com/cheeriojs/cheerio).

#### `html`

The output HTML string.

#### `component`

***In-browser only***

Returns a rendered instance of the component.

#### `widget`

***In-browser only***

This is an alias for the above `component` getter.

## Snapshots

When a component is rendered, a snapshot of the HTML output will automatically be saved into the `test/snapshots/` directory. This directory should be excluded from source control. For example:

_.gitignore_

```text
**/test/snapshots/
```

## Code coverage

Use [`nyc`](https://github.com/istanbuljs/nyc) to generate coverage reports.  Just prefix any test commands with `nyc`:

```
nyc marko test
```

# Plugins

Marko CLI supports plugins as JavaScript functions:

```javascript
module.exports = function(markoCli) {
    // Run any initialization code:
    require('app-module-path').addPath(__dirname);

    // Register new commands...
    //
    // Add support for: `marko my-command arg0 arg1 ... argn`
    markoCli.addCommand('my-command', {
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

    markoCli.plugin(require('marko-cli-my-plugin'));
}
```

## `marko-cli.js`

You can provide a package-specific plugin by creating a `marko-cli.js` file at the root of your project:

_my-app/marko-cli.js:_

```javascript
module.exports = function(markoCli) {
    // ...
}
```

A package-specific plugin will automatically be loaded when `marko` is launched.

Some options can be specified on the `config` object that `markoCli` exposes.

For example, shared test dependencies can be specified with the `dependencies` option.

```javascript
module.exports = function(markoCli) {
    markoCli.config.browserTestDependencies = [
        'bluebird/js/browser/bluebird.core.js',
        'require-run: ./tools/myDependency.js',
    ];
}
```

For more info on how to specify dependencies can be found [here](https://github.com/lasso-js/lasso#dependencies).

### Configuring Lasso

Lasso plugins and transforms can also be specified using the `browserBuilder` option.

_my-app/marko-cli.js:_

```javascript
module.exports = function(markoCli) {
    markoCli.config.browserBuilder = {
        plugins: [
            'lasso-marko',
            'lasso-less'
        ],
        require: {
           transforms: [
               {
                   transform: 'lasso-babel-transform'
               }
           ]
        }
    };
}
```


### Configuring PhantomJS

You can configure PhantomJS for browser tests using `markoCli.config.phantomOptions`.
[Supported `mocha-phantomjs-core` options](https://github.com/nathanboktae/mocha-phantomjs-core#config):

_my-app/marko-cli.js:_

```javascript
module.exports = function(markoCli) {
    markoCli.config.phantomOptions = {
        timeout: 5000,
        useColors: true
    };
}
```

### Configuring Mocha

You can easily configure Mocha for server-side tests using `markoCli.config.mochaOptions`.
[Supported `mocha` options](https://mochajs.org/#usage), and should be written
in camel case:

_my-app/marko-cli.js:_

```javascript
module.exports = function(markoCli) {
    markoCli.config.mochaOptions = {
        timeout: 5000,
        colors: true
    };
}
```

# TODO

- Don't write compiled templates to disk
- Allow mocks for custom tags
- File watching when running tests
    - `marko test --watch`
- Helper API for simulating DOM events
- Plugin API for adding helpers to `context`
- In-browser UI component viewer with file watching
    - Drop down for inputs
    - Editor for input data
- In-browser project explorer (with links to run browser tests and view UI components)
- Image snapshots
- Testing in jsdom
- Launching tests in multiple browsers (both headless and real browsers)
