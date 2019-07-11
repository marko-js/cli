require("source-map-support").install({ hookRequire: true });

const http = require("http");
const gzipStatic =
  process.env.NODE_ENV === "production" &&
  require("connect-gzip-static")(global.ASSETS_PATH);
const getRoute = global.GET_ROUTE;
const modernBrowsers = global.MODERN_BROWSERS_REGEXP;
const PORT = process.env.PORT || global.PORT;
const assetsMatch = /^\/assets\//;

const middleware =
  global.MARKO_MIDDLEWARE ||
  ((req, res) => {
    res.setHeader("content-type", "text/html");
    const [pathname, query] = req.url.split("?");
    const route = getRoute(pathname);
    if (route) {
      if (route.redirect) {
        res.statusCode = 301;
        res.setHeader("location", route.path);
        res.end(
          `Redirecting to <a href=${JSON.stringify(route.path)}>${
            route.path
          }</a>`
        );
      } else {
        route.template.render(
          {
            $global: { isModern: req.isModern },
            params: route.params,
            query,
            pathname
          },
          res
        );
      }
    } else {
      res.statusCode = 404;
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
    req.isModern = modernBrowsers.test(req.headers["user-agent"] || "");
    middleware(req, res, () => {
      res.end("Not Found");
    });
  }
});

server.listen(PORT);
