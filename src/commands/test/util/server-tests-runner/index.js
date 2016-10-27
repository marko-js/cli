'use strict';

var spawn = require('child-process-promise').spawn;

exports.run = function(allTests, options, devTools) {
    var filteredTests = allTests.filter((test) => {
        return test.env === 'server' || test.env === 'both';
    });

    if (!filteredTests.length) {
        return;
    }

    var testsJSON = JSON.stringify(filteredTests);
    var mochaBin = require.resolve('mocha/bin/mocha');
    var mochaTestsServer = require.resolve('./mocha-tests-server.js');
    var env = Object.assign({}, process.env);
    env.MARKO_DEVTOOLS_TESTS = testsJSON;
    env.MARKO_DEVTOOLS_ROOT = devTools.__dirname;

    return spawn(mochaBin, [mochaTestsServer], {
            cwd: devTools.cwd,
            env,
            stdio: 'inherit'
        })
        .catch((err) => {
            process.exit(1);
        });
};