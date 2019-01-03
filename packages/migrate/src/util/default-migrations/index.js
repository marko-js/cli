import updatePaths from "./update-paths";
import componentFile from "./component-file";
export default function addFileMigrations(ctx, result) {
  updatePaths(ctx, result);
  componentFile(ctx, result);
}
