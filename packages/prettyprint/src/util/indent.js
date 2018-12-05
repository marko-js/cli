"use strict";
var rtrim = require("./trim").rtrim;

exports.indentCommentLines = function indentCommentLines(lines, printContext) {
  var currentIndentString = printContext.currentIndentString;
  let blockIndentation = null;

  var indentedLines = [];

  lines.forEach((line, i) => {
    if (line.trim() === "") {
      return;
    }

    if (blockIndentation == null) {
      blockIndentation = line.match(/^\s*/)[0];
      if (!blockIndentation) {
        blockIndentation = null;
      }
    }

    if (line.startsWith(blockIndentation)) {
      line = line.substring(blockIndentation.length);
      line = currentIndentString + rtrim(line);
    } else {
      line = currentIndentString + line.trim();
    }
    indentedLines.push(line);
  });

  return indentedLines;
};

exports.indentLines = function indentLines(lines, printContext) {
  var currentIndentString = printContext.currentIndentString;

  let blockIndentation = null;

  return lines.map((line, i) => {
    if (blockIndentation == null) {
      blockIndentation = line.match(/^\s*/)[0];
    }

    if (line.trim()) {
      if (line.startsWith(blockIndentation)) {
        line = line.substring(blockIndentation.length);

        line = rtrim(line);
      } else {
        line = line.trim();
      }

      if (i !== 0) {
        line = currentIndentString + line;
      }
    } else {
      line = "";
    }

    return line;
  });
};
