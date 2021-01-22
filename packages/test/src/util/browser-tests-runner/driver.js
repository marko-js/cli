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
  const {
    capabilities,
    viewport = DEFAULT_VIEWPORT,
    suiteTimeout = DEFAULT_TIMEOUTS.suite,
    idleTimeout = DEFAULT_TIMEOUTS.idle
  } = wdioOptions;

  wdioOptions.baseUrl = `${href}?${encodeURIComponent(
    JSON.stringify({ mochaOptions, packageName })
  )}`;

  await launcher.onPrepare(
    wdioOptions,
    capabilities.map(cap => ({ ...cap }))
  );
  await delay(wdioDefaults.startDelay); // Give the launcher some time to init.
  ensureCalled(() =>
    Promise.race([launcher.onComplete(exitCode, wdioOptions), delay(3000)])
  );

  return {
    async runTests() {
      const results = {};
      const coverages = [];

      for (const capability of capabilities) {
        let closed = false;
        const testName = getTestName(capability);
        console.log(`\n${format(testName, "starting...")}\n`);
        results[testName] = false;

        const browser = await webdriver.remote({
          ...wdioOptions,
          capabilities: {
            ...capability,
            ...(wdioDefaults.name !== "chromedriver"
              ? {
                  name: TEST_NAME,
                  build: BUILD_NUMBER
                }
              : {})
          }
        });

        ensureCalled(() => closed || browser.deleteSession());

        await browser.setTimeout({
          script: idleTimeout,
          implicit: idleTimeout,
          pageLoad: idleTimeout
        });

        let resizeAttempts = 2;
        // Some browser chromes change size when the window changes size.
        // Typically this is from going full screen to a smaller window.
        // Resizing twice avoids this issue.
        while (resizeAttempts--) {
          const curViewportSize = await browser.execute(function() {
            var el = document.documentElement;
            return {
              width: window.innerWidth || el.clientWidth,
              height: window.innerHeight || el.clientHeight
            };
          });

          if (
            viewport.width !== curViewportSize.width ||
            viewport.height !== curViewportSize.height
          ) {
            const curWindowSize = await (
              browser.getWindowSize || browser.getWindowRect
            ).call(browser);
            const newWidth =
              viewport.width + curWindowSize.width - curViewportSize.width;
            const newHeight =
              viewport.height + curWindowSize.height - curViewportSize.height;
            if (browser.setWindowSize) {
              await browser.setWindowSize(newWidth, newHeight);
            } else {
              await browser.setWindowRect(
                curWindowSize.x,
                curViewportSize.y,
                newWidth,
                newHeight
              );
            }
          } else {
            break;
          }
        }

        await browser.url("");

        try {
          const { success, coverage } = await waitForResults(browser, {
            suiteTimeout,
            idleTimeout
          });

          results[testName] = success;

          if (coverage) {
            coverages.push(coverage);
          }
        } catch (error) {
          console.error(error);
        } finally {
          if (await isAlive(browser)) {
            if (debug) {
              // Wait for the driver to die by pinging it every 3 seconds.
              do {
                await delay(3000);
              } while (await isAlive(browser));
            } else {
              await browser.deleteSession();
            }
          }

          closed = true;
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

async function isAlive(browser) {
  try {
    await browser.getUrl();
    return true;
  } catch (_) {
    return false;
  }
}

async function waitForResults(browser, { suiteTimeout, idleTimeout }) {
  const endTime = Date.now() + suiteTimeout;
  const execInterval = Math.min(idleTimeout, DEFAULT_TIMEOUTS.idle) * 0.8;
  let result;

  do {
    // Some services force a max timeout for async scripts.
    // Below we restart the async script that waits for the tests to be done every 60 seconds.
    // The tests are 'complete' once the global '__test_result__' is set on the window.
    if (endTime < Date.now()) {
      throw new Error(
        'marko-cli: Test suite timed out, use "wdioOptions.suiteTimeout" to increase the delay (default 10 mins).'
      );
    }

    result = await browser.executeAsync(function(interval, done) {
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
            timeout = setTimeout(function() {
              done(result);
            }, 0);
          }
        });
      }
    }, execInterval);
  } while (!result);

  return result;
}

function getTestName(capability) {
  const browser = capability.browser || capability.browserName;
  const version =
    capability.browser_version || capability.platformVersion || "latest";
  const platform =
    (capability.os && `${capability.os} ${capability.os_version}`) ||
    capability.platformName;

  return `${browser}@${version}${platform ? ` on ${platform}` : ""}`;
}

function format(name, str) {
  return chalk.bgWhite(` ${chalk.black(chalk.bold(`${name}: ${str}`))} `);
}
