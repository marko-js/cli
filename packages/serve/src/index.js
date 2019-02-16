const path = require("path");
const webpack = require("webpack");
const DevServer = require("webpack-dev-server");
const AssetsPlugin = require("assets-webpack-plugin");
const ExtractCSSPlugin = require("mini-css-extract-plugin");
const IgnoreEmitPlugin = require("ignore-emit-webpack-plugin");
const SpawnServerPlugin = require("spawn-server-webpack-plugin");
const FriendlyErrorPlugin = require("friendly-errors-webpack-plugin");
const ErrorOverlayPlugin = require("error-overlay-webpack-plugin");
const ReadyPlugin = require("./ready-plugin");

const HASH = "[hash:10]";
const SERVER_FILE = path.join(__dirname, "./server.js");
const INIT_FILE = path.join(__dirname, "./init.js");
const DIST_PATH = path.join(__dirname, "build");
const PUBLIC_PATH = path.join(DIST_PATH, "public");

/**
 * Shared config (server and browser).
 */
const createConfig = opts =>
  Object.assign(opts, {
    mode: "development",
    bail: true,
    context: __dirname,
    devtool: "cheap-module-eval-source-map",
    resolve: {
      alias: {
        marko: path.dirname(require.resolve("marko/package"))
      }
    },
    module: {
      rules: [
        {
          test: /\.marko$/,
          loader: "marko-loader"
        },
        {
          test: /\.css$/,
          exclude: /node_modules/,
          use: [
            ExtractCSSPlugin.loader,
            {
              loader: "css-loader",
              options: {
                modules: false,
                sourceMap: true,
                importLoaders: 1
              }
            }
          ]
        },
        {
          test: file => !/\.(js(on)?|css|marko)$/.test(file),
          loader: "file-loader",
          options: {
            publicPath: "/",
            name: `${HASH}.[ext]`,
            emitFile: opts.name === "Browser"
          }
        }
      ]
    }
  });

module.exports = ({ file, port = 3000, verbose, nodeArgs }) => {
  const TEMPLATE_FILE = file;
  const PORT = port;
  const spawnedServer = new SpawnServerPlugin({ args: nodeArgs });
  const readyPlugin = new ReadyPlugin();

  const configs = [
    createConfig({
      name: "Server",
      entry: SERVER_FILE,
      target: "async-node",
      externals: [/^[^./!]/],
      output: {
        pathinfo: true,
        path: DIST_PATH,
        filename: "index.js",
        chunkFilename: `[name].${HASH}.js`,
        libraryTarget: "commonjs2"
      },
      plugins: [
        new webpack.DefinePlugin({
          "process.browser": undefined,
          __dirname: `"${__dirname}"`,
          __TEMPLATE_ENTRY__: `"${TEMPLATE_FILE}"`
        }),
        new webpack.BannerPlugin({
          banner:
            'require("source-map-support").install({ hookRequire: true })',
          raw: true
        }),
        new ExtractCSSPlugin({
          filename: "index.css",
          allChunks: true
        }),
        new IgnoreEmitPlugin("index.css"),
        readyPlugin,
        spawnedServer
      ]
    }),
    createConfig({
      name: "Browser",
      target: "web",
      entry: [
        `webpack-dev-server/client?http://localhost:${PORT}/`,
        TEMPLATE_FILE,
        INIT_FILE
      ],
      output: {
        pathinfo: true,
        publicPath: "/assets/",
        path: PUBLIC_PATH,
        filename: `index.${HASH}.js`,
        chunkFilename: `[name].${HASH}.js`,
        libraryTarget: "var"
      },
      plugins: [
        new webpack.DefinePlugin({
          "process.env.NODE_ENV": undefined,
          "process.browser": true
        }),
        new AssetsPlugin({
          filename: "assets.json",
          includeAllFileTypes: false,
          useCompilerPath: true
        }),
        new ExtractCSSPlugin({
          filename: `index.${HASH}.css`,
          allChunks: true
        }),
        new ErrorOverlayPlugin(),
        readyPlugin
      ]
    })
  ];

  const compiler = webpack(configs);

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
    proxy: {
      "!/assets/**": {
        target: true,
        router: () => `http://localhost:${spawnedServer.address.port}`
      }
    },
    before(app) {
      app.use((req, res, next) => {
        if (readyPlugin.ready && spawnedServer.listening) {
          next();
        } else {
          spawnedServer.once("listening", () => readyPlugin.ready && next());
          readyPlugin.once("ready", () => spawnedServer.listening && next());
        }
      });
    }
  }).listen(PORT);

  return new Promise(resolve =>
    readyPlugin.once("ready", () => resolve(server))
  );
};
