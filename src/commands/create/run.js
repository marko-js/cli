'use strict';

const fs = require('fs');
const got = require('got');
const ora = require('ora');
const path = require('path');
const unzip = require('unzip');
const exec = require('child_process').exec;

const DEFAULT_REPO = 'demo';
const MARKO_PREFIX = 'marko-';
const MARKO_STARTER_PREFIX = 'marko-starter-';
const MARKO_SAMPLES_ORG = 'marko-js-samples';
const GITHUB_URL = 'https://github.com/';
const ARCHIVE_PATH = '/archive/master.zip';
const MASTER_SUFFIX = '-master';

module.exports = function run(options, devTools) {
    console.log('');
    const spinner = ora('Starting...').start();
    return Promise.resolve().then(() => {
        const dir = options.dir;
        const nameParts = splitOrUnshiftDefault(options.name, ':', DEFAULT_REPO);
        const source = nameParts[0];
        const name = nameParts[1];
        const sourceParts = splitOrUnshiftDefault(source, '/', MARKO_SAMPLES_ORG);
        const org = sourceParts[0];
        const repo = sourceParts[1];
        const fullPath = path.resolve(dir, name);
        const relativePath = path.relative(process.cwd(), fullPath);

        assertAllGood(dir, name, fullPath);

        return getExistingRepo(org, repo).then((existing) => {
            let org = existing.org;
            let repo = existing.repo;
            spinner.text = 'Downloading app...';
            return getZipArchive(org, repo, dir, name).then(() => {
                rewritePackageJson(fullPath, name);
                spinner.text = 'Installing npm modules... (this may take a minute)';
                return installPackages(fullPath).then(() => {
                    spinner.succeed(
                        'Successfully created app! To get started, run:\n\n'+getRunInstructions(fullPath)+'\n'
                    );
                })
            });
        })
    }).catch(err => spinner.fail(err.message+'\n'));
};

function splitOrUnshiftDefault(string, char, defaultValue) {
    let parts = string.split(char);
    if (parts.length === 1) {
        parts.unshift(defaultValue);
    }
    return parts;
}

function assertAllGood(dir, name, fullPath) {
    if (!fs.existsSync(dir)) {
        throw new Error(`Invalid directory specified '${dir}'`);
    }
    if (fs.existsSync(fullPath)) {
        throw new Error(`Project path already exists '${fullPath}'`);
    }
    if (!isValidAppName(name)) {
        throw new Error(`Invaid app name: ${name}`);
    }
}

function isValidAppName(name) {
    return !/\/|\\/.test(name);
}

function getExistingRepo(org, repo) {
    let possibleRepos = org === MARKO_SAMPLES_ORG ? [
        { org, repo },
        { org, repo:MARKO_PREFIX+repo },
        { org, repo:MARKO_STARTER_PREFIX+repo }
    ] : [{ org, repo }];

    return Promise.all(possibleRepos.map((possible) => {
        let org = possible.org;
        let repo = possible.repo;
        return got.head(GITHUB_URL+org+'/'+repo).then(
            (response) => true,
            (error) => false,
        )
    })).then(results => {
        let matchingRepo;
        if(results[0]) {
            matchingRepo = possibleRepos[0];
        } else if(results[1]) {
            matchingRepo = possibleRepos[1];
        } else if(results[2]) {
            matchingRepo = possibleRepos[2];
        } else {
            throw new Error(
                'Unable to find a matching app template. None of the following exist:\n' +
                possibleRepos.map(({ org, repo }) => '  - '+org+'/'+repo).join('\n')
            );
        }

        return matchingRepo;
    });
}

function getZipArchive(org, repo, dir, name) {
    let resource = GITHUB_URL+org+'/'+repo+ARCHIVE_PATH;
    let extractor = unzip.Extract({ path: dir });

    return new Promise((resolve, reject) => {
        let zipStream = got.stream(resource).pipe(extractor)
        zipStream.on('error', reject).on('close', () => {
            fs.renameSync(
                path.join(dir, repo+MASTER_SUFFIX),
                path.join(dir, name)
            );
            resolve();
        });
    });
}

function rewritePackageJson(fullPath, name) {
    let packagePath = path.resolve(fullPath, './package.json');
    let packageData = fs.readFileSync(packagePath, 'utf8');

    packageData = JSON.parse(packageData);

    packageData.name = name;
    packageData.version = '1.0.0';
    packageData.private = true;

    fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2));
}

function installPackages(fullPath) {
    return new Promise((resolve, reject) => {
        exec(`cd ${fullPath} && npm install`, (err, stdout, stderr) => {
            if(err) reject(err);
            else resolve();
        });
    });
}

function getRunInstructions(fullPath) {
    return `cd ${path.relative(process.cwd(), fullPath)}\nnpm start`;
}


