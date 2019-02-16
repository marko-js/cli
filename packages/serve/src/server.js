const PORT = global.PORT || process.env.PORT || 3000;

const http = require("http");
const writeInitComponentsCode = require("marko/components")
  .writeInitComponentsCode;
const wrapper = require("./wrapper.marko");
const template = require(global.TEMPLATE_PATH);
const assets = global.BUILD_ASSETS.main;

const renderAssets =
  assets &&
  (out => {
    writeInitComponentsCode(out, out, false);
    if (!out.global.assetsRendered) {
      if (assets.js) {
        out.w(`<script async src=${JSON.stringify(assets.js)}></script>`);
      }
      if (assets.css) {
        out.w(`<link rel="stylesheet" href=${JSON.stringify(assets.css)}>`);
      }
      out.global.assetsRendered = true;
    }
  });

const server = http.createServer((req, res) => {
  res.setHeader("content-type", "text/html");
  wrapper.render({ template, renderAssets }, res);
});

server.listen(PORT);
