module.exports = function parse(argv) {
    var options = require('argly')
        .createParser({
            '--help': {
                type: 'string',
                description: 'Show this help message'
            },
            '--server': {
                type: 'boolean',
                description: 'Run only server tests'
            },
            '--no-exit': {
                type: 'boolean',
                description: 'Do not shutdown the test server'
            },
            '--browser': {
                type: 'boolean',
                description: 'Run only browser tests'
            },
            '--files --file -f *': {
                type: 'string[]',
                description: 'File patterns'
            }
        })
        .usage('Usage: $0 [options]')
        .example(
            'Run all tests',
            'marko test')
        .example(
            'Run all tests for a single component',
            'marko test ./src/components/app-foo/**/test*.js')
        .example(
            'Run all UI component tests',
            'marko test ./src/components/**/test*.js')
        .example(
            'Run only server tests',
            'marko test ./src/components/**/test*server.js --server')
        .example(
            'Run only browser tests',
            'marko test ./src/components/**/test*browser.js --browser')
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

    if (options.server == null) {
        if (options.browser == null) {
            options.server = options.browser = true;
        } else {
            options.server = options.browser !== true;
        }
    }

    if (options.browser == null) {
        options.browser = options.server !== true;
    }

    if (!patterns || !patterns.length) {
        patterns = ['**/test.js', '**/test.*.js', '**/test/*.js'];
    }

    options.patterns = patterns;
    delete options.files;

    return options;
};
