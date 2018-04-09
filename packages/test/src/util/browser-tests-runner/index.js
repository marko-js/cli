const fs = require("mz/fs");
const loadWDIOConfig = require("./util/wdio-config");
const ensureCalled = require("./util/ensure-called");
const createBundler = require("./bundler").create;
const startServer = require("./server").start;
const startDriver = require("./driver").start;

exports.run = async (tests, options) => {
  const { launcher, ...wdio } = loadWDIOConfig(options.dir);
  options.wdio = wdio;
  options.launcher = launcher;
  tests = tests.filter(isBrowserTest);

  if (options.capabilities) {
    if (wdio.capabilities) {
      console.warn(
        "Cannot override capabilities of the current launcher (chrome)."
      );
    } else {
      wdio.capabilities = options.capabilities;
    }
  }

  if (!tests.length) {
    return;
  }

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
  const results = await driver.executeAsync(done =>
    window.$marko_test_run(done)
  );
  const success = results.every(({ value: { success } }) => success);
  const coverages = results
    .map(({ value: { coverage } }) => coverage)
    .filter(Boolean);

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
