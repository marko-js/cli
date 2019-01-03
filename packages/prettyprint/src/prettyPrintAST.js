"use strict";
var path = require("path");
var Writer = require("./util/Writer");
var PrintContext = require("./PrintContext");
var printers = require("./printers");
var readConfigFile = require("./util/readConfigFile");
var requireMarkoFile = require("./util/requireMarkoFile");

var SYNTAX_CONCISE = require("./constants").SYNTAX_CONCISE;
var SYNTAX_HTML = require("./constants").SYNTAX_HTML;

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
      options.syntax === "concise" ? SYNTAX_CONCISE : SYNTAX_HTML;
  } else {
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

  printers.printNodes(ast.body.items, printContext, writer);
  return writer.getOutput();
};
