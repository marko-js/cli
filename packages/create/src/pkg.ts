import { readFileSync } from "node:fs";

// Resolved relative to the emitted module so it works from both `src` (tests)
// and `dist` (published), without a build-time JSON import.
export const { version } = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
) as { version: string };
