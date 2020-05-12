const spawn = require("child_process").spawn;

module.exports = function exec(cwd, bin, args) {
  return new Promise((resolve, reject) => {
    spawn(bin, args, {
      cwd,
      shell: true,
      stdio: "ignore",
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
