const formatJS = require("./formatJS");
const toCode = require("./toCode");

module.exports = function(node, printContext) {
  let code = node.params;

  if (!Array.isArray(code) || code.length === 0) {
    return "";
  }

  code = code.map(param => toCode(param, printContext)).join(", ");

  try {
    code = formatJS(`(${code})=>{}`, printContext, true);

    if (code[0] === "(") {
      // Match `(x, y) => `
      code = code.slice(1, -7);
    } else {
      // Match `x => `
      code = code.slice(0, -6);
    }
  } catch (_) {
    // Ignore parse error
  }

  return `|${code}|`;
};
