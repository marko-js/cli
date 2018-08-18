const path = require("path");
const complain = require("complain");
const loadTests = require("./util/loadTests");
const serverTestsRunner = require("./util/server-tests-runner");
const browserTestsRunner = require("./util/browser-tests-runner");

exports.run = function(options) {
  options.dir = options.dir || process.cwd();
  options.packageName = require(path.join(options.dir, "package.json")).name;

  if (options.server == null) {
    if (options.browser == null) {
      options.server = options.browser = true;
    } else {
      options.server = options.browser !== true;
    }
  }

  if (options.browser == null) {
    options.browser = options.server !== true;
  }

  if (!options.patterns || !options.patterns.length) {
    options.patterns = ["**/test.js", "**/test.*.js", "**/test/*.js"];
  }

  if (options.browserBuilder) {
    options.lassoOptions = options.browserBuilder;
    complain(
      "@marko/test: browserBuilder options is deprecated, please use 'lassoOptions' instead.",
      { location: false }
    );
  }

  if (options.debug) {
    options.mochaOptions = options.mochaOptions || {};
    options.mochaOptions.timeout = 3600000;
  }

  return loadTests(options.dir, options.patterns, {
    testMatcher: options.testMatcher
  }).then(tests => {
    let promise = Promise.resolve();

    if (options.server) {
      promise = promise.then(() => {
        return serverTestsRunner.run(tests, options);
      });
    }

    if (options.browser) {
      promise = promise.then(() => {
        return browserTestsRunner.run(tests, options);
      });
    }

    return promise;
  });
};
