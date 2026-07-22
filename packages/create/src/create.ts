import { EventEmitter } from "node:events";
import {
  access,
  mkdtemp,
  readdir,
  readFile,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import { downloadTemplate } from "giget";

import { detectInstaller } from "./env.js";
import { exec, type ExecError } from "./exec.js";
import { initGitRepo } from "./git.js";

export const DEFAULT_TEMPLATE = "basic";
const EXAMPLES_REPO = "marko-js/examples";
const EXAMPLES_DIR = "examples";

export interface CreateOptions {
  /** Directory to create the app in. Defaults to `process.cwd()`. */
  dir?: string;
  /** Name of the new app (also used as the target folder). */
  name: string;
  /** An example from `marko-js/examples`, or a `user/repo` git template. */
  template?: string;
  /** Package manager used to install dependencies. */
  installer?: string;
}

export interface CreateResult {
  projectPath: string;
  installer: string;
  installed: boolean;
  scripts: Record<string, string>;
}

export interface Example {
  name: string;
  hint: string;
  isDefault: boolean;
}

/** An {@link EventEmitter} that is also awaitable for the {@link CreateResult}. */
export type CreateProject = EventEmitter & PromiseLike<CreateResult>;

/**
 * Scaffold a new Marko project. Returns an event emitter that is also a promise;
 * listen for `download`, `install`, `install-error`, and `init` events to track
 * progress, and `await` it for the result.
 */
export function createProject(options: CreateOptions): CreateProject {
  const emitter = new EventEmitter() as CreateProject;
  const promise = create(options, emitter);
  emitter.then = promise.then.bind(promise);
  return emitter;
}

async function create(
  options: CreateOptions,
  emitter: EventEmitter,
): Promise<CreateResult> {
  const {
    dir = process.cwd(),
    name,
    template = DEFAULT_TEMPLATE,
    installer = detectInstaller(),
  } = options;
  const projectPath = resolve(dir, name);

  await assertValidTarget(dir, projectPath, name);

  emitter.emit("download");
  await downloadRepo(template, projectPath);

  const { scripts } = await rewritePackageJson(projectPath, name);

  emitter.emit("install", installer);
  const { installed, log } = await install(installer, projectPath);
  if (!installed) emitter.emit("install-error", installer, log);

  await initGitRepo(projectPath, emitter);

  return { projectPath, installer, installed, scripts };
}

/** List the available examples in `marko-js/examples`. */
export async function getExamples(): Promise<Example[]> {
  const cwd = await mkdtemp(join(tmpdir(), "marko-create-"));
  const ref = await resolveDefaultBranch(EXAMPLES_REPO);
  const { dir } = await downloadTemplate(
    `github:${EXAMPLES_REPO}/${EXAMPLES_DIR}#${ref}`,
    { dir: join(cwd, EXAMPLES_DIR), force: true },
  );
  const entries = await readdir(dir, { withFileTypes: true });

  return Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map(async ({ name }) => ({
        name,
        isDefault: name === DEFAULT_TEMPLATE,
        hint: await readDescription(join(dir, name)),
      })),
  );
}

interface ParsedTemplate {
  /** The giget input, minus the ref. */
  input: string;
  /** `owner/repo` the template lives in. */
  repo: string;
  /** An explicit branch/tag/commit, if one was given. */
  ref?: string;
}

/** Map a template reference to a giget input + source repo. */
function parseTemplate(template: string): ParsedTemplate {
  const [source, ref] = template.split("#");

  if (source.includes("/")) {
    // A `user/repo` (optionally `user/repo/subdir`) git template.
    const [owner, repo, ...subdir] = source.split("/");
    const path = subdir.length ? `/${subdir.join("/")}` : "";
    return {
      input: `github:${owner}/${repo}${path}`,
      repo: `${owner}/${repo}`,
      ref,
    };
  }

  // A named example from `marko-js/examples`.
  return {
    input: `github:${EXAMPLES_REPO}/${EXAMPLES_DIR}/${source}`,
    repo: EXAMPLES_REPO,
    ref,
  };
}

async function downloadRepo(
  template: string,
  projectPath: string,
): Promise<void> {
  const { input, repo, ref } = parseTemplate(template);

  try {
    // giget defaults an unspecified ref to `main`; resolve the repo's actual
    // default branch so templates on `master` (or anything else) still work.
    const resolvedRef = ref ?? (await resolveDefaultBranch(repo));
    await downloadTemplate(`${input}#${resolvedRef}`, { dir: projectPath });
  } catch (cause) {
    throw new Error(`Could not download the "${template}" template.`, {
      cause,
    });
  }
}

/** Look up a GitHub repo's default branch. */
async function resolveDefaultBranch(repo: string): Promise<string> {
  const response = await fetch(`https://api.github.com/repos/${repo}`, {
    headers: { "user-agent": "create-marko" },
  });

  if (!response.ok) {
    throw new Error(
      `GitHub repository "${repo}" not found (${response.status}).`,
    );
  }

  const { default_branch } = (await response.json()) as {
    default_branch: string;
  };
  return default_branch;
}

async function rewritePackageJson(
  projectPath: string,
  name: string,
): Promise<{ scripts: Record<string, string> }> {
  const packagePath = join(projectPath, "package.json");
  const pkg = JSON.parse(await readFile(packagePath, "utf8"));

  pkg.name = name;
  pkg.version = "1.0.0";
  pkg.private = true;

  await writeFile(packagePath, `${JSON.stringify(pkg, null, 2)}\n`);

  return { scripts: pkg.scripts ?? {} };
}

async function install(
  installer: string,
  cwd: string,
): Promise<{ installed: boolean; log?: string }> {
  const run = () =>
    exec(cwd, installer, ["install"], { shell: true, capture: true });

  try {
    await run();
    return { installed: true };
  } catch (error) {
    // pnpm exits non-zero when it blocks a dependency's build scripts. The
    // vite-based templates rely on esbuild's, so approve just esbuild — pnpm
    // writes nothing and no-ops if esbuild wasn't actually installed — then
    // re-install to confirm that was the only problem. Any other package
    // manager (or a genuine pnpm failure) is a real error.
    if (installer === "pnpm") {
      try {
        await exec(cwd, installer, ["approve-builds", "esbuild"], {
          shell: true,
          capture: true,
        });
        await run();
        return { installed: true };
      } catch {
        // Fall through and report the original install failure.
      }
    }

    return { installed: false, log: (error as ExecError).output };
  }
}

async function assertValidTarget(
  dir: string,
  projectPath: string,
  name: string,
): Promise<void> {
  if (/[\\/]/.test(name)) {
    throw new Error(`Invalid app name: ${name}`);
  }

  if (!(await exists(dir))) {
    throw new Error(`Invalid directory specified '${dir}'`);
  }

  if (await exists(projectPath)) {
    throw new Error(`Project path already exists '${projectPath}'`);
  }
}

async function readDescription(dir: string): Promise<string> {
  try {
    const pkg = JSON.parse(await readFile(join(dir, "package.json"), "utf8"));
    return pkg.description ?? "";
  } catch {
    return "";
  }
}

const exists = (path: string): Promise<boolean> =>
  access(path).then(
    () => true,
    () => false,
  );
