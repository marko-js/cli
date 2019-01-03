export default function addComponentMigration(
  ctx,
  { fileNames, dependentPaths }
) {
  ctx.addMigration({
    name: "updateFilePath",
    apply(_, { from, to }) {
      fileNames[from] = to;
    }
  });

  ctx.addMigration({
    name: "updateDependentPaths",
    apply(_, { from, to }) {
      dependentPaths[from] = to;
    }
  });
}
