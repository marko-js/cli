import { describe, expect, it } from "vitest";

import { parse } from "../cli.js";

describe("parse", () => {
  it("parses long flags", () => {
    const options = parse(["--name", "example", "--template", "app"]);
    expect(options.name).toBe("example");
    expect(options.template).toBe("app");
  });

  it("parses short flags", () => {
    const options = parse(["-n", "example", "-t", "app"]);
    expect(options.name).toBe("example");
    expect(options.template).toBe("app");
  });

  it("accepts the name as a positional argument", () => {
    const options = parse(["example", "-t", "app"]);
    expect(options.name).toBe("example");
  });

  it("prefers an explicit --name over the positional", () => {
    const options = parse(["positional", "--name", "explicit"]);
    expect(options.name).toBe("explicit");
  });

  it("parses the --yes flag", () => {
    const options = parse(["-n", "example", "-y"]);
    expect(options.yes).toBe(true);
  });

  it("parses --no-install and --no-git as opt-outs", () => {
    const options = parse(["-n", "example", "--no-install", "--no-git"]);
    expect(options.install).toBe(false);
    expect(options.git).toBe(false);
  });

  it("leaves install/git undefined by default", () => {
    const options = parse(["-n", "example"]);
    expect(options.install).toBeUndefined();
    expect(options.git).toBeUndefined();
  });
});
