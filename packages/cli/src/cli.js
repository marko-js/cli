var MarkoDevTools = require("./MarkoDevTools");
const chalk = require("chalk");
const boxen = require("boxen");
const checkForMarkoCliUpdates = require("./util/checkForMarkoCliUpdates");

exports.run = function(argv) {
  if (process.env.SKIP_UPDATE_CHECK !== "1") {
    checkForMarkoCliUpdates();
  }

  var markoDevTools = new MarkoDevTools();

  var commandName = argv[2];

  if (!markoDevTools.hasCommand(commandName)) {
    if (commandName === undefined) {
      console.error("Usage: marko <command> arg0 arg1 ... argn");
    } else {
      console.error("Invalid command: " + commandName);
    }
    console.error(
      "Allowed commands: " + markoDevTools.commands.getNames().join(" ")
    );
    process.exit(1);
  }

  const message =
    "\n" +
    boxen(
      `The marko-cli package has been ${chalk.red(
        "deprecated"
      )}.\nInstall and use the individual commands instead:\n\n${chalk.cyan(
        `npx @marko/${commandName} ${argv.slice(3).join(" ")}`
      )}`,
      {
        padding: 1,
        margin: 1,
        borderColor: "yellow",
        borderStyle: "round"
      }
    );

  console.error(message);

  return markoDevTools.runCommand(commandName, argv.slice(3)).catch(err => {
    console.error(
      `An error occurred while running command ${commandName}:`,
      err.stack || err
    );
    process.exit(1);
  });
};
