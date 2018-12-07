import fs from "mz/fs";
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
      }
    })
    .usage("Usage: $0 <pattern> [options]")
    .example("Migrate a single template", "$0 template.marko")
    .example("Migrate a single template", "$0 template.marko")
    .example("Migrate all templates in the current directory", "$0 .")
    .example("Migrate multiple templates", "$0 template.marko src/ foo/")

    .validate(function(result) {
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

  options.patterns = options.files;
  delete options.files;

  return options;
}

export async function run(options, markoCli) {
  options = {
    syntax: "html",
    maxLen: 80,
    noSemi: false,
    singleQuote: false,
    ignore: ["/node_modules", ".*"],
    dir: markoCli.cwd,
    ...options
  };

  const outputs = await markoMigrate(options);
  await Promise.all(
    Object.entries(outputs).map(([file, source]) => {
      return fs.writeFile(file, source, "utf-8");
    })
  );
}
