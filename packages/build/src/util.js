const path = require("path");
const resolveFrom = require("resolve-from");

const useAppModuleOrFallback = (dir, moduleName) => {
  const packageName = `${moduleName}/package`;
  const packagePath =
    resolveFrom.silent(dir, packageName) || require.resolve(packageName);
  return path.dirname(packagePath);
};

const createResolvablePromise = () => {
  let _resolve;
  const promise = new Promise(resolve => (_resolve = resolve));
  promise.resolve = _resolve;
  return promise;
};

module.exports = {
  useAppModuleOrFallback,
  createResolvablePromise
};
