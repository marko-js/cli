/** Whether a project name is usable as a target folder. */
export function isValidProjectName(name: string): boolean {
  return name.trim().length > 0 && !/[\\/]/.test(name);
}

/**
 * Derive a valid npm package name from a project name — lowercased, spaces and
 * unsupported characters replaced with `-`. Falls back to `app` if nothing
 * usable remains.
 */
export function toPackageName(name: string): string {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/^[._]+/, "")
      .replace(/[^a-z\d\-~]+/g, "-")
      .replace(/^-+|-+$/g, "") || "app"
  );
}
