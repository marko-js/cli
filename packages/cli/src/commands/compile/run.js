const markoCompile = require("@marko/compile");

module.exports = function run(options, markoCli) {
  const { ignore, server, browser, clean, patterns } = options;
  return markoCompile.run({
    dir: markoCli.cwd,
    ignore,
    server,
    browser,
    clean,
    patterns
  });
};
