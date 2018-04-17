require("marko/node-require").install();
require("marko/express");

const pEvent = require("p-event");
const express = require("express");
const engine = require("engine.io");
const ensureCalled = require("./util/ensure-called");
const defaultPageTemplate = require("./template.marko");

exports.start = async (templateData, options) => {
  const pageTemplate = options.pageTemplate || defaultPageTemplate;
  const server = express()
    .use(require("lasso/middleware").serveStatic({ lasso: templateData.lasso }))
    .get("/", (req, res) => res.marko(pageTemplate, templateData))
    .listen();
  const wss = engine.attach(server);
  await pEvent(server, "listening");
  const port = server.address().port;

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
