var lassoPackageRoot = require('lasso-package-root');
var fs = require('fs');
var path = require('path');
var editorconfig = require('editorconfig');
var os = require('os');

function removeDashes(str) {
    return str.replace(/-([a-z])/g, function (match, lower) {
        return lower.toUpperCase();
    });
}

function convertEditorConfig(parsedEditorConfig) {
    var converted = {};

    if (parsedEditorConfig.indent_style || parsedEditorConfig.indent_size) {
        var indentStyle = parsedEditorConfig.indent_style || 'space';
        var indentSize = parsedEditorConfig.indent_size;
        if (!indentSize) {
            indentSize = indentStyle === 'space' ? 4 : 1;
        } else if (indentSize === 'tab') {
            indentSize = 1;
            indentStyle = 'tab';
        }

        var indentChar = indentStyle === 'space' ? ' ' : '\t';
        var indent = '';
        for (var i=0; i<indentSize; i++) {
            indent += indentChar;
        }
        converted.indent = indent;
    }

    var maxLen = parsedEditorConfig.max_line_length;
    if (maxLen != null) {
        if (maxLen === 'off' || maxLen <= 0) {
            maxLen = Number.MAX_SAFE_INTEGER || 9007199254740991;
        }
        converted.maxLen = maxLen;
    }

    var eol = parsedEditorConfig.end_of_line;
    if (eol != null) {
        if (eol === 'lf') {
            eol = '\n';
        } else if (eol === 'crlf') {
            eol = '\r\n';
        } else if (eol === 'cr') {
            eol = '\r';
        }
        converted.eol = eol;
    }

    return converted;
}

function readConfigFile(filename) {
    var dirname = path.dirname(filename);
    var config = {};

    function mergeOptions(newOptions) {
        for (var k in newOptions) {
            if (!config.hasOwnProperty(k)) {
                config[k] = newOptions[k];
            }
        }
    }

    function mergeFile(configFilePath) {
        var configJSON;

        try {
            configJSON = fs.readFileSync(configFilePath, { encoding: 'utf8' });
        } catch(err) {
            if (err.code !== 'ENOENT') {
                // Only rethrow the error if it is not a "File Not Found" error
                throw err;
            }
        }

        if (configJSON) {
            var newConfig;
            try {
                newConfig = JSON.parse(configJSON);
            } catch(e) {
                throw new Error('Unable to parse JSON at path "' + configFilePath + '": ' + e);
            }

            for (var key in newConfig) {
                if (newConfig.hasOwnProperty(key)) {
                    var keyCamelCase = removeDashes(key);
                    if (!config.hasOwnProperty(keyCamelCase)) {
                        config[keyCamelCase] = newConfig[key];
                    }
                }
            }
        }
    }

    var rootDir = lassoPackageRoot.getRootDir(dirname);
    var currentDir = dirname;
    var editorConfigs = null;

    while (true) {
        var files = fs.readdirSync(currentDir);
        if (!files) {
            break;
        }

        for (var i=0; i<files.length; i++) {
            var file = files[i];

            if (file === '.marko-prettyprint') {
                mergeFile(path.join(currentDir, file));
            } else if (file === '.editorconfig') {
                if (!editorConfigs) {
                    editorConfigs = [];
                }
                var editorConfigFile = path.join(currentDir, file);

                editorConfigs.push({
                    name: editorConfigFile,
                    contents: fs.readFileSync(editorConfigFile, { encoding: 'utf8' })
                });
            }
        }


        if (currentDir === rootDir) {
            // Don't go up past the package's root directory
            break;
        }

        var parentDir = path.dirname(currentDir);
        if (!parentDir || parentDir === currentDir) {
            break;
        }
        currentDir = parentDir;
    }

    if (editorConfigs) {
        var parsedEditorConfig = editorconfig.parseFromFilesSync(filename, editorConfigs);
        var convertedEditorConfig = convertEditorConfig(parsedEditorConfig);
        mergeOptions(convertedEditorConfig);
    }

    if (!config.eol) {
        config.eol = os.EOL;
    }

    return config;
}

module.exports = readConfigFile;
