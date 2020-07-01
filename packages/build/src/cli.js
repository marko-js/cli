const fs = require("fs");
const path = require("path");
const { loadWebpackConfig } = require("./");
const details = require("../package.json");
const { buildStaticSite } = require("./util");
const parseNodeArgs = require("parse-node-args");
const rimraf = require("rimraf");
const webpack = require("webpack");

exports.parse = function parse(argv) {
  const { cliArgs, nodeArgs } = parseNodeArgs(argv);
  const options = require("argly")
    .createParser({
      "--help": {
        type: "boolean",
        description: "Show this help message"
      },
      "--entry *": {
        type: "string",
        description: "A marko file to serve"
      },
      "--output -o": {
        type: "string",
        description: "The output path where the build will be written"
      },
      "--json": {
        type: "boolean",
        description: "Print a JSON stats object for analysis tools"
      },
      "--version -v": {
        type: "boolean",
        descrption: `print ${details.name} version`
      }
    })
    .usage("$0 <path> [options]")
    .example("Build a marko file", "$0 component.marko")
    .example("Build the current directory", "$0 .")

    .validate(function(result) {
      if (result.version) {
        console.log(`v${details.version}`);
        process.exit(0);
      }

      if (result.help) {
        this.printUsage();
        process.exit(0);
      }

      if (!result.entry) {
        this.printUsage();
        process.exit(1);
      }

      const resolved = path.resolve(process.cwd(), result.entry);
      if (fs.existsSync(resolved)) {
        result.entry = resolved;
      } else {
        console.warn("Unable to find file or directory: " + result.entry);
        process.exit(1);
      }
    })
    .onError(function(err) {
      this.printUsage();

      if (err) {
        console.log();
        console.log(err);
      }

      process.exit(1);
    })
    .parse(cliArgs);

  options.nodeArgs = nodeArgs;
  options.production = true;

  return options;
};

exports.run = async options => {
  process.env.NODE_ENV = "production";

  const config = loadWebpackConfig(options);
  const compiler = webpack(config);

  compiler.hooks.run.tapAsync("@marko/build", (_, done) =>
    config.forEach(({ output: { path } }) => rimraf(path, done))
  );

  compiler.run(async (err, stats) => {
    if (err) console.error(err);
    if (options.static) {
      await buildStaticSite(options, stats);
    }
  });
};
