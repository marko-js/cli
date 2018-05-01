// Capture client logs and forward to server.
["log", "info", "warn", "trace", "error"].forEach(method => {
  const fn = console[method] || console.log || (() => {});
  console[method] = (...args) => {
    send(["console", method, args]);
    fn.apply(console, args);
  };
});

// Forward uncaught excpections.
window.addEventListener("error", ({ error }) => console.error(error));

require("chai").config.includeStack = true;
const BrowserContext = require("./browser-context");
let buffer = [];
let options;

try {
  options = JSON.parse(decodeURIComponent(window.location.search.slice(1)));
} catch (_) {
  options = {};
}

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

window.__run_tests__ = done => {
  const socket = require("engine.io-client")(`ws://${location.host}`);
  socket.once("open", () => {
    window.addEventListener("beforeunload", onUnload);
    const runner = mocha.run();
    const fails = [];
    let timeout;
    queueFlush(); // We write the buffered console output on an interval.

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
      window.removeEventListener("beforeunload", onUnload);
      clearTimeout(timeout);
      flush(() =>
        done({
          success: !fails.length,
          coverage: window.__coverage__
        })
      );
    });

    function flush(cb) {
      if (buffer.length) {
        socket.send(JSON.stringify(buffer), cb);
        buffer = [];
      } else {
        cb();
      }
    }

    function queueFlush() {
      timeout = setTimeout(() => flush(queueFlush), 100);
    }

    function onUnload() {
      // If the browser navigates before the tests have finished mark the test as failing.
      console.log(
        "\nBrowser unexpectedly navigated during tests." +
          "\n@marko/test does not support navigation.\n"
      );
      flush();
      done({ success: false });
    }
  });
};

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
  buffer.push(...args);
}

function flattenTitles(test) {
  var titles = [];
  while (test.parent.title) {
    titles.push(test.parent.title);
    test = test.parent;
  }
  return titles.reverse();
}

function isPromise(obj) {
  return obj && obj.then && typeof obj.then === "function";
}
