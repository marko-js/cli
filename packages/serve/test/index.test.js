import fs from "fs";
import path from "path";
import autotest from "mocha-autotest";
import puppeteer from "puppeteer";
import pixelmatch from "pixelmatch";
import cluster from "cluster";
import { copy, remove } from "fs-extra";
import { PNG } from "pngjs";
import { run } from "../src/cli";
import build from "../../build/src/index";

const updateExpectations = process.env.hasOwnProperty("UPDATE_EXPECTATIONS");

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
        build({ output: outputPath, ...options }).run(err =>
          err ? reject(err) : resolve()
        );
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
  return async ({ resolve, test, snapshot, mode }) => {
    test(async () => {
      let browser, closeServer, backupPath, targetPath;
      try {
        const mainPath = resolve("test.js");
        const hasMainFile = fs.existsSync(mainPath);
        const targetFilePath = resolve("target.marko");
        const hasTargetFile = fs.existsSync(targetFilePath);
        const targetDirPath = resolve("target");
        const hasTargetDir = fs.existsSync(targetDirPath);

        let options = { port: 8378 };
        let main;

        if (hasMainFile) {
          main = require(mainPath);
          options = Object.assign(options, main.options);
        }

        if (hasTargetDir) {
          options.dir = targetPath = targetDirPath;
        }

        if (hasTargetFile) {
          options.file = targetPath = targetFilePath;
        }

        closeServer = await createServer(options, { resolve });
        browser = await puppeteer.launch();
        const page = await browser.newPage();
        const screenshot = screenshotUtility.bind(null, page, resolve);
        await page.goto(
          `http://localhost:${options.port}${(main && main.path) || "/"}`
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

async function screenshotUtility(page, resolve, name, element) {
  const target = element || page;
  const actualPath = resolve(`${name ? `${name}-` : ""}actual.png`);
  const expectedPath = resolve(`${name ? `${name}-` : ""}expected.png`);
  const diffPath = resolve(`${name ? `${name}-` : ""}diff.png`);
  await target.screenshot({ path: actualPath, fullPage: target === page });
  if (!fs.existsSync(expectedPath) || updateExpectations) {
    fs.copyFileSync(actualPath, expectedPath);
  } else {
    const actual = PNG.sync.read(fs.readFileSync(actualPath));
    const expected = PNG.sync.read(fs.readFileSync(expectedPath));
    const { width, height } = actual;
    const diff = new PNG({ width, height });

    pixelmatch(actual.data, expected.data, diff.data, width, height, {
      threshold: 0.1,
      diffColor: [255, 0, 0]
    });

    fs.writeFileSync(diffPath, PNG.sync.write(diff));

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (width * y + x) << 2;
        const red = diff.data[idx + 0];
        const green = diff.data[idx + 1];
        const blue = diff.data[idx + 2];
        const alpha = diff.data[idx + 3];
        if (red === 255 && green === 0 && blue === 0 && alpha === 255) {
          throw new Error(
            `ScreenshotMismatch: ${path.relative(process.cwd(), diffPath)}`
          );
        }
      }
    }
  }
}
