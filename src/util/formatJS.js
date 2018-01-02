const format = require("prettier").format;
const redent = require("redent");

module.exports = function(code, printContext, indent) {
  const config = {
    semi: !printContext.noSemi,
    printWidth: printContext.maxLen,
    singleQuote: printContext.singleQuote,
    useTabs: printContext.indentString[0] === '\t',
    tabWidth: printContext.indentString.length
  };

  if (code.slice(0, 5) === 'class') {
    // When parsing classes prettier (babylon) requires a class name.
    // Marko does not, we get around this by parsing as an expression.
    code = format('(' + code + ');', config).trim().slice(1, -2);
  } else {
    code = format(code, config);
  }

  if (indent) {
    code = redent(code, indent, printContext.indentString);
  }

  return code;
};
