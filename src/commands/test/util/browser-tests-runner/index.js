'use strict';

require('marko/node-require').install();
require('marko/express');

var Transform = require('stream').Transform;
var express = require('express');
var lasso = require('lasso');
var path = require('path');
var defaultPageTemplate = require('./page-template.marko');
var fs = require('fs');
var resolveFrom = require('resolve-from');
var shouldCover = !!process.env.NYC_CONFIG;
var parseRequire = require('lasso-require/src/util/parseRequire');
var porti = require('porti');
var puppeteer = require('puppeteer');

function getCoverageFile() {
    return './.nyc_output/'+Math.floor(Math.random()*100000000)+'.json';
}

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
                    require.resolve('lasso-marko')
                ],
                require: {
                    transforms: []
                }
            },
            devTools.config.browserBuilder || {});

        if (shouldCover) {
            browserBuilderConfig.require.transforms.unshift({
                transform: require('lasso-istanbul-instrument-transform'),
                config: {
                    extensions: ['.marko', '.js', '.es6']
                }
            });
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
                let path;
                // load in any dependencies (if specified)
                browserTestDependencies.forEach(function (dependency) {
                    // resolve paths based on the project's directory
                    if ((typeof dependency === 'string' || dependency instanceof String)) {
                        var parsedDependency = parseRequire(dependency);
                        var type = parsedDependency.type;
                        path = resolveFrom(devTools.cwd, parsedDependency.path);

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

        porti.getUnusedPort().then((port) => {
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
        }).catch(reject);
    });
}

exports.run = async function(allTests, options, devTools) {
    var filteredTests = allTests.filter((test) => {
        return test.env === 'browser' || test.env === 'both';
    });

    if (!filteredTests.length) {
        return;
    }

    const result = await startServer(filteredTests, options, devTools);
    const browser = await puppeteer.launch();

    console.log(`Launching tests using ${await browser.version()}`);

    const page = await browser.newPage();

    page.on('console', (...args) => {
        let label = args[0];

        if (label === 'stdout:') {
            // mocha writes control characters
            // to process.stdout.  we'll ignore these
        } else if (label === 'result:') {
            let result = args[1];

            console.log('');

            if (result.coverage) {
                fs.writeFileSync(getCoverageFile(), JSON.stringify(result.coverage));
            }

            if (!options.noExit) {
                process.exit(result.success ? 0 : 1);
            }
        } else {
            console.log(...args);
        }
    });

    page.on('error', (...args) => {
        console.error(...args)
    });

    page.on('pageerror', (...args) => {
        console.error(...args)
    });

    await page.goto(result.url+'#headless');
};
