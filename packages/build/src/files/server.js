import http from "http";
import { assets, routes } from "./middleware";

const PORT = process.env.PORT || global.PORT;
const browserEnvs = global.BROWSER_ENVS;
const assetsMatch = /^\/assets\//;

http
  .createServer((req, res) => {
    if (assetsMatch.test(req.url)) {
      req.url = req.url.slice(7);
      assets(req, res, notFound);
    } else {
      const userAgent = req.headers["user-agent"] || "";
      req.browserEnv = browserEnvs.find(
        ({ test }) => !test || test.test(userAgent)
      ).env;
      routes(req, res, notFound);
    }
    function notFound() {
      res.end("Not Found");
    }
  })
  .listen(PORT);
