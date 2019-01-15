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
  const {
    dir = process.cwd(),
    files: filePatterns = ["**/*.marko"],
    ignore,
    prompt,
    onWriteFile,
    onRenameFile,
    onUpdateDependents
  } = options;

  if (!prompt) {
    throw new Error("The 'prompt' option is required.");
  }

  if (!onWriteFile) {
    throw new Error("The 'onWriteFile' option is required.");
  }

  if (!onRenameFile) {
    throw new Error("The 'onRenameFile' option is required.");
  }

  if (!onUpdateDependents) {
    throw new Error("The 'onUpdateDependents' option is required.");
  }

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
    cwd: dir
  };

  if (ignore) {
    globOptions.ignore = ignore;
  }

  const files = await getFiles(filePatterns, globOptions);

  for (const file of files) {
    const basename = path.basename(file);
    if (basename.endsWith(".marko")) {
      console.log(`\nMigrating: ${path.relative(dir, file)}\n`);

      const prettyPrintOptions = {
        syntax: options.syntax,
        maxLen: options.maxLen,
        noSemi: options.noSemi,
        singleQuote: options.singleQuote,
        filename: file
      };
      const migrateHelper = new MigrateHelper(prompt);
      const add = migrateOptions => addMigration(migrateHelper, migrateOptions);
      const source = await fs.readFile(file, "utf-8");
      const fileNameUpdates = [];
      const dependentUpdates = [];
      const ast = markoCompiler.parse(source, file, {
        onContext(ctx) {
          prettyPrintOptions.context = ctx;
          ctx.addMigration = add;
          addDefaultMigrations(ctx, {
            onWriteFile,
            onRenameFile(from, to) {
              fileNameUpdates.push(onRenameFile.bind(null, from, to));
            },
            onUpdateDependents(from, to) {
              dependentUpdates.push(onUpdateDependents.bind(null, from, to));
            }
          });
        },
        migrate: true,
        raw: true
      });

      await runAutoMigrations(migrateHelper);
      await onWriteFile(
        file,
        markoPrettyprint.prettyPrintAST(ast, prettyPrintOptions)
      );

      // Run renames and dependent updates after any file migrations.
      for (const fileNameUpdate of fileNameUpdates) {
        await fileNameUpdate();
      }

      for (const dependentUpdate of dependentUpdates) {
        await dependentUpdate();
      }

      console.log();
    }
  }
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
