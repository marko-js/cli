// Environment variables set by common CI systems and AI coding agents. When one
// of these is present there is no human to answer interactive prompts.
const AGENT_ENV = ["CLAUDECODE", "CURSOR_TRACE_ID", "AI_AGENT", "AGENT"];

export const isAgent = (): boolean =>
  AGENT_ENV.some((name) => Boolean(process.env[name]));

export const isCI = (): boolean => Boolean(process.env.CI);

/** A GitHub token from the environment, if one is set. */
export const githubToken = (): string | undefined =>
  process.env.GITHUB_TOKEN || process.env.GH_TOKEN || undefined;

/**
 * Detect the package manager used to invoke the command (via
 * `npm_config_user_agent`), falling back to `npm`.
 */
export const detectInstaller = (): string => {
  const userAgent = process.env.npm_config_user_agent;

  if (userAgent) {
    const name = userAgent.slice(0, userAgent.indexOf("/"));
    if (name) return name;
  }

  return "npm";
};
