const getUnenclosedAsString = require("./getUnenclosedAsString");

module.exports = function hasUnenclosedNewlines(codeString) {
  return /\n|\r/.test(getUnenclosedAsString(codeString));
};
