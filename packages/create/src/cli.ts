import { relative } from "node:path";
import { parseArgs } from "node:util";

import * as p from "@clack/prompts";
import color from "picocolors";

import { createProject, DEFAULT_TEMPLATE, getExamples } from "./create.js";
import { isAgent, isCI } from "./env.js";
import { isValidProjectName } from "./name.js";
import { version } from "./pkg.js";

export interface CliOptions {
  name?: string;
  template?: string;
  dir?: string;
  installer?: string;
  yes?: boolean;
  install?: boolean;
  git?: boolean;
  help?: boolean;
  version?: boolean;
}

const USAGE = `${color.bold("create-marko")} — scaffold a new Marko app

${color.bold("Usage:")} create-marko ${color.green("[name]")} ${color.dim("[options]")}

${color.bold("Options:")}
  -n, --name       Name of the new app (also the first positional argument)
  -t, --template   An example from marko-js/examples, or a user/repo git template
  -d, --dir        Directory to create the app in (default: current directory)
  -i, --installer  Package manager to install with (default: detected)
  -y, --yes        Skip prompts and accept defaults (implied under CI and agents)
      --no-install Skip installing dependencies
      --no-git     Skip initializing a git repository
  -v, --version    Print the version
  -h, --help       Show this help message`;

export function parse(argv: string[]): CliOptions {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      name: { type: "string", short: "n" },
      template: { type: "string", short: "t" },
      dir: { type: "string", short: "d" },
      installer: { type: "string", short: "i" },
      yes: { type: "boolean", short: "y" },
      "no-install": { type: "boolean" },
      "no-git": { type: "boolean" },
      help: { type: "boolean", short: "h" },
      version: { type: "boolean", short: "v" },
    },
  });

  return {
    name: values.name ?? positionals[0],
    template: values.template,
    dir: values.dir,
    installer: values.installer,
    yes: values.yes,
    install: values["no-install"] ? false : undefined,
    git: values["no-git"] ? false : undefined,
    help: values.help,
    version: values.version,
  };
}

export async function run(options: CliOptions): Promise<void> {
  if (options.version) {
    console.log(`v${version}`);
    return;
  }

  if (options.help) {
    console.log(USAGE);
    return;
  }

  // No human to answer prompts: `--yes`, CI, an AI agent, or a piped stdin.
  const acceptDefaults = Boolean(options.yes) || isAgent() || isCI();
  const canPrompt = Boolean(process.stdin.isTTY) && !acceptDefaults;

  let { name, template } = options;

  p.intro(color.cyan(`create-marko v${version}`));

  if ((!name || !template) && !canPrompt) {
    if (!acceptDefaults) {
      p.cancel(
        "An interactive terminal is required to choose a project name and template.\n" +
          "Pass --name and --template, or --yes to accept the defaults.",
      );
      process.exitCode = 1;
      return;
    }

    name ??= "my-app";
    template ??= DEFAULT_TEMPLATE;
  }

  if (!name) {
    const answer = await p.text({
      message: "What is your project named?",
      placeholder: "my-app",
      defaultValue: "my-app",
      validate: (value) => {
        if (value && !isValidProjectName(value)) {
          return "Name can't contain slashes.";
        }
      },
    });
    if (p.isCancel(answer)) return cancelled();
    name = answer.trim() || "my-app";
  }

  if (!template) {
    template = await promptTemplate();
    if (template === undefined) return cancelled();
  }

  // Skip the animated spinner when nothing is watching a terminal (agents/CI/
  // piped output) — it would otherwise spam frames into captured logs.
  const plain = !process.stdout.isTTY || isAgent() || isCI();
  const spin = plain ? undefined : p.spinner();
  spin?.start("Setting up project");
  const step = (message: string) =>
    spin ? spin.message(message) : p.log.step(message);

  let installFailed = false;
  let installLog = "";

  const result = createProject({ ...options, name, template });
  result.on("download", () => step("Downloading app"));
  result.on("install", (installer: string) =>
    step(`Installing dependencies with ${installer}`),
  );
  result.on("install-error", (_installer: string, log?: string) => {
    installFailed = true;
    installLog = log ?? "";
  });
  result.on("init", () => step("Setting up git repository"));

  try {
    const { projectPath, installer, installed, scripts } = await result;
    if (spin) spin.stop("Project created");
    else p.log.success("Project created");

    if (installFailed) {
      p.log.warn(
        `${color.cyan(`${installer} install`)} did not finish cleanly — you ` +
          "may need to run it yourself.",
      );
      if (installLog.trim()) p.log.message(installLog.trim());
    }

    // `<pm> run <script>` is valid for npm/pnpm/yarn/bun alike.
    const script = scripts.dev ? "dev" : scripts.start ? "start" : undefined;
    const dir = relative(process.cwd(), projectPath) || ".";
    const steps = [
      `cd ${/\s/.test(dir) ? `"${dir}"` : dir}`,
      ...(installed ? [] : [`${installer} install`]),
      ...(script ? [`${installer} run ${script}`] : []),
    ];

    p.outro(
      `Next steps:\n${steps.map((step) => color.cyan(`  ${step}`)).join("\n")}`,
    );
  } catch (err) {
    if (spin) spin.stop("Failed to create project", 1);
    else p.log.error("Failed to create project");

    const error = err as Error & { cause?: unknown };
    const detail =
      error.cause instanceof Error ? `\n${error.cause.message}` : "";
    p.cancel(error.message + detail);
    process.exitCode = 1;
  }
}

export async function cli(
  argv: string[] = process.argv.slice(2),
): Promise<void> {
  await run(parse(argv));
}

async function promptTemplate(): Promise<string | undefined> {
  const choice = await p.select({
    message: "Which template would you like to use?",
    options: [
      { value: DEFAULT_TEMPLATE, label: "Default starter app" },
      { value: "\0example", label: "Example from marko-js/examples" },
    ],
    initialValue: DEFAULT_TEMPLATE,
  });
  if (p.isCancel(choice)) return undefined;
  if (choice !== "\0example") return choice;

  const spin = p.spinner();
  spin.start("Loading examples");
  // Hide the legacy Marko 5 examples from the browse list; they can still be
  // used explicitly via `--template <name>-marko-5`.
  const examples = (await getExamples()).filter(
    ({ name }) => !name.endsWith("-marko-5"),
  );
  spin.stop("Loaded examples");

  const example = await p.select({
    message: "Which example would you like to use?",
    initialValue: DEFAULT_TEMPLATE,
    options: examples.map(({ name, hint }) => ({
      value: name,
      label: name,
      hint: hint || undefined,
    })),
  });
  if (p.isCancel(example)) return undefined;
  return example;
}

function cancelled(): void {
  p.cancel("Operation cancelled.");
  process.exitCode = 1;
}
