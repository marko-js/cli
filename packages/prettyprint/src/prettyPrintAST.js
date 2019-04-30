"use strict";
var path = require("path");
var Writer = require("./util/Writer");
var PrintContext = require("./PrintContext");
var printers = require("./printers");
var readConfigFile = require("./util/readConfigFile");
var requireMarkoFile = require("./util/requireMarkoFile");

const formatJS = require("./util/formatJS");
const formatArgument = require("./util/formatArgument");
const formatParams = require("./util/formatParams");
const formatStyles = require("./util/formatStyles");

const redent = require("redent");
const hasUnenclosedNewlines = require("./util/hasUnenclosedNewlines");
const hasUnenclosedWhitespace = require("./util/hasUnenclosedWhitespace");
const hasLineBreaks = require("./util/hasLineBreaks");

const printScriptlet = require("./printScriptlet");
const printHtmlComment = require("./printHtmlComment");
const printDeclaration = require("./printDeclaration");

var SYNTAX_CONCISE = require("./constants").SYNTAX_CONCISE;
var SYNTAX_HTML = require("./constants").SYNTAX_HTML;
var SYNTAX_DETECT = require("./constants").SYNTAX_DETECT;

module.exports = function prettyPrintAST(ast, options) {
  if (options) {
    options = Object.assign({}, options);
  } else {
    options = {};
  }

  var filename = options.filename;

  if (options.configFiles !== false) {
    if (filename) {
      var configFileOptions = readConfigFile(filename);
      if (configFileOptions) {
        options = Object.assign({}, options, configFileOptions);
      }
    }
  }

  if (options.syntax) {
    options.syntax =
      options.syntax === "concise"
        ? SYNTAX_CONCISE
        : options.syntax === "html"
        ? SYNTAX_HTML
        : SYNTAX_DETECT;
  } else {
    options.syntax = SYNTAX_DETECT;
  }

  // TODO: delete this line
  // we force html for now, still need to make concise work properly
  if (options.syntax === SYNTAX_DETECT) {
    options.syntax = SYNTAX_HTML;
  }

  if (options.context) {
    options.taglibLookup = options.context.taglibLookup;
  }

  var dirname = path.dirname(filename);
  options.dirname = dirname;

  var markoCompiler =
    options.markoCompiler || requireMarkoFile(dirname, "compiler");
  options.markoCompiler = markoCompiler;
  options.CodeWriter =
    options.CodeWriter || requireMarkoFile(dirname, "compiler/CodeWriter");

  var printContext = new PrintContext(options);
  var writer = new Writer(0 /* col */);

  printTopLevelNodes(ast.body.items, options, printContext, writer);
  return writer.getOutput();
};

const codeTags = {
  import: {
    type: "js",
    prettyprint: false
  },
  static: {
    type: "js",
    prettyprint: true
  },
  class: {
    type: "js",
    prettyprint: true
  },
  style: {
    type: "style",
    prettyprint: true
  }
};

function printTopLevelNodes(nodes, options, printContext, writer) {
  if (printContext.isDetectSyntax && options.src) {
    // default to SYNTAX_HTML
    printContext.syntax = SYNTAX_HTML;
    nodes.some(node => {
      // find top-level non-special (import/class/style) tags
      // if any are concise, use SYNTAX_CONCISE instead
      if (isConciseTag(node, options.src) && !codeTags[node.tagName]) {
        printContext.syntax = SYNTAX_CONCISE;
      }
    });
  }

  const codeTags = printCodeTags(nodes, printContext, writer);

  if (codeTags.size) {
    nodes = nodes.filter(n => !codeTags.has(n));
    if (nodes.filter(n => !isWhitespaceText(n)).length) {
      writer.write(printContext.eol);
    }
  }

  if (
    nodes.some(
      n =>
        n.tagName === "marko-compiler-options" &&
        n.hasAttribute("preserve-whitespace")
    )
  ) {
    printContext = printContext.startPreservingWhitespace();
  }

  if (printContext.isHtmlSyntax) {
    let dashes = getDashes(nodes);
    if (dashes) {
      writer.write(dashes + printContext.eol);
      printHTMLNodes(nodes, printContext, writer);
      if (!isBeginningOfLine(writer, printContext)) {
        writer.write(printContext.eol);
      }
      writer.write(dashes);
    } else {
      printHTMLNodes(nodes, printContext, writer);
    }
  } else {
    printConciseNodes(nodes, printContext, writer);
  }
}

function printCodeTags(nodes, printContext, writer) {
  const tagsInOrder = Object.keys(codeTags);
  const printed = new Set();
  let prevNode;

  nodes
    .filter(n => codeTags[n.tagName])
    .concat()
    .sort((a, b) => {
      const aIndex = tagsInOrder.indexOf(a);
      const bIndex = tagsInOrder.indexOf(b);
      const aOrigIndex = nodes.indexOf(a);
      const bOrigIndex = nodes.indexOf(b);
      return aIndex < bIndex
        ? -1
        : aIndex > bIndex
        ? 1
        : aOrigIndex < bOrigIndex
        ? -1
        : 1;
    })
    .forEach(node => {
      if (prevNode && prevNode.tagName !== node.tagName) {
        // blank line between tag groups
        writer.write(printContext.eol);
      }
      if (printCodeTag(node, printContext, writer)) {
        writer.write(printContext.eol);
        printed.add(node);
        prevNode = node;
      }
    });

  return printed;
}

function printCodeTag(node, printContext, writer) {
  var tagName = node.tagName;

  let codeTagInfo = codeTags[tagName];

  if (!codeTagInfo) {
    return false;
  }

  if (tagName === "style" && !isComponentStyleTag(node)) {
    return false;
  }

  let outputCode = node.tagString;

  if (codeTagInfo.prettyprint === true) {
    if (codeTagInfo.type === "js") {
      if (tagName === "static") {
        outputCode = outputCode.replace(/^\s*static\s*/, "");
      }
      outputCode = formatJS(outputCode, printContext);

      if (tagName === "static") {
        // TODO: unenclosed whitespace?
        outputCode = "static " + outputCode;
      }
    } else if (codeTagInfo.type === "style") {
      outputCode = formatStyles(outputCode, printContext);
    }
  }

  writer.write(outputCode);

  return true;
}

function printHTMLNodes(nodes, printContext, writer) {
  const significantNodes = printContext.preserveWhitespace
    ? nodes
    : nodes.filter(n => !isInsignificantWhitespaceText(n));

  const results = significantNodes.map((node, index) => {
    let output;
    const prevNode = significantNodes[index - 1];
    const nextNode = significantNodes[index + 1];

    if (isTag(node)) {
      const singleLinePls = hasWhitespaceEitherSide(prevNode, nextNode);
      output = getOutput(
        printHTMLTag,
        node,
        printContext,
        writer,
        singleLinePls
      );
    } else if (node.type === "Text") {
      output = getOutput(printHTMLText, node, printContext, writer, {
        first: index == 0,
        last: index === significantNodes.length - 1
      });
    } else if (node.type === "DocumentType") {
      output = getOutput(printDocumentType, node, printContext, writer);
    } else if (node.type === "HtmlComment") {
      output = getOutput(printHtmlComment, node, printContext, writer);
    } else if (node.type === "Declaration") {
      output = getOutput(printDeclaration, node, printContext, writer);
    } else if (node.type === "Scriptlet") {
      output = getOutput(printScriptlet, node, printContext, writer);
    } else {
      throw new Error("Unsupported node type: " + node.type);
    }

    return { node, output };
  });

  if (printContext.preserveWhitespace === true) {
    results.forEach(({ output }) => writer.write(output));
    return;
  }

  results.forEach(({ node, output }, index) => {
    let breakAfter = false;
    let isNewLine = writer.endsWith(printContext.newline);

    const { node: prevNode, output: prevOutput } = results[index - 1] || {};
    const { node: nextNode, output: nextOutput } = results[index + 1] || {};

    if (node.type === "Text") {
      if (
        output.endsWith(" ") &&
        nextNode &&
        nextNode.type !== "Text" &&
        hasLineBreaks(nextOutput)
      ) {
        if (output === " ") {
          output = '${" "}';
        } else {
          output = output.replace(/\s+$/, "");
        }
        breakAfter = true;
      }
      if (
        output.startsWith(" ") &&
        prevNode &&
        prevNode.type !== "Text" &&
        (hasLineBreaks(prevOutput) || isNewLine)
      ) {
        if (output === " ") {
          writer.write('${" "}');
        }
        output = output.replace(/^\s+/, "");
        if (!isNewLine) {
          writer.write(printContext.newline);
        }
      }
      if (output === " " && (index === 0 || index === results.length - 1)) {
        output = '${" "}';
      }
    } else if (!isNewLine && prevNode && prevNode.type !== "Text") {
      writer.write(printContext.newline);
    }

    if (
      node.type === "DocumentType" ||
      node.type === "Declaration" ||
      node.type === "Scriptlet"
    ) {
      breakAfter = true;
    }

    if (node.type === "Text" && output[0] !== "$") {
      output.split(" ").forEach((word, i) => {
        if (writer.col + word.length < printContext.maxLen) {
          if (i > 0 && !writer.endsWith(" ")) {
            writer.write(" ");
          }
          writer.write(word);
        } else {
          // TODO: check if moving to next line actually helps
          writer.write(printContext.newline + word);
        }
      });
    } else {
      // TODO: check if fits current line and if moving to next line would help
      writer.write(output);
    }

    if (breakAfter && nextOutput) {
      writer.write(printContext.newline);
    }
  });
}

function printHTMLText(node, printContext, writer, { first, last }) {
  if (
    node.argument.type === "Literal" &&
    (!node.preserveWhitespace || node.argument.value === " ")
  ) {
    let value = node.argument.value || "";

    const tagDefBody = node.parentNode.tagDef && node.parentNode.tagDef.body;
    const attrBody = (attr => attr && attr.value)(
      node.parentNode.getAttributeValue &&
        node.parentNode.getAttributeValue("marko-body")
    );
    const activeBody = attrBody || tagDefBody;

    if (activeBody !== "static-text" && node.parentNode.tagName !== "script") {
      value = value.replace(/\\|\$!?{/g, m => "\\" + m);
    }

    if (printContext.preserveWhitespace) {
      writer.write(value);
      return;
    }

    if (first) {
      value = value.replace(/^\n\s*/, "");
    }

    if (last) {
      value = value.replace(/\n\s*$/, "");
    }

    value = value.replace(/(\n|\s)+/g, " ");

    writer.write(value);
  } else {
    writer.write(
      `$${node.escape ? "" : "!"}{${formatJS(
        node.argument,
        printContext,
        true
      )}}`
    );
  }
}

// eslint-disable-next-line no-unused-vars
function printHTMLTag(node, printContext, writer, singleLinePls) {
  if (node.hasAttribute("marko-preserve-whitespace")) {
    printContext = printContext.startPreservingWhitespace();
  } else if (node.tagDef && node.tagDef.preserveWhitespace === true) {
    printContext = printContext.startPreservingWhitespace();
  }

  var tagNameExpression = node.rawTagNameExpression;
  var tagNameString = tagNameExpression
    ? `\${${formatJS(tagNameExpression, printContext, true)}}`
    : node.tagName;
  var endTagString = tagNameExpression ? "</>" : `</${node.tagName}>`;

  writer.write("<" + tagNameString);

  if (typeof node.rawShorthandId === "string") {
    writer.write("#" + node.rawShorthandId);
  } else if (node.rawShorthandId) {
    writer.write(
      "#${" + formatJS(node.rawShorthandId, printContext, true) + "}"
    );
  }

  if (node.rawShorthandClassNames) {
    node.rawShorthandClassNames.forEach(className => {
      if (typeof className === "string") {
        writer.write("." + className);
      } else {
        writer.write(".${" + formatJS(className, printContext, true) + "}");
      }
    });
  }

  if (node.argument != null) {
    writer.write(formatArgument(node, printContext));
  }

  if (node.params != null) {
    writer.write(formatParams(node, printContext));
  }

  const attributes = getOutput(printAttributes, node, printContext, writer);
  writer.write(attributes);

  const children = node.body.items;
  const isTextOnly = children.every(n => n.type === "Text");
  const isInSignificantTextOnly =
    isTextOnly && children.every(n => isInsignificantWhitespaceText(n));

  if (isInSignificantTextOnly) {
    writer.write("/>");
    return;
  } else {
    writer.write(">");
  }

  // TODO: Consider printing on a single line if there is only one child
  // const isSingleChild = children.filter(n => !isInsignificantWhitespaceText(n)).length === 1;

  const bodyContent = getOutput(
    printHTMLNodes,
    children,
    printContext.beginNested(),
    writer
  ).replace(/\${" "}/g, " ");
  const fitsOnLine =
    !hasLineBreaks(attributes) &&
    !hasLineBreaks(bodyContent) &&
    writer.col + bodyContent.length + endTagString.length < printContext.maxLen;

  if (printContext.preserveWhitespace || (fitsOnLine && isTextOnly)) {
    writer.write(bodyContent + endTagString);
  } else {
    writer.write(printContext.newline);
    writer.write(printContext.indentString);

    // reprint the body content now that we've moved to a new line
    // the previous printed content might be squished more than necessary
    // we also trim the content as we are putting newline whitespace around it
    const bodyContent = getOutput(
      printHTMLNodes,
      children,
      printContext.beginNested(),
      writer
    ).trim();

    writer.write(bodyContent);
    writer.write(printContext.newline);
    writer.write(endTagString);
  }
}

function printAttributes(node, printContext, writer) {
  var attrs = node.getAttributes();

  if (!attrs.length) {
    // nothing to print
    return;
  }

  // We will make one pass to generate all of the strings for each attribute. We will then
  // append them to the output while avoiding putting too many attributes on one line.
  var isSingleAttr = attrs.length <= 1;
  var attrPrintContext = isSingleAttr
    ? printContext
    : printContext.beginNested();
  var attrStringsArray = attrs.map(attr => {
    var attrStr = "";
    var attrValueStr = formatJS(attr.value, attrPrintContext, true);

    if (attrValueStr) {
      if (hasUnenclosedNewlines(attrValueStr)) {
        attrValueStr = `\n${redent(
          attrPrintContext.currentIndentString + attrValueStr,
          attrPrintContext.depth + 1,
          attrPrintContext.indentString
        )}\n${attrPrintContext.currentIndentString}`;
      }

      if (hasUnenclosedWhitespace(attrValueStr)) {
        attrValueStr = `(${attrValueStr})`;
      }
    }

    if (attr.name) {
      attrStr += attr.name;
      if (attrValueStr) {
        attrStr += `=${attrValueStr}`;
      } else if (attr.argument != null) {
        attrStr += formatArgument(attr, attrPrintContext);
      }
    } else if (attr.spread) {
      attrStr += `...${attrValueStr}`;
    } else {
      attrStr += `\${${attrValueStr}}`;
    }

    return attrStr;
  });

  // Let's see if all of the attributes will fit on the same line
  var oneLineAttrsStr = attrStringsArray.join(" ");
  var attrsFitOneLine =
    isSingleAttr ||
    (writer.col + oneLineAttrsStr.length < printContext.maxLen &&
      !hasLineBreaks(oneLineAttrsStr));

  if (attrsFitOneLine) {
    writer.write(` ${oneLineAttrsStr}`);
  } else {
    writer.write(
      attrStringsArray
        .map(attrStr => `\n${attrPrintContext.currentIndentString + attrStr}`)
        .join("")
    );
  }
}

function printDocumentType(node, printContext, writer) {
  var doctype = node.documentType.value;

  if (printContext.preserveWhitespace !== true) {
    doctype = doctype.trim();
  }

  writer.write("<!" + doctype + ">");
}

// eslint-disable-next-line no-unused-vars
function printConciseNodes(nodes, printContext, writer) {
  printers.printNodes(nodes, printContext, writer);
}

function isComponentStyleTag(node) {
  var attrs = node.getAttributes();
  var attrCount = attrs.length;
  if (!attrCount) {
    return false;
  }

  var lastAttr = attrs[attrCount - 1];
  return /\s*\{/.test(lastAttr.name);
}

function hasWhitespaceEitherSide(prevNode, nextNode) {
  const prevEndsWithWhitespace =
    prevNode &&
    prevNode.type === "Text" &&
    prevNode.argument.type === "Literal" &&
    prevNode.argument.value
      .replace(/\n\s*/g, "")
      .replace(/(\s|\n)+/g, " ")
      .endsWith(" ");
  const nextStartsWithWhitespace =
    nextNode &&
    nextNode.type === "Text" &&
    nextNode.argument.type === "Literal" &&
    nextNode.argument.value
      .replace(/\n\s*/g, "")
      .replace(/(\s|\n)+/g, " ")
      .startsWith(" ");
  return prevEndsWithWhitespace || nextStartsWithWhitespace;
}

function isConciseTag(node, src) {
  return (
    (node.type === "HtmlElement" || node.type === "CustomTag") &&
    src[node.pos] !== "<"
  );
}

function isWhitespaceText(node) {
  return (
    node.type === "Text" &&
    node.argument.type === "Literal" &&
    !/\S/.test(node.argument.value)
  );
}

function isInsignificantWhitespaceText(node) {
  return (
    isWhitespaceText(node) && !node.argument.value.replace(/\n\s*/g, "").length
  );
}

function isBeginningOfLine(writer, printContext) {
  return writer.getOutput().endsWith(printContext.eol);
}

function isTag(node) {
  return node.type === "HtmlElement" || node.type === "CustomTag";
}

function getOutput(printer, nodeOrNodes, printContext, writer, ...others) {
  const childWriter = new Writer(writer.col);
  printer(nodeOrNodes, printContext, childWriter, ...others);
  return childWriter.getOutput();
}

function getDashes(nodes) {
  let longestDashSequence = 1.5;
  let hasTopLevelNonWhitespaceText;
  nodes.forEach(node => {
    if (node.type === "Text" && !isWhitespaceText(node)) {
      hasTopLevelNonWhitespaceText = true;
      if (node.argument.type === "Literal") {
        let match;
        const pattern = /-+/g;
        while ((match = pattern.exec(node.argument.value))) {
          if (match[0].length > longestDashSequence) {
            longestDashSequence = match[0].length;
          }
        }
      }
    }
  });
  return hasTopLevelNonWhitespaceText
    ? "-".repeat(longestDashSequence * 2)
    : "";
}
