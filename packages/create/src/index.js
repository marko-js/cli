"use strict";

const os = require("os");
const fs = require("fs");
const got = require("got");
const path = require("path");
const util = require("util");
const degit = require("degit");
const EventEmitter = require("events");

const exec = require("./exec");
const initGitRepo = require("./init-git-repo");

const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const exists = request =>
  new Promise(resolve => fs.access(request, err => resolve(!err)));

const DEFAULT_EXAMPLE = "basic";
const EXAMPLES_REPO = "marko-js/examples";
const EXAMPLES_SUBDIRECTORY = "examples";
const GITHUB_URL = "https://github.com/";
const MASTER_TAG = "master";
const TEMP_DIR = os.tmpdir();

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
  const tempPath = path.join(TEMP_DIR, "marko-create-examples");
  await downloadRepo(EXAMPLES_REPO, tempPath, { force: true });
  const tempExamplesPath = path.join(tempPath, EXAMPLES_SUBDIRECTORY);
  const examples = await readdir(tempExamplesPath);
  return Promise.all(
    examples.map(async name => {
      let description = "";

      try {
        const packagePath = path.join(tempExamplesPath, name, "package.json");
        const packageData = JSON.parse(await readFile(packagePath));
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
  if (!isValidAppName(name)) {
    throw new Error(`Invaid app name: ${name}`);
  }

  if (!(await exists(dir))) {
    throw new Error(`Invalid directory specified '${dir}'`);
  }

  if (await exists(fullPath)) {
    throw new Error(`Project path already exists '${fullPath}'`);
  }
}

function isValidAppName(name) {
  return !/\/|\\/.test(name);
}

async function isUrlFound(url) {
  try {
    await got.head(url);
    return true;
  } catch (_) {
    return false;
  }
}

async function downloadRepo(source, target, options, emitter) {
  emitter && emitter.emit("download");
  const downloader = degit(source, options);
  await downloader.clone(target);
}

async function rewritePackageJson(fullPath, name) {
  let packagePath = path.resolve(fullPath, "./package.json");
  let packageData = await readFile(packagePath, "utf8");

  packageData = JSON.parse(packageData);

  packageData.name = name;
  packageData.version = "1.0.0";
  packageData.private = true;

  await writeFile(packagePath, JSON.stringify(packageData, null, 2));

  return packageData;
}

async function installPackages(fullPath, emitter) {
  emitter.emit("install");
  await exec(fullPath, "npm", ["install"]);
}

function getExampleUrl(example, tag) {
  return `${GITHUB_URL}/${EXAMPLES_REPO}/tree/${tag}/${EXAMPLES_SUBDIRECTORY}/${example}`;
}
