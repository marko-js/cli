"use strict";

exports.rtrim = function rtrim(s) {
  return s && s.replace(/\s+$/, "");
};

exports.ltrim = function ltrim(s) {
  return s && s.replace(/^\s+/, "");
};

exports.trimLinesStart = function trimLinesStart(lines) {
  var firstNonEmptyLine = -1;
  for (var i = 0; i < lines.length; i++) {
    if (lines[i].trim()) {
      firstNonEmptyLine = i;
      break;
    }
  }

  if (firstNonEmptyLine > 0) {
    lines = lines.slice(firstNonEmptyLine);
  }

  return lines;
};

exports.trimLinesEnd = function trimLinesEnd(lines) {
  var firstNonEmptyLine = -1;
  for (var i = lines.length - 1; i >= 0; i--) {
    if (lines[i].trim()) {
      firstNonEmptyLine = i;
      break;
    }
  }

  if (firstNonEmptyLine < lines.length - 1) {
    lines = lines.slice(0, firstNonEmptyLine + 1);
  }

  return lines;
};
