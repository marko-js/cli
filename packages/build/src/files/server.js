require("source-map-support").install({ hookRequire: true });

const http = require("http");
const gzipStatic =
  process.env.NODE_ENV === "production" &&
  require("connect-gzip-static")(global.ASSETS_PATH);
const getRoute = global.GET_ROUTE;
const PORT = process.env.PORT || global.PORT;
const assetsMatch = /^\/assets\//;

const server = http.createServer((req, res) => {
  if (assetsMatch.test(req.url)) {
    req.url = req.url.slice(7);
    return gzipStatic(req, res, () => {
      res.end("Not Found");
    });
  }
  res.setHeader("content-type", "text/html");
  const route = getRoute(req.url);
  if (route) {
    route.template.render(route.params, res);
  } else {
    res.end("Not Found");
  }
});

server.listen(PORT);
