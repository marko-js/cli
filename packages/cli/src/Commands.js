"use strict";

class Commands {
  constructor() {
    this.commands = {};
    this.addBuiltinCommands();
  }

  addBuiltinCommands() {
    var commandNames = ["compile", "create", "test"];

    commandNames.forEach(commandName => {
      function run() {
        var cli = require(`@marko/${commandName}/dist/cli`);
        return cli.run.apply(null, arguments);
      }
      function parse() {
        var cli = require(`@marko/${commandName}/dist/cli`);
        return cli.parse.apply(null, arguments);
      }
      this.add(commandName, {
        run,
        parse
      });
    });
  }

  add(commandName, command) {
    this.commands[commandName] = command;
  }

  get(commandName) {
    return this.commands[commandName];
  }

  has(commandName) {
    return this.commands[commandName] != null;
  }

  getNames() {
    return Object.keys(this.commands);
  }
}

module.exports = Commands;
