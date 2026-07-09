const DevServer = require("webpack-dev-server");
const SpawnServerPlugin = require("spawn-server-webpack-plugin");
const { loadWebpackConfig } = require("@marko/build");
const webpack = require("webpack");

module.exports = async ({ entry, port = 3000, verbose, nodeArgs = [] }) => {
  const spawnedServer = new SpawnServerPlugin({
    args: nodeArgs.concat("--enable-source-maps"),
    mainEntry: "index"
  });
  const configs = loadWebpackConfig({
    entry,
    production: false
  });

  const serverConfig = configs.find(
    ({ target }) => target === "node" || target === "async-node"
  );

  if (serverConfig) {
    serverConfig.plugins = (serverConfig.plugins || []).concat(spawnedServer);
  }

  const compiler = webpack(configs);

  const devServerConfig = {
    port,
    host: "0.0.0.0",
    allowedHosts: "all",
    static: false,
    client: {
      logging: "error",
      overlay: true
    },
    devMiddleware: {
      stats: verbose
        ? { all: true }
        : {
            all: false,
            colors: true,
            errors: true,
            warnings: true
          }
    },
    headers: { "Access-Control-Allow-Origin": "*" },
    ...spawnedServer.devServerConfig
  };

  const server = new DevServer(devServerConfig, compiler);
  await server.start();
  return server;
};
