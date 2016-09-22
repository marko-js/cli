var MarkoDevTools = require('./MarkoDevTools');

exports.create = function(cwd) {
    return new MarkoDevTools(cwd);
};