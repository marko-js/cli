const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const address = require("address");
const serve = require("./");
const parseNodeArgs = require("parse-node-args");
const openBrowser = require("open-browsers");
const getPort = require("get-port");

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
      "--port -p": {
        type: "number",
        description: "A port for the server to listen on"
      },
      "--verbose": {
        type: "boolean",
        description: "Show compilation logs"
      },
      "--no-browser": {
        type: "boolean",
        description: "Don't automatically open the browser"
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
  const defaultPort = options.port || 3000;
  const port = await getPort({ port: defaultPort });
  const local = `http://localhost:${port}`;
  const network = `http://${address.ip()}:${port}`;
  const file = path.relative(process.cwd(), options.file);

  await serve({ ...options, port });

  if (!options.noBrowser) {
    openBrowser(local);
  }

  console.log(`You can now view ${chalk.bold(file)} in your browser`);

  if (port !== defaultPort) {
    console.log(
      chalk.red(
        `(Running on port ${chalk.bold(port)} because ${defaultPort} is in use)`
      )
    );
  }

  console.log("");
  console.log(`  ${chalk.bold("Local Address:  ")} ${local}`);
  console.log(`  ${chalk.bold("On Your Network:")} ${network}`);
  console.log("");
  console.log(
    chalk.italic(
      `Note that ${chalk.cyan("marko serve")} is only intended for development`
    )
  );
  console.log(
    chalk.italic(
      `You can create a production-ready build using ${chalk.cyan(
        "marko build"
      )}`
    )
  );
  console.log("");
};
