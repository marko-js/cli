const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");
const resolveFrom = require("resolve-from");
const fastGlob = require("fast-glob");
const parseUrl = require("url").parse;
const through = require("through2");
const toString = require("stream-to-string");
const getHrefs = require("get-hrefs");

const useAppModuleOrFallback = (dir, moduleName) => {
  const packageName = `${moduleName}/package`;
  const packagePath =
    resolveFrom.silent(dir, packageName) || require.resolve(packageName);
  return path.dirname(packagePath);
};

const getDirectoryLookup = async (cwd, ignore) => {
  const lookup = {};
  const filenames = await fastGlob(["**/*.marko"], { cwd, ignore });

  for (const filename of filenames) {
    let normalized = filename;

    if (path.sep === "\\") {
      normalized = filename.replace(/\\/g, "/");
    }

    normalized = normalized.replace(
      /(^|\/)(?:index\/(?=index\.marko$))?([^/]+)?\.marko$/,
      "$1$2"
    );
    lookup[normalized] = path.join(cwd, filename);
  }

  return lookup;
};

const getRouterCode = async (cwd, ignore, production) => {
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
    imports.push(`import ${varName} from ${JSON.stringify(absolute)};`);
  }

  // If we're in watch mode (not production),
  // When new .marko files are added, we want to recompute the router code
  const watchContext = production
    ? ""
    : `
    (_ => import(
      /* webpackInclude: /\\.marko$/ */
      /* webpackExclude: /node_modules|components|build/ */
      /* webpackMode: "weak" */
      ${JSON.stringify(cwd + path.sep)}
    ));
  `;

  return watchContext + `\n` + buildRouter(imports, tree);
};

const buildRouter = (imports, tree) => `
import $$index from ${JSON.stringify(
  require.resolve("./files/dir-index.marko")
)};
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
          `if (${partMatch}) {\n${indent}  return { params, template:${file.varName} };\n${indent}}`
        );
        needsPart = true;
      } else {
        const paramName = paramMatch[1];
        ifs.push(
          `if (true) {\n${indent}  params[${JSON.stringify(
            paramName
          )}] = part_${level};\n${indent}  return { params, template:${
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
      `if (part_${level} === undefined) {\n${indent}  return { template:$$index, params:{ dirs:${JSON.stringify(
        dirs
      )}, files:${JSON.stringify(files)} } };\n${indent}}`
    );
    needsPart = true;
  }

  return (needsPart ? partDeclaration : "") + indent + ifs.join(" else ");
};

const buildStaticSite = async options => {
  const outputPath = path.resolve(process.cwd(), options.output || "build");
  const { routes } = require(path.join(outputPath, "middleware.js"));

  if ((await fs.statSync(options.entry)).isDirectory()) {
    const cache = new Set();
    await Promise.all(
      Object.values(
        await getDirectoryLookup(options.entry, [
          outputPath,
          "**/node_modules",
          "**/components"
        ])
      ).map(async file => {
        const url =
          "/" +
          path
            .relative(options.entry, file)
            .replace(/\\/g, "/")
            .replace(/.marko$/, "")
            .replace(/(^|\/)index(?=\/|$)/g, "")
            .replace(/\/$/, "");
        if (!url.includes("/:")) {
          await buildStaticPage(url, cache, routes, outputPath);
        }
      })
    );
  } else {
    await buildStaticPage("/", new Set(), routes, outputPath);
  }

  // if (stats) {
  //   const serverStats = stats.stats.find(stats =>
  //     stats.compilation.name.includes("Server")
  //   );
  //   const serverFiles = serverStats.compilation.chunks
  //     .map(chunk => chunk.files)
  //     .reduce((all, next) => all.concat(next));
  //   serverFiles.forEach(fileName => {
  //     fs.unlinkSync(path.join(outputPath, fileName));
  //   });
  // }
};

const buildStaticPage = async (url, cache, routes, outputPath) => {
  if (!cache.has(url)) {
    cache.add(url);
    const filePath = path.join(outputPath, getFileName(url));
    const request = { url, headers: {} };
    const response = Object.assign(through(), { setHeader() {} });
    routes(request, response, () => {});
    const html = await toString(response);
    const links = getHrefs(html)
      .map(href => {
        const { host, path } = parseUrl(href);
        return host ? false : path;
      })
      .filter(Boolean);

    await mkdirp(path.dirname(filePath));
    await fs.promises.writeFile(filePath, html);

    await Promise.all(
      links.map(link => buildStaticPage(link, cache, routes, outputPath))
    );
  }
};

const getFileName = url => {
  return url + (url[url.length - 1] === "/" ? "index.html" : ".html");
};

module.exports = {
  useAppModuleOrFallback,
  getDirectoryLookup,
  getRouterCode,
  buildStaticSite
};
