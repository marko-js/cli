const path = require("path");
const webpack = require("webpack");
const AssetsPlugin = require("assets-webpack-plugin");
const ExtractCSSPlugin = require("mini-css-extract-plugin");
const IgnoreEmitPlugin = require("ignore-emit-webpack-plugin");
const InjectPlugin = require("webpack-inject-plugin").default;
const MinifyCSSPlugin = require("csso-webpack-plugin").default;
const MinifyImgPlugin = require("imagemin-webpack-plugin").default;
const CompressionPlugin = require("compression-webpack-plugin");

const { useAppModuleOrFallback, createResolvablePromise } = require("./util");

const HASH = "[hash:10]";
const SERVER_FILE = path.join(__dirname, "./files/server.js");
const CWD = process.cwd();

/**
 * Shared config (server and browser).
 */
const createConfig = (appDir, opts) =>
  Object.assign(opts, {
    bail: true,
    context: __dirname,
    resolve: {
      alias: {
        marko: useAppModuleOrFallback(appDir, "marko"),
        "serve-handler": useAppModuleOrFallback(appDir, "serve-handler"),
        "source-map-support": useAppModuleOrFallback(
          appDir,
          "source-map-support"
        )
      }
    },
    module: {
      rules: [
        {
          test: /\.marko$/,
          loader: require.resolve("marko-loader"),
          options: {
            compiler: (() => {
              process.env.APP_DIR = appDir;
              return require.resolve("./marko-compiler");
            })()
          }
        },
        {
          test: /\.css$/,
          exclude: /node_modules/,
          use: [
            ExtractCSSPlugin.loader,
            {
              loader: require.resolve("css-loader"),
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
          loader: require.resolve("file-loader"),
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
  const DEVTOOL = production ? "source-map" : "cheap-module-eval-source-map";
  const BUILD_PATH = path.resolve(CWD, production ? output : "");
  const PUBLIC_PATH = path.join(BUILD_PATH, "assets");
  const APP_DIR = path.dirname(file);

  let assetsPromise = createResolvablePromise();

  if (production) {
    serverPlugins = serverPlugins.concat([]);
    clientPlugins = clientPlugins.concat([
      new MinifyCSSPlugin(),
      new MinifyImgPlugin(),
      new CompressionPlugin()
    ]);
  }

  const configs = [
    createConfig(APP_DIR, {
      name: "Server",
      target: "async-node",
      mode: MODE,
      entry: SERVER_FILE,
      devtool: DEVTOOL,
      cache: false,
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
          "process.env.BUNDLE": true,
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
    createConfig(APP_DIR, {
      name: "Browser",
      target: "web",
      mode: MODE,
      entry: `${file}?hydrate`,
      devtool: DEVTOOL,
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
            assetsPromise.resolve(assets);
            assetsPromise = createResolvablePromise();
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
