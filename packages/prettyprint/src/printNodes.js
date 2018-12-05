"use strict";

var printers = require("./printers");
var Writer = require("./util/Writer");
var hasLineBreaks = require("./util/hasLineBreaks");
var isInlineComment = require("./util/isInlineComment");
var formattingTags = require("./formatting-tags");
var constants = require("./constants");

var SYNTAX_HTML = constants.SYNTAX_HTML;

const breakAfterTags = {
  class: true,
  static: true,
  style: true
};

function inspectNodes(nodes) {
  var allSimple = true;
  var hasSpaceAfterIndexes = {};
  var inlineCommentIndexes = {};
  var hasSpecialNode = false;
  var preserveWhitespace = false;

  for (let i = 0; i < nodes.length; i++) {
    let child = nodes[i];

    if (child.type === "Text") {
      var text = child.argument.value;
      if (!/\s+$/.test(text)) {
        hasSpaceAfterIndexes[i] = false;
      }

      if (i > 0 && !/^\s+/.test(text)) {
        hasSpaceAfterIndexes[i - 1] = false;
      }
    } else if (child.type === "HtmlElement") {
      if (!formattingTags[child.tagName]) {
        allSimple = false;
      }

      if (
        child.tagName === "marko-compiler-options" &&
        child.hasAttribute("preserve-whitespace")
      ) {
        preserveWhitespace = true;
      }
    } else if (child.type === "HtmlComment") {
      let prev = i > 0 ? nodes[i - 1] : undefined;
      let next = i < nodes.length - 1 ? nodes[i + 1] : undefined;

      if (isInlineComment(child, prev, next)) {
        inlineCommentIndexes[i] = true;
      }
    } else {
      hasSpecialNode = true;
    }
  }

  return {
    hasSpaceAfterIndexes,
    inlineCommentIndexes,
    allSimple,
    hasSpecialNode,
    preserveWhitespace
  };
}

module.exports = function printNodes(nodes, printContext, inputWriter) {
  var inspected = inspectNodes(nodes);
  var hasSpaceAfterIndexes = inspected.hasSpaceAfterIndexes;
  var allSimple = inspected.allSimple;
  var inlineCommentIndexes = inspected.inlineCommentIndexes;

  if (inspected.preserveWhitespace) {
    printContext = printContext.create({
      preserveWhitespace: true,
      syntax: SYNTAX_HTML
    });
  }

  // console.log('------');
  // console.log('nodes: ' + JSON.stringify(nodes, null, 2));
  // console.log('inspected', JSON.stringify(inspected, null, 4));
  // console.log('----');

  var writer = inputWriter;
  var wrapHtmlBlock = false;
  var avoidLineBreaks =
    allSimple ||
    Object.keys(hasSpaceAfterIndexes).length ||
    Object.keys(inlineCommentIndexes).length;

  if (inspected.hasSpecialNode) {
    avoidLineBreaks = false;
  }

  if (printContext.depth === 0) {
    avoidLineBreaks = false;
  }

  if (printContext.preserveWhitespace === true) {
    avoidLineBreaks = false;
  }

  if (avoidLineBreaks) {
    if (printContext.isConciseSyntax) {
      wrapHtmlBlock = true;
      writer = new Writer(writer.col);
      printContext = printContext.create({
        forceHtml: true,
        syntax: SYNTAX_HTML
      });
    } else {
      printContext = printContext.create({ forceHtml: true });
    }
  }

  let prevChild;
  let firstChild;
  let prevElement;

  nodes.forEach((child, i) => {
    var childWriter = new Writer(writer.col);

    if (
      printContext.preserveWhitespace !== true &&
      printContext.depth === 0 &&
      prevChild
    ) {
      // Insert line break after a group of imports
      if (child.tagName !== "import" && prevChild.tagName === "import") {
        writer.write(printContext.eol);
      }

      // Insert line break between certain top-level tags
      if (breakAfterTags[prevChild.tagName]) {
        writer.write(printContext.eol);
      }
    }

    printers.printNode(child, printContext, childWriter);

    var childOutput = childWriter.getOutput();
    if (childOutput.length) {
      firstChild = child;

      if (
        printContext.isHtmlSyntax &&
        printContext.preserveWhitespace === true
      ) {
        // Short circuit if we are preserving whitespace
        writer.write(childOutput);
        return;
      }

      if (writer.getOutput().endsWith(printContext.eol)) {
        writer.write(printContext.currentIndentString);
      }

      writer.write(childOutput.trim());

      if (avoidLineBreaks) {
        if (
          child.type === "Text" ||
          child.type === "HtmlElement" ||
          child.type === "HtmlComment"
        ) {
          if (hasSpaceAfterIndexes[i] !== false) {
            if (inlineCommentIndexes[i + 1]) {
              writer.write(" ");
            } else if (inlineCommentIndexes[i]) {
              writer.write(" ");
            } else if (allSimple) {
              writer.write(" ");
            } else {
              writer.write(printContext.eol);
            }
          }
        } else {
          writer.write(printContext.eol);
        }
      } else {
        writer.write(printContext.eol);
      }
    }
    prevChild = child;
    if (child.type === "HtmlElement") {
      prevElement = child;
    } else if (child.type != "Text") {
      prevElement = null;
    }
  });

  if (printContext.isHtmlSyntax && printContext.preserveWhitespace !== true) {
    writer.rtrim();

    writer.write(printContext.eol);

    if (wrapHtmlBlock) {
      var wrappedOutput = writer.getOutput().trim();

      if (hasLineBreaks(wrappedOutput)) {
        if (
          !inputWriter
            .getOutput()
            .endsWith(printContext.eol + printContext.currentIndentString)
        ) {
          if (!inputWriter.getOutput().endsWith(printContext.eol)) {
            inputWriter.write(printContext.eol);
          }

          inputWriter.write(printContext.currentIndentString);
        }

        inputWriter.write("---" + printContext.eol);
        inputWriter.write(printContext.currentIndentString);
        inputWriter.write(wrappedOutput);

        if (
          !inputWriter
            .getOutput()
            .endsWith(printContext.eol + printContext.currentIndentString)
        ) {
          inputWriter.write(
            printContext.eol + printContext.currentIndentString
          );
        }

        inputWriter.write("---" + printContext.eol);
      } else {
        inputWriter.write(printContext.currentIndentString);
        if (wrappedOutput.startsWith("<!--")) {
          inputWriter.write(wrappedOutput);
        } else {
          inputWriter.write("-- " + wrappedOutput);
        }
      }
    }

    if (!inputWriter.getOutput().endsWith(printContext.eol)) {
      inputWriter.write(printContext.eol);
    }
  }
};
