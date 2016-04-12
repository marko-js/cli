'use strict';

const SYNTAX_CONCISE = 1;
const SYNTAX_HTML = 2;

function unescapePlaceholdersInStringExpression(string) {
    return string.replace(/([\\]{2,4})?\$[!]?{/g, function(match) {
        if (match.startsWith('\\\\\\\\')) {
            return match.substring(2);
        } else if (match.startsWith('\\\\')) {
            return match.substring(1);
        }

        return match;
    });
}

var markoCompiler = require('marko/compiler');

function rtrim(s) {
    return s && s.replace(/\s\s*$/,'');
}

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

function getBodyText(el) {
    var children = el.body.items;
    var text = '';
    for (var i=0; i<children.length; i++) {
        let child = children[i];
        if (child.type !== 'Text') {
            return null;
        }
        text += child.argument.value;
    }
    return text;
}

function hasLineBreaks(str) {
    return /\n/.test(str);
}

module.exports = function prettyPrint(ast, options) {
    options = options || {};

    if (typeof ast === 'string') {
        var filename = options.filename;
        if (!filename) {
            throw new Error('The "filename" option is required when String source is provided');
        }

        ast = markoCompiler.parseRaw(ast, filename);
    }

    var src = '';
    var indent = '    ';
    var currentIndent = '';
    var syntax = options && options.syntax === 'concise' ?
        SYNTAX_CONCISE :
        SYNTAX_HTML;

    var isConciseSyntax = syntax === SYNTAX_CONCISE;

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

            if (line.trim()) {
                if (line.startsWith(blockIndentation)) {
                    line = line.substring(blockIndentation.length);

                    line = currentIndent + rtrim(line);
                } else {
                    line = currentIndent + line.trim();
                }
            } else {
                line = '';
            }


            return line;
        });
    }

    function indentCommentLines(lines) {
        let blockIndentation = null;

        var indentedLines = [];

        lines.forEach((line, i) => {
            if (line.trim() === '') {
                return;
            }

            if (blockIndentation == null) {
                blockIndentation = line.match(/^\s*/)[0];
                if (!blockIndentation) {
                    blockIndentation = null;
                }
            }

            if (line.startsWith(blockIndentation)) {
                line = line.substring(blockIndentation.length);
                line = currentIndent + rtrim(line);
            } else {
                line = currentIndent + line.trim();
            }
            indentedLines.push(line);
        });

        return indentedLines;
    }

    function flushLines(lines) {
        lines = trimLinesStart(lines);
        lines = trimLinesEnd(lines);

        if (lines.length === 0) {
            return;
        }

        if (isConciseSyntax || currentIndent === '') {
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
                let trimmed = lines[0].trim();
                if (trimmed) {
                    write(currentIndent + lines[0].trim());
                } else {
                    write('');
                }
            }
        }

        write('\n');
    }

    function flushBufferedText() {
        // bufferedText = bufferedText.trim();

        if (!bufferedText) {
            return;
        }

        var lines = bufferedText.split(/\n|\r\n/);

        var i=0;

        if (isConciseSyntax) {
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
        flushBufferedText();


        var col = 0;

        writeLineIndent();
        col += currentIndent.length;

        if (!isConciseSyntax) {
            write('<');
            col++;
        }

        write(node.tagName);
        col += node.tagName.length;

        if (node.rawShorthandId) {
            write('#' + node.rawShorthandId);
            col += node.rawShorthandId.length + 1;
        }

        if (node.rawShorthandClassNames) {
            node.rawShorthandClassNames.forEach((className) => {
                write('.' + className);
                col += className.length + 1;
            });
        }

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
                        attrStr += '=(' + unescapePlaceholdersInStringExpression(attrValue.toString()) + ')';
                    } else {
                        attrStr += '=' + unescapePlaceholdersInStringExpression(attrValue.toString());
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

            if (multilineAttrs && isConciseSyntax) {
                write('[ ');
                col += 2;
            }

            write(attrsStr);

            if (multilineAttrs && isConciseSyntax) {
                write(' ]');
                col += 2;
            }
        }

        var hasBody = node.body && node.body.length;
        if (!isConciseSyntax) {
            if (hasBody) {
                write('>');
                col += 1;
            } else {
                write('/>');
            }
        }

        if (hasBody) {
            let bodyText = getBodyText(node);
            if (bodyText && !hasLineBreaks(bodyText)) {
                let endCol = col + bodyText.length;
                if (!isConciseSyntax) {
                    endCol += ('</' + node.tagName + '>').length;
                }

                if (bodyText && !hasLineBreaks(bodyText) && endCol < 80) {
                    if (isConciseSyntax) {
                        write(' - ' + bodyText + '\n');
                    } else {
                        write(bodyText + '</' + node.tagName + '>\n');
                    }

                    return;
                }
            }
        }

        write('\n');

        if (hasBody && multilineAttrs) {
            write('\n'); // Add one more extra spacing line if the element has multiline attributes
        }

        if (hasBody) {
            incIndent();

            var tagDef = node.tagDef;

            if (tagDef && (tagDef.body === 'static-text' || tagDef.body === 'parsed-text')) {
                var bodyText = getBodyText(node);
                if (bodyText) {
                    flushLines(bodyText.split(/\n|\r\n/));
                }
            } else {
                node.body.forEach((child) => {
                    printNode(child);
                });

                flushBufferedText();
            }

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

    function isInlineComment(node) {
        if (bufferedText && !bufferedText.endsWith('\n')) {
            return true;
        }

        var nextSibling = node.nextSibling;
        if (!nextSibling) {
            return false;
        }

        if (nextSibling.type !== 'Text') {
            return false;
        }

        var nextSiblingText = nextSibling.argument.value;
        if (nextSiblingText.startsWith('\n') || nextSiblingText.startsWith('\r\n')) {
            return false;
        } else {
            return true;
        }
    }

    function printHtmlComment(node) {
        var comment = node.comment.value;

        if (isInlineComment(comment)) {
            bufferedText += '<!--' + comment + '-->';
        } else {
            flushBufferedText();
            var lines = comment.split(/\n|\r\n/);
            if (lines.length === 1) {
                if (isConciseSyntax) {
                    write(currentIndent + '// ' + comment.trim());
                } else {
                    write(currentIndent + '<!-- ' + comment.trim() + ' -->');
                }

            } else {
                write(currentIndent + '<!--\n' + indentCommentLines(lines).join('\n') + '\n' + currentIndent + '-->');
            }
            write('\n');
        }

    }

    function printDocumentType(node) {
        flushBufferedText();
        var doctype = node.documentType.value;
        write(currentIndent + '<!' + doctype.trim() + '>\n');
    }

    function printDeclaration(node) {
        flushBufferedText();
        var declaration = node.declaration.value;
        write(currentIndent + '<?' + declaration.trim() + '?>\n');
    }

    function printNode(node, isRoot) {
        switch (node.type) {
            case 'HtmlElement':
                printHtmlElement(node);
                break;
            case 'Text':
                printText(node);
                break;
            case 'HtmlComment':
                printHtmlComment(node);
                break;
            case 'DocumentType':
                printDocumentType(node);
                break;
            case 'Declaration':
                printDeclaration(node);
                break;
            default:
                throw new Error('Unsupported node: ' + node);
        }
    }

    ast.body.forEach((child) => {
        printNode(child);
    });

    flushBufferedText();

    return src;
};