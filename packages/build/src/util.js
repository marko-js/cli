const path = require("path");
const resolveFrom = require("resolve-from");
const fastGlob = require("fast-glob");

const useAppModuleOrFallback = (dir, moduleName) => {
  const packageName = `${moduleName}/package`;
  const packagePath =
    resolveFrom.silent(dir, packageName) || require.resolve(packageName);
  return path.dirname(packagePath);
};

const getDirectoryLookup = async (cwd, ignore) => {
  const lookup = {};
  const filenames = await fastGlob(["**/*.marko"], { cwd, ignore });

  for (let filename of filenames) {
    const normalized = filename
      .replace(/(^|\/)(?:index\/(?=index\.marko$))?([^/]+)?\.marko$/, "$1$2")
      .replace(/\\/g, "/");
    lookup[normalized] = path.join(cwd, filename);
  }

  return lookup;
};

const getRouterCode = async (cwd, ignore) => {
  const tree = {};
  const imports = [];
  const directoryLookup = await getDirectoryLookup(cwd, ignore);
  for (let key in directoryLookup) {
    const varName =
      "page__" + key.replace(/\//g, "__").replace(/[^a-z0-9$_]/g, "$");
    const pathParts = key.split("/");
    const absolute = directoryLookup[key];
    let dir = tree;
    for (let part of pathParts.slice(0, -1)) {
      let dirs = (dir.dirs = dir.dirs || {});
      dir = dirs[part] = dirs[part] || {};
    }
    let files = (dir.files = dir.files || {});
    files[pathParts[pathParts.length - 1]] = { key, varName };
    imports.push(`const ${varName} = () => import(
      /* webpackMode: "lazy-once" */
      /* webpackChunkName: ${JSON.stringify(key)} */
      ${JSON.stringify(absolute)}
    );`);
  }

  // When new .marko files are added, we want to recompute the router code
  const watchContext = `
    (_ => import(
      /* webpackInclude: /\\.marko$/ */
      /* webpackExclude: /node_modules|build/ */
      /* webpackMode: "weak" */
      \`${cwd + path.sep}\${_}\`
    ));
  `;

  return watchContext + `\n` + buildRouter(imports, tree);
};

const buildRouter = (imports, tree) => `
const $$index = () => import(
  /* webpackMode: "lazy-once" */
  ${JSON.stringify(require.resolve("./files/dir-index.marko"))}
);
${imports.join("\n")}

function getRoute(url) {
  const normalized = url.replace(/^\\/|(\\/|(\\/index)?(\\.marko|\\.html)?)$/g, '');
  const pathParts = normalized === '' ? [] : normalized.split('/');

  if ('/' + normalized !== url) {
    return {
      redirect:true,
      path: '/' + normalized
    }
  }

  const params = {};

  ${buildRoute(tree).trim()}
}

global.GET_ROUTE = getRoute;
`;

const paramPattern = /^:([^/]+)$/;

const buildRoute = (dir, level = 0) => {
  const ifs = [];
  const indent = "  ".repeat(level + 1);
  let partDeclaration = `${indent}const part_${level} = pathParts[${level}];\n`;
  let needsPart = false;

  if (dir.dirs) {
    for (let key in dir.dirs) {
      const childDir = dir.dirs[key];
      const paramMatch = paramPattern.exec(key);
      if (!paramMatch) {
        ifs.unshift(
          `if (part_${level} === ${JSON.stringify(key)}) {\n${buildRoute(
            childDir,
            level + 1
          )}\n${indent}}`
        );
        needsPart = true;
      } else {
        const paramName = paramMatch[1];
        ifs.push(
          `if (true) {\n${indent}  params[${JSON.stringify(
            paramName
          )}] = part_${level};\n${buildRoute(childDir, level + 1)}\n${indent}}`
        );
      }
    }
  }

  if (dir.files) {
    for (let key in dir.files) {
      const file = dir.files[key];
      const partMatch = `part_${level} === ${JSON.stringify(
        key === "index" ? undefined : key
      )}`;
      const paramMatch = paramPattern.exec(key);
      if (!paramMatch) {
        ifs.unshift(
          `if (${partMatch}) {\n${indent}  return { params, load:${file.varName} };\n${indent}}`
        );
        needsPart = true;
      } else {
        const paramName = paramMatch[1];
        ifs.push(
          `if (true) {\n${indent}  params[${JSON.stringify(
            paramName
          )}] = part_${level};\n${indent}  return { params, load:${
            file.varName
          } };\n${indent}}`
        );
      }
    }
  }

  if (!dir.files || !dir.files["index"]) {
    const dirs = Object.keys(dir.dirs || {});
    const files = Object.keys(dir.files || {});
    ifs.push(
      `if (part_${level} === undefined) {\n${indent}  return { load:$$index, params:{ dirs:${JSON.stringify(
        dirs
      )}, files:${JSON.stringify(files)} } };\n${indent}}`
    );
    needsPart = true;
  }

  return (needsPart ? partDeclaration : "") + indent + ifs.join(" else ");
};

module.exports = {
  useAppModuleOrFallback,
  getDirectoryLookup,
  getRouterCode
};
