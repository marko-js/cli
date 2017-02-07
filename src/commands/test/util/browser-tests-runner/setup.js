var BrowserContext = require('./BrowserContext');

if (window.initMochaPhantomJS === 'function') {
    window.initMochaPhantomJS();
}

window.mocha.ui('bdd');
window.mocha.reporter('html');

require('chai').config.includeStack = true;

function _isPromise(obj) {
    return (obj && obj.then && (typeof obj.then === 'function'));
}

function runTest(it, name, handler, context) {
    if(handler.length <= 1) {
        it(name, function() {
            context.name = name;
            var testFunction = handler.call(this, context);
            if (_isPromise(testFunction)) {
                testFunction.then(function () {
                    context._afterTest();
                });
                return testFunction;
            } else {
                context._afterTest();
            }
        });
    } else if(handler.length >= 2) {
        it(name, function(done) {
            context.name = name;
            handler.call(this, context, function() {
                context._afterTest();
                done();
            });
        });
    }
}

window.$marko_test = function(test, component, func) {
    test.component = component;
    var context = new BrowserContext(test);
    window.test = function(name, handler) {
        runTest(it, name, handler, context);
    };

    window.test.only = function(name, handler) {
        runTest(it.only, name, handler, context);
    };

    window.test.skip = function(name, handler) {
        runTest(it.skip, name, handler, context);
    };

    var desc = test.componentName;
    if (test.groupName) {
        desc += ' - ' + test.groupName;
    }

    describe(desc, func);

    window.test = null;
};

