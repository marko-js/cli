const { env } = process;
const path = require("path");

module.exports = options => {
  const wdioOptions = (options.wdioOptions = options.wdioOptions || {});

  // When a custom launcher is used skip default values.
  if (wdioOptions.launcher) {
    return;
  }

  let launcher;
  let defaults;

  if (env.BROWSERSTACK_USERNAME) {
    launcher = "wdio-browserstack-service";
    defaults = {
      user: env.BROWSERSTACK_USERNAME,
      key: env.BROWSERSTACK_ACCESS_KEY,
      browserstackLocal: true
    };
  } else if (env.SAUCE_USERNAME) {
    launcher = "wdio-sauce-service";
    defaults = {
      user: env.SAUCE_USERNAME,
      key: env.SAUCE_ACCESS_KEY,
      sauceConnect: true
    };
  } else if (env.TB_KEY) {
    launcher = "wdio-testingbot-service";
    defaults = {
      user: env.TB_KEY,
      key: env.TB_SECRET,
      tbTunnel: true
    };
  } else {
    launcher = "../local-launchers/chrome";
    defaults = {
      capabilities: [{ browserName: "chrome" }]
    };
  }

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
