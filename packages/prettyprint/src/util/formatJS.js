const format = require("prettier").format;
const redent = require("redent");
const toCode = require("./toCode");

module.exports = function(code, printContext, expression) {
  if (!code) {
    return "";
  }

  if (code.type === "TemplateLiteral" && code.nonstandard) {
    // This isn't valid JS, so we won't go through prettier
    code = toCode(code, printContext);
    return JSON.stringify(code.trim().slice(1, -1));
  }

  const { indentString, depth } = printContext;
  const tabWidth = indentString.length;
  const isExpression = expression || /^class *?\{/.test(code);
  const usedSpace = depth * tabWidth;
  const config = {
    parser: "babel",
    semi: !printContext.noSemi,
    printWidth: Math.max(0, printContext.maxLen - usedSpace),
    singleQuote: printContext.singleQuote,
    useTabs: indentString[0] === "\t",
    tabWidth
  };

  code = toCode(code, printContext);

  if (isExpression) {
    code = "_ = " + code;
  }

  code = format(code, config)
    .trim()
    .replace(/__%ESCAPE%__/g, "\\");

  if (isExpression) {
    code = code.slice(4);

    if (code[code.length - 1] === ";") {
      code = code.slice(0, -1);
    }
  }

  return redent(code, depth, indentString).trim();
};
