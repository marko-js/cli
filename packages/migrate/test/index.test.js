import path from "path";
import autotest from "mocha-autotest";
import migrate from "../src";

const CWD = process.cwd();

describe("scope(migrate)", () => {
  autotest("fixtures", async ({ dir, test, snapshot }) => {
    test(async () => {
      const outputs = await migrate({
        ignore: ["**/snapshot-*.*"],
        patterns: [`${dir}/**/*.marko`]
      });

      snapshot(
        Object.entries(outputs)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(
            ([file, source]) =>
              `<!-- ${path.relative(CWD, file)} -->\n\n${source}`
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
