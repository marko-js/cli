const fs = require("mz/fs");
const path = require("path");
const lasso = require("lasso");
const resolveFrom = require("resolve-from");
const Transform = require("stream").Transform;
const parseRequire = require("lasso-require/src/util/parseRequire");
const shouldCover = !!process.env.NYC_CONFIG;
const baseDependencies = [
  "mocha/mocha.js",
  "mocha/mocha.css",
  "require-run: " + require.resolve("./browser-dependencies")
];

exports.create = async (tests, options) => {
  const workDir = options.workDir;
  const outputDir = path.resolve(workDir, "browser-build");
  const testDependencies = tests.map(toVirtualModule);
  const additionalDependencies = resolveTestDependencies(
    options.browserDependencies || [],
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
      additionalDependencies.unshift("require-run: " + markoWidgetsPath);
    }
  } catch (e) {
    // Ignore
  }

  // Allow for an environment variable or a test runner option
  if (shouldCover || options.testCoverage) {
    lassoOptions.require.transforms.unshift({
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

function toVirtualModule(test) {
  const file = test.file;
  const rendererPath = test.renderer;
  const testDir = path.dirname(test.file);
  let relativePath = path.relative(testDir, rendererPath);
  if (relativePath.charAt(0) !== ".") {
    relativePath = "./" + relativePath;
  }

  return {
    type: "require",
    path: file,
    run: true,
    virtualModule: {
      object: false,
      createReadStream: () => {
        return fs
          .createReadStream(file, { encoding: "utf8" })
          .pipe(
            new WrapStream(
              `__init_test__(${JSON.stringify(test)}, require(${JSON.stringify(
                relativePath
              )}), function() {\n`,
              `\n});`
            )
          );
      },
      async getLastModified() {
        const stat = await fs.stat(file);
        return stat.mtime ? stat.mtime.getTime() : -1;
      }
    }
  };
}

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
