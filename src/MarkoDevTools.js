'use strict';

const EventEmitter = require('events').EventEmitter;
const lassoPackageRoot = require('lasso-package-root');
const resolveFrom = require('resolve-from');
const path = require('path');
const Commands = require('./Commands');
const complain = require('complain');

function getPackagePluginPath (markoCli, fileName) {
    const rootDir = markoCli._rootPackage.__dirname;
    try {
        return require.resolve(path.join(rootDir, fileName));
    } catch (err) {
        // Ignore error. The config file is optional.
    }
}

class MarkoDevTools extends EventEmitter {
    constructor(cwd) {
        super();
        this.cwd = cwd || process.cwd();
        this.__dirname = __dirname;
        this._rootPackage = lassoPackageRoot.getRootPackage(this.cwd);
        this._commands = undefined;
        this.config = {
            workDir: path.join(this.packageRoot, '.marko-cli')
        };

        this._loadPackagePlugin();
    }

    get packageRoot() {
        return this._rootPackage ? this._rootPackage.__dirname : this.cwd;
    }

    requireFromRoot(path) {
        var resolvedPath;

        try {
            resolvedPath = resolveFrom(this.packageRoot, path);
        } catch(e) {}

        return resolvedPath ? require(resolvedPath) : require(path);
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
            let packagePluginPath = getPackagePluginPath(this, 'marko-cli');

            if (!packagePluginPath) {
                packagePluginPath = getPackagePluginPath(this, 'marko-devtools');

                if (packagePluginPath) {
                    complain(`The "marko-devtools.js" file found at path "${packagePluginPath}" is deprecated. Please use "marko-cli.js" instead.`);
                }
            }

            if (packagePluginPath) {
                var plugin = require(packagePluginPath);
                plugin(this);
            }
        }
    }
}

module.exports = MarkoDevTools;
