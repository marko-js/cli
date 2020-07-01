import fs from "fs";
import autotest from "mocha-autotest";
import puppeteer from "puppeteer";
import cluster from "cluster";
import { copy, remove } from "fs-extra";
import { run } from "../src/cli";
import { loadWebpackConfig } from "../../build/src/index";
import webpack from "webpack";

describe("scope(serve)", function() {
  this.slow(20000);
  this.timeout(60000);
  autotest("fixtures", {
    serve: createTest(async options => {
      const server = await run({ noBrowser: true, ...options });
      return () => new Promise(resolve => server.close(resolve));
    }),
    build: createTest(async (options, { resolve }) => {
      const outputPath = resolve("dist");

      await new Promise((resolve, reject) => {
        webpack(
          loadWebpackConfig({ output: outputPath, ...options })
        ).run(err => (err ? reject(err) : resolve()));
      });

      cluster.setupMaster({
        exec: outputPath,
        execArgv: []
      });

      let server;

      await new Promise(resolve => {
        server = cluster.fork({ ...process.env, PORT: options.port });
        server.once("listening", resolve);
      });

      return () =>
        new Promise(resolve => {
          server.on("exit", resolve);
          server.kill();
        });
    })
  });
});

function createTest(createServer) {
  return ({ resolve, test, snapshot, mode }) => {
    test(async () => {
      let browser, closeServer, backupPath, targetPath;
      try {
        const mainPath = resolve("test.js");
        const hasMainFile = fs.existsSync(mainPath);
        const targetFilePath = resolve("target.marko");
        const targetDirPath = resolve("target");
        const hasTargetDir = fs.existsSync(targetDirPath);

        let options = { port: 8378 };
        let main;

        if (hasMainFile) {
          main = require(mainPath);
          options = Object.assign(options, main.options);
        }

        options.entry = targetPath = hasTargetDir
          ? targetDirPath
          : targetFilePath;

        closeServer = await createServer(options, { resolve });
        browser = await puppeteer.launch();
        const page = await browser.newPage();
        const screenshot = screenshotUtility.bind(
          null,
          page,
          mode,
          snapshot,
          resolve
        );
        await page.goto(
          `http://localhost:${options.port}${(main && main.path) || "/"}`,
          { waitUntil: "networkidle2" }
        );

        await screenshot();

        if (main && main.test) {
          await copy(targetPath, (backupPath = resolve("backup")));
          await main.test({
            page,
            screenshot,
            snapshot,
            targetPath,
            isBuild: mode === "build"
          });
        }
      } finally {
        if (browser) await browser.close();
        if (closeServer) await closeServer();
        if (backupPath) {
          await remove(targetPath);
          await copy(backupPath, targetPath);
          await remove(backupPath);
        }
      }
    });
  };
}

async function screenshotUtility(page, mode, snapshot, resolve, name, element) {
  const target = element || (await page.$("body"));
  const nameWithMode = `${name || ""}${name && mode ? "-" : ""}${mode || ""}`;
  const screenshotPath = resolve(
    `${nameWithMode && `${nameWithMode}-`}actual.png`
  );
  const html = await page.evaluate(el => el.outerHTML, target);
  await target.screenshot({ path: screenshotPath });
  snapshot(normalizeHashes(html), { name: nameWithMode, ext: ".html" });
}

function normalizeHashes(html) {
  return html
    .replace(/(\.|\/)[a-f0-9]{8}\./gi, "$1HASH.")
    .replace(/_[0-9a-z]{4}\./gi, "_HASH.");
}
