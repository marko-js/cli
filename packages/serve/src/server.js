const fs = require("fs");
const path = require("path");
const http = require("http");
const writeInitComponentsCode = require("marko/components")
  .writeInitComponentsCode;
// eslint-disable-next-line no-undef
const template = require(__TEMPLATE_ENTRY__);
const wrapper = require("./wrapper.marko");
const PORT = 0;
let assets;

http
  .createServer((req, res) => {
    if (!assets) {
      assets = JSON.parse(
        fs.readFileSync(
          path.join(__dirname, "./build/public/assets.json"),
          "utf-8"
        )
      ).main;
    }
    res.setHeader("content-type", "text/html");
    wrapper.render(
      {
        template,
        $global: {
          renderAssets:
            assets &&
            (out => {
              writeInitComponentsCode(out, out, false);
              if (!out.global.assetsRendered) {
                if (assets.js) {
                  out.w(
                    `<script async src=${JSON.stringify(assets.js)}></script>`
                  );
                }
                if (assets.css) {
                  out.w(
                    `<link rel="stylesheet" href=${JSON.stringify(assets.css)}>`
                  );
                }
                out.global.assetsRendered = true;
              }
            })
        }
      },
      res
    );
  })
  .listen(PORT);
