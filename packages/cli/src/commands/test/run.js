"use strict";

const markoTest = require("@marko/test");

module.exports = function run(options, markoCli) {
  const {
    mochaOptions,
    lassoOptions,
    capabilities,
    testMatcher,
    workDir,
    browserTestDependencies
  } = markoCli.config;

  return markoTest.run(
    Object.assign(
      {
        mochaOptions,
        lassoOptions,
        capabilities,
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
