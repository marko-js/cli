<h1 align="center">
  <a href="https://markojs.com/"><img alt="Marko" src="https://raw.githubusercontent.com/marko-js/website/refs/heads/main/public/assets/logo.svg" width="250"></a>
</h1>

<p align="center">
  <!-- Format -->
  <a href="https://github.com/prettier/prettier">
    <img src="https://img.shields.io/badge/styled_with-prettier-ff69b4.svg" alt="Styled with prettier"/>
  </a>
  <!-- License -->
  <a href="./LICENSE">
    <img src="https://img.shields.io/github/license/marko-js/cli.svg" alt="MIT"/>
  </a>
  <!-- CI -->
  <a href="https://github.com/marko-js/cli/actions/workflows/ci.yml">
    <img src="https://github.com/marko-js/cli/actions/workflows/ci.yml/badge.svg" alt="Build status"/>
  </a>
  <!-- NPM Version -->
  <a href="https://npmjs.org/package/create-marko">
    <img src="https://img.shields.io/npm/v/create-marko.svg" alt="NPM Version"/>
  </a>
</p>

Scaffold a new [Marko](https://markojs.com) application from the default starter
or any [example](https://github.com/marko-js/examples/tree/master/examples/)
project.

## Usage

```console
npm create marko
# or
pnpm create marko
# or
yarn create marko
```

You'll be prompted for a project name and template. To skip the prompts, pass
them as flags:

```console
pnpm create marko -- --name my-app --template basic
```

| Option              | Description                                                                 |
| ------------------- | --------------------------------------------------------------------------- |
| `--name`, `-n`      | Name of the new app (also accepted as the first positional argument).       |
| `--template`, `-t`  | An example from `marko-js/examples`, or a `user/repo` git template.         |
| `--dir`, `-d`       | Directory to create the app in (defaults to the current directory).         |
| `--installer`, `-i` | Package manager used to install dependencies (defaults to the one you ran). |
| `--yes`, `-y`       | Skip prompts and accept defaults.                                           |

### CI & AI agents

The prompts only run in an interactive terminal. When there's no human to answer
them — `--yes` is passed, `CI` is set, an AI agent is detected
(`CLAUDECODE`/`CURSOR_TRACE_ID`/`AI_AGENT`/`AGENT`), or stdin isn't a TTY — the
defaults are used (name `my-app`, the starter template) instead of hanging. If
defaults aren't allowed and required input is missing, the command exits
non-zero with guidance rather than blocking.

## Packages

| Package                                   | Description                                              |
| ----------------------------------------- | -------------------------------------------------------- |
| [`create-marko`](./packages/create-alias) | The `npm create marko` / `pnpm create marko` entrypoint. |
| [`@marko/create`](./packages/create)      | The scaffolder implementation and `marko-create` bin.    |

> Looking for the old `serve`, `build`, `migrate`, `prettyprint`, or `test`
> commands? They live on the
> [`legacy`](https://github.com/marko-js/cli/tree/legacy) branch.

## Contributing

This repo is a [pnpm](https://pnpm.io) workspace written in TypeScript.

- `pnpm build` — build the packages (`tsc` + `rolldown`)
- `pnpm test` — run the tests ([vitest](https://vitest.dev))
- `pnpm lint` — lint and check formatting
- `pnpm format` — auto-fix lint and formatting
- `pnpm change` — add a [changeset](https://github.com/changesets/changesets) for your change

## Code of Conduct

This project adheres to the [eBay Code of Conduct](./.github/CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.
