var fs = require('fs');
var path = require('path');
var prettyPrintAST = require('./prettyPrintAST');
var getMarkoCompiler = require('./util/getMarkoCompiler');

module.exports = function prettyPrintFile(filename, options) {
    if (!filename) {
        throw new Error('The "filename" option is required when String source is provided');
    }

    if (options) {
        options = Object.assign({}, options);
    } else {
        options = {};
    }

    var dirname = path.dirname(filename);
    options.filename = filename;
    options.dirname = dirname;

    var markoCompiler = getMarkoCompiler(dirname);
    options.markoCompiler = markoCompiler;

    var sourceCode = fs.readFileSync(filename, { encoding: 'utf8' });
    var ast = markoCompiler.parseRaw(sourceCode, filename);
    var prettySourceCode = prettyPrintAST(ast, options);
    fs.writeFileSync(filename, prettySourceCode, { encoding: 'utf8' });
};
