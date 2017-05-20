'use strict';

const unescapePlaceholdersInStringExpression = require('./util/unescapePlaceholdersInStringExpression');
const getBodyText = require('./util/getBodyText');
const hasLineBreaks = require('./util/hasLineBreaks');
const printers = require('./printers');
const Writer = require('./util/Writer');
const formattingTags = require('./formatting-tags');
const trim = require('./util/trim');

const codeTags = {
    'class': true,
    'import': true,
    'static': true,
    'style': true
};


function isComponentStyleTag(node) {
    var attrs = node.getAttributes();
    var attrCount = attrs.length;
    if (!attrCount) {
        return false;
    }

    var lastAttr = attrs[attrCount - 1];
    return /\s*\{/.test(lastAttr.name);
}

function handleCodeTag(node, writer) {
    var tagName = node.tagName;

    if (!codeTags[tagName]) {
        return false;
    }

    if (tagName === 'style' && !isComponentStyleTag(node)) {
        return false;
    }
    writer.write(node.tagString);

    return true;
}

module.exports = function printHtmlElement(node, printContext, writer) {
    if (node.hasAttribute('marko-preserve-whitespace')) {
        printContext = printContext.startPreservingWhitespace();
    } else if (node.tagDef && node.tagDef.preserveWhitespace === true) {
        printContext = printContext.startPreservingWhitespace();
    }

    if (printContext.depth === 0 && handleCodeTag(node, writer)) {
        return;
    }

    var isDynamicTagName = node.tagName.startsWith('$');
    var preserveBodyWhitespace = printContext.preserveWhitespace === true;
    var maxLen = printContext.maxLen;

    if (preserveBodyWhitespace || isDynamicTagName) {
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
            } else if (attr.argument != null) {
                attrStr += '(' + attr.argument + ')';
            }
        } else {
            attrStr += '${' + attr.value  + '}';
        }

        attrStringsArray.push(attrStr);
    });

    if (attrStringsArray.length) {
        // We have attributes
        // Let's see if all of the attributes will fit on the same line
        if (printContext.isHtmlSyntax) {
            attrStringsArray.forEach((attrString, i) => {
                let stringToAppend = ' ' + attrString;
                if (i === attrStringsArray.length - 1) {
                    if (hasBody) {
                        stringToAppend += '>';
                    } else {
                        stringToAppend += '/>';
                    }
                }

                if (i === 0 || writer.col + stringToAppend.length < maxLen) {
                    writer.write(stringToAppend);
                } else {
                    writer.write(printContext.eol + printContext.currentIndentString + printContext.indentString + trim.ltrim(stringToAppend));
                }
            });
        } else {
            var useCommas = node.tagName === 'var';

            var attrsString;

            if (useCommas) {
                attrsString = ' ' + attrStringsArray.join(', ') + ';';
            } else {
                attrsString = ' ' + attrStringsArray.join(' ');
            }

            if (writer.col + attrsString.length < maxLen) {
                writer.write(attrsString);
            } else {
                if (useCommas) {
                    writer.write(' ');
                    var lastIndex = attrStringsArray.length - 1;

                    attrStringsArray.forEach((attrString, i) => {
                        if (i !== 0) {
                            writer.write(printContext.currentIndentString);
                            writer.write(printContext.indentString);
                        }

                        if (i === lastIndex) {

                            writer.write(attrString + ';' + printContext.eol);
                        } else {
                            writer.write(attrString + ',' + printContext.eol);
                        }
                    });
                } else {
                    writer.write(' [' + printContext.eol);
                    attrStringsArray.forEach((attrString, i) => {
                        writer.write(printContext.currentIndentString);
                        writer.write(printContext.indentString);
                        writer.write(printContext.indentString);
                        writer.write(attrString + printContext.eol);
                    });

                    writer.write(printContext.currentIndentString);
                    writer.write(printContext.indentString);
                    writer.write(']');
                }
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

        if (endCol < maxLen) {
            if (printContext.isConciseSyntax) {
                writer.write(' -- ' + bodyText);
            } else {
                writer.write(bodyText + '</' + node.tagName + '>');
            }
            return;
        }
    }

    if (!preserveBodyWhitespace) {
        writer.write(printContext.eol);
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
            if (writer.getOutput().endsWith(printContext.eol + printContext.indentString) === false) {
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
