module.exports = function parse(argv) {
    var options = require('argly')
        .createParser({
            '--help -h': {
                type: 'string',
                description: 'Show this help message'
            },
            '--pages *': {
                type: 'string[]',
                description: 'File paths of Marko files that should be prebuilt'
            },
            '--config -c': {
                type: 'string',
                description: 'Path to a prebuild config file'
            },
            '--flags -f': {
                type: 'string[]',
                description: 'Flags to pass to the prebuild'
            }
        })
        .usage('Usage: $0 [options]')
        .example(
            'Compile all templates',
            'marko prebuild ./src/pages/index.marko')
        .validate(function(result) {
            if (result.help || !result.pages) {
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
}
