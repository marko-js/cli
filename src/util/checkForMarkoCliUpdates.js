const updateNotifier = require('update-notifier');
const path = require('path');
const hasMarkoCliInstalled = require('./hasMarkoCliInstalled');

module.exports = () => {
  // We assume that `marko-cli` is installed globally by default
  // but we will change this to false if we find that `marko-cli`
  // has been installed into the project's package.json.
  let isGlobal = true;

  // Find the project directory (if `marko-cli` is linked in then
  // this may return the directory where `marko-cli` is located)
  const projectDir = require('app-root-dir').get();
  const markoCliPackage = require('../../package.json');

  try {
    const projectPackage = require(path.join(projectDir, 'package.json'));
    if (projectPackage.name !== 'marko-cli') {
      isGlobal = !hasMarkoCliInstalled(projectPackage);
    }
  } catch (err) {
    // ignore this because it probably means that the project doesn't
    // have a package.json file
  }

  const notifier = updateNotifier({
    pkg: markoCliPackage,
    updateCheckInterval: 0
  });

  // Print out a message if we detect that this version of `marko-cli`
  // is out-of-date.
  notifier.notify({
    defer: true,
    isGlobal
  });
};
