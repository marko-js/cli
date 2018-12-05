<h1 align="center">
  <!-- Logo -->
  <br/>
  @marko/test
	<br/>

  <!-- Stability -->
  <a href="https://nodejs.org/api/documentation.html#documentation_stability_index">
    <img src="https://img.shields.io/badge/stability-stable-green.svg" alt="API Stability"/>
  </a>
  <!-- NPM Version -->
  <a href="https://npmjs.org/package/@marko/test">
    <img src="https://img.shields.io/npm/v/@marko/test.svg" alt="NPM Version"/>
  </a>
  <!-- Downloads -->
  <a href="https://npmjs.org/package/@marko/test">
    <img src="https://img.shields.io/npm/dm/@marko/test.svg" alt="Downloads"/>
  </a>
</h1>

Utility to test Marko files in both a server and browser environment.

## Installation

```terminal
npm install marko-cli
```

## Usage:

`marko test` supports glob patterns
for locating and running test files. See [Component Testing](#component-testing) below for more
details on how to write unit tests for UI components.

Run all of the tests in a project/directory:

```terminal
marko test
```

Run all of the unit tests for a single UI component:

```terminal
marko test ./src/components/app-foo/**/test*.js
```

Run all of the unit tests for all UI components:

```terminal
marko test ./src/components/**/test*.js
```

Run only server tests:

```terminal
marko test ./src/components/**/test*server.js --server
```

Keep server open after the tests finish and disable headless mode for browser tests:

```terminal
marko test --debug
```

All node options are forwarded to the mocha process for server testing, allowing the following:

```terminal
# Will start a debugging session on the spawned mocha process.
marko test --server --inspect-brk
```

## Component testing

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

var expect = require("chai").expect;

test("variant-danger", function(context) {
  var output = context.render({ variant: "danger" });
  expect(output.html).to.contain("app-button-danger");
});

// A similar test can be done using jQuery selectors (powered by cheerio):
test("variant-info", function(context) {
  var output = context.render({ variant: "info" });
  expect(output.$("button").attr("class")).to.equal(
    "app-button app-button-info"
  );
});

// Async test:
test("my async test", function(context, done) {
  setTimeout(function() {
    done();
  }, 100);
});

// Use test.only to only run a single test:
test.only("foo", function(context) {
  // ...
});

// Use test.skip to skip tests
test.skip("bar", function(context) {
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

**_In-browser only_**

Returns a rendered instance of the component.

#### `widget`

**_In-browser only_**

This is an alias for the above `component` getter.

## Snapshots

When a component is rendered, a snapshot of the HTML output will automatically be saved into the `test/snapshots/` directory. This directory should be excluded from source control. For example:

_.gitignore_

```text
**/test/snapshots/
```

## Code coverage

Use [`nyc`](https://github.com/istanbuljs/nyc) to generate coverage reports. Just prefix any test commands with `nyc`:

```
nyc marko test
```

# Plugins

Marko CLI supports plugins as JavaScript functions:

```javascript
module.exports = function(markoCli) {
  // Run any initialization code:
  require("app-module-path").addPath(__dirname);

  // Register new commands...
  //
  // Add support for: `marko my-command arg0 arg1 ... argn`
  markoCli.addCommand("my-command", {
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

  markoCli.plugin(require("marko-cli-my-plugin"));
};
```

## `marko-cli.js`

You can provide a package-specific plugin by creating a `marko-cli.js` file at the root of your project:

_my-app/marko-cli.js:_

```javascript
module.exports = function(markoCli) {
  // ...
};
```

A package-specific plugin will automatically be loaded when `marko` is launched.

Some options can be specified on the `config` object that `markoCli` exposes.

For example, shared test dependencies can be specified with the `dependencies` option.

```javascript
module.exports = function(markoCli) {
  markoCli.config.browserTestDependencies = [
    "bluebird/js/browser/bluebird.core.js",
    "require-run: ./tools/myDependency.js"
  ];
};
```

For more info on how to specify dependencies can be found [here](https://github.com/lasso-js/lasso#dependencies).

### Configuring Lasso

Lasso plugins and transforms can also be specified using the `lassoOptions` option.

_my-app/marko-cli.js:_

```javascript
module.exports = function(markoCli) {
  markoCli.config.lassoOptions = {
    plugins: [
      "lasso-less" // Marko plugin is included by default.
    ],
    require: {
      transforms: [
        {
          transform: "lasso-babel-transform"
        }
      ]
    }
  };
};
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
};
```

### Browser Testing with Webdriver.io

Under the hood `marko test` uses [Webdriver.io](http://webdriver.io) to speak to various browsers.
The test command operates differently than a standard WDIO utility by compiling the tests themselves and running everything in the browser. A websocket is setup with the browser instance to stream logs. A subset of WDIO options are exposed under `markoCli.config.wdioOptions`.

_my-app/marko-cli.js:_

```javascript
module.exports = function(markoCli) {
    markoCli.config.wdioOptions = {
        /**
         * Capabilities are always run in parallel.
         * By default chromedriver will be used if capabilities are left blank.
         */
        capabilities: ...,
        serverPort: 0, // The port to start the test server on (serves your components).
        idleTimeout: 60000, // Automatically disconnect after 1min of inactivity by default.
        suiteTimeout: 600000, // Automatically disconnect after 10 minutes if the tests have not completed by default.
        viewport: {
          // Configure the screen size for any drivers started (defaults below).
          width: 800,
          height: 600
        }
        /**
         * The launcher option allows you change the WDIO config before running, and cleanup afterward.
         * By default the chromedriver is launched, however if `BROWSERSTACK_USERNAME`, `SAUCE_USERNAME`
         * or `TB_KEY` is found in the environment variables a service for that provider will automatically be used.
         */
        launcher: {
            onPrepare(config, capabilities) {
                // Setup WDIO config.
            },
            onComplete() {
                // Cleanup after tests.
            }
        }
    };
}
```
