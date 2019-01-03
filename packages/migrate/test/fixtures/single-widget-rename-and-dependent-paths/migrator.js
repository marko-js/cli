const path = require("path");

module.exports = (root, context) => {
  const widgetFile = path.join(context.dirname, "index.js");
  const newWidgetFile = path.join(context.dirname, "component.js");
  context.addMigration({
    apply(helper) {
      return helper.run("updateDependentPaths", {
        from: widgetFile,
        to: newWidgetFile
      });
    }
  });
};
