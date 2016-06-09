'use strict';

const unescapePlaceholdersInStringExpression = require('./util/unescapePlaceholdersInStringExpression');
const getBodyText = require('./util/getBodyText');
const hasLineBreaks = require('./util/hasLineBreaks');
const printers = require('./printers');
const Writer = require('./util/Writer');
const formattingTags = require('./formatting-tags');
const trim = require('./util/trim');

const oldLiteralToString = require('marko/compiler/ast/Literal').prototype.toString;
const MAX_COL = 80;

function replaceEscapedNewLines(jsonString) {
    return jsonString.replace(/\\\\|\\n/g, (match) => {
        if (match === '\\\\') {
            return match;
        } else {
            return '\n';
        }
    });
}

/**
 * Normal JavaScript strings don't allow the newline character, but our htmljs-parser
 * does allow new line characters in JavaScript strings (they get converted to '\\n' automatically).
 * This function is used to change how the code for JavaScript strings is printed out
 * when printing out strings in attribute values. We favor using the unescaped new line
 * character since it is usually easier to read.
 */
function enableLiteralToStringPatch(func) {
    require('marko/compiler/ast/Literal').prototype.toString = function() {
        var value = this.value;
        if (typeof value === 'string') {
            return replaceEscapedNewLines(oldLiteralToString.apply(this, arguments));
        } else {
            return oldLiteralToString.apply(this, arguments);
        }
    };

    try {
        func();
    } finally {
        require('marko/compiler/ast/Literal').prototype.toString = oldLiteralToString;
    }
}

module.exports = function printHtmlElement(node, printContext, writer) {
    if (node.hasAttribute('marko-preserve-whitespace')) {
        printContext = printContext.startPreservingWhitespace();
    } else if (node.tagDef && node.tagDef.preserveWhitespace === true) {
        printContext = printContext.startPreservingWhitespace();
    }

    var preserveBodyWhitespace = printContext.preserveWhitespace === true;

    if (preserveBodyWhitespace) {
        // We can only reliably preserve whitespace in HTML mode so we force the HTML
        // syntax if we detect that whitespace preserval is enabled
        printContext = printContext.switchToHtmlSyntax();
    }

    if (!printContext.isConciseSyntax) {
        writer.write('<');
    }

    writer.write(node.tagName);

    if (node.rawShorthandId) {
        writer.write('#' + node.rawShorthandId);
    }

    if (node.rawShorthandClassNames) {
        node.rawShorthandClassNames.forEach((className) => {
            writer.write('.' + className);
        });
    }

    if (node.argument != null) {
        writer.write('(' + node.argument + ')');
    }

    var attrsWriter = new Writer(writer.col);
    attrsWriter.col++; // Allow for space after tag name;

    var attrs = node.getAttributes();

    var attrStringsArray = [];

    var hasBody = node.body && node.body.length;

    let bodyText = getBodyText(node);
    if (bodyText && printContext.preserveWhitespace !== true) {
        bodyText = bodyText.trim();
    }

    if (bodyText != null && bodyText.length === 0) {
        bodyText = null;
        hasBody = false;
    }

    // We will make one pass to generate all of the strings for each attribute. We will then
    // append them to the output while avoiding putting too many attributes on one line.
    enableLiteralToStringPatch(() => {
        attrs.forEach((attr, i) => {

            var attrStr = ' ';

            if (attr.name) {
                attrStr += attr.name;
                var attrValue = attr.value;
                if (attrValue) {
                    if (attrValue.isCompoundExpression()) {
                        attrStr += '=(' + unescapePlaceholdersInStringExpression(attrValue.toString()) + ')';
                    } else {
                        attrStr += '=' + unescapePlaceholdersInStringExpression(attrValue.toString());
                    }
                } else if (attr.argument != null) {
                    attrStr += '(' + attr.argument + ')';
                }
            } else {
                attrStr += '${' + attr.value  + '}';
            }

            attrStringsArray.push(attrStr);
        });
    });

    if (attrStringsArray.length) {
        // We have attributes
        // Let's see if all of the attributes will fit on the same line
        if (printContext.isHtmlSyntax) {
            attrStringsArray.forEach((attrString, i) => {
                let stringToAppend = attrString;
                if (i === attrStringsArray.length - 1) {
                    if (hasBody) {
                        stringToAppend += '>';
                    } else {
                        stringToAppend += '/>';
                    }
                }

                if (i === 0 || writer.col + stringToAppend.length < MAX_COL) {
                    writer.write(stringToAppend);
                } else {
                    writer.write('\n' + printContext.currentIndentString + printContext.indentString + trim.ltrim(stringToAppend));
                }
            });
        } else {
            var attrsString = attrStringsArray.join('');
            if (writer.col + attrsString.length < MAX_COL) {
                writer.write(attrsString);
            } else {
                writer.write(' [\n');
                attrStringsArray.forEach((attrString, i) => {
                    writer.write(printContext.currentIndentString);
                    writer.write(printContext.indentString);
                    writer.write(printContext.indentString);
                    writer.write(trim.ltrim(attrString) + '\n');
                });

                writer.write(printContext.currentIndentString);
                writer.write(printContext.indentString);
                writer.write(']');
            }
        }
    } else {
        if (printContext.isHtmlSyntax) {
            if (hasBody) {
                writer.write('>');
            } else {
                writer.write('/>');
                return;
            }
        }
    }

    if (!hasBody) {
        return;
    }

    var endTag = printContext.isHtmlSyntax ? '</' + node.tagName + '>' : '';

    if (bodyText && !hasLineBreaks(bodyText)) {
        let endCol = writer.col + bodyText.length + endTag.length;

        if (endCol < MAX_COL) {
            if (printContext.isConciseSyntax) {
                writer.write(' - ' + bodyText);
            } else {
                writer.write(bodyText + '</' + node.tagName + '>');
            }
            return;
        }
    }

    if (!preserveBodyWhitespace) {
        writer.write('\n');
    }

    var nestedPrintContext = printContext.beginNested();

    if (printContext.isHtmlSyntax && formattingTags[node.tagName]) {
        let nestedWriter = new Writer(writer.col);
        printers.printNodes(node.body.items, nestedPrintContext, nestedWriter);
        let trimmedOutput = nestedWriter.getOutput();
        if (preserveBodyWhitespace !== true) {
            trimmedOutput = nestedWriter.getOutput().trim();
        }

        if (hasLineBreaks(trimmedOutput)) {
            if (writer.getOutput().endsWith('\n' + printContext.indentString) === false) {
                writer.write(printContext.indentString);
            }

            writer.write(nestedWriter.getOutput());
            writer.write(printContext.currentIndentString);
            writer.write(endTag);
        } else {
            if (preserveBodyWhitespace !== true) {
                writer.rtrim();
            }

            writer.write(trimmedOutput);
            writer.write(endTag);
        }
    } else {
        printers.printNodes(node.body.items, nestedPrintContext, writer);

        if (printContext.isHtmlSyntax) {
            if (!preserveBodyWhitespace) {
                writer.write(printContext.currentIndentString);
            }

            writer.write(endTag);
        }
    }

};