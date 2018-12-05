"use strict";

const redent = require("redent");
const formatJS = require("./util/formatJS");

module.exports = function printScriptlet(node, printContext, writer) {
  const currentIndentString = printContext.currentIndentString;
  const indentString = printContext.indentString;
  const code = node.code;
  let isBlock = node.block;

  if (node.tag) {
    writer.write("<%");
    writer.write(code);
    writer.write("%>");
  } else {
    const output = formatJS(code, printContext, printContext.depth);

    if (!isBlock && /[\r\n]/g.test(output)) {
      isBlock = true;
    }

    if (isBlock) {
      // Multi-line scriptlet

      writer.write(
        currentIndentString +
          "$ {\n" +
          redent(output, printContext.depth + 1, indentString) +
          "\n" +
          currentIndentString +
          "}"
      );
    } else {
      writer.write("$ ");
      writer.write(output);
    }
  }
};
