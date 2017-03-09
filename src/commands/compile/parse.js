module.exports = function parse(argv) {
    var options = require('argly')
        .createParser({
            '--help': {
                type: 'string',
                description: 'Show this help message'
            },
            '--server': {
                type: 'boolean',
                description: 'Compile view(s) for node.js (html renderer)'
            },
            '--browser': {
                type: 'boolean',
                description: 'Compile view(s) for browser (vdom renderer)'
            },
            '--clean': {
                type: 'boolean',
                description: 'Delete compiled files'
            },
            '--files --file -f *': {
                type: 'string[]',
                description: 'File patterns'
            }
        })
        .usage('Usage: $0 [options]')
        .example(
            'Compile all templates',
            'marko compile')
        .validate(function(result) {
            if (result.help) {
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

    var patterns = options.files;

    if (!patterns || !patterns.length) {
        patterns = ['**/*.marko'];
    }

    options.patterns = patterns;
    delete options.files;

    if (!options.server && !options.browser) {
        options.server = options.browser = true;
    }

    return options;
};