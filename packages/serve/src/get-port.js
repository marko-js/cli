const net = require("net");
const MAX_TRIES = 10;

module.exports = desiredPort =>
  new Promise(resolve => {
    let port = desiredPort;
    const server = net
      .createServer()
      .unref()
      .once("listening", () => server.close(() => resolve(port)))
      .on("error", () => {
        if (port === desiredPort + MAX_TRIES) {
          return 0;
        } else {
          server.listen(port++);
        }
      })
      .listen(port);
  });
