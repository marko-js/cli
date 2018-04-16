const chalk = require("chalk");
const webdriver = require("webdriverio");
const ensureCalled = require("./util/ensure-called");
const { env } = process;
const {
  BUILD_NUMBER = env.TRAVIS_BUILD_NUMBER,
  REPO_SLUG = env.TRAVIS_REPO_SLUG,
  PULL_REQUEST_SLUG = env.TRAVIS_PULL_REQUEST_SLUG
} = env;
const IDLE_TIMEOUT = 900000;

exports.start = async (server, options) => {
  const { mochaOptions, wdioOptions: { launcher, ...wdioOptions } } = options;
  const { capabilities } = wdioOptions;

  await launcher.onPrepare(wdioOptions, capabilities);
  ensureCalled(() => launcher.onComplete());

  // Runs all tests in parallel by creating one config per capability.
  const driver = webdriver.multiremote(
    normalizeCapabilities(capabilities, wdioOptions)
  );

  await driver.init().timeouts("script", IDLE_TIMEOUT);

  ensureCalled(() => driver.end());

  await driver.url(
    `http://localhost:${server.port}?${JSON.stringify({ mochaOptions })}`
  );

  return {
    async runTests() {
      let success = true;
      let coverages = [];

      for (const instance of driver.getInstances()) {
        const browser = driver.select(instance);
        const {
          desiredCapabilities: { browserName, version, platform }
        } = browser;
        const name = `${browserName}${version ? `@${version}` : ""}${
          platform ? ` on ${platform}` : ""
        }`;

        console.log(chalk.bgWhite(chalk.black(chalk.bold(` ${name} `))));
        const { value } = await browser.executeAsync(runMarkoTest);

        if (!value.success) {
          success = false;
        }

        if (value.coverage) {
          coverages.push(value.coverage);
        }
      }

      return {
        success,
        coverages
      };
    }
  };
};

function normalizeCapabilities(capabilities, options) {
  return capabilities.reduce((result, capability, i) => {
    capability.name = `${REPO_SLUG} build #${BUILD_NUMBER}`;

    if (PULL_REQUEST_SLUG) {
      capability.name += ` (PR: ${PULL_REQUEST_SLUG})`;
    }

    capability.build = BUILD_NUMBER;
    capability["idle-timeout"] = IDLE_TIMEOUT;

    result[i] = {
      ...options,
      desiredCapabilities: capability
    };

    return result;
  }, {});
}

/**
 * Starts mocha in the browser.
 */
function runMarkoTest(done) {
  window.$marko_test_run(done);
}
