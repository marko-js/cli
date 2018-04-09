const cp = require("mz/child_process");
const pEvent = require("p-event");
const chromeDriver = require("chromedriver");
const getPort = require("porti").getUnusedPort;
let browser;

exports.onPrepare = async config => {
  config.port = await getPort();
  browser = await cp.spawn(chromeDriver.path, [
    "--url-base=/wd/hub",
    `--port=${config.port}`
  ]);
};

exports.onComplete = () => {
  browser.kill();
  return pEvent(browser, "exit");
};
