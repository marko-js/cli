import renameFile from "./rename-file";
import componentFile from "./component-file";
export default function addFileMigrations(ctx, migratedFiles, renamedFiles) {
  renameFile(ctx, migratedFiles, renamedFiles);
  componentFile(ctx, migratedFiles);
}
