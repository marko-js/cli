"use strict";

const fs = require("fs");
const got = require("got");
const ora = require("ora");
const path = require("path");
const unzip = require("unzip");
const exec = require("child_process").exec;
const initGitRepo = require("./init-git-repo");

const DEFAULT_REPO = "demo";
const MARKO_PREFIX = "marko-";
const MARKO_STARTER_PREFIX = "marko-starter-";
const MARKO_SAMPLES_ORG = "marko-js-samples";
const GITHUB_URL = "https://github.com/";
const REPO_PATH = (org, repo) => `${GITHUB_URL}${org}/${repo}`;
const TREE_PATH = (org, repo, tag) => `${REPO_PATH(org, repo)}/tree/${tag}`;
const ARCHIVE_PATH = (org, repo, tag) =>
  `${REPO_PATH(org, repo)}/archive/${tag}.zip`;
const MASTER_TAG = "master";

module.exports = function run(options, devTools) {
  console.log("");
  const spinner = ora("Starting...").start();
  return Promise.resolve()
    .then(() => {
      const dir = options.dir;
      const parts = getOrgRepoTagAndName(options.name);
      const name = parts.name;
      const org = parts.org;
      const repo = parts.repo;
      const tag = parts.tag;
      const fullPath = path.resolve(dir, name);

      assertAllGood(dir, name, fullPath);

      return getExistingRepo(org, repo, tag).then(existing => {
        let org = existing.org;
        let repo = existing.repo;
        let tag = existing.tag;
        spinner.text = "Downloading app...";
        return getZipArchive(org, repo, tag, dir, name).then(() => {
          rewritePackageJson(fullPath, name);
          spinner.text = "Installing npm modules... (this may take a minute)";
          return installPackages(fullPath).then(() => {
            return initGitRepo(fullPath, spinner).then(() => {
              spinner.succeed(
                "Successfully created app! To get started, run:\n\n" +
                  getRunInstructions(fullPath) +
                  "\n"
              );
            });
          });
        });
      });
    })
    .catch(err => spinner.fail(err.message + "\n"));
};

function getOrgRepoTagAndName(arg) {
  const argParts = splitOrUnshiftDefault(arg, ":", DEFAULT_REPO);
  const source = argParts[0];
  const name = argParts[1];
  const sourceParts = splitOrUnshiftDefault(source, "/", MARKO_SAMPLES_ORG);
  const org = sourceParts[0];
  const repoAndTag = sourceParts[1];
  const repoAndTagParts = repoAndTag.split("@");
  const repo = repoAndTagParts[0] || DEFAULT_REPO;
  const tag = repoAndTagParts[1] || MASTER_TAG;
  return { name, org, repo, tag };
}

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

function getExistingRepo(org, repo, tag) {
  let possibleRepos =
    org === MARKO_SAMPLES_ORG
      ? [
          { org, repo },
          { org, repo: MARKO_PREFIX + repo },
          { org, repo: MARKO_STARTER_PREFIX + repo }
        ]
      : [{ org, repo }];

  return Promise.all(
    possibleRepos.map(possible => {
      let org = possible.org;
      let repo = possible.repo;
      return isUrlFound(REPO_PATH(org, repo));
    })
  ).then(results => {
    let matchingRepo;
    if (results[0]) {
      matchingRepo = possibleRepos[0];
    } else if (results[1]) {
      matchingRepo = possibleRepos[1];
    } else if (results[2]) {
      matchingRepo = possibleRepos[2];
    } else {
      throw new Error(
        "Unable to find a matching app template. None of the following exist:\n" +
          possibleRepos
            .map(possible => {
              const org = possible.org;
              const repo = possible.repo;
              return "  - " + org + "/" + repo;
            })
            .join("\n")
      );
    }

    let org = matchingRepo.org;
    let repo = matchingRepo.repo;

    return isUrlFound(TREE_PATH(org, repo, tag)).then(found => {
      if (!found) {
        throw new Error(
          `Unable to find a branch/tag/commit named ${tag} in ${org}/${repo}.`
        );
      }

      matchingRepo.tag = tag;

      return matchingRepo;
    });
  });
}

function isUrlFound(url) {
  return got
    .head(url)
    .then(response => true)
    .catch(error => false);
}

function getZipArchive(org, repo, tag, dir, name) {
  let resource = ARCHIVE_PATH(org, repo, tag);
  let extractor = unzip.Extract({ path: dir });

  return new Promise((resolve, reject) => {
    let zipStream = got.stream(resource).pipe(extractor);
    zipStream.on("error", reject).on("close", () => {
      fs.renameSync(path.join(dir, repo + "-" + tag), path.join(dir, name));
      resolve();
    });
  });
}

function rewritePackageJson(fullPath, name) {
  let packagePath = path.resolve(fullPath, "./package.json");
  let packageData = fs.readFileSync(packagePath, "utf8");

  packageData = JSON.parse(packageData);

  packageData.name = name;
  packageData.version = "1.0.0";
  packageData.private = true;

  fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2));
}

function installPackages(fullPath) {
  return new Promise((resolve, reject) => {
    exec(`cd ${fullPath} && npm install`, (err, stdout, stderr) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function getRunInstructions(fullPath) {
  return `cd ${path.relative(process.cwd(), fullPath)}\nnpm start`;
}
