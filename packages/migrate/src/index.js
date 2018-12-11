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
import addFileMigrations from "./util/file-migrations";

const defaultGlobOptions = {
  matchBase: true,
  absolute: true,
  ignore: ["node_modules/**"]
};

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

  const files = await getFiles(patterns, globOptions);
  const migratedFiles = {};

  await Promise.all(
    files.map(async file => {
      const basename = path.basename(file);
      if (basename.endsWith(".marko")) {
        const migrateHelper = new MigrateHelper();
        const add = opts => addMigration(migrateHelper, opts);
        const source = await fs.readFile(file, "utf-8");
        const ast = markoCompiler.parse(source, file, {
          onContext(ctx) {
            ctx.addMigration = add;
            addFileMigrations(ctx, migratedFiles);
          },
          migrate: true,
          raw: true
        });

        await runAutoMigrations(migrateHelper);

        migratedFiles[file] = markoPrettyprint.prettyPrintAST(ast, {
          syntax: options.syntax,
          maxLen: options.maxLen,
          noSemi: options.noSemi,
          singleQuote: options.singleQuote,
          filename: file
        });
      }
    })
  );

  return migratedFiles;
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
