const spawn = require("child_process").spawn;

module.exports = function exec(cwd, bin, args) {
  return new Promise((resolve, reject) => {
    // Pass a single command string rather than (bin, args) with `shell: true`.
    // Passing an args array together with `shell: true` triggers Node's DEP0190
    // deprecation warning. bin/args are always internally controlled here.
    spawn([bin, ...args].join(" "), {
      cwd,
      shell: true,
      stdio: "inherit",
      windowsHide: true
    })
      .once("error", reject)
      .once("close", code => {
        if (code) {
          return reject(
            new Error(`${bin} ${args.join(" ")} exited with code ${code}`)
          );
        }

        resolve();
      });
  });
};
