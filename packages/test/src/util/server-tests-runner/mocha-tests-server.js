"use strict";

var path = require("path");

var MarkoDevTools;
if (process.env.MARKO_TESTS_ROOT) {
  const markoDevToolsRoot = process.env.MARKO_TESTS_ROOT;
  MarkoDevTools = require(path.join(markoDevToolsRoot, "MarkoDevTools"));
}

require("marko/node-require").install();

function requireNoOp() {
  /* no-op */
}

[".css", ".less"].forEach((ext) => {
  require.extensions[ext] = requireNoOp;
});

var devTools;
if (MarkoDevTools) {
  devTools = new MarkoDevTools();
  devTools.emit("beforeRunServerTests");
}

var ServerContext = require("./ServerContext");
var testsJSON = process.env.MARKO_TESTS;

var tests = JSON.parse(testsJSON);

function groupTests(tests) {
  var componentNodes = {};
  var groupedTests = [];

  tests.forEach((test) => {
    var componentName = test.componentName;
    var componentNode = componentNodes[componentName];
    if (!componentNode) {
      componentNodes[componentName] = componentNode = {
        componentName,
        tests: [],
      };
      groupedTests.push(componentNode);
    }

    componentNode.tests.push(test);
  });

  return groupedTests;
}

tests = groupTests(tests);

tests.forEach((componentNode) => {
  var componentName = componentNode.componentName;

  function loadTest(test) {
    if (devTools) {
      devTools.emit("beforeLoadServerTest", test);
    }

    var file = test.file;
    var context = new ServerContext(test);

    function runTest(it, name, handler) {
      if (handler.length <= 1) {
        it(name, function () {
          context.name = name;
          return handler.call(this, context);
        });
      } else if (handler.length >= 2) {
        it(name, function (done) {
          context.name = name;
          handler.call(this, context, done);
        });
      }
    }

    global.test = function (name, handler) {
      runTest(it, name, handler);
    };

    global.test.only = function (name, handler) {
      runTest(it.only, name, handler);
    };

    if (test.groupName) {
      describe(test.groupName, function () {
        require(file);
      });
    } else {
      require(file);
    }
  }

  describe(componentName, function () {
    componentNode.tests.forEach(loadTest);
  });
});
