const fs = require("fs");
const path = require("path");
const build = require("./");
const parseNodeArgs = require("parse-node-args");

exports.parse = function parse(argv) {
  const { cliArgs, nodeArgs } = parseNodeArgs(argv);
  const options = require("argly")
    .createParser({
      "--help": {
        type: "boolean",
        description: "Show this help message"
      },
      "--file -f *": {
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
      }
    })
    .usage("$0 build <path> [options]")
    .example("Build a marko file", "$0 build component.marko")
    .example("Build the current directory", "$0 build .")

    .validate(function(result) {
      if (result.help) {
        this.printUsage();
        process.exit(0);
      }

      if (!result.file) {
        this.printUsage();
        process.exit(1);
      }

      const resolved = path.resolve(process.cwd(), result.file);
      if (fs.existsSync(resolved)) {
        const stat = fs.statSync(resolved);
        if (stat.isDirectory()) {
          result.dir = resolved;
          delete result.file;
        } else {
          result.file = resolved;
        }
      } else {
        console.warn("Unable to find file or directory: " + result.file);
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

  return options;
};

exports.run = async options => {
  build(options).run((err, stats) => {
    if (err) console.error(err);
    console.log(stats.toString());
  });
};
