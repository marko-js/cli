const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const address = require("address");
const parseNodeArgs = require("parse-node-args");
const openBrowser = require("open-browsers");
const details = require("../package.json");
const getPort = require("./get-port");
const serve = require("./");

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
      },
      "--version -v": {
        type: "boolean",
        descrption: `print ${details.name} version`
      }
    })
    .usage("$0 <path> [options]")
    .example("Serve a marko file", "$0 component.marko")
    .example("Serve the current directory", "$0 .")
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

  return options;
};

exports.run = async options => {
  const defaultPort = options.port || 3000;
  const port = await getPort(defaultPort);
  const local = `http://localhost:${port}`;
  const network = `http://${address.ip()}:${port}`;
  const location =
    path.relative(process.cwd(), options.entry) || "the current directory";

  const server = await serve({ ...options, port });

  if (!options.noBrowser) {
    openBrowser(local);
  }

  console.log(`You can now view ${chalk.bold(location)} in your browser`);

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

  return server;
};
