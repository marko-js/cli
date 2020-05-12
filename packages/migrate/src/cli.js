import fs from "mz/fs";
import { prompt } from "enquirer";
import dependentPathUpdate from "dependent-path-update";
import details from "../package.json";
import markoMigrate from ".";

export function parse(argv) {
  const options = require("argly")
    .createParser({
      "--help": {
        type: "boolean",
        description: "Show this help message"
      },
      "--files --file -f *": {
        type: "string[]",
        description: "A set of directories or files to migrate"
      },
      "--ignore -i": {
        type: "string[]",
        description: "File patterns to ignore"
      },
      "--syntax -s": {
        type: "string",
        description:
          'The syntax (either "html" or "concise"). Defaults to "html"'
      },
      "--max-len": {
        type: "int",
        description: "The maximum line length. Defaults to 80"
      },
      "--no-semi": {
        type: "boolean",
        description: "If set, will format JS without semicolons"
      },
      "--single-quote": {
        type: "boolean",
        description: "If set, will prefer single quotes"
      },
      "--safe": {
        type: "boolean",
        description: "Run all safe migrations ignoring any prompts"
      },
      "--version -v": {
        type: "boolean",
        descrption: `print ${details.name} version`
      }
    })
    .usage("Usage: $0 <pattern> [options]")
    .example("Migrate a single template", "$0 template.marko")
    .example("Migrate a single template", "$0 template.marko")
    .example("Migrate all templates in the current directory", "$0 .")
    .example("Migrate multiple templates", "$0 template.marko src/ foo/")

    .validate(function(result) {
      if (result.version) {
        console.log(`v${details.version}`);
        process.exit(0);
      }

      if (result.help) {
        this.printUsage();
        process.exit(0);
      }

      if (!result.files || result.files.length === 0) {
        this.printUsage();
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
    .parse(argv);

  return options;
}

export async function run(options) {
  await markoMigrate({
    syntax: "html",
    maxLen: 80,
    noSemi: false,
    singleQuote: false,
    ignore: ["/node_modules", ".*"],
    dir: process.cwd(),
    ...options,
    prompt,
    onWriteFile(file, source) {
      return fs.writeFile(file, source, "utf-8");
    },
    onRenameFile(from, to) {
      return fs.rename(from, to);
    },
    async onUpdateDependents(from, to) {
      await Promise.all(
        Object.entries(
          await dependentPathUpdate({
            projectRoot: options.dir,
            exclude: options.exclude,
            include: ["*.{marko,js,json}"],
            from,
            to
          })
        ).map(([file, source]) => fs.writeFile(file, source, "utf-8"))
      );
    }
  });
}
