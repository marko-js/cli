"use strict";

import fs from "mz/fs";
import path from "path";
import chalk from "chalk";
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
  const errors = {};
  let foundCount = 0;
  let updateCount = 0;

  for (const file of files) {
    const basename = path.basename(file);
    if (basename.endsWith(".marko")) {
      foundCount++;
      const relativePath = path.relative(dir, file);
      try {
        const prettyPrintOptions = {
          syntax: options.syntax,
          maxLen: options.maxLen,
          noSemi: options.noSemi,
          singleQuote: options.singleQuote,
          filename: file
        };
        const migrateHelper = new MigrateHelper(prompt);
        const add = migrateOptions =>
          addMigration(migrateHelper, migrateOptions);
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

        let prettyOriginalSource;
        const migratedSource = markoPrettyprint.prettyPrintAST(
          ast,
          prettyPrintOptions
        );

        try {
          prettyOriginalSource = markoPrettyprint.prettyPrintSource(
            source,
            prettyPrintOptions
          );
        } catch (e) {
          // prettyprinting is only used to check if the template changed
          // if the original source fails to print for some reason, but the
          // migration was successful, that's fine.
        }

        if (
          migratedSource !== prettyOriginalSource ||
          fileNameUpdates.length ||
          dependentUpdates.length
        ) {
          await onWriteFile(file, migratedSource);

          // Run renames and dependent updates after any file migrations.
          for (const fileNameUpdate of fileNameUpdates) {
            await fileNameUpdate();
          }

          for (const dependentUpdate of dependentUpdates) {
            await dependentUpdate();
          }

          updateCount++;

          console.log(relativePath);
        } else {
          console.log(chalk.dim(relativePath));
        }
      } catch (e) {
        errors[relativePath] = e;
        console.log(chalk.red(relativePath));
      }
    }
  }

  if (foundCount) {
    const errorEntries = Object.entries(errors);
    if (errorEntries.length) {
      for (let [path, error] of errorEntries) {
        console.error("\n" + chalk.red(path) + "\n" + error);
      }
      console.log(
        chalk.bold.red(
          `\nMigrated ${updateCount} of ${foundCount} component(s) with ${
            errorEntries.length
          } error(s)`
        )
      );
    } else {
      console.log(
        chalk.bold.green(
          `\nMigrated ${updateCount} of ${foundCount} component(s)!`
        )
      );
    }
  } else {
    console.log(chalk.bold.yellow(`No components found!`));
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
