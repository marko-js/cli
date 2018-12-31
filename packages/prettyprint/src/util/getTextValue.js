var formatJS = require("./formatJS");

module.exports = function getTextValue(text, printContext) {
  return text.argument.type === "Literal"
    ? text.escape
      ? text.argument.value
      : text.argument.value.replace(/\\|\$!?{/g, m => "\\" + m)
    : `$${text.escape ? "" : "!"}{${formatJS(
        text.argument,
        printContext,
        true
      )}}`;
};
