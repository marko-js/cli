const chalk = require("chalk");
const delay = require("delay");
const webdriver = require("webdriverio");
const wdioDefaults = require("./util/wdio-defaults");
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
const DEFAULT_TIMEOUTS = {
  idle: 240000,
  suite: 600000
};

exports.start = async (href, options) => {
  let exitCode = 1;
  const {
    debug,
    packageName,
    mochaOptions,
    wdioOptions: { launcher, ...wdioOptions }
  } = options;
  const { capabilities } = wdioOptions;
  wdioOptions.baseUrl = `${href}?${encodeURIComponent(
    JSON.stringify({ mochaOptions, packageName })
  )}`;

  await launcher.onPrepare(wdioOptions, capabilities);
  await delay(wdioDefaults.startDelay); // Give the launcher some time to init.
  ensureCalled(() =>
    Promise.race([launcher.onComplete(exitCode, wdioOptions), delay(3000)])
  );

  return {
    async runTests() {
      let driver;
      const results = {};
      const coverages = [];
      ensureCalled(() => driver && driver.end());

      for (const capability of capabilities) {
        const { testName } = (driver = connect(
          wdioOptions,
          capability
        ));
        results[testName] = false;

        console.log(`\n${format(testName, "starting...")}\n`);

        try {
          const test = await driver;
          const {
            value: { success, coverage }
          } = await test();
          results[testName] = success;

          if (coverage) {
            coverages.push(coverage);
          }
        } catch (error) {
          console.error(error);
        } finally {
          if (await isAlive(driver)) {
            if (debug) {
              // Wait for the driver to die by pinging it every 3 seconds.
              do {
                await delay(3000);
              } while (await isAlive(driver));
            } else {
              await driver.end();
            }
          }
        }
      }

      let success = true;
      console.log(
        "\n" +
          Object.keys(results)
            .map(name => {
              const passed = results[name];
              if (!passed) {
                success = false;
              }

              return format(name, passed ? chalk.green("✓") : chalk.red("✗"));
            })
            .join("\n") +
          "\n"
      );
      exitCode = success ? 0 : 1;

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
  const {
    suiteTimeout = DEFAULT_TIMEOUTS.suite,
    idleTimeout = DEFAULT_TIMEOUTS.idle
  } = options;
  const browser = capability.browser || capability.browserName;
  const version =
    capability.browser_version || capability.platformVersion || "latest";
  const platform =
    (capability.os && `${capability.os} ${capability.os_version}`) ||
    capability.platformName;
  const driver = webdriver
    .remote({
      ...options,
      capabilities: undefined,
      desiredCapabilities: {
        ...capability,
        name: TEST_NAME,
        build: BUILD_NUMBER
      }
    })
    .init()
    .timeouts("script", idleTimeout)
    .timeouts("implicit", idleTimeout)
    .timeouts("page load", idleTimeout)
    .setViewportSize(viewport)
    .url("")
    .then(() => () => {
      const endTime = Date.now() + suiteTimeout;
      const execInterval = Math.min(idleTimeout, DEFAULT_TIMEOUTS.idle) * 0.8;
      // Some services force a max timeout for async scripts.
      // Below we restart the async script the waits for the tests to be done every 60 seconds.
      // The tests are 'complete' once the global '__test_result__' is set on the window.
      return (function getResults() {
        if (endTime < Date.now()) {
          throw new Error(
            'marko-cli: Test suite timed out, use "wdioOptions.suiteTimeout" to increase the delay (default 10 mins).'
          );
        }

        return driver
          .executeAsync(function(interval, done) {
            if (window.__test_result__) done(window.__test_result__);
            else {
              var timeout = setTimeout(function() {
                delete window.__test_result__;
                done();
              }, interval);
              Object.defineProperty(window, "__test_result__", {
                configurable: true,
                set: function(result) {
                  clearTimeout(timeout);
                  done(result);
                }
              });
            }
          }, execInterval)
          .then(result => {
            return result.value ? result : getResults();
          });
      })();
    });

  driver.testName = `${browser}@${version}${platform ? ` on ${platform}` : ""}`;

  return driver;
}

async function isAlive(driver) {
  try {
    await driver.url();
    return true;
  } catch (_) {
    return false;
  }
}

function format(name, str) {
  return chalk.bgWhite(` ${chalk.black(chalk.bold(`${name}: ${str}`))} `);
}
