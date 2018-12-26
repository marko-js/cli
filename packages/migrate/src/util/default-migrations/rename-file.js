export default function addComponentMigration(ctx, _, movedFiles) {
  ctx.addMigration({
    name: "renameFile",
    async apply(_, { from, to }) {
      movedFiles[from] = to;
    }
  });
}
