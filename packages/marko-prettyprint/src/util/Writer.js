"use strict";
var trim = require("./trim");

class Writer {
  constructor(col) {
    this.col = col == null ? 0 : col;
    this.buffer = "";
  }

  write(str) {
    var lastLineMatches = /\n([^\n]*)$/.exec(str);
    if (lastLineMatches) {
      this.col = lastLineMatches[1].length;
    } else {
      this.col += str.length;
    }

    this.buffer += str;
  }

  rtrim() {
    var trimmed = trim.rtrim(this.buffer);
    this.buffer = "";
    this.write(trimmed);
  }

  getOutput() {
    return this.buffer;
  }
}

module.exports = Writer;
