const formatJS = require("./formatJS");

module.exports = (node, printContext, indent, expression) => {
  if (!node) {
    return node;
  }

  if (typeof node === "string") {
    return node;
  }

  const builder = printContext.markoCompiler.builder;
  const CodeWriter = printContext.CodeWriter;

  const writer = new CodeWriter({}, builder);

  writer.write(node);
  return formatJS(writer.getCode(), printContext, indent, expression);
};
