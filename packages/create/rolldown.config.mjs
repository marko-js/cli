import { defineConfig } from "rolldown";

export default defineConfig({
  platform: "node",
  input: "src/bin.ts",
  // Externalize everything that isn't a relative import (node builtins + deps).
  external: [/^[^./]/],
  output: {
    file: "dist/bin.mjs",
    format: "esm",
    minify: "dce-only",
    sourcemap: false,
  },
});
