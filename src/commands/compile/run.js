"use strict";

var fs = require("fs");
var glob = require("glob");
var path = require("path");

var globOptions = {
  matchBase: true,
  absolute: true,
  ignore: ["node_modules/**"]
};

module.exports = function run(options, devTools) {
  var markoCompiler = devTools.requireFromRoot("marko/compiler");
  var packageRoot = devTools.packageRoot;

  globOptions.cwd = devTools.cwd;

  if (options.ignore) {
    globOptions.ignore = options.ignore;
  }

  return Promise.all(
    options.patterns.map(
      pattern =>
        new Promise((resolve, reject) => {
          glob(pattern, globOptions, function(err, files) {
            if (err) return reject(err);

            var packagePath = path.join(packageRoot, "package.json");
            var packageData = {};

            try {
              packageData = require(packagePath);
            } catch (e) {
              /* ignore */
            }

            packageData.browser = packageData.browser || {};

            if (!options.clean) {
              files.map(file => {
                var serverFile, browserFile;
                if (options.server) {
                  serverFile = file.replace(/\.\w+$/, ".js");
                  createIfNotExists(serverFile);
                }
                if (options.browser && markoCompiler.compileFileForBrowser) {
                  browserFile = file.replace(/\.\w+$/, ".browser.js");
                  createIfNotExists(browserFile);
                }
              });
            }

            files.map(file => {
              var serverFile, browserFile;
              if (options.server) {
                serverFile = file.replace(/\.\w+$/, ".js");
                if (options.clean) {
                  try {
                    fs.unlinkSync(serverFile);
                  } catch (e) {
                    /* ignore */
                  }
                } else {
                  var compiledSrc = markoCompiler.compileFile(file);
                  fs.writeFileSync(serverFile, compiledSrc);
                }
              }
              if (options.browser && markoCompiler.compileFileForBrowser) {
                browserFile = file.replace(/\.\w+$/, ".browser.js");
                if (options.clean) {
                  try {
                    fs.unlinkSync(browserFile);
                  } catch (e) {
                    /* ignore */
                  }
                } else {
                  var compiled = markoCompiler.compileFileForBrowser(file);
                  fs.writeFileSync(browserFile, compiled.code);
                }
              }

              if (serverFile && browserFile) {
                if (options.clean) {
                  delete packageData.browser[
                    path.relative(packageRoot, serverFile)
                  ];
                } else {
                  packageData.browser[
                    path.relative(packageRoot, serverFile)
                  ] = path.relative(packageRoot, browserFile);
                }
              }
            });

            if (!Object.keys(packageData.browser).length) {
              delete packageData.browser;
            }

            fs.writeFileSync(
              packagePath,
              JSON.stringify(packageData, null, 2) + "\n"
            );

            resolve();
          });
        })
    )
  );
};

function createIfNotExists(filepath) {
  if (!fs.existsSync(filepath)) {
    //fs.writeFileSync(filepath, {flag: 'wx'});
  }
}
