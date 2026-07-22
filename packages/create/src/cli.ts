import { relative } from "node:path";
import { parseArgs } from "node:util";

import * as p from "@clack/prompts";
import color from "picocolors";

import { createProject, DEFAULT_TEMPLATE, getExamples } from "./create.js";
import { isAgent, isCI } from "./env.js";
import { version } from "./pkg.js";

export interface CliOptions {
  name?: string;
  template?: string;
  dir?: string;
  installer?: string;
  yes?: boolean;
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
      help: { type: "boolean", short: "h" },
      version: { type: "boolean", short: "v" },
    },
  });

  return { ...values, name: values.name ?? positionals[0] };
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
    });
    if (p.isCancel(answer)) return cancelled();
    name = answer || "my-app";
  }

  if (!template) {
    template = await promptTemplate();
    if (template === undefined) return cancelled();
  }

  const spin = p.spinner();
  let spinning = false;

  const result = createProject({ ...options, name, template });
  result.on("download", () => {
    spin.start("Downloading app");
    spinning = true;
  });
  result.on("install", (installer: string) => {
    if (spinning) {
      spin.stop("Downloaded app");
      spinning = false;
    }
    p.log.step(`Installing dependencies with ${color.cyan(installer)}`);
  });
  result.on("install-error", (installer: string) =>
    p.log.warn(
      `${color.cyan(`${installer} install`)} did not finish cleanly. Your ` +
        "project was still created — you may need to install dependencies manually.",
    ),
  );
  result.on("init", () => p.log.step("Initializing git repository"));

  try {
    const { projectPath, installer, installed, scripts } = await result;
    if (spinning) spin.stop("Downloaded app");

    const steps = [
      `cd ${relative(process.cwd(), projectPath) || "."}`,
      ...(installed ? [] : [`${installer} install`]),
      scripts.dev ? "npm run dev" : scripts.start ? "npm start" : "",
    ].filter(Boolean);

    p.outro(
      `Project created! Next steps:\n${steps
        .map((step) => color.cyan(`  ${step}`))
        .join("\n")}`,
    );
  } catch (err) {
    if (spinning) spin.stop("Failed to create project", 1);
    p.cancel((err as Error).message);
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
  const examples = await getExamples();
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
