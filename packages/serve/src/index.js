const DevServer = require("webpack-dev-server");
const SpawnServerPlugin = require("spawn-server-webpack-plugin");
const FriendlyErrorPlugin = require("friendly-errors-webpack-plugin");
const ErrorOverlayPlugin = require("error-overlay-webpack-plugin");
const InjectPlugin = require("webpack-inject-plugin").default;
const build = require("@marko/build");

module.exports = ({ file, port = 3000, verbose, nodeArgs }) => {
  const devServerRefresh = new InjectPlugin(
    () => `require('webpack-dev-server/client?http://localhost:${port}/')`
  );
  const spawnedServer = new SpawnServerPlugin({ args: nodeArgs });
  const clientPlugins = [devServerRefresh, new ErrorOverlayPlugin()];
  const serverPlugins = [spawnedServer];

  const compiler = build({
    file,
    production: false,
    clientPlugins,
    serverPlugins
  });

  if (!verbose) {
    const friendlyErrors = new FriendlyErrorPlugin();
    friendlyErrors.apply(compiler);
  }

  const server = new DevServer(compiler, {
    quiet: !verbose,
    inline: true,
    overlay: true,
    publicPath: "/assets/",
    contentBase: false,
    stats: verbose ? "verbose" : "errors-only",
    clientLogLevel: verbose ? "info" : "error",
    watchOptions: { ignored: [/node_modules/] },
    proxy: [
      {
        context: url => !/^\/(api|__open-stack-frame-in-editor)/.test(url),
        target: true,
        router: () => `http://localhost:${spawnedServer.address.port}`
      }
    ],
    before(app) {
      app.use((req, res, next) => {
        if (spawnedServer.listening) next();
        else spawnedServer.once("listening", next);
      });
    }
  }).listen(port);

  return new Promise(resolve =>
    spawnedServer.once("listening", () => resolve(server))
  );
};
