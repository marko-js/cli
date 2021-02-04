const { useAppModuleOrFallback } = require("./util");
const compiler = require(useAppModuleOrFallback(
  process.env.APP_DIR,
  "@marko/compiler"
));
const localComponentsPath = require.resolve("./components/marko.json");
const markoWebpackComponentsPath = require.resolve("@marko/webpack/marko.json");

compiler.taglib.register(localComponentsPath, require(localComponentsPath));

compiler.taglib.register(
  markoWebpackComponentsPath,
  require(markoWebpackComponentsPath)
);

module.exports = compiler;
