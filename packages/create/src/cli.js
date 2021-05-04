"use strict";

const ora = require("ora");
const path = require("path");
const chalk = require("chalk");
const { Select, Input } = require("enquirer");
const details = require("../package.json");
const { getExamples, createProject } = require(".");

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
        description: "Name of the new app"
      },
      "--template -t": {
        type: "string",
        description:
          "An example from marko-js/examples or a git repo to use as the project template"
      },
      "--installer -i": {
        type: "string",
        description:
          "Override the package manager used to install dependencies. By default will determine from create command and fallback to npm."
      },
      "--version -v": {
        type: "boolean",
        descrption: `print ${details.name} version`
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
      "…from the min template (marko-js/examples:examples/min)",
      `$0 my-new-app ${chalk.green.bold("--template min")}`
    )
    .example(
      "…from a github repo",
      `$0 my-new-app ${chalk.green.bold("--template user/repo")}`
    )
    .example(
      "…from a github repo at a specific branch/tag/commit",
      `$0 my-new-app ${chalk.green.bold("--template user/repo#commit")}`
    )
    .validate(function (result) {
      if (result.version) {
        console.log(`v${details.version}`);
        process.exit(0);
      }

      if (result.help) {
        this.printUsage();
        process.exit(0);
      }
    })
    .onError(function (err) {
      this.printUsage();
      console.error(err);
      process.exit(1);
    })
    .parse(argv);

  return options;
};

exports.run = async function run(options = {}) {
  const spinner = ora("Starting...").start();

  try {
    if (!options.name || !options.template) {
      spinner.stop();
      const examples = !options.template && getExamples();
      const trimHints = choices =>
        choices.map(choice => {
          const size = 4 + choice.name.length + 1 + choice.hint.length;
          if (size > process.stdout.columns) {
            return {
              ...choice,
              hint:
                choice.hint.slice(0, -1 + process.stdout.columns - size) + "…"
            };
          }
          return choice;
        });

      if (!options.name) {
        const nameInput = new Input({
          name: "name",
          message: "Type your project name",
          initial: "my-app"
        });
        options.name = await nameInput.run();
      }

      if (!options.template) {
        const templateSelect = new Select({
          name: "template",
          message: "Choose a template",
          hint: "Use ↑ and ↓. Return ⏎ to submit.",
          choices: [
            {
              name: "Default starter app"
            },
            {
              name: "Example from marko-js/examples"
            }
          ]
        });

        if ("Default starter app" !== (await templateSelect.run())) {
          const choices = await examples;
          const exampleSelect = new Select({
            name: "template",
            message: "Choose an example",
            choices: trimHints(choices)
          });
          const resizeListener = async () => {
            const trimmed = trimHints(choices);
            exampleSelect.choices.forEach((choice, i) => {
              choice.hint = trimmed[i].hint;
            });
            exampleSelect.render();
          };
          process.stdout.on("resize", resizeListener);
          options.template = await exampleSelect.run();
          process.stdout.off("resize", resizeListener);
        }
      }
      spinner.start();
    }

    const result = createProject(options);
    result.on("download", () =>
      setLoadingMessage(spinner, "Downloading app...")
    );
    result.on("install", () =>
      setLoadingMessage(spinner, "Installing npm modules...")
    );
    result.on("init", () => setLoadingMessage(spinner, "Initializing repo..."));
    const { projectPath, scripts: { start, dev } = {} } = await result;
    spinner.succeed(
      "Project created! To get started, run:\n\n" +
        chalk.cyan(`    cd ${path.relative(process.cwd(), projectPath)}\n`) +
        (dev
          ? chalk.cyan("    npm run dev\n")
          : start
          ? chalk.cyan("    npm start\n")
          : "")
    );
  } catch (err) {
    spinner.fail(err.message + "\n");
    console.error(err);
  } finally {
    clearTimeout(spinner.timeout);
  }
};

function setLoadingMessage(spinner, message) {
  clearTimeout(spinner.timeout);
  spinner.text = message;
  spinner.timeout = setTimeout(() => {
    spinner.text = `${message} (this may take a minute)`;
  }, 3000);
}
