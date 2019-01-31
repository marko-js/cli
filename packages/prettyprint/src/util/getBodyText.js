"use strict";

const getTextValue = require("./getTextValue");

module.exports = function getBodyText(el, printContext) {
  const children = el.body.items;
  const shouldTrim = !printContext.preserveWhitespace;
  const len = children.length;
  let text = "";

  for (let i = 0; i < len; i++) {
    const child = children[i];
    if (child.type !== "Text") {
      return null;
    }

    let childText = getTextValue(child, printContext);

    if (shouldTrim) {
      if (i === 0) {
        childText = childText.replace(/^[\n\r]\s*/, "");
      }

      if (i === len) {
        childText = childText.replace(/[\n\r]\s*$/, "");
      }
    }

    text += childText;
  }

  if (shouldTrim) {
    text = text.replace(/(\s)\s*/g, "$1");
  }

  return text;
};
