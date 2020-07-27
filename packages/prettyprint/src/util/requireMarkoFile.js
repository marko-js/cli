const path = require("path");
const resolveFrom = require("resolve-from");

function requireMarkoFile(dir, file) {
  const { version } = requireFromDirOrFallback(dir, "marko/package.json");

  if (version.split(".")[0] === "4") {
    return requireFromDirOrFallback(dir, `marko/${file}`);
  }

  return require(`marko/${file}`);
}

function getMarkoCompiler(dir, file) {
  const isDebug = requireMarkoFile(dir, "env").isDebug;
  const requirePath = path.join(isDebug ? "src" : "dist", file);
  return requireMarkoFile(dir, requirePath);
}

function requireFromDirOrFallback(dir, file) {
  return require(resolveFrom.silent(dir, file) || file);
}

module.exports = getMarkoCompiler;
