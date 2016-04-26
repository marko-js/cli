'use strict';

module.exports = function printNode(node, printContext, writer) {
    switch (node.type) {
        case 'HtmlElement':
            return this.printHtmlElement(node, printContext, writer);
        case 'Text':
            return this.printText(node, printContext, writer);
        case 'HtmlComment':
            return this.printHtmlComment(node, printContext, writer);
        case 'DocumentType':
            return this.printDocumentType(node, printContext, writer);
        case 'Declaration':
            return this.printDeclaration(node, printContext, writer);
        default:
            throw new Error('Unsupported node: ' + node);
    }
};