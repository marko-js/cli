'use strict';

var loadTests = require('./util/loadTests');
var serverTestsRunner = require('./util/server-tests-runner');
var browserTestsRunner = require('./util/browser-tests-runner');
var path = require('path');

module.exports = function run(options, devTools) {
    return loadTests(devTools.cwd, options.patterns, devTools)
        .then((tests) => {
            var promise = Promise.resolve();

            if (options.server) {
                promise = promise.then(() => {
                    return serverTestsRunner.run(tests, options, devTools);
                });
            }

            if (options.browser) {
                promise = promise.then(() => {
                    return browserTestsRunner.run(tests, options, devTools);
                });
            }

            return promise;
        });
};