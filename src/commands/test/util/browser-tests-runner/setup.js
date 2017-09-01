var BrowserContext = require('./BrowserContext');
var options = {};

if (window.location.search) {
    try {
        options = JSON.parse(decodeURIComponent(window.location.search.slice(1)))
    } catch(e) {
        console.error(e);
    }
}

var mochaOptions = Object.assign({ reporter:'html', ui:'bdd' }, options.mocha);

Object.keys(mochaOptions).forEach(function(key) {
    if (typeof window.mocha[key] === 'function') {
        window.mocha[key](mochaOptions[key]);
    }
});

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

    Object.keys(it).forEach(function(key) {
      if (typeof it[key] === 'function') {
          window.test[key] = function(name, handler) {
              runTest(it[key], name, handler, context);
          };
      }
    });

    var desc = test.componentName;
    if (test.groupName) {
        desc += ' - ' + test.groupName;
    }

    describe(desc, func);

    window.test = null;
};

