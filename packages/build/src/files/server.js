import http from "http";
import { assets, routes } from "./middleware";

const PORT = process.env.PORT || global.PORT;
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
  .listen(PORT);
