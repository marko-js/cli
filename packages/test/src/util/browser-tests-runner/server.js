require("marko/node-require").install();
require("marko/express");

const pEvent = require("p-event");
const express = require("express");
const engine = require("engine.io");
const wdioDefaults = require("./util/wdio-defaults");
const ensureCalled = require("./util/ensure-called");
const defaultPageTemplate = require("./template.marko");

exports.start = async (templateData, options) => {
  const {
    serverPort = await wdioDefaults.getAvailablePort()
  } = options.wdioOptions;
  const pageTemplate = options.pageTemplate || defaultPageTemplate;
  const server = express()
    .use(require("lasso/middleware").serveStatic({ lasso: templateData.lasso }))
    .get("/", (req, res) => res.marko(pageTemplate, templateData))
    .listen(serverPort);
  const wss = engine.attach(server);

  try {
    await pEvent(server, "listening");
  } catch (err) {
    if (err.code !== "EADDRINUSE") {
      throw err;
    }

    console.error(
      `@marko/test: Unable to start test server on port ${serverPort}.\n` +
        `You can use "wdioOptions.port" to override the port.\n` +
        `Keep in mind that selenium services such as saucelabs, browserstack and ` +
        `testingbot only work with certain ports when testing against Edge, IE and Safari.`
    );

    process.exit(1);
  }

  const { port } = server.address();

  if (!wdioDefaults.isValidPort(port)) {
    console.warn(
      `@marko/test: We noticed you are using port ${port} with the ${
        wdioDefaults.name
      } service.\n` +
        `This port is not in the list of known supported ports for that service and ` +
        `may cause issues when testing against Edge, IE and Safari.`
    );
  }

  if (options.noExit) {
    console.log(`Server running at http://localhost:${port}`);
  }

  // Stream logs from client via websocket.
  wss.on("connection", socket =>
    socket.on("message", msg => {
      for (const [type, ...args] of JSON.parse(msg)) {
        if (type === "console") {
          const [method, parts] = args;
          console[method](...parts);
        }
      }
    })
  );

  ensureCalled(() => {
    server.close();
    return pEvent(server, "close");
  });

  return {
    href: `http://localhost:${port}`
  };
};
