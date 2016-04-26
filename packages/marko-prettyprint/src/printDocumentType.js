'use strict';

module.exports = function printDocumentType(node, printContext, writer) {
    var doctype = node.documentType.value;

    if (printContext.preserveWhitespace !== true) {
        doctype = doctype.trim();
    }

    writer.write('<!' + doctype + '>\n');
};