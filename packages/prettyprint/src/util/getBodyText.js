"use strict";

var getTextValue = require("./getTextValue");

module.exports = function getBodyText(el, printContext) {
  var children = el.body.items;
  var text = "";
  for (var i = 0; i < children.length; i++) {
    let child = children[i];
    if (child.type !== "Text") {
      return null;
    }
    text += getTextValue(child, printContext);
  }
  return text;
};
