const path = require("path");
const webdriver = require("webdriverio");
const ensureCalled = require("./util/ensure-called");
const { env } = process;
const { BUILD_NUMBER = env.TRAVIS_BUILD_NUMBER } = env;
const IDLE_TIMEOUT = 900000;

exports.start = async (server, options) => {
  const { dir, wdio, launcher, mochaOptions } = options;
  const pkgName = require(path.join(dir, "package.json")).name;

  await launcher.onPrepare(wdio, wdio.capabilities);
  ensureCalled(() => launcher.onComplete());

  // Runs all tests in parallel by creating one config per capability.
  const driver = webdriver.multiremote(
    wdio.capabilities.reduce((result, capability) => {
      let name = capability.browserName;

      if (capability.version) {
        name += "@" + capability.version;
      }

      if (capability.platform) {
        name += " on " + capability.platform;
      }

      capability.name = `${pkgName} build #${BUILD_NUMBER}`;
      capability.build = BUILD_NUMBER;
      capability["idle-timeout"] = IDLE_TIMEOUT;

      result[name] = {
        ...wdio,
        capabilities: undefined,
        desiredCapabilities: capability,
        baseUrl: `http://localhost:${server.port}?${JSON.stringify({
          name: wdio.capabilities.length > 1 ? name : "",
          mochaOptions
        })}`
      };

      return result;
    }, {})
  );

  ensureCalled(() => driver.end());

  await driver
    .init()
    .timeouts("script", IDLE_TIMEOUT)
    .url("");

  return {
    async executeAsync(...args) {
      const result = await driver.executeAsync(...args);
      return Object.values(result);
    }
  };
};
