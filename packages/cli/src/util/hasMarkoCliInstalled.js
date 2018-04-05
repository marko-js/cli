function dependenciesHasMarkoCli(dependencies) {
  if (dependencies) {
    const packageNames = Object.keys(dependencies);
    for (const packageName of packageNames) {
      if (packageName === "marko-cli") {
        return true;
      }
    }
  }

  return false;
}

module.exports = function(pkg) {
  if (dependenciesHasMarkoCli(pkg.dependencies)) {
    return true;
  }

  if (dependenciesHasMarkoCli(pkg.devDependencies)) {
    return true;
  }

  return false;
};
