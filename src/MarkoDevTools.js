'use strict';

var EventEmitter = require('events').EventEmitter;
var lassoPackageRoot = require('lasso-package-root');
var path = require('path');
var Commands = require('./Commands');

class MarkoDevTools extends EventEmitter {
    constructor(cwd) {
        super();
        this.cwd = cwd || process.cwd();
        this.__dirname = __dirname;
        this._rootPackage = lassoPackageRoot.getRootPackage(this.cwd);
        this._commands = undefined;
        this.config = {
            workDir: path.join(this.packageRoot, '.marko-devtools')
        };

        this._loadPackagePlugin();
    }

    get packageRoot() {
        return this._rootPackage ? this._rootPackage.__dirname : this.cwd;
    }

    configure(config) {
        Object.assign(this.config, config);
    }

    get commands() {
        var commands = this._commands;
        if (!commands) {
            // Lazy load commands since that might take a little longer
            commands = this._commands = new Commands();
        }
        return commands;
    }

    hasCommand(commandName) {
        return this.commands.has(commandName);
    }

    runCommand(commandName, args) {
        var command = this.commands.get(commandName);
        if (!command) {
            throw new Error('Command not found: ' + commandName);
        }
        var options = command.parse(args);
        return command.run(options, this);
    }

    _loadPackagePlugin() {
        if (this._rootPackage) {
            let rootDir = this._rootPackage.__dirname;
            var packagePluginPath;

            try {
                packagePluginPath = require.resolve(path.join(rootDir, 'marko-devtools'));
            } catch(e) {}

            if (packagePluginPath) {
                var plugin = require(packagePluginPath);
                plugin(this);
            }
        }
    }
}

module.exports = MarkoDevTools;