"use strict";

import fs from "mz/fs";
import path from "path";
import lassoPackageRoot from "lasso-package-root";
import markoPrettyprint from "@marko/prettyprint";
import resolveFrom from "resolve-from";
import getFiles from "./util/get-files";
import MigrateHelper, {
  addMigration,
  runAutoMigrations
} from "./util/migrate-helper";
import addDefaultMigrations from "./util/default-migrations";

const defaultGlobOptions = {
  matchBase: true,
  absolute: true,
  ignore: ["node_modules/**"]
};

export default async function(options = {}) {
  let { dir, ignore, files: filePatterns, prompt } = options;

  if (!filePatterns || !filePatterns.length) {
    filePatterns = ["**/*.marko"];
  }

  if (typeof prompt !== "function") {
    throw new Error("The 'prompt' option is required.");
  }

  dir = dir || process.cwd();

  const packageRoot = getPackageRoot(dir);
  const markoCompiler = requireFromRoot("marko/compiler", packageRoot);

  if (!markoCompiler.parse) {
    const markoVersion = requireFromRoot("marko/package", packageRoot).version;
    throw new Error(
      `The version of marko installed (${markoVersion}) does not support migrations. Please update to 4.14.0 or higher.`
    );
  }

  const globOptions = {
    ...defaultGlobOptions,
    cwd: dir || process.cwd()
  };

  if (ignore) {
    globOptions.ignore = ignore;
  }

  const files = await getFiles(filePatterns, globOptions);
  const updatedFiles = {};
  const movedFiles = {};

  await Promise.all(
    files.map(async file => {
      const basename = path.basename(file);
      if (basename.endsWith(".marko")) {
        const migrateHelper = new MigrateHelper(options.prompt);
        const add = migrateOptions =>
          addMigration(migrateHelper, migrateOptions);
        const source = await fs.readFile(file, "utf-8");
        const ast = markoCompiler.parse(source, file, {
          onContext(ctx) {
            ctx.addMigration = add;
            addDefaultMigrations(ctx, updatedFiles, movedFiles);
          },
          migrate: true,
          raw: true
        });

        await runAutoMigrations(migrateHelper);

        updatedFiles[file] = markoPrettyprint.prettyPrintAST(ast, {
          syntax: options.syntax,
          maxLen: options.maxLen,
          noSemi: options.noSemi,
          singleQuote: options.singleQuote,
          filename: file
        });
      }
    })
  );

  return {
    moved: movedFiles,
    updated: updatedFiles
  };
}

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
