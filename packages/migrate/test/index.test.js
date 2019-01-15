import path from "path";
import autotest from "mocha-autotest";
import migrate from "../src";

const CWD = process.cwd();

describe("scope(migrate)", () => {
  autotest("fixtures", async ({ dir, test, snapshot }) => {
    test(async () => {
      const fileContents = {};
      const fileNames = {};
      const dependentPaths = {};

      await migrate({
        ignore: ["**/snapshot-*.*"],
        files: [`${dir}/**/*.marko`],
        prompt() {},
        onWriteFile(file, contents) {
          fileContents[file] = contents;
        },
        onRenameFile(from, to) {
          fileNames[from] = to;
        },
        onUpdateDependents(from, to) {
          dependentPaths[from] = to;
        }
      });

      snapshot(
        Object.entries(fileContents)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(
            ([file, source]) =>
              `<!-- ${path.relative(CWD, file)}${
                fileNames[file]
                  ? ` => ${path.relative(CWD, fileNames[file])}`
                  : ""
              } -->\n\n${source}`
          )
          .concat(
            Object.entries(dependentPaths)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(
                ([from, to]) =>
                  `<!-- dependents: ${path.relative(
                    CWD,
                    from
                  )} => ${path.relative(CWD, to)} -->`
              )
          )
          .join("\n\n"),
        {
          ext: ".marko",
          name: "snapshot"
        }
      );
    });
  });
});
