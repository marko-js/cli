import type { EventEmitter } from "node:events";

import { exec } from "./exec.js";

const COMMIT_MESSAGE = "initial commit from @marko/create";

/**
 * Initialize a git repository with an initial commit, if git is available and
 * the target is not already inside a repository.
 */
export async function initGitRepo(
  cwd: string,
  emitter: EventEmitter,
): Promise<void> {
  const [hasGit, insideRepo] = await Promise.all([
    tryGit(cwd, ["--version"]),
    tryGit(cwd, ["rev-parse", "--is-inside-work-tree"]),
  ]);

  if (hasGit && !insideRepo) {
    emitter.emit("init");
    await git(cwd, ["init"]);
    await git(cwd, ["add", "."]);

    if (!(await tryGit(cwd, ["commit", "-m", COMMIT_MESSAGE]))) {
      // Fall back to an explicit author if the user has no git identity set.
      await git(cwd, [
        "commit",
        "--author",
        "Marko JS <markojs.com>",
        "-m",
        COMMIT_MESSAGE,
      ]);
    }
  }
}

// Capture git's output so internal probes (e.g. `rev-parse` printing
// "fatal: not a git repository") don't leak to the user.
const git = (cwd: string, args: string[]) =>
  exec(cwd, "git", args, { capture: true });

async function tryGit(cwd: string, args: string[]): Promise<boolean> {
  try {
    await git(cwd, args);
    return true;
  } catch {
    return false;
  }
}
