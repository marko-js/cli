const WHITE_SPACE_EXPRESSION_TYPES = [
  "LogicalExpression",
  "AssignmentExpression",
  "ConditionalExpression",
  "BinaryExpression",
  "NewExpression"
];

module.exports = function hasUnenclosedWhitespace(node) {
  return (
    node.value instanceof RegExp ||
    node.toString().indexOf(" ") !== -1 &&
    WHITE_SPACE_EXPRESSION_TYPES.indexOf(node.type) !== -1
  );
};