---
"@marko/create": minor
"create-marko": minor
---

CLI improvements: validate the project name and derive a valid npm package name from it (e.g. `My App` → `my-app`); add `--no-install` and `--no-git`; hide the legacy `*-marko-5` examples from the interactive list (still usable via `--template`); authenticate GitHub requests with `GITHUB_TOKEN`/`GH_TOKEN` when set (higher rate limits and private templates), with clearer rate-limit errors; use plain step output instead of an animated spinner under CI/agents/piped output; and fail clearly on a missing template (and surface the underlying cause) instead of scaffolding an empty project.
