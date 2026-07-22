import { spawn } from "node:child_process";

export interface ExecOptions {
  /**
   * Run the command through a shell. Required for package-manager binaries on
   * Windows (`npm.cmd`, etc.). When enabled the command is passed as a single
   * string rather than an args array to avoid Node's DEP0190 warning, so only
   * use it with internally-controlled arguments.
   */
  shell?: boolean;
}

/**
 * Run a command, inheriting stdio so its output is visible to the user.
 * Resolves on a `0` exit code and rejects otherwise.
 */
export function exec(
  cwd: string,
  bin: string,
  args: string[],
  { shell = false }: ExecOptions = {},
): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = shell
      ? spawn([bin, ...args].join(" "), {
          cwd,
          shell: true,
          stdio: "inherit",
          windowsHide: true,
        })
      : spawn(bin, args, { cwd, stdio: "inherit", windowsHide: true });

    child.once("error", reject).once("close", (code) => {
      if (code) {
        reject(new Error(`${bin} ${args.join(" ")} exited with code ${code}`));
      } else {
        resolve();
      }
    });
  });
}
