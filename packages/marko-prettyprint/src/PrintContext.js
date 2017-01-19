'use strict';

var SYNTAX_CONCISE = require('./constants').SYNTAX_CONCISE;
var SYNTAX_HTML = require('./constants').SYNTAX_HTML;
var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991;

class PrintContext {
    constructor(options) {
        this.syntax = options.syntax || SYNTAX_HTML;
        this.indentString = options.indent || '    ';
        this.preserveWhitespace = options.preserveWhitespace === true;
        this.maxLen = options.maxLen == null ? 80 : (options.maxLen <= 0 ? MAX_SAFE_INTEGER : options.maxLen);
        this.eol = options.eol || '\n';

        this.depth = 0;
        this.forceHtml = false;
        this.currentIndentString = '';
    }

    get isConciseSyntax() {
        return this.syntax === SYNTAX_CONCISE;
    }

    get isHtmlSyntax() {
        return this.syntax === SYNTAX_HTML;
    }

    beginNested() {
        var newPrintContext = Object.create(this);
        newPrintContext.depth++;
        newPrintContext.currentIndentString += this.indentString;
        return newPrintContext;
    }

    switchToHtmlSyntax() {
        if (this.syntax == SYNTAX_HTML) {
            return this;
        }

        var newPrintContext = Object.create(this);
        newPrintContext.syntax = SYNTAX_HTML;
        return newPrintContext;
    }

    startPreservingWhitespace() {
        if (this.preserveWhitespace) {
            return this;
        }
        var newPrintContext = Object.create(this);
        newPrintContext.preserveWhitespace = true;
        return newPrintContext;
    }

    create(newOptions) {
        var newPrintContext = Object.create(this);
        Object.assign(newPrintContext, newOptions);
        return newPrintContext;

    }
}

module.exports = PrintContext;
