'use strict';

const fs = require('fs');
const path = require('path');
const registryDownload = require('npm-registry-download');

const SCAFFOLD_PROJECT = 'marko-starter-demo';

function isValidAppName(name) {
    return !/\/|\\/.test(name);
}

module.exports = function run(options, devTools) {
    return new Promise(function(resolve, reject) {
        let {name, dir} = options;

        if (!fs.existsSync(dir)) {
            return reject(new Error(`Invalid directory specified '${dir}'`));
        }

        // Check if the path where we plan to place the scaffold project already exists
        const fullPath = path.resolve(dir, name);
        if (fs.existsSync(fullPath)) {
            return reject(new Error(`Project path already exists '${fullPath}'`));
        }

        if (!isValidAppName(name)) {
            return reject(new Error(`Invaid app name: ${name}`));
        }

        process.chdir(dir);

        registryDownload(SCAFFOLD_PROJECT).then(function() {
            fs.renameSync('./package', name);
            process.chdir(`./${name}`);

            let packageData = fs.readFileSync('./package.json', 'utf8');
            packageData = JSON.parse(packageData);

            packageData.name = name;
            packageData.version = '1.0.0';
            packageData.private = true;

            fs.writeFileSync('./package.json', JSON.stringify(packageData, null, 2));
            resolve();
        }).catch(reject);
    });
};
