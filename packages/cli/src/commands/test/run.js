"use strict";

const markoTest = require("@marko/test");

module.exports = function run(options, markoCli) {
  const {
    mochaOptions,
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
