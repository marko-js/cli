const fs = require('fs');
const path = require('path');

exports.applyConfigInDirectory = function(directoryPath, packageData) {
    let createConfig = getCreateConfig(directoryPath);
    let createIgnore = createConfig.ignore || {};
    let ignoredFiles = createIgnore.files;
    let ignoredScripts = createIgnore.scripts;
    let ignoredDependencies = createIgnore.dependencies;

    if (ignoredScripts && packageData.scripts) {
        removeKeys(packageData, 'scripts', ignoredScripts);
    }

    if (ignoredDependencies) {
        if (packageData.dependencies) {
            removeKeys(packageData, 'dependencies', ignoredDependencies);
        }
        if (packageData.devDependencies) {
            removeKeys(packageData, 'devDependencies', ignoredDependencies);
        }
    }

    if (ignoredFiles) {
        ignoredFiles.forEach(file => {
            fs.unlinkSync(path.resolve(directoryPath, file));
        });
    }
}

function getCreateConfig(directoryPath) {
    let createConfigPath = path.resolve(directoryPath, '.createconfig');
    let createConfigRaw = fs.existsSync(createConfigPath) && fs.readFileSync(createConfigPath, 'utf8');
    let createConfig = createConfigRaw ? JSON.parse(createConfigRaw) : {};
    return createConfig;
}

function removeKeys(parent, prop, propsToRemove) {
    let object = parent[prop];
    propsToRemove.forEach(propName => {
        delete object[propName];
    });
    if (Object.keys(object).length === 0) {
        delete parent[prop];
    }
}