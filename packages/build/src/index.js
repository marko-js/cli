const path = require("path");
const webpack = require("webpack");
const browserslist = require("browserslist");
const ExtractCSSPlugin = require("mini-css-extract-plugin");
const IgnoreEmitPlugin = require("ignore-emit-webpack-plugin");
const InjectPlugin = require("webpack-inject-plugin").default;
const MinifyCSSPlugin = require("csso-webpack-plugin").default;
const MinifyImgPlugin = require("imagemin-webpack-plugin").default;
const CompressionPlugin = require("compression-webpack-plugin");
const BrotliPlugin = require("brotli-webpack-plugin");
const MarkoPlugin = require("@marko/webpack/plugin").default;

const { getUserAgentRegExp } = require("browserslist-useragent-regexp");
const { useAppModuleOrFallback, getRouterCode } = require("./util");

const HASH = "[hash:10]";
const SERVER_FILE = path.join(__dirname, "./files/server.js");
const CWD = process.cwd();

module.exports = ({
  dir,
  file,
  production = true,
  output = "build",
  serverPlugins = [],
  clientPlugins = []
}) => {
  const MODE = production ? "production" : "development";
  const DEVTOOL = production ? "source-map" : "cheap-module-source-map";
  const BUILD_PATH = path.resolve(CWD, production ? output : "");
  const ASSETS_PATH = path.join(BUILD_PATH, "assets");
  const PUBLIC_PATH = "/assets/";
  const APP_DIR = dir || path.dirname(file);

  // getClientCompilerName gets stringified and added to the output bundle
  // if it is instrumented, the cov_${id} variable will cause a ReferenceError
  /* istanbul ignore next */
  const markoPlugin = new MarkoPlugin({
    getClientCompilerName:
      production &&
      ($global => ($global.isModern ? "Browser-modern" : "Browser-legacy"))
  });

  const markoCompiler = (() => {
    process.env.APP_DIR = APP_DIR;
    return require.resolve("./marko-compiler");
  })();

  const legacyBrowsers =
    browserslist.loadConfig({
      path: dir || file,
      env: "legacy"
    }) || browserslist.defaults;

  const modernBrowsers = browserslist.loadConfig({
    path: dir || file,
    env: "modern"
  }) || [
    "last 3 Chrome versions",
    "last 2 Firefox versions",
    "last 1 Edge versions",
    "last 1 Safari versions",
    "unreleased versions"
  ];

  const sharedAliases = () => ({
    marko: useAppModuleOrFallback(APP_DIR, "marko"),
    "connect-gzip-static": useAppModuleOrFallback(
      APP_DIR,
      "connect-gzip-static"
    ),
    "source-map-support": useAppModuleOrFallback(APP_DIR, "source-map-support")
  });

  const babelLoader = targets => ({
    loader: require.resolve("babel-loader"),
    options: {
      presets: [[require.resolve("@babel/preset-env"), { targets }]],
      plugins: [require.resolve("babel-plugin-macros")]
    }
  });

  const sharedRules = ({ isServer, targets }) => [
    {
      test: /\.js$/,
      exclude: /node_modules/,
      use: [babelLoader(targets)]
    },
    {
      test: /\.marko$/,
      use: [
        babelLoader(targets),
        {
          loader: require.resolve("@marko/webpack/loader"),
          options: {
            compiler: markoCompiler
          }
        }
      ]
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
      ].concat(
        isServer
          ? []
          : {
              loader: require.resolve("postcss-loader"),
              options: {
                config: {
                  path: __dirname,
                  ctx: { browsers: targets }
                }
              }
            }
      )
    },
    {
      test: file => !/\.(js(on)?|css|marko)$/.test(file),
      loader: require.resolve("file-loader"),
      options: {
        publicPath: PUBLIC_PATH,
        name: production ? `${HASH}.[ext]` : `[name].${HASH}.[ext]`,
        outputPath: path.relative(
          isServer ? BUILD_PATH : ASSETS_PATH,
          ASSETS_PATH
        )
      }
    }
  ];

  const sharedConfig = options => ({
    mode: MODE,
    bail: true,
    context: __dirname,
    devtool: DEVTOOL,
    resolve: { alias: sharedAliases(options) },
    module: { rules: sharedRules(options) }
  });

  if (production) {
    serverPlugins = serverPlugins.concat([]);
    clientPlugins = clientPlugins.concat([
      new MinifyCSSPlugin(),
      new MinifyImgPlugin(),
      new CompressionPlugin(),
      new BrotliPlugin()
    ]);
  }

  const serverConfig = {
    name: "Server",
    target: "async-node",
    entry: SERVER_FILE,
    cache: false,
    output: {
      pathinfo: true,
      path: BUILD_PATH,
      publicPath: PUBLIC_PATH,
      filename: "index.js",
      chunkFilename: `[name].${HASH}.js`,
      libraryTarget: "commonjs2"
    },
    plugins: [
      new webpack.DefinePlugin({
        "process.browser": undefined,
        "process.env.BUNDLE": true,
        "global.PORT": production ? 3000 : "'0'",
        "global.ASSETS_PATH": JSON.stringify(ASSETS_PATH)
      }),
      new ExtractCSSPlugin({
        filename: "index.css",
        allChunks: true
      }),
      new IgnoreEmitPlugin("index.css"),
      new InjectPlugin(() => {
        if (dir) {
          return getRouterCode(dir);
        } else if (file.endsWith(".js")) {
          return `global.MARKO_MIDDLEWARE = require(${JSON.stringify(file)});`;
        } else {
          return `const template = require(${JSON.stringify(
            file
          )}); global.GET_ROUTE = () => ({ key:'main', template });`;
        }
      }),
      new InjectPlugin(() => {
        return `global.MODERN_BROWSERS_REGEXP = ${getUserAgentRegExp({
          browsers: modernBrowsers,
          allowHigherVersions: true
        })}`;
      }),
      markoPlugin.server,
      ...serverPlugins
    ],
    ...sharedConfig({ isServer: true, targets: { node: true } })
  };

  const getBrowserConfig = ({ targetsName, targets }) => ({
    name: `Browser-${targetsName}`,
    target: "web",
    entry: markoPlugin.emptyEntry,
    output: {
      pathinfo: true,
      publicPath: PUBLIC_PATH,
      path: ASSETS_PATH,
      filename: `[name].${targetsName}.[chunkhash:10].js`,
      libraryTarget: "var",
      devtoolModuleFilenameTemplate: production
        ? "webpack://[namespace]/[resource-path]?[loaders]"
        : info => info.absoluteResourcePath + "?" + info.hash
    },
    plugins: [
      new webpack.DefinePlugin({
        "process.browser": true
      }),
      new ExtractCSSPlugin({
        filename: `[name].${targetsName}.[chunkhash:10].css`,
        allChunks: true
      }),
      markoPlugin.browser,
      ...clientPlugins
    ],
    ...sharedConfig({ isServer: false, targets })
  });

  const legacyBrowserConfig =
    production &&
    getBrowserConfig({ targetsName: "legacy", targets: legacyBrowsers });
  const modernBrowserConfig = getBrowserConfig({
    targetsName: "modern",
    targets: modernBrowsers
  });

  return webpack(
    production
      ? [legacyBrowserConfig, modernBrowserConfig, serverConfig]
      : [modernBrowserConfig, serverConfig]
  );
};
