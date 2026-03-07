# Active Surface

_Last updated: 2026-03-06_

This file defines the supported product surface for Prompt Spaghetti.

If a change does not clearly affect one of the areas below, treat it as non-core until proven otherwise.

## Supported Product Surface

- `client/`
  - active application shell
  - launch screen
  - editor container
  - local document UX
- `server/`
  - active Fastify server
  - file and bounded AI routes
  - execution-facing APIs
- `packages/core/`
  - PSG codec and file formats
  - runtime and preview logic
  - Epic 1 editor primitives
  - shared assistant contracts
- `packages/asset-browser/`
  - active asset browser UI and manifest loading
- root workspace/build config
  - `package.json`
  - `pnpm-workspace.yaml`
  - `turbo.json`
  - root and package `tsconfig*`

## PSG Rule

`PSG` is the source of truth for durable product state.

That means supported document features should:

- load PSG
- save PSG
- derive editor state from PSG
- generate assistant changes against PSG-aware graph structures

## Quarantined By Default

These areas are not part of the supported product surface unless explicitly reactivated:

- `legacy/`
- `.archive/`
- `docs/_archive/`
- `docs/archive/`
- `docs/obsidian-vault/`
- `temp-build/`
- backup or alternate-path files such as:
  - `*.bak`
  - `*-backup.*`
  - `*-original.*`
  - `*-cleaned.*`
  - `*-minimal.*`

## Generated / Disposable Artifacts

These should not drive architectural decisions and should be cleaned or ignored when safe:

- `.turbo/`
- `playwright-report/`
- `test-results/`
- package `dist/` outputs
- transient debug files such as `.tmp-*`

## Current Recovery Priorities

1. Keep one supported build and typecheck path green.
2. Make local document flow PSG-first.
3. Remove visible no-op or stub-only product actions.
4. Narrow AI to graph-aware workflows rather than generic completion endpoints.
