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

  const _writeLiteral = writer.writeLiteral;
  writer.writeLiteral = function(value) {
    if (typeof value === "string") {
      this.write(
        JSON.stringify(value).replace(/\$!?{/g, m => "__%ESCAPE%__" + m)
      );
    } else {
      _writeLiteral.apply(this, arguments);
    }
  };
  writer.write(node);
  writer.writeLiteral = _writeLiteral;

  const formatted = formatJS(
    writer.getCode(),
    printContext,
    indent,
    expression
  );

  return formatted.replace(/__%ESCAPE%__/g, "\\");
};
