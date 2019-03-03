const path = require("path");
const resolveFrom = require("resolve-from");
const fastGlob = require("fast-glob");

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

const getDirectoryLookup = async (cwd, ignore = []) => {
  const lookup = {};
  const filenames = await fastGlob(["**/*.marko"], { cwd, ignore });

  for (let filename of filenames) {
    const normalized = filename.replace(".marko", "").replace(/\\/g, "/");
    lookup[normalized] = path.join(cwd, filename);
  }

  return lookup;
};

const getRouterCode = async (cwd, ignore) => {
  const tree = {};
  const varNames = [];
  const imports = [];
  const directoryLookup = await getDirectoryLookup(cwd, ignore);
  for (let key in directoryLookup) {
    const varName = "page__" + key.replace(/\//g, "__");
    const pathParts = key.split("/");
    const absolute = directoryLookup[key];
    let dir = tree;
    for (let part of pathParts.slice(0, -1)) {
      let dirs = (dir.dirs = dir.dirs || {});
      dir = dirs[part] = dirs[part] || {};
    }
    let files = (dir.files = dir.files || {});
    files[pathParts[pathParts.length - 1]] = { key, varName };
    varNames.push(varName);
    imports.push(`const ${varName} = require(${JSON.stringify(absolute)});`);
  }

  return buildRouter(imports, varNames, tree);
};

const buildRouter = (imports, varNames, tree) => `
const $$index = require(${JSON.stringify(
  require.resolve("./files/dir-index.marko")
)});
${imports.join("\n")}

const paramDefs = new Map();

[${varNames.join(", ")}].forEach(template => {
  paramDefs.set(template, []);
});

function getRoute(url) {
  const normalized = url.replace(/^\\/|(\\/|(\\/index)?(\\.marko|\\.html)?)$/g, '');
  const pathParts = normalized === '' ? [] : normalized.split('/');

  ${buildRoute(tree).trim()}
}

function getParams(template, parts) {
  const def = paramDefs.get(template);
  if(def.length === parts.length) {
    const params = {};
    for(let i = 0; i < def.length; i++) {
      const paramDef = def[i];
      const value = parts[i];
      if (def.pattern && !def.pattern.test(value)) return;
      params[def.name] = value;
    }
    return params;
  }
}

global.GET_ROUTE = getRoute;
`;

const buildRoute = (dir, level = 0) => {
  const ifs = [];
  const indent = "  ".repeat(level + 1);
  let partDeclaration = `${indent}const part_${level} = pathParts[${level}];\n`;
  let needsPart = false;

  if (dir.dirs) {
    for (let key in dir.dirs) {
      const childDir = dir.dirs[key];
      ifs.push(
        `if (part_${level} === ${JSON.stringify(key)}) {\n${buildRoute(
          childDir,
          level + 1
        )}\n${indent}}`
      );
      needsPart = true;
    }
  }

  if (dir.files) {
    for (let key in dir.files) {
      const file = dir.files[key];
      const partMatch =
        key === "index" ? "true" : `part_${level} === ${JSON.stringify(key)}`;
      const paramMatch = `(params = getParams(${
        file.varName
      }, pathParts.slice(${level + (key === "index" ? 0 : 1)})))`;
      const query =
        key === "index" ? paramMatch : `${partMatch} && ${paramMatch}`;
      ifs.push(
        `if (${query}) {\n${indent}  return { key:${JSON.stringify(
          file.key
        )}, params, template:${file.varName} };\n${indent}}`
      );
      if (key !== "index") {
        needsPart = true;
      }
    }
  }

  if (!dir.files || !dir.files["index"]) {
    const dirs = Object.keys(dir.dirs || {});
    const files = Object.keys(dir.files || {});
    ifs.push(
      `if (part_${level} === undefined) {\n${indent}  return { key:'$$index', template:$$index, params:{ dirs:${JSON.stringify(
        dirs
      )}, files:${JSON.stringify(files)} } };\n${indent}}`
    );
    needsPart = true;
  }

  return (needsPart ? partDeclaration : "") + indent + ifs.join(" else ");
};

module.exports = {
  useAppModuleOrFallback,
  createResolvablePromise,
  getDirectoryLookup,
  getRouterCode
};
