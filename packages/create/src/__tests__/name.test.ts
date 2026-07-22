import { describe, expect, it } from "vitest";

import { isValidProjectName, toPackageName } from "../name.js";

describe("toPackageName", () => {
  it("lowercases and dashes spaces", () => {
    expect(toPackageName("My App")).toBe("my-app");
  });

  it("keeps an already-valid name", () => {
    expect(toPackageName("basic")).toBe("basic");
  });

  it("strips leading dots and underscores", () => {
    expect(toPackageName("._foo")).toBe("foo");
  });

  it("falls back to 'app' when nothing usable remains", () => {
    expect(toPackageName("!!!")).toBe("app");
  });
});

describe("isValidProjectName", () => {
  it("accepts a simple name", () => {
    expect(isValidProjectName("my-app")).toBe(true);
  });

  it("rejects empty and slashed names", () => {
    expect(isValidProjectName("   ")).toBe(false);
    expect(isValidProjectName("a/b")).toBe(false);
    expect(isValidProjectName("a\\b")).toBe(false);
  });
});
