const markoCompile = require(".");

exports.parse = function parse(argv) {
  var options = require("argly")
    .createParser({
      "--help": {
        type: "string",
        description: "Show this help message"
      },
      "--server": {
        type: "boolean",
        description: "Compile view(s) for node.js (html renderer)"
      },
      "--browser": {
        type: "boolean",
        description: "Compile view(s) for browser (vdom renderer)"
      },
      "--clean": {
        type: "boolean",
        description: "Delete compiled files"
      },
      "--files --file -f *": {
        type: "string[]",
        description: "File patterns"
      },
      "--ignore -i": {
        type: "string[]",
        description: "File patterns to ignore"
      }
    })
    .usage("Usage: $0 [options]")
    .example("Compile all templates", "marko compile")
    .validate(function(result) {
      if (result.help) {
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
}

exports.run = function run(options, markoCli) {
  const { ignore, server, browser, clean, files:patterns } = options;

  return markoCompile.run({
    dir: markoCli.cwd,
    ignore,
    server,
    browser,
    clean,
    patterns
  });
};
