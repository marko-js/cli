const fs = require("mz/fs");
const wdioDefaults = require("./util/wdio-defaults");
const ensureCalled = require("./util/ensure-called");
const createBundler = require("./bundler").create;
const startServer = require("./server").start;
const startDriver = require("./driver").start;

exports.run = async (tests, options) => {
  tests = tests.filter(isBrowserTest);

  if (!tests.length) {
    return;
  }

  options.wdioOptions = {
    ...wdioDefaults.defaults,
    ...options.wdioOptions,
    ...wdioDefaults.required,
    launcher: wdioDefaults.getLauncher(options.dir)
  };

  if (wdioDefaults.name === "chromedriver") {
    const args = options.wdioOptions.capabilities[0].chromeOptions.args;

    if (options.debug) {
      args.push("auto-open-devtools-for-tabs");
    } else {
      // Run chromedriver in headless mode unless running with debug option.
      args.push("headless", "disable-gpu");
    }
  }

  const bundler = await createBundler(tests, options);
  const server = await startServer(bundler, options);
  const driver = await startDriver(server.href, options);
  const { success, coverages } = await driver.runTests();

  await Promise.all([
    ensureCalled(),
    coverages.length &&
      Promise.all(
        coverages.map(coverage =>
          fs.writeFile(
            `./.nyc_output/${Math.floor(Math.random() * 100000000)}.json`,
            JSON.stringify(coverage)
          )
        )
      )
  ]);

  process.exit(success ? 0 : 1);
};

function isBrowserTest(test) {
  return test.env === "browser" || test.env === "both";
}
