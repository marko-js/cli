const socket = require("engine.io-client")(`ws://${location.host}`);
const stripAnsi = require("strip-ansi");
const { inspect } = require("util");
const path = require("path");
const INSPECT_OPTIONS = { colors: true };
const STACK_REGEXP = /(?:https?:\/\/[^:/]+(?::\d+)?\/)?static\/[^/]+\/(.+?)\$[^/]+(.+?)(?=:\d+:\d+)/g;

// Capture client logs and forward to server.
["log", "info", "warn", "trace", "error"].forEach(method => {
  const fn = console[method] || console.log || (() => {});
  console[method] = (...args) => {
    send(["console", method, args.map(inspectObject)]);
    fn.apply(console, args.map(stripAnsi));
  };
});

// Forward uncaught excpections.
window.addEventListener("error", ev => {
  if (!window.__test_result__) {
    window.__test_result__ = { success: false };
  }

  console.error(ev.error);
  ev.preventDefault();
});
window.addEventListener("beforeunload", () => {
  if (!window.__test_result__) {
    // If the browser navigates before the tests have finished mark the test as failing.
    console.log(
      "\nBrowser unexpectedly navigated during tests." +
        "\n@marko/test does not support navigation.\n"
    );
    window.__test_result__ = { success: false };
  }
});

require("chai").config.includeStack = true;
const BrowserContext = require("./browser-context");
let options;

try {
  options = JSON.parse(decodeURIComponent(window.location.search.slice(1)));
} catch (_) {
  options = {};
}

const mocha = require("mocha/mocha");

// Apply mocha options.
const mochaOptions = {
  ...options.mochaOptions,
  reporter: "spec",
  useColors: true,
  ui: "bdd"
};

Object.keys(mochaOptions).forEach(key => {
  if (typeof mocha[key] === "function") {
    mocha[key](mochaOptions[key]);
  }
});

setTimeout(() => {
  if (window.__test_result__) {
    return;
  }

  const runner = mocha.run();
  const fails = [];

  runner.on("fail", (test, err) => {
    fails.push({
      name: test.title,
      result: false,
      message: err.message,
      stack: err.stack,
      titles: flattenTitles(test)
    });
  });

  runner.on("end", () => {
    window.mochaResults = runner.stats;
    window.mochaResults.reports = fails;
    window.__test_result__ = {
      success: !fails.length,
      coverage: window.__coverage__
    };
  });
});

window.__init_test__ = (test, component, func) => {
  test.component = component;
  const context = new BrowserContext(test);
  window.test = (name, handler) => runTest(it, name, handler, context);
  Object.keys(it).forEach(function(key) {
    if (typeof it[key] === "function") {
      window.test[key] = (name, handler) =>
        runTest(it[key], name, handler, context);
    }
  });

  let desc = test.componentName;

  if (test.groupName) {
    desc += " - " + test.groupName;
  }

  describe(desc, func);

  window.test = null;
};

function runTest(it, name, handler, context) {
  if (handler.length <= 1) {
    it(name, function() {
      context.name = name;
      const testFunction = handler.call(this, context);
      if (isPromise(testFunction)) {
        return testFunction
          .then(result => {
            context._afterTest();
            return result;
          })
          .catch(err => {
            context._afterTest();
            throw err;
          });
      } else {
        context._afterTest();
      }
    });
  } else if (handler.length >= 2) {
    it(name, function(done) {
      context.name = name;
      handler.call(this, context, function(err) {
        context._afterTest();
        done(err);
      });
    });
  }
}

function send(...args) {
  socket.send(JSON.stringify(args));
}

function flattenTitles(test) {
  var titles = [];
  while (test.parent.title) {
    titles.push(test.parent.title);
    test = test.parent;
  }
  return titles.reverse();
}

function inspectObject(val) {
  const result = isObject(val) ? inspect(val, INSPECT_OPTIONS) : val;

  if (typeof result === "string") {
    return result.replace(STACK_REGEXP, replaceStaticFilePath);
  }

  return result;
}

function isPromise(obj) {
  return obj && obj.then && typeof obj.then === "function";
}

function isObject(val) {
  return val !== null && typeof val === "object";
}

function replaceStaticFilePath(_, pkg, filePath) {
  if (pkg === options.packageName) {
    return path.join(".", filePath);
  }

  return path.join("./node_modules", pkg, filePath);
}
