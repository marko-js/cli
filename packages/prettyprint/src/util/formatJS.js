const format = require("prettier").format;
const redent = require("redent");
const toCode = require("./toCode");

module.exports = function(code, printContext, expression) {
  if (!code) {
    return "";
  }

  code = toCode(code, printContext);
  const { indentString, depth } = printContext;
  const tabWidth = indentString.length;
  const isExpression = expression || /^class *?\{/.test(code);
  const usedSpace = depth * tabWidth;
  const config = {
    semi: !printContext.noSemi,
    printWidth: Math.max(0, printContext.maxLen - usedSpace),
    singleQuote: printContext.singleQuote,
    useTabs: indentString[0] === "\t",
    tabWidth,
    parser: "babylon"
  };

  if (isExpression) {
    code = "(" + code + ");";
  }

  code = format(code, config)
    .trim()
    .replace(/__%ESCAPE%__/g, "\\");

  if (isExpression) {
    if (code[code.length - 1] === ";") {
      code = code.slice(0, -1);
    }

    if (code[0] === "(") {
      code = code.slice(1, -1);
    }
  }

  if (depth) {
    code = redent(code, depth, indentString).trim();
  }

  return code;
};
