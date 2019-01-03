const path = require("path");

module.exports = (root, context) => {
  context.addMigration({
    apply(helper) {
      return helper.run("updateFilePath", {
        from: context.filename,
        to: path.join(context.dirname, "index.marko")
      });
    }
  });
};
