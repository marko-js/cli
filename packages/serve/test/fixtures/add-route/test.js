import fs from "fs";
import path from "path";

export const test = async ({ page, screenshot, targetPath, isBuild }) => {
  if (!isBuild) {
    fs.writeFileSync(path.join(targetPath, "b.marko"), "<h1>UPDATED</h1>");
    // page should automatically reload on change, let's wait
    await new Promise(resolve => page.once("load", resolve));
    await screenshot("after");
  }
};
