const markoTest = require(".");
const parseNodeArgs = require("parse-node-args");
const MarkoCli = require("marko-cli");

exports.parse = function parse(argv) {
  const { cliArgs, nodeArgs } = parseNodeArgs(argv);
  const options = require("argly")
    .createParser({
      "--help": {
        type: "string",
        description: "Show this help message"
      },
      "--server": {
        type: "boolean",
        description: "Run only server tests"
      },
      "--debug": {
        type: "boolean",
        description:
          "Does not shutdown the test server and disables headless mode for browser tests"
      },
      "--browser": {
        type: "boolean",
        description: "Run only browser tests"
      },
      "--files --file -f *": {
        type: "string[]",
        description: "File patterns to match tests to run"
      }
      // TODO: Add `--test-template-path` option, which should ultimately map to
      // the `pageTemplate` option in the browser tests runner.
    })
    .usage("Usage: $0 [options]")
    .example("Run all tests", "$0")
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
    .parse(cliArgs);

  options.patterns = options.files;
  options.nodeArgs = nodeArgs;
  delete options.files;

  return options;
};

exports.run = function run(options) {
  const markoCli = MarkoCli.create();
  const {
    mochaOptions,
    browserBuilder, // Deprecated, will be removed in the next major.
    lassoOptions,
    wdioOptions,
    testMatcher,
    workDir,
    browserTestDependencies
  } = markoCli.config;

  return markoTest.run(
    Object.assign(
      {
        mochaOptions,
        browserBuilder,
        lassoOptions,
        wdioOptions,
        testMatcher,
        workDir,
        browserTestDependencies,
        dir: markoCli.cwd,
        cliRoot: markoCli.__dirname
      },
      options
    )
  );
};
