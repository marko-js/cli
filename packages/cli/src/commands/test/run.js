"use strict";

const markoTest = require("@marko/test");

module.exports = function run(options, markoCli) {
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
