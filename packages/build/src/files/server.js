import http from "http";
import path from "path";
import connectGzipStatic from "connect-gzip-static";

const getRoute = global.GET_ROUTE;
const browserEnvs = global.BROWSER_ENVS;
const PORT = process.env.PORT || global.PORT;
const assetsMatch = /^\/assets\//;
let gzipStatic;

if (process.env.NODE_ENV === "production") {
  gzipStatic = connectGzipStatic(
    // eslint-disable-next-line
    path.join(__non_webpack_require__.main.filename, "..", "assets"),
    {
      maxAge: 60 * 60 * 24 * 365 * 1000 // 1 year in ms
    }
  );
}

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
            $global: {
              buildName: `Browser-${req.browserEnv}`
            },
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

http
  .createServer((req, res) => {
    if (assetsMatch.test(req.url)) {
      if (gzipStatic) {
        req.url = req.url.slice(7);
        gzipStatic(req, res, notFound);
      } else {
        notFound();
      }
    } else {
      const userAgent = req.headers["user-agent"] || "";
      req.browserEnv = browserEnvs.find(
        ({ test }) => !test || test.test(userAgent)
      ).env;
      middleware(req, res, notFound);
    }

    function notFound() {
      res.end("Not Found");
    }
  })
  .listen(PORT);
