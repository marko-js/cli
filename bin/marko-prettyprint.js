/*
* Copyright 2011 eBay Software Foundation
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

var fs = require('fs');
var nodePath = require('path');
var cwd = process.cwd();
var Minimatch = require('minimatch').Minimatch;
var markoPrettyprint = require('../');

var mmOptions = {
    matchBase: true,
    dot: true,
    flipNegate: true
};

function relPath(path) {
    if (path.startsWith(cwd)) {
        return path.substring(cwd.length+1);
    }
}

var args = require('argly').createParser({
        '--help': {
            type: 'boolean',
            description: 'Show this help message'
        },
        '--files --file -f *': {
            type: 'string[]',
            description: 'A set of directories or files to pretty print'
        },
        '--ignore -i': {
            type: 'string[]',
            description: 'An ignore rule (default: --ignore "/node_modules" ".*")'
        },
        '--syntax -s': {
            type: 'string',
            description: 'The syntax (either "html" or "concise"). Defaults to "html"'
        },
        '--max-len': {
            type: 'int',
            description: 'The maximum line length. Defaults to 80'
        }
    })
    .usage('Usage: $0 <pattern> [options]')
    .example('Prettyprint a single template', '$0 template.marko')
    .example('Prettyprint a single template', '$0 template.marko')
    .example('Prettyprint all templates in the current directory', '$0 .')
    .example('Prettyprint multiple templates', '$0 template.marko src/ foo/')

    .validate(function(result) {
        if (result.help) {
            this.printUsage();
            process.exit(0);
        }

        if (!result.files || result.files.length === 0) {
            this.printUsage();
            process.exit(1);
        }
    })
    .onError(function(err) {
        this.printUsage();

        if (err) {
            console.log();
            console.log(err);
        }

        process.exit(1);
    })
    .parse();

var syntax = args.syntax || 'html';

var ignoreRules = args.ignore;

if (!ignoreRules) {
    ignoreRules = ['/node_modules', '.*'];
}

ignoreRules = ignoreRules.filter(function (s) {
    s = s.trim();
    return s && !s.match(/^#/);
});

ignoreRules = ignoreRules.map(function (pattern) {

    return new Minimatch(pattern, mmOptions);
});


function isIgnored(path, dir, stat) {
    if (path.startsWith(dir)) {
        path = path.substring(dir.length);
    }

    path = path.replace(/\\/g, '/');

    var ignore = false;
    var ignoreRulesLength = ignoreRules.length;
    for (var i=0; i<ignoreRulesLength; i++) {
        var rule = ignoreRules[i];

        var match = rule.match(path);

        if (!match && stat && stat.isDirectory()) {
            try {
                stat = fs.statSync(path);
            } catch(e) {}

            if (stat && stat.isDirectory()) {
                match = rule.match(path + '/');
            }
        }


        if (match) {
            if (rule.negate) {
                ignore = false;
            } else {
                ignore = true;
            }
        }
    }

    return ignore;
}

function walk(files, options) {
    if (!files || files.length === 0) {
        throw 'No files provided';
    }


    if (!Array.isArray(files)) {
        files = [files];
    }

    var fileCallback = options.file;

    function walkDir(dir) {
        var children = fs.readdirSync(dir);

        if (children.length) {
            children.forEach(function(basename) {
                var file = nodePath.join(dir, basename);
                var stat;
                try {
                    stat = fs.statSync(file);
                } catch(e) {
                    return;
                }


                if (!isIgnored(file, dir, stat)) {
                    if (stat.isDirectory()) {
                        walkDir(file);
                    } else {
                        fileCallback(file);
                    }
                }
            });
        }
    }

    for (var i=0; i<files.length; i++) {
        var file = nodePath.resolve(cwd, files[i]);

        var stat = fs.statSync(file);

        if (stat.isDirectory()) {
            walkDir(file);
        } else {
            fileCallback(file);
        }
    }
}


var found = {};
var foundCount = 0;

var prettyprint = function(path, context) {
    if (found[path]) {
        return;
    }

    found[path] = true;

    var src = fs.readFileSync(path, { encoding: 'utf8' });
    var outputSrc = markoPrettyprint(src, {
        syntax: syntax,
        filename: path
    });

    fs.writeFileSync(path, outputSrc, { encoding: 'utf8' });

    console.log(`Prettyprinted: ${relPath(path)}`);
};


if (args.files && args.files.length) {
    walk(
        args.files,
        {
            file: function(file, context) {
                var basename = nodePath.basename(file);

                if (basename.endsWith('.marko')) {
                    foundCount++;
                    prettyprint(file, context);
                }
            }
        });
}

if (foundCount) {
    console.log(`Prettyprinted ${foundCount} templates(s)!`);
} else {
    console.log(`No templates found!`);
}

