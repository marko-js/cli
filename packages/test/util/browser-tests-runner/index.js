"use strict";

require("marko/node-require").install();
require("marko/express");

var Transform = require("stream").Transform;
var express = require("express");
var lasso = require("lasso");
var path = require("path");
var defaultPageTemplate = require("./page-template.marko");
var fs = require("fs");
var resolveFrom = require("resolve-from");
var shouldCover = !!process.env.NYC_CONFIG;
var parseRequire = require("lasso-require/src/util/parseRequire");
var porti = require("porti");
var puppeteer = require("puppeteer");

function getCoverageFile() {
  return "./.nyc_output/" + Math.floor(Math.random() * 100000000) + ".json";
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

function startServer(tests, options) {
  return new Promise((resolve, reject) => {
    var pageTemplate = options.pageTemplate || defaultPageTemplate;
    var workDir = options.workDir;
    var outputDir = path.resolve(workDir, "browser-build");

    var browserBuilderConfig = Object.assign(
      {
        outputDir: path.join(outputDir, "static"),
        urlPrefix: "/static",
        bundlingEnabled: false,
        fingerprintsEnabled: false,
        minify: false,
        plugins: [require.resolve("lasso-marko")],
        require: {
          transforms: []
        }
      },
      options.browserBuilder || {}
    );

    // Allow for an environment variable or a test runner option
    if (shouldCover || options.testCoverage) {
      browserBuilderConfig.require.transforms.unshift({
        transform: require("lasso-istanbul-instrument-transform"),
        config: {
          extensions: [".marko", ".js", ".es6"]
        }
      });
    }

    var testDependencies = [];

    tests.forEach(test => {
      var file = test.file;

      testDependencies.push({
        type: "require",
        path: file,
        run: true,
        virtualModule: {
          createReadStream: function() {
            var rendererPath = test.renderer;
            var testDir = path.dirname(test.file);
            var relativePath = path.relative(testDir, rendererPath);
            if (relativePath.charAt(0) !== ".") {
              relativePath = "./" + relativePath;
            }

            return fs
              .createReadStream(file, { encoding: "utf8" })
              .pipe(
                new WrapStream(
                  `$marko_test(${JSON.stringify(
                    test
                  )}, require(${JSON.stringify(relativePath)}), function() { `,
                  `\n});`
                )
              );
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
      "require-run: " + require.resolve("./setup")
    ];

    var browserTestDependencies = options.browserTestDependencies;

    if (browserTestDependencies) {
      if (Array.isArray(browserTestDependencies)) {
        let path;
        // load in any dependencies (if specified)
        browserTestDependencies.forEach(function(dependency) {
          // resolve paths based on the project's directory
          if (typeof dependency === "string" || dependency instanceof String) {
            var parsedDependency = parseRequire(dependency);
            var type = parsedDependency.type;
            path = resolveFrom(options.dir, parsedDependency.path);

            if (type) {
              dependency = type + ": " + path;
            } else {
              dependency = path;
            }
          } else if ((path = dependency.path)) {
            dependency.path = resolveFrom(options.dir, path);
          }

          browserDependencies.push(dependency);
        });
      } else {
        throw new Error("config.dependencies must be an array");
      }
    }

    browserDependencies = browserDependencies.concat([
      testDependencies,
      {
        "require-run": require.resolve("./mocha-run"),
        slot: "mocha-run"
      }
    ]);

    try {
      let markoWidgetsPath = resolveFrom(options.dir, "marko-widgets");
      if (markoWidgetsPath) {
        browserDependencies.push("require: " + markoWidgetsPath);
      }
    } catch (e) {
      // Ignore
    }

    var myLasso = lasso.create(browserBuilderConfig);

    var templateData = {
      lasso: myLasso,
      browserDependencies: browserDependencies
    };

    var app = express();

    app.use(require("lasso/middleware").serveStatic({ lasso: myLasso }));
    app.get("/", function(req, res) {
      res.marko(pageTemplate, templateData);
    });

    porti
      .getUnusedPort()
      .then(port => {
        var server = app.listen(port, function(err) {
          if (err) {
            throw err;
          }

          var host = "localhost";
          var port = server.address().port;
          var url = `http://${host}:${port}`;

          console.log(`Server running at ${url}`);

          if (process.send) {
            process.send("online");
          }

          process.on("exit", function() {
            server.close();
          });

          resolve({
            url,
            stopServer: function() {
              server.close();
            }
          });
        });
      })
      .catch(reject);
  });
}

exports.run = function(allTests, options) {
  var filteredTests = allTests.filter(test => {
    return test.env === "browser" || test.env === "both";
  });

  if (!filteredTests.length) {
    return;
  }

  return startServer(filteredTests, options).then(result => {
    return puppeteer
      .launch(options.puppeteerOptions)
      .then(browser => Promise.all([browser.version(), browser.newPage()]))
      .then(([version, page]) => {
        return new Promise((resolve, reject) => {
          console.log(`Launching tests using ${version}`);

          page.on("console", (...args) => {
            const label = args[0];

            if (label === "stdout:") {
              // mocha writes control characters
              // to process.stdout.  we'll ignore these
            } else if (label === "result:") {
              const result = args[1];

              console.log("");

              if (result.coverage) {
                fs.writeFileSync(
                  getCoverageFile(),
                  JSON.stringify(result.coverage)
                );
              }

              if (!options.noExit) {
                process.exit(result.success ? 0 : 1);
              }
            } else {
              console.log(...args);
            }
          });

          page.on("error", (...args) => {
            console.error(...args);
            reject(...args);
          });

          page.on("pageerror", (...args) => {
            console.error(...args);
            reject(...args);
          });

          const mochaOptions = Object.assign(
            {
              reporter: "spec",
              useColors: true
            },
            options.mochaOptions
          );

          const browserOptions = {
            mocha: mochaOptions
          };

          const optionsHash = JSON.stringify(browserOptions);

          return page
            .goto(result.url + "?" + optionsHash)
            .then(resolve)
            .catch(reject);
        });
      });
  });
};
