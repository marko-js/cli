"use strict";

module.exports = function printNode(node, printContext, writer) {
  switch (node.type) {
    case "HtmlElement":
    /**
     * CustomTag nodes are not created in raw parsing mode but should have
     * the same output as an HTMlElement node. This is added here to support
     * using Marko prettyprint when serializing a template for transform testing.
     */
    case "CustomTag":
      return this.printHtmlElement(node, printContext, writer);
    case "Text":
      return this.printText(node, printContext, writer);
    case "HtmlComment":
      return this.printHtmlComment(node, printContext, writer);
    case "DocumentType":
      return this.printDocumentType(node, printContext, writer);
    case "Declaration":
      return this.printDeclaration(node, printContext, writer);
    case "Scriptlet":
      return this.printScriptlet(node, printContext, writer);
    default:
      throw new Error("Unsupported node: " + node);
  }
};
