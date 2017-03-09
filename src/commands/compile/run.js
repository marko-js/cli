'use strict';

var fs = require('fs');
var glob = require('glob');

var globOptions = {
    matchBase: true,
    absolute: true,
    ignore: ['node_modules/**']
};

module.exports = function run(options, devTools) {
    var markoCompiler = devTools.requireFromRoot('marko/compiler');

    globOptions.cwd = devTools.cwd;

    return Promise.all(options.patterns.map((pattern) =>
        new Promise((resolve, reject) => {
            glob(pattern, globOptions, function (err, files) {
                if (err) return reject(err);

                files.map((file) => {
                    if (options.server) {
                        var targetFile = file.replace(/\.\w+$/, '.js');
                        if (options.clean) {
                            fs.unlinkSync(targetFile);
                        } else {
                            var compiledSrc = markoCompiler.compileFile(file);
                            fs.writeFileSync(targetFile, compiledSrc);
                        }
                    }
                    if (options.browser && markoCompiler.compileFileForBrowser) {
                        var targetFile = file.replace(/\.\w+$/, '.browser.js');
                        if (options.clean) {
                            fs.unlinkSync(targetFile);
                        } else {
                            var compiled = markoCompiler.compileFileForBrowser(file);
                            fs.writeFileSync(targetFile, compiled.code);
                        }
                    }
                });


                resolve();
            });
        }))
    );
};
