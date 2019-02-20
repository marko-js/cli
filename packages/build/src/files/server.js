require("source-map-support").install({ hookRequire: true });

const http = require("http");
const writeInitComponentsCode = require("marko/components")
  .writeInitComponentsCode;
const serveHandler = require("serve-handler");
const wrapper = require("./wrapper.marko");
const template = require(global.TEMPLATE_PATH);
const assets = global.BUILD_ASSETS.main;
const PORT = process.env.PORT || global.PORT;
const assetsMatch = /^\/assets\//;
const serveOptions = {
  directoryListing: false,
  public: global.ASSETS_PATH
};

const scriptTag =
  assets.js && `<script async src=${JSON.stringify(assets.js)}></script>`;
const cssLinkTag =
  assets.css && `<link rel="stylesheet" href=${JSON.stringify(assets.css)}>`;

const renderAssets =
  assets &&
  ((out, fromFlush) => {
    if (fromFlush === true) {
      writeInitComponentsCode(out, out, false);
    }
    if (!out.global.assetsRendered) {
      const writer = fromFlush === true ? out.writer._wrapped : out;
      if (scriptTag) writer.write(scriptTag);
      if (cssLinkTag) writer.write(cssLinkTag);
      out.global.assetsRendered = true;
    }
  });

const server = http.createServer((req, res) => {
  if (assetsMatch.test(req.url)) {
    req.url = req.url.slice(7);
    return serveHandler(req, res, serveOptions);
  }
  res.setHeader("content-type", "text/html");
  wrapper.render({ template, renderAssets }, res);
});

server.listen(PORT);
