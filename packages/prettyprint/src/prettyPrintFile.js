var fs = require("fs");
var path = require("path");
var prettyPrintAST = require("./prettyPrintAST");
var requireMarkoFile = require("./util/requireMarkoFile");

module.exports = function prettyPrintFile(filename, options) {
  if (!filename) {
    throw new Error(
      'The "filename" option is required when String source is provided'
    );
  }

  if (options) {
    options = Object.assign({}, options);
  } else {
    options = {};
  }

  var dirname = path.dirname(filename);
  options.filename = filename;
  options.dirname = dirname;

  var markoCompiler = requireMarkoFile(dirname, "compiler");
  var CodeWriter = requireMarkoFile(dirname, "compiler/CodeWriter");
  options.markoCompiler = markoCompiler;
  options.CodeWriter = CodeWriter;

  var sourceCode = fs.readFileSync(filename, { encoding: "utf8" });
  var ast = markoCompiler.parseRaw(sourceCode, filename);
  var prettySourceCode = prettyPrintAST(ast, options);
  fs.writeFileSync(filename, prettySourceCode, { encoding: "utf8" });
};
