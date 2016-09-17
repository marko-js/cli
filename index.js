var fs = require('fs');
var path = require('path');
var walk = require('fs-walk');

var ServerContext = require('./ServerContext');

function runTests() {
    walk.walkSync(process.cwd(), function(basedir, filename, stat) {
        var filepath = path.join(basedir, filename);
        if(stat.isDirectory() && filename === 'components') {
            runServerTestsForComponents(filepath);
        } else if(filename === 'marko.json') {
            var contents = JSON.parse(fs.readFileSync(filepath));
            if(contents.tagsdir) {
                if(Array.isArray(contents.tagsdir)) {
                    contents.tagsdir.forEach(tagsdir => {
                        tagsdir = path.resolve(basedir, tagsdir);
                        runServerTestsForComponents(tagsdir);
                    })
                } else {
                    var tagsdir = path.resolve(basedir, contents.tagsdir);
                    runServerTestsForComponents(tagsdir)
                }
            }
        }
    });
}

function runServerTestsForComponents(tagsDir) {
    console.log('RUN TESTS FOR COMPONENTS:', tagsDir)
    var tagNames = fs.readdirSync(tagsDir);
    tagNames.forEach(tagName => {
        var tagPath = path.join(tagsDir, tagName);
        var testPath = path.join(tagPath, './test/server.js');

        if(fs.existsSync(testPath)) {
            describe('<'+tagName+'>', () => {
                var renderer = getRenderer(tagPath);
                var context = new ServerContext(renderer, tagPath);

                global.test = function(name, handler) {
                    if(!handler) return it(name);
                    else if(handler.length <= 1) {
                        return it(name, function() {
                            context.test = { name };
                            handler(context)
                        })
                    } else if(handler.length >= 2) {
                        return it(name, function(done) {
                            context.test = { name };
                            handler(context, done)
                        })
                    }
                }

                require(testPath);
            });
        }
    });
}

function getRenderer(tagPath) {
    var indexPath = path.join(tagPath, 'index.js');
    var rendererPath = path.join(tagPath, 'renderer.js');
    var templatePath = path.join(tagPath, 'template.marko');

    if(fs.existsSync(indexPath)) {
        return require(indexPath);
    } else if(fs.existsSync(rendererPath)) {
        return require(rendererPath);
    } else if(fs.existsSync(templatePath)) {
        return require(templatePath);
    }
}

runTests();