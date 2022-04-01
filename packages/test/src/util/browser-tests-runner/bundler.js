const path = require("path");
const lasso = require("lasso");
const resolveFrom = require("resolve-from");
const parseRequire = require("lasso/src/resolve/parseRequire");
const shouldCover = !!process.env.NYC_CONFIG;
const baseDependencies = [
  requireRunPrefix(require.resolve("./browser-dependencies")),
  "mocha/mocha.css"
];

exports.create = async (tests, options) => {
  const workDir = options.workDir;
  const outputDir = path.resolve(workDir, "browser-build");
  const testDependencies = tests.map(test => requireRunPrefix(test.file));
  const additionalDependencies = resolveTestDependencies(
    options.browserTestDependencies || [],
    options.dir
  );
  const customLassoOptions = options.lassoOptions || {};
  const lassoOptions = {
    outputDir: path.join(outputDir, "static"),
    urlPrefix: "/static",
    minify: false,
    bundlingEnabled: false,
    fingerprintsEnabled: false,
    ...customLassoOptions,
    require: { transforms: [], ...customLassoOptions.require },
    plugins: ["lasso-marko"].concat(customLassoOptions.plugins || [])
  };

  try {
    const markoWidgetsPath = resolveFrom(options.dir, "marko-widgets");
    if (markoWidgetsPath) {
      additionalDependencies.unshift(requireRunPrefix(markoWidgetsPath));
    }
  } catch (e) {
    // Ignore
  }

  // Allow for an environment variable or a test runner option
  if (shouldCover || options.testCoverage) {
    lassoOptions.require.transforms.push({
      transform: require("lasso-istanbul-instrument-transform"),
      config: {
        extensions: [".marko", ".js", ".es6"]
      }
    });
  }

  return {
    lasso: lasso.create(lassoOptions),
    browserDependencies: [].concat(
      baseDependencies,
      additionalDependencies,
      testDependencies
    )
  };
};

function resolveTestDependencies(deps, dir) {
  return deps.map(dep => {
    // resolve paths based on the project's directory
    if (typeof dep === "string" || dep instanceof String) {
      const parsed = parseRequire(dep);
      const type = parsed.type;
      const resolved = resolveFrom(dir, parsed.path);
      return type ? `${type}: ${resolved}` : resolved;
    } else if (dep.path) {
      dep.path = resolveFrom(dir, dep.path);
    }

    return dep;
  });
}

function requireRunPrefix(file) {
  return `require-run: ${file}`;
}
