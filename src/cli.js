var MarkoDevTools = require('./MarkoDevTools');

exports.run = function(argv) {
    var markoDevTools = new MarkoDevTools();

    var commandName = argv[2];

    if (!markoDevTools.hasCommand(commandName)) {
        console.error('Invalid command: ' + commandName);
        console.error('Allowed commands: ' +markoDevTools.commands.getNames().join(' '));
        process.exit(1);
    }

    markoDevTools.runCommand(commandName, argv.slice(3))
        .catch((err) => {
            console.error(`An error occurred while running command ${commandName}:`, (err.stack || err));
            process.exit(1);
        });
};