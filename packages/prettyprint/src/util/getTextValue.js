var toCode = require("./toCode");

module.exports = function getTextValue(text, printContext) {
  return text.argument.type === "Literal"
    ? text.escape
      ? text.argument.value
      : text.argument.value.replace(/\\|\$!?{/g, m => "\\" + m)
    : `$${text.escape ? "" : "!"}{${toCode(
        text.argument,
        printContext,
        undefined,
        true
      )}}`;
};
