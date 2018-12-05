"use strict";

import fs from "fs";
import glob from "glob";
import path from "path";
import lassoPackageRoot from "lasso-package-root";
import markoPrettyprint from "@marko/prettyprint";
import resolveFrom from "resolve-from";

const defaultGlobOptions = {
  matchBase: true,
  absolute: true,
  ignore: ["node_modules/**"]
};

function getPackageRoot(dir) {
  const rootPackage = lassoPackageRoot.getRootPackage(dir);
  return (rootPackage && rootPackage.__dirname) || dir;
}

function requireFromRoot(path, packageRoot) {
  let resolvedPath;

  try {
    resolvedPath = resolveFrom(packageRoot, path);
  } catch (e) {
    // Ignore
  }

  return resolvedPath ? require(resolvedPath) : require(path);
}

async function getFiles(patterns, globOptions) {
  let allFiles = []
  await Promise.all(
    patterns.map(
      pattern =>
        new Promise((resolve, reject) => {
          if (pattern === '.') {
            pattern = "**/*";
          } else if (pattern[pattern.length-1] === '/') {
            pattern += "**/*";
          }
          glob(pattern, globOptions, function(err, files) {
            if (err) return reject(err);

            allFiles.push(...files);
          });
        })
    )
  );
  return allFiles;
}

export default async function(options = {}) {
  let { dir, ignore, patterns } = options;

  if (!patterns || !patterns.length) {
    patterns = ["**/*.marko"];
  }

  dir = dir || process.cwd();

  const packageRoot = getPackageRoot(dir);
  const markoCompiler = requireFromRoot("marko/compiler", packageRoot);

  if (!markoCompiler.parse) {
    const markoVersion = requireFromRoot("marko/package", packageRoot).version;
    throw new Error(`The version of marko installed (${markoVersion}) does not support migrations. Please update to 4.14.0 or higher.`);
  }

  const globOptions = {
    ...defaultGlobOptions,
    cwd: dir || process.cwd()
  };

  if (ignore) {
    globOptions.ignore = ignore;
  }

  const files = await getFiles(patterns, globOptions);

  for (let file of files) {
    const basename = path.basename(file);
    if (basename.endsWith(".marko")) {
      const source = fs.readFileSync(file);
      const ast = markoCompiler.parse(source, file, { migrate:true, raw:true });
      const migratedSource = markoPrettyprint.prettyPrintAST(ast, {
        syntax: options.syntax,
        maxLen: options.maxLen,
        noSemi: options.noSemi,
        singleQuote: options.singleQuote,
        filename: file
      });
      fs.writeFileSync(migratedSource, file, 'utf-8');
    }
  }
};
