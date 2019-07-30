const onExit = require("async-exit-hook");
let handlers;
onExit(done => run().then(() => done(), done));

/**
 * Functions provided as arguments are guaranteed to be ran on the exit of the process.
 * If this function is called without any arguments then all pending functions are invoked.
 *
 * @param {...Function} fns A List of functions to ensure are called.
 */
module.exports = (...fns) => {
  if (fns.length) {
    handlers = handlers ? handlers.concat(fns) : fns;
  } else {
    return run();
  }
};

function run() {
  if (handlers) {
    const pending = handlers.reverse();
    handlers = undefined;
    return Promise.all(pending.map(fn => fn()));
  }

  return Promise.resolve();
}
