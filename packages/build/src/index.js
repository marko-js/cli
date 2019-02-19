const path = require("path");
const webpack = require("webpack");
const AssetsPlugin = require("assets-webpack-plugin");
const ExtractCSSPlugin = require("mini-css-extract-plugin");
const IgnoreEmitPlugin = require("ignore-emit-webpack-plugin");
const InjectPlugin = require("webpack-inject-plugin").default;
const MinifyCSSPlugin = require("csso-webpack-plugin").default;
const MinifyImgPlugin = require("imagemin-webpack-plugin").default;
const CompressionPlugin = require("compression-webpack-plugin");
const resolveFrom = require("resolve-from");

const HASH = "[hash:10]";
const SERVER_FILE = path.join(__dirname, "./files/server.js");
const INIT_FILE = path.join(__dirname, "./files/init-client.js");
const CWD = process.cwd();

/**
 * Shared config (server and browser).
 */
const createConfig = opts =>
  Object.assign(opts, {
    bail: true,
    context: __dirname,
    devtool: "cheap-module-eval-source-map",
    resolve: {
      alias: {
        marko: path.dirname(require.resolve("marko/package")),
        "serve-handler": path.dirname(require.resolve("serve-handler/package")),
        "source-map-support": path.dirname(
          require.resolve("source-map-support/package")
        )
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

module.exports = ({
  file,
  production = true,
  output = "build",
  serverPlugins = [],
  clientPlugins = []
}) => {
  const MODE = production ? "production" : "development";
  const BUILD_PATH = path.resolve(CWD, production ? output : "");
  const PUBLIC_PATH = path.join(BUILD_PATH, "assets");

  let resolveAssets;
  const assetsPromise = new Promise(resolve => (resolveAssets = resolve));

  if (production) {
    serverPlugins = serverPlugins.concat([]);
    clientPlugins = clientPlugins.concat([
      new MinifyCSSPlugin(),
      new MinifyImgPlugin(),
      new CompressionPlugin()
    ]);
  }

  const configs = [
    createConfig({
      name: "Server",
      target: "async-node",
      mode: MODE,
      entry: SERVER_FILE,
      externals: (context, request, callback) => {
        const absolute = resolveFrom.silent(context, request);
        if (
          absolute &&
          !/webpack-inject-plugin/.test(absolute) &&
          /node_modules\/.+\.js(on)?$/.test(absolute)
        ) {
          callback(null, "./" + path.relative(BUILD_PATH, absolute));
        } else {
          callback();
        }
      },
      output: {
        pathinfo: true,
        path: BUILD_PATH,
        filename: "index.js",
        chunkFilename: `[name].${HASH}.js`,
        libraryTarget: "commonjs2"
      },
      plugins: [
        new webpack.DefinePlugin({
          "process.browser": undefined,
          "global.PORT": production ? 3000 : "'0'",
          "global.TEMPLATE_PATH": JSON.stringify(file),
          "global.ASSETS_PATH": JSON.stringify(PUBLIC_PATH)
        }),
        new ExtractCSSPlugin({
          filename: "index.css",
          allChunks: true
        }),
        new IgnoreEmitPlugin("index.css"),
        new InjectPlugin(
          async () =>
            `global.BUILD_ASSETS = ${JSON.stringify(await assetsPromise)};`
        ),
        ...serverPlugins
      ]
    }),
    createConfig({
      name: "Browser",
      target: "web",
      mode: MODE,
      entry: [file, INIT_FILE],
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
          "process.browser": true
        }),
        new AssetsPlugin({
          includeAllFileTypes: false,
          useCompilerPath: true,
          keepInMemory: true,
          processOutput: assets => {
            resolveAssets(assets);
            return JSON.stringify(assets);
          }
        }),
        new ExtractCSSPlugin({
          filename: `index.${HASH}.css`,
          allChunks: true
        }),
        ...clientPlugins
      ]
    })
  ];

  return webpack(configs);
};
