var prettyPrintSource = require("./prettyPrintSource");
var prettyPrintAST = require("./prettyPrintAST");

module.exports = exports = function prettyPrint(ast, options) {
  if (typeof ast === "string") {
    var source = ast;
    return prettyPrintSource(source, options);
  }

  return prettyPrintAST(ast, options);
};

exports.prettyPrintAST = prettyPrintAST;
exports.prettyPrintFile = require("./prettyPrintFile");
exports.prettyPrintSource = prettyPrintSource;
