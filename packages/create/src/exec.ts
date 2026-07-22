import { spawn } from "node:child_process";

export interface ExecOptions {
  /**
   * Run the command through a shell. Required for package-manager binaries on
   * Windows (`npm.cmd`, etc.). When enabled the command is passed as a single
   * string rather than an args array to avoid Node's DEP0190 warning, so only
   * use it with internally-controlled arguments.
   */
  shell?: boolean;
  /**
   * Capture stdout/stderr instead of inheriting them. The combined output is
   * attached to the rejection as `ExecError.output` so callers can surface it
   * only when something actually goes wrong.
   */
  capture?: boolean;
}

export interface ExecError extends Error {
  output?: string;
}

/**
 * Run a command to completion. Resolves on a `0` exit code and rejects
 * otherwise. Inherits stdio by default; pass `capture` to buffer it instead.
 */
export function exec(
  cwd: string,
  bin: string,
  args: string[],
  { shell = false, capture = false }: ExecOptions = {},
): Promise<void> {
  return new Promise((resolve, reject) => {
    const stdio = capture ? "pipe" : "inherit";
    const child = shell
      ? spawn([bin, ...args].join(" "), {
          cwd,
          shell: true,
          stdio,
          windowsHide: true,
        })
      : spawn(bin, args, { cwd, stdio, windowsHide: true });

    let output = "";
    if (capture) {
      child.stdout?.on("data", (chunk) => (output += chunk));
      child.stderr?.on("data", (chunk) => (output += chunk));
    }

    child.once("error", reject).once("close", (code) => {
      if (code) {
        const error: ExecError = new Error(
          `${bin} ${args.join(" ")} exited with code ${code}`,
        );
        error.output = output;
        reject(error);
      } else {
        resolve();
      }
    });
  });
}
