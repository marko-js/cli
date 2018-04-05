"use strict";

const fs = require("fs");
const glob = require("glob");
const path = require("path");
const lassoPackageRoot = require("lasso-package-root");
const resolveFrom = require("resolve-from");

const globOptions = {
  matchBase: true,
  absolute: true,
  ignore: ["node_modules/**"]
};

function createIfNotExists(filepath) {
  if (!fs.existsSync(filepath)) {
    //fs.writeFileSync(filepath, {flag: 'wx'});
  }
}

function getPackageRoot(dir) {
  const rootPackage = lassoPackageRoot.getRootPackage(dir);
  return (rootPackage && rootPackage.__dirname) || dir;
}

function requireFromRoot(path, packageRoot) {
  let resolvedPath;

  try {
    resolvedPath = resolveFrom(packageRoot, path);
  } catch (e) {
    // Ignore
  }

  return resolvedPath ? require(resolvedPath) : require(path);
}

exports.run = function(options = {}) {
  let { dir, ignore, server, browser, clean, patterns } = options;

  if (!patterns || !patterns.length) {
    patterns = ["**/*.marko"];
  }

  if (!server && !browser) {
    server = browser = true;
  }

  dir = dir || process.cwd();

  const packageRoot = getPackageRoot(dir);
  const markoCompiler = requireFromRoot("marko/compiler", packageRoot);

  globOptions.cwd = dir || process.cwd();

  if (ignore) {
    globOptions.ignore = ignore;
  }

  return Promise.all(
    patterns.map(
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

            if (!clean) {
              files.map(file => {
                var serverFile, browserFile;
                if (server) {
                  serverFile = file.replace(/\.\w+$/, "js");
                  createIfNotExists(serverFile);
                }
                if (browser && markoCompiler.compileFileForBrowser) {
                  browserFile = file.replace(/\.\w+$/, ".browser.js");
                  createIfNotExists(browserFile);
                }
              });
            }

            files.map(file => {
              var serverFile, browserFile;
              if (server) {
                serverFile = file.replace(/\.\w+$/, ".js");
                if (clean) {
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
              if (browser && markoCompiler.compileFileForBrowser) {
                browserFile = file.replace(/\.\w+$/, ".browser.js");
                if (clean) {
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
                if (clean) {
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
