# Findings and Fix Plan — Vite alias, core public entrypoint, client import cleanup, boot progress

Date: 2025-08-14
Owner: Cascade

## Findings

- **Client Vite alias is configured correctly**
  - `client/vite.config.ts` `resolve.alias`:
    - Bare `@promptscape/core` -> `../packages/core/public.ts` (line ~56).
    - Deep `@promptscape/core/*` -> `../packages/core/*` (line ~58).
  - `client/tsconfig.json` `compilerOptions.paths` mirrors the above (lines 21–23).

- **Broken re-exports in `packages/core/index.ts`**
  - File re-exports a non-existent module: `export * from './components/Inspector';` (line ~29). No `Inspector` exists in `packages/core/components`.
  - This causes Vite unresolved import errors whenever the root of the core package is imported (e.g., `import ... from '../../packages/core'`).

- **Incorrect client import and syntax errors in `client/src/core.tsx`**
  - Imports `ProfessionalIntegration` from `../../packages/core` (root index), pulling in the broken re-exports.
  - File contains syntax errors (malformed component props/destructuring around the `ProfessionalGraphEditor` definition), blocking builds.

- **Client imports of PromptAnalysis types use raw relative paths**
  - `client/src/App.tsx`, `client/src/components/LaunchScreen/LaunchScreen.tsx`, and `client/src/components/LaunchScreen/NodePreview.tsx` import `PromptAnalysis` from `../../../../packages/core/runtime/nodes/epic1/PromptParser`.
  - These should be updated to use the alias: `@promptscape/core/runtime/nodes/epic1/PromptParser` for stability.

- **Dynamic import of Epic1 editor already uses the alias**
  - `client/src/epic1-loader.ts` dynamically imports `@promptscape/core/components/epic1/Epic1GraphEditor` and selects `Epic1GraphEditorWithProvider`.

- **Boot progress UI exists and appears wired**
  - `client/src/components/LaunchScreen/LaunchScreen.tsx` uses `useBootProgress()` to gate the Launch button but requires verification at runtime.

- **Vite onwarn typing could be safer**
  - `client/vite.config.ts` `onwarn(warning, warn)` suppresses unresolved import warnings for `@prompt/asset-browser`. We can add type guards to avoid suppressing unrelated warnings.

## Root Causes

- **Unstable/broken core root exports**: `packages/core/index.ts` re-exports missing modules, causing 500s when the package root is imported.
- **Bypassing public entrypoint**: direct imports to `../../packages/core` in client sidestep the alias/public surface and hit `index.ts` instead of `public.ts`.
- **Blocking syntax error**: `client/src/core.tsx` is malformed and referenced in tests/comments, potentially affecting TS program startup even if not imported at runtime.

## Fix Plan

1. **Stop importing the core root anywhere in the client**
   - Replace any `../../packages/core` or bare `@promptscape/core` imports in client code with:
     - Bare `@promptscape/core` only when consuming the stable public API from `public.ts`.
     - Deep alias `@promptscape/core/...` for runtime internals (e.g., `PromptParser` types) when necessary.

2. **Update type imports to use alias**
   - `client/src/App.tsx` — change:
     - `import type { PromptAnalysis } from '../../packages/core/runtime/nodes/epic1/PromptParser';`
     - to `import type { PromptAnalysis } from '@promptscape/core/runtime/nodes/epic1/PromptParser';`
   - Same change in:
     - `client/src/components/LaunchScreen/LaunchScreen.tsx`
     - `client/src/components/LaunchScreen/NodePreview.tsx`
     - `client/src/components/LaunchScreen/PromptDissector.tsx`

3. **Neutralize or remove `client/src/core.tsx`**
   - Option A: Delete if unused. Option B: Replace with a minimal, valid module or re-export from the Epic1 editor dynamic loader.
   - Rationale: fixes the syntax error and prevents pulling `packages/core/index.ts`.

4. **Harden Vite onwarn** (optional but recommended)
   - Add a narrow type guard for suppressing `UNRESOLVED_IMPORT` only when `warning.source === '@prompt/asset-browser'`.

5. **Optionally trim core root exports**
   - Remove `export * from './components/Inspector';` in `packages/core/index.ts` to avoid accidental root imports causing failures during local dev.
   - This is less critical if all client imports go through `public.ts`.

6. **Verify boot progress gating**
   - Run dev server with cache cleared (`pnpm -C client dev --force`).
   - Confirm determinate progress updates and that the Launch button is disabled until complete.

## Current State Snapshot (files/lines)

- `client/vite.config.ts` alias lines 55–59 — OK
- `client/tsconfig.json` paths lines 21–23 — OK
- `packages/core/index.ts` lines 29–40 — re-exports include missing `./components/Inspector` — Needs action or avoidance
- `packages/core/public.ts` — stable exports (Epic1 editor components exported)
- `client/src/core.tsx` — syntax errors + bad import — Needs action
- `client/src/App.tsx` — imports `PromptAnalysis` via raw relative path — Needs update
- `client/src/components/LaunchScreen/LaunchScreen.tsx` — same as above — Needs update
- `client/src/components/LaunchScreen/NodePreview.tsx` — same as above — Needs update
- `client/src/components/LaunchScreen/PromptDissector.tsx` — same as above — Needs update

## Test/Verification Checklist

- **Dev server**: no 500s; dynamic imports succeed; console clean.
- **Type-check**: no TS errors in client.
- **LaunchScreen**: progress bar increments and Launch is gated; keyboard shortcut Cmd/Ctrl+Enter launches when analysis exists.
- **Epic1 editor**: loads via dynamic import, respects initial analysis passed from LaunchScreen.

## Notes

- Per prior work, `packages/core/package.json` points main/module/types to `public.*`, and `packages/core/tsconfig.json` compiles only the stable surface. The client must respect this and avoid raw root imports.
