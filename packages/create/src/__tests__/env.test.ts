import { afterEach, describe, expect, it, vi } from "vitest";

import { detectInstaller, githubToken } from "../env.js";

afterEach(() => vi.unstubAllEnvs());

describe("detectInstaller", () => {
  it("reads the package manager from npm_config_user_agent", () => {
    vi.stubEnv("npm_config_user_agent", "pnpm/9.0.0 npm/? node/v22 linux x64");
    expect(detectInstaller()).toBe("pnpm");
  });

  it("falls back to npm", () => {
    vi.stubEnv("npm_config_user_agent", "");
    expect(detectInstaller()).toBe("npm");
  });
});

describe("githubToken", () => {
  it("prefers GITHUB_TOKEN, then GH_TOKEN", () => {
    vi.stubEnv("GH_TOKEN", "gh");
    vi.stubEnv("GITHUB_TOKEN", "primary");
    expect(githubToken()).toBe("primary");

    vi.stubEnv("GITHUB_TOKEN", "");
    expect(githubToken()).toBe("gh");
  });
});
