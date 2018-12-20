import migrateWidget from "@marko/migrate-v3-widget";

export default function addComponentMigration(ctx, updatedFiles) {
  ctx.addMigration({
    name: "componentFile",
    description: "Migrating widget file with defineComponent",
    async apply(helper, { filename }) {
      updatedFiles[filename] = await migrateWidget(filename, {
        onContext(hub) {
          hub.addMigration = ctx.addMigration;
        }
      });
    }
  });
}
