# Contributing Guide

Thanks for helping improve this project! This guide covers the development workflow and repository conventions.

## Workflow

- Use conventional commits (e.g., `feat: ...`, `fix: ...`, `chore: ...`).
- For substantial changes, open an issue first to discuss scope.
- Keep PRs focused and add tests when applicable.

## Active Checks

- Pre-commit runs TypeScript and ESLint only on active code paths via `tsconfig.active.json` and scoped lint config.
- CI uses:
  - `.github/workflows/active-checks.yml` for push/PR (TypeScript, ESLint, Prettier on active paths)
  - `.github/workflows/legacy-scan.yml` for scheduled full-repo scans (warn-only)

## Repository Conventions

- `packages/` — active development workspaces
- `sandboxes/` — ad‑hoc demos, debug scripts, manual test harnesses; not part of CI/builds. See `sandboxes/README.md`.
- `scripts/maintenance/` — helper scripts for local maintenance, diagnostics, refactors (`fix-*.js`, `analyze-*.js`, etc.). Not used by CI/builds.
- `scripts/build/` — historical build scripts (e.g., `netlify-build-*.sh`). Prefer `package.json` scripts and CI workflows.
- `legacy/` — reserved for deprecated code to be moved in a later cleanup. Active builds exclude legacy paths.

## Local Dev

```bash
pnpm install
pnpm dev
```

## Quality

```bash
pnpm typecheck
pnpm lint
pnpm format
pnpm test
```

## Opening PRs

- Ensure Prettier/lint pass.
- Describe testing done and any risk areas.
- Link related issues and docs.

## Legacy Quarantine Plan

See `docs/qa/legacy-quarantine-plan.md` and use the "Legacy code quarantine and directory cleanup" issue template when initiating a move.
