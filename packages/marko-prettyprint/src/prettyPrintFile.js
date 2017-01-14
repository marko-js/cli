var fs = require('fs');
var path = require('path');
var prettyPrintAST = require('./prettyPrintAST');
var getMarkoCompiler = require('./util/getMarkoCompiler');

module.exports = function prettyPrintFile(filename, options) {
    if (!filename) {
        throw new Error('The "filename" option is required when String source is provided');
    }

    var dirname = path.dirname(filename);
    var markoCompiler = getMarkoCompiler(dirname);

    var sourceCode = fs.readFileSync(filename, { encoding: 'utf8' });
    var ast = markoCompiler.parseRaw(sourceCode, filename);
    return prettyPrintAST(ast, options);
};
