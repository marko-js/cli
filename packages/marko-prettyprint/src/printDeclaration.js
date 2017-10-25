"use strict";

module.exports = function printDeclaration(node, printContext, writer) {
  var declaration = node.declaration.value;

  if (printContext.preserveWhitespace !== true) {
    declaration = declaration.trim();
  }

  writer.write("<?" + declaration + "?>");
};
