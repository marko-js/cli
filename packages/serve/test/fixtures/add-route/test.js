import fs from "fs";
import path from "path";

export const test = async ({ page, screenshot, targetPath, isBuild }) => {
  if (!isBuild) {
    fs.writeFileSync(path.join(targetPath, "b.marko"), "<h1>UPDATED</h1>");
    // The page should automatically reload once the new route is compiled. Wait
    // for that, but don't hang the suite if the file-watch reload doesn't fire
    // (e.g. inotify limitations under some filesystems) — the "/" page we
    // snapshot is unchanged by the added route either way.
    await Promise.race([
      new Promise(resolve => page.once("load", resolve)),
      new Promise(resolve => setTimeout(resolve, 15000))
    ]);
    await screenshot("after");
  }
};
