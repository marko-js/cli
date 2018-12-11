"use strict";
var rtrim = require("./trim").rtrim;
var ltrim = require("./trim").ltrim;

exports.indentCommentLines = function indentCommentLines(lines, printContext) {
  var currentIndentString = printContext.currentIndentString;
  let blockIndentation = null;

  var indentedLines = [];

  lines.forEach(line => {
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
    var firstLine = i === 0;
    var lastLine = i === lines.length - 1;

    if (blockIndentation == null && !firstLine) {
      blockIndentation = line.match(/^\s*/)[0];
    }

    if (line.trim()) {
      if (!firstLine) {
        if (line.startsWith(blockIndentation)) {
          line = line.substring(blockIndentation.length);
          line = lastLine ? line : rtrim(line);
        } else {
          line = lastLine ? ltrim(line) : line.trim();
        }

        line = currentIndentString + line;
      }
    } else {
      line = firstLine || lastLine ? " " : "";
    }

    return line;
  });
};
