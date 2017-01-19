'use strict';
var chai = require('chai');
chai.config.includeStack = true;
var path = require('path');
var markoPrettyprint = require('../');
var fs = require('fs');
var childProcess = require('child_process');

if (!fs.existsSync(path.join(__dirname, 'marko-v3/node_modules/marko'))) {
    childProcess.execSync('npm install', {
        cwd: path.join(__dirname, 'marko-v3')
    });
}


describe('marko-prettyprint (marko v3)' , function() {

    var autoTestDir = path.join(__dirname, 'marko-v3/autotest');

    require('./util/autotest').scanDir(
        autoTestDir,
        function run(dir) {
            let inputPath = path.join(dir, 'template.marko');
            var templateSrc = fs.readFileSync(inputPath, { encoding: 'utf8' });

            var testMain;

            if (fs.existsSync(path.join(dir, 'test.js'))) {
                testMain = require(path.join(dir, 'test.js'));
            } else {
                testMain = {};
            }

            var options = (testMain.getOptions && testMain.getOptions()) || {};
            options.filename = inputPath;

            if (process.env.SYNTAX  === 'html') {
                options.syntax = 'html';
                let actualHtml = markoPrettyprint(templateSrc, options);
                return actualHtml;
            } else if (process.env.SYNTAX  === 'concise') {
                options.syntax = 'concise';
                let actualConcise = markoPrettyprint(templateSrc, options);
                return actualConcise;
            } else {
                options.syntax = 'concise';
                let actualConcise = markoPrettyprint(templateSrc, options);
                options.syntax = 'html';
                let actualHtml = markoPrettyprint(templateSrc, options);
                return actualHtml + '\n~~~~~~~\n' + actualConcise;
            }

        },
        {
            compareExtension: '.marko'
        });
});
