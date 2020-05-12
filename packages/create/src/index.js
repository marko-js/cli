"use strict";

const fs = require("fs");
const got = require("got");
const path = require("path");
const degit = require("degit");
const EventEmitter = require("events");
const execFile = require("child_process").execFile;
const initGitRepo = require("./init-git-repo");

const DEFAULT_EXAMPLE = "basic";
const EXAMPLES_REPO = "marko-js/examples";
const EXAMPLES_SUBDIRECTORY = "examples";
const GITHUB_URL = "https://github.com/";
const MASTER_TAG = "master";

exports.createProject = function createProject(options) {
  const emitter = new EventEmitter();
  const result = create(options, emitter);
  emitter.then = result.then.bind(result);
  emitter.catch = result.catch.bind(result);
  return emitter;
};

async function create(options = {}, emitter) {
  let { dir, name, template = DEFAULT_EXAMPLE } = options;
  const projectPath = path.resolve(dir, name);
  await assertAllGood(dir, projectPath, name);

  if (!template.includes("/")) {
    await assertExampleExists(template);
    template = `${EXAMPLES_REPO}/${EXAMPLES_SUBDIRECTORY}/${template}`;
  }

  await downloadRepo(template, projectPath, options, emitter);
  const { scripts } = await rewritePackageJson(projectPath, name);
  await installPackages(projectPath, emitter);
  await initGitRepo(projectPath, emitter);

  return { projectPath, scripts };
}

exports.getExamples = async function() {
  const tempPath = path.join(__dirname, "examples-cache");
  await downloadRepo(EXAMPLES_REPO, tempPath, { force: true });
  const tempExamplesPath = path.join(tempPath, EXAMPLES_SUBDIRECTORY);
  const examples = await fs.promises.readdir(tempExamplesPath);
  return Promise.all(
    examples.map(async name => {
      let description = "";

      try {
        const packagePath = path.join(tempExamplesPath, name, "package.json");
        const packageData = JSON.parse(await fs.promises.readFile(packagePath));
        description = packageData.description || "";
      } catch (e) {
        // ignore error
      }

      return {
        name,
        isDefault: name === DEFAULT_EXAMPLE,
        hint: description
      };
    })
  );
};

async function assertExampleExists(example) {
  const [exampleName, tag = MASTER_TAG] = example.split("#");

  if (!(await isUrlFound(getExampleUrl(exampleName, tag)))) {
    throw new Error(
      `Example ${exampleName} does not exist in ${EXAMPLES_REPO}${
        tag === MASTER_TAG ? "" : ` at branch/tag/commit named ${tag}`
      }.`
    );
  }
}

async function assertAllGood(dir, fullPath, name) {
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

function isUrlFound(url) {
  return got
    .head(url)
    .then(() => true)
    .catch(() => false);
}

async function downloadRepo(source, target, options, emitter) {
  emitter && emitter.emit("download");
  const downloader = degit(source, options);
  await downloader.clone(target);
}

async function rewritePackageJson(fullPath, name) {
  let packagePath = path.resolve(fullPath, "./package.json");
  let packageData = fs.readFileSync(packagePath, "utf8");

  packageData = JSON.parse(packageData);

  packageData.name = name;
  packageData.version = "1.0.0";
  packageData.private = true;

  await fs.promises.writeFile(
    packagePath,
    JSON.stringify(packageData, null, 2)
  );

  return packageData;
}

function installPackages(fullPath, emitter) {
  emitter.emit("install");
  return new Promise((resolve, reject) => {
    execFile("npm", ["install"], { cwd: fullPath }, err => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function getExampleUrl(example, tag) {
  return `${GITHUB_URL}/${EXAMPLES_REPO}/tree/${tag}/${EXAMPLES_SUBDIRECTORY}/${example}`;
}
