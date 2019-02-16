const path = require("path");
const webpack = require("webpack");
const AssetsPlugin = require("assets-webpack-plugin");
const ExtractCSSPlugin = require("mini-css-extract-plugin");
const IgnoreEmitPlugin = require("ignore-emit-webpack-plugin");
const InjectPlugin = require("webpack-inject-plugin").default;

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

module.exports = ({
  file,
  production = true,
  serverPlugins = [],
  clientPlugins = []
}) => {
  const MODE = production ? "production" : "development";

  let resolveAssets;
  const assetsPromise = new Promise(resolve => (resolveAssets = resolve));

  if (production) {
    serverPlugins = serverPlugins.concat([]);
    clientPlugins = clientPlugins.concat([]);
  }

  const configs = [
    createConfig({
      name: "Server",
      target: "async-node",
      mode: MODE,
      entry: SERVER_FILE,
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
          "global.PORT": "'0'",
          "global.TEMPLATE_PATH": JSON.stringify(file)
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
          "process.env.NODE_ENV": production ? "production" : undefined,
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
