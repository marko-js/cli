import http from "http";
import { assets, routes } from "./middleware";

const assetsMatch = /^\/assets\//;

http
  .createServer((req, res) => {
    if (assetsMatch.test(req.url)) {
      req.url = req.url.slice(7);
      assets(req, res, notFound);
    } else {
      routes(req, res, notFound);
    }
    function notFound() {
      res.end("Not Found");
    }
  })
  .listen(
    process.env.PORT || (process.env.NODE_ENV === "production" ? 3000 : 0)
  );
