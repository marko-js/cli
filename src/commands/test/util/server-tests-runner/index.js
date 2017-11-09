"use strict";

var spawn = require("child-process-promise").spawn;

function camelCaseToDash(str) {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

/**
* Takes the configuration options provided by `markoDevTools.config.mochaOptions`
* and converts them to command line args passed to mocha
*
* e.g.
*
* { timeout: 5000, useColors: true } => ['--timoeut', 5000, 'colors', true]
*/
function convertMochaConfigToArgs(config) {
  let args = [];

  for (let key in config) {
    let argName = camelCaseToDash(key);
    let argValue = config[key];
    args.push(`--${argName}`);
    args.push(argValue);
  }
  return args;
}

exports.run = function(allTests, options, devTools) {
  var filteredTests = allTests.filter(test => {
    return test.env === "server" || test.env === "both";
  });

  if (!filteredTests.length) {
    return;
  }

  var testsJSON = JSON.stringify(filteredTests);
  var mochaBin = require.resolve("mocha/bin/mocha");
  var mochaTestsServer = require.resolve("./mocha-tests-server.js");
  var env = Object.assign({}, process.env);
  env.MARKO_DEVTOOLS_TESTS = testsJSON;
  env.MARKO_DEVTOOLS_ROOT = devTools.__dirname;

  let spawnArgs = [mochaTestsServer];
  let mochaOptions;

  if ((mochaOptions = devTools.config.mochaOptions)) {
    const convertedMochaArgs = convertMochaConfigToArgs(mochaOptions);

    if (convertedMochaArgs.length) {
      spawnArgs = spawnArgs.concat(convertedMochaArgs);
    }
  }

  return spawn(mochaBin, spawnArgs, {
    cwd: devTools.cwd,
    env,
    stdio: "inherit"
  }).catch(err => {
    console.error("Error spawning mocha from marko-cli", err);
    process.exit(1);
  });
};
