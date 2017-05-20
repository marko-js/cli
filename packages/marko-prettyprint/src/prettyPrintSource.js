var path = require('path');
var prettyPrintAST = require('./prettyPrintAST');
var getMarkoCompiler = require('./util/getMarkoCompiler');

module.exports = function prettyPrintSource(src, options) {
    if (!options) {
        throw new Error('"options" argument is required and "filename" is a required property');
    }

    var filename = options.filename;

    if (!filename) {
        throw new Error('The "filename" option is required');
    }

    options = Object.assign({}, options);

    var dirname = path.dirname(filename);
    options.dirname = dirname;

    var markoCompiler = options.markoCompiler || getMarkoCompiler(dirname);
    options.markoCompiler = markoCompiler;

    var ast = markoCompiler.parseRaw(src, filename);
    return prettyPrintAST(ast, options);
};
