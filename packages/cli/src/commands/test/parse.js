module.exports = function parse(argv) {
  var options = require("argly")
    .createParser({
      "--help": {
        type: "string",
        description: "Show this help message"
      },
      "--server": {
        type: "boolean",
        description: "Run only server tests"
      },
      "--no-exit": {
        type: "boolean",
        description: "Do not shutdown the test server"
      },
      "--browser": {
        type: "boolean",
        description: "Run only browser tests"
      },
      "--files --file -f *": {
        type: "string[]",
        description: "File patterns"
      }
      // TODO: Add `--test-template-path` option, which should ultimately map to
      // the `pageTemplate` option in the browser tests runner.
    })
    .usage("Usage: $0 [options]")
    .example("Run all tests", "marko test")
    .example(
      "Run all tests for a single component",
      "marko test ./src/components/app-foo/**/test*.js"
    )
    .example(
      "Run all UI component tests",
      "marko test ./src/components/**/test*.js"
    )
    .example(
      "Run only server tests",
      "marko test ./src/components/**/test*server.js --server"
    )
    .example(
      "Run only browser tests",
      "marko test ./src/components/**/test*browser.js --browser"
    )
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

  options.patterns = options.files;
  delete options.files;

  return options;
};
