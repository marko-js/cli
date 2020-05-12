"use strict";

const exec = require("./exec");

module.exports = async function initGitRepo(cwd, emitter) {
  const [hasGit, isGitRepo] = await Promise.all([
    tryExecGit(cwd, ["--version"]),
    tryExecGit(cwd, ["rev-parse", "--is-inside-work-tree"])
  ]);

  if (hasGit && !isGitRepo) {
    emitter.emit("init");
    await execGit(cwd, ["init"]);
    await execGit(cwd, ["add", "."]);
    await execGit(cwd, ["commit", "-m", `"${commitMessage}"`]);
  }
};

async function tryExecGit(cwd, args) {
  try {
    await execGit(cwd, args);
    return true;
  } catch (_) {
    return false;
  }
}

function execGit(cwd, args) {
  return exec(cwd, "git", args);
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
