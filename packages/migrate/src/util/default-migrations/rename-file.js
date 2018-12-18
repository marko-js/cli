export default function addComponentMigration(ctx, migratedFiles) {
  ctx.addMigration({
    name: "renameFile",
    async apply(helper, { from, to }) {
      Object.defineProperty(migratedFiles, from, {
        enumerable: true,
        get() {
          return null;
        },
        set(source) {
          migratedFiles[to] = source;
        }
      });
    }
  });
}
