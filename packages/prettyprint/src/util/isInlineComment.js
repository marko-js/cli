"use strict";

module.exports = function isInlineComment(node, prev, next) {
  let prevText;
  let nextText;
  if (prev) {
    if (prev.type === "Text") {
      prevText = prev.argument.value;
      if (/\n$/.test(prevText)) {
        return false;
      }
    }
  }

  if (next) {
    if (next.type === "Text") {
      nextText = next.argument.value;
    }
  }

  if (prevText == null && nextText == null) {
    return false;
  }

  if (prevText != null && /\n$/.test(prevText)) {
    return false;
  }

  if (nextText != null && /^\n|\r\n/.test(nextText)) {
    return false;
  }

  return true;
};
