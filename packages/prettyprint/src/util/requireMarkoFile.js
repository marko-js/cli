const path = require("path");
const resolveFrom = require("resolve-from");

function requireMarkoFile(dir, file) {
  const requirePath = `marko/${file}`;
  let resolvedPath =
    resolveFrom(dir, requirePath) || require.resolve(requirePath);

  if (resolvedPath) {
    return require(resolvedPath);
  } else {
    return require(requirePath);
  }
}

function getMarkoCompiler(dir, file) {
  const isDebug = requireMarkoFile(dir, "env").isDebug;
  const requirePath = path.join(isDebug ? "src" : "dist", file);
  return requireMarkoFile(dir, requirePath);
}

module.exports = getMarkoCompiler;
