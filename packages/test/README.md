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

Utility to test Marko files in both a server and browser environment (bundled with [lasso](https://github.com/lasso-js/lasso)).

## Getting Started

```bash
npm install @marko/test
marko-test ./test.js
```

or

```bash
npx @marko/test ./test.js
```

## Usage:

`marko-test` supports glob patterns for locating and running test files.

Run all of the tests in a project/directory:

```bash
marko-test
```

> equivalent to: `marko-test **/test.js **/test.*.js **/test/*.js`

Run all of the unit tests for a single UI component:

```bash
marko-test ./src/components/app-foo/**/test*.js
```

Run all of the unit tests for all UI components:

```bash
marko-test ./src/components/**/test*.js
```

Run only server tests:

```bash
marko-test ./src/components/**/test*server.js --server
```

Keep server open after the tests finish and disable headless mode for browser tests:

```bash
marko-test --debug
```

All node options are forwarded to the mocha process for server testing, allowing the following:

```bash
# Will start a debugging session on the spawned mocha process.
marko-test --server --inspect-brk
```

## Writing Tests

The test runner (built on top of [mocha](https://mochajs.org/)) will run server tests in a node environment and browser tests will be bundled with lasso and run in a browser using webdriver.io. The test environment is determined based on the test's filename.

The following will run the test in the **node** environment:

- `test.server.js`
- `test-server.js`
- `foo.test.server.js`
- `foo-test-server.js`

All other matched test files run in the **browser** environment:

- `test.js`
- `test.browser.js`
- `test-browser.js`
- `foo.test.browser.js`
- `foo-test-browser.js`

Below is an example test:

```javascript
const expect = require("chai").expect;
const template = require("../index.marko");
const { render } = require("@marko/testing-library");

it("variant-danger", async function() {
  var { getByRole } = await render(template, { variant: "danger" });
  expect(getByRole("button").getAttribute("class")).to.contain(
    "app-button-danger"
  );
});
```

## Component testing API (deprecated)

The following APIs are deprecated. Prefer to use [`@marko/testing-library`](https://github.com/marko-js/testing-library) instead.

Example of the deprecated testing api:

```js
// the `test` fn passes a `context` (documented below)
test("variant-info", function(context) {
  var output = context.render({ variant: "info" });
  expect(output.$("button").attr("class")).to.equal(
    "app-button app-button-info"
  );
});

// Use test.only to only run a single test:
test.only("foo", function(context) {
  // ...
});

// Use test.skip to skip tests
test.skip("bar", function(context) {
  // ...
});

// Because `context` is passed, mocha's `done` becomes the second parameter
test("foo", function(context, done) {
  setTimeout(done, 1000);
});
```

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

### Snapshots

When a component is rendered, a snapshot of the HTML output will automatically be saved into the `test/snapshots/` directory. This directory should be excluded from source control. For example:

_.gitignore_

```text
**/test/snapshots/
```

## Code coverage

Use [`nyc`](https://github.com/istanbuljs/nyc) to generate coverage reports. Just prefix any test commands with `nyc`:

```
nyc marko-test
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

Under the hood `@marko/test` uses [Webdriver.io](http://webdriver.io) to speak to various browsers.
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

### Chromedriver

As mentioned above [chromedriver](https://www.npmjs.com/package/chromedriver) is used by default for running browser tests. This package is versioned in lockstep with chrome itself and so it is up to you to ensure that you have the appropriate version of `chromedriver` installed to match the version of chrome you have on your local machine.

`chromedriver` is marked as a `peerDependency` of `@marko/test` and so you will need to `npm i chromedriver@YOUR_CHROME_VERSION -D` in order for this to work.
