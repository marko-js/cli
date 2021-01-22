const { env } = process;
const getPort = require("get-port");
const isPortFree = require("is-port-free");
const resolveFrom = require("resolve-from");
let name;
let ports;
let required;
let startDelay;
let launcherOptions;

if (env.BROWSERSTACK_USER) {
  startDelay = 1000;
  name = "browserstack";
  ports = [
    22,
    80,
    81,
    443,
    1337,
    1859,
    3000,
    3002,
    3030,
    3128,
    3306,
    3333,
    3621,
    4000,
    4502,
    5000,
    5757,
    5790,
    7774,
    8000,
    8001,
    8080,
    8081,
    8082,
    8083,
    8084,
    8085,
    8086,
    8443,
    8760,
    8888,
    8899,
    9876,
    9877,
    9880,
    10002,
    13260,
    14357,
    38946,
    49772,
    50208,
    54134,
    54136,
    60778,
    63342,
    64000
  ];
  launcherOptions = {
    user: env.BROWSERSTACK_USER,
    key: env.BROWSERSTACK_ACCESS_KEY,
    browserstackLocalForcedStop: true,
    browserstackLocal: true
  };
} else if (env.SAUCE_USERNAME) {
  startDelay = 0;
  name = "sauce";
  ports = [
    80,
    443,
    888,
    2000,
    2001,
    2020,
    2109,
    2222,
    2310,
    3000,
    3001,
    3010,
    3030,
    3210,
    3333,
    4000,
    4001,
    4040,
    4321,
    4502,
    4503,
    4567,
    5000,
    5001,
    5002,
    5050,
    5555,
    5432,
    6000,
    6001,
    6060,
    6666,
    6543,
    7000,
    7070,
    7774,
    7777,
    8000,
    8001,
    8003,
    8031,
    8080,
    8081,
    8443,
    8765,
    8777,
    8888,
    9000,
    9001,
    9031,
    9080,
    9090,
    9191,
    9876,
    9877,
    9999,
    49221,
    55001
  ];
  launcherOptions = {
    user: env.SAUCE_USERNAME,
    key: env.SAUCE_ACCESS_KEY,
    sauceConnect: true
  };
} else if (env.TB_KEY) {
  startDelay = 0;
  name = "testingbot";
  ports = [4445, 4444];
  launcherOptions = {
    user: env.TB_KEY,
    key: env.TB_SECRET,
    tbTunnel: true
  };
} else {
  startDelay = 500;
  name = "chromedriver";
  required = {
    capabilities: [
      {
        browserName: "chrome",
        "goog:chromeOptions": {
          args: [
            "no-sandbox",
            "disable-dev-shm-usage",
            "disable-setuid-sandbox"
          ]
        }
      }
    ],
    chromeDriverArgs: ["--silent"]
  };
  launcherOptions = {
    path: "/",
    port: 9515
  };
}

module.exports = {
  name,
  ports,
  required,
  defaults: { logLevel: "error" },
  startDelay,
  isValidPort(port) {
    return !ports || ports.indexOf(port) !== -1;
  },
  async getAvailablePort() {
    if (!ports) {
      return getPort();
    }

    for (const port of ports) {
      if (port <= 1000) {
        continue;
      }

      try {
        await isPortFree(port);
        return port;
      } catch (_) {
        continue;
      }
    }

    throw new Error(`No available ports found for the "${name}" service.`);
  },
  getLauncher(from, capabilities, config) {
    const tryPkgs = [`@wdio/${name}-service`, `wdio-${name}-service`];
    let service;

    for (const pkg of tryPkgs) {
      try {
        service = require(resolveFrom(from, pkg));
        break;
        // eslint-disable-next-line no-empty
      } catch (_) {}
    }

    if (!service) {
      throw new Error(
        `Unable to load the "${name}" testing service.\n` +
          `Please install "${tryPkgs[0]}" to continue.`
      );
    }

    const Launcher = (service.default || service).launcher;
    return new Launcher(launcherOptions, capabilities, config);
  }
};
