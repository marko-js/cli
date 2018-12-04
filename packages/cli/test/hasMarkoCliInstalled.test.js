import assert from "assert";
import hasMarkoCliInstalled from "../src/util/hasMarkoCliInstalled";

describe("scope(cli)", () => {
  describe("hasMarkoCliInstalled", () => {
    it("hasMarkoCliInstalled: project.json with marko-cli as dev dependency", () => {
      assert.equal(
        hasMarkoCliInstalled({
          devDependencies: {
            "marko-cli": "^1.0.0"
          }
        }),
        true
      );
    });
  
    it("hasMarkoCliInstalled: project.json with marko-cli as prod dependency", () => {
      assert.equal(
        hasMarkoCliInstalled({
          dependencies: {
            "marko-cli": "^1.0.0"
          }
        }),
        true
      );
    });
  
    it("hasMarkoCliInstalled: project.json without marko-cli", () => {
      assert.equal(
        hasMarkoCliInstalled({
          dependencies: {}
        }),
        false
      );
    });
  
    it("hasMarkoCliInstalled: empty project.json without marko-cli", () => {
      assert.equal(hasMarkoCliInstalled({}), false);
    });
  });
});