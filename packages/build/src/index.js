const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const browserslist = require("browserslist");
const postcssPresetEnv = require("postcss-preset-env");
const ExtractCSSPlugin = require("mini-css-extract-plugin");
const InjectPlugin = require("webpack-inject-plugin").default;
const MarkoPlugin = require("@marko/webpack/plugin").default;
const resolveFrom = require("resolve-from");

const { getUserAgentRegExp } = require("browserslist-useragent-regexp");
const { useAppModuleOrFallback, getRouterCode } = require("./util");

const EMPTY = [];
const SERVER_FILE = path.join(__dirname, "./files/server.js");
const MIDDLEWARE_FILE = path.join(__dirname, "./files/middleware.js");
const CWD = process.cwd();
const NMS_INDEX = __dirname.indexOf(path.sep + "node_modules" + path.sep);
const ROOT = NMS_INDEX === -1 ? __dirname : __dirname.slice(0, NMS_INDEX + 2);
const IDENTITY_FN = x => x;

exports.loadWebpackConfig = options => {
  let foundConfig;
  let currentDirectory = options.entry;
  const root = path.parse(currentDirectory).root;

  while (!foundConfig) {
    let configPath;
    if (
      fs.existsSync(
        (configPath = path.join(currentDirectory, "webpack.config.js"))
      )
    ) {
      foundConfig = require(configPath);
    } else if (fs.existsSync(path.join(currentDirectory, "package.json"))) {
      break;
    } else if (currentDirectory === root) {
      break;
    }
    currentDirectory = path.dirname(currentDirectory);
  }

  if (!foundConfig) {
    const { getServerConfig, getBrowserConfigs } = configBuilder(options);
    foundConfig = [...getBrowserConfigs(), getServerConfig()];
  }

  return foundConfig;
};

const configBuilder = (exports.configBuilder = ({
  entry,
  production = true,
  output = "build"
}) => {
  const ENTRY_IS_DIR = fs.statSync(entry).isDirectory();
  const ENTRY_FILENAME_TEMPLATE = `[${
    production ? "id" : "name"
  }].[contenthash:8]`;
  const FILENAME_TEMPLATE = `${production ? "" : "[name]."}[contenthash:8]`;
  const NODE_ENV = production
    ? (process.env.NODE_ENV = "production")
    : "development";
  const MODE = production ? "production" : "development";
  const BUILD_PATH = path.resolve(CWD, output);
  const ASSETS_PATH = path.join(BUILD_PATH, "assets");
  const PUBLIC_PATH = "/assets/";
  const APP_DIR = ENTRY_IS_DIR ? entry : path.dirname(entry);
  const CONTEXT = APP_DIR.startsWith(ROOT) ? ROOT : APP_DIR;
  const markoPlugin = new MarkoPlugin();
  const markoCompiler = (() => {
    process.env.APP_DIR = APP_DIR;
    return require.resolve("./marko-compiler");
  })();

  const browserEnvs = loadBrowsersLists(entry, production);

  const sharedAliases = () => ({
    marko: useAppModuleOrFallback(APP_DIR, "marko"),
    "connect-gzip-static": useAppModuleOrFallback(
      APP_DIR,
      "connect-gzip-static"
    )
  });

  const babelConfig = targets => ({
    presets: [require.resolve("@babel/preset-env")],
    plugins: [require.resolve("babel-plugin-macros")],
    targets,
    comments: false,
    compact: false,
    babelrc: false,
    configFile: false,
    browserslistConfigFile: false
  });

  const babelLoader = targets => ({
    loader: require.resolve("babel-loader"),
    options: {
      ...babelConfig(targets),
      cacheDirectory: true
    }
  });

  const sharedRules = ({ isServer, targets }) => {
    const styleLoaders = (loaders = EMPTY) => {
      if (isServer) {
        const cssModulesLoaders = [
          {
            loader: require.resolve("css-loader"),
            options: {
              importLoaders: loaders.length,
              esModule: false,
              modules: {
                exportOnlyLocals: true
              }
            }
          },
          ...loaders
        ];
        const ignoreLoaders = [require.resolve("ignore-loader")];

        return [
          info => {
            if (/\.modules?\.\w+$/.test(info.resource)) {
              return cssModulesLoaders;
            }

            return ignoreLoaders;
          }
        ];
      } else {
        return [
          {
            loader: ExtractCSSPlugin.loader,
            options: { publicPath: "" }
          },
          {
            loader: require.resolve("css-loader"),
            options: {
              importLoaders: loaders.length + 1
            }
          },
          {
            loader: require.resolve("postcss-loader"),
            options: {
              postcssOptions: {
                plugins: [postcssPresetEnv({ browsers: targets })]
              }
            }
          },
          ...loaders
        ];
      }
    };

    return [
      {
        test: /\.[cm]?js$/,
        exclude: !production || isServer ? /node_modules/ : undefined,
        use: [babelLoader(targets)]
      },
      {
        test: /\.marko$/,
        use: [
          {
            loader: require.resolve("@marko/webpack/loader"),
            options: {
              compiler: markoCompiler,
              hydrateIncludeImports: /\.\w+(?<![cm]?js|json|wasm|marko)$/,
              babelConfig: babelConfig(targets)
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: styleLoaders()
      },
      {
        test: /\.less$/,
        use: styleLoaders([
          {
            loader: "less-loader",
            options: {
              lessOptions: {
                rewriteUrls: "local"
              }
            }
          },
          ensurePkgs(APP_DIR, ["less-loader", "less"])
        ])
      },
      {
        test: /\.s[ac]ss$/,
        use: styleLoaders([
          "resolve-url-loader",
          {
            loader: "sass-loader",
            options: { sourceMap: true }
          },
          ensurePkgs(APP_DIR, ["sass-loader", "sass"])
        ])
      },
      {
        test: /\.styl$/,
        use: styleLoaders([
          "stylus-loader",
          ensurePkgs(APP_DIR, ["stylus-loader", "stylus"])
        ])
      },
      {
        test: file =>
          file &&
          !/\.([cm]?js|json|css|less|s[ac]ss|styl|wasm|marko)$/.test(file),
        use: [
          {
            loader: require.resolve("file-loader"),
            options: {
              name: `${FILENAME_TEMPLATE}.[ext]`,
              outputPath: path.relative(
                isServer ? BUILD_PATH : ASSETS_PATH,
                ASSETS_PATH
              ),
              publicPath(url) {
                return url;
              },
              postTransformPublicPath(url) {
                return `__webpack_public_path__ + ${url}`;
              }
            }
          },
          production && {
            loader: require("image-minimizer-webpack-plugin").loader,
            options: {
              filter(_, filename) {
                return /\.(jpe?g|png|gif|svg)$/.test(filename);
              },
              minimizerOptions: {
                plugins: [
                  require.resolve("imagemin-gifsicle"),
                  require.resolve("imagemin-jpegtran"),
                  require.resolve("imagemin-optipng"),
                  require.resolve("imagemin-svgo")
                ]
              }
            }
          }
        ].filter(Boolean)
      }
    ];
  };

  const sharedConfig = options => ({
    mode: MODE,
    context: CONTEXT,
    resolve: {
      alias: sharedAliases(options),
      extensions: [".wasm", ".mjs", ".js", ".json", ".marko"]
    },
    cache: { type: "filesystem" },
    module: { rules: sharedRules(options) }
  });

  let serverPlugins = [];
  let clientPlugins = [];

  if (production) {
    const MinifyCSSPlugin = require("css-minimizer-webpack-plugin");
    const CompressionPlugin = require("compression-webpack-plugin");
    const getSharedCompressionPlugins = test => [
      new CompressionPlugin({
        test,
        algorithm: "gzip",
        filename: "[path][base].gz"
      }),
      new CompressionPlugin({
        test,
        algorithm: "brotliCompress",
        filename: "[path][base].br",
        compressionOptions: { level: 11 }
      })
    ];

    serverPlugins = serverPlugins.concat(
      getSharedCompressionPlugins(/^assets/)
    );

    clientPlugins = clientPlugins.concat(
      new MinifyCSSPlugin(),
      getSharedCompressionPlugins()
    );
  }

  const getServerConfig = (fn = IDENTITY_FN) =>
    fn({
      name: "Server",
      target: "async-node",
      devtool: "inline-nosources-cheap-module-source-map",
      entry: {
        index: SERVER_FILE,
        middleware: MIDDLEWARE_FILE
      },
      optimization: {
        minimize: false
      },
      output: {
        path: BUILD_PATH,
        filename: "[name].js",
        publicPath: PUBLIC_PATH,
        libraryTarget: "commonjs2",
        chunkFilename: `${ENTRY_FILENAME_TEMPLATE}.js`,
        devtoolModuleFilenameTemplate: "[absolute-resource-path]"
      },
      plugins: [
        new webpack.DefinePlugin({
          "typeof window": `"undefined"`,
          "process.browser": undefined,
          "process.env.BUNDLE": true,
          "process.env.NODE_ENV": JSON.stringify(NODE_ENV)
        }),
        new InjectPlugin(
          () =>
            `global.BROWSER_ENVS = [${browserEnvs
              .map(
                ({ env, targets }, index) =>
                  `{ 
                  env: ${JSON.stringify(env)}, 
                  test: ${
                    index === browserEnvs.length - 1
                      ? "null"
                      : getUserAgentRegExp({
                          browsers: targets,
                          allowHigherVersions: true
                        })
                  } 
                }`
              )
              .join(", ")}]`
        ),
        new InjectPlugin(async function () {
          const parts = [];

          if (ENTRY_IS_DIR) {
            this.cacheable(false);
            parts.push(
              await getRouterCode(
                entry,
                [BUILD_PATH, "**/node_modules", "**/components"],
                production
              )
            );
          } else if (entry.endsWith(".js")) {
            parts.push(
              `import middleware from ${JSON.stringify(entry)}`,
              `global.MARKO_MIDDLEWARE = middleware`
            );
          } else {
            parts.push(
              `import template from ${JSON.stringify(entry)}`,
              `global.GET_ROUTE = () => ({ key: 'main', template })`
            );
          }

          return parts.join(";\n");
        }),
        markoPlugin.server,
        ...serverPlugins
      ],
      ...sharedConfig({ isServer: true, targets: { node: "current" } })
    });
  const getBrowserConfig = (browser, fn = IDENTITY_FN) =>
    fn(
      {
        name: `Browser-${browser.env}`,
        target: browser.targets.length
          ? `browserslist:${browser.targets.join(", ")}`
          : "web",
        devtool: production ? "source-map" : "eval-cheap-module-source-map",
        optimization: {
          splitChunks: {
            chunks: "all",
            maxInitialRequests: 3
          }
        },
        output: {
          publicPath: PUBLIC_PATH,
          path: ASSETS_PATH,
          filename: `${ENTRY_FILENAME_TEMPLATE}.js`
        },
        plugins: [
          new webpack.DefinePlugin({
            "typeof window": `"object"`,
            "process.browser": true,
            "process.env.BUNDLE": true,
            "process.env.NODE_ENV": JSON.stringify(NODE_ENV)
          }),
          new ExtractCSSPlugin({
            filename: `${FILENAME_TEMPLATE}.css`,
            ignoreOrder: true
          }),
          markoPlugin.browser,
          ...clientPlugins
        ],
        ...sharedConfig({ isServer: false, targets: browser.targets })
      },
      browser
    );

  const getBrowserConfigs = fn =>
    browserEnvs.map(browserEnv => getBrowserConfig(browserEnv, fn));

  return {
    getServerConfig,
    getBrowserConfig,
    getBrowserConfigs
  };
});

function loadBrowsersLists(entry, production) {
  const customBrowsersList = browserslist.findConfig(entry);

  if (customBrowsersList) {
    const customBrowserEnvs = Object.entries(
      customBrowsersList
    ).map(([env, targets]) => ({ env, targets }));
    const activeBrowserEnvs = customBrowserEnvs.filter(
      ({ env, targets }) =>
        targets.length && (production ? env !== "dev" : env === "dev")
    );
    return activeBrowserEnvs.length ? activeBrowserEnvs : customBrowserEnvs;
  } else {
    return production
      ? [
          {
            env: "modern",
            targets: ["supports es6-module", "unreleased versions"]
          },
          {
            env: "legacy",
            targets: browserslist.defaults
          }
        ]
      : [
          {
            env: "dev",
            targets: [
              "last 1 Chrome versions",
              "last 1 Firefox versions",
              "last 1 Edge versions",
              "last 1 Safari versions"
            ]
          }
        ];
  }
}

function ensurePkgs(dir, pkgs) {
  let checked = false;
  return info => {
    if (!checked) {
      checked = true;
      for (const pkg of pkgs) {
        if (!resolveFrom.silent(dir, pkg)) {
          throw new Error(
            `To load ${path.extname(
              info.resource
            )} files you must first install the following packages: ${pkgs.join(
              ", "
            )}.`
          );
        }
      }
    }

    return EMPTY;
  };
}
