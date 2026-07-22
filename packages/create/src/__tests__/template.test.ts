import { describe, expect, it } from "vitest";

import { parseTemplate } from "../create.js";

describe("parseTemplate", () => {
  it("maps a named example to marko-js/examples", () => {
    expect(parseTemplate("basic")).toEqual({
      input: "github:marko-js/examples/examples/basic",
      repo: "marko-js/examples",
      ref: undefined,
    });
  });

  it("carries a ref on a named example", () => {
    expect(parseTemplate("basic#next")).toMatchObject({
      input: "github:marko-js/examples/examples/basic",
      ref: "next",
    });
  });

  it("maps a user/repo git template", () => {
    expect(parseTemplate("user/repo")).toEqual({
      input: "github:user/repo",
      repo: "user/repo",
      ref: undefined,
    });
  });

  it("supports a subdirectory and ref", () => {
    expect(parseTemplate("user/repo/packages/app#v1")).toMatchObject({
      input: "github:user/repo/packages/app",
      repo: "user/repo",
      ref: "v1",
    });
  });
});
