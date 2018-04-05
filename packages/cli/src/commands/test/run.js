"use strict";

const markoTest = require("@marko/test");

module.exports = function run(options, markoCli) {
  const {
    mochaOptions,
    puppeteerOptions,
    testMatcher,
    browserBuilder,
    workDir,
    browserTestDependencies
  } = markoCli.config;

  return markoTest.run(
    Object.assign(
      {
        mochaOptions,
        puppeteerOptions,
        testMatcher,
        browserBuilder,
        workDir,
        browserTestDependencies,
        dir: markoCli.cwd,
        cliRoot: markoCli.__dirname
      },
      options
    )
  );
};
