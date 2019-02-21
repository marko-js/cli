const path = require("path");
const { useAppModuleOrFallback } = require("./util");
const compiler = require(path.join(
  useAppModuleOrFallback(process.env.APP_DIR, "marko"),
  "compiler"
));

compiler.registerTaglib(require.resolve("./components/marko.json"));

module.exports = compiler;
