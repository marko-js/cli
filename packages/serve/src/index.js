const DevServer = require("webpack-dev-server");
const SpawnServerPlugin = require("spawn-server-webpack-plugin");
const FriendlyErrorPlugin = require("friendly-errors-webpack-plugin");
const { loadWebpackConfig } = require("@marko/build");
const webpack = require("webpack");

module.exports = ({ entry, port = 3000, verbose, nodeArgs }) => {
  const spawnedServer = new SpawnServerPlugin({
    args: nodeArgs,
    mainEntry: "index"
  });
  const configs = loadWebpackConfig({
    entry,
    production: false,
    nodeArgs
  });

  const serverConfig = configs.find(
    ({ target }) => target === "node" || target === "async-node"
  );

  if (serverConfig) {
    serverConfig.plugins = (serverConfig.plugins || []).concat(spawnedServer);
  }

  const compiler = webpack(configs);

  if (!verbose) {
    const friendlyErrors = new FriendlyErrorPlugin({ clearConsole: false });
    friendlyErrors.apply(compiler);
  }

  const devServerConfig = {
    overlay: true,
    host: "0.0.0.0",
    contentBase: false,
    disableHostCheck: true,
    headers: { "Access-Control-Allow-Origin": "*" },
    stats: verbose ? "verbose" : "errors-only",
    logLevel: verbose ? "info" : "silent",
    clientLogLevel: verbose ? "info" : "error",
    watchOptions: { ignored: [/node_modules/] },
    ...spawnedServer.devServerConfig
  };

  const server = new DevServer(compiler, devServerConfig);

  return new Promise((resolve, reject) =>
    server.listen(port, devServerConfig.host, (_, err) =>
      err ? reject(err) : resolve(server)
    )
  );
};
