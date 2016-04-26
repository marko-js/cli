'use strict';
var indentCommentLines = require('./util/indent').indentCommentLines;
module.exports = function printHtmlComment(node, printContext, writer) {
    var comment = node.comment.value;

    if (printContext.preserveWhitespace === true) {
        writer.write('<!--' + comment + '-->');
        return;
    }

    var currentIndentString = printContext.currentIndentString;

    if (printContext.isHtmlSyntax && printContext.depth !== 0) {
        writer.write('<!--' + comment + '-->');
    } else {
        var lines = comment.split(/\n|\r\n/);

        if (lines.length === 1) {
            if (printContext.isConciseSyntax) {
                writer.write(currentIndentString + '// ' + comment.trim());
            } else {
                writer.write(currentIndentString + '<!-- ' + comment.trim() + ' -->');
            }

        } else {
            var indentedLines = indentCommentLines(lines, printContext);
            writer.write(currentIndentString + '<!--\n' + indentedLines.join('\n') + '\n' + currentIndentString + '-->');
        }
    }

};