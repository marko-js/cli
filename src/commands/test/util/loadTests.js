'use strict';

var glob = require('glob');
var async = require('async');
var path = require('path');
var fs = require('fs');
var testRegExp = /^(?:(.+?)[-.])?(?:spec|test)(?:[-.](server|browser))?[.]/i;

var globOptions = {
    matchBase: true,
    absolute: true,
    ignore: ['node_modules/**']
};

function getRenderer(dir) {
    var paths = [
        path.join(dir, 'index'),
        path.join(dir, 'renderer'),
        path.join(dir, 'template.marko')
    ];

    for (var i=0; i<paths.length; i++) {
        var currentPath = paths[i];

        try {
            return require.resolve(currentPath);
        } catch(e) {}
    }

    return undefined;
}



function loadTests(dir, patterns) {
    var tests = [];
    var filesLookup = {};

    function handleFile(file) {
        var basename = path.basename(file);
        var testMatches = testRegExp.exec(basename);

        if (!testMatches) {
            // The file is not a test file
            return;
        }

        if (filesLookup[file]) {
            return;
        }

        filesLookup[file] = true;


        var groupName = testMatches[1];
        var env = testMatches[2] || 'browser';

        var testsDir = path.dirname(file);

        if (path.basename(testsDir) !== 'test') {
            return;
        }

        var componentDir = path.dirname(testsDir);
        var componentName = path.basename(componentDir);

        var renderer = getRenderer(componentDir);

        if (!renderer) {
            return;
        }

        tests.push({
            groupName,
            env,
            componentName,
            componentDir,
            renderer,
            file
        });
    }

    function processPatterns(dir, patterns, callback) {
        var tasks = patterns.map(function(pattern) {
            return function(callback) {

                if (glob.hasMagic(pattern)) {
                    globOptions.cwd = dir;
                    glob(pattern, globOptions, function (err, files) {
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
        var tasks = files.map((file) => {
            return function(callback) {
                var stat;
                try {
                    stat = fs.statSync(file);
                } catch(e) {
                    return callback();
                }

                if (stat.isDirectory()) {
                    let dir = file;
                    let patterns = [
                        '**/test/*.js'
                    ];

                    processPatterns(dir, patterns, callback);
                } else {
                    handleFile(file);
                    return callback();
                }
            };
        });

        async.series(tasks, callback);
    }

    return new Promise((resolve, reject) => {
        processPatterns(dir, patterns, function(err) {
            if (err) {
                return reject(err);
            }

            return resolve(tests);
        });
    });
}

module.exports = loadTests;