export default function addComponentMigration(
  ctx,
  { onRenameFile, onUpdateDependents }
) {
  ctx.addMigration({
    name: "updateFilePath",
    async apply(_, { from, to }) {
      await onRenameFile(from, to);
    }
  });

  ctx.addMigration({
    name: "updateDependentPaths",
    async apply(_, { from, to }) {
      await onUpdateDependents(from, to);
    }
  });
}
