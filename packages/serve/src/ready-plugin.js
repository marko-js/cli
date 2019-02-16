const EventEmitter = require("events").EventEmitter;

class ReadyPlugin extends EventEmitter {
  constructor() {
    super();
    this.compilations = 0;
  }
  apply(compiler) {
    compiler.hooks.compile.tap("readyCompilationStart", () => {
      this.compilations++;
    });
    compiler.hooks.done.tap("readyCompilationFinish", () => {
      if (!--this.compilations) {
        this.emit("ready");
      }
    });
  }
  get ready() {
    return this.compilations === 0;
  }
}

module.exports = ReadyPlugin;
