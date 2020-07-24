import path from "path";

const getRoute = global.GET_ROUTE;
const browserEnvs = global.BROWSER_ENVS;

export const assets =
  process.env.NODE_ENV === "production" &&
  require("connect-gzip-static")(path.join(__dirname, "assets"), {
    maxAge: 31536000
  });

export const routes =
  global.MARKO_MIDDLEWARE ||
  ((req, res, notFound) => {
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
        const userAgent = req.headers["user-agent"] || "";
        route.template.render(
          {
            $global: {
              buildName: `Browser-${
                browserEnvs.find(({ test }) => !test || test.test(userAgent))
                  .env
              }`
            },
            params: route.params,
            query,
            pathname
          },
          res
        );
      }
    } else {
      notFound();
    }
  });
