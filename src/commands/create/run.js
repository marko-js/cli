'use strict';

const fs = require('fs');
const path = require('path');
const nrd = require('nrd');

const SCAFFOLD_PROJECT = 'marko-starter-demo';


function isValidAppName(name) {
    return !/\/|\\/.test(name);
}

module.exports = function run(options, devTools) {
    return new Promise(function(resolve, reject) {
        let name = options.name;
        let dir = options.dir;

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

        nrd.download(SCAFFOLD_PROJECT, {
            dir
        }).then(function() {
            const packageNamePath = path.resolve(dir, './package');
            const newPackageNamePath = path.resolve(dir, `./${name}`);

            fs.renameSync(packageNamePath, newPackageNamePath);

            const packagePath = path.resolve(fullPath, './package.json');
            let packageData = fs.readFileSync(packagePath, 'utf8');

            packageData = JSON.parse(packageData);

            packageData.name = name;
            packageData.version = '1.0.0';
            packageData.private = true;

            fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2));

            const npmignorePath = path.resolve(fullPath, './.npmignore');
            const gitignorePath = path.resolve(fullPath, './.gitignore');

            // npm removes .gitignore and creates an .npmignore, so recreate it
            fs.createReadStream(npmignorePath).pipe(fs.createWriteStream(gitignorePath));

            console.log(`
Successfully installed app. To start your app, run the following commands:

cd ${fullPath}
npm install # or 'yarn'
npm start
            `);
            resolve();
        }).catch(reject);
    });
};
