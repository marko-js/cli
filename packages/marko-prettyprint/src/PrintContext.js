'use strict';

var getIndentString = require('./util/indent').getIndentString;

var SYNTAX_CONCISE = require('./constants').SYNTAX_CONCISE;
var SYNTAX_HTML = require('./constants').SYNTAX_HTML;

class PrintContext {
    constructor(syntax, depth, indentString, preserveWhitespace) {
        if (indentString == null) {
            indentString = '    ';
        }
        this.depth = depth == null ? 0 : depth;
        this.syntax = syntax;
        this.currentIndentString = getIndentString(depth, indentString);
        this.indentString = indentString;
        this.preserveWhitespace = preserveWhitespace === true;
    }

    get isConciseSyntax() {
        return this.syntax === SYNTAX_CONCISE;
    }

    get isHtmlSyntax() {
        return this.syntax === SYNTAX_HTML;
    }

    beginNested() {
        return new PrintContext(this.syntax, this.depth+1, this.indentString, this.preserveWhitespace);
    }

    switchToHtmlSyntax() {
        return new PrintContext(SYNTAX_HTML, this.depth, this.indentString, this.preserveWhitespace);
    }

    startPreservingWhitespace() {
        return new PrintContext(this.syntax, this.depth, this.indentString, true);
    }

    clone() {
        return new PrintContext(this.syntax, this.depth, this.indentString, this.preserveWhitespace);
    }
}

module.exports = PrintContext;