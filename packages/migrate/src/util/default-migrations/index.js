import renameFile from "./rename-file";
import componentFile from "./component-file";
export default function addFileMigrations(ctx, migratedFiles) {
  renameFile(ctx, migratedFiles);
  componentFile(ctx, migratedFiles);
}
