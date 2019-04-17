"use strict";
const fs = require("fs");
const marko = require("marko");
const assert = require("assert");
const autotest = require("mocha-autotest").default;
const markoPrettyprint = require("../src");

describe("scope(prettyprint)", function() {
  const checkPretty = syntax => ({ test, snapshot, resolve, context }) => {
    test(() => {
      const templatePath = resolve("template.marko");
      const originalSrc = fs.readFileSync(templatePath, { encoding: "utf8" });
      const testMain = getMain(resolve);

      const options = (context[`options-${syntax}`] =
        (testMain.getOptions && testMain.getOptions()) || {});
      options.filename = templatePath;
      options.syntax = syntax;

      const prettySrc = (context[
        `pretty-${syntax}`
      ] = markoPrettyprint.prettyPrintSource(originalSrc, options));

      snapshot(prettySrc, { name: `pretty-${syntax}`, ext: ".marko" });
    });
  };

  const checkRendered = syntax => ({ test, snapshot, resolve, context }) => {
    const testMain = getMain(resolve);
    if (testMain.renderData) {
      test(() => {
        // when updating expectations,
        // ensure the expected render output is
        // what the original template renders.
        const templatePath = resolve("template.marko");
        const originalSrc = fs.readFileSync(templatePath, { encoding: "utf8" });
        const options = context[`options-${syntax}`];
        const prettySrc = context[`pretty-${syntax}`];
        const targetSrc = process.env.UPDATE_EXPECTATIONS
          ? originalSrc
          : prettySrc;
        const renderedHTML = marko
          .load(options.filename, targetSrc)
          .renderToString(testMain.renderData);
        snapshot(renderedHTML, { name: `rendered-${syntax}`, ext: ".html" });
      });
    }
  };

  const checkIdempotency = syntax => ({ test, context }) => {
    test(() => {
      const options = context[`options-${syntax}`];
      const prettySrc = context[`pretty-${syntax}`];
      const prettyAgain = markoPrettyprint.prettyPrintSource(
        prettySrc,
        options
      );

      assert.equal(prettySrc, prettyAgain);
    });
  };

  autotest("fixtures", {
    "pretty (html)": checkPretty("html"),
    "pretty (concise)": checkPretty("concise"),
    "rendered (html)": checkRendered("html"),
    "rendered (concise)": checkRendered("concise"),
    "idempotency (html)": checkIdempotency("html"),
    "idempotency (concise)": checkIdempotency("concise")
  });
});

function getMain(resolve) {
  if (fs.existsSync(resolve("test.js"))) {
    return require(resolve("test.js"));
  } else {
    return {};
  }
}
