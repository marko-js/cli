const cp = require("mz/child_process");
const pEvent = require("p-event");
const getPort = require("get-port");
const chromeDriver = require("chromedriver");
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
