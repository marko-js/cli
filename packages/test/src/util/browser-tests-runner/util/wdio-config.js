const { env } = process;
const path = require("path");

module.exports = dir => {
  const config = env.BROWSERSTACK_USERNAME
    ? {
        launcher: "wdio-browserstack-service",
        user: env.BROWSERSTACK_USERNAME,
        key: env.BROWSERSTACK_ACCESS_KEY,
        browserstackLocal: true
      }
    : env.SAUCE_USERNAME
      ? {
          launcher: "wdio-sauce-service",
          user: env.SAUCE_USERNAME,
          key: env.SAUCE_ACCESS_KEY,
          sauceConnect: true
        }
      : env.TB_KEY
        ? {
            launcher: "wdio-testingbot-service",
            user: env.TB_KEY,
            key: env.TB_SECRET,
            tbTunnel: true
          }
        : {
            launcher: "../local-launchers/chrome",
            capabilities: [{ browserName: "chrome" }]
          };

  // Ensure the webdriver service exists.
  try {
    if (config.launcher[0] !== ".") {
      config.launcher = path.join(
        require("resolve-from")(dir, config.launcher),
        ".."
      );
    }

    config.launcher = require(path.join(config.launcher, "/launcher.js"));
  } catch (_) {
    const launcherName = config.launcher;
    const serviceName = launcherName.slice(5, -8);
    throw new Error(
      `Unable to run tests using the "${serviceName}" testing service. Please install "${launcherName}" to continue.`
    );
  }

  return config;
};
