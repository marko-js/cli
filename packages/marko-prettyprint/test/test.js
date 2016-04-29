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
