"use strict";

const spawn = require("child_process").spawn;
const execSync = require("child_process").execSync;

module.exports = async function initGitRepo(cwd, emitter) {
  if (hasGit() && !isGitRepo() && !isMercurialRepo()) {
    emitter.emit("init");
    await spawnPromise("git", ["init"], { cwd });
    await spawnPromise("git", ["add", "."], { cwd });
    await spawnPromise("git", ["commit", "-m", commitMessage], { cwd });
  }
};

function hasGit() {
  return tryCommand("git --version");
}

function isGitRepo() {
  return tryCommand("git rev-parse --is-inside-work-tree");
}

function isMercurialRepo() {
  return tryCommand("hg --cwd . root");
}

function tryCommand(cmd) {
  try {
    execSync(cmd, { stdio: "ignore" });
    return true;
  } catch (e) {
    return false;
  }
}

function spawnPromise(cmd, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: "ignore", ...options });
    child.on("close", code => {
      if (!code) resolve();
      else
        reject(new Error(`${cmd} ${args.join(" ")} exited with code ${code}`));
    });
  });
}

let commitMessage = `initial commit from @marko/create
⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣤⣤⣤⣤⣤⣤⣤⣤⡀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣤⣤⣤⣤⣤⣤⣤⣤⡀⠀⠀⠀⢤⣤⣤⣤⣤⣤⣤⣤⡀
⠀⠀⠀⠀⠀⠀⠀⠀⣰⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣆⠀⠀⠀⠀⠀⠀⣰⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣆⠀⠀⠀⠹⣿⣿⣿⣿⣿⣿⣿⣆
⠀⠀⠀⠀⠀⠀⢀⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⡀⠀⠀⢀⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⡀⠀⠀⠈⢿⣿⣿⣿⣿⣿⣿⣷⡀
⠀⠀⠀⠀⠀⣰⣿⣿⣿⣿⣿⣿⣿⠏⠹⣿⣿⣿⣿⣿⣿⣿⣆⣰⣿⣿⣿⣿⣿⣿⣿⠏⠹⣿⣿⣿⣿⣿⣿⣿⣆⠀ ⠀⠹⣿⣿⣿⣿⣿⣿⣿⣆
⠀⠀⠀⢀⣾⣿⣿⣿⣿⣿⣿⡿⠁⠀⠀⠈⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠁⠀⠀⠈⢿⣿⣿⣿⣿⣿⣿⣷⡀⠀⠀⠈⢿⣿⣿⣿⣿⣿⣿⣷⡀
⠀⠀⣰⣿⣿⣿⣿⣿⣿⣿⠏⠀⠀⠀⠀⠀⠀⠹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠏⠀⠀⠀⠀⠀⠀⠹⣿⣿⣿⣿⣿⣿⣿⣆⠀⠀⠀⠹⣿⣿⣿⣿⣿⣿⣿⣆
⢀⣾⣿⣿⣿⣿⣿⣿⡿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠈⢿⣿⣿⣿⣿⣿⣿⡿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠈⢿⣿⣿⣿⣿⣿⣿⣷⡀⠀⠀⠈⢿⣿⣿⣿⣿⣿⣿⣷⡀
⠈⢿⣿⣿⣿⣿⣿⣿⣷⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣾⣿⣿⣿⣿⣿⣿⡿⠁⠀⠀⢀⣾⣿⣿⣿⣿⣿⣿⡿⠁
⠀⠀⠹⣿⣿⣿⣿⣿⣿⣿⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⣿⣿⣿⣿⣿⣿⣿⠏⠀⠀⠀⣰⣿⣿⣿⣿⣿⣿⣿⠏
⠀⠀⠀⠈⢿⣿⣿⣿⣿⣿⣿⣷⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣾⣿⣿⣿⣿⣿⣿⡿⠁⠀⠀⢀⣾⣿⣿⣿⣿⣿⣿⡿⠁
⠀⠀⠀⠀ ⠹⣿⣿⣿⣿⣿⣿⣿⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⣿⣿⣿⣿⣿⣿⣿⠏⠀⠀⠀⣰⣿⣿⣿⣿⣿⣿⣿⠏
⠀⠀⠀⠀⠀⠀⠈⢿⣿⣿⣿⣿⣿⣿⣷⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣾⣿⣿⣿⣿⣿⣿⡿⠁⠀⠀⢀⣾⣿⣿⣿⣿⣿⣿⡿⠁
⠀⠀⠀⠀⠀⠀⠀⠀⠹⣿⣿⣿⣿⣿⣿⣿⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⣿⣿⣿⣿⣿⣿⣿⠏⠀⠀⠀⣰⣿⣿⣿⣿⣿⣿⣿⠏
⠀⠀⠀⠀⠀⠀⠀⠀ ⠈⠛⠛⠛⠛⠛⠛⠛⠓⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠚⠛⠛⠛⠛⠛⠛⠛⠁⠀⠀⠀⠚⠛⠛⠛⠛⠛⠛⠛⠁
`;
