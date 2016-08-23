'use strict';

var getIndentString = require('./util/indent').getIndentString;

var SYNTAX_CONCISE = require('./constants').SYNTAX_CONCISE;
var SYNTAX_HTML = require('./constants').SYNTAX_HTML;

class PrintContext {
    constructor(syntax, depth, indentString, preserveWhitespace, maxLen) {
        if (indentString == null) {
            indentString = '    ';
        }
        this.depth = depth == null ? 0 : depth;
        this.syntax = syntax;
        this.currentIndentString = getIndentString(depth, indentString);
        this.indentString = indentString;
        this.preserveWhitespace = preserveWhitespace === true;
        this.maxLen = maxLen;
    }

    get isConciseSyntax() {
        return this.syntax === SYNTAX_CONCISE;
    }

    get isHtmlSyntax() {
        return this.syntax === SYNTAX_HTML;
    }

    beginNested() {
        return new PrintContext(this.syntax, this.depth+1, this.indentString, this.preserveWhitespace, this.maxLen);
    }

    switchToHtmlSyntax() {
        return new PrintContext(SYNTAX_HTML, this.depth, this.indentString, this.preserveWhitespace, this.maxLen);
    }

    startPreservingWhitespace() {
        return new PrintContext(this.syntax, this.depth, this.indentString, true, this.maxLen);
    }

    clone() {
        return new PrintContext(this.syntax, this.depth, this.indentString, this.preserveWhitespace, this.maxLen);
    }
}

module.exports = PrintContext;