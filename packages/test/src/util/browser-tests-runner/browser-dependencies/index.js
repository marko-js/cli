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

function isObject(val) {
  return val !== null && typeof val === "object";
}

function replaceStaticFilePath(_, pkg, filePath) {
  if (pkg === options.packageName) {
    return path.join(".", filePath);
  }

  return path.join("./node_modules", pkg, filePath);
}
