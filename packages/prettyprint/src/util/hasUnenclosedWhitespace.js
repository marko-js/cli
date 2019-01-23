const getUnenclosedAsString = require("./getUnenclosedAsString");

module.exports = function hasUnenclosedWhitespace(codeString) {
  return /\s/.test(getUnenclosedAsString(codeString));
};
