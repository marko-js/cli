'use strict';

var loadTests = require('./util/loadTests');
var runServerTests = require('./util/runServerTests');
var runBrowserTests = require('./util/runBrowserTests');

module.exports = function run(options, devTools) {
    return loadTests(devTools.cwd, options.patterns)
        .then((tests) => {
            var promise = Promise.resolve();

            if (options.server) {
                promise = promise.then(() => {
                    return runServerTests(tests, devTools);
                });
            }

            if (options.browser) {
                promise = promise.then(() => {
                    return runBrowserTests(tests, devTools);
                });
            }

            return promise;
        });
};