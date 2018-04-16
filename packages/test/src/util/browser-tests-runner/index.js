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

  wdioDefaults(options);
  const willExit = !options.noExit;
  const bundler = await createBundler(tests, options);
  const server = await startServer(bundler, options);

  server.wss.on("connection", socket =>
    socket.on("message", msg => {
      for (const [type, ...args] of JSON.parse(msg)) {
        if (type === "console") {
          const [method, parts] = args;
          console[method](...parts);
        }
      }
    })
  );

  const driver = await startDriver(server, options);
  const { success, coverages } = await driver.runTests();

  await Promise.all([
    willExit && ensureCalled(),
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

  if (willExit && !success) {
    process.exit(1);
  }
};

function isBrowserTest(test) {
  return test.env === "browser" || test.env === "both";
}
