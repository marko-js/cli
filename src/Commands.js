"use strict";

class Commands {
<<<<<<< HEAD
  constructor() {
    this.commands = {};
    this.addBuiltinCommands();
  }

  addBuiltinCommands() {
    var commandNames = ["compile", "create", "test"];

    commandNames.forEach(commandName => {
      function run() {
        var runFunc = require(`./commands/${commandName}/run`);
        return runFunc.apply(null, arguments);
      }
      function parse() {
        var parseFunc = require(`./commands/${commandName}/parse`);
        return parseFunc.apply(null, arguments);
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

=======
    constructor() {
        this.commands = {};
        this.addBuiltinCommands();
    }

    addBuiltinCommands() {
        var commandNames = [
            'test',
            'create',
            'compile',
            'prebuild'
        ];

        commandNames.forEach((commandName) => {
            var run = require(`./commands/${commandName}/run`);
            var parse = require(`./commands/${commandName}/parse`);
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


>>>>>>> 87368b8... Initial work to support prebuild.
module.exports = Commands;
