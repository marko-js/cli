require("source-map-support").install({ hookRequire: true });

const http = require("http");
const gzipStatic =
  process.env.NODE_ENV === "production" &&
  require("connect-gzip-static")(global.ASSETS_PATH);
const { matchesUA } = require("browserslist-useragent");
const getRoute = global.GET_ROUTE;
const PORT = process.env.PORT || global.PORT;
const assetsMatch = /^\/assets\//;
const userAgentConfig = { browsers: global.MODERN_BROWSERS };

const middleware =
  global.MARKO_MIDDLEWARE ||
  ((req, res) => {
    res.setHeader("content-type", "text/html");
    const route = getRoute(req.url);
    if (route) {
      route.template.render(
        { $global: { isModern: req.isModern }, ...route.params },
        res
      );
    } else {
      res.end("Not Found");
    }
  });

const server = http.createServer((req, res) => {
  if (assetsMatch.test(req.url)) {
    req.url = req.url.slice(7);
    gzipStatic(req, res, () => {
      res.end("Not Found");
    });
  } else {
    const isModern = matchesUA(
      req.headers["user-agent"] || "",
      userAgentConfig
    );
    req.isModern = isModern;
    middleware(req, res, () => {
      res.end("Not Found");
    });
  }
});

server.listen(PORT);
