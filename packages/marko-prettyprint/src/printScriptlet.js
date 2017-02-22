'use strict';

const indentLines = require('./util/indent').indentLines;

function getLines(code) {
    return code.split(/\r\n|\n/);
}

module.exports = function printScriptlet(node, printContext, writer) {
    const currentIndentString = printContext.currentIndentString;
    const eol = printContext.eol;

    let code = node.code;
    let lines = getLines(code);

    if (node.tag) {
        writer.write('<%');
        writer.write(code);
        writer.write('%>');
    } else {
        if (code.startsWith('\n')) {
            // Multi-line scriptlet
            let indentedLines = indentLines(lines, printContext);
            writer.write(currentIndentString + '$ {' + indentedLines.join(eol) + currentIndentString + '}');
        } else if (lines.length > 1) {
            writer.write(currentIndentString + '$ ');
            // Write the first line then indent the following lines and write them
            // This scriptlet is in the following format:
            // $ var test = {
            //
            // }
            let indentedLines = indentLines(lines, printContext);
            writer.write(currentIndentString + indentedLines.join(eol) +  eol + currentIndentString);
        } else {
            // Single-line scriptlet
            writer.write('$ ');
            writer.write(code);
        }
    }

};
