"use strict";

const spawn = require("child-process-promise").spawn;

function camelCaseToDash(str) {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

/**
 * Takes the configuration options provided by `markoCli.config.mochaOptions`
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

    if (argValue !== false) {
      args.push(`--${argName}`);

      if (argValue !== true) {
        args.push(argValue);
      }
    }
  }
  return args;
}

exports.run = function(allTests, options) {
  let { dir, cliRoot, mochaOptions } = options;
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
  env.MARKO_TESTS = testsJSON;

  // This is only set in marko-cli so that we can execute hooks before and after
  // tests are run
  if (cliRoot) {
    env.MARKO_TESTS_ROOT = cliRoot;
  }

  let spawnArgs = [mochaTestsServer];

  if (mochaOptions) {
    const convertedMochaArgs = convertMochaConfigToArgs(mochaOptions);

    if (convertedMochaArgs.length) {
      spawnArgs = spawnArgs.concat(convertedMochaArgs);
    }
  }

  // Fixes https://github.com/marko-js/marko-util/issues/3. In Mocha 4, the
  // process does not force exit by default without this flag.
  spawnArgs.push("--exit");

  return spawn(mochaBin, spawnArgs, {
    cwd: dir,
    env,
    stdio: "inherit"
  }).catch(err => {
    console.error("Error spawning mocha from marko-cli", err);
    process.exit(1);
  });
};
