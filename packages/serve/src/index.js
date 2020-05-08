const DevServer = require("webpack-dev-server");
const SpawnServerPlugin = require("spawn-server-webpack-plugin");
const FriendlyErrorPlugin = require("friendly-errors-webpack-plugin");
const build = require("@marko/build");

module.exports = ({ dir, file, port = 3000, verbose, nodeArgs }) => {
  const spawnedServer = new SpawnServerPlugin({ args: nodeArgs });
  const clientPlugins = [];
  const serverPlugins = [spawnedServer];

  const compiler = build({
    dir,
    file,
    production: false,
    clientPlugins,
    serverPlugins
  });

  if (!verbose) {
    const friendlyErrors = new FriendlyErrorPlugin({ clearConsole: false });
    friendlyErrors.apply(compiler);
  }

  const server = new DevServer(compiler, {
    overlay: true,
    host: "0.0.0.0",
    disableHostCheck: true,
    headers: { "Access-Control-Allow-Origin": "*" },
    stats: verbose ? "verbose" : "errors-only",
    logLevel: verbose ? "info" : "silent",
    clientLogLevel: verbose ? "info" : "error",
    watchOptions: { ignored: [/node_modules/] },
    ...spawnedServer.devServerConfig
  });

  return new Promise(resolve => server.listen(port, resolve));
};
