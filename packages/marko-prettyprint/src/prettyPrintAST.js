'use strict';

var Writer = require('./util/Writer');
var PrintContext = require('./PrintContext');
var printers = require('./printers');

var SYNTAX_CONCISE = require('./constants').SYNTAX_CONCISE;
var SYNTAX_HTML = require('./constants').SYNTAX_HTML;

module.exports = function prettyPrint(ast, options) {
    options = options || {};

    var syntax = options && options.syntax === 'concise' ?
        SYNTAX_CONCISE :
        SYNTAX_HTML;

    var indent = options.indent || '    ';
    var maxLen = options.maxLen || 80;

    // We always start out in the concise syntax
    var printContext = new PrintContext(syntax, 0, indent, false, maxLen);
    var writer = new Writer(0 /* col */);

    printers.printNodes(ast.body.items, printContext, writer);
    return writer.getOutput();
};
