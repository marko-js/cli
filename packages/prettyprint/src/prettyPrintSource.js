var path = require("path");
var prettyPrintAST = require("./prettyPrintAST");
var requireMarkoFile = require("./util/requireMarkoFile");

module.exports = function prettyPrintSource(src, options) {
  if (!options) {
    throw new Error(
      '"options" argument is required and "filename" is a required property'
    );
  }

  var filename = options.filename;

  if (!filename) {
    throw new Error('The "filename" option is required');
  }

  options = Object.assign({}, options);

  src = src.replace(/(\r\n|\r)/g, "\n");

  var dirname = path.dirname(filename);
  options.dirname = dirname;

  var markoCompiler =
    options.markoCompiler || requireMarkoFile(dirname, "compiler");
  options.markoCompiler = markoCompiler;
  options.CodeWriter =
    options.CodeWriter || requireMarkoFile(dirname, "compiler/CodeWriter");

  var ast = markoCompiler.parse(src, filename, {
    raw: true,
    onContext(context) {
      options.taglibLookup = context.taglibLookup;
    }
  });
  return prettyPrintAST(ast, options);
};
