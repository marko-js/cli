const DevServer = require("webpack-dev-server");
const SpawnServerPlugin = require("spawn-server-webpack-plugin");
const { loadWebpackConfig } = require("@marko/build");
const webpack = require("webpack");

module.exports = ({ entry, port = 3000, verbose, nodeArgs = [] }) => {
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
    noInfo: true,
    overlay: true,
    host: "0.0.0.0",
    contentBase: false,
    injectClient: ({ target = "web" }) =>
      target === "web" || target.startsWith("browserslist"),
    stats: verbose
      ? { all: true }
      : {
          all: false,
          colors: true,
          errors: true,
          warnings: true
        },
    disableHostCheck: true,
    clientLogLevel: "error",
    headers: { "Access-Control-Allow-Origin": "*" },
    ...spawnedServer.devServerConfig
  };

  const server = new DevServer(compiler, devServerConfig);

  return new Promise((resolve, reject) =>
    server.listen(port, devServerConfig.host, (_, err) =>
      err ? reject(err) : resolve(server)
    )
  );
};
