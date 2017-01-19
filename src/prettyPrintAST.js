'use strict';

var Writer = require('./util/Writer');
var PrintContext = require('./PrintContext');
var printers = require('./printers');
var readConfigFile = require('./util/readConfigFile');

var SYNTAX_CONCISE = require('./constants').SYNTAX_CONCISE;
var SYNTAX_HTML = require('./constants').SYNTAX_HTML;

module.exports = function prettyPrintAST(ast, options) {
    if (options) {
        options = Object.assign({}, options);
    } else {
        options = {};
    }

    if (options.configFiles !== false) {
        var filename = options.filename;
        if (filename) {
            var configFileOptions = readConfigFile(filename);
            if (configFileOptions) {
                options = Object.assign({}, configFileOptions, options);
            }
        }
    }

    if (options.syntax) {
        options.syntax = options.syntax === 'concise' ?
            SYNTAX_CONCISE :
            SYNTAX_HTML;
    } else {
        options.syntax = SYNTAX_HTML;
    }

    var printContext = new PrintContext(options);
    var writer = new Writer(0 /* col */);

    printers.printNodes(ast.body.items, printContext, writer);
    return writer.getOutput();
};
