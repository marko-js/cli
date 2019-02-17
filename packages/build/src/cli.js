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
    .usage("Usage: $0 <file> [options]")
    .example("Serve a marko file", "$0 component.marko")

    .validate(function(result) {
      if (result.help) {
        this.printUsage();
        process.exit(0);
      }

      if (!result.file) {
        this.printUsage();
        process.exit(1);
      }

      const resolvedFile = path.resolve(process.cwd(), result.file);
      if (fs.existsSync(resolvedFile)) {
        result.file = resolvedFile;
      } else {
        console.warn("Unable to find file: " + result.file);
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
  build(options).run(() => {});
};
