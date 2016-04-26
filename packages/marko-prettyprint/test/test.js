'use strict';
var chai = require('chai');
chai.config.includeStack = true;
var autotest = require('./autotest');
var path = require('path');
var markoPrettyprint = require('../');
var fs = require('fs');

describe('marko-prettyprint' , function() {

    var autoTestDir = path.join(__dirname, 'fixtures/autotest');

    autotest.scanDir(
        autoTestDir,
        function run(dir) {
            let inputPath = path.join(dir, 'template.marko');
            var templateSrc = fs.readFileSync(inputPath, { encoding: 'utf8' });

            if (process.env.SYNTAX  === 'html') {
                let actualHtml = markoPrettyprint(templateSrc, { filename: inputPath, syntax: 'html' });
                return actualHtml;
            } else if (process.env.SYNTAX  === 'concise') {
                let actualConcise = markoPrettyprint(templateSrc, { filename: inputPath, syntax: 'concise' });
                return actualConcise;
            } else {
                let actualConcise = markoPrettyprint(templateSrc, { filename: inputPath, syntax: 'concise' });
                let actualHtml = markoPrettyprint(templateSrc, { filename: inputPath, syntax: 'html' });
                return actualHtml + '\n~~~~~~~\n' + actualConcise;
            }

        },
        {
            compareExtension: '.marko'
        });
});
