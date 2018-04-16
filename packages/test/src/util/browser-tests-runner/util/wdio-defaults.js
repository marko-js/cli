const { env } = process;
const path = require("path");

module.exports = options => {
  const wdioOptions = (options.wdioOptions = options.wdioOptions || {});

  // When a custom launcher is used skip default values.
  if (wdioOptions.launcher) {
    return;
  }

  let { launcher, ...defaults } = env.BROWSERSTACK_USERNAME
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

  // Ensure the webdriver launcher exists.
  try {
    wdioOptions.launcher = require(path.join(
      launcher[0] === "."
        ? launcher
        : path.join(require("resolve-from")(options.dir, launcher), ".."),
      "/launcher.js"
    ));
    Object.assign(wdioOptions, defaults);
  } catch (_) {
    const serviceName = launcher.slice(5, -8);
    throw new Error(
      `Unable to run tests using the "${serviceName}" testing service. Please install "${launcher}" to continue.`
    );
  }
};
