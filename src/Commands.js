'use strict';

class Commands {
    constructor() {
        this.commands = {};
        this.addBuiltinCommands();
    }

    addBuiltinCommands() {
        var commandNames = [
            'test',
            'create'
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


module.exports = Commands;