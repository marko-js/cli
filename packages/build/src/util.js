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
    let current = tree;
    for (let part of pathParts) {
      if (part !== "index") {
        let children = (current.children = current.children || {});
        current = children[part] = children[part] || {};
      }
    }
    current.key = key;
    current.varName = varName;
    varNames.push(varName);
    imports.push(`const ${varName} = require(${JSON.stringify(absolute)});`);
  }

  return buildRouter(imports, varNames, tree);
};

const buildRouter = (imports, varNames, tree) => `
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

const buildRoute = (tree, level = 0) => {
  const ifs = [];
  const indent = "  ".repeat(level + 1);
  let partDeclaration = "";
  if (tree.children) {
    partDeclaration = `${indent}const part_${level} = pathParts[${level}];\n`;
    for (let key in tree.children) {
      const childTree = tree.children[key];
      ifs.push(
        `if (part_${level} === ${JSON.stringify(key)}) {\n${buildRoute(
          childTree,
          level + 1
        )}\n${indent}}`
      );
    }
  }
  if (tree.key) {
    const query = `(params = getParams(${tree.varName}, pathParts${
      level === 0 ? "" : `.slice(${level})`
    }))`;
    ifs.push(
      `if (${query}) {\n${indent}  return { key:${JSON.stringify(
        tree.key
      )}, params, template:${tree.varName} };\n${indent}}`
    );
  }

  return partDeclaration + indent + ifs.join(" else ");
};

module.exports = {
  useAppModuleOrFallback,
  createResolvablePromise,
  getDirectoryLookup,
  getRouterCode
};
