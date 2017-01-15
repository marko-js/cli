var resolveFrom = require('resolve-from');

function getMarkoCompiler(dir) {
    var markoCompilerPath = resolveFrom(dir, 'marko/compiler');

    if (markoCompilerPath) {
        return require(markoCompilerPath);
    } else {
        return require('marko/compiler');
    }
}

module.exports = getMarkoCompiler;
