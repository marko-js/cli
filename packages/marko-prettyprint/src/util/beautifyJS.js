const beautifyJS = require("js-beautify").js_beautify;
const redent = require("redent");

module.exports = function(code, printContext, indent) {
  code = beautifyJS(code, {
    indent_char: printContext.indentString[0],
    indent_size: printContext.indentString.length
  }).trim();

  if (indent) {
    code = redent(code, indent, printContext.indentString);
  }

  return code;
};