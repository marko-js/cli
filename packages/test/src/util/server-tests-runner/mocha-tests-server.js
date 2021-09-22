"use strict";

try {
  require("@marko/compiler/register");
} catch (_) {
  require("marko/node-require").install();
}

require("lasso/node-require-no-op").enable(".css", ".less");

var testsJSON = process.env.MARKO_TESTS;
var tests = JSON.parse(testsJSON);

function groupTests(tests) {
  var componentNodes = {};
  var groupedTests = [];

  tests.forEach(test => {
    var componentName = test.componentName;
    var componentNode = componentNodes[componentName];
    if (!componentNode) {
      componentNodes[componentName] = componentNode = {
        componentName,
        tests: []
      };
      groupedTests.push(componentNode);
    }

    componentNode.tests.push(test);
  });

  return groupedTests;
}

tests = groupTests(tests);

tests.forEach(componentNode => {
  var componentName = componentNode.componentName;

  function loadTest(test) {
    var file = test.file;

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
