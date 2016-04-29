'use strict';

var Writer = require('./util/Writer');
var PrintContext = require('./PrintContext');
var markoCompiler = require('marko/compiler');
var printers = require('./printers');


var SYNTAX_CONCISE = require('./constants').SYNTAX_CONCISE;
var SYNTAX_HTML = require('./constants').SYNTAX_HTML;

module.exports = function prettyPrint(ast, userOptions) {
    userOptions = userOptions || {};

    if (typeof ast === 'string') {
        var filename = userOptions.filename;
        if (!filename) {
            throw new Error('The "filename" option is required when String source is provided');
        }

        ast = markoCompiler.parseRaw(ast, filename);
    }

    var syntax = userOptions && userOptions.syntax === 'concise' ?
        SYNTAX_CONCISE :
        SYNTAX_HTML;

    var indent = userOptions.indent || '    ';

    // We always start out in the concise syntax
    var printContext = new PrintContext(syntax, 0, indent);
    var writer = new Writer(0 /* col */);

    printers.printNodes(ast.body.items, printContext, writer);
    return writer.getOutput();
};