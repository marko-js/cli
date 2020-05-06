"use strict";

const chalk = require("chalk");
const markoCreate = require(".");

exports.parse = function parse(argv) {
  var options = require("argly")
    .createParser({
      "--help -h": {
        type: "string",
        description: "Show this help message"
      },
      "--dir -d": {
        type: "string",
        description: "Directory to create the marko app in",
        defaultValue: process.cwd()
      },
      "--name -n *": {
        type: "string",
        description: "Name of the new app (with optional source)"
      }
    })
    .usage(
      `${chalk.bold.underline("Usage:")} $0 ${chalk.green(
        "<app-name>"
      )} ${chalk.dim("[options]")}`
    )
    .example("Create a marko app in the current directory", "$0 my-new-app")
    .example(
      "…in a specific directory",
      `$0 my-new-app ${chalk.green.bold("--dir ~/Desktop")}`
    )
    .example(
      "…from the min template (marko-js-samples/marko-starter-min)",
      `$0 ${chalk.green.bold("min:")}my-new-app`
    )
    .example(
      "…from a github repo",
      `$0 ${chalk.green.bold("user/repo:")}my-new-app`
    )
    .example(
      "…from a github repo at a specific branch/tag/commit",
      `$0 ${chalk.green.bold("user/repo@commit:")}my-new-app`
    )
    .validate(function(result) {
      let noArgs =
        Object.keys(result).length === 1 && result.dir === process.cwd();
      if (noArgs || result.help) {
        this.printUsage();
        process.exit(0);
      }
    })
    .onError(function(err) {
      this.printUsage();
      console.error(err);
      process.exit(1);
    })
    .parse(argv);

  return options;
};

exports.run = function run(options) {
  return markoCreate.run(options);
};
