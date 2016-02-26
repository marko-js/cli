'use strict';

const SYNTAX_CONCISE = 1;
const SYNTAX_HTML = 2;

function trimLinesStart(lines) {
    var firstNonEmptyLine = -1;
    for (var i=0; i<lines.length; i++) {
        if (lines[i].trim()) {
            firstNonEmptyLine = i;
            break;
        }
    }

    if (firstNonEmptyLine > 0) {
        lines = lines.slice(firstNonEmptyLine);
    }

    return lines;
}

function trimLinesEnd(lines) {
    var firstNonEmptyLine = -1;
    for (var i=lines.length-1; i>=0; i--) {
        if (lines[i].trim()) {
            firstNonEmptyLine = i;
            break;
        }
    }

    if (firstNonEmptyLine < lines.length-1) {
        lines = lines.slice(0, firstNonEmptyLine + 1);
    }

    return lines;
}

module.exports = function prettyPrint(ast, options) {
    var src = '';
    var indent = '    ';
    var currentIndent = '';
    var syntax = options && options.syntax === 'concise' ?
        SYNTAX_CONCISE :
        SYNTAX_HTML;

    var bufferedText = '';

    function writeLineIndent() {
        src += currentIndent;
    }

    function write(str) {
        src += str;
    }

    function incIndent() {
        currentIndent += indent;
    }

    function decIndent() {
        currentIndent = currentIndent.substring(indent.length);
    }

    function indentLines(lines) {
        let blockIndentation = null;
        return lines.map((line) => {
            if (blockIndentation == null) {
                blockIndentation = line.match(/^\s*/)[0];
            }

            if (line.startsWith(blockIndentation)) {
                line = line.substring(blockIndentation.length);
                line = currentIndent + line;
            } else {
                line = currentIndent + line.trim();
            }
            return line;
        });
    }

    function flushLines(lines) {
        lines = trimLinesStart(lines);
        lines = trimLinesEnd(lines);

        if (lines.length === 0) {
            return;
        }

        if (syntax === SYNTAX_CONCISE || currentIndent === '') {
            if (lines.length > 1) {
                lines = indentLines(lines);
                write(currentIndent + '---\n' + lines.join('\n') + '\n' + currentIndent + '---');
            } else {
                let trimmed = lines[0].trim();
                if (trimmed.charAt(0) === '<') {
                    // The line does not need to be prefixed since it starts with an opening angle bracket
                    write(currentIndent + trimmed);
                } else {
                    write(currentIndent + '- ' + trimmed);
                }
            }
        } else {
            if (lines.length > 1) {
                lines = indentLines(lines);
                write(lines.join('\n'));
            } else {
                write(currentIndent + lines[0].trim());
            }
        }

        write('\n');
    }

    function flushText() {
        // bufferedText = bufferedText.trim();

        if (!bufferedText) {
            return;
        }

        var lines = bufferedText.split(/\n|\r\n/);

        var i=0;

        if (syntax === SYNTAX_CONCISE) {
            // In concise mode we don't want to bother prefixing lines that start with an opening HTML bracket.
            // This would be the case for HTML comments, HTML doctype and a declaration
            while(lines.length && i < lines.length) {
                var trimmed = lines[i].trim();
                if (trimmed.charAt(0) === '<') {
                    if (i > 0) {
                        flushLines(lines.slice(0, i));
                    }
                    write(currentIndent + trimmed + '\n');
                    lines = lines.slice(i+1);
                    i=0;
                } else {
                    i++;
                }
            }
        }

        flushLines(lines);

        bufferedText = '';
    }

    function printHtmlElement(node) {
        flushText();


        var col = 0;

        writeLineIndent();
        col += currentIndent.length;

        if (syntax === SYNTAX_HTML) {
            write('<');
            col++;
        }

        write(node.tagName);
        col += node.tagName.length;

        if (node.argument) {
            write('(' + node.argument + ')');
            col += node.argument.length + 2;
        }

        col++; // Allow for a space after the tag name

        var multilineAttrs = false;

        var attrs = node.getAttributes();
        var attrsStr = '';

        attrs.forEach((attr, i) => {

            var attrStr = '';

            if (attr.name) {
                attrStr += attr.name;
                var attrValue = attr.value;
                if (attrValue) {
                    if (attrValue.isCompoundExpression()) {
                        attrStr += '=(' + attrValue + ')';
                    }else {
                        attrStr += '=' + attrValue;
                    }

                } else if (attr.argument) {
                    attrStr += '(' + attr.argument + ')';
                }
            } else {
                attrStr += '${' + attr.value  + '}';
            }

            if (i !== 0 && col + attrStr.length > 80 && attrStr.length < (80 - currentIndent.length + indent.length)) {
                attrsStr += '\n' + currentIndent + indent + attrStr;
                col = currentIndent.length + indent.length + attrStr.length;
                multilineAttrs = true;
            } else {
                if (attrsStr.length) {
                    attrStr = ' ' + attrStr;
                }
                attrsStr += attrStr;
                col += attrStr.length;
            }
        });

        if (attrsStr) {
            write(' ');

            if (multilineAttrs && syntax === SYNTAX_CONCISE) {
                write('[ ');
            }

            write(attrsStr);

            if (multilineAttrs && syntax === SYNTAX_CONCISE) {
                write(' ]');
            }
        }

        var hasBody = node.body && node.body.length;
        if (syntax === SYNTAX_HTML) {
            if (hasBody) {
                write('>');
            } else {
                write('/>');
            }
        }

        write('\n');

        if (hasBody && multilineAttrs) {
            write('\n'); // Add one more extra spacing line if the element has multiline attributes
        }

        if (hasBody) {
            incIndent();

            node.body.forEach((child) => {
                printNode(child);
            });

            flushText();

            decIndent();

            if (multilineAttrs && syntax !== SYNTAX_CONCISE) {
                write('\n'); // Keep the spacing symmetrical
            }
        }

        if (hasBody && syntax === SYNTAX_HTML) {
            writeLineIndent();
            write('</');
            write(node.tagName);
            write('>\n');
        }
    }

    function printText(node) {
        bufferedText += node.argument.value;
    }

    function printNode(node, isRoot) {
        switch (node.type) {
            case 'HtmlElement':
                printHtmlElement(node);
                break;
            case 'Text':
                printText(node);
                break;
            default:
                throw new Error('Unsupported node: ' + node);
        }
    }

    ast.body.forEach((child) => {
        printNode(child);
    });

    flushText();

    return src;
};