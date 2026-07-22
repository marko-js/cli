<h1 align="center">
  <!-- Logo -->
  <br/>
  @marko/create
	<br/>

  <!-- Stability -->
  <a href="https://nodejs.org/api/documentation.html#documentation_stability_index">
    <img src="https://img.shields.io/badge/stability-stable-green.svg" alt="API Stability"/>
  </a>
  <!-- NPM Version -->
  <a href="https://npmjs.org/package/@marko/create">
    <img src="https://img.shields.io/npm/v/@marko/create.svg" alt="NPM Version"/>
  </a>
  <!-- Downloads -->
  <a href="https://npmjs.org/package/@marko/create">
    <img src="https://img.shields.io/npm/dm/@marko/create.svg" alt="Downloads"/>
  </a>
</h1>

Scaffold a new Marko project into a directory. This is the library and
`marko-create` bin behind [`create-marko`](../create-alias) (`npm create marko`).

# CLI

```bash
npm create marko
# or run this package directly
npx @marko/create my-app --template basic
```

## Options

- `--name`, `-n`: Name of the new app (also accepted as the first positional argument).
- `--template`, `-t`: The name of an example from [marko-js/examples](https://github.com/marko-js/examples/tree/master/examples), or a `user/repo` git template.
  - An example name, optionally at a branch/tag/commit:
    ```bash
    basic
    basic#next     # example branch
    user/repo      # a git template
    user/repo#v1.2.3
    ```
- `--dir`, `-d`: Directory to set the project up in (defaults to the current directory).
- `--installer`, `-i`: Override the package manager used to install dependencies. Defaults to the one used to run the command, falling back to `npm`.
- `--yes`, `-y`: Skip the interactive prompts and accept the defaults.

The prompts only run in an interactive terminal. Under CI, AI agents, or a piped
stdin the defaults are used (or, when required input is missing and defaults
aren't allowed, the command exits non-zero with guidance) instead of hanging.

This package is a CLI only; it does not expose a programmatic API.
