import path from "path";
import autotest from "mocha-autotest";
import migrate from "../src";

const CWD = process.cwd();

describe("scope(migrate)", () => {
  autotest("fixtures", async ({ dir, test, snapshot }) => {
    test(async () => {
      const { updated, moved } = await migrate({
        prompt() {},
        ignore: ["**/snapshot-*.*"],
        files: [`${dir}/**/*.marko`]
      });

      snapshot(
        Object.entries(updated)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(
            ([file, source]) =>
              `<!-- ${path.relative(CWD, file)}${
                moved[file] ? ` => ${path.relative(CWD, moved[file])}` : ""
              } -->\n\n${source}`
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
