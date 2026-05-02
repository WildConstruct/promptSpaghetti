# Brownfield Architecture Map

_Last updated: 2026-04-12_

This document maps the active Prompt Spaghetti runtime as it exists today.

It is intentionally narrower than the full repo. The goal is to show where the
real product path lives, what owns each seam, and which surfaces are support
only or quarantined.

## Canonical Product Path

```text
client/src/main.tsx
  -> client/src/App.tsx
  -> LaunchScreen
  -> Epic1EditorContainer-refactored
  -> @promptscape/core Epic1GraphEditor
  -> Preview / PSG save-export / asset side panel
  -> server/src/index.ts
  -> files + llm + psg + agent routes
```

## Source-Of-Truth Owners

### Frontend shell

- `client/src/main.tsx`
  Bootstraps the client and initializes shared browser concerns like Sentry and
  Supabase session handling.
- `client/src/App.tsx`
  Chooses between the launch screen and the editor shell.
- `client/src/components/LaunchScreen/LaunchScreen.tsx`
  Owns prompt bootstrap, quick-start template launch, tutorial launch, and the
  first-run framing of the product.

### Editor shell and graph canvas

- `client/src/Epic1Editor/Epic1EditorContainer-refactored.tsx`
  Owns the product shell around the graph editor: runtime mode, file actions,
  recovery, export dialogs, and launch handoff.
- `packages/core/components/epic1/Epic1GraphEditor.tsx`
  Owns the active graph canvas, graph interactions, preview handoff, and the
  editor-side integration points that the shell renders.
- `packages/core/components/epic1/TabbedSidePanel.tsx`
  Owns the integrated asset, preview, component, search, and relationship tabs.

### Durable document and assistant contracts

- `packages/core/fileFormats/psg.ts`
  Canonical flat PSG import/export helpers for durable graph state.
- `packages/core/services/psg/*`
  Shared typed contracts for PSG validation, normalization, asset registration,
  crowd expansion, scene assembly, and export.
- `packages/core/public.ts`
  Stable public re-export surface for shared runtime and contract helpers.

### Asset browser integration

- `packages/asset-browser/src/index.tsx`
  Active external package surface consumed by the editor.
- `packages/core/components/epic1/AssetBrowserLoader.tsx`
  Bridge from Epic 1 into `@prompt/asset-browser`.
- `packages/asset-browser/src/services/GraphManifestLoader.ts`
  Manifest-backed graph loading from `/graphs/manifest.json`.

### Backend runtime

- `server/src/index.ts`
  Canonical Fastify runtime entrypoint.
- `server/src/routes/llm.ts`
  LLM status plus authenticated LLM helper endpoints and aliases.
- `server/src/routes/psg.ts`
  Public PSG capabilities plus authenticated PSG mutation/export routes.
- `server/src/routes/agent.ts`
  Authenticated prompt-to-graph draft route.
- `server/src/routes/files.ts`
  Authenticated file storage surface.

### Deployment truth

- `docs/deployment-current-state.md`
  Current Netlify frontend plus Vercel backend split.
- `docs/server-route-access-policy.md`
  Intended route exposure and auth model during MVP hardening.

## Dependency Reality

### Active runtime dependencies

- `client`
  Active app shell and product UX.
- `server`
  Canonical backend runtime.
- `packages/core`
  Shared editor, runtime, PSG, and protocol contracts.
- `packages/asset-browser`
  Integrated browser/package for presets, library views, and manifest loading.

### Support-only or adjacent packages

- `packages/custom-node-sdk`
  Depends on core and may matter later, but it is not part of the MVP launch
  path.
- `packages/cli`
  Historical/support CLI surface, not part of the current app story.
- `python-executor`
  Adjacent infra/research surface, not wired into the current MVP runtime path.

## Active vs Quarantined Boundaries

### Active

- launch screen
- prompt bootstrap
- Epic 1 editor shell
- Epic 1 graph canvas
- PSG import/export helpers
- integrated asset side panel
- Fastify runtime in `server/src/index.ts`

### Support-only

- SDK and CLI packages
- broad test/performance infrastructure
- repo-trim and recovery docs that guide work but are not runtime

### Quarantined

- alternate server mains under `server/src/*minimal*`, `index-cleaned.ts`, and similar files
- exploratory editor variants like `Epic1GraphEditorRefactored.tsx` and `Epic1GraphEditorFinal.tsx`
- deployment compatibility surface under `api/` while Vercel still points there
- backup, original, cleaned, and archived paths

## Practical Reading

- Product changes should start at the launch screen, editor shell, or canonical
  graph canvas, not at historical alternates.
- Durable state changes should start from PSG contracts, not ad hoc graph
  wrapper shapes.
- Backend work should treat `server/src/index.ts` as canonical, even while the
  deployment model still carries legacy `api/` compatibility.
- Repo cleanup should quarantine and document first, then delete only after the
  active runtime is stable and validated.
