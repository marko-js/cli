"use strict";

const redent = require("redent");
const hasUnenclosedNewlines = require("./util/hasUnenclosedNewlines");
const hasUnenclosedWhitespace = require("./util/hasUnenclosedWhitespace");
const getBodyText = require("./util/getBodyText");
const hasLineBreaks = require("./util/hasLineBreaks");
const printers = require("./printers");
const Writer = require("./util/Writer");
const formattingTags = require("./formatting-tags");

const formatJS = require("./util/formatJS");
const formatArgument = require("./util/formatArgument");
const formatParams = require("./util/formatParams");
const formatStyles = require("./util/formatStyles");

const codeTags = {
  class: {
    type: "js",
    prettyprint: true
  },
  import: {
    type: "js",
    prettyprint: false
  },
  static: {
    type: "js",
    prettyprint: true
  },
  style: {
    type: "style",
    prettyprint: true
  }
};

function isComponentStyleTag(node) {
  var attrs = node.getAttributes();
  var attrCount = attrs.length;
  if (!attrCount) {
    return false;
  }

  var lastAttr = attrs[attrCount - 1];
  return /\s*\{/.test(lastAttr.name);
}

function handleCodeTag(node, printContext, writer) {
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
        outputCode = "static " + outputCode;
      }
    } else if (codeTagInfo.type === "style") {
      outputCode = formatStyles(outputCode, printContext);
    }
  }

  writer.write(outputCode);

  return true;
}

module.exports = function printHtmlElement(node, printContext, writer) {
  if (node.hasAttribute("marko-preserve-whitespace")) {
    printContext = printContext.startPreservingWhitespace();
  } else if (node.tagDef && node.tagDef.preserveWhitespace === true) {
    printContext = printContext.startPreservingWhitespace();
  }

  if (printContext.depth === 0 && handleCodeTag(node, printContext, writer)) {
    return;
  }

  var tagNameExpression = node.rawTagNameExpression;
  var preserveBodyWhitespace = printContext.preserveWhitespace === true;
  var maxLen = printContext.maxLen;

  if (preserveBodyWhitespace || tagNameExpression) {
    // We can only reliably preserve whitespace in HTML mode so we force the HTML
    // syntax if we detect that whitespace preserval is enabled
    printContext = printContext.switchToHtmlSyntax();
  }

  if (!printContext.isConciseSyntax) {
    writer.write("<");
  }

  var tagNameString = tagNameExpression
    ? `\${${formatJS(tagNameExpression, printContext, true)}}`
    : node.tagName;
  var endTagString = tagNameExpression ? "</>" : "</" + node.tagName + ">";

  writer.write(tagNameString);

  if (node.rawShorthandId) {
    writer.write("#" + node.rawShorthandId);
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

  var attrs = node.getAttributes();
  var hasBody = node.body && node.body.length;
  let bodyText = getBodyText(node, printContext);

  if (
    bodyText &&
    printContext.preserveWhitespace !== true &&
    printContext.isConciseSyntax
  ) {
    bodyText = bodyText.trim();
  }

  if (bodyText != null && bodyText.length === 0) {
    bodyText = null;
    hasBody = false;
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
    (writer.col + oneLineAttrsStr.length < maxLen &&
      !/[\r\n]/.test(oneLineAttrsStr));

  if (attrStringsArray.length) {
    if (attrsFitOneLine) {
      writer.write(` ${oneLineAttrsStr}`);
    } else {
      if (printContext.isConciseSyntax) {
        writer.write(" [");
      }

      writer.write(
        attrStringsArray
          .map(attrStr => `\n${attrPrintContext.currentIndentString + attrStr}`)
          .join("")
      );

      if (printContext.isConciseSyntax) {
        writer.write(`\n${printContext.currentIndentString}]`);
      }
    }
  }

  if (printContext.isHtmlSyntax) {
    writer.write(hasBody ? ">" : "/>");
  }

  if (!hasBody) {
    return;
  }

  var endTag = printContext.isHtmlSyntax ? endTagString : "";

  if (
    (printContext.isConciseSyntax || attrsFitOneLine) &&
    bodyText &&
    !hasLineBreaks(bodyText)
  ) {
    let endCol = writer.col + bodyText.length + endTag.length;

    if (endCol < maxLen) {
      if (printContext.isConciseSyntax) {
        writer.write(" -- " + bodyText);
      } else {
        writer.write(bodyText + endTagString);
      }
      return;
    }
  }

  if (!preserveBodyWhitespace) {
    writer.write(printContext.eol);
  }

  var nestedPrintContext = printContext.beginNested();

  if (printContext.isHtmlSyntax && formattingTags[node.tagName]) {
    let nestedWriter = new Writer(writer.col);
    printers.printNodes(node.body.items, nestedPrintContext, nestedWriter);
    let trimmedOutput = nestedWriter.getOutput();
    if (preserveBodyWhitespace !== true) {
      trimmedOutput = nestedWriter
        .getOutput()
        .replace(/^[\n\r]\s*|[\n\r]\s*$/, "");
    }

    if (hasLineBreaks(trimmedOutput)) {
      if (
        writer
          .getOutput()
          .endsWith(printContext.eol + printContext.indentString) === false
      ) {
        writer.write(printContext.indentString);
      }

      writer.write(nestedWriter.getOutput());
      writer.write(printContext.currentIndentString);
      writer.write(endTag);
    } else {
      if (preserveBodyWhitespace !== true) {
        writer.rtrim();
      }

      writer.write(trimmedOutput);
      writer.write(endTag);
    }
  } else {
    printers.printNodes(node.body.items, nestedPrintContext, writer);

    if (printContext.isHtmlSyntax) {
      if (!preserveBodyWhitespace) {
        writer.write(printContext.currentIndentString);
      }

      writer.write(endTag);
    }
  }
};
