"use strict";

const redent = require("redent");
const formatJS = require("./util/formatJS");

module.exports = function printScriptlet(node, printContext, writer) {
  const currentIndentString = printContext.currentIndentString;
  const indentString = printContext.indentString;
  const code = node.code;

  if (node.tag) {
    writer.write("<%");
    writer.write(code);
    writer.write("%>");
  } else {
    const output = formatJS(code, printContext);
    const newLineCount = countNewLines(output);
    const isInline =
      newLineCount === 0 ||
      (!node.block && newLineCount === countNewLines(code));

    if (isInline) {
      writer.write(`$ ${output}`);
    } else {
      // Multi-line scriptlet
      writer.write(
        `$ {\n${redent(
          output,
          printContext.depth + 1,
          indentString
        )}\n${currentIndentString}}`
      );
    }
  }
};

function countNewLines(str) {
  const match = str.match(/[\r\n]/g);
  return (match && match.length) || 0;
}
