var resolveFrom = require('resolve-from');
var path = require('path');
var prettyPrintAST = require('./prettyPrintAST');
var getMarkoCompiler = require('./util/getMarkoCompiler');

function getMarkoCompiler(dir) {
    var markoCompilerPath = resolveFrom(dir, 'marko-compiler');

    if (markoCompilerPath) {
        return require(markoCompilerPath);
    } else {
        return require('marko/compiler');
    }
}

module.exports = function prettyPrintSource(src, options) {
    if (!options) {
        throw new Error('"options" argument is required and "filename" is a required property');
    }

    var filename = options.filename;

    if (!filename) {
        throw new Error('The "filename" option is required');
    }

    var dirname = path.dirname(filename);

    var markoCompiler = getMarkoCompiler(dirname);

    var ast = markoCompiler.parseRaw(src, filename);
    return prettyPrintAST(ast, options);
};
