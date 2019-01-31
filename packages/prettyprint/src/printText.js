"use strict";

var indentLines = require("./util/indent").indentLines;
var getTextValue = require("./util/getTextValue");
module.exports = function printText(node, printContext, writer) {
  var text = getTextValue(node, printContext);
  var isConciseSyntax =
    printContext.depth === 0 || printContext.isConciseSyntax;

  if (printContext.preserveWhitespace) {
    if (isConciseSyntax) {
      if (/^\s+$/.test(text)) {
        if (!text.endsWith("\r\n") && !text.endsWith(printContext.eol)) {
          text += printContext.eol;
        }
      }
    }

    writer.write(text);
    return;
  }

  if (node.argument.type === "Literal") {
    if (!node.previousSibling) {
      text = text.replace(/^[\n\r]\s*/, "");
    }

    if (!node.nextSibling) {
      text = text.replace(/[\n\r]\s*$/, "");
    }

    text = text.replace(/(\s)\s*/g, "$1");

    if (text.trim().length === 0) {
      return;
    }
  }

  var lines = text.split(/\r\n|\n/);
  var currentIndentString = printContext.currentIndentString;

  if (printContext.forceHtml !== true && isConciseSyntax) {
    if (lines.length === 2 || lines.length === 3) {
      if (lines[0] === "") {
        lines = lines.slice(1);
        lines[0] = ` ${lines[0]}`;
      }
    }

    if (lines.length === 3) {
      if (lines[2] === "") {
        lines = lines.slice(0, -1);
        lines[lines.length - 1] += " ";
      }
    }

    if (lines.length > 1) {
      lines = indentLines(lines, printContext);
      writer.write(
        "---" +
          printContext.eol +
          currentIndentString +
          lines.join(printContext.eol).trim() +
          printContext.eol +
          currentIndentString +
          "---"
      );
    } else {
      const line = lines[0];

      if (/\s*</.test(line)) {
        writer.write(line);
      } else {
        writer.write("-- " + line);
      }
    }
  } else {
    lines = indentLines(lines, printContext);
    writer.write(lines.join(printContext.eol));
  }
};
