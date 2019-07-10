import fs from "fs";

export const test = async ({ page, screenshot, targetPath, isBuild }) => {
  if (!isBuild) {
    fs.writeFileSync(targetPath, "<h1>UPDATED</h1>");
    // page should automatically reload on change, let's wait
    await new Promise(resolve => page.once("load", resolve));
    await screenshot("after");
  }
};
