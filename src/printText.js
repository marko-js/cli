'use strict';

var trimLinesStart = require('./util/trim').trimLinesStart;
var trimLinesEnd = require('./util/trim').trimLinesEnd;
var indentLines = require('./util/indent').indentLines;
module.exports = function printText(node, printContext, writer) {
    var text = node.argument.value;

    var isConciseSyntax = printContext.depth === 0 || printContext.isConciseSyntax;

    if (printContext.preserveWhitespace === true) {
        if (isConciseSyntax) {

            if (/^\s+$/.test(text)) {
                if (!text.endsWith('\r\n') && !text.endsWith('\n')) {
                    text += '\n';
                }
                writer.write(text);
                return;
            }
        } else {
            writer.write(text);
            return;
        }
    }


    var lines = text.split(/\n|\r\n/);

    lines = trimLinesStart(lines);
    lines = trimLinesEnd(lines);

    if (lines.length === 0) {
        return;
    }

    var currentIndentString = printContext.currentIndentString;

    if (printContext.forceHtml !== true && isConciseSyntax) {
        if (lines.length > 1) {
            lines = indentLines(lines, printContext);
            writer.write('---\n' + currentIndentString + lines.join('\n').trim() + '\n' + currentIndentString + '---');
        } else {
            let trimmed = lines[0].trim();

            if (trimmed.startsWith('<')) {
                writer.write(trimmed);
            } else {
                writer.write('- ' + trimmed);
            }

        }
    } else {
        lines = indentLines(lines, printContext);
        writer.write(lines.join('\n'));
    }
};