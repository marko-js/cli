"use strict";

var trimLinesStart = require("./util/trim").trimLinesStart;
var trimLinesEnd = require("./util/trim").trimLinesEnd;
var indentLines = require("./util/indent").indentLines;
var getTextValue = require("./util/getTextValue");
module.exports = function printText(node, printContext, writer) {
  var text = getTextValue(node, printContext);

  var isConciseSyntax =
    printContext.depth === 0 || printContext.isConciseSyntax;

  if (printContext.preserveWhitespace === true) {
    if (isConciseSyntax) {
      if (/^\s+$/.test(text)) {
        if (!text.endsWith("\r\n") && !text.endsWith(printContext.eol)) {
          text += printContext.eol;
        }
        writer.write(text);
        return;
      }
    } else {
      writer.write(text);
      return;
    }
  }

  var lines = text.split(/\r\n|\n/);

  if (lines.length > 1) {
    lines = trimLinesStart(lines);
    lines = trimLinesEnd(lines);
  }

  if (lines.length === 0) {
    return;
  }

  var currentIndentString = printContext.currentIndentString;

  if (printContext.forceHtml !== true && isConciseSyntax) {
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
      let trimmed = lines[0].trimLeft();

      if (trimmed.startsWith("<")) {
        writer.write(trimmed);
      } else if (trimmed === "") {
        writer.write(
          "--" +
            printContext.eol +
            currentIndentString +
            lines[0] +
            printContext.eol +
            currentIndentString +
            "--"
        );
      } else {
        if (lines[0].match(/^\s+/) != null) trimmed = " " + trimmed;
        writer.write("-- " + trimmed);
      }
    }
  } else {
    lines = indentLines(lines, printContext);
    writer.write(lines.join(printContext.eol));
  }
};
