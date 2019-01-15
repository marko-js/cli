import migrateWidget from "@marko/migrate-v3-widget";

export default function addComponentMigration(ctx, { onWriteFile }) {
  ctx.addMigration({
    name: "componentFile",
    description: "Migrating widget file with defineComponent",
    async apply(_, { componentFile, templateFile }) {
      await onWriteFile(
        componentFile,
        await migrateWidget(componentFile, {
          templateFile,
          onContext(hub) {
            hub.addMigration = ctx.addMigration;
          }
        })
      );
    }
  });
}
