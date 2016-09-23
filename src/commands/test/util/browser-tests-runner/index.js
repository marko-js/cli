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
var mkdirp = require('mkdirp');
var mochaPhantomJSBin = require.resolve('mocha-phantomjs/bin/mocha-phantomjs');
var resolveFrom = require('resolve-from');

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

function generate(tests, options, devTools) {
    return new Promise((resolve, reject) => {
        var startServer = options.startServer === true;
        var pageTemplate = options.pageTemplate || defaultPageTemplate;
        var workDir = devTools.config.workDir;
        var outputDir = path.resolve(workDir, 'browser-build');

        var browserBuilderConfig = Object.assign(
            {
                outputDir: path.join(outputDir, 'static'),
                urlPrefix: startServer ? '/static' : './static',
                bundlingEnabled: false,
                fingerprintsEnabled: false,
                minify: false,
                plugins: [
                    'lasso-marko'
                ]
            },
            devTools.config.browserBuilder || {});

        var outputFile = path.join(outputDir, 'test.html');

        var testDependencies = [];

        tests.forEach((test) => {
            var file = test.file;
            // var ext = path.extname(file);
            // var fileNoExt = file.slice(0, 0-ext.length);

            // console.log(module.id, fileNoExt + '_before.js');

            // testDependencies.push({
            //     type: 'js',
            //     virtualPath: fileNoExt + '_before.js',
            //     code: `$marko_setTest(${JSON.stringify(test)})`
            // });
            testDependencies.push({
                type: 'require',
                path: file,
                run: true,
                requireHandler: {
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
            "require-run: " + require.resolve('./setup'),
            testDependencies,
            {
                "require-run": require.resolve('./mocha-run'),
                "slot": "mocha-run"
            }
        ];

        var markoWidgetsPath = resolveFrom(devTools.cwd, 'marko-widgets');

        if (markoWidgetsPath) {
            browserDependencies.push('require: ' + markoWidgetsPath);
        }

        var myLasso = lasso.create(browserBuilderConfig);

        var templateData = {
            lasso: myLasso,
            browserDependencies: browserDependencies
        };

        if (startServer) {
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

                resolve({ url: url});
            });
        } else {
            try {
                mkdirp.sync(outputDir);
            } catch(e) {}

            // console.log(`Generating test HTML for ${path.relative(devTools.cwd, testsFile)}...`);

            pageTemplate.render(templateData, function(err, html) {
                if (err) {
                    return reject(err);
                }

                fs.writeFileSync(outputFile, html, { encoding: 'utf8' });

                console.log(`Saved test HTML page to ${path.relative(devTools.cwd, outputFile)}`);

                resolve({
                    url: outputFile
                });
            });
        }
    });
}

exports.run = function(allTests, options, devTools) {
    var filteredTests = allTests.filter((test) => {
        return test.env === 'browser' || test.env === 'both';
    });

    return generate(filteredTests, options, devTools)
        .then((generated) => {
            console.log(`Running ${generated.url} using mocha-phantomjs...`);
            console.log('mochaPhantomJSBin:', mochaPhantomJSBin);
            return spawn(mochaPhantomJSBin, [generated.url], {
                stdio: 'inherit'
            });
        });
};