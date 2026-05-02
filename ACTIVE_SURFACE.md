# Active Surface

_Last updated: 2026-04-13_

This file defines the supported product surface for Prompt Spaghetti.

If a change does not clearly affect one of the areas below, treat it as
support-only or non-core until proven otherwise.

## Supported Product Surface

- `client/`
  - active application shell from `client/src/main.tsx` and `client/src/App.tsx`
  - launch screen and prompt bootstrap in `client/src/components/LaunchScreen/*`
  - active editor shell in `client/src/Epic1Editor/Epic1EditorContainer-refactored.tsx`
  - local document UX, Supabase dialogs, and MVP export dialogs
- `server/`
  - canonical Fastify server runtime in `server/src/index.ts`
  - mounted file, LLM, PSG, bounded agent, and local sandbox image routes from `server/src/routes/*`
  - server-owned route surface contract in `server/src/routeSurfaceCatalog.ts`
  - execution-facing preview and health endpoints
- `packages/core/`
  - canonical Epic 1 graph editor in `packages/core/components/epic1/Epic1GraphEditor.tsx`
  - tabbed side-panel integration, preview logic, and graph editing primitives
  - PSG codec and flat PSG file contract in `packages/core/fileFormats/psg.ts`
  - shared runtime, assistant, and API contracts re-exported from `packages/core/public.ts`
- `packages/asset-browser/`
  - active integrated asset browser package consumed by the editor side panel
  - manifest-backed library and graph loading via `src/services/GraphManifestLoader.ts`
- root workspace/build config
  - `package.json`
  - `pnpm-workspace.yaml`
  - `turbo.json`
  - root and package `tsconfig*`

## Canonical Product Path

- launch in `client/src/App.tsx`
- prompt/template bootstrap from `client/src/components/LaunchScreen/LaunchScreen.tsx`
- editor shell in `client/src/Epic1Editor/Epic1EditorContainer-refactored.tsx`
- graph canvas/editor in `packages/core/components/epic1/Epic1GraphEditor.tsx`
- preview and PSG export from the editor surface
- canonical API runtime in `server/src/index.ts`
- bounded backend routes in `server/src/routes/llm.ts`, `psg.ts`, `agent.ts`, and `files.ts`
- small public runtime surface: `/health`, `/api/healthz`, `/preview`, `/api/llm/status`, `/api/psg/capabilities`
- authenticated cloud helper surface for LLM, PSG, agent draft, and files
- optional local-only sandbox generation surface for `/api/local-image/*`

## Source Of Truth Owners

- frontend entry and app shell:
  `client/src/main.tsx` and `client/src/App.tsx`
- launch and prompt bootstrap:
  `client/src/components/LaunchScreen/*`
- editor shell and document actions:
  `client/src/Epic1Editor/Epic1EditorContainer-refactored.tsx`
- editor surface policy, menu framing, and side-panel definitions:
  `client/src/Epic1Editor/editorSurfacePolicy.ts`
- graph canvas, side panel, and node primitives:
  `packages/core/components/epic1/*`
- canonical server runtime:
  `server/src/index.ts`
- server route surface contract:
  `server/src/routeSurfaceCatalog.ts`
- server route exposure policy:
  `docs/server-route-access-policy.md`
- PSG durable document contract:
  `packages/core/fileFormats/psg.ts` and `packages/core/services/psg/*`
- deployment truth:
  `docs/deployment-current-state.md`

## Support-Only, Non-MVP Surface

These remain in the repo but are not part of the supported launch wedge unless
explicitly pulled into scope.

- `packages/custom-node-sdk/`
  - publishable SDK surface that depends on core, but is not part of the MVP app flow
- `packages/cli/`
  - support tooling and historical CLI surface, not part of the active launch path
- `python-executor/`
  - adjacent execution research/infrastructure, not part of the current MVP story
- broad root `tests/`, `performance-baselines/`, and QA report files
  - useful for recovery and later stabilization, but not canonical product surface

## PSG Rule

`PSG` is the source of truth for durable product state.

That means supported document features should:

- load PSG
- save PSG
- derive editor state from PSG
- generate assistant changes against PSG-aware graph structures

## Quarantined By Default

These areas are not part of the supported product surface unless explicitly
reactivated:

- `legacy/`
- `.archive/`
- `docs/_archive/`
- `docs/archive/`
- `docs/obsidian-vault/`
- `temp-build/`
- `api/`
  - keep as a deployment compatibility surface only while Vercel still points at legacy serverless handlers
- alternate or exploratory editor/runtime implementations such as:
  - `packages/core/components/epic1/Epic1GraphEditorRefactored.tsx`
  - `packages/core/components/epic1/Epic1GraphEditorFinal.tsx`
  - `server/src/index-cleaned.ts`
  - `server/src/server-minimal.ts`
  - `server/src/minimal-*`
- backup or alternate-path files such as:
  - `*.bak`
  - `*-backup.*`
  - `*-original.*`
  - `*-cleaned.*`
  - `*-minimal.*`

## Generated / Disposable Artifacts

These should not drive architectural decisions and should be cleaned or ignored
when safe:

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
5. Keep source-of-truth docs aligned to the active runtime before trimming repo surface.
