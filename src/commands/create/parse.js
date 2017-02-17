module.exports = function parse(argv) {
    var options = require('argly')
        .createParser({
            '--help': {
                type: 'string',
                description: 'Show this help message'
            },
            '--dir -d': {
                type: 'string',
                description: 'Directory to create the marko app in',
                defaultValue: process.cwd()
            },
            '--name -n *': {
                type: 'string',
                description: 'Project name'
            }
        })
        .usage('Usage: $0 [options]')
        .example(
            'Create a marko app in the current directory',
            'marko create app-name')
        .example(
            'Create a marko app in a specific directory',
            'marko create app-name --dir ~/Desktop')
        .validate(function(result) {
            if (Object.keys(result).length === 0 || result.help) {
                this.printUsage();
                process.exit(0);
            }
        })
        .onError(function(err) {
            this.printUsage();
            console.error(err);
            process.exit(1);
        })
        .parse(argv);

    return options;
};