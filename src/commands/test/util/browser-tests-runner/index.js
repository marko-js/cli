'use strict';

require('marko/node-require').install();
require('marko/express');

var Transform = require('stream').Transform;
var express = require('express');
var lasso = require('lasso');
var path = require('path');
var defaultPageTemplate = require('./page-template.marko');
var spawn = require('child-process-promise').spawn;
var fs = require('fs');
var mochaPhantomJSBin = require.resolve('mocha-phantomjs-core');
var phantomjsBinPath = require('phantomjs-prebuilt').path;
var resolveFrom = require('resolve-from');
var shouldCover = !!process.env.NYC_CONFIG;
var parseRequire = require('lasso-require/src/util/parseRequire');

class WrapStream extends Transform {
    constructor(prefix, suffix) {
        super();
        this._prefix = prefix;
        this._suffix = suffix;
        this._firstChunk = true;
    }

    _transform(chunk, encoding, callback) {
        if (this._firstChunk) {
            this._firstChunk = false;
            this.push(this._prefix);
        }

        this.push(chunk);
        callback();
    }

    _flush(callback) {
        this.push(this._suffix);
        callback();
    }
}

function startServer(tests, options, devTools) {
    return new Promise((resolve, reject) => {
        var pageTemplate = options.pageTemplate || defaultPageTemplate;
        var workDir = devTools.config.workDir;
        var outputDir = path.resolve(workDir, 'browser-build');
        var phantomOptions = devTools.config.phantomOptions;

        var browserBuilderConfig = Object.assign(
            {
                outputDir: path.join(outputDir, 'static'),
                urlPrefix: '/static',
                bundlingEnabled: false,
                fingerprintsEnabled: false,
                minify: false,
                plugins: [
                    'lasso-marko'
                ],
                require: {
                    transforms: []
                }
            },
            devTools.config.browserBuilder || {});

        if (shouldCover) {
            browserBuilderConfig.require.transforms.unshift({ transform: require('lasso-istanbul-instrument-transform') })
        }

        var testDependencies = [];

        tests.forEach((test) => {
            var file = test.file;

            testDependencies.push({
                type: 'require',
                path: file,
                run: true,
                virtualModule: {
                    createReadStream: function() {
                        var rendererPath = test.renderer;
                        var testDir = path.dirname(test.file);
                        var relativePath = path.relative(testDir, rendererPath);
                        if (relativePath.charAt(0) !== '.') {
                            relativePath = './' + relativePath;
                        }

                        return fs.createReadStream(file, { encoding: 'utf8' })
                            .pipe(new WrapStream(
                                `$marko_test(${JSON.stringify(test)}, require(${JSON.stringify(relativePath)}), function() { `,
                                `\n});`));
                    },
                    getLastModified() {
                        return new Promise((resolve, reject) => {
                            fs.stat(file, function(err, stat) {
                                if (err) {
                                    return reject(err);
                                }

                                resolve(stat.mtime ? stat.mtime.getTime() : -1);
                            });
                        });
                    },
                    object: false
                }
            });
        });

        var browserDependencies = [
            "mocha/mocha.js",
            "mocha/mocha.css",
            "require-run: " + require.resolve('./setup')
        ];

        var browserTestDependencies = devTools.config.browserTestDependencies;

        if (browserTestDependencies) {
            if (Array.isArray(browserTestDependencies)) {
                // load in any dependencies (if specified)
                browserTestDependencies.forEach(function (dependency) {
                    // resolve paths based on the project's directory
                    if ((typeof dependency === 'string' || dependency instanceof String)) {
                        var parsedDependency = parseRequire(dependency);
                        var type = parsedDependency.type;
                        var path = resolveFrom(devTools.cwd, parsedDependency.path);

                        if (type) {
                            dependency = type + ': ' + path;
                        } else {
                            dependency = path;
                        }
                    } else if ((path = dependency.path)) {
                        dependency.path = resolveFrom(devTools.cwd, path);
                    }

                    browserDependencies.push(dependency);
                });
            } else {
                throw new Error('config.dependencies must be an array');
            }
        }

        browserDependencies = browserDependencies.concat([
            testDependencies,
            {
                "require-run": require.resolve('./mocha-run'),
                "slot": "mocha-run"
            }
        ]);

        var markoWidgetsPath = resolveFrom(devTools.cwd, 'marko-widgets');

        if (markoWidgetsPath) {
            browserDependencies.push('require: ' + markoWidgetsPath);
        }

        var myLasso = lasso.create(browserBuilderConfig);

        var templateData = {
            lasso: myLasso,
            browserDependencies: browserDependencies
        };

        var app = express();

        app.use(require('lasso/middleware').serveStatic({ lasso: myLasso }));
        app.get('/', function(req, res) {
            res.marko(pageTemplate, templateData);
        });

        var port = 8080;

        var server = app.listen(port, function(err) {
            if (err) {
                throw err;
            }

            var host = 'localhost';
            var port = server.address().port;
            var url = `http://${host}:${port}`;

            console.log(`Server running at ${url}`);

            if (process.send) {
                process.send('online');
            }

            process.on('exit', function () {
                console.log('Exiting, closing server...');
                server.close();
            });

            resolve({
                url,
                phantomOptions,
                stopServer: function() {
                    server.close();
                }
            });
        });
    });
}

exports.run = function(allTests, options, devTools) {
    var filteredTests = allTests.filter((test) => {
        return test.env === 'browser' || test.env === 'both';
    });

    if (!filteredTests.length) {
        return;
    }

    return startServer(filteredTests, options, devTools)
        .then((result) => {
            console.log(`Running "${result.url}" using mocha-phantomjs...`);
            var mochaPhantomJSOptions = result.phantomOptions || { useColors: true };

            if (shouldCover) {
                mochaPhantomJSOptions.hooks = 'mocha-phantomjs-istanbul';
                mochaPhantomJSOptions.coverageFile = getCoverageFile();
            }

            return spawn(phantomjsBinPath, [mochaPhantomJSBin, result.url, 'spec', JSON.stringify(mochaPhantomJSOptions)], {
                stdio: 'inherit'
            }).then(function() {
                if(!options.noExit) process.exit(0);
            }).catch(function(e) {
                if(!options.noExit) process.exit(1);
            });
        });
};

function getCoverageFile() {
    return './.nyc_output/'+Math.floor(Math.random()*100000000)+'.json';
}
