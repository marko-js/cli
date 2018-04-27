"use strict";

const glob = require("glob");
const async = require("async");
const path = require("path");
const fs = require("fs");

const globOptions = {
  matchBase: true,
  absolute: true,
  ignore: ["node_modules/**"]
};

function getRenderer(dir) {
  var paths = [
    path.join(dir, "index"),
    path.join(dir, "renderer"),
    path.join(dir, "template.marko")
  ];

  for (var i = 0; i < paths.length; i++) {
    var currentPath = paths[i];

    try {
      return require.resolve(currentPath);
    } catch (e) {
      // ignore
    }
  }

  return undefined;
}

function defaultTestMatcher(file) {
  var testRegExp = /^(?:(.+?)[-.])?(?:spec|test)(?:[-.](server|browser))?[.]/i;
  var basename = path.basename(file);
  var testMatches = testRegExp.exec(basename);

  if (!testMatches) {
    // The file is not a test file
    return false;
  }

  return {
    groupName: testMatches[1],
    env: testMatches[2] || "browser"
  };
}

function loadTests(dir, patterns, { testMatcher } = {}) {
  var tests = [];
  var filesLookup = {};

  testMatcher = testMatcher || defaultTestMatcher;

  function handleFile(file) {
    if (filesLookup[file]) return;

    var testMatches = testMatcher(file);
    if (testMatches === false) return;

    var groupName = testMatches.groupName;
    var env = testMatches.env || "browser";

    filesLookup[file] = true;

    let testsDir = path.dirname(file);

    let componentDir;
    if (testsDir.endsWith("/test")) {
      componentDir = path.dirname(testsDir);
    } else {
      componentDir = testsDir;
    }

    let componentName =
      testMatches.componentName || path.relative(dir, componentDir);
    let rendererPath = testMatches.rendererPath || getRenderer(componentDir);

    if (!rendererPath) {
      return;
    }

    tests.push({
      groupName,
      env,
      componentName,
      componentDir,
      renderer: rendererPath,
      file
    });
  }

  function processPatterns(dir, callback) {
    var tasks = patterns.map(function(pattern) {
      return function(callback) {
        if (glob.hasMagic(pattern)) {
          globOptions.cwd = dir;
          glob(pattern, globOptions, function(err, files) {
            if (err) {
              return callback(err);
            }

            processFiles(files, callback);
          });
        } else {
          return processFiles([path.resolve(dir, pattern)], callback);
        }
      };
    });

    async.series(tasks, callback);
  }

  function processFiles(files, callback) {
    var tasks = files.map(file => {
      return function(callback) {
        var stat;
        try {
          stat = fs.statSync(file);
        } catch (e) {
          return callback();
        }

        if (stat.isDirectory()) {
          let dir = file;
          processPatterns(dir, callback);
        } else {
          handleFile(file);
          return callback();
        }
      };
    });

    async.series(tasks, callback);
  }

  return new Promise((resolve, reject) => {
    processPatterns(dir, function(err) {
      if (err) {
        return reject(err);
      }

      return resolve(tests);
    });
  });
}

module.exports = loadTests;
