const format = require("prettier").format;
const redent = require("redent");

module.exports = function(code, printContext, indent, expression) {
  const config = {
    semi: !printContext.noSemi,
    printWidth: printContext.maxLen,
    singleQuote: printContext.singleQuote,
    useTabs: printContext.indentString[0] === "\t",
    tabWidth: printContext.indentString.length,
    parser: "babylon"
  };

  const isExpression = expression || /^class *?\{/.test(code);

  if (isExpression) {
    code = "(" + code + ");";
  }

  code = format(code, config).trim();

  if (isExpression) {
    if (code[code.length - 1] === ";") {
      code = code.slice(0, -1);
    }

    if (code[0] === "(") {
      code = code.slice(1, -1);
    }
  }

  if (indent) {
    code = redent(code, indent, printContext.indentString).trim();
  }

  return code;
};
