import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    include: ["packages/*/src/**/__tests__/*.test.ts"],
    coverage: {
      include: ["packages/*/src/**/*.ts"],
      reporter: ["text-summary", "lcov"],
    },
  },
});
