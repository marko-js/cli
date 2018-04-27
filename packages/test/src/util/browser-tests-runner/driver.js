const chalk = require("chalk");
const webdriver = require("webdriverio");
const ensureCalled = require("./util/ensure-called");
const { env } = process;
const {
  BUILD_NUMBER = env.TRAVIS_BUILD_NUMBER,
  REPO_SLUG = env.TRAVIS_REPO_SLUG,
  PULL_REQUEST_SLUG = env.TRAVIS_PULL_REQUEST_SLUG
} = env;
const TEST_NAME = `${REPO_SLUG} build #${BUILD_NUMBER}${
  PULL_REQUEST_SLUG ? ` (PR: ${PULL_REQUEST_SLUG})` : ""
}`;
const DEFAULT_VIEWPORT = {
  width: 800,
  height: 600
};

exports.start = async (href, options) => {
  const {
    noExit,
    mochaOptions,
    wdioOptions: { launcher, maxInstances = 5, ...wdioOptions }
  } = options;
  const { capabilities } = wdioOptions;
  const qs = encodeURIComponent(JSON.stringify({ mochaOptions }));
  wdioOptions.baseUrl = `${href}?${qs}`;

  await launcher.onPrepare(wdioOptions, capabilities);
  ensureCalled(() => launcher.onComplete());

  return {
    async runTests() {
      const coverages = [];
      const remaining = capabilities.slice(maxInstances);
      const pendingTests = capabilities
        .slice(0, maxInstances)
        .map(capability => connect(wdioOptions, capability));
      let success = true;

      // Automatically close any started tests on exit.
      ensureCalled(() => Promise.all(pendingTests.map(driver => driver.end())));

      // Run tests serially as connections complete.
      while (pendingTests.length) {
        const [driver, test] = await Promise.race(
          pendingTests.map(toPromiseAndValue)
        );
        pendingTests.splice(pendingTests.indexOf(driver), 1);

        try {
          const { value } = await test();

          if (!value.success) {
            success = false;
          }

          if (value.coverage) {
            coverages.push(value.coverage);
          }
        } catch (err) {
          success = false;
          console.error(err);
        }

        if (noExit) {
          // Poll browser to check if the connection is closed.
          let open = true;
          while (open) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            try {
              await driver.url();
            } catch (_) {
              open = false;
            }
          }
        }

        await driver.end();

        if (remaining.length) {
          pendingTests.push(connect(wdioOptions, remaining.pop()));
        }
      }

      return {
        success,
        coverages
      };
    }
  };
};

/**
 * Creates a new driver based on the provided capability and
 * resolves to a function which will run tests for that driver.
 */
function connect({ viewport = DEFAULT_VIEWPORT, ...options }, capability) {
  const driver = webdriver.remote({
    ...options,
    capabilities: undefined,
    desiredCapabilities: {
      ...capability,
      name: TEST_NAME,
      build: BUILD_NUMBER
    }
  });

  return driver
    .init()
    .url("")
    .timeouts("script", options.idleTimeout || 60000)
    .setViewportSize(viewport)
    .then(() => () => {
      const {
        browserName,
        version = capability.platformVersion,
        platform = capability.platformName
      } = capability;

      console.log(
        chalk.bgWhite(
          chalk.black(
            chalk.bold(
              ` ${browserName}${version ? `@${version}` : ""}${
                platform ? ` on ${platform}` : ""
              } `
            )
          )
        )
      );

      return driver.executeAsync(function(done) {
        window.__run_tests__(done);
      });
    });
}

/**
 * Takes a promise and resolves to the original promise and the value.
 */
function toPromiseAndValue(p) {
  return p.then(val => [p, val]);
}
