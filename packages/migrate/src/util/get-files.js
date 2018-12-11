import { promisify } from "util";
import _glob from "glob";
const glob = promisify(_glob);

export default async function getFiles(patterns, globOptions) {
  return (await Promise.all(
    patterns.map(pattern => {
      if (pattern === ".") {
        pattern = "**/*";
      } else if (pattern[pattern.length - 1] === "/") {
        pattern += "**/*";
      }

      return glob(pattern, globOptions);
    })
  )).reduce((a, b) => a.concat(b));
}
