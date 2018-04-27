"use strict";

const exec = require("child_process").exec;
const execSync = require("child_process").execSync;

module.exports = function initGitRepo(directoryPath, spinner) {
  if (hasGit() && !isGitRepo() && !isMercurialRepo()) {
    spinner.text = "Initializing repo...";
    return execAll([
      `cd ${directoryPath}`,
      `git init`,
      `git add .`,
      `git commit -m "${commitMessage}"`
    ]);
  } else {
    return Promise.resolve();
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

function execAll(cmds) {
  return new Promise((resolve, reject) => {
    exec(cmds.join(" && "), err => {
      if (err) reject(err);
      else resolve();
    });
  });
}

let commitMessage = `initial commit from marko-cli

 ⠀⠀⠀⠀⠀⠀⠀⠀⣾⣿⣯⣿⣿⣿⣿⣿⣿⣿⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⡀⠀⠀⢻⣿⣿⣿⣿⣿⣿⣿⣦⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⢀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⠀⠀⠀⠀⠀⠀⢀⣿⣿⣿⣿⣿⣿⣿⣿⢿⢿⢿⢿⣦⠀⠀⠙⣿⣿⣿⣿⣿⣿⣿⣷⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⣠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⡀⠀⠀⠀⣰⣿⣿⣿⣿⣿⣿⣿⣿⢿⢿⢿⢿⢿⢿⣷⠀⠀⠈⣿⣿⣿⣿⣿⣿⣿⣿⣄⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⣾⢿⢿⢿⢿⢿⢿⢿⠟⠈⣿⣿⣿⣿⣿⣿⣿⣿⣄⢀⣾⣿⣿⣿⣿⣿⣿⣿⠟⠉⣿⣿⣿⣿⣿⣿⣿⣿⡀⠀⠀⢻⣿⣿⣿⣿⣿⣿⣿⣦⠀⠀⠀⠀⠀
⠀⠀⠀⢀⣿⠙⠙⠙⠙⠙⠙⠙⠉⠀⠀⠀⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠋⠀⠀⠀⢿⣿⣿⣿⣿⣿⣿⣿⣦⠀⠀⠙⣿⣿⣿⣿⣿⣿⣿⣷⡀⠀⠀⠀
⠀⠀⣠⣿⠙⠙⠙⠙⠙⠙⡿⠁⠀⠀⠀⠀⠀⠹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠁⠀⠀⠀⠀⠀⠙⣿⣿⣿⣿⣿⣿⣿⣷⠀⠀⠈⣿⣿⣿⣿⣿⣿⣿⣿⣄⠀⠀
⠀⣾⠙⠙⠙⠙⠙⠙⠙⠛⠀⠀⠀⠀⠀⠀⠀⠀⠈⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠀⠀⠀⠀⠀⠀⠀⠀⠈⣿⣿⣿⣿⣿⣿⣿⣿⡄⠀⠀⢻⣿⣿⣿⣿⣿⣿⣿⣦⠀
⢻⣿⣿⣿⣿⣿⣿⣿⡯⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠉⠉⠉⠉⠉⠉⠉⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⡟
⠀⠙⣿⢿⢿⢿⢿⢿⢿⡷⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣴⣿⣿⣿⣿⣿⣿⣿⡿⠀⠀⢀⣿⣿⣿⣿⣿⣿⣿⣿⠋⠀
⠀⠀⠈⣿⢿⢿⢿⢿⢿⢿⣿⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣾⣿⣿⣿⣿⣿⣿⣿⠋⠀⠀⣠⣿⣿⣿⣿⣿⣿⣿⡿⠁⠀⠀
⠀⠀⠀⠀⢻⣿⣿⣿⣿⣿⣿⣿⣦⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣿⣿⣿⣿⣿⣿⣿⣿⠁⠀⠀⣾⣿⣿⣿⣿⣿⣿⣿⠟⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠙⣿⣿⣿⣿⣿⣿⣿⣷⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣴⣿⣿⣿⣿⣿⣿⣿⡟⠀⠀⢠⣿⣿⣿⣿⣿⣿⣿⣿⠋⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠈⣿⣿⣿⣿⣿⣿⣿⣿⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣾⣿⣿⣿⣿⣿⣿⣿⠋⠀⠀⣴⣿⣿⣿⣿⣿⣿⣿⡿⠁⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠻⣿⣿⣿⣿⣿⣿⣿⣦⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣿⣿⣿⣿⣿⣿⣿⣿⠁⠀⠀⣾⣿⣿⣿⣿⣿⣿⣿⠟⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⣿⣿⣿⣿⣿⣿⣿⣿⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡴⣿⣿⣿⣿⣿⣿⣿⡟⠀⠀⢠⣿⣿⣿⣿⣿⣿⣿⣿⠋
`;
