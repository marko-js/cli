import updatePaths from "./update-paths";
import componentFile from "./component-file";
export default function addFileMigrations(ctx, handlers) {
  updatePaths(ctx, handlers);
  componentFile(ctx, handlers);
}
